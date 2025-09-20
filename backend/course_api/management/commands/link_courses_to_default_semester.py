from django.core.management.base import BaseCommand
from django.db import transaction
from directory.models import AcademicYear, Semester
from course_api.models import Course
from school.models import Class


class Command(BaseCommand):
    help = 'Link existing courses to the default academic year and semester'

    def handle(self, *args, **options):
        with transaction.atomic():
            # Get the default academic year and semester
            try:
                academic_year = AcademicYear.objects.get(is_active=True)
                semester = Semester.objects.get(is_active=True)
                
                self.stdout.write(
                    self.style.SUCCESS(f'Found active academic year: {academic_year}')
                )
                self.stdout.write(
                    self.style.SUCCESS(f'Found active semester: {semester}')
                )
            except AcademicYear.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR('No active academic year found. Please run setup_default_academic_data first.')
                )
                return
            except Semester.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR('No active semester found. Please run setup_default_academic_data first.')
                )
                return

            # Update all courses to use the default academic year and semester
            courses_updated = 0
            courses = Course.objects.all()
            
            for course in courses:
                course.academic_year = academic_year
                course.semester = semester.semester_type  # Map semester type to course semester
                course.save()
                courses_updated += 1
                
                self.stdout.write(
                    f'Updated course: {course.name} -> {academic_year} Semester {semester.semester_type}'
                )

            self.stdout.write(
                self.style.SUCCESS(f'Successfully updated {courses_updated} courses!')
            )

            # Also link the default class to courses if it exists
            try:
                default_class = Class.objects.first()  # Get the first class as default
                if default_class:
                    # Link all courses to the default class
                    for course in courses:
                        course.target_classes.add(default_class)
                    
                    self.stdout.write(
                        self.style.SUCCESS(f'Linked {courses_updated} courses to default class: {default_class.name}')
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING('No classes found in the database.')
                    )
            except Exception as e:
                self.stdout.write(
                    self.style.WARNING(f'Could not link courses to class: {e}')
                )
