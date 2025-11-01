from django.contrib import admin
from .models import (
    ChatConversation, ChatMessage, Concept, CourseConcept,
    ConceptMastery, AgentInteraction
)


@admin.register(ChatConversation)
class ChatConversationAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'course', 'created_at', 'updated_at', 'message_count']
    list_filter = ['created_at', 'course']
    search_fields = ['title', 'user__username', 'user__email', 'course__name', 'course__code']
    readonly_fields = ['created_at', 'updated_at']
    
    def message_count(self, obj):
        return obj.message_count
    message_count.short_description = 'Messages'


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['conversation', 'role', 'content_preview', 'created_at']
    list_filter = ['role', 'created_at']
    search_fields = ['content', 'conversation__title']
    readonly_fields = ['created_at']
    
    def content_preview(self, obj):
        return obj.content[:100] + '...' if len(obj.content) > 100 else obj.content
    content_preview.short_description = 'Content'


@admin.register(Concept)
class ConceptAdmin(admin.ModelAdmin):
    list_display = ['name', 'parent_concept', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(CourseConcept)
class CourseConceptAdmin(admin.ModelAdmin):
    list_display = ['course_outline', 'concept', 'extracted_at', 'extraction_method']
    list_filter = ['extraction_method', 'extracted_at']
    search_fields = ['concept__name', 'course_outline__course__name', 'course_outline__course__code']


@admin.register(ConceptMastery)
class ConceptMasteryAdmin(admin.ModelAdmin):
    list_display = ['user', 'concept', 'course', 'mastery_level', 'mastery_score', 'last_assessed_at', 'assessment_count']
    list_filter = ['mastery_level', 'last_assessed_at', 'course']
    search_fields = ['user__username', 'user__email', 'concept__name', 'course__name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(AgentInteraction)
class AgentInteractionAdmin(admin.ModelAdmin):
    list_display = ['interaction_type', 'tool_name', 'user', 'success', 'timestamp']
    list_filter = ['interaction_type', 'success', 'timestamp']
    search_fields = ['tool_name', 'resource_uri', 'user__username', 'error_message']
    readonly_fields = ['timestamp']

