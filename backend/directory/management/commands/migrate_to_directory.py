from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from directory.models import User, AcademicYear
from directory.extended_models import Student, Teacher
from course_api.models import Course, TimetableEntry, CourseMaterial, Recording, Meeting
from datetime import date


class Command(BaseCommand):
    help = 'Migrate existing data to the new directory structure'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting migration to directory structure...'))
        
        with transaction.atomic():
            # Create academic year if it doesn't exist
            academic_year = AcademicYear.get_or_create_2025_2026()
            self.stdout.write(f'Academic year: {academic_year}')
            
            # Migrate existing users
            self.migrate_users(academic_year)
            
            # Update course references
            self.update_course_references()
            
        self.stdout.write(self.style.SUCCESS('Migration completed successfully!'))

    def migrate_users(self, academic_year):
        """Migrate existing users to the new User model"""
        self.stdout.write('Migrating users...')
        
        # Get all existing users from the old model
        try:
            from course_api.models import User as OldUser
            old_users = OldUser.objects.all()
            
            for old_user in old_users:
                # Create new user with enhanced fields
                new_user, created = User.objects.get_or_create(
                    email=old_user.email,
                    defaults={
                        'username': old_user.username,
                        'first_name': old_user.first_name,
                        'last_name': old_user.last_name,
                        'registration_number': old_user.registration_number,
                        'phone_number': getattr(old_user, 'phone_number', ''),
                        'user_type': 'student',  # Default to student
                        'status': old_user.status,
                        'academic_year': academic_year,
                        'current_year': old_user.current_year,
                        'current_semester': old_user.current_semester,
                        'class_of': old_user.class_of,
                        'is_active': old_user.is_active,
                        'is_staff': old_user.is_staff,
                        'is_superuser': old_user.is_superuser,
                        'date_joined': old_user.date_joined,
                        'last_login': old_user.last_login,
                    }
                )
                
                if created:
                    self.stdout.write(f'Created user: {new_user.email}')
                else:
                    self.stdout.write(f'User already exists: {new_user.email}')
                    
        except ImportError:
            self.stdout.write('No old User model found, skipping user migration')

    def update_course_references(self):
        """Update course references to use the new User model"""
        self.stdout.write('Updating course references...')
        
        # Update course materials
        materials_updated = 0
        for material in CourseMaterial.objects.all():
            if hasattr(material, 'uploaded_by'):
                try:
                    new_user = User.objects.get(email=material.uploaded_by.email)
                    material.uploaded_by = new_user
                    material.save()
                    materials_updated += 1
                except User.DoesNotExist:
                    self.stdout.write(f'Warning: User not found for material {material.title}')
        
        self.stdout.write(f'Updated {materials_updated} course materials')
        
        # Update recordings
        recordings_updated = 0
        for recording in Recording.objects.all():
            if hasattr(recording, 'uploaded_by'):
                try:
                    new_user = User.objects.get(email=recording.uploaded_by.email)
                    recording.uploaded_by = new_user
                    recording.save()
                    recordings_updated += 1
                except User.DoesNotExist:
                    self.stdout.write(f'Warning: User not found for recording {recording.title}')
        
        self.stdout.write(f'Updated {recordings_updated} recordings')
        
        # Update meetings
        meetings_updated = 0
        for meeting in Meeting.objects.all():
            if hasattr(meeting, 'created_by'):
                try:
                    new_user = User.objects.get(email=meeting.created_by.email)
                    meeting.created_by = new_user
                    meeting.save()
                    meetings_updated += 1
                except User.DoesNotExist:
                    self.stdout.write(f'Warning: User not found for meeting {meeting.title}')
        
        self.stdout.write(f'Updated {meetings_updated} meetings')

