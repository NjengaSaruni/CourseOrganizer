from django.contrib import admin
from django.utils.html import format_html
from .models import School, Faculty, Department, Class, Program


@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'is_active', 'total_students_display', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'code', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'code', 'description', 'is_active')
        }),
        ('Statistics', {
            'fields': ('total_students_display',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def total_students_display(self, obj):
        """Display total students in this school"""
        count = obj.total_students
        return format_html('<span style="color: green;">{}</span>', count)
    total_students_display.short_description = 'Total Students'


class FacultyInline(admin.TabularInline):
    model = Faculty
    extra = 0
    fields = ['name', 'code', 'dean', 'is_active']


@admin.register(Faculty)
class FacultyAdmin(admin.ModelAdmin):
    list_display = ['name', 'school', 'code', 'dean', 'is_active', 'created_at']
    list_filter = ['school', 'is_active', 'created_at']
    search_fields = ['name', 'code', 'dean', 'school__name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('school', 'name', 'code', 'description', 'dean', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('school')


class DepartmentInline(admin.TabularInline):
    model = Department
    extra = 0
    fields = ['name', 'code', 'head', 'is_active']


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'faculty', 'school', 'code', 'head', 'is_active', 'created_at']
    list_filter = ['faculty__school', 'faculty', 'is_active', 'created_at']
    search_fields = ['name', 'code', 'head', 'faculty__name', 'faculty__school__name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('faculty', 'name', 'code', 'description', 'head', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def school(self, obj):
        """Display the school this department belongs to"""
        return obj.faculty.school
    school.short_description = 'School'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('faculty', 'faculty__school')


class ClassInline(admin.TabularInline):
    model = Class
    extra = 0
    fields = ['name', 'program', 'graduation_year', 'academic_year', 'is_active', 'is_default']


@admin.register(Class)
class ClassAdmin(admin.ModelAdmin):
    list_display = ['name', 'program', 'department', 'school', 'graduation_year', 'is_active', 'is_default', 'student_count_display', 'created_at']
    list_filter = ['department__faculty__school', 'department__faculty', 'department', 'is_active', 'is_default', 'graduation_year', 'created_at']
    search_fields = ['name', 'program', 'department__name', 'department__faculty__name', 'department__faculty__school__name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('department', 'name', 'program', 'graduation_year', 'academic_year')
        }),
        ('Settings', {
            'fields': ('is_active', 'is_default')
        }),
        ('Statistics', {
            'fields': ('student_count_display',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def school(self, obj):
        """Display the school this class belongs to"""
        return obj.department.school
    school.short_description = 'School'
    
    def student_count_display(self, obj):
        """Display number of students in this class"""
        count = obj.student_count
        return format_html('<span style="color: blue;">{}</span>', count)
    student_count_display.short_description = 'Students'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'department', 'department__faculty', 'department__faculty__school', 'academic_year'
        )


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ['name', 'degree_level', 'department', 'school', 'duration_years', 'is_active', 'created_at']
    list_filter = ['department__faculty__school', 'department__faculty', 'department', 'degree_level', 'duration_years', 'is_active', 'created_at']
    search_fields = ['name', 'code', 'degree_level', 'department__name', 'department__faculty__name', 'department__faculty__school__name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('department', 'name', 'code', 'degree_level', 'duration_years', 'description', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def school(self, obj):
        """Display the school this program belongs to"""
        return obj.department.school
    school.short_description = 'School'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'department', 'department__faculty', 'department__faculty__school'
        )