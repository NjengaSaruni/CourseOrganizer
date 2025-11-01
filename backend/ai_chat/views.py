from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import (
    ChatConversation, ChatMessage, Concept, CourseConcept,
    ConceptMastery, AgentInteraction
)
from .serializers import (
    ChatConversationSerializer, ChatMessageSerializer,
    ConceptSerializer, ConceptMasterySerializer,
    CourseMasteryPercentageSerializer
)
from .mcp_tools import MCPTools
import os
import json
try:
    from anthropic import Anthropic
except ImportError:
    Anthropic = None


class ChatConversationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing chat conversations"""
    serializer_class = ChatConversationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return conversations for the current user, optionally filtered by course"""
        queryset = ChatConversation.objects.filter(user=self.request.user)
        course_id = self.request.query_params.get('course')
        if course_id:
            try:
                queryset = queryset.filter(course_id=int(course_id))
            except (ValueError, TypeError):
                pass
        return queryset
    
    def perform_create(self, serializer):
        """Set the user when creating a conversation"""
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['get', 'post'])
    def messages(self, request, pk=None):
        """Get or create messages for a conversation"""
        conversation = self.get_object()
        
        if request.method == 'GET':
            messages = ChatMessage.objects.filter(conversation=conversation)
            serializer = ChatMessageSerializer(messages, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            serializer = ChatMessageSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(conversation=conversation)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def chat(self, request, pk=None):
        """Chat with AI assistant using Claude and MCP tools"""
        if not Anthropic:
            return Response(
                {'error': 'Anthropic SDK not installed. Install with: pip install anthropic'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        conversation = self.get_object()
        message = request.data.get('message', '').strip()
        course_id = request.data.get('course_id')
        
        if not message:
            return Response(
                {'error': 'Message is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if API key is set
        api_key = os.getenv('ANTHROPIC_API_KEY')
        if not api_key or api_key == 'your-anthropic-api-key-here':
            return Response(
                {
                    'error': 'ANTHROPIC_API_KEY not configured',
                    'response': 'I cannot respond because the Anthropic API key is not configured.'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Save user message
        user_message = ChatMessage.objects.create(
            conversation=conversation,
            role='user',
            content=message
        )
        
        # Get conversation history
        previous_messages = ChatMessage.objects.filter(
            conversation=conversation
        ).order_by('created_at')[:20]  # Last 20 messages for context
        
        # Build messages list for Claude
        messages = []
        for msg in previous_messages:
            messages.append({
                "role": msg.role,
                "content": msg.content
            })
        
        # Get available tools
        tool_definitions = MCPTools.get_tool_definitions()
        anthropic_tools = [
            {
                "name": tool["name"],
                "description": tool["description"],
                "input_schema": tool["inputSchema"]
            }
            for tool in tool_definitions
        ]
        
        # Add system context about the course if available
        system_message = "You are a helpful AI assistant for a course management system. "
        if course_id:
            try:
                from course_api.models import Course
                course = Course.objects.get(id=course_id)
                system_message += f"You are helping a student with questions about the course: {course.code} - {course.name}. "
                system_message += f"You have access to course materials, outlines, and can help track concept mastery. "
            except:
                pass
        
        # Create Anthropic client
        anthropic = Anthropic(api_key=api_key)
        
        tool_calls_made = []
        max_iterations = 10
        
        try:
            # Loop to handle tool calls
            for iteration in range(max_iterations):
                response = anthropic.messages.create(
                    model="claude-sonnet-4-20250514",
                    max_tokens=4096,
                    system=system_message,
                    tools=anthropic_tools if anthropic_tools else None,
                    messages=messages
                )
                
                # Check if AI wants to use tools
                if response.stop_reason == "tool_use":
                    # Collect all tool uses
                    tool_uses = [block for block in response.content if block.type == "tool_use"]
                    
                    if tool_uses:
                        # Add assistant's message with tool uses
                        messages.append({
                            "role": "assistant",
                            "content": response.content
                        })
                        
                        # Execute all tools and collect results
                        tool_results = []
                        for tool_use in tool_uses:
                            # Execute the tool
                            tool_result = MCPTools.execute_tool(
                                tool_use.name,
                                tool_use.input
                            )
                            
                            # Track tool call
                            tool_calls_made.append({
                                'tool': tool_use.name,
                                'arguments': tool_use.input,
                                'result': tool_result
                            })
                            
                            # Log interaction
                            AgentInteraction.objects.create(
                                interaction_type='tool_call',
                                tool_name=tool_use.name,
                                user=request.user,
                                conversation=conversation,
                                request_data=tool_use.input,
                                response_data=tool_result,
                                success=tool_result.get('success', False)
                            )
                            
                            # Add tool result
                            tool_results.append({
                                "type": "tool_result",
                                "tool_use_id": tool_use.id,
                                "content": json.dumps(tool_result)
                            })
                        
                        # Add all tool results in one user message
                        messages.append({
                            "role": "user",
                            "content": tool_results
                        })
                    else:
                        break
                else:
                    # Final response
                    break
            
            # Extract text response
            assistant_text = ""
            for content_block in response.content:
                if content_block.type == "text":
                    assistant_text += content_block.text
            
            # Save assistant message
            assistant_message = ChatMessage.objects.create(
                conversation=conversation,
                role='assistant',
                content=assistant_text,
                metadata={'tool_calls': tool_calls_made}
            )
            
            # Log interaction
            AgentInteraction.objects.create(
                interaction_type='chat_message',
                user=request.user,
                conversation=conversation,
                request_data={'message': message, 'course_id': course_id},
                response_data={'response': assistant_text, 'tool_calls': len(tool_calls_made)},
                success=True
            )
            
            return Response({
                'message': ChatMessageSerializer(assistant_message).data,
                'response': assistant_text,
                'tool_calls': tool_calls_made
            })
            
        except Exception as e:
            # Log error
            AgentInteraction.objects.create(
                interaction_type='chat_message',
                user=request.user,
                conversation=conversation,
                request_data={'message': message, 'course_id': course_id},
                response_data={},
                success=False,
                error_message=str(e)
            )
            
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ConceptViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing concepts"""
    serializer_class = ConceptSerializer
    permission_classes = [IsAuthenticated]
    queryset = Concept.objects.all()
    
    def get_queryset(self):
        queryset = Concept.objects.all()
        course_id = self.request.query_params.get('course_id')
        if course_id:
            # Filter by course concepts
            from .models import CourseConcept
            from course_content.models import CourseOutline
            from directory.models import AcademicYear
            
            try:
                academic_year = AcademicYear.get_current_academic_year()
                course = CourseConcept.objects.filter(
                    course_outline__course_id=course_id,
                    course_outline__academic_year=academic_year
                ).values_list('concept_id', flat=True)
                queryset = queryset.filter(id__in=course)
            except:
                pass
        
        return queryset


class ConceptMasteryViewSet(viewsets.ModelViewSet):
    """ViewSet for managing concept mastery"""
    serializer_class = ConceptMasterySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return mastery records for the current user"""
        queryset = ConceptMastery.objects.filter(user=self.request.user)
        
        course_id = self.request.query_params.get('course_id')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        return queryset
    
    def perform_create(self, serializer):
        """Set the user when creating mastery"""
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def calculate_course_mastery(self, request):
        """Calculate overall mastery percentage for a course"""
        serializer = CourseMasteryPercentageSerializer(data=request.data)
        if serializer.is_valid():
            user_id = serializer.validated_data['user_id']
            course_id = serializer.validated_data['course_id']
            
            result = MCPTools.calculate_course_mastery_percentage(user_id, course_id)
            
            if result['success']:
                serializer = CourseMasteryPercentageSerializer({
                    'user_id': user_id,
                    'course_id': course_id,
                    'mastery_percentage': result['mastery_percentage'],
                    'total_concepts': result['total_concepts'],
                    'assessed_concepts': result['assessed_concepts']
                })
                return Response(serializer.data)
            else:
                return Response({'error': result['error']}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

