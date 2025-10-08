from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import date, timedelta
import re
import secrets
import string


class AcademicYear(models.Model):
    """Academic Year model to track academic years (e.g., 2025/2026)"""
    
    year_start = models.IntegerField(help_text="Starting year (e.g., 2025 for 2025/2026)")
    year_end = models.IntegerField(help_text="Ending year (e.g., 2026 for 2025/2026)")
    is_active = models.BooleanField(default=False, help_text="Currently active academic year")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['year_start', 'year_end']
        ordering = ['-year_start', '-year_end']
    
    def __str__(self):
        return f"{self.year_start}/{self.year_end}"
    
    def clean(self):
        if self.year_end != self.year_start + 1:
            raise ValidationError("Academic year must span exactly one year (e.g., 2025/2026)")
    
    @classmethod
    def get_current_academic_year(cls):
        """Get the currently active academic year"""
        return cls.objects.filter(is_active=True).first()

    @classmethod
    def get_or_create_2025_2026(cls):
        """Compatibility helper used across commands/components.
        Ensures the 2025/2026 academic year exists and returns it (sets active if newly created).
        """
        obj, created = cls.objects.get_or_create(
            year_start=2025,
            year_end=2026,
            defaults={
                'is_active': True,
            }
        )
        return obj


class Semester(models.Model):
    """Semester model to track semesters within academic years"""
    
    SEMESTER_TYPE_CHOICES = [
        (1, 'First Semester'),
        (2, 'Second Semester'),
        (3, 'Summer Semester'),
    ]
    
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='semesters')
    semester_type = models.IntegerField(choices=SEMESTER_TYPE_CHOICES, help_text="Type of semester")
    start_date = models.DateField(help_text="Semester start date")
    end_date = models.DateField(help_text="Semester end date")
    is_active = models.BooleanField(default=False, help_text="Currently active semester")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['academic_year', 'semester_type']
        ordering = ['academic_year', 'semester_type']
    
    def __str__(self):
        return f"{self.academic_year} - {self.get_semester_type_display()}"
    
    def clean(self):
        if self.end_date <= self.start_date:
            raise ValidationError("Semester end date must be after start date")
    
    @property
    def display_name(self):
        """Get formatted semester name"""
        return f"{self.academic_year} - {self.get_semester_type_display()}"
    
    def get_progress_percentage(self):
        """Calculate semester progress as a percentage"""
        from datetime import date
        today = date.today()
        total_days = (self.end_date - self.start_date).days
        
        if today < self.start_date:
            return 0
        elif today > self.end_date:
            return 100
        else:
            days_elapsed = (today - self.start_date).days
            return round((days_elapsed / total_days) * 100, 1)
    
    def get_progress_status(self):
        """Get semester progress status"""
        from datetime import date
        today = date.today()
        
        if today < self.start_date:
            return "Not Started"
        elif today > self.end_date:
            return "Completed"
        else:
            return "In Progress"
    
    def get_days_elapsed(self):
        """Get number of days elapsed in the semester"""
        from datetime import date
        today = date.today()
        
        if today < self.start_date:
            return 0
        elif today > self.end_date:
            return (self.end_date - self.start_date).days
        else:
            return (today - self.start_date).days
    
    def get_total_days(self):
        """Get total number of days in the semester"""
        return (self.end_date - self.start_date).days
    
    def get_days_remaining(self):
        """Get number of days remaining in the semester"""
        from datetime import date
        today = date.today()
        
        if today < self.start_date:
            return self.get_total_days()
        elif today > self.end_date:
            return 0
        else:
            return (self.end_date - today).days



class UserManager(BaseUserManager):
    """Custom user manager for the User model"""
    
    def create_user(self, email, password=None, **extra_fields):
        """Create and return a regular user with an email and password"""
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        # Remove username from extra_fields if it exists to avoid duplicate
        extra_fields.pop('username', None)
        user = self.model(email=email, username=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Create and return a superuser with an email and password"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('user_type', 'admin')
        extra_fields.setdefault('status', 'approved')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Base User model extending Django's AbstractUser"""
    
    objects = UserManager()
    
    USER_TYPE_CHOICES = [
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('admin', 'Administrator'),
    ]
    
    YEAR_CHOICES = [
        (1, 'First Year'),
        (2, 'Second Year'),
        (3, 'Third Year'),
        (4, 'Fourth Year'),
    ]
    
    SEMESTER_CHOICES = [
        (1, 'First Semester'),
        (2, 'Second Semester'),
        (3, 'Holiday Semester'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('suspended', 'Suspended'),
    ]
    
    # UoN Registration Number with flexible format support
    registration_number = models.CharField(
        max_length=20,
        unique=True,
        validators=[
            RegexValidator(
                regex=r'^[A-Z]{1,4}\d{0,2}/\d{1,6}/\d{4}$',
                message='Registration number must be in format: PREFIX/XXXXXX/YYYY (e.g., GPR3/123456/2025, P15/1674/2014)'
            )
        ],
        help_text='UoN registration number in format: PREFIX/XXXXXX/YYYY (middle part can be 1-6 digits)'
    )
    
    phone_number = models.CharField(max_length=15, help_text="Phone number with country code")
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default='student')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, null=True, blank=True, help_text="Current academic year")
    student_class = models.ForeignKey('school.Class', on_delete=models.CASCADE, null=True, blank=True, related_name='students', help_text="Student class (for students)")
    current_year = models.IntegerField(choices=YEAR_CHOICES, null=True, blank=True, help_text="Current academic year (for students)")
    current_semester = models.IntegerField(choices=SEMESTER_CHOICES, null=True, blank=True, help_text="Current semester (for students)")
    class_of = models.IntegerField(null=True, blank=True, help_text="Graduation year (Class of) - auto-calculated from student_class")
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)
    bio = models.TextField(blank=True, help_text="Brief biography or description")
    
    # Email verification fields
    email_verified = models.BooleanField(default=False, help_text="Whether the email address has been verified")
    email_verification_token = models.CharField(max_length=100, blank=True, null=True, help_text="Token for email verification")
    email_verification_sent_at = models.DateTimeField(blank=True, null=True, help_text="When the verification email was sent")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.get_full_name()} ({self.registration_number})"

    def clean(self):
        super().clean()
        # Validate registration number format and extract information
        if self.registration_number:
            self.validate_registration_number()
    
    def validate_registration_number(self):
        """Validate and extract information from UoN registration number"""
        pattern = r'^([A-Z]{1,4})(\d{0,2})/(\d{1,6})/(\d{4})$'
        match = re.match(pattern, self.registration_number)
        
        if not match:
            raise ValidationError({
                'registration_number': 'Invalid registration number format. Expected: PREFIX/*/YYYY'
            })
        
        prefix, year_code, student_id, admission_year = match.groups()
        
        # Validate admission year (should be reasonable)
        current_year = date.today().year
        admission_year_int = int(admission_year)
        if admission_year_int < 2000 or admission_year_int > current_year + 1:
            raise ValidationError({
                'registration_number': f'Invalid admission year "{admission_year}". Must be between 2000 and {current_year + 1}'
            })
        
        # Auto-set class and class_of for students
        if self.user_type == 'student':
            graduation_year = admission_year_int + 4  # Typically 4 years for most programs
            
            # Auto-assign to appropriate class
            if not self.student_class:
                try:
                    from school.models import Class as SchoolClass
                    # Try to get the default class first
                    default_class = SchoolClass.get_default_class()
                    if default_class:
                        self.student_class = default_class
                    else:
                        # Fallback to creating a class (this should be handled by setup commands)
                        pass
                except ImportError:
                    # School app not available yet
                    pass
            
            # Set class_of from student_class
            if self.student_class:
                self.class_of = self.student_class.graduation_year
    
    @property
    def is_admin(self):
        """Check if user is admin based on user_type"""
        return self.user_type == 'admin'
    
    @property
    def is_student(self):
        """Check if user is a student"""
        return self.user_type == 'student'
    
    @property
    def is_teacher(self):
        """Check if user is a teacher"""
        return self.user_type == 'teacher'
    
    @property
    def year_display(self):
        """Get human-readable year display"""
        if self.current_year:
            return dict(self.YEAR_CHOICES)[self.current_year]
        return None
    
    @property
    def semester_display(self):
        """Get human-readable semester display"""
        if self.current_semester:
            return dict(self.SEMESTER_CHOICES)[self.current_semester]
        return None
    
    @property
    def is_first_year_first_semester(self):
        """Check if user is in first year first semester"""
        return self.current_year == 1 and self.current_semester == 1
    
    @property
    def class_display_name(self):
        """Get class display name"""
        if self.student_class:
            return self.student_class.display_name
        return f"Class of {self.class_of}" if self.class_of else "No Class"
    
    @property
    def is_class_of_2029(self):
        """Check if user is in Class of 2029"""
        return self.class_of == 2029 or (self.student_class and self.student_class.graduation_year == 2029)
    
    @property
    def is_first_year_law_student(self):
        """Check if user is a first-year law student"""
        return (self.user_type == 'student' and 
                self.current_year == 1 and 
                self.registration_number and 
                self.registration_number.startswith('GPR'))
    
    @property
    def registration_info(self):
        """Extract information from registration number"""
        pattern = r'^([A-Z]{1,4})(\d{0,2})/(\d{1,6})/(\d{4})$'
        match = re.match(pattern, self.registration_number)
        if match:
            prefix, year_code, student_id, admission_year = match.groups()
            return {
                'prefix': prefix,
                'year_code': year_code,
                'student_id': student_id,
                'admission_year': admission_year,
                'program': self.get_program_name(prefix)
            }
        return None
    
    def get_program_name(self, prefix):
        """Get program name from prefix"""
        program_names = {
            'GPR': 'Bachelor of Laws (LLB)',
            'LAW': 'Law Program',
            'ENG': 'Engineering',
            'MED': 'Medicine',
            'SCI': 'Science',
            'BUS': 'Business',
            'ART': 'Arts',
            'EDU': 'Education'
        }
        return program_names.get(prefix, f'{prefix} Program')
    
    @property
    def is_class_rep(self):
        """Check if user is a Class Representative"""
        try:
            from communication.models import ClassRepRole
            return ClassRepRole.objects.filter(user=self, is_active=True).exists()
        except ImportError:
            return False
    
    def has_class_rep_permission(self, permission):
        """Check if user has a specific Class Rep permission"""
        try:
            from communication.models import ClassRepRole
            class_rep = ClassRepRole.objects.filter(user=self, is_active=True).first()
            if class_rep:
                return class_rep.has_permission(permission)
        except ImportError:
            pass
        return False
    
    def can_upload_content(self):
        """Check if user can upload course content (admin or class rep with permission)"""
        if self.is_admin:
            return True
        return self.has_class_rep_permission('upload_content')
    
    def generate_email_verification_token(self):
        """Generate a secure email verification token"""
        # Generate a 32-character random token
        token = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))
        self.email_verification_token = token
        self.email_verification_sent_at = timezone.now()
        self.email_verified = False
        return token
    
    def verify_email_token(self, token):
        """Verify the email verification token"""
        if not self.email_verification_token:
            return False, "No verification token found"
        
        if self.email_verification_token != token:
            return False, "Invalid verification token"
        
        # Check if token is expired (24 hours)
        if self.email_verification_sent_at:
            token_age = timezone.now() - self.email_verification_sent_at
            if token_age > timedelta(hours=24):
                return False, "Verification token has expired. Please request a new one."
        
        # Token is valid
        self.email_verified = True
        self.email_verification_token = None  # Clear the token after successful verification
        self.email_verification_sent_at = None
        self.save()
        return True, "Email verified successfully"
    
    def can_login(self):
        """Check if user can log in (email verified and approved)"""
        return self.email_verified and self.status == 'approved' and self.is_active

    def save(self, *args, **kwargs):
        # Set username to email if not provided
        if not self.username:
            self.username = self.email
        
        # Set default academic year to 2025/2026 if not set
        if not self.academic_year:
            self.academic_year = AcademicYear.get_or_create_2025_2026()
        
        # Validate registration number and auto-assign class
        if self.registration_number:
            self.validate_registration_number()
        
        super().save(*args, **kwargs)


class LoginHistory(models.Model):
    """Track user login and logout events for analytics and security"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='login_history')
    login_time = models.DateTimeField(auto_now_add=True)
    logout_time = models.DateTimeField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, help_text="Browser and device information")
    device_type = models.CharField(max_length=50, blank=True, help_text="Mobile, Desktop, Tablet")
    browser = models.CharField(max_length=100, blank=True)
    operating_system = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=200, blank=True, help_text="City, Country from IP")
    session_key = models.CharField(max_length=255, blank=True, help_text="Django session key")
    success = models.BooleanField(default=True, help_text="Whether login was successful")
    failure_reason = models.CharField(max_length=255, blank=True, help_text="Reason for failed login")
    
    class Meta:
        ordering = ['-login_time']
        verbose_name = "Login History"
        verbose_name_plural = "Login Histories"
        indexes = [
            models.Index(fields=['-login_time']),
            models.Index(fields=['user', '-login_time']),
            models.Index(fields=['ip_address']),
        ]
    
    def __str__(self):
        status = "Successful" if self.success else "Failed"
        return f"{self.user.get_full_name()} - {status} login at {self.login_time}"
    
    @property
    def session_duration(self):
        """Calculate session duration if logged out"""
        if self.logout_time:
            return self.logout_time - self.login_time
        return None
    
    @property
    def is_active(self):
        """Check if session is still active"""
        return self.logout_time is None
    
    def get_session_duration_display(self):
        """Get human-readable session duration"""
        duration = self.session_duration
        if duration:
            total_seconds = int(duration.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            if hours > 0:
                return f"{hours}h {minutes}m"
            return f"{minutes}m"
        return "Active" if self.is_active else "Unknown"