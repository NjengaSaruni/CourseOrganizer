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
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['day', 'time']

    def __str__(self):
        return f"{self.day} - {self.subject} at {self.time}"


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