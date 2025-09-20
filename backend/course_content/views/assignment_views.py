from rest_framework import generics, permissions
from ..models import Assignment
from ..serializers import AssignmentSerializer, AssignmentCreateSerializer


class AssignmentListView(generics.ListAPIView):
    """List assignments with filtering"""
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Assignment.objects.filter(is_published=True)
        
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


class AssignmentCreateView(generics.CreateAPIView):
    """Create new assignment"""
    serializer_class = AssignmentCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class AssignmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete assignment"""
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
