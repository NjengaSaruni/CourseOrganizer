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
    path('admin/approve-user/<int:user_id>/', views.approve_user, name='approve_user'),
    path('admin/reject-user/<int:user_id>/', views.reject_user, name='reject_user'),
    path('admin/generate-passcode/<int:user_id>/', views.generate_passcode, name='generate_passcode'),
    path('admin/send-passcode-sms/<int:user_id>/', views.send_passcode_sms, name='send_passcode_sms'),
    
    # Course-related endpoints
    path('courses/', views.CourseListCreateView.as_view(), name='course_list'),
    path('courses/my-courses/', views.get_user_courses, name='user_courses'),
    path('courses/class/<int:class_id>/', views.get_class_courses, name='class_courses'),
    path('timetable/', views.TimetableEntryListView.as_view(), name='timetable_list'),
    path('materials/', views.CourseMaterialListView.as_view(), name='materials_list'),
    path('recordings/', views.RecordingListView.as_view(), name='recordings_list'),
    path('meetings/', views.MeetingListView.as_view(), name='meetings_list'),
]