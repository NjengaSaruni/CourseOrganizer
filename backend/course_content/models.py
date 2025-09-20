from django.db import models
from django.conf import settings
from course_api.models import Course
from directory.models import AcademicYear, Semester


class BaseContentModel(models.Model):
    """Base model for all course content types"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='%(class)s_content')
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='%(class)s_content')
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE, related_name='%(class)s_content')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file_url = models.CharField(max_length=500, blank=True, help_text="Direct URL to the content")
    file_path = models.CharField(max_length=500, blank=True, help_text="Local file path")
    is_published = models.BooleanField(default=True)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='%(class)s_uploads')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.course.name} ({self.academic_year}/{self.academic_year + 1})"


class CourseOutline(BaseContentModel):
    """Model for course outline documents"""
    material_type = models.CharField(
        max_length=20,
        choices=[
            ('pdf', 'PDF Document'),
            ('doc', 'Word Document'),
            ('docx', 'Word Document (DOCX)'),
        ],
        default='pdf',
        help_text="Type of document"
    )
    
    class Meta:
        unique_together = ['course', 'academic_year', 'semester']
        verbose_name = "Course Outline"
        verbose_name_plural = "Course Outlines"


class PastPaper(BaseContentModel):
    """Model for past examination papers"""
    exam_type = models.CharField(
        max_length=50,
        choices=[
            ('midterm', 'Midterm Exam'),
            ('final', 'Final Exam'),
            ('quiz', 'Quiz'),
            ('assignment', 'Assignment'),
            ('other', 'Other'),
        ],
        default='final',
        help_text="Type of examination"
    )
    exam_date = models.DateField(blank=True, null=True, help_text="Date when the exam was conducted")
    
    class Meta:
        unique_together = ['course', 'academic_year', 'semester', 'title']
        verbose_name = "Past Paper"
        verbose_name_plural = "Past Papers"


class Recording(BaseContentModel):
    """Model for class recordings"""
    recording_platform = models.CharField(
        max_length=20,
        choices=[
            ('zoom', 'Zoom'),
            ('google_meet', 'Google Meet'),
            ('teams', 'Microsoft Teams'),
            ('physical', 'Physical Meeting'),
            ('other', 'Other'),
        ],
        help_text="Platform used for recording"
    )
    lesson_date = models.DateField(help_text="Date when the lesson was conducted")
    lesson_order = models.PositiveIntegerField(default=1, help_text="Order of this recording within the lesson")
    topic = models.CharField(max_length=200, blank=True, help_text="Topic or chapter name")
    duration = models.CharField(max_length=20, blank=True, help_text="Duration in minutes or HH:MM:SS format")
    audio_only = models.BooleanField(default=False, help_text="Whether this is an audio-only recording")
    
    class Meta:
        unique_together = ['course', 'lesson_date', 'lesson_order']
        ordering = ['lesson_date', 'lesson_order']
        verbose_name = "Recording"
        verbose_name_plural = "Recordings"


class Material(BaseContentModel):
    """Model for supplementary course materials"""
    material_type = models.CharField(
        max_length=20,
        choices=[
            ('pdf', 'PDF Document'),
            ('doc', 'Word Document'),
            ('ppt', 'PowerPoint'),
            ('video', 'Video File'),
            ('audio', 'Audio File'),
            ('image', 'Image'),
            ('link', 'External Link'),
            ('other', 'Other'),
        ],
        help_text="Type of material"
    )
    lesson_date = models.DateField(blank=True, null=True, help_text="Date when this material was used (optional)")
    lesson_order = models.PositiveIntegerField(default=0, help_text="Order within lesson (0 for general materials)")
    topic = models.CharField(max_length=200, blank=True, help_text="Topic or chapter name")
    
    class Meta:
        ordering = ['lesson_date', 'lesson_order', '-created_at']
        verbose_name = "Material"
        verbose_name_plural = "Materials"


class Assignment(BaseContentModel):
    """Model for assignments and homework"""
    assignment_type = models.CharField(
        max_length=20,
        choices=[
            ('homework', 'Homework'),
            ('project', 'Project'),
            ('essay', 'Essay'),
            ('presentation', 'Presentation'),
            ('lab', 'Lab Work'),
            ('other', 'Other'),
        ],
        default='homework',
        help_text="Type of assignment"
    )
    lesson_date = models.DateField(help_text="Date when the assignment was given")
    due_date = models.DateField(help_text="Due date for the assignment")
    lesson_order = models.PositiveIntegerField(default=1, help_text="Order of this assignment within the lesson")
    topic = models.CharField(max_length=200, blank=True, help_text="Topic or chapter name")
    max_marks = models.PositiveIntegerField(blank=True, null=True, help_text="Maximum marks for this assignment")
    instructions = models.TextField(blank=True, help_text="Detailed instructions for the assignment")
    
    class Meta:
        unique_together = ['course', 'lesson_date', 'lesson_order']
        ordering = ['lesson_date', 'lesson_order']
        verbose_name = "Assignment"
        verbose_name_plural = "Assignments"


class Announcement(BaseContentModel):
    """Model for course announcements"""
    announcement_type = models.CharField(
        max_length=20,
        choices=[
            ('general', 'General'),
            ('important', 'Important'),
            ('reminder', 'Reminder'),
            ('deadline', 'Deadline'),
            ('event', 'Event'),
            ('other', 'Other'),
        ],
        default='general',
        help_text="Type of announcement"
    )
    priority = models.CharField(
        max_length=10,
        choices=[
            ('low', 'Low'),
            ('medium', 'Medium'),
            ('high', 'High'),
            ('urgent', 'Urgent'),
        ],
        default='medium',
        help_text="Priority level"
    )
    expires_at = models.DateTimeField(blank=True, null=True, help_text="When this announcement expires")
    
    class Meta:
        ordering = ['-priority', '-created_at']
        verbose_name = "Announcement"
        verbose_name_plural = "Announcements"