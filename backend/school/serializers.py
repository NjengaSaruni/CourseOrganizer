from rest_framework import serializers
from .models import School, Faculty, Department, Class, Program


class SchoolSerializer(serializers.ModelSerializer):
    total_students = serializers.ReadOnlyField()
    
    class Meta:
        model = School
        fields = [
            'id', 'name', 'code', 'description', 'is_active',
            'total_students', 'created_at', 'updated_at'
        ]


class FacultySerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True)
    display_name = serializers.ReadOnlyField()
    
    class Meta:
        model = Faculty
        fields = [
            'id', 'school', 'school_name', 'name', 'code', 'description',
            'dean', 'is_active', 'display_name', 'created_at', 'updated_at'
        ]


class DepartmentSerializer(serializers.ModelSerializer):
    faculty_name = serializers.CharField(source='faculty.name', read_only=True)
    school_name = serializers.CharField(source='faculty.school.name', read_only=True)
    display_name = serializers.ReadOnlyField()
    
    class Meta:
        model = Department
        fields = [
            'id', 'faculty', 'faculty_name', 'school_name', 'name', 'code',
            'description', 'head', 'is_active', 'display_name',
            'created_at', 'updated_at'
        ]


class ClassSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    faculty_name = serializers.CharField(source='department.faculty.name', read_only=True)
    school_name = serializers.CharField(source='department.faculty.school.name', read_only=True)
    school_code = serializers.CharField(source='department.faculty.school.code', read_only=True)
    display_name = serializers.ReadOnlyField()
    current_year_of_study = serializers.ReadOnlyField()
    student_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Class
        fields = [
            'id', 'department', 'department_name', 'faculty_name', 'school_name',
            'school_code', 'name', 'program', 'graduation_year', 'academic_year',
            'is_active', 'is_default', 'display_name', 'current_year_of_study',
            'student_count', 'created_at', 'updated_at'
        ]


class ProgramSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    faculty_name = serializers.CharField(source='department.faculty.name', read_only=True)
    school_name = serializers.CharField(source='department.faculty.school.name', read_only=True)
    display_name = serializers.ReadOnlyField()
    
    class Meta:
        model = Program
        fields = [
            'id', 'department', 'department_name', 'faculty_name', 'school_name',
            'name', 'code', 'degree_level', 'duration_years', 'description',
            'is_active', 'display_name', 'created_at', 'updated_at'
        ]
