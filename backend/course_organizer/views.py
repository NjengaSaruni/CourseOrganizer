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
