from rest_framework import serializers
from django.contrib.auth import authenticate
from directory.models import User
from .models import Course, TimetableEntry, CourseMaterial, Recording, Meeting, JitsiRecording, CourseContent, StudyGroup, StudyGroupMembership, GroupMeeting, StudyGroupJoinRequest, GroupMessage


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'registration_number', 'phone_number', 'password', 'confirm_password')
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords don't match")
        # Enforce UoN student email domain
        email = attrs.get('email', '')
        allowed_domain = '@students.uonbi.ac.ke'
        if not isinstance(email, str) or not email.lower().endswith(allowed_domain):
            raise serializers.ValidationError({
                'email': f'Please use your official school email ending with {allowed_domain}'
            })
        return attrs

    def validate_registration_number(self, value):
        """Validate registration number format"""
        import re
        pattern = r'^[A-Z]{1,4}\d{0,2}/\d{1,6}/\d{4}$'
        if not re.match(pattern, value):
            raise serializers.ValidationError('Registration number must be in format: PREFIX/XXXXXX/YYYY (e.g., GPR3/123456/2025, P15/1674/2014)')
        return value

    def create(self, validated_data):
        import logging
        logger = logging.getLogger(__name__)
        
        validated_data.pop('confirm_password')
        logger.info(f"Creating user with email: {validated_data['email']}")
        
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            registration_number=validated_data['registration_number'],
            phone_number=validated_data['phone_number'],
            password=validated_data['password'],
            is_active=False,  # User needs approval
            email_verified=False  # User needs email verification
        )
        
        logger.info(f"User created with ID: {user.id}")
        
        # Generate and send email verification token
        try:
            verification_token = user.generate_email_verification_token()
            user.save()
            logger.info(f"Generated verification token: {verification_token[:20]}...")
            
            # Send verification email
            from .email_service import send_verification_email
            logger.info(f"Attempting to send verification email to {user.email}")
            email_sent = send_verification_email(user, verification_token)
            logger.info(f"Verification email send result: {email_sent}")
            
        except Exception as e:
            logger.error(f"Error during email verification setup: {str(e)}")
            logger.error(f"Exception type: {type(e).__name__}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
        
        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user details"""
    full_name = serializers.SerializerMethodField()
    is_admin = serializers.ReadOnlyField()
    class_display_name = serializers.ReadOnlyField()
    last_login_formatted = serializers.SerializerMethodField()
    date_joined_formatted = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'full_name', 'registration_number', 
                 'phone_number', 'status', 'is_admin', 'date_joined', 'last_login', 
                 'class_display_name', 'last_login_formatted', 'date_joined_formatted')
        read_only_fields = ('id', 'date_joined', 'status', 'last_login')

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    
    def get_last_login_formatted(self, obj):
        if obj.last_login:
            import pytz
            from django.utils import timezone
            
            # Convert UTC time to East Africa Time (EAT)
            eat_tz = pytz.timezone('Africa/Nairobi')
            local_time = obj.last_login.astimezone(eat_tz)
            return local_time.strftime('%Y-%m-%d %H:%M:%S EAT')
        return 'Never logged in'
    
    def get_date_joined_formatted(self, obj):
        if obj.date_joined:
            import pytz
            from django.utils import timezone
            
            # Convert UTC time to East Africa Time (EAT)
            eat_tz = pytz.timezone('Africa/Nairobi')
            local_time = obj.date_joined.astimezone(eat_tz)
            return local_time.strftime('%Y-%m-%d %H:%M:%S EAT')
        return 'Unknown'


class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid email or password')
            
            # Check if user can login (email verified and approved)
            if not user.can_login():
                if not user.email_verified:
                    raise serializers.ValidationError('Please verify your email address before logging in. Check your email for the verification link.')
                elif user.status == 'pending':
                    raise serializers.ValidationError('Your registration is pending approval. Please wait for administrator approval.')
                elif user.status == 'rejected':
                    raise serializers.ValidationError('Your registration has been rejected. Please contact support.')
                elif not user.is_active:
                    raise serializers.ValidationError('Your account is not active. Please contact support.')
            
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include email and password')
        return attrs


class CourseSerializer(serializers.ModelSerializer):
    """Serializer for courses"""
    class Meta:
        model = Course
        fields = '__all__'


class TimetableEntrySerializer(serializers.ModelSerializer):
    """Serializer for timetable entries"""
    has_meeting = serializers.SerializerMethodField()
    meeting_id = serializers.SerializerMethodField()
    can_join_meeting = serializers.SerializerMethodField()
    
    class Meta:
        model = TimetableEntry
        fields = '__all__'
    
    def get_has_meeting(self, obj):
        """Check if this timetable entry has an associated meeting"""
        return obj.meetings.exists()
    
    def get_meeting_id(self, obj):
        """Get the meeting ID for this timetable entry if exists"""
        meeting = obj.meetings.first()
        return meeting.id if meeting else None
    
    def get_can_join_meeting(self, obj):
        """Check if user can join the meeting for this timetable entry"""
        meeting = obj.meetings.first()
        if meeting:
            return meeting.can_join_now
        return False


class CourseMaterialSerializer(serializers.ModelSerializer):
    """Serializer for course materials"""
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    timetable_entry_display = serializers.SerializerMethodField()

    class Meta:
        model = CourseMaterial
        fields = '__all__'

    def get_timetable_entry_display(self, obj):
        if obj.timetable_entry:
            return f"{obj.timetable_entry.day.title()} - {obj.timetable_entry.time}"
        return None


class RecordingSerializer(serializers.ModelSerializer):
    """Serializer for recordings"""
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    timetable_entry_display = serializers.SerializerMethodField()

    class Meta:
        model = Recording
        fields = '__all__'

    def get_timetable_entry_display(self, obj):
        if obj.timetable_entry:
            return f"{obj.timetable_entry.day.title()} - {obj.timetable_entry.time}"
        return None


class JitsiRecordingSerializer(serializers.ModelSerializer):
    """Serializer for Jitsi recordings"""
    class Meta:
        model = JitsiRecording
        fields = '__all__'


class MeetingSerializer(serializers.ModelSerializer):
    """Serializer for meetings"""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    admin_host_name = serializers.CharField(source='admin_host.get_full_name', read_only=True)
    platform_display = serializers.CharField(source='get_platform_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_live = serializers.SerializerMethodField()
    can_join = serializers.SerializerMethodField()
    video_join_url = serializers.CharField(read_only=True)
    jitsi_join_url = serializers.CharField(read_only=True)
    recordings = JitsiRecordingSerializer(many=True, read_only=True)

    class Meta:
        model = Meeting
        fields = '__all__'

    def get_is_live(self, obj):
        """Check if meeting is currently live"""
        from django.utils import timezone
        now = timezone.now()
        return obj.status == 'live' or (obj.scheduled_time <= now and obj.status == 'scheduled')

    def get_can_join(self, obj):
        """Check if user can join the meeting"""
        return obj.can_join_now


class TimetableEntryWithRecordingsSerializer(serializers.ModelSerializer):
    """Serializer for timetable entries with their recordings"""
    recordings = RecordingSerializer(many=True, read_only=True)
    materials = CourseMaterialSerializer(many=True, read_only=True)
    has_recording = serializers.SerializerMethodField()
    has_materials = serializers.SerializerMethodField()

    class Meta:
        model = TimetableEntry
        fields = '__all__'

    def get_has_recording(self, obj):
        return obj.recordings.exists()

    def get_has_materials(self, obj):
        return obj.materials.exists()


class CourseContentSerializer(serializers.ModelSerializer):
    """Serializer for course content (unified recordings and materials)"""
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    content_type_display = serializers.CharField(source='get_content_type_display', read_only=True)
    recording_platform_display = serializers.CharField(source='get_recording_platform_display', read_only=True)
    material_type_display = serializers.CharField(source='get_material_type_display', read_only=True)
    file_extension = serializers.CharField(read_only=True)
    is_audio_recording = serializers.BooleanField(read_only=True)
    is_video_recording = serializers.BooleanField(read_only=True)
    duration_display = serializers.SerializerMethodField()
    file_size_display = serializers.SerializerMethodField()
    lesson_date_display = serializers.SerializerMethodField()

    class Meta:
        model = CourseContent
        fields = '__all__'
        read_only_fields = ('view_count', 'download_count', 'created_at', 'updated_at')

    def get_duration_display(self, obj):
        """Format duration for display"""
        if obj.duration:
            total_seconds = int(obj.duration.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            seconds = total_seconds % 60
            
            if hours > 0:
                return f"{hours}h {minutes}m {seconds}s"
            elif minutes > 0:
                return f"{minutes}m {seconds}s"
            else:
                return f"{seconds}s"
        return None

    def get_file_size_display(self, obj):
        """Format file size for display"""
        if obj.file_size:
            size = obj.file_size
            for unit in ['B', 'KB', 'MB', 'GB']:
                if size < 1024.0:
                    return f"{size:.1f} {unit}"
                size /= 1024.0
            return f"{size:.1f} TB"
        return None

    def get_lesson_date_display(self, obj):
        """Format lesson date for display"""
        if obj.lesson_date:
            return obj.lesson_date.strftime('%B %d, %Y')
        return None


class CourseContentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating course content"""
    
    class Meta:
        model = CourseContent
        fields = [
            'title', 'description', 'content_type', 'course', 'timetable_entry',
            'lesson_date', 'lesson_order', 'topic', 'file_url', 'file_path',
            'recording_platform', 'duration', 'audio_only', 'material_type',
            'is_published'
        ]

    def validate(self, attrs):
        """Validate the content based on type"""
        content_type = attrs.get('content_type')
        
        if content_type == 'recording':
            # For recordings, require recording_platform
            if not attrs.get('recording_platform'):
                raise serializers.ValidationError({
                    'recording_platform': 'Recording platform is required for recording content type.'
                })
        elif content_type == 'material':
            # For materials, require material_type
            if not attrs.get('material_type'):
                raise serializers.ValidationError({
                    'material_type': 'Material type is required for material content type.'
                })
        
        # For content types that don't need lesson dates (like course outlines, past papers)
        # make lesson_date optional
        if content_type in ['material', 'past_papers'] and not attrs.get('lesson_date'):
            # Set a default date for content without lesson dates
            attrs['lesson_date'] = '1900-01-01'  # Use a far past date as default
            attrs['lesson_order'] = 0
        
        # Validate file_url or file_path is provided
        if not attrs.get('file_url') and not attrs.get('file_path'):
            raise serializers.ValidationError({
                'file_url': 'Either file_url or file_path must be provided.'
            })
        
        return attrs


class CourseTimelineSerializer(serializers.Serializer):
    """Serializer for course timeline grouped by lesson date"""
    lesson_date = serializers.DateField()
    lesson_date_display = serializers.CharField()
    content = CourseContentSerializer(many=True)
    total_content = serializers.IntegerField()


class CourseWithDetailsSerializer(serializers.ModelSerializer):
    """Serializer for courses with detailed information"""
    timetable_entries = TimetableEntryWithRecordingsSerializer(many=True, read_only=True)
    recent_recordings = serializers.SerializerMethodField()
    recent_materials = serializers.SerializerMethodField()
    recent_content = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = '__all__'

    def get_recent_recordings(self, obj):
        recent = obj.recordings.all()[:3]
        return RecordingSerializer(recent, many=True).data

    def get_recent_materials(self, obj):
        recent = obj.materials.all()[:3]
        return CourseMaterialSerializer(recent, many=True).data

    def get_recent_content(self, obj):
        recent = obj.course_contents.filter(is_published=True).order_by('-lesson_date', '-lesson_order')[:5]
        return CourseContentSerializer(recent, many=True).data


# -------------------------
# Study Groups
# -------------------------

class StudyGroupSerializer(serializers.ModelSerializer):
    members_count = serializers.IntegerField(source='memberships.count', read_only=True)
    pending_requests = serializers.IntegerField(source='join_requests.filter(status="pending").count', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)

    class Meta:
        model = StudyGroup
        fields = ('id', 'name', 'description', 'student_class', 'course', 'course_name', 'created_by', 'is_private', 'max_members', 'created_at', 'updated_at', 'members_count', 'pending_requests')
        read_only_fields = ('id', 'created_by', 'created_at', 'updated_at', 'members_count', 'pending_requests')


class StudyGroupCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyGroup
        fields = ('name', 'description', 'is_private', 'course')

    def create(self, validated_data):
        user = self.context['request'].user
        if not getattr(user, 'student_class', None):
            # Try to auto-assign default class for current users
            try:
                from school.models import Class as SchoolClass
                default_class = SchoolClass.get_default_class()
                if default_class:
                    user.student_class = default_class
                    user.save(update_fields=['student_class'])
                else:
                    raise serializers.ValidationError('Default class is not configured. Please run school setup.')
            except Exception:
                raise serializers.ValidationError('Default class is not configured. Please run school setup.')
        group = StudyGroup.objects.create(
            student_class=user.student_class,
            created_by=user,
            **validated_data
        )
        # creator becomes admin member
        StudyGroupMembership.objects.create(group=group, user=user, role='admin')
        return group


class StudyGroupMembershipSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = StudyGroupMembership
        fields = ('id', 'group', 'user', 'role', 'joined_at', 'user_name')
        read_only_fields = ('id', 'joined_at', 'user_name')


class GroupMeetingSerializer(serializers.ModelSerializer):
    video_join_url = serializers.SerializerMethodField()

    class Meta:
        model = GroupMeeting
        fields = '__all__'
        read_only_fields = ('meeting_id', 'meeting_url', 'created_at')

    def get_video_join_url(self, obj):
        return obj.meeting_url


class StudyGroupJoinRequestSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = StudyGroupJoinRequest
        fields = ('id', 'group', 'user', 'user_name', 'status', 'approver', 'created_at', 'updated_at')
        read_only_fields = ('id', 'status', 'approver', 'created_at', 'updated_at', 'user', 'user_name')


class GroupMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    reply_to = serializers.SerializerMethodField()
    deleted = serializers.BooleanField(read_only=True)
    deleted_at = serializers.DateTimeField(read_only=True)
    deleted_by_name = serializers.CharField(source='deleted_by.get_full_name', read_only=True)

    class Meta:
        model = GroupMessage
        fields = ('id', 'group', 'sender', 'sender_name', 'body', 'created_at', 'reply_to', 'deleted', 'deleted_at', 'deleted_by_name')
        read_only_fields = ('id', 'created_at', 'sender_name', 'sender', 'deleted', 'deleted_at', 'deleted_by_name')

    def get_reply_to(self, obj):
        if obj.reply_to:
            return {
                'id': obj.reply_to.id,
                'sender_name': obj.reply_to.sender.get_full_name(),
                'body': obj.reply_to.body,
                'created_at': obj.reply_to.created_at.isoformat()
            }
        return None