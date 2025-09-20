from rest_framework import generics, permissions
from ..models import Announcement
from ..serializers import AnnouncementSerializer, AnnouncementCreateSerializer


class AnnouncementListView(generics.ListAPIView):
    """List announcements with filtering"""
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Announcement.objects.filter(is_published=True)
        
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


class AnnouncementCreateView(generics.CreateAPIView):
    """Create new announcement"""
    serializer_class = AnnouncementCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class AnnouncementDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete announcement"""
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated]
