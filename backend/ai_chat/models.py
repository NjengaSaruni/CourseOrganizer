"""
Models for AI Chat and Knowledge Graph

This module contains models for:
- Chat conversations and messages
- Knowledge graph concepts
- Concept mastery tracking
- Agent interactions logging
"""

from django.db import models
from django.utils import timezone
from django.conf import settings
from course_api.models import Course
from directory.models import User
from course_content.models import CourseOutline


class ChatConversation(models.Model):
    """A conversation between a user and the AI assistant"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chat_conversations')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True, related_name='chat_conversations')
    title = models.CharField(max_length=200, blank=True, help_text="Auto-generated or user-provided title")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
        verbose_name = 'Chat Conversation'
        verbose_name_plural = 'Chat Conversations'
    
    def __str__(self):
        course_name = f" - {self.course.name}" if self.course else ""
        return f"{self.user.get_full_name() or self.user.username}{course_name}: {self.title or 'Untitled'}"
    
    @property
    def message_count(self):
        return self.messages.count()


class ChatMessage(models.Model):
    """A message in a chat conversation"""
    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
        ('system', 'System'),
    ]
    
    conversation = models.ForeignKey(ChatConversation, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    content = models.TextField()
    metadata = models.JSONField(default=dict, blank=True, help_text="Additional metadata (tool calls, context, etc.)")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
        verbose_name = 'Chat Message'
        verbose_name_plural = 'Chat Messages'
    
    def __str__(self):
        return f"{self.role}: {self.content[:50]}..."


class Concept(models.Model):
    """
    A concept in the knowledge graph.
    Represents a specific topic or concept that can be assessed for mastery.
    """
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True, help_text="Detailed description of the concept")
    keywords = models.JSONField(default=list, blank=True, help_text="Alternative names and keywords for this concept")
    parent_concept = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='child_concepts', help_text="Parent concept in knowledge hierarchy")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Concept'
        verbose_name_plural = 'Concepts'
    
    def __str__(self):
        return self.name


class CourseConcept(models.Model):
    """
    Links concepts to course outlines.
    Extracted concepts from course outlines that should be tracked.
    """
    course_outline = models.ForeignKey(CourseOutline, on_delete=models.CASCADE, related_name='concepts')
    concept = models.ForeignKey(Concept, on_delete=models.CASCADE, related_name='course_references')
    extracted_at = models.DateTimeField(auto_now_add=True)
    extraction_method = models.CharField(
        max_length=50,
        default='manual',
        help_text="Method used to extract this concept (manual, ai_extraction, etc.)"
    )
    
    class Meta:
        unique_together = ['course_outline', 'concept']
        verbose_name = 'Course Concept'
        verbose_name_plural = 'Course Concepts'
    
    def __str__(self):
        return f"{self.course_outline.course.code}: {self.concept.name}"


class ConceptMastery(models.Model):
    """
    Tracks a student's mastery level for a specific concept.
    Mastery is calculated based on questions answered, assessments, etc.
    """
    MASTERY_LEVEL_CHOICES = [
        ('not_started', 'Not Started'),
        ('introduced', 'Introduced'),
        ('developing', 'Developing'),
        ('proficient', 'Proficient'),
        ('mastered', 'Mastered'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='concept_masteries')
    concept = models.ForeignKey(Concept, on_delete=models.CASCADE, related_name='masteries')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True, related_name='concept_masteries', help_text="Course context for this mastery")
    mastery_level = models.CharField(max_length=20, choices=MASTERY_LEVEL_CHOICES, default='not_started')
    mastery_score = models.FloatField(default=0.0, help_text="Numerical mastery score (0.0 to 1.0)")
    last_assessed_at = models.DateTimeField(null=True, blank=True)
    assessment_count = models.IntegerField(default=0, help_text="Number of times this concept has been assessed")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'concept', 'course']
        ordering = ['-mastery_score', '-updated_at']
        verbose_name = 'Concept Mastery'
        verbose_name_plural = 'Concept Masteries'
    
    def __str__(self):
        course_str = f" ({self.course.code})" if self.course else ""
        return f"{self.user.get_full_name() or self.user.username}: {self.concept.name}{course_str} - {self.get_mastery_level_display()}"
    
    def update_mastery(self, score: float, level: str = None):
        """Update mastery score and level"""
        self.mastery_score = max(0.0, min(1.0, score))
        
        if level:
            self.mastery_level = level
        else:
            # Auto-determine level based on score
            if self.mastery_score >= 0.9:
                self.mastery_level = 'mastered'
            elif self.mastery_score >= 0.7:
                self.mastery_level = 'proficient'
            elif self.mastery_score >= 0.5:
                self.mastery_level = 'developing'
            elif self.mastery_score > 0.0:
                self.mastery_level = 'introduced'
            else:
                self.mastery_level = 'not_started'
        
        self.last_assessed_at = timezone.now()
        self.assessment_count += 1
        self.save()


class AgentInteraction(models.Model):
    """
    Logs interactions with the MCP server for analysis and debugging.
    Similar to the reference implementation.
    """
    INTERACTION_TYPES = [
        ('tool_call', 'Tool Call'),
        ('resource_read', 'Resource Read'),
        ('resource_list', 'Resource List'),
        ('prompt', 'Prompt'),
        ('chat_message', 'Chat Message'),
    ]
    
    interaction_type = models.CharField(max_length=20, choices=INTERACTION_TYPES)
    tool_name = models.CharField(max_length=100, blank=True)
    resource_uri = models.CharField(max_length=200, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='agent_interactions')
    conversation = models.ForeignKey(ChatConversation, on_delete=models.SET_NULL, null=True, blank=True, related_name='interactions')
    request_data = models.JSONField(default=dict)
    response_data = models.JSONField(default=dict)
    timestamp = models.DateTimeField(auto_now_add=True)
    success = models.BooleanField(default=True)
    error_message = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Agent Interaction'
        verbose_name_plural = 'Agent Interactions'
    
    def __str__(self):
        return f"{self.interaction_type} - {self.timestamp}"

