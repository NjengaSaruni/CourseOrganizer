from django.shortcuts import render
from django.http import HttpResponse, Http404, FileResponse
from django.views.decorators.clickjacking import xframe_options_exempt
from django.views.static import serve
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

@xframe_options_exempt
def serve_pdf(request, path):
    """Serve PDF files with iframe embedding allowed"""
    file_path = os.path.join(settings.MEDIA_ROOT, path)
    
    if not os.path.exists(file_path):
        raise Http404("File not found")
    
    # Check if it's a PDF file
    if not file_path.lower().endswith('.pdf'):
        raise Http404("File not found")
    
    try:
        response = FileResponse(open(file_path, 'rb'), content_type='application/pdf')
        response['Content-Disposition'] = 'inline; filename="' + os.path.basename(file_path) + '"'
        # Remove X-Frame-Options header completely to allow iframe embedding
        if 'X-Frame-Options' in response:
            del response['X-Frame-Options']
        return response
    except Exception as e:
        raise Http404("Error serving file")

def serve_favicon(request):
    """Serve favicon.ico directly"""
    favicon_path = os.path.join(settings.STATIC_ROOT, 'favicon.ico')
    if os.path.exists(favicon_path):
        response = FileResponse(open(favicon_path, 'rb'), content_type='image/x-icon')
        response['Cache-Control'] = 'public, max-age=86400'  # Cache for 24 hours
        return response
    else:
        raise Http404("Favicon not found")

def serve_favicon_svg(request):
    """Serve favicon.svg directly"""
    favicon_path = os.path.join(settings.STATIC_ROOT, 'favicon.svg')
    if os.path.exists(favicon_path):
        response = FileResponse(open(favicon_path, 'rb'), content_type='image/svg+xml')
        response['Cache-Control'] = 'public, max-age=86400'  # Cache for 24 hours
        return response
    else:
        raise Http404("Favicon SVG not found")

def serve_media(request, path):
    """Serve media files (images, documents, etc.)"""
    file_path = os.path.join(settings.MEDIA_ROOT, path)
    
    if not os.path.exists(file_path):
        raise Http404("File not found")
    
    try:
        # Determine content type based on file extension
        content_type = 'application/octet-stream'  # default
        if file_path.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
            content_type = 'image/' + file_path.split('.')[-1].lower()
            if content_type == 'image/jpg':
                content_type = 'image/jpeg'
        elif file_path.lower().endswith('.ico'):
            content_type = 'image/x-icon'
        elif file_path.lower().endswith('.svg'):
            content_type = 'image/svg+xml'
        elif file_path.lower().endswith('.pdf'):
            content_type = 'application/pdf'
        elif file_path.lower().endswith(('.doc', '.docx')):
            content_type = 'application/msword'
        elif file_path.lower().endswith(('.ppt', '.pptx')):
            content_type = 'application/vnd.ms-powerpoint'
        
        response = FileResponse(open(file_path, 'rb'), content_type=content_type)
        response['Content-Disposition'] = 'inline; filename="' + os.path.basename(file_path) + '"'
        return response
    except Exception as e:
        raise Http404("Error serving file")
