from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import School, Faculty, Department, Class, Program
from .serializers import (
    SchoolSerializer, FacultySerializer, DepartmentSerializer,
    ClassSerializer, ProgramSerializer
)


class SchoolListView(generics.ListAPIView):
    """List all schools"""
    queryset = School.objects.filter(is_active=True)
    serializer_class = SchoolSerializer
    permission_classes = [permissions.IsAuthenticated]


class SchoolDetailView(generics.RetrieveAPIView):
    """Get school details"""
    queryset = School.objects.filter(is_active=True)
    serializer_class = SchoolSerializer
    permission_classes = [permissions.IsAuthenticated]


class FacultyListView(generics.ListAPIView):
    """List faculties"""
    queryset = Faculty.objects.filter(is_active=True)
    serializer_class = FacultySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        school_id = self.request.query_params.get('school_id')
        if school_id:
            queryset = queryset.filter(school_id=school_id)
        return queryset


class FacultyDetailView(generics.RetrieveAPIView):
    """Get faculty details"""
    queryset = Faculty.objects.filter(is_active=True)
    serializer_class = FacultySerializer
    permission_classes = [permissions.IsAuthenticated]


class DepartmentListView(generics.ListAPIView):
    """List departments"""
    queryset = Department.objects.filter(is_active=True)
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        faculty_id = self.request.query_params.get('faculty_id')
        school_id = self.request.query_params.get('school_id')
        
        if faculty_id:
            queryset = queryset.filter(faculty_id=faculty_id)
        elif school_id:
            queryset = queryset.filter(faculty__school_id=school_id)
        
        return queryset


class DepartmentDetailView(generics.RetrieveAPIView):
    """Get department details"""
    queryset = Department.objects.filter(is_active=True)
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]


class ClassListView(generics.ListAPIView):
    """List classes"""
    queryset = Class.objects.filter(is_active=True)
    serializer_class = ClassSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        department_id = self.request.query_params.get('department_id')
        faculty_id = self.request.query_params.get('faculty_id')
        school_id = self.request.query_params.get('school_id')
        
        if department_id:
            queryset = queryset.filter(department_id=department_id)
        elif faculty_id:
            queryset = queryset.filter(department__faculty_id=faculty_id)
        elif school_id:
            queryset = queryset.filter(department__faculty__school_id=school_id)
        
        return queryset


class ClassDetailView(generics.RetrieveAPIView):
    """Get class details"""
    queryset = Class.objects.filter(is_active=True)
    serializer_class = ClassSerializer
    permission_classes = [permissions.IsAuthenticated]


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_default_class(request):
    """Get the default class for new students"""
    default_class = Class.get_default_class()
    
    if not default_class:
        return Response(
            {'error': 'No default class found. Please contact an administrator.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = ClassSerializer(default_class)
    return Response(serializer.data)


class ProgramListView(generics.ListAPIView):
    """List programs"""
    queryset = Program.objects.filter(is_active=True)
    serializer_class = ProgramSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        department_id = self.request.query_params.get('department_id')
        faculty_id = self.request.query_params.get('faculty_id')
        school_id = self.request.query_params.get('school_id')
        
        if department_id:
            queryset = queryset.filter(department_id=department_id)
        elif faculty_id:
            queryset = queryset.filter(department__faculty_id=faculty_id)
        elif school_id:
            queryset = queryset.filter(department__faculty__school_id=school_id)
        
        return queryset


class ProgramDetailView(generics.RetrieveAPIView):
    """Get program details"""
    queryset = Program.objects.filter(is_active=True)
    serializer_class = ProgramSerializer
    permission_classes = [permissions.IsAuthenticated]