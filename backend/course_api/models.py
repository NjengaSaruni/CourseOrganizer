from django.db import models
from django.utils import timezone
from directory.models import User, AcademicYear
from school.models import Class


class Course(models.Model):
    """Course model for organizing course materials"""
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
    
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    year = models.IntegerField(choices=YEAR_CHOICES, help_text="Academic year (1-4)")
    semester = models.IntegerField(choices=SEMESTER_CHOICES, help_text="Semester (1-3)")
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, help_text="Academic year this course belongs to")
    target_classes = models.ManyToManyField(Class, blank=True, related_name='courses', help_text="Classes this course is designed for")
    credits = models.IntegerField(default=3, help_text="Number of credit hours")
    is_core = models.BooleanField(default=True, help_text="Whether this is a core course")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['academic_year', 'year', 'semester', 'code']
        unique_together = ['code', 'academic_year']

    def __str__(self):
        return f"{self.code} - {self.name} ({self.academic_year} Year {self.year}, Sem {self.semester})"
    
    @property
    def year_display(self):
        """Get human-readable year display"""
        return dict(self.YEAR_CHOICES)[self.year]
    
    @property
    def semester_display(self):
        """Get human-readable semester display"""
        return dict(self.SEMESTER_CHOICES)[self.semester]
    
    @classmethod
    def get_first_year_first_semester_courses(cls, academic_year=None):
        """Get all first year first semester courses for the given academic year"""
        if academic_year is None:
            academic_year = AcademicYear.get_current_academic_year()
        return cls.objects.filter(
            academic_year=academic_year,
            year=1,
            semester=1
        )
    
    @classmethod
    def get_courses_for_class(cls, student_class, academic_year=None):
        """Get all courses available for a specific class"""
        if academic_year is None:
            academic_year = AcademicYear.get_current_academic_year()
        
        # Get courses that are either:
        # 1. Specifically targeted to this class, OR
        # 2. First year first semester courses (for first-year students)
        if student_class.current_year_of_study == 1:
            # For first-year students, include all first-year first-semester courses
            return cls.objects.filter(
                academic_year=academic_year,
                year=1,
                semester=1
            ).distinct()
        else:
            # For other years, only include courses specifically targeted to their class
            return cls.objects.filter(
                academic_year=academic_year,
                target_classes=student_class
            ).distinct()
    
    @classmethod
    def get_courses_for_user(cls, user, academic_year=None):
        """Get all courses available for a specific user based on their class"""
        if not user.is_student or not user.student_class:
            return cls.objects.none()
        
        return cls.get_courses_for_class(user.student_class, academic_year)


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
    has_video_call = models.BooleanField(default=False, help_text="Whether this class has an associated video call")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['day', 'time']

    def __str__(self):
        return f"{self.day} - {self.subject} at {self.time}"
    
    def create_meeting_for_today(self, admin_host=None):
        """Create a meeting for this timetable entry for today"""
        from django.utils import timezone
        from datetime import datetime, timedelta
        import re
        
        # Get current date
        today = timezone.now().date()
        
        # Calculate the next occurrence of this day
        days_ahead = self.DAY_CHOICES.index((self.day.lower(), self.day.title())) - today.weekday()
        if days_ahead <= 0:  # Target day already happened this week
            days_ahead += 7
        
        next_class_date = today + timedelta(days=days_ahead)
        
        # Parse time string (e.g., "08:00 - 10:00" or "08:00")
        time_match = re.match(r'(\d{1,2}):(\d{2})(?:\s*-\s*(\d{1,2}):(\d{2}))?', self.time)
        if not time_match:
            return None
        
        start_hour, start_minute = int(time_match.group(1)), int(time_match.group(2))
        
        # Create scheduled time
        scheduled_time = datetime.combine(next_class_date, datetime.min.time().replace(
            hour=start_hour, minute=start_minute
        ))
        scheduled_time = timezone.make_aware(scheduled_time)
        
        # Generate unique meeting ID based on course and schedule
        meeting_id = f"{self.course.code.lower().replace(' ', '')}-{self.day.lower()}-{self.time.replace(':', '').replace(' ', '').replace('-', '')}"
        
        # Get admin host if not provided
        if not admin_host:
            admin_host = User.objects.filter(user_type='admin').first()
        
        if not admin_host:
            return None
        
        # Create or get existing meeting
        meeting, created = Meeting.objects.get_or_create(
            meeting_id=meeting_id,
            defaults={
                'title': f"{self.subject} - {self.day.title()} {self.time}",
                'description': f"Online class for {self.course.name}. Lecturer: {self.lecturer}",
                'platform': 'daily',
                'scheduled_time': scheduled_time,
                'course': self.course,
                'timetable_entry': self,
                'created_by': admin_host,
                'admin_host': admin_host,
                'is_auto_created': True,
                'is_recording_enabled': True,
                'max_participants': 50
            }
        )
        
        return meeting
    
    def get_or_create_meeting_for_today(self, admin_host=None):
        """Get existing meeting or create new one for today"""
        from django.utils import timezone
        from datetime import datetime, timedelta
        
        today = timezone.now().date()
        start_of_day = timezone.make_aware(datetime.combine(today, datetime.min.time()))
        end_of_day = start_of_day + timedelta(days=1)
        
        # First, try to get existing meeting for today
        existing_meeting = self.meetings.filter(
            scheduled_time__gte=start_of_day,
            scheduled_time__lt=end_of_day
        ).first()
        
        if existing_meeting:
            return existing_meeting
        
        # If no existing meeting, try to create one
        try:
            return self.create_meeting_for_today(admin_host)
        except Exception as e:
            # If creation fails (e.g., due to unique constraint), try to get existing meeting again
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Failed to create meeting for timetable entry {self.id}: {str(e)}")
            
            # Try to get the meeting that might have been created by another request
            existing_meeting = self.meetings.filter(
                scheduled_time__gte=start_of_day,
                scheduled_time__lt=end_of_day
            ).first()
            
            if existing_meeting:
                return existing_meeting
            
            # If still no meeting found, re-raise the original error
            raise


class CourseMaterial(models.Model):
    """Course material model"""
    MATERIAL_TYPE_CHOICES = [
        ('course_wide', 'Course Wide'),
        ('topic_wise', 'Topic Wise'),
        ('lesson_specific', 'Lesson Specific'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file_url = models.URLField(blank=True)
    file_type = models.CharField(max_length=50, blank=True)
    material_type = models.CharField(max_length=20, choices=MATERIAL_TYPE_CHOICES, default='course_wide')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='materials')
    timetable_entry = models.ForeignKey('TimetableEntry', on_delete=models.CASCADE, null=True, blank=True, related_name='materials')
    topic = models.CharField(max_length=200, blank=True, help_text="Topic name for topic-wise materials")
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Recording(models.Model):
    """Lecture recording model"""
    PLATFORM_CHOICES = [
        ('zoom', 'Zoom'),
        ('google_meet', 'Google Meet'),
        ('teams', 'Microsoft Teams'),
        ('physical', 'Physical Meeting'),
        ('other', 'Other'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    video_url = models.URLField(blank=True)
    duration = models.DurationField(blank=True, null=True)
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES, default='zoom')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='recordings')
    timetable_entry = models.ForeignKey('TimetableEntry', on_delete=models.CASCADE, null=True, blank=True, related_name='recordings')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Meeting(models.Model):
    """Online meeting model"""
    PLATFORM_CHOICES = [
        ('daily', 'Daily.co'),
        ('jitsi', 'Jitsi Meet'),
        ('zoom', 'Zoom'),
        ('google_meet', 'Google Meet'),
        ('teams', 'Microsoft Teams'),
        ('physical', 'Physical Meeting'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('live', 'Live'),
        ('ended', 'Ended'),
        ('cancelled', 'Cancelled'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    meeting_url = models.URLField(blank=True)
    meeting_id = models.CharField(max_length=100, unique=True, null=True, blank=True, help_text="Unique meeting identifier for Jitsi")
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES, default='daily')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    scheduled_time = models.DateTimeField()
    duration = models.DurationField(blank=True, null=True)
    is_recording_enabled = models.BooleanField(default=True, help_text="Whether recording is enabled for this meeting")
    recording_url = models.URLField(blank=True, help_text="URL to the recorded meeting")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='meetings')
    timetable_entry = models.ForeignKey('TimetableEntry', on_delete=models.CASCADE, null=True, blank=True, related_name='meetings')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    admin_host = models.ForeignKey(User, on_delete=models.CASCADE, related_name='hosted_meetings', null=True, blank=True, help_text="Admin user who will be the default host")
    is_auto_created = models.BooleanField(default=False, help_text="Whether this meeting was auto-created from a timetable entry")
    room_password = models.CharField(max_length=50, blank=True, help_text="Optional password for the meeting room")
    
    # Daily.co specific fields
    daily_room_name = models.CharField(max_length=100, blank=True, help_text="Daily.co room name")
    daily_room_id = models.CharField(max_length=100, blank=True, help_text="Daily.co room ID")
    daily_room_url = models.URLField(blank=True, help_text="Daily.co room URL")
    daily_token = models.TextField(blank=True, help_text="Daily.co meeting token")
    max_participants = models.IntegerField(default=50, help_text="Maximum number of participants")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-scheduled_time']

    def __str__(self):
        return f"{self.title} - {self.scheduled_time}"
    
    def save(self, *args, **kwargs):
        # Generate unique meeting ID if not provided (only for new instances)
        if not self.meeting_id:
            import uuid
            self.meeting_id = f"meet-{uuid.uuid4().hex[:12]}"
        
        # Set admin as host if not specified and this is a new instance
        if not self.admin_host and hasattr(self, '_state') and hasattr(self._state, 'adding') and self._state.adding:
            # Try to get the first admin user as default host
            admin_user = User.objects.filter(user_type='admin').first()
            if admin_user:
                self.admin_host = admin_user
        
        # Create Daily.co room if using Daily platform and room doesn't exist (only for new instances)
        if self.platform == 'daily' and not self.daily_room_name and hasattr(self, '_state') and hasattr(self._state, 'adding') and self._state.adding:
            self._create_daily_room()
        elif self.platform == 'jitsi' and not self.meeting_url:
            # Using Jitsi Meet public instance - in production, you might want to use your own instance
            self.meeting_url = f"https://meet.jit.si/{self.meeting_id}"
        
        super().save(*args, **kwargs)
    
    @property
    def can_join_now(self):
        """
        Check if meeting can be joined now based on schedule and status
        
        Users can join meetings as long as:
        1. The meeting status is 'live' or 'scheduled'
        2. The meeting is scheduled in the future (not past)
        
        This allows early access to video calls for preparation and testing.
        """
        from django.utils import timezone
        now = timezone.now()
        # Allow joining as long as the meeting is scheduled in the future
        # and the status allows joining
        time_diff = (self.scheduled_time - now).total_seconds()
        return (self.status in ['live', 'scheduled'] and 
                time_diff > 0)  # Meeting is in the future
    
    def _create_daily_room(self):
        """Create Daily.co room for this meeting"""
        try:
            from .daily_service import daily_service
            
            if not daily_service.is_api_configured():
                return  # Skip if Daily.co is not configured
            
            # Generate room name
            if self.timetable_entry:
                room_name = daily_service.generate_room_name(
                    self.course.code,
                    self.timetable_entry.day,
                    self.timetable_entry.time
                )
            else:
                room_name = f"meeting-{self.meeting_id}"
            
            # Create room
            room_properties = {
                'max_participants': self.max_participants,
                'enable_recording': 'cloud' if self.is_recording_enabled else False,
                'exp': self._get_expiration_timestamp()
            }
            
            room_data = daily_service.create_room(room_name, room_properties)
            
            # Store room information
            self.daily_room_name = room_data.get('name')
            self.daily_room_id = room_data.get('id')
            self.daily_room_url = room_data.get('url')
            
        except Exception as e:
            # Log error but don't fail the save
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to create Daily.co room: {str(e)}")
    
    def _get_expiration_timestamp(self):
        """Get expiration timestamp (24 hours from scheduled time)"""
        from datetime import timedelta
        if self.scheduled_time:
            return int((self.scheduled_time + timedelta(hours=24)).timestamp())
        return int((timezone.now() + timedelta(hours=24)).timestamp())
    
    @property
    def video_join_url(self):
        """Generate video join URL based on platform"""
        if self.platform == 'daily':
            return self.daily_room_url
        elif self.platform == 'jitsi':
            return self.jitsi_join_url
        else:
            return self.meeting_url
    
    @property
    def jitsi_join_url(self):
        """Generate Jitsi join URL with admin host configuration"""
        if self.platform != 'jitsi':
            return self.meeting_url
        
        base_url = f"https://meet.jit.si/{self.meeting_id}"
        params = []
        
        # Add admin host info if available
        if self.admin_host:
            params.append(f"userInfo.displayName={self.admin_host.get_full_name()}")
            params.append(f"userInfo.email={self.admin_host.email}")
        
        # Add room password if set
        if self.room_password:
            params.append(f"password={self.room_password}")
        
        if params:
            return f"{base_url}?{'&'.join(params)}"
        return base_url


class JitsiRecording(models.Model):
    """Model to track Jitsi recordings (for future Jibri integration)"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('recording', 'Recording'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name='recordings')
    recording_id = models.CharField(max_length=100, unique=True, help_text="Jitsi recording ID")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    recording_url = models.URLField(blank=True, help_text="URL to the completed recording")
    file_size = models.BigIntegerField(null=True, blank=True, help_text="Recording file size in bytes")
    duration = models.DurationField(null=True, blank=True, help_text="Actual recording duration")
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Recording {self.recording_id} - {self.meeting.title}"