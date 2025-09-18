from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.contrib.auth import get_user_model
from .models import (
    ClassRepRole, Message, Announcement, MessageReaction, 
    MessageReadStatus, AnnouncementReadStatus, Poll, PollVote
)
from .serializers import (
    AnnouncementSerializer, AnnouncementCreateSerializer,
    PollSerializer, PollCreateSerializer, PollVoteSerializer,
    MessageReactionSerializer, MessageReadStatusSerializer,
    AnnouncementReadStatusSerializer, ClassRepPermissionSerializer
)

User = get_user_model()


class AnnouncementListCreateView(generics.ListCreateAPIView):
    """List and create announcements"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get announcements for the current user's class"""
        user = self.request.user
        
        if user.is_admin:
            return Announcement.objects.select_related('sender', 'student_class').all()
        elif user.is_student and user.student_class:
            return Announcement.objects.select_related('sender', 'student_class').filter(
                student_class=user.student_class
            )
        else:
            return Announcement.objects.none()
    
    def get_serializer_class(self):
        """Use appropriate serializer based on request method"""
        if self.request.method == 'POST':
            return AnnouncementCreateSerializer
        return AnnouncementSerializer
    
    def perform_create(self, serializer):
        """Create a new announcement"""
        announcement = serializer.save(sender=self.request.user)
        
        # Send email notifications to all students in the class
        self._send_announcement_notifications(announcement)
    
    def _send_announcement_notifications(self, announcement):
        """Send email notifications for new announcement"""
        try:
            from course_api.email_service import send_announcement_notification_email
            from django.contrib.auth import get_user_model
            
            User = get_user_model()
            
            # Get all students in the class
            students = User.objects.filter(
                user_type='student',
                student_class=announcement.student_class,
                is_active=True
            ).exclude(id=announcement.sender.id)  # Don't send to the sender
            
            # Send emails in background (you might want to use Celery for this)
            for student in students:
                try:
                    send_announcement_notification_email(student, announcement)
                except Exception as e:
                    # Log error but continue with other students
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f"Failed to send announcement email to {student.email}: {str(e)}")
                    
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send announcement notifications: {str(e)}")


class AnnouncementDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete an announcement"""
    
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get announcements the user has access to"""
        user = self.request.user
        
        if user.is_admin:
            return Announcement.objects.select_related('sender', 'student_class')
        elif user.is_student:
            return Announcement.objects.select_related('sender', 'student_class').filter(
                student_class=user.student_class
            )
        else:
            return Announcement.objects.none()
    
    def perform_update(self, serializer):
        """Only announcement sender or admin can update announcements"""
        announcement = self.get_object()
        if announcement.sender != self.request.user and not self.request.user.is_admin:
            raise permissions.PermissionDenied("You can only edit your own announcements")
        
        serializer.save()
    
    def perform_destroy(self, serializer):
        """Only announcement sender or admin can delete announcements"""
        announcement = self.get_object()
        if announcement.sender != self.request.user and not self.request.user.is_admin:
            raise permissions.PermissionDenied("You can only delete your own announcements")


class PollListCreateView(generics.ListCreateAPIView):
    """List and create polls"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get polls for the current user's class"""
        user = self.request.user
        
        if user.is_admin:
            return Poll.objects.select_related('creator', 'student_class').prefetch_related('votes')
        elif user.is_student:
            return Poll.objects.select_related('creator', 'student_class').prefetch_related('votes').filter(
                student_class=user.student_class
            )
        else:
            return Poll.objects.none()
    
    def get_serializer_class(self):
        """Use appropriate serializer based on request method"""
        if self.request.method == 'POST':
            return PollCreateSerializer
        return PollSerializer
    
    def perform_create(self, serializer):
        """Create a new poll"""
        serializer.save(creator=self.request.user)


class PollDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a poll"""
    
    serializer_class = PollSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get polls the user has access to"""
        user = self.request.user
        
        if user.is_admin:
            return Poll.objects.select_related('creator', 'student_class').prefetch_related('votes')
        elif user.is_student:
            return Poll.objects.select_related('creator', 'student_class').prefetch_related('votes').filter(
                student_class=user.student_class
            )
        else:
            return Poll.objects.none()


class PollVoteCreateView(generics.CreateAPIView):
    """Create or update a poll vote"""
    
    serializer_class = PollVoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        """Create or update a poll vote"""
        serializer.save(user=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_message_reaction(request, message_id):
    """Add or update a reaction to a message"""
    message = get_object_or_404(Message, id=message_id)
    
    # Check if user has access to this message
    user = request.user
    if not user.is_admin:
        if user.is_student:
            if (message.student_class != user.student_class and 
                message.recipient != user and 
                message.sender != user):
                return Response(
                    {'error': 'You do not have access to this message'},
                    status=status.HTTP_403_FORBIDDEN
                )
        else:
            return Response(
                {'error': 'You do not have access to this message'},
                status=status.HTTP_403_FORBIDDEN
            )
    
    serializer = MessageReactionSerializer(data={
        'message': message.id,
        'user': request.user.id,
        'reaction_type': request.data.get('reaction_type')
    })
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def remove_message_reaction(request, message_id):
    """Remove a reaction from a message"""
    message = get_object_or_404(Message, id=message_id)
    reaction = get_object_or_404(MessageReaction, message=message, user=request.user)
    
    reaction.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_message_as_read(request, message_id):
    """Mark a message as read by the current user"""
    message = get_object_or_404(Message, id=message_id)
    
    # Check if user has access to this message
    user = request.user
    if not user.is_admin:
        if user.is_student:
            if (message.student_class != user.student_class and 
                message.recipient != user and 
                message.sender != user):
                return Response(
                    {'error': 'You do not have access to this message'},
                    status=status.HTTP_403_FORBIDDEN
                )
        else:
            return Response(
                {'error': 'You do not have access to this message'},
                status=status.HTTP_403_FORBIDDEN
            )
    
    # Create or update read status
    read_status, created = MessageReadStatus.objects.update_or_create(
        message=message,
        user=user
    )
    
    serializer = MessageReadStatusSerializer(read_status)
    return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_announcement_as_read(request, announcement_id):
    """Mark an announcement as read by the current user"""
    announcement = get_object_or_404(Announcement, id=announcement_id)
    
    # Check if user has access to this announcement
    user = request.user
    if not user.is_admin:
        if user.is_student:
            if announcement.student_class != user.student_class:
                return Response(
                    {'error': 'You do not have access to this announcement'},
                    status=status.HTTP_403_FORBIDDEN
                )
        else:
            return Response(
                {'error': 'You do not have access to this announcement'},
                status=status.HTTP_403_FORBIDDEN
            )
    
    # Create or update read status
    read_status, created = AnnouncementReadStatus.objects.get_or_create(
        announcement=announcement,
        user=user
    )
    
    serializer = AnnouncementReadStatusSerializer(read_status)
    return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_unread_announcements_count(request):
    """Get count of unread announcements for the current user"""
    user = request.user
    
    if user.is_admin:
        # Admins can see all announcements
        total_announcements = Announcement.objects.count()
        read_announcements = AnnouncementReadStatus.objects.filter(user=user).count()
    elif user.is_student and user.student_class:
        # Students can only see announcements for their class
        total_announcements = Announcement.objects.filter(student_class=user.student_class).count()
        read_announcements = AnnouncementReadStatus.objects.filter(
            user=user,
            announcement__student_class=user.student_class
        ).count()
    else:
        total_announcements = 0
        read_announcements = 0
    
    unread_count = total_announcements - read_announcements
    
    return Response({
        'unread_count': unread_count,
        'total_count': total_announcements,
        'read_count': read_announcements
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def class_rep_permissions(request, user_id):
    """Get Class Rep permissions for a specific user"""
    user = get_object_or_404(User, id=user_id)
    
    if not request.user.is_admin:
        return Response(
            {'error': 'Only administrators can view Class Rep permissions'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        class_rep = ClassRepRole.objects.get(user=user, is_active=True)
        from .serializers import ClassRepRoleSerializer
        serializer = ClassRepRoleSerializer(class_rep)
        return Response(serializer.data)
    except ClassRepRole.DoesNotExist:
        return Response(
            {'error': 'User is not a Class Representative'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_class_rep_permissions(request, user_id):
    """Update Class Rep permissions for a specific user"""
    user = get_object_or_404(User, id=user_id)
    
    if not request.user.is_admin:
        return Response(
            {'error': 'Only administrators can update Class Rep permissions'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        class_rep = ClassRepRole.objects.get(user=user, is_active=True)
        serializer = ClassRepPermissionSerializer(data=request.data)
        
        if serializer.is_valid():
            class_rep.permissions = serializer.validated_data['permissions']
            class_rep.save()
            
            from .serializers import ClassRepRoleSerializer
            return Response(ClassRepRoleSerializer(class_rep).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except ClassRepRole.DoesNotExist:
        return Response(
            {'error': 'User is not a Class Representative'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def communication_stats(request):
    """Get communication statistics for the current user"""
    user = request.user
    
    if user.is_admin:
        # Admin stats - all data
        stats = {
            'total_messages': Message.objects.count(),
            'total_announcements': Announcement.objects.count(),
            'total_polls': Poll.objects.count(),
            'active_polls': Poll.objects.filter(status='active').count(),
            'class_reps_count': ClassRepRole.objects.filter(is_active=True).count(),
        }
    elif user.is_student:
        # Student stats - class-specific data
        student_class = user.student_class
        if student_class:
            stats = {
                'class_messages': Message.objects.filter(student_class=student_class).count(),
                'private_messages_sent': Message.objects.filter(sender=user, is_private=True).count(),
                'private_messages_received': Message.objects.filter(recipient=user, is_private=True).count(),
                'announcements': Announcement.objects.filter(student_class=student_class).count(),
                'polls': Poll.objects.filter(student_class=student_class).count(),
                'active_polls': Poll.objects.filter(student_class=student_class, status='active').count(),
                'is_class_rep': ClassRepRole.objects.filter(user=user, is_active=True).exists(),
            }
        else:
            stats = {'error': 'User not assigned to any class'}
    else:
        stats = {'error': 'User type not supported'}
    
    return Response(stats)
