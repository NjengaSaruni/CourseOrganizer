from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator


class User(AbstractUser):
    """Custom User model extending Django's AbstractUser"""
    registration_number = models.CharField(
        max_length=20,
        unique=True,
        validators=[
            RegexValidator(
                regex=r'^GPR3/\d{6}/2025$',
                message='Registration number must be in format GPR3/XXXXXX/2025'
            )
        ],
        help_text='Registration number in format GPR3/XXXXXX/2025'
    )
    phone_number = models.CharField(max_length=15)
    status = models.CharField(
        max_length=10,
        choices=[
            ('pending', 'Pending'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected')
        ],
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.get_full_name()} ({self.registration_number})"

    @property
    def is_admin(self):
        """Check if user is admin based on registration number"""
        return self.registration_number == 'GPR3/150561/2025'

    def save(self, *args, **kwargs):
        # Set username to email if not provided
        if not self.username:
            self.username = self.email
        super().save(*args, **kwargs)


class Course(models.Model):
    """Course model for organizing course materials"""
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.code} - {self.name}"


class TimetableEntry(models.Model):
    """Timetable entry model"""
    DAY_CHOICES = [
        ('monday', 'Monday'),
        ('tuesday', 'Tuesday'),
        ('wednesday', 'Wednesday'),
        ('thursday', 'Thursday'),
        ('friday', 'Friday'),
        ('saturday', 'Saturday'),
        ('sunday', 'Sunday'),
    ]

    day = models.CharField(max_length=10, choices=DAY_CHOICES)
    subject = models.CharField(max_length=200)
    time = models.CharField(max_length=50)
    location = models.CharField(max_length=200, blank=True)
    group = models.CharField(max_length=50, blank=True)
    lecturer = models.CharField(max_length=200, blank=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='timetable_entries')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['day', 'time']

    def __str__(self):
        return f"{self.day} - {self.subject} at {self.time}"


class CourseMaterial(models.Model):
    """Course material model"""
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file_url = models.URLField(blank=True)
    file_type = models.CharField(max_length=50, blank=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='materials')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Recording(models.Model):
    """Lecture recording model"""
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    video_url = models.URLField(blank=True)
    duration = models.DurationField(blank=True, null=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='recordings')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Meeting(models.Model):
    """Online meeting model"""
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    meeting_url = models.URLField(blank=True)
    scheduled_time = models.DateTimeField()
    duration = models.DurationField(blank=True, null=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='meetings')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.scheduled_time}"