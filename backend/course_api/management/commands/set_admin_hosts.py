from django.core.management.base import BaseCommand
from course_api.models import Meeting
from directory.models import User


class Command(BaseCommand):
    help = 'Set admin hosts for all meetings that don\'t have one'

    def handle(self, *args, **options):
        # Get the first admin user
        admin_user = User.objects.filter(user_type='admin').first()
        
        if not admin_user:
            self.stdout.write(
                self.style.ERROR('No admin user found. Please create an admin user first.')
            )
            return
        
        # Find meetings without admin hosts
        meetings_without_hosts = Meeting.objects.filter(admin_host__isnull=True)
        
        if not meetings_without_hosts.exists():
            self.stdout.write(
                self.style.SUCCESS('All meetings already have admin hosts.')
            )
            return
        
        # Update meetings to have admin host
        updated_count = meetings_without_hosts.update(admin_host=admin_user)
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully set admin host for {updated_count} meeting(s). '
                f'Admin: {admin_user.get_full_name()} ({admin_user.email})'
            )
        )
