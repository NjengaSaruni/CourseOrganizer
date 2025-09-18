from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import api_views

app_name = 'communication'

# Create a router for API views
router = DefaultRouter()

urlpatterns = [
    # Class Representative URLs
    path('class-reps/', views.ClassRepRoleListCreateView.as_view(), name='class-rep-list-create'),
    path('class-reps/<int:pk>/', views.ClassRepRoleDetailView.as_view(), name='class-rep-detail'),
    path('class-reps/<int:user_id>/permissions/', api_views.class_rep_permissions, name='class-rep-permissions'),
    path('class-reps/<int:user_id>/update-permissions/', api_views.update_class_rep_permissions, name='update-class-rep-permissions'),
    
    # Message URLs
    path('messages/', views.MessageListCreateView.as_view(), name='message-list-create'),
    path('messages/<int:pk>/', views.MessageDetailView.as_view(), name='message-detail'),
    path('messages/<int:message_id>/react/', api_views.add_message_reaction, name='add-message-reaction'),
    path('messages/<int:message_id>/unreact/', api_views.remove_message_reaction, name='remove-message-reaction'),
    path('messages/<int:message_id>/mark-read/', api_views.mark_message_as_read, name='mark-message-read'),
    
    # Announcement URLs
    path('announcements/', api_views.AnnouncementListCreateView.as_view(), name='announcement-list-create'),
    path('announcements/<int:pk>/', api_views.AnnouncementDetailView.as_view(), name='announcement-detail'),
    path('announcements/<int:announcement_id>/mark-read/', api_views.mark_announcement_as_read, name='mark-announcement-read'),
    path('announcements/unread-count/', api_views.get_unread_announcements_count, name='unread-announcements-count'),
    
    # Poll URLs
    path('polls/', api_views.PollListCreateView.as_view(), name='poll-list-create'),
    path('polls/<int:pk>/', api_views.PollDetailView.as_view(), name='poll-detail'),
    path('polls/<int:pk>/vote/', api_views.PollVoteCreateView.as_view(), name='poll-vote'),
    
    # Statistics
    path('stats/', api_views.communication_stats, name='communication-stats'),
]
