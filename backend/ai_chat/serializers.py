from rest_framework import serializers
from .models import (
    ChatConversation, ChatMessage, Concept, CourseConcept,
    ConceptMastery, AgentInteraction
)
from course_api.models import Course
from directory.models import User


class ChatConversationSerializer(serializers.ModelSerializer):
    message_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = ChatConversation
        fields = ['id', 'user', 'course', 'title', 'created_at', 'updated_at', 'message_count']
        read_only_fields = ['user', 'created_at', 'updated_at']


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'conversation', 'role', 'content', 'metadata', 'created_at']
        read_only_fields = ['conversation', 'created_at']


class ConceptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Concept
        fields = ['id', 'name', 'description', 'keywords', 'parent_concept', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class CourseConceptSerializer(serializers.ModelSerializer):
    concept = ConceptSerializer(read_only=True)
    
    class Meta:
        model = CourseConcept
        fields = ['id', 'course_outline', 'concept', 'extracted_at', 'extraction_method']
        read_only_fields = ['extracted_at']


class ConceptMasterySerializer(serializers.ModelSerializer):
    concept = ConceptSerializer(read_only=True)
    concept_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = ConceptMastery
        fields = [
            'id', 'user', 'concept', 'concept_id', 'course', 'mastery_level',
            'mastery_score', 'last_assessed_at', 'assessment_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'last_assessed_at', 'assessment_count']


class CourseMasteryPercentageSerializer(serializers.Serializer):
    """Serializer for course mastery percentage calculation"""
    user_id = serializers.IntegerField()
    course_id = serializers.IntegerField()
    mastery_percentage = serializers.FloatField(read_only=True)
    total_concepts = serializers.IntegerField(read_only=True)
    assessed_concepts = serializers.IntegerField(read_only=True)


class AgentInteractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentInteraction
        fields = [
            'id', 'interaction_type', 'tool_name', 'resource_uri',
            'user', 'conversation', 'request_data', 'response_data',
            'timestamp', 'success', 'error_message'
        ]
        read_only_fields = ['timestamp']

