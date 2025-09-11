from django.core.management.base import BaseCommand
from course_api.models import Course


class Command(BaseCommand):
    help = 'Update existing courses with correct year and semester based on course codes'

    def handle(self, *args, **options):
        """Update existing courses with correct year and semester based on course codes"""
        
        # Define course code to year mapping
        course_year_mapping = {
            # Year 1 courses (GPR31xx)
            'GPR3101': 1, 'GPR3103': 1, 'GPR3105': 1, 'GPR3107': 1, 'GPR3109': 1, 'GPR3115': 1, 'GPR3117': 1,
            # Year 2 courses (GPR32xx)
            'GPR3201': 2, 'GPR3203': 2, 'GPR3205': 2, 'GPR3206': 2, 'GPR3207': 2, 'GPR3211': 2,
            # Year 3 courses (GPR33xx)
            'GPR3300': 3, 'GPR3301': 3, 'GPR3303': 3, 'GPR3305': 3, 'GPR3307': 3, 'GPR3309': 3, 'GPR3316': 3,
            # Year 4 courses (GPR34xx)
            'GPR3403': 4, 'GPR3411': 4, 'GPR3414': 4, 'GPR3415': 4, 'GPR3416': 4, 'GPR3420': 4, 'GPR3422': 4,
            'GPR3423': 4, 'GPR3424': 4, 'GPR3425': 4, 'GPR3427': 4, 'GPR3431': 4, 'GPR3432': 4, 'GPR3436': 4,
            'GPR3457': 4, 'GPR3458': 4, 'GPR3459': 4, 'GPR3460': 4, 'GPR3461': 4, 'GPR3462': 4, 'GPR3463': 4, 'GPR3468': 4
        }
        
        updated_count = 0
        
        for course_code, year in course_year_mapping.items():
            try:
                course = Course.objects.get(code=course_code)
                if course.year != year:
                    course.year = year
                    course.semester = 1  # All courses are first semester for now
                    course.save()
                    self.stdout.write(
                        self.style.SUCCESS(f'Updated {course_code} - {course.name} to Year {year}, Semester 1')
                    )
                    updated_count += 1
                else:
                    self.stdout.write(f'{course_code} - {course.name} already has correct year ({year})')
            except Course.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(f'Course {course_code} not found in database')
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'\nTotal courses updated: {updated_count}')
        )
        
        # Show summary by year
        self.stdout.write('\nSummary by year:')
        for year in [1, 2, 3, 4]:
            count = Course.objects.filter(year=year).count()
            self.stdout.write(f'Year {year}: {count} courses')
