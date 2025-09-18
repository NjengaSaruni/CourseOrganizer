from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from datetime import date
from .models import User


class Student(models.Model):
    """Extended Student model with additional student-specific fields"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    student_id = models.CharField(max_length=20, unique=True, help_text="Internal student ID")
    enrollment_date = models.DateField(help_text="Date of enrollment")
    expected_graduation = models.DateField(help_text="Expected graduation date")
    gpa = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True, help_text="Current GPA")
    credits_completed = models.IntegerField(default=0, help_text="Total credits completed")
    credits_required = models.IntegerField(default=120, help_text="Total credits required for graduation")
    is_full_time = models.BooleanField(default=True, help_text="Full-time or part-time student")
    financial_aid = models.BooleanField(default=False, help_text="Receiving financial aid")
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=15, blank=True)
    emergency_contact_relationship = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['user__last_name', 'user__first_name']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.student_id}"
    
    @property
    def progress_percentage(self):
        """Calculate graduation progress percentage"""
        if self.credits_required > 0:
            return (self.credits_completed / self.credits_required) * 100
        return 0
    
    @property
    def is_on_track(self):
        """Check if student is on track for graduation"""
        return self.progress_percentage >= 75  # 75% completion threshold


class Teacher(models.Model):
    """Extended Teacher model with additional teacher-specific fields"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    employee_id = models.CharField(max_length=20, unique=True, help_text="Internal employee ID")
    department = models.CharField(max_length=100, help_text="Department or school")
    position = models.CharField(max_length=100, help_text="Academic position (Lecturer, Professor, etc.)")
    hire_date = models.DateField(help_text="Date of hire")
    office_location = models.CharField(max_length=100, blank=True, help_text="Office location")
    office_hours = models.TextField(blank=True, help_text="Office hours")
    qualifications = models.TextField(blank=True, help_text="Academic qualifications")
    research_interests = models.TextField(blank=True, help_text="Research interests")
    is_tenured = models.BooleanField(default=False, help_text="Tenured faculty member")
    is_active = models.BooleanField(default=True, help_text="Currently active faculty")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['user__last_name', 'user__first_name']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.position}"
    
    @property
    def years_of_service(self):
        """Calculate years of service"""
        today = date.today()
        return today.year - self.hire_date.year


class RegistrationRequest(models.Model):
    """Model for handling student registration requests"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('under_review', 'Under Review'),
    ]
    
    # Basic Information
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15)
    registration_number = models.CharField(
        max_length=20,
        validators=[
            RegexValidator(
                regex=r'^[A-Z]{1,4}\d{0,2}/\d{1,6}/\d{4}$',
                message='Registration number must be in format: PREFIX/XXXXXX/YYYY (e.g., GPR3/123456/2025, P15/1674/2014)'
            )
        ]
    )
    
    # Academic Information
    program = models.CharField(max_length=100, help_text="Academic program")
    year_of_study = models.IntegerField(choices=User.YEAR_CHOICES, help_text="Current year of study")
    semester = models.IntegerField(choices=User.SEMESTER_CHOICES, help_text="Current semester")
    academic_year = models.ForeignKey('AcademicYear', on_delete=models.CASCADE, help_text="Academic year")
    
    # Additional Information
    bio = models.TextField(blank=True, help_text="Brief introduction")
    motivation = models.TextField(help_text="Why do you want to join the platform?")
    
    # Request Management
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_registrations')
    review_notes = models.TextField(blank=True, help_text="Admin review notes")
    
    # User Creation
    created_user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='registration_request')
    
    class Meta:
        ordering = ['-submitted_at']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.registration_number}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def is_pending(self):
        return self.status == 'pending'
    
    @property
    def is_approved(self):
        return self.status == 'approved'
    
    @property
    def is_rejected(self):
        return self.status == 'rejected'
    
    def approve(self, reviewer):
        """Approve the registration request and create user"""
        if self.status != 'pending':
            raise ValidationError("Only pending requests can be approved")
        
        # Get the default class (Class of 2029)
        from school.models import Class
        default_class = Class.get_default_class()
        if not default_class:
            raise ValidationError("No default class found. Please run setup_school_structure first.")
        
        # Create user
        user = User.objects.create(
            username=self.email,
            email=self.email,
            first_name=self.first_name,
            last_name=self.last_name,
            registration_number=self.registration_number,
            phone_number=self.phone_number,
            user_type='student',
            status='approved',
            academic_year=self.academic_year,
            current_year=self.year_of_study,
            current_semester=self.semester,
            student_class=default_class,  # Assign to Class of 2029
            bio=self.bio
        )
        
        # Create student profile
        Student.objects.create(
            user=user,
            student_id=self.registration_number.split('/')[1],  # Use middle part as student ID
            enrollment_date=date.today(),
            expected_graduation=date(self.academic_year.year_end + 3, 12, 31),  # Assume 4-year program
            is_full_time=True
        )
        
        # Update request
        self.status = 'approved'
        self.reviewed_at = models.DateTimeField(auto_now=True)
        self.reviewed_by = reviewer
        self.created_user = user
        self.save()
        
        return user
    
    def reject(self, reviewer, notes=""):
        """Reject the registration request"""
        if self.status != 'pending':
            raise ValidationError("Only pending requests can be rejected")
        
        self.status = 'rejected'
        self.reviewed_at = models.DateTimeField(auto_now=True)
        self.reviewed_by = reviewer
        self.review_notes = notes
        self.save()

