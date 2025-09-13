from django.urls import path
from . import views

urlpatterns = [
    # Schools
    path('schools/', views.SchoolListView.as_view(), name='school-list'),
    path('schools/<int:pk>/', views.SchoolDetailView.as_view(), name='school-detail'),
    
    # Faculties
    path('faculties/', views.FacultyListView.as_view(), name='faculty-list'),
    path('faculties/<int:pk>/', views.FacultyDetailView.as_view(), name='faculty-detail'),
    
    # Departments
    path('departments/', views.DepartmentListView.as_view(), name='department-list'),
    path('departments/<int:pk>/', views.DepartmentDetailView.as_view(), name='department-detail'),
    
    # Classes
    path('classes/', views.ClassListView.as_view(), name='class-list'),
    path('classes/<int:pk>/', views.ClassDetailView.as_view(), name='class-detail'),
    path('classes/default/', views.get_default_class, name='default-class'),
    
    # Programs
    path('programs/', views.ProgramListView.as_view(), name='program-list'),
    path('programs/<int:pk>/', views.ProgramDetailView.as_view(), name='program-detail'),
]
