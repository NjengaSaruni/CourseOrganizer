from django.core.management.base import BaseCommand
from django.db import transaction
from directory.models import Semester
from datetime import date


class Command(BaseCommand):
    help = 'Update Semester 1 dates to September 1 - December 13, 2025'

    def handle(self, *args, **options):
        with transaction.atomic():
            # Update the active semester dates
            try:
                semester = Semester.objects.get(is_active=True)
                
                # Update dates
                semester.start_date = date(2025, 9, 1)  # September 1, 2025
                semester.end_date = date(2025, 12, 13)  # December 13, 2025
                semester.save()
                
                self.stdout.write(
                    self.style.SUCCESS(f'Updated semester dates: {semester}')
                )
                self.stdout.write(
                    self.style.SUCCESS(f'Start Date: {semester.start_date}')
                )
                self.stdout.write(
                    self.style.SUCCESS(f'End Date: {semester.end_date}')
                )
                
                # Calculate and display semester progress
                today = date.today()
                total_days = (semester.end_date - semester.start_date).days
                
                if today < semester.start_date:
                    progress = 0
                    status = "Not Started"
                elif today > semester.end_date:
                    progress = 100
                    status = "Completed"
                else:
                    days_elapsed = (today - semester.start_date).days
                    progress = (days_elapsed / total_days) * 100
                    status = "In Progress"
                
                self.stdout.write(
                    self.style.SUCCESS(f'Semester Progress: {progress:.1f}% ({status})')
                )
                self.stdout.write(
                    self.style.SUCCESS(f'Total Days: {total_days}')
                )
                self.stdout.write(
                    self.style.SUCCESS(f'Days Elapsed: {(today - semester.start_date).days if today >= semester.start_date else 0}')
                )
                
            except Semester.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR('No active semester found. Please run setup_default_academic_data first.')
                )
