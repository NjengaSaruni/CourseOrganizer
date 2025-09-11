from django.core.management.base import BaseCommand
from course_api.models import AcademicYear, Course, User
from datetime import date


class Command(BaseCommand):
    help = 'Set up the 2025/2026 academic year and update existing data'

    def handle(self, *args, **options):
        """Set up academic year structure and update existing data"""
        
        # Create or get the 2025/2026 academic year
        academic_year = AcademicYear.get_or_create_2025_2026()
        
        if academic_year:
            self.stdout.write(
                self.style.SUCCESS(f'Academic year {academic_year} is ready')
            )
        else:
            self.stdout.write(
                self.style.ERROR('Failed to create academic year')
            )
            return
        
        # Update existing courses to use the new academic year
        courses_updated = 0
        courses_without_academic_year = Course.objects.filter(academic_year__isnull=True)
        
        for course in courses_without_academic_year:
            course.academic_year = academic_year
            course.save()
            courses_updated += 1
            self.stdout.write(f'Updated course: {course.code} - {course.name}')
        
        self.stdout.write(
            self.style.SUCCESS(f'Updated {courses_updated} courses with academic year')
        )
        
        # Update existing users to use the new academic year
        users_updated = 0
        users_without_academic_year = User.objects.filter(academic_year__isnull=True)
        
        for user in users_without_academic_year:
            user.academic_year = academic_year
            user.save()
            users_updated += 1
            self.stdout.write(f'Updated user: {user.registration_number}')
        
        self.stdout.write(
            self.style.SUCCESS(f'Updated {users_updated} users with academic year')
        )
        
        # Show summary
        self.stdout.write('\n=== ACADEMIC YEAR SETUP SUMMARY ===')
        self.stdout.write(f'Academic Year: {academic_year}')
        self.stdout.write(f'First Semester: {academic_year.first_semester_start} to {academic_year.first_semester_end}')
        self.stdout.write(f'Second Semester: {academic_year.second_semester_start} to {academic_year.second_semester_end}')
        
        # Show first year first semester courses
        first_year_courses = Course.get_first_year_first_semester_courses(academic_year)
        self.stdout.write(f'\nFirst Year First Semester Courses: {first_year_courses.count()}')
        for course in first_year_courses:
            self.stdout.write(f'  - {course.code}: {course.name}')
        
        # Show user statistics
        total_users = User.objects.filter(academic_year=academic_year).count()
        first_year_users = User.objects.filter(
            academic_year=academic_year,
            current_year=1,
            current_semester=1
        ).count()
        
        self.stdout.write(f'\nUser Statistics:')
        self.stdout.write(f'  Total users in {academic_year}: {total_users}')
        self.stdout.write(f'  First Year First Semester users: {first_year_users}')
        
        self.stdout.write(
            self.style.SUCCESS('\nAcademic year setup completed successfully!')
        )
