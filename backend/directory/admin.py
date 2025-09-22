from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.core.exceptions import ValidationError
from .models import User, AcademicYear, Semester
from .extended_models import Student, Teacher, RegistrationRequest


@admin.register(AcademicYear)
class AcademicYearAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'is_active']
    list_filter = ['is_active', 'year_start']
    search_fields = ['year_start', 'year_end']
    ordering = ['-year_start']


@admin.register(Semester)
class SemesterAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'academic_year', 'semester_type', 'start_date', 'end_date', 'is_active']
    list_filter = ['academic_year', 'semester_type', 'is_active']
    search_fields = ['academic_year__year_start', 'academic_year__year_end']
    ordering = ['academic_year', 'semester_type']


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'get_full_name', 'registration_number', 'user_type', 'status', 'is_active', 'date_joined']
    list_filter = ['user_type', 'status', 'is_active', 'is_staff', 'is_superuser', 'academic_year']
    search_fields = ['email', 'first_name', 'last_name', 'registration_number']
    ordering = ['-date_joined']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('UoN Information', {
            'fields': ('registration_number', 'phone_number', 'user_type', 'status', 'academic_year')
        }),
        ('Academic Details', {
            'fields': ('current_year', 'current_semester', 'class_of')
        }),
        ('Profile', {
            'fields': ('profile_picture', 'bio')
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('UoN Information', {
            'fields': ('registration_number', 'phone_number', 'user_type', 'status', 'academic_year')
        }),
        ('Academic Details', {
            'fields': ('current_year', 'current_semester', 'class_of')
        }),
    )
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    get_full_name.short_description = 'Full Name'


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['user', 'student_id', 'enrollment_date', 'expected_graduation', 'progress_percentage', 'is_on_track']
    list_filter = ['is_full_time', 'financial_aid', 'enrollment_date', 'user__academic_year']
    search_fields = ['user__first_name', 'user__last_name', 'user__email', 'student_id']
    ordering = ['user__last_name', 'user__first_name']
    
    fieldsets = (
        ('Student Information', {
            'fields': ('user', 'student_id', 'enrollment_date', 'expected_graduation')
        }),
        ('Academic Progress', {
            'fields': ('gpa', 'credits_completed', 'credits_required', 'is_full_time')
        }),
        ('Additional Information', {
            'fields': ('financial_aid', 'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship')
        }),
    )
    
    readonly_fields = ['progress_percentage', 'is_on_track']


@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ['user', 'employee_id', 'department', 'position', 'hire_date', 'years_of_service', 'is_active']
    list_filter = ['department', 'position', 'is_tenured', 'is_active', 'hire_date']
    search_fields = ['user__first_name', 'user__last_name', 'user__email', 'employee_id', 'department']
    ordering = ['user__last_name', 'user__first_name']
    
    fieldsets = (
        ('Teacher Information', {
            'fields': ('user', 'employee_id', 'department', 'position', 'hire_date')
        }),
        ('Contact & Office', {
            'fields': ('office_location', 'office_hours')
        }),
        ('Academic Details', {
            'fields': ('qualifications', 'research_interests', 'is_tenured', 'is_active')
        }),
    )
    
    readonly_fields = ['years_of_service']


@admin.register(RegistrationRequest)
class RegistrationRequestAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'registration_number', 'program', 'year_of_study', 'status', 'submitted_at']
    list_filter = ['status', 'program', 'year_of_study', 'academic_year', 'submitted_at']
    search_fields = ['first_name', 'last_name', 'email', 'registration_number']
    ordering = ['-submitted_at']
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('first_name', 'last_name', 'email', 'phone_number', 'registration_number')
        }),
        ('Academic Information', {
            'fields': ('program', 'year_of_study', 'semester', 'academic_year')
        }),
        ('Additional Information', {
            'fields': ('bio', 'motivation')
        }),
        ('Review Status', {
            'fields': ('status', 'reviewed_by', 'reviewed_at', 'review_notes')
        }),
    )
    
    readonly_fields = ['submitted_at', 'reviewed_at']
    
    actions = ['approve_requests', 'reject_requests']
    
    def approve_requests(self, request, queryset):
        """Approve selected registration requests"""
        approved_count = 0
        for req in queryset.filter(status='pending'):
            try:
                req.approve(request.user)
                approved_count += 1
            except ValidationError as e:
                self.message_user(request, f"Error approving {req.full_name}: {e}", level='ERROR')
        
        self.message_user(request, f"Successfully approved {approved_count} registration requests.")
    approve_requests.short_description = "Approve selected requests"
    
    def reject_requests(self, request, queryset):
        """Reject selected registration requests"""
        rejected_count = 0
        for req in queryset.filter(status='pending'):
            try:
                req.reject(request.user, "Bulk rejection")
                rejected_count += 1
            except ValidationError as e:
                self.message_user(request, f"Error rejecting {req.full_name}: {e}", level='ERROR')
        
        self.message_user(request, f"Successfully rejected {rejected_count} registration requests.")
    reject_requests.short_description = "Reject selected requests"