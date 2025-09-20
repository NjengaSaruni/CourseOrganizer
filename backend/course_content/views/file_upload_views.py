from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
from datetime import datetime


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_course_content_file(request):
    """Upload file for course content"""
    if 'file' not in request.FILES:
        return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    file = request.FILES['file']
    
    # Generate unique filename
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    file_extension = os.path.splitext(file.name)[1]
    unique_filename = f"{timestamp}_{file.name}"
    
    # Save file
    file_path = default_storage.save(f'course_content/{unique_filename}', ContentFile(file.read()))
    
    # Get file URL
    file_url = default_storage.url(file_path)
    
    return Response({
        'message': 'File uploaded successfully',
        'file_url': file_url,
        'file_path': file_path,
        'file_size': file.size,
        'content_type': file.content_type,
        'filename': file.name
    }, status=status.HTTP_201_CREATED)
