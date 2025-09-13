from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import ClassRepRole, Message, Announcement

User = get_user_model()


@receiver(post_save, sender=ClassRepRole)
def class_rep_role_created(sender, instance, created, **kwargs):
    """Signal handler for when a Class Rep role is created or updated"""
    if created:
        # Log the creation of a new Class Rep role
        print(f"New Class Rep role created: {instance.user.get_full_name()} for {instance.student_class.display_name}")
        
        # You can add additional logic here, such as:
        # - Send notification to the user
        # - Create welcome message
        # - Update user permissions
        pass


@receiver(pre_save, sender=Message)
def validate_message_permissions(sender, instance, **kwargs):
    """Validate message permissions before saving"""
    # This validation is also done in the model's clean() method
    # but signals provide an additional layer of validation
    
    if instance.is_announcement:
        try:
            class_rep = ClassRepRole.objects.get(
                user=instance.sender,
                student_class=instance.student_class,
                is_active=True
            )
            if 'send_announcements' not in class_rep.permissions:
                raise ValueError("User does not have permission to send announcements")
        except ClassRepRole.DoesNotExist:
            raise ValueError("Only Class Representatives can send announcements")


@receiver(pre_save, sender=Announcement)
def validate_announcement_permissions(sender, instance, **kwargs):
    """Validate announcement permissions before saving"""
    try:
        class_rep = ClassRepRole.objects.get(
            user=instance.sender,
            student_class=instance.student_class,
            is_active=True
        )
        if 'send_announcements' not in class_rep.permissions:
            raise ValueError("User does not have permission to send announcements")
    except ClassRepRole.DoesNotExist:
        raise ValueError("Only Class Representatives can send announcements")


@receiver(post_save, sender=Message)
def message_created(sender, instance, created, **kwargs):
    """Signal handler for when a message is created"""
    if created:
        # Log message creation
        message_type = "announcement" if instance.is_announcement else "private" if instance.is_private else "class"
        print(f"New {message_type} message created by {instance.sender.get_full_name()}")
        
        # You can add additional logic here, such as:
        # - Send push notifications
        # - Update activity feeds
        # - Trigger email notifications for important messages
        pass


@receiver(post_save, sender=Announcement)
def announcement_created(sender, instance, created, **kwargs):
    """Signal handler for when an announcement is created"""
    if created:
        # Log announcement creation
        print(f"New announcement created: '{instance.title}' by {instance.sender.get_full_name()}")
        
        # You can add additional logic here, such as:
        # - Send push notifications to all class members
        # - Send email notifications for high priority announcements
        # - Update activity feeds
        pass
