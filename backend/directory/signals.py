from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User
from .extended_models import Student, Teacher
from datetime import date


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Automatically create Student or Teacher profile when User is created"""
    if created:
        if instance.user_type == 'student':
            # Extract student ID from registration number, make it unique
            if '/' in instance.registration_number:
                parts = instance.registration_number.split('/')
                student_id = f"{parts[0]}{parts[1]}"  # Combine prefix and middle part
            else:
                student_id = f"STU{instance.id:06d}"  # Fallback to user ID
            
            # Calculate expected graduation date
            if instance.class_of:
                expected_graduation = date(instance.class_of, 12, 31)
            else:
                # Default to 4 years from admission year
                reg_info = instance.registration_info
                if reg_info and reg_info.get('admission_year'):
                    admission_year = int(reg_info['admission_year'])
                    expected_graduation = date(admission_year + 4, 12, 31)
                else:
                    expected_graduation = date(date.today().year + 4, 12, 31)
            
            Student.objects.create(
                user=instance,
                student_id=student_id,
                enrollment_date=date.today(),
                expected_graduation=expected_graduation,
                is_full_time=True
            )
            
        elif instance.user_type == 'teacher':
            # Extract employee ID from registration number or use a default format
            employee_id = instance.registration_number.split('/')[1] if '/' in instance.registration_number else f"EMP{instance.id:06d}"
            
            Teacher.objects.create(
                user=instance,
                employee_id=employee_id,
                department="School of Law",  # Default for UoN Law focus
                position="Lecturer",  # Default position
                hire_date=date.today(),
                is_active=True
            )


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Save the associated profile when User is saved"""
    if hasattr(instance, 'student'):
        instance.student.save()
    elif hasattr(instance, 'teacher'):
        instance.teacher.save()

