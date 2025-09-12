from rest_framework import serializers
from django.contrib.auth import authenticate
from directory.models import User
from .models import Course, TimetableEntry, CourseMaterial, Recording, Meeting


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
        return attrs

    def validate_registration_number(self, value):
        """Validate registration number format"""
        import re
        pattern = r'^[A-Z]{1,4}\d{0,2}/\d{1,6}/\d{4}$'
        if not re.match(pattern, value):
            raise serializers.ValidationError('Registration number must be in format: PREFIX/XXXXXX/YYYY (e.g., GPR3/123456/2025, P15/1674/2014)')
        return value

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            registration_number=validated_data['registration_number'],
            phone_number=validated_data['phone_number'],
            password=validated_data['password'],
            is_active=False  # User needs approval
        )
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
            if not user.is_active:
                if user.status == 'pending':
                    raise serializers.ValidationError('Your registration is pending approval')
                elif user.status == 'rejected':
                    raise serializers.ValidationError('Your registration has been rejected')
                else:
                    raise serializers.ValidationError('Your account is not active')
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
    class Meta:
        model = TimetableEntry
        fields = '__all__'


class CourseMaterialSerializer(serializers.ModelSerializer):
    """Serializer for course materials"""
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)

    class Meta:
        model = CourseMaterial
        fields = '__all__'


class RecordingSerializer(serializers.ModelSerializer):
    """Serializer for recordings"""
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)

    class Meta:
        model = Recording
        fields = '__all__'


class MeetingSerializer(serializers.ModelSerializer):
    """Serializer for meetings"""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = Meeting
        fields = '__all__'