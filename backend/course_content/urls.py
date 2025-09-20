from django.urls import path, include
from .views import (
    CourseOutlineListView, CourseOutlineCreateView, CourseOutlineDetailView,
    PastPaperListView, PastPaperCreateView, PastPaperDetailView,
    MaterialListView, MaterialCreateView, MaterialDetailView,
    AssignmentListView, AssignmentCreateView, AssignmentDetailView,
    upload_course_content_file
)

app_name = 'course_content'

urlpatterns = [
    # Course Outline endpoints
    path('outlines/', CourseOutlineListView.as_view(), name='course_outline_list'),
    path('outlines/create/', CourseOutlineCreateView.as_view(), name='course_outline_create'),
    path('outlines/<int:pk>/', CourseOutlineDetailView.as_view(), name='course_outline_detail'),
    
    # Past Papers endpoints
    path('past-papers/', PastPaperListView.as_view(), name='past_paper_list'),
    path('past-papers/create/', PastPaperCreateView.as_view(), name='past_paper_create'),
    path('past-papers/<int:pk>/', PastPaperDetailView.as_view(), name='past_paper_detail'),
    
    # Materials endpoints
    path('materials/', MaterialListView.as_view(), name='material_list'),
    path('materials/create/', MaterialCreateView.as_view(), name='material_create'),
    path('materials/<int:pk>/', MaterialDetailView.as_view(), name='material_detail'),
    
    # Assignments endpoints
    path('assignments/', AssignmentListView.as_view(), name='assignment_list'),
    path('assignments/create/', AssignmentCreateView.as_view(), name='assignment_create'),
    path('assignments/<int:pk>/', AssignmentDetailView.as_view(), name='assignment_detail'),
    
    # File upload endpoint
    path('upload-file/', upload_course_content_file, name='upload_course_content_file'),
]
