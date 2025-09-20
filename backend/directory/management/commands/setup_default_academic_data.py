from django.core.management.base import BaseCommand
from django.db import transaction
from directory.models import AcademicYear, Semester, User
from course_api.models import Course
from datetime import date


class Command(BaseCommand):
    help = 'Set up default academic year (2025/26) and semester (Semester 1)'

    def handle(self, *args, **options):
        with transaction.atomic():
            # Create or get the default academic year
            academic_year, created = AcademicYear.objects.get_or_create(
                year_start=2025,
                year_end=2026,
                defaults={
                    'is_active': True
                }
            )
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Created academic year: {academic_year}')
                )
            else:
                # Make sure it's active
                academic_year.is_active = True
                academic_year.save()
                self.stdout.write(
                    self.style.SUCCESS(f'Updated academic year: {academic_year}')
                )

            # Create or get Semester 1 for this academic year
            semester, created = Semester.objects.get_or_create(
                academic_year=academic_year,
                semester_type=1,  # First Semester
                defaults={
                    'start_date': date(2025, 1, 1),
                    'end_date': date(2025, 6, 30),
                    'is_active': True
                }
            )
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Created semester: {semester}')
                )
            else:
                # Make sure it's active
                semester.is_active = True
                semester.save()
                self.stdout.write(
                    self.style.SUCCESS(f'Updated semester: {semester}')
                )

            # Deactivate other academic years and semesters
            AcademicYear.objects.exclude(id=academic_year.id).update(is_active=False)
            Semester.objects.exclude(id=semester.id).update(is_active=False)

            self.stdout.write(
                self.style.SUCCESS('Successfully set up default academic data!')
            )
            self.stdout.write(
                self.style.SUCCESS(f'Active Academic Year: {academic_year}')
            )
            self.stdout.write(
                self.style.SUCCESS(f'Active Semester: {semester}')
            )
