from rest_framework import generics, permissions
from ..models import Material
from ..serializers import MaterialSerializer, MaterialCreateSerializer


class MaterialListView(generics.ListAPIView):
    """List materials with filtering"""
    serializer_class = MaterialSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Material.objects.filter(is_published=True)
        
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


class MaterialCreateView(generics.CreateAPIView):
    """Create new material"""
    serializer_class = MaterialCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class MaterialDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete material"""
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer
    permission_classes = [permissions.IsAuthenticated]
