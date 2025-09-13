from django.db import models
from django.core.exceptions import ValidationError
from directory.models import AcademicYear


class School(models.Model):
    """Model representing a school (e.g., School of Law, School of Medicine)"""
    
    name = models.CharField(max_length=200, help_text="Name of the school")
    code = models.CharField(max_length=20, unique=True, help_text="Short code for the school (e.g., 'LAW', 'MED')")
    description = models.TextField(blank=True, help_text="Description of the school")
    is_active = models.BooleanField(default=True, help_text="Whether this school is currently active")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    @property
    def total_students(self):
        """Get total number of students across all classes in this school"""
        total = 0
        for faculty in self.faculties.filter(is_active=True):
            for department in faculty.departments.filter(is_active=True):
                for class_obj in department.classes.filter(is_active=True):
                    total += class_obj.student_count
        return total


class Faculty(models.Model):
    """Model representing a faculty within a school (e.g., Faculty of Law)"""
    
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='faculties')
    name = models.CharField(max_length=200, help_text="Name of the faculty")
    code = models.CharField(max_length=20, help_text="Short code for the faculty")
    description = models.TextField(blank=True, help_text="Description of the faculty")
    dean = models.CharField(max_length=200, blank=True, help_text="Name of the faculty dean")
    is_active = models.BooleanField(default=True, help_text="Whether this faculty is currently active")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['school', 'code']
        ordering = ['school', 'name']
    
    def __str__(self):
        return f"{self.school.name} - {self.name}"
    
    @property
    def display_name(self):
        """Get formatted faculty name"""
        return f"{self.school.name} - {self.name}"


class Department(models.Model):
    """Model representing a department within a faculty (e.g., Department of Law)"""
    
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='departments')
    name = models.CharField(max_length=200, help_text="Name of the department")
    code = models.CharField(max_length=20, help_text="Short code for the department")
    description = models.TextField(blank=True, help_text="Description of the department")
    head = models.CharField(max_length=200, blank=True, help_text="Name of the department head")
    is_active = models.BooleanField(default=True, help_text="Whether this department is currently active")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['faculty', 'code']
        ordering = ['faculty', 'name']
    
    def __str__(self):
        return f"{self.faculty} - {self.name}"
    
    @property
    def display_name(self):
        """Get formatted department name"""
        return f"{self.faculty.display_name} - {self.name}"
    
    @property
    def school(self):
        """Get the school this department belongs to"""
        return self.faculty.school


class Class(models.Model):
    """Model representing a class within a department (e.g., Class of 2029)"""
    
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='classes')
    name = models.CharField(max_length=100, help_text="Class name (e.g., 'Class of 2029')")
    program = models.CharField(max_length=100, help_text="Program name (e.g., 'Bachelor of Laws (LLB)')")
    graduation_year = models.IntegerField(help_text="Expected graduation year")
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='school_classes', help_text="Academic year this class started")
    is_active = models.BooleanField(default=True, help_text="Whether this class is currently active")
    is_default = models.BooleanField(default=False, help_text="Whether this is the default class for new students")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['department', 'graduation_year']
        ordering = ['-graduation_year', 'program']
    
    def __str__(self):
        return f"{self.program} - {self.name}"
    
    @property
    def display_name(self):
        """Get formatted class name"""
        return f"{self.program} - {self.name}"
    
    @property
    def school(self):
        """Get the school this class belongs to"""
        return self.department.school
    
    @property
    def faculty(self):
        """Get the faculty this class belongs to"""
        return self.department.faculty
    
    @property
    def current_year_of_study(self):
        """Calculate current year of study based on academic year"""
        if not self.academic_year:
            return 1
        
        current_academic_year = AcademicYear.get_current_academic_year()
        if not current_academic_year:
            return 1
        
        years_elapsed = current_academic_year.year_start - self.academic_year.year_start
        return min(max(years_elapsed + 1, 1), 4)  # Clamp between 1 and 4
    
    @property
    def student_count(self):
        """Get number of students in this class"""
        return self.students.count()
    
    def clean(self):
        """Validate class data"""
        # Ensure only one default class per department
        if self.is_default:
            existing_default = Class.objects.filter(
                department=self.department,
                is_default=True
            ).exclude(pk=self.pk)
            if existing_default.exists():
                raise ValidationError("Only one class can be marked as default per department")
    
    @classmethod
    def get_default_class(cls):
        """Get the default class for new students"""
        return cls.objects.filter(is_default=True, is_active=True).first()
    
    @classmethod
    def get_or_create_default_class(cls, department, program, graduation_year, academic_year=None):
        """Get or create a default class for a specific department"""
        if academic_year is None:
            academic_year = AcademicYear.get_or_create_2025_2026()
        
        class_obj, created = cls.objects.get_or_create(
            department=department,
            graduation_year=graduation_year,
            defaults={
                'name': f'Class of {graduation_year}',
                'program': program,
                'academic_year': academic_year,
                'is_active': True,
                'is_default': True,
            }
        )
        return class_obj


class Program(models.Model):
    """Model representing academic programs offered by departments"""
    
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='programs')
    name = models.CharField(max_length=200, help_text="Full program name")
    code = models.CharField(max_length=20, help_text="Program code")
    degree_level = models.CharField(max_length=50, help_text="Degree level (e.g., 'Bachelor', 'Master', 'PhD')")
    duration_years = models.IntegerField(help_text="Program duration in years")
    description = models.TextField(blank=True, help_text="Program description")
    is_active = models.BooleanField(default=True, help_text="Whether this program is currently active")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['department', 'code']
        ordering = ['department', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.degree_level})"
    
    @property
    def display_name(self):
        """Get formatted program name"""
        return f"{self.degree_level} - {self.name}"