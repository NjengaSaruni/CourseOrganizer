from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    ClassRepRole, Message, Announcement, MessageReaction, 
    MessageReadStatus, AnnouncementReadStatus, Poll, PollVote
)
from school.models import Class

User = get_user_model()


class ClassRepRoleSerializer(serializers.ModelSerializer):
    """Serializer for ClassRepRole model"""
    
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_registration_number = serializers.CharField(source='user.registration_number', read_only=True)
    student_class_name = serializers.CharField(source='student_class.display_name', read_only=True)
    assigned_by_name = serializers.CharField(source='assigned_by.get_full_name', read_only=True)
    permissions_display = serializers.SerializerMethodField()
    
    class Meta:
        model = ClassRepRole
        fields = [
            'id', 'user', 'user_name', 'user_registration_number',
            'student_class', 'student_class_name', 'permissions', 'permissions_display',
            'is_active', 'assigned_by', 'assigned_by_name',
            'assigned_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['assigned_at', 'created_at', 'updated_at']
    
    def get_permissions_display(self, obj):
        """Get human-readable permission names"""
        permission_labels = {
            'send_announcements': 'Send Announcements',
            'moderate_messages': 'Moderate Messages',
            'view_all_messages': 'View All Messages',
            'manage_polls': 'Manage Polls',
            'send_notifications': 'Send Notifications',
        }
        
        return [permission_labels.get(p, p) for p in obj.permissions]


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for Message model"""
    
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    sender_registration_number = serializers.CharField(source='sender.registration_number', read_only=True)
    recipient_name = serializers.CharField(source='recipient.get_full_name', read_only=True)
    student_class_name = serializers.CharField(source='student_class.display_name', read_only=True)
    reactions_count = serializers.SerializerMethodField()
    read_count = serializers.SerializerMethodField()
    is_read_by_user = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = [
            'id', 'sender', 'sender_name', 'sender_registration_number',
            'recipient', 'recipient_name', 'student_class', 'student_class_name',
            'message_type', 'content', 'is_private', 'is_announcement',
            'attachment', 'reactions_count', 'read_count', 'is_read_by_user',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_reactions_count(self, obj):
        """Get count of reactions for each type"""
        reactions = obj.reactions.all()
        counts = {}
        for reaction_type, _ in MessageReaction.REACTION_CHOICES:
            counts[reaction_type] = reactions.filter(reaction_type=reaction_type).count()
        return counts
    
    def get_read_count(self, obj):
        """Get number of users who have read this message"""
        return obj.read_status.count()
    
    def get_is_read_by_user(self, obj):
        """Check if the current user has read this message"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.read_status.filter(user=request.user).exists()
        return False
    
    def validate(self, data):
        """Validate message data"""
        # Ensure private messages have a recipient
        if data.get('is_private') and not data.get('recipient'):
            raise serializers.ValidationError("Private messages must have a recipient")
        
        # Ensure non-private messages don't have a recipient
        if not data.get('is_private') and data.get('recipient'):
            raise serializers.ValidationError("Class messages should not have a specific recipient")
        
        # Validate announcement permissions
        if data.get('is_announcement'):
            sender = data.get('sender') or self.context['request'].user
            student_class = data.get('student_class')
            
            try:
                class_rep = ClassRepRole.objects.get(
                    user=sender,
                    student_class=student_class,
                    is_active=True
                )
                if not class_rep.has_permission('send_announcements'):
                    raise serializers.ValidationError("User does not have permission to send announcements")
            except ClassRepRole.DoesNotExist:
                raise serializers.ValidationError("Only Class Representatives can send announcements")
        
        return data


class MessageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating messages"""
    
    class Meta:
        model = Message
        fields = [
            'recipient', 'student_class', 'message_type', 'content',
            'is_private', 'is_announcement', 'attachment'
        ]
    
    def create(self, validated_data):
        """Create a new message"""
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)


class AnnouncementSerializer(serializers.ModelSerializer):
    """Serializer for Announcement model"""
    
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    sender_registration_number = serializers.CharField(source='sender.registration_number', read_only=True)
    student_class_name = serializers.CharField(source='student_class.display_name', read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    is_read = serializers.SerializerMethodField()
    read_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Announcement
        fields = [
            'id', 'sender', 'sender_name', 'sender_registration_number',
            'student_class', 'student_class_name', 'title', 'content',
            'priority', 'is_pinned', 'expires_at', 'attachment',
            'is_expired', 'is_read', 'read_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_is_read(self, obj):
        """Check if the current user has read this announcement"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.is_read_by(request.user)
        return False
    
    def get_read_count(self, obj):
        """Get the number of users who have read this announcement"""
        return obj.read_status.count()
    
    def validate(self, data):
        """Validate announcement data"""
        sender = data.get('sender') or self.context['request'].user
        student_class = data.get('student_class')
        
        try:
            class_rep = ClassRepRole.objects.get(
                user=sender,
                student_class=student_class,
                is_active=True
            )
            if not class_rep.has_permission('send_announcements'):
                raise serializers.ValidationError("User does not have permission to send announcements")
        except ClassRepRole.DoesNotExist:
            raise serializers.ValidationError("Only Class Representatives can send announcements")
        
        return data


class AnnouncementCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating announcements"""
    
    class Meta:
        model = Announcement
        fields = [
            'student_class', 'title', 'content', 'priority',
            'is_pinned', 'expires_at', 'attachment'
        ]
    
    def create(self, validated_data):
        """Create a new announcement"""
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)


class MessageReactionSerializer(serializers.ModelSerializer):
    """Serializer for MessageReaction model"""
    
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    reaction_display = serializers.CharField(source='get_reaction_type_display', read_only=True)
    
    class Meta:
        model = MessageReaction
        fields = ['id', 'message', 'user', 'user_name', 'reaction_type', 'reaction_display', 'created_at']
        read_only_fields = ['created_at']
    
    def create(self, validated_data):
        """Create or update a reaction"""
        message = validated_data['message']
        user = validated_data['user']
        reaction_type = validated_data['reaction_type']
        
        # Update existing reaction or create new one
        reaction, created = MessageReaction.objects.update_or_create(
            message=message,
            user=user,
            defaults={'reaction_type': reaction_type}
        )
        
        return reaction


class MessageReadStatusSerializer(serializers.ModelSerializer):
    """Serializer for MessageReadStatus model"""
    
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = MessageReadStatus
        fields = ['id', 'message', 'user', 'user_name', 'read_at']
        read_only_fields = ['read_at']


class AnnouncementReadStatusSerializer(serializers.ModelSerializer):
    """Serializer for AnnouncementReadStatus model"""
    
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = AnnouncementReadStatus
        fields = ['id', 'announcement', 'user', 'user_name', 'read_at']
        read_only_fields = ['read_at']


class PollSerializer(serializers.ModelSerializer):
    """Serializer for Poll model"""
    
    creator_name = serializers.CharField(source='creator.get_full_name', read_only=True)
    student_class_name = serializers.CharField(source='student_class.display_name', read_only=True)
    total_votes = serializers.IntegerField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    user_vote = serializers.SerializerMethodField()
    
    class Meta:
        model = Poll
        fields = [
            'id', 'creator', 'creator_name', 'student_class', 'student_class_name',
            'title', 'description', 'options', 'is_anonymous', 'allow_multiple_choices',
            'status', 'expires_at', 'total_votes', 'is_expired', 'user_vote',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_user_vote(self, obj):
        """Get the current user's vote for this poll"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                vote = PollVote.objects.get(poll=obj, user=request.user)
                return PollVoteSerializer(vote).data
            except PollVote.DoesNotExist:
                return None
        return None
    
    def validate(self, data):
        """Validate poll data"""
        creator = data.get('creator') or self.context['request'].user
        student_class = data.get('student_class')
        
        try:
            class_rep = ClassRepRole.objects.get(
                user=creator,
                student_class=student_class,
                is_active=True
            )
            if not class_rep.has_permission('manage_polls'):
                raise serializers.ValidationError("User does not have permission to create polls")
        except ClassRepRole.DoesNotExist:
            raise serializers.ValidationError("Only Class Representatives can create polls")
        
        # Validate poll options
        options = data.get('options', [])
        if not options or len(options) < 2:
            raise serializers.ValidationError("Poll must have at least 2 options")
        
        return data


class PollCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating polls"""
    
    class Meta:
        model = Poll
        fields = [
            'student_class', 'title', 'description', 'options',
            'is_anonymous', 'allow_multiple_choices', 'expires_at'
        ]
    
    def create(self, validated_data):
        """Create a new poll"""
        validated_data['creator'] = self.context['request'].user
        return super().create(validated_data)


class PollVoteSerializer(serializers.ModelSerializer):
    """Serializer for PollVote model"""
    
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    selected_options_display = serializers.SerializerMethodField()
    
    class Meta:
        model = PollVote
        fields = ['id', 'poll', 'user', 'user_name', 'selected_options', 'selected_options_display', 'created_at']
        read_only_fields = ['created_at']
    
    def get_selected_options_display(self, obj):
        """Get human-readable selected options"""
        if not obj.selected_options:
            return []
        
        try:
            options = obj.poll.options
            return [options[i] for i in obj.selected_options if 0 <= i < len(options)]
        except:
            return []
    
    def validate(self, data):
        """Validate poll vote data"""
        poll = data['poll']
        selected_options = data['selected_options']
        
        # Check if poll is active
        if poll.status != 'active':
            raise serializers.ValidationError("Cannot vote on inactive poll")
        
        # Check if poll has expired
        if poll.is_expired:
            raise serializers.ValidationError("Cannot vote on expired poll")
        
        # Validate selected options
        if not selected_options:
            raise serializers.ValidationError("At least one option must be selected")
        
        # Check if multiple choices are allowed
        if not poll.allow_multiple_choices and len(selected_options) > 1:
            raise serializers.ValidationError("Multiple choices not allowed for this poll")
        
        # Validate option indices
        max_option_index = len(poll.options) - 1
        for option_index in selected_options:
            if not isinstance(option_index, int) or option_index < 0 or option_index > max_option_index:
                raise serializers.ValidationError(f"Invalid option index: {option_index}")
        
        return data
    
    def create(self, validated_data):
        """Create or update a poll vote"""
        poll = validated_data['poll']
        user = validated_data['user']
        selected_options = validated_data['selected_options']
        
        # Update existing vote or create new one
        vote, created = PollVote.objects.update_or_create(
            poll=poll,
            user=user,
            defaults={'selected_options': selected_options}
        )
        
        return vote


class ClassRepPermissionSerializer(serializers.Serializer):
    """Serializer for managing Class Rep permissions"""
    
    permissions = serializers.ListField(
        child=serializers.ChoiceField(choices=ClassRepRole.PERMISSION_CHOICES)
    )
    
    def validate_permissions(self, value):
        """Validate permission choices"""
        valid_permissions = [choice[0] for choice in ClassRepRole.PERMISSION_CHOICES]
        for permission in value:
            if permission not in valid_permissions:
                raise serializers.ValidationError(f"Invalid permission: {permission}")
        return value
