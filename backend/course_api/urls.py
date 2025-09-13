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
    
    # Other endpoints
    path('materials/', views.CourseMaterialListView.as_view(), name='materials_list'),
    path('recordings/', views.RecordingListView.as_view(), name='recordings_list'),
    path('meetings/', views.MeetingListView.as_view(), name='meetings_list'),
    
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