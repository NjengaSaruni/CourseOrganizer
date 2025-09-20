from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import JsonResponse
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
import uuid
from datetime import datetime

from .models import CourseOutline, PastPaper, Recording, Material, Assignment, Announcement
from .serializers import (
    CourseOutlineSerializer, CourseOutlineCreateSerializer,
    PastPaperSerializer, PastPaperCreateSerializer,
    RecordingSerializer, RecordingCreateSerializer,
    MaterialSerializer, MaterialCreateSerializer,
    AssignmentSerializer, AssignmentCreateSerializer,
    AnnouncementSerializer, AnnouncementCreateSerializer
)