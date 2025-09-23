from rest_framework import serializers
from django.contrib.auth import authenticate
from datetime import date
from .models import User, AcademicYear, Semester
from school.models import Class
from .extended_models import Student, Teacher, RegistrationRequest


class AcademicYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicYear
        fields = ['id', 'year_start', 'year_end', 'is_active', 'created_at', 'updated_at']


class SemesterSerializer(serializers.ModelSerializer):
    """Serializer for Semester model"""
    academic_year_display = serializers.CharField(source='academic_year.__str__', read_only=True)
    semester_type_display = serializers.CharField(source='get_semester_type_display', read_only=True)
    progress_percentage = serializers.SerializerMethodField()
    progress_status = serializers.SerializerMethodField()
    days_elapsed = serializers.SerializerMethodField()
    total_days = serializers.SerializerMethodField()
    days_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = Semester
        fields = [
            'id', 'academic_year', 'academic_year_display', 
            'semester_type', 'semester_type_display',
            'start_date', 'end_date', 'is_active', 
            'progress_percentage', 'progress_status',
            'days_elapsed', 'total_days', 'days_remaining',
            'created_at', 'updated_at'
        ]
    
    def get_progress_percentage(self, obj):
        return obj.get_progress_percentage()
    
    def get_progress_status(self, obj):
        return obj.get_progress_status()
    
    def get_days_elapsed(self, obj):
        return obj.get_days_elapsed()
    
    def get_total_days(self, obj):
        return obj.get_total_days()
    
    def get_days_remaining(self, obj):
        return obj.get_days_remaining()


class ClassSerializer(serializers.ModelSerializer):
    current_year_of_study = serializers.ReadOnlyField()
    student_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Class
        fields = ['id', 'name', 'program', 'graduation_year', 'academic_year', 
                 'is_active', 'display_name', 'current_year_of_study', 'student_count']


class UserSerializer(serializers.ModelSerializer):
    year_display = serializers.ReadOnlyField()
    semester_display = serializers.ReadOnlyField()
    registration_info = serializers.ReadOnlyField()
    academic_year_display = serializers.CharField(source='academic_year.display_name', read_only=True)
    student_class_display = serializers.CharField(source='student_class.display_name', read_only=True)
    class_display_name = serializers.ReadOnlyField()
    is_class_of_2029 = serializers.ReadOnlyField()
    is_first_year_law_student = serializers.ReadOnlyField()
    is_admin = serializers.ReadOnlyField()
    class_rep_role = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                 'registration_number', 'phone_number', 'user_type', 'status',
                 'academic_year', 'academic_year_display', 'student_class', 'student_class_display',
                 'current_year', 'current_semester', 'year_display', 'semester_display', 
                 'class_of', 'class_display_name', 'is_class_of_2029', 'is_first_year_law_student',
                 'profile_picture', 'bio', 'registration_info', 'is_active', 'date_joined', 'is_admin', 'class_rep_role']
        read_only_fields = ['id', 'date_joined', 'registration_info', 'class_display_name', 
                           'is_class_of_2029', 'is_first_year_law_student', 'is_admin', 'class_rep_role']

    def get_class_rep_role(self, obj):
        """Get class rep role information for the user"""
        try:
            from communication.models import ClassRepRole
            class_rep_role = ClassRepRole.objects.get(user=obj, is_active=True)
            return {
                'id': class_rep_role.id,
                'is_active': class_rep_role.is_active,
                'permissions': class_rep_role.permissions,
                'student_class': class_rep_role.student_class.id,
                'student_class_name': class_rep_role.student_class.display_name,
                'assigned_at': class_rep_role.assigned_at.isoformat() if class_rep_role.assigned_at else None,
                'assigned_by_name': class_rep_role.assigned_by.get_full_name() if class_rep_role.assigned_by else None
            }
        except:
            return None


class StudentSerializer(serializers.ModelSerializer):
    """Serializer for Student model (extended model)"""
    user = UserSerializer(read_only=True)
    progress_percentage = serializers.ReadOnlyField()
    is_on_track = serializers.ReadOnlyField()
    
    class Meta:
        model = Student
        fields = ['user', 'student_id', 'enrollment_date', 'expected_graduation',
                 'gpa', 'credits_completed', 'credits_required', 'progress_percentage',
                 'is_full_time', 'financial_aid', 'is_on_track',
                 'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship']


class StudentUserSerializer(serializers.ModelSerializer):
    """Serializer for User objects with user_type='student'"""
    full_name = serializers.SerializerMethodField()
    class_display_name = serializers.SerializerMethodField()
    registration_info = serializers.SerializerMethodField()
    is_admin = serializers.SerializerMethodField()
    student_class = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'full_name', 'registration_number', 
                 'phone_number', 'user_type', 'status', 'current_year', 'current_semester',
                 'class_of', 'student_class', 'class_display_name', 'registration_info', 'is_active', 
                 'date_joined', 'is_admin']
        read_only_fields = ['id', 'date_joined', 'is_admin']
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def get_class_display_name(self, obj):
        return obj.class_display_name
    
    def get_registration_info(self, obj):
        return obj.registration_info
    
    def get_is_admin(self, obj):
        return obj.is_admin
    
    def get_student_class(self, obj):
        if obj.student_class:
            return obj.student_class.id
        return None


class TeacherSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    years_of_service = serializers.ReadOnlyField()
    
    class Meta:
        model = Teacher
        fields = ['user', 'employee_id', 'department', 'position', 'hire_date',
                 'office_location', 'office_hours', 'qualifications', 'research_interests',
                 'is_tenured', 'is_active', 'years_of_service']


class RegistrationRequestSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    academic_year_display = serializers.CharField(source='academic_year.display_name', read_only=True)
    
    class Meta:
        model = RegistrationRequest
        fields = ['id', 'first_name', 'last_name', 'full_name', 'email', 'phone_number',
                 'registration_number', 'program', 'year_of_study', 'semester',
                 'academic_year', 'academic_year_display', 'bio', 'motivation',
                 'status', 'submitted_at', 'reviewed_at', 'review_notes']
        read_only_fields = ['id', 'submitted_at', 'reviewed_at']


class RegistrationRequestCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new registration requests"""
    
    class Meta:
        model = RegistrationRequest
        fields = ['first_name', 'last_name', 'email', 'phone_number', 'registration_number',
                 'program', 'year_of_study', 'semester', 'academic_year', 'bio', 'motivation']
        extra_kwargs = {
            'academic_year': {'required': False}
        }
    
    def validate_registration_number(self, value):
        """Validate UoN registration number format"""
        import re
        pattern = r'^[A-Z]{1,4}\d{0,2}/\d{1,6}/\d{4}$'
        if not re.match(pattern, value):
            raise serializers.ValidationError(
                'Registration number must be in format: PREFIX/XXXXXX/YYYY (e.g., GPR3/123456/2025, P15/1674/2014)'
            )
        return value
    
    def validate_email(self, value):
        """Check if email is already registered"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('This email is already registered.')
        return value


class StudentRegistrationSerializer(serializers.ModelSerializer):
    """Flexible serializer for student registration based on registration number"""
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'registration_number', 'phone_number', 
                 'password', 'confirm_password', 'bio']
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
            'registration_number': {'required': True},
            'phone_number': {'required': True},
        }
    
    def validate_registration_number(self, value):
        """Validate registration number format and check for duplicates"""
        import re
        pattern = r'^([A-Z]{1,4})(\d{0,2})/(\d{1,6})/(\d{4})$'
        match = re.match(pattern, value)
        
        if not match:
            raise serializers.ValidationError(
                'Registration number must be in format: PREFIX/XXXXXX/YYYY (e.g., GPR3/123456/2025, P15/1674/2014)'
            )
        
        prefix, year_code, student_id, admission_year = match.groups()
        admission_year_int = int(admission_year)
        
        # Validate admission year (should be reasonable)
        current_year = date.today().year
        if admission_year_int < 2000 or admission_year_int > current_year + 1:
            raise serializers.ValidationError(
                f'Invalid admission year "{admission_year}". Must be between 2000 and {current_year + 1}'
            )
        
        # Check if registration number already exists
        from .models import User
        if User.objects.filter(registration_number=value).exists():
            existing_user = User.objects.get(registration_number=value)
            if existing_user.status == 'pending':
                raise serializers.ValidationError(
                    'This registration number is already registered and pending approval. Please wait for administrative approval or contact support if you believe this is an error.'
                )
            elif existing_user.status == 'approved':
                raise serializers.ValidationError(
                    'This registration number is already registered and approved. Please log in with your existing account.'
                )
            else:
                raise serializers.ValidationError(
                    'This registration number is already registered. Please contact support if you believe this is an error.'
                )
        
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        
        # Extract information from registration number
        registration_number = validated_data['registration_number']
        import re
        pattern = r'^([A-Z]{1,4})(\d{0,2})/(\d{1,6})/(\d{4})$'
        match = re.match(pattern, registration_number)
        prefix, year_code, student_id, admission_year = match.groups()
        admission_year_int = int(admission_year)
        graduation_year = admission_year_int + 4  # Typically 4 years for most programs
        
        # Get the default class (all students go to the default class)
        student_class = Class.get_default_class()
        
        # Determine current year and semester based on academic year
        current_academic_year = AcademicYear.get_current_academic_year()
        if current_academic_year:
            years_elapsed = current_academic_year.year_start - admission_year_int
            current_year = min(max(years_elapsed + 1, 1), 4)  # Clamp between 1 and 4
            current_semester = 1  # Default to first semester for new registrations
        else:
            current_year = 1
            current_semester = 1
        
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            registration_number=validated_data['registration_number'],
            phone_number=validated_data['phone_number'],
            password=validated_data['password'],
            user_type='student',
            status='pending',  # Requires approval
            student_class=student_class,
            current_year=current_year,
            current_semester=current_semester,
            bio=validated_data.get('bio', ''),
            is_active=False  # User needs approval
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            # First try normal authentication
            user = authenticate(username=email, password=password)
            
            # If authentication fails, check if user exists but is inactive
            if not user:
                try:
                    user = User.objects.get(email=email)
                    # Check if password is correct for inactive user
                    if user.check_password(password):
                        if not user.is_active:
                            raise serializers.ValidationError('Your account is pending approval. Please wait for administrator approval before logging in.')
                        if user.status != 'approved':
                            raise serializers.ValidationError('Your account is pending approval. Please wait for administrator approval before logging in.')
                    else:
                        raise serializers.ValidationError('Invalid email or password.')
                except User.DoesNotExist:
                    raise serializers.ValidationError('Invalid email or password.')
            else:
                # User authenticated successfully, check additional conditions
                if not user.is_active:
                    raise serializers.ValidationError('Your account is pending approval. Please wait for administrator approval before logging in.')
                if user.status != 'approved':
                    raise serializers.ValidationError('Your account is pending approval. Please wait for administrator approval before logging in.')
            
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include email and password.')
        
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile updates"""
    
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone_number', 'bio', 'profile_picture']
    
    def update(self, instance, validated_data):
        # Handle profile picture upload
        if 'profile_picture' in validated_data:
            # Delete old profile picture if exists
            if instance.profile_picture:
                instance.profile_picture.delete(save=False)
        
        return super().update(instance, validated_data)

