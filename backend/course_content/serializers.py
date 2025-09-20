from rest_framework import serializers
from django.contrib.auth.models import User
from .models import CourseOutline, PastPaper, Recording, Material, Assignment, Announcement
from course_api.models import Course
from directory.models import AcademicYear, Semester


class CourseOutlineSerializer(serializers.ModelSerializer):
    """Serializer for course outline documents"""
    course_name = serializers.CharField(source='course.name', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    academic_year_display = serializers.CharField(source='academic_year.__str__', read_only=True)
    semester_display = serializers.CharField(source='semester.display_name', read_only=True)
    material_type_display = serializers.CharField(source='get_material_type_display', read_only=True)
    file_size_display = serializers.SerializerMethodField()
    
    class Meta:
        model = CourseOutline
        fields = [
            'id', 'course', 'course_name', 'academic_year', 'academic_year_display',
            'semester', 'semester_display', 'title', 'description', 'file_url',
            'file_path', 'material_type', 'material_type_display', 'is_published',
            'uploaded_by', 'uploaded_by_name', 'created_at', 'updated_at',
            'file_size_display'
        ]
        read_only_fields = ['uploaded_by', 'created_at', 'updated_at']

    def get_file_size_display(self, obj):
        # This would need to be implemented based on how you store file sizes
        return "N/A"


class PastPaperSerializer(serializers.ModelSerializer):
    """Serializer for past examination papers"""
    course_name = serializers.CharField(source='course.name', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    academic_year_display = serializers.SerializerMethodField()
    semester_display = serializers.CharField(source='get_semester_display', read_only=True)
    exam_type_display = serializers.CharField(source='get_exam_type_display', read_only=True)
    file_size_display = serializers.SerializerMethodField()
    
    class Meta:
        model = PastPaper
        fields = [
            'id', 'course', 'course_name', 'academic_year', 'academic_year_display',
            'semester', 'semester_display', 'title', 'description', 'file_url',
            'file_path', 'exam_type', 'exam_type_display', 'exam_date', 'is_published',
            'uploaded_by', 'uploaded_by_name', 'created_at', 'updated_at',
            'file_size_display'
        ]
        read_only_fields = ['uploaded_by', 'created_at', 'updated_at']

    def get_academic_year_display(self, obj):
        return f"{obj.academic_year}/{obj.academic_year + 1}"

    def get_file_size_display(self, obj):
        return "N/A"


class RecordingSerializer(serializers.ModelSerializer):
    """Serializer for class recordings"""
    course_name = serializers.CharField(source='course.name', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    academic_year_display = serializers.SerializerMethodField()
    semester_display = serializers.CharField(source='get_semester_display', read_only=True)
    recording_platform_display = serializers.CharField(source='get_recording_platform_display', read_only=True)
    duration_display = serializers.SerializerMethodField()
    file_size_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Recording
        fields = [
            'id', 'course', 'course_name', 'academic_year', 'academic_year_display',
            'semester', 'semester_display', 'title', 'description', 'file_url',
            'file_path', 'recording_platform', 'recording_platform_display',
            'lesson_date', 'lesson_order', 'topic', 'duration', 'duration_display',
            'audio_only', 'is_published', 'uploaded_by', 'uploaded_by_name',
            'created_at', 'updated_at', 'file_size_display'
        ]
        read_only_fields = ['uploaded_by', 'created_at', 'updated_at']

    def get_academic_year_display(self, obj):
        return f"{obj.academic_year}/{obj.academic_year + 1}"

    def get_duration_display(self, obj):
        if obj.duration:
            # Convert minutes to HH:MM:SS format if needed
            try:
                minutes = int(obj.duration)
                hours = minutes // 60
                mins = minutes % 60
                return f"{hours:02d}:{mins:02d}:00"
            except ValueError:
                return obj.duration
        return "N/A"

    def get_file_size_display(self, obj):
        return "N/A"


class MaterialSerializer(serializers.ModelSerializer):
    """Serializer for supplementary course materials"""
    course_name = serializers.CharField(source='course.name', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    academic_year_display = serializers.SerializerMethodField()
    semester_display = serializers.CharField(source='get_semester_display', read_only=True)
    material_type_display = serializers.CharField(source='get_material_type_display', read_only=True)
    file_size_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Material
        fields = [
            'id', 'course', 'course_name', 'academic_year', 'academic_year_display',
            'semester', 'semester_display', 'title', 'description', 'file_url',
            'file_path', 'material_type', 'material_type_display', 'lesson_date',
            'lesson_order', 'topic', 'is_published', 'uploaded_by', 'uploaded_by_name',
            'created_at', 'updated_at', 'file_size_display'
        ]
        read_only_fields = ['uploaded_by', 'created_at', 'updated_at']

    def get_academic_year_display(self, obj):
        return f"{obj.academic_year}/{obj.academic_year + 1}"

    def get_file_size_display(self, obj):
        return "N/A"


class AssignmentSerializer(serializers.ModelSerializer):
    """Serializer for assignments and homework"""
    course_name = serializers.CharField(source='course.name', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    academic_year_display = serializers.SerializerMethodField()
    semester_display = serializers.CharField(source='get_semester_display', read_only=True)
    assignment_type_display = serializers.CharField(source='get_assignment_type_display', read_only=True)
    file_size_display = serializers.SerializerMethodField()
    days_until_due = serializers.SerializerMethodField()
    
    class Meta:
        model = Assignment
        fields = [
            'id', 'course', 'course_name', 'academic_year', 'academic_year_display',
            'semester', 'semester_display', 'title', 'description', 'file_url',
            'file_path', 'assignment_type', 'assignment_type_display', 'lesson_date',
            'due_date', 'lesson_order', 'topic', 'max_marks', 'instructions',
            'is_published', 'uploaded_by', 'uploaded_by_name', 'created_at',
            'updated_at', 'file_size_display', 'days_until_due'
        ]
        read_only_fields = ['uploaded_by', 'created_at', 'updated_at']

    def get_academic_year_display(self, obj):
        return f"{obj.academic_year}/{obj.academic_year + 1}"

    def get_file_size_display(self, obj):
        return "N/A"

    def get_days_until_due(self, obj):
        from datetime import date
        if obj.due_date:
            delta = obj.due_date - date.today()
            return delta.days
        return None


class AnnouncementSerializer(serializers.ModelSerializer):
    """Serializer for course announcements"""
    course_name = serializers.CharField(source='course.name', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    academic_year_display = serializers.SerializerMethodField()
    semester_display = serializers.CharField(source='get_semester_display', read_only=True)
    announcement_type_display = serializers.CharField(source='get_announcement_type_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    is_expired = serializers.SerializerMethodField()
    
    class Meta:
        model = Announcement
        fields = [
            'id', 'course', 'course_name', 'academic_year', 'academic_year_display',
            'semester', 'semester_display', 'title', 'description', 'file_url',
            'file_path', 'announcement_type', 'announcement_type_display',
            'priority', 'priority_display', 'expires_at', 'is_published',
            'uploaded_by', 'uploaded_by_name', 'created_at', 'updated_at',
            'is_expired'
        ]
        read_only_fields = ['uploaded_by', 'created_at', 'updated_at']

    def get_academic_year_display(self, obj):
        return f"{obj.academic_year}/{obj.academic_year + 1}"

    def get_is_expired(self, obj):
        from django.utils import timezone
        if obj.expires_at:
            return timezone.now() > obj.expires_at
        return False


# Create serializers for creating new content
class CourseOutlineCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating course outline documents"""
    
    class Meta:
        model = CourseOutline
        fields = [
            'course', 'academic_year', 'semester', 'title', 'description',
            'file_url', 'file_path', 'material_type', 'is_published'
        ]

    def validate(self, attrs):
        # Ensure file_url or file_path is provided
        if not attrs.get('file_url') and not attrs.get('file_path'):
            raise serializers.ValidationError({
                'file_url': 'Either file_url or file_path must be provided.'
            })
        return attrs


class PastPaperCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating past examination papers"""
    
    class Meta:
        model = PastPaper
        fields = [
            'course', 'academic_year', 'semester', 'title', 'description',
            'file_url', 'file_path', 'exam_type', 'exam_date', 'is_published'
        ]

    def validate(self, attrs):
        if not attrs.get('file_url') and not attrs.get('file_path'):
            raise serializers.ValidationError({
                'file_url': 'Either file_url or file_path must be provided.'
            })
        return attrs


class RecordingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating class recordings"""
    
    class Meta:
        model = Recording
        fields = [
            'course', 'academic_year', 'semester', 'title', 'description',
            'file_url', 'file_path', 'recording_platform', 'lesson_date',
            'lesson_order', 'topic', 'duration', 'audio_only', 'is_published'
        ]

    def validate(self, attrs):
        if not attrs.get('file_url') and not attrs.get('file_path'):
            raise serializers.ValidationError({
                'file_url': 'Either file_url or file_path must be provided.'
            })
        return attrs


class MaterialCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating supplementary course materials"""
    
    class Meta:
        model = Material
        fields = [
            'course', 'academic_year', 'semester', 'title', 'description',
            'file_url', 'file_path', 'material_type', 'lesson_date',
            'lesson_order', 'topic', 'is_published'
        ]

    def validate(self, attrs):
        if not attrs.get('file_url') and not attrs.get('file_path'):
            raise serializers.ValidationError({
                'file_url': 'Either file_url or file_path must be provided.'
            })
        return attrs


class AssignmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating assignments and homework"""
    
    class Meta:
        model = Assignment
        fields = [
            'course', 'academic_year', 'semester', 'title', 'description',
            'file_url', 'file_path', 'assignment_type', 'lesson_date',
            'due_date', 'lesson_order', 'topic', 'max_marks', 'instructions',
            'is_published'
        ]

    def validate(self, attrs):
        if not attrs.get('file_url') and not attrs.get('file_path'):
            raise serializers.ValidationError({
                'file_url': 'Either file_url or file_path must be provided.'
            })
        
        # Ensure due_date is after lesson_date
        if attrs.get('lesson_date') and attrs.get('due_date'):
            if attrs['due_date'] <= attrs['lesson_date']:
                raise serializers.ValidationError({
                    'due_date': 'Due date must be after the lesson date.'
                })
        
        return attrs


class AnnouncementCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating course announcements"""
    
    class Meta:
        model = Announcement
        fields = [
            'course', 'academic_year', 'semester', 'title', 'description',
            'file_url', 'file_path', 'announcement_type', 'priority',
            'expires_at', 'is_published'
        ]
