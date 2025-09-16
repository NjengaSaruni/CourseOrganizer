from django.urls import path
from . import views

urlpatterns = [
    # Health check endpoint
    path('', views.health_check, name='health_check'),
    
    # Authentication endpoints
    path('auth/register/', views.register, name='register'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/profile/', views.user_profile, name='user_profile'),
    
    # Admin endpoints
    path('admin/pending-registrations/', views.pending_registrations, name='pending_registrations'),
    path('admin/confirmed-registrations/', views.confirmed_registrations, name='confirmed_registrations'),
    path('admin/approve-user/<int:user_id>/', views.approve_user, name='approve_user'),
    path('admin/reject-user/<int:user_id>/', views.reject_user, name='reject_user'),
    # TODO: Passcode endpoints disabled until SMS service is properly configured
    # path('admin/generate-passcode/<int:user_id>/', views.generate_passcode, name='generate_passcode'),
    # path('admin/send-passcode-sms/<int:user_id>/', views.send_passcode_sms, name='send_passcode_sms'),
    
    # Course-related endpoints
    path('courses/', views.CourseListCreateView.as_view(), name='course_list'),
    path('courses/my-courses/', views.get_user_courses, name='user_courses'),
    path('courses/class/<int:class_id>/', views.get_class_courses, name='class_courses'),
    
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
]