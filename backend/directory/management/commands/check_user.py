from django.core.management.base import BaseCommand
from directory.models import User
from communication.models import ClassRepRole

class Command(BaseCommand):
    help = 'Check user data and class rep role'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Email address to check')

    def handle(self, *args, **options):
        email = options['email']
        
        try:
            user = User.objects.get(email=email)
            self.stdout.write(f"User found: {user.email}")
            self.stdout.write(f"  Full name: {user.get_full_name()}")
            self.stdout.write(f"  User type: {user.user_type}")
            self.stdout.write(f"  Status: {user.status}")
            self.stdout.write(f"  Is admin: {user.is_admin}")
            self.stdout.write(f"  Registration number: {user.registration_number}")
            self.stdout.write(f"  Student class: {user.student_class}")
            
            # Check if user has class rep role
            try:
                class_rep_role = ClassRepRole.objects.get(user=user)
                self.stdout.write(f"  Class rep role: {class_rep_role}")
                self.stdout.write(f"    Is active: {class_rep_role.is_active}")
                self.stdout.write(f"    Permissions: {class_rep_role.permissions}")
                self.stdout.write(f"    Student class: {class_rep_role.student_class}")
            except ClassRepRole.DoesNotExist:
                self.stdout.write(f"  Class rep role: None")
                
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"User with email {email} not found"))
