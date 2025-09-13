from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from .models import (
    ClassRepRole, Message, Announcement, MessageReaction, 
    MessageReadStatus, Poll, PollVote
)


@admin.register(ClassRepRole)
class ClassRepRoleAdmin(admin.ModelAdmin):
    list_display = ['user', 'student_class', 'is_active', 'permissions_display', 'assigned_at']
    list_filter = ['is_active', 'student_class', 'assigned_at']
    search_fields = ['user__first_name', 'user__last_name', 'user__registration_number', 'student_class__name']
    readonly_fields = ['assigned_at', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'student_class', 'is_active')
        }),
        ('Permissions', {
            'fields': ('permissions',),
            'description': 'Select permissions for this Class Representative'
        }),
        ('Assignment Details', {
            'fields': ('assigned_by', 'assigned_at'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def permissions_display(self, obj):
        """Display permissions in a readable format"""
        if not obj.permissions:
            return "No permissions"
        
        permission_labels = {
            'send_announcements': 'Send Announcements',
            'moderate_messages': 'Moderate Messages',
            'view_all_messages': 'View All Messages',
            'manage_polls': 'Manage Polls',
            'send_notifications': 'Send Notifications',
        }
        
        labels = [permission_labels.get(p, p) for p in obj.permissions]
        return ", ".join(labels)
    permissions_display.short_description = 'Permissions'
    
    def save_model(self, request, obj, form, change):
        if not change:  # Creating new object
            obj.assigned_by = request.user
        super().save_model(request, obj, form, change)


class MessageReactionInline(admin.TabularInline):
    model = MessageReaction
    extra = 0
    readonly_fields = ['user', 'reaction_type', 'created_at']


class MessageReadStatusInline(admin.TabularInline):
    model = MessageReadStatus
    extra = 0
    readonly_fields = ['user', 'read_at']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['sender', 'student_class', 'message_type', 'is_private', 'is_announcement', 'content_preview', 'created_at']
    list_filter = ['message_type', 'is_private', 'is_announcement', 'student_class', 'created_at']
    search_fields = ['content', 'sender__first_name', 'sender__last_name', 'recipient__first_name', 'recipient__last_name']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [MessageReactionInline, MessageReadStatusInline]
    
    fieldsets = (
        ('Message Details', {
            'fields': ('sender', 'recipient', 'student_class', 'message_type', 'content')
        }),
        ('Message Properties', {
            'fields': ('is_private', 'is_announcement', 'attachment')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def content_preview(self, obj):
        """Show a preview of the message content"""
        if len(obj.content) > 50:
            return obj.content[:50] + "..."
        return obj.content
    content_preview.short_description = 'Content Preview'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('sender', 'recipient', 'student_class')


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ['title', 'sender', 'student_class', 'priority', 'is_pinned', 'is_expired_display', 'created_at']
    list_filter = ['priority', 'is_pinned', 'student_class', 'created_at']
    search_fields = ['title', 'content', 'sender__first_name', 'sender__last_name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Announcement Details', {
            'fields': ('sender', 'student_class', 'title', 'content', 'attachment')
        }),
        ('Settings', {
            'fields': ('priority', 'is_pinned', 'expires_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def is_expired_display(self, obj):
        """Display if announcement is expired"""
        if obj.is_expired:
            return format_html('<span style="color: red;">Expired</span>')
        return format_html('<span style="color: green;">Active</span>')
    is_expired_display.short_description = 'Status'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('sender', 'student_class')


@admin.register(MessageReaction)
class MessageReactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'message_preview', 'reaction_type', 'created_at']
    list_filter = ['reaction_type', 'created_at']
    search_fields = ['user__first_name', 'user__last_name', 'message__content']
    readonly_fields = ['created_at']
    
    def message_preview(self, obj):
        """Show a preview of the reacted message"""
        content = obj.message.content
        if len(content) > 30:
            content = content[:30] + "..."
        return content
    message_preview.short_description = 'Message'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'message')


@admin.register(MessageReadStatus)
class MessageReadStatusAdmin(admin.ModelAdmin):
    list_display = ['user', 'message_preview', 'read_at']
    list_filter = ['read_at']
    search_fields = ['user__first_name', 'user__last_name', 'message__content']
    readonly_fields = ['read_at']
    
    def message_preview(self, obj):
        """Show a preview of the read message"""
        content = obj.message.content
        if len(content) > 30:
            content = content[:30] + "..."
        return content
    message_preview.short_description = 'Message'


class PollVoteInline(admin.TabularInline):
    model = PollVote
    extra = 0
    readonly_fields = ['user', 'selected_options', 'created_at']


@admin.register(Poll)
class PollAdmin(admin.ModelAdmin):
    list_display = ['title', 'creator', 'student_class', 'status', 'total_votes_display', 'is_expired_display', 'created_at']
    list_filter = ['status', 'is_anonymous', 'allow_multiple_choices', 'student_class', 'created_at']
    search_fields = ['title', 'description', 'creator__first_name', 'creator__last_name']
    readonly_fields = ['created_at', 'updated_at', 'total_votes']
    inlines = [PollVoteInline]
    
    fieldsets = (
        ('Poll Details', {
            'fields': ('creator', 'student_class', 'title', 'description')
        }),
        ('Options', {
            'fields': ('options',)
        }),
        ('Settings', {
            'fields': ('is_anonymous', 'allow_multiple_choices', 'status', 'expires_at')
        }),
        ('Statistics', {
            'fields': ('total_votes',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def total_votes_display(self, obj):
        """Display total votes"""
        return obj.total_votes
    total_votes_display.short_description = 'Total Votes'
    
    def is_expired_display(self, obj):
        """Display if poll is expired"""
        if obj.is_expired:
            return format_html('<span style="color: red;">Expired</span>')
        return format_html('<span style="color: green;">Active</span>')
    is_expired_display.short_description = 'Status'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('creator', 'student_class')


@admin.register(PollVote)
class PollVoteAdmin(admin.ModelAdmin):
    list_display = ['user', 'poll_title', 'selected_options_display', 'created_at']
    list_filter = ['created_at', 'poll__status']
    search_fields = ['user__first_name', 'user__last_name', 'poll__title']
    readonly_fields = ['created_at']
    
    def poll_title(self, obj):
        """Show the poll title"""
        return obj.poll.title
    poll_title.short_description = 'Poll'
    
    def selected_options_display(self, obj):
        """Display selected options in a readable format"""
        if not obj.selected_options:
            return "No options selected"
        
        try:
            options = obj.poll.options
            selected_text = []
            for index in obj.selected_options:
                if 0 <= index < len(options):
                    selected_text.append(options[index])
            return ", ".join(selected_text)
        except:
            return str(obj.selected_options)
    selected_options_display.short_description = 'Selected Options'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'poll')