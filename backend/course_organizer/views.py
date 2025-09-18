from django.shortcuts import render
from django.http import HttpResponse
import os
from django.conf import settings

def serve_angular_app(request):
    """Serve the Angular application for all non-API routes"""
    try:
        # Try to serve the index.html file
        index_path = os.path.join(settings.STATIC_ROOT, 'index.html')
        if os.path.exists(index_path):
            with open(index_path, 'r') as f:
                content = f.read()
            return HttpResponse(content, content_type='text/html')
        else:
            return HttpResponse("Angular app not found. Please check the build process.", status=404)
    except Exception as e:
        return HttpResponse(f"Error serving Angular app: {str(e)}", status=500)
