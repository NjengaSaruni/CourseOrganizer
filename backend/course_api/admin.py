from django.contrib import admin
from .models import Course, TimetableEntry, CourseMaterial, Recording, Meeting


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    """Course admin"""
    list_display = ('code', 'name', 'created_at')
    search_fields = ('code', 'name')
    ordering = ('code',)


@admin.register(TimetableEntry)
class TimetableEntryAdmin(admin.ModelAdmin):
    """Timetable entry admin"""
    list_display = ('day', 'subject', 'time', 'location', 'course')
    list_filter = ('day', 'course')
    search_fields = ('subject', 'location')
    ordering = ('day', 'time')


@admin.register(CourseMaterial)
class CourseMaterialAdmin(admin.ModelAdmin):
    """Course material admin"""
    list_display = ('title', 'course', 'uploaded_by', 'file_type', 'created_at')
    list_filter = ('course', 'file_type', 'created_at')
    search_fields = ('title', 'description')
    ordering = ('-created_at',)


@admin.register(Recording)
class RecordingAdmin(admin.ModelAdmin):
    """Recording admin"""
    list_display = ('title', 'course', 'uploaded_by', 'duration', 'created_at')
    list_filter = ('course', 'created_at')
    search_fields = ('title', 'description')
    ordering = ('-created_at',)


@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):
    """Meeting admin"""
    list_display = ('title', 'course', 'scheduled_time', 'created_by', 'created_at')
    list_filter = ('course', 'scheduled_time', 'created_at')
    search_fields = ('title', 'description')
    ordering = ('scheduled_time',)