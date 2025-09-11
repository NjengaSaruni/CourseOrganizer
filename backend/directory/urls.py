from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/profile/', views.user_profile, name='user_profile'),
    path('auth/profile/update/', views.update_profile, name='update_profile'),
    
    # Academic Years
    path('academic-years/', views.AcademicYearListView.as_view(), name='academic_years'),
    
    # Classes
    path('classes/', views.ClassListView.as_view(), name='classes'),
    path('classes/<int:pk>/', views.ClassDetailView.as_view(), name='class_detail'),
    path('classes/<int:class_id>/info/', views.class_info, name='class_info'),
    path('classes/my-class/', views.my_class_info, name='my_class_info'),
    
    # Registration
    path('register/student/', views.register_student, name='register_student'),
    
    # Users
    path('users/', views.UserListView.as_view(), name='users'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user_detail'),
    path('users/search/', views.search_users, name='search_users'),
    
    # Students
    path('students/', views.StudentListView.as_view(), name='students'),
    path('students/<int:pk>/', views.StudentDetailView.as_view(), name='student_detail'),
    
    # Teachers
    path('teachers/', views.TeacherListView.as_view(), name='teachers'),
    path('teachers/<int:pk>/', views.TeacherDetailView.as_view(), name='teacher_detail'),
    
    # Registration Requests
    path('registration-requests/', views.RegistrationRequestListView.as_view(), name='registration_requests'),
    path('registration-requests/<int:pk>/', views.RegistrationRequestDetailView.as_view(), name='registration_request_detail'),
    path('registration-requests/<int:pk>/approve/', views.approve_registration_request, name='approve_registration_request'),
    path('registration-requests/<int:pk>/reject/', views.reject_registration_request, name='reject_registration_request'),
]

