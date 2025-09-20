from rest_framework import generics, permissions
from ..models import CourseOutline
from ..serializers import CourseOutlineSerializer, CourseOutlineCreateSerializer


class CourseOutlineListView(generics.ListAPIView):
    """List course outlines with filtering"""
    serializer_class = CourseOutlineSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = CourseOutline.objects.filter(is_published=True)
        
        # Filter by course
        course_id = self.request.query_params.get('course_id')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        # Filter by academic year
        academic_year = self.request.query_params.get('academic_year')
        if academic_year:
            queryset = queryset.filter(academic_year=academic_year)
        
        # Filter by semester
        semester = self.request.query_params.get('semester')
        if semester:
            queryset = queryset.filter(semester=semester)
        
        return queryset.order_by('-created_at')


class CourseOutlineCreateView(generics.CreateAPIView):
    """Create new course outline"""
    serializer_class = CourseOutlineCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class CourseOutlineDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete course outline"""
    queryset = CourseOutline.objects.all()
    serializer_class = CourseOutlineSerializer
    permission_classes = [permissions.IsAuthenticated]
