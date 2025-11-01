"""
URL configuration for course_organizer project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from django.http import HttpResponse
from . import views
import os

def serve_static_assets(request, path):
    """Serve static assets (CSS, JS, images) for Angular app"""
    # Check if this is a static asset request by file extension
    static_extensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.eot', '.json', '.txt']
    
    if any(path.endswith(ext) for ext in static_extensions):
        # Handle both direct file requests and browser/ prefixed requests
        if path.startswith('browser/'):
            # Remove the 'browser/' prefix for direct access to STATIC_ROOT
            actual_path = path[8:]  # Remove 'browser/' prefix
            file_path = os.path.join(settings.STATIC_ROOT, actual_path)
        else:
            file_path = os.path.join(settings.STATIC_ROOT, path)
        
        if os.path.exists(file_path):
            return serve(request, actual_path if path.startswith('browser/') else path, document_root=settings.STATIC_ROOT)
        else:
            return HttpResponse("File not found", status=404)
    else:
        # If it's not a static asset, serve the Angular app for client-side routing
        return views.serve_angular_app(request)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/directory/', include('directory.urls')),
    path('api/', include('course_api.urls')),
    path('api/course-content/', include('course_content.urls')),
    path('api/communication/', include('communication.urls')),
    path('api/school/', include('school.urls')),
    path('api/ai-chat/', include('ai_chat.urls')),
    # Direct favicon routes for better browser compatibility
    path('favicon.ico', views.serve_favicon),
    path('favicon.svg', views.serve_favicon_svg),
    # Serve media files (images, documents, etc.)
    path('media/<path:path>', views.serve_media),
    # Serve static assets for Angular app
    path('<path:path>', serve_static_assets),
    # Serve Angular app at root (catch-all for SPA routing)
    path('', views.serve_angular_app),
]

# Serve static and media files during development
# IMPORTANT: These must be added BEFORE the catch-all route above
if settings.DEBUG:
    # Insert static serving at the beginning to avoid catch-all conflicts
    # Note: We don't add media_patterns here because we have a custom PDF view
    static_patterns = static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns = static_patterns + urlpatterns
