from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.utils import timezone

User = get_user_model()


class ClassRepRole(models.Model):
    """Model to track Class Representative roles and their permissions"""
    
    PERMISSION_CHOICES = [
        ('send_announcements', 'Send Announcements'),
        ('moderate_messages', 'Moderate Messages'),
        ('view_all_messages', 'View All Messages'),
        ('manage_polls', 'Manage Polls'),
        ('send_notifications', 'Send Notifications'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='class_rep_role')
    student_class = models.ForeignKey('school.Class', on_delete=models.CASCADE, related_name='class_reps')
    permissions = models.JSONField(default=list, help_text="List of permissions granted to this Class Rep")
    is_active = models.BooleanField(default=True)
    assigned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_class_reps')
    assigned_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'student_class']
        ordering = ['-assigned_at']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.student_class.display_name} Class Rep"
    
    def clean(self):
        # Ensure the user is a student
        if not self.user.is_student:
            raise ValidationError("Only students can be assigned as Class Representatives")
        
        # Ensure the user belongs to the class
        if self.user.student_class != self.student_class:
            raise ValidationError("User must belong to the class they are representing")
    
    def has_permission(self, permission):
        """Check if the Class Rep has a specific permission"""
        return permission in self.permissions
    
    def add_permission(self, permission):
        """Add a permission to the Class Rep"""
        if permission not in self.permissions:
            self.permissions.append(permission)
            self.save()
    
    def remove_permission(self, permission):
        """Remove a permission from the Class Rep"""
        if permission in self.permissions:
            self.permissions.remove(permission)
            self.save()


class Message(models.Model):
    """Model for general messages between classmates"""
    
    MESSAGE_TYPE_CHOICES = [
        ('text', 'Text Message'),
        ('image', 'Image Message'),
        ('file', 'File Message'),
        ('poll', 'Poll'),
    ]
    
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages', null=True, blank=True)
    student_class = models.ForeignKey('school.Class', on_delete=models.CASCADE, related_name='class_messages')
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPE_CHOICES, default='text')
    content = models.TextField()
    is_private = models.BooleanField(default=False, help_text="True for direct messages, False for class messages")
    is_announcement = models.BooleanField(default=False, help_text="True for announcements from Class Reps")
    attachment = models.FileField(upload_to='message_attachments/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        if self.is_private:
            return f"Private message from {self.sender.get_full_name()} to {self.recipient.get_full_name()}"
        elif self.is_announcement:
            return f"Announcement by {self.sender.get_full_name()} to {self.student_class.display_name}"
        else:
            return f"Message by {self.sender.get_full_name()} to {self.student_class.display_name}"
    
    def clean(self):
        # Ensure private messages have a recipient
        if self.is_private and not self.recipient:
            raise ValidationError("Private messages must have a recipient")
        
        # Ensure non-private messages don't have a recipient
        if not self.is_private and self.recipient:
            raise ValidationError("Class messages should not have a specific recipient")
        
        # Ensure announcements can only be sent by Class Reps
        if self.is_announcement:
            try:
                class_rep = ClassRepRole.objects.get(
                    user=self.sender,
                    student_class=self.student_class,
                    is_active=True
                )
                if not class_rep.has_permission('send_announcements'):
                    raise ValidationError("User does not have permission to send announcements")
            except ClassRepRole.DoesNotExist:
                raise ValidationError("Only Class Representatives can send announcements")
        
        # Ensure sender belongs to the class
        if self.sender.student_class != self.student_class:
            raise ValidationError("Sender must belong to the class they are messaging")


class Announcement(models.Model):
    """Model for official announcements from Class Representatives"""
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('normal', 'Normal'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_announcements')
    student_class = models.ForeignKey('school.Class', on_delete=models.CASCADE, related_name='announcements')
    title = models.CharField(max_length=200)
    content = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normal')
    is_pinned = models.BooleanField(default=False, help_text="Pin this announcement to the top")
    expires_at = models.DateTimeField(null=True, blank=True, help_text="When this announcement expires")
    attachment = models.FileField(upload_to='announcement_attachments/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_pinned', '-priority', '-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.student_class.display_name}"
    
    def clean(self):
        # Ensure only Class Reps can send announcements
        try:
            class_rep = ClassRepRole.objects.get(
                user=self.sender,
                student_class=self.student_class,
                is_active=True
            )
            if not class_rep.has_permission('send_announcements'):
                raise ValidationError("User does not have permission to send announcements")
        except ClassRepRole.DoesNotExist:
            raise ValidationError("Only Class Representatives can send announcements")
        
        # Ensure sender belongs to the class
        if self.sender.student_class != self.student_class:
            raise ValidationError("Sender must belong to the class they are announcing to")
    
    @property
    def is_expired(self):
        """Check if the announcement has expired"""
        if not self.expires_at:
            return False
        return timezone.now() > self.expires_at
    
    def is_read_by(self, user):
        """Check if the announcement has been read by a specific user"""
        return self.read_status.filter(user=user).exists()
    
    def mark_as_read_by(self, user):
        """Mark the announcement as read by a specific user"""
        AnnouncementReadStatus.objects.get_or_create(
            announcement=self,
            user=user
        )


class MessageReaction(models.Model):
    """Model for reactions to messages"""
    
    REACTION_CHOICES = [
        ('like', '👍'),
        ('love', '❤️'),
        ('laugh', '😂'),
        ('wow', '😮'),
        ('sad', '😢'),
        ('angry', '😠'),
    ]
    
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='message_reactions')
    reaction_type = models.CharField(max_length=10, choices=REACTION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['message', 'user']
    
    def __str__(self):
        return f"{self.user.get_full_name()} {dict(self.REACTION_CHOICES)[self.reaction_type]} on message"


class MessageReadStatus(models.Model):
    """Model to track read status of messages"""
    
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='read_status')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='message_read_status')
    read_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['message', 'user']
    
    def __str__(self):
        return f"{self.user.get_full_name()} read message at {self.read_at}"


class AnnouncementReadStatus(models.Model):
    """Model to track read status of announcements"""
    
    announcement = models.ForeignKey(Announcement, on_delete=models.CASCADE, related_name='read_status')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='announcement_read_status')
    read_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['announcement', 'user']
    
    def __str__(self):
        return f"{self.user.get_full_name()} read announcement at {self.read_at}"


class Poll(models.Model):
    """Model for polls created by Class Representatives"""
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('closed', 'Closed'),
    ]
    
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_polls')
    student_class = models.ForeignKey('school.Class', on_delete=models.CASCADE, related_name='polls')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    options = models.JSONField(default=list, help_text="List of poll options")
    is_anonymous = models.BooleanField(default=True)
    allow_multiple_choices = models.BooleanField(default=False)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.student_class.display_name}"
    
    def clean(self):
        # Ensure only Class Reps can create polls
        try:
            class_rep = ClassRepRole.objects.get(
                user=self.creator,
                student_class=self.student_class,
                is_active=True
            )
            if not class_rep.has_permission('manage_polls'):
                raise ValidationError("User does not have permission to create polls")
        except ClassRepRole.DoesNotExist:
            raise ValidationError("Only Class Representatives can create polls")
        
        # Ensure creator belongs to the class
        if self.creator.student_class != self.student_class:
            raise ValidationError("Creator must belong to the class they are creating polls for")
        
        # Validate poll options
        if not self.options or len(self.options) < 2:
            raise ValidationError("Poll must have at least 2 options")
    
    @property
    def is_expired(self):
        """Check if the poll has expired"""
        if not self.expires_at:
            return False
        return timezone.now() > self.expires_at
    
    @property
    def total_votes(self):
        """Get total number of votes cast"""
        return PollVote.objects.filter(poll=self).count()


class PollVote(models.Model):
    """Model for individual poll votes"""
    
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE, related_name='votes')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='poll_votes')
    selected_options = models.JSONField(default=list, help_text="List of selected option indices")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['poll', 'user']
    
    def __str__(self):
        return f"{self.user.get_full_name()} voted in {self.poll.title}"
    
    def clean(self):
        # Validate selected options
        if not self.selected_options:
            raise ValidationError("At least one option must be selected")
        
        # Check if multiple choices are allowed
        if not self.poll.allow_multiple_choices and len(self.selected_options) > 1:
            raise ValidationError("Multiple choices not allowed for this poll")
        
        # Validate option indices
        max_option_index = len(self.poll.options) - 1
        for option_index in self.selected_options:
            if not isinstance(option_index, int) or option_index < 0 or option_index > max_option_index:
                raise ValidationError(f"Invalid option index: {option_index}")
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)