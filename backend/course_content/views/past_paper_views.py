from rest_framework import generics, permissions
from ..models import PastPaper
from ..serializers import PastPaperSerializer, PastPaperCreateSerializer


class PastPaperListView(generics.ListAPIView):
    """List past papers with filtering"""
    serializer_class = PastPaperSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = PastPaper.objects.filter(is_published=True)
        
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


class PastPaperCreateView(generics.CreateAPIView):
    """Create new past paper"""
    serializer_class = PastPaperCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class PastPaperDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete past paper"""
    queryset = PastPaper.objects.all()
    serializer_class = PastPaperSerializer
    permission_classes = [permissions.IsAuthenticated]
