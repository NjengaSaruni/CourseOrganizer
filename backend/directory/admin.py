from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.core.exceptions import ValidationError
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import User, AcademicYear, Semester, LoginHistory
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


@admin.register(LoginHistory)
class LoginHistoryAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'login_time', 'logout_time', 'session_duration_display',
        'ip_address', 'device_type', 'browser', 'success', 'is_active_session'
    ]
    list_filter = [
        'success', 'device_type', 'login_time',
        ('user__user_type', admin.ChoicesFieldListFilter),
    ]
    search_fields = [
        'user__email', 'user__first_name', 'user__last_name',
        'ip_address', 'browser', 'operating_system'
    ]
    ordering = ['-login_time']
    readonly_fields = [
        'user', 'login_time', 'logout_time', 'ip_address', 'user_agent',
        'device_type', 'browser', 'operating_system', 'location',
        'session_key', 'success', 'failure_reason', 'session_duration_display'
    ]
    
    fieldsets = (
        ('User & Time', {
            'fields': ('user', 'login_time', 'logout_time', 'session_duration_display')
        }),
        ('Connection Details', {
            'fields': ('ip_address', 'location', 'session_key')
        }),
        ('Device Information', {
            'fields': ('device_type', 'browser', 'operating_system', 'user_agent')
        }),
        ('Status', {
            'fields': ('success', 'failure_reason')
        }),
    )
    
    def has_add_permission(self, request):
        """Disable manual creation of login history"""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Make login history read-only"""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Only allow superusers to delete login history"""
        return request.user.is_superuser
    
    def session_duration_display(self, obj):
        """Display session duration in human-readable format"""
        return obj.get_session_duration_display()
    session_duration_display.short_description = 'Session Duration'
    
    def is_active_session(self, obj):
        """Display if session is currently active"""
        if obj.is_active:
            return format_html('<span style="color: green;">●</span> Active')
        return format_html('<span style="color: gray;">●</span> Ended')
    is_active_session.short_description = 'Session Status'
    
    def changelist_view(self, request, extra_context=None):
        """Add statistics to the changelist view"""
        extra_context = extra_context or {}
        
        # Calculate statistics
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_ago = now - timedelta(days=7)
        
        # Total stats
        total_logins = LoginHistory.objects.count()
        successful_logins = LoginHistory.objects.filter(success=True).count()
        failed_logins = LoginHistory.objects.filter(success=False).count()
        
        # Today's stats
        today_logins = LoginHistory.objects.filter(
            login_time__gte=today_start
        ).count()
        
        # Active sessions
        active_sessions = LoginHistory.objects.filter(
            logout_time__isnull=True,
            success=True
        ).count()
        
        # Last week stats
        week_logins = LoginHistory.objects.filter(
            login_time__gte=week_ago
        ).count()
        
        # Unique users today
        unique_users_today = LoginHistory.objects.filter(
            login_time__gte=today_start,
            success=True
        ).values('user').distinct().count()
        
        # Most active users (last 7 days)
        most_active = LoginHistory.objects.filter(
            login_time__gte=week_ago,
            success=True
        ).values('user__email', 'user__first_name', 'user__last_name').annotate(
            login_count=Count('id')
        ).order_by('-login_count')[:5]
        
        # Failed login attempts by IP (last 24 hours)
        suspicious_ips = LoginHistory.objects.filter(
            login_time__gte=now - timedelta(hours=24),
            success=False
        ).values('ip_address').annotate(
            attempt_count=Count('id')
        ).filter(attempt_count__gte=3).order_by('-attempt_count')[:5]
        
        extra_context['login_stats'] = {
            'total_logins': total_logins,
            'successful_logins': successful_logins,
            'failed_logins': failed_logins,
            'today_logins': today_logins,
            'active_sessions': active_sessions,
            'week_logins': week_logins,
            'unique_users_today': unique_users_today,
            'most_active': most_active,
            'suspicious_ips': suspicious_ips,
        }
        
        return super().changelist_view(request, extra_context=extra_context)