from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Prefetch
from django.contrib.auth import get_user_model
from .models import (
    ClassRepRole, Message, Announcement, MessageReaction, 
    MessageReadStatus, Poll, PollVote
)
from .serializers import (
    ClassRepRoleSerializer, MessageSerializer, MessageCreateSerializer,
    AnnouncementSerializer, AnnouncementCreateSerializer,
    MessageReactionSerializer, MessageReadStatusSerializer,
    PollSerializer, PollCreateSerializer, PollVoteSerializer,
    ClassRepPermissionSerializer
)
from school.models import Class

User = get_user_model()


class ClassRepRoleListCreateView(generics.ListCreateAPIView):
    """List and create Class Representative roles"""
    
    queryset = ClassRepRole.objects.select_related('user', 'student_class', 'assigned_by').all()
    serializer_class = ClassRepRoleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter Class Rep roles based on user permissions"""
        user = self.request.user
        
        if user.is_admin:
            return self.queryset
        elif user.is_student:
            # Students can see Class Reps from their class
            return self.queryset.filter(student_class=user.student_class)
        else:
            return ClassRepRole.objects.none()
    
    def perform_create(self, serializer):
        """Only admins can assign Class Rep roles"""
        if not self.request.user.is_admin:
            raise permissions.PermissionDenied("Only administrators can assign Class Representative roles")
        
        serializer.save(assigned_by=self.request.user)


class ClassRepRoleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a Class Representative role"""
    
    queryset = ClassRepRole.objects.select_related('user', 'student_class', 'assigned_by')
    serializer_class = ClassRepRoleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter Class Rep roles based on user permissions"""
        user = self.request.user
        
        if user.is_admin:
            return self.queryset
        elif user.is_student:
            return self.queryset.filter(student_class=user.student_class)
        else:
            return ClassRepRole.objects.none()
    
    def perform_update(self, serializer):
        """Only admins can update Class Rep roles"""
        if not self.request.user.is_admin:
            raise permissions.PermissionDenied("Only administrators can modify Class Representative roles")


class MessageListCreateView(generics.ListCreateAPIView):
    """List and create messages"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get messages for the current user's class"""
        user = self.request.user
        
        if user.is_admin:
            # Admins can see all messages
            return Message.objects.select_related(
                'sender', 'recipient', 'student_class'
            ).prefetch_related('reactions', 'read_status').all()
        elif user.is_student:
            # Students can see messages from their class and private messages
            return Message.objects.select_related(
                'sender', 'recipient', 'student_class'
            ).prefetch_related('reactions', 'read_status').filter(
                Q(student_class=user.student_class) |
                Q(recipient=user) |
                Q(sender=user)
            )
        else:
            return Message.objects.none()
    
    def get_serializer_class(self):
        """Use appropriate serializer based on request method"""
        if self.request.method == 'POST':
            return MessageCreateSerializer
        return MessageSerializer
    
    def perform_create(self, serializer):
        """Create a new message"""
        serializer.save(sender=self.request.user)


class MessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a message"""
    
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get messages the user has access to"""
        user = self.request.user
        
        if user.is_admin:
            return Message.objects.select_related(
                'sender', 'recipient', 'student_class'
            ).prefetch_related('reactions', 'read_status')
        elif user.is_student:
            return Message.objects.select_related(
                'sender', 'recipient', 'student_class'
            ).prefetch_related('reactions', 'read_status').filter(
                Q(student_class=user.student_class) |
                Q(recipient=user) |
                Q(sender=user)
            )
        else:
            return Message.objects.none()
    
    def perform_update(self, serializer):
        """Only message sender can update their message"""
        message = self.get_object()
        if message.sender != self.request.user and not self.request.user.is_admin:
            raise permissions.PermissionDenied("You can only edit your own messages")
        
        serializer.save()
    
    def perform_destroy(self, serializer):
        """Only message sender or admin can delete messages"""
        message = self.get_object()
        if message.sender != self.request.user and not self.request.user.is_admin:
            raise permissions.PermissionDenied("You can only delete your own messages")