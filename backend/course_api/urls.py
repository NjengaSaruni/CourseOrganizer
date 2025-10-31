from django.urls import path
from . import views
import logging

logger = logging.getLogger(__name__)

urlpatterns = [
    # Health check endpoint
    path('', views.health_check, name='health_check'),
    
    # Authentication endpoints
    path('auth/register/', views.register, name='register'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/profile/', views.user_profile, name='user_profile'),
    path('auth/verify-email/', views.verify_email, name='verify_email'),
    path('auth/resend-verification/', views.resend_verification_email, name='resend_verification_email'),
    
    # Admin endpoints
    path('admin/pending-registrations/', views.pending_registrations, name='pending_registrations'),
    path('admin/confirmed-registrations/', views.confirmed_registrations, name='confirmed_registrations'),
    path('admin/approve-user/<int:user_id>/', views.approve_user, name='approve_user'),
    path('admin/reject-user/<int:user_id>/', views.reject_user, name='reject_user'),
    path('admin/debug-user/<int:user_id>/', views.debug_user, name='debug_user'),
    # TODO: Passcode endpoints disabled until SMS service is properly configured
    # path('admin/generate-passcode/<int:user_id>/', views.generate_passcode, name='generate_passcode'),
    # path('admin/send-passcode-sms/<int:user_id>/', views.send_passcode_sms, name='send_passcode_sms'),
    
    # Course-related endpoints
    path('courses/', views.CourseListCreateView.as_view(), name='course_list'),
    path('courses/my-courses/', views.get_user_courses, name='user_courses'),
    path('courses/class/<int:class_id>/', views.get_class_courses, name='class_courses'),
    # Study group messages
    path('study-groups/<int:group_id>/messages/', views.group_messages, name='group_messages'),
    path('study-groups/<int:group_id>/messages/<int:message_id>/', views.delete_message, name='delete_message'),
    path('study-groups/<int:group_id>/chat/autocomplete/', views.chat_autocomplete, name='chat_autocomplete'),
    path('study-groups/<int:group_id>/materials/', views.group_materials, name='group_materials'),
    path('study-groups/<int:group_id>/materials/<int:material_id>/', views.delete_group_material, name='delete_group_material'),
    
    # Timetable endpoints
    path('timetable/', views.TimetableEntryListView.as_view(), name='timetable_list'),
    path('timetable/create/', views.TimetableEntryCreateView.as_view(), name='timetable_create'),
    path('timetable/<int:pk>/update/', views.TimetableEntryUpdateView.as_view(), name='timetable_update'),
    path('timetable/<int:pk>/delete/', views.TimetableEntryDeleteView.as_view(), name='timetable_delete'),
    path('timetable/with-meetings/', views.get_timetable_with_meetings, name='timetable_with_meetings'),
    
    # Other endpoints
    path('materials/', views.CourseMaterialListView.as_view(), name='materials_list'),
    path('recordings/', views.RecordingListView.as_view(), name='recordings_list'),
    path('meetings/', views.MeetingListView.as_view(), name='meetings_list'),

    # Study group endpoints
    path('study-groups/', views.list_create_study_groups, name='study_groups'),
    path('study-groups/mine/', views.my_study_groups, name='my_study_groups'),
    path('study-groups/<int:group_id>/join/', views.request_join_study_group, name='request_join_study_group'),
    path('study-groups/<int:group_id>/leave/', views.leave_study_group, name='leave_study_group'),
    path('study-groups/<int:group_id>/members/', views.group_members, name='group_members'),
    path('study-groups/<int:group_id>/meetings/', views.group_meetings, name='group_meetings'),
    path('study-groups/<int:group_id>/meetings/create/', views.create_group_meeting, name='create_group_meeting'),
    path('study-groups/<int:group_id>/join-requests/<int:request_id>/approve/', views.approve_join_request, name='approve_join_request'),
    path('study-groups/<int:group_id>/join-requests/<int:request_id>/deny/', views.deny_join_request, name='deny_join_request'),
    path('study-groups/<int:group_id>/members/add/', views.add_member_to_group, name='add_member_to_group'),
    path('study-groups/<int:group_id>/members/remove/', views.remove_member_from_group, name='remove_member_from_group'),
    
    # Jitsi Meeting endpoints
    path('meetings/jitsi/create/', views.create_jitsi_meeting, name='create_jitsi_meeting'),
    path('meetings/jitsi/<int:meeting_id>/', views.get_jitsi_meeting, name='get_jitsi_meeting'),
    
    # Jitsi JWT Authentication endpoints
    path('jitsi/token/', views.generate_jitsi_token, name='generate_jitsi_token'),
    path('jitsi/token/<int:meeting_id>/', views.generate_meeting_token, name='generate_meeting_token'),
    path('jitsi/verify/', views.verify_jitsi_token, name='verify_jitsi_token'),
    path('meetings/<int:meeting_id>/status/', views.update_meeting_status, name='update_meeting_status'),
    path('meetings/<int:meeting_id>/join/', views.join_meeting, name='join_meeting'),
    path('meetings/<int:meeting_id>/recording/start/', views.start_jitsi_recording, name='start_jitsi_recording'),
    path('meetings/<int:meeting_id>/recording/stop/', views.stop_jitsi_recording, name='stop_jitsi_recording'),
    path('meetings/<int:meeting_id>/recordings/', views.get_meeting_recordings, name='get_meeting_recordings'),
    
    # Timetable-Meeting Integration endpoints
    path('timetable/<int:timetable_entry_id>/create-meeting/', views.create_meeting_for_timetable_entry, name='create_meeting_for_timetable_entry'),
    path('timetable/<int:timetable_entry_id>/join-meeting/', views.join_timetable_meeting, name='join_timetable_meeting'),
    path('timetable/<int:timetable_entry_id>/delete-meeting/', views.delete_meeting_for_timetable_entry, name='delete_meeting_for_timetable_entry'),
    
    # Admin course management endpoints
    path('admin/courses/', views.get_admin_courses, name='admin_courses'),
    path('admin/courses/<int:course_id>/timetable-entries/', views.get_course_timetable_entries, name='course_timetable_entries'),
    path('admin/recordings/', views.add_recording, name='add_recording'),
    path('admin/recordings/<int:recording_id>/', views.update_recording, name='update_recording'),
    path('admin/recordings/<int:recording_id>/delete/', views.delete_recording, name='delete_recording'),
    path('admin/materials/', views.add_course_material, name='add_course_material'),
    path('admin/materials/<int:material_id>/', views.update_course_material, name='update_course_material'),
    path('admin/materials/<int:material_id>/delete/', views.delete_course_material, name='delete_course_material'),
    
    # Course Content Management endpoints
    path('content/', views.CourseContentListView.as_view(), name='course_content_list'),
    path('content/create/', views.CourseContentCreateView.as_view(), name='course_content_create'),
    path('content/<int:pk>/update/', views.CourseContentUpdateView.as_view(), name='course_content_update'),
    path('content/<int:pk>/delete/', views.CourseContentDeleteView.as_view(), name='course_content_delete'),
    path('content/upload-file/', views.upload_course_content_file, name='upload_course_content_file'),
    path('content/<int:content_id>/increment-view/', views.increment_content_view, name='increment_content_view'),
    path('content/<int:content_id>/increment-download/', views.increment_content_download, name='increment_content_download'),
    
    # Course Timeline endpoints
    path('courses/<int:course_id>/timeline/', views.get_course_timeline, name='get_course_timeline'),
    path('courses/<int:course_id>/lessons/<str:lesson_date>/', views.get_lesson_content, name='get_lesson_content'),
    path('courses/my-content/', views.get_user_course_content, name='get_user_course_content'),
]