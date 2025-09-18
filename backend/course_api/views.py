from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import login
from django.db.models import Q
from django.http import JsonResponse
from directory.models import User
from .models import Course, TimetableEntry, CourseMaterial, Recording, Meeting, JitsiRecording
from .serializers import (
    UserRegistrationSerializer, UserSerializer, LoginSerializer,
    CourseSerializer, TimetableEntrySerializer, CourseMaterialSerializer,
    RecordingSerializer, MeetingSerializer, JitsiRecordingSerializer, TimetableEntryWithRecordingsSerializer,
    CourseWithDetailsSerializer
)
from .jitsi_auth import jitsi_auth


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint"""
    return JsonResponse({
        'status': 'healthy',
        'message': 'Course Organizer API is running',
        'version': '1.0.0',
        'host': request.get_host()
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """User registration endpoint"""
    import logging
    logger = logging.getLogger(__name__)
    
    logger.info(f"Registration attempt for email: {request.data.get('email', 'No email provided')}")
    
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        try:
            user = serializer.save()
            logger.info(f"User created successfully: {user.id}, email: {user.email}")
            logger.info(f"User email verified: {user.email_verified}, verification token: {user.email_verification_token}")
            
            return Response({
                'message': 'Registration successful! Please check your email to verify your account. After email verification, your account will be reviewed for administrative approval.',
                'user_id': user.id,
                'email_sent': True
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error during user registration: {str(e)}")
            logger.error(f"Exception type: {type(e).__name__}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return Response({
                'message': 'Registration failed due to an internal error. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    else:
        logger.error(f"Registration validation failed: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """User login endpoint"""
    import logging
    logger = logging.getLogger(__name__)
    
    logger.info(f"Login attempt for email: {request.data.get('email', 'No email provided')}")
    
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        logger.info(f"User authenticated: {user.email}, Last login before: {user.last_login}")
        
        token, created = Token.objects.get_or_create(user=user)
        logger.info(f"Token {'created' if created else 'retrieved'}: {token.key[:10]}...")
        
        # Log before login
        logger.info(f"Before login() call - User last_login: {user.last_login}")
        
        login(request, user)
        
        # Refresh user from database to get updated last_login
        user.refresh_from_db()
        logger.info(f"After login() call - User last_login: {user.last_login}")
        
        user_data = UserSerializer(user).data
        logger.info(f"Returning user data with last_login: {user_data.get('last_login')}")
        
        return Response({
            'token': token.key,
            'user': user_data
        }, status=status.HTTP_200_OK)
    else:
        logger.error(f"Login failed for {request.data.get('email', 'No email')}: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """User logout endpoint"""
    try:
        request.user.auth_token.delete()
    except:
        pass
    return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    """Email verification endpoint"""
    token = request.data.get('token')
    if not token:
        return Response({'error': 'Verification token is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Find user with this verification token
        user = User.objects.get(email_verification_token=token)
        success, message = user.verify_email_token(token)
        
        if success:
            return Response({
                'message': message,
                'email_verified': True
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)
            
    except User.DoesNotExist:
        return Response({'error': 'Invalid or expired verification token'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_verification_email(request):
    """Resend email verification endpoint"""
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
        
        if user.email_verified:
            return Response({'error': 'Email is already verified'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate new verification token
        verification_token = user.generate_email_verification_token()
        user.save()
        
        # Send verification email
        from .email_service import send_verification_email
        email_sent = send_verification_email(user, verification_token)
        
        if email_sent:
            return Response({
                'message': 'Verification email sent successfully',
                'email_sent': True
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Failed to send verification email'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except User.DoesNotExist:
        return Response({'error': 'User with this email does not exist'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """Get current user profile"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pending_registrations(request):
    """Get pending registrations (admin only)"""
    if not request.user.is_admin:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    pending_users = User.objects.filter(status='pending')
    serializer = UserSerializer(pending_users, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def confirmed_registrations(request):
    """Get confirmed/approved student registrations (admin only)"""
    import logging
    logger = logging.getLogger(__name__)
    
    if not request.user.is_admin:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    confirmed_users = User.objects.filter(status='approved', user_type='student').order_by('-date_joined')
    logger.info(f"Found {confirmed_users.count()} confirmed users")
    
    # Log each user's last_login status
    for user in confirmed_users:
        logger.info(f"User {user.email}: last_login = {user.last_login}")
    
    serializer = UserSerializer(confirmed_users, many=True)
    logger.info(f"Serialized data for {len(serializer.data)} users")
    
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_user(request, user_id):
    """Approve a user registration (admin only)"""
    import logging
    logger = logging.getLogger(__name__)
    
    logger.info(f"Admin approval request for user ID: {user_id} by admin: {request.user.email}")
    
    if not request.user.is_admin:
        logger.warning(f"Non-admin user {request.user.email} attempted to approve user {user_id}")
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        # First check if user exists at all
        try:
            user = User.objects.get(id=user_id)
            logger.info(f"User found: {user.email}, status: {user.status}, is_active: {user.is_active}")
        except User.DoesNotExist:
            logger.error(f"User with ID {user_id} does not exist")
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if user is pending
        if user.status != 'pending':
            logger.warning(f"User {user.email} has status '{user.status}', expected 'pending'")
            return Response({'error': f'User is not pending approval (current status: {user.status})'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.status = 'approved'
        user.is_active = True
        user.save()
        logger.info(f"User {user.email} approved successfully")
        
        # Send approval notification via email
        from .email_service import send_registration_approval_email
        logger.info(f"Attempting to send approval email to {user.email}")
        email_sent = send_registration_approval_email(user)
        logger.info(f"Approval email send result: {email_sent}")
        
        # TODO: SMS notification disabled until Twilio account is properly configured
        # Send approval notification via SMS
        # from .sms_service import sms_service
        # sms_result = sms_service.send_approval_notification(
        #     phone_number=user.phone_number,
        #     student_name=user.get_full_name()
        # )
        
        response_data = {
            'message': 'User approved successfully',
            'email_sent': email_sent,
            'sms_sent': False,  # sms_result['success'],
            'sms_message': 'SMS notification disabled - manual verification in progress'  # sms_result['message']
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error approving user {user_id}: {str(e)}")
        logger.error(f"Exception type: {type(e).__name__}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def debug_user(request, user_id):
    """Debug endpoint to check user status"""
    import logging
    logger = logging.getLogger(__name__)
    
    logger.info(f"Debug request for user ID: {user_id} by admin: {request.user.email}")
    
    if not request.user.is_admin:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
        logger.info(f"User found: {user.email}, status: {user.status}, is_active: {user.is_active}")
        
        return Response({
            'user_id': user.id,
            'email': user.email,
            'name': user.get_full_name(),
            'status': user.status,
            'is_active': user.is_active,
            'email_verified': user.email_verified,
            'registration_number': user.registration_number,
            'phone_number': user.phone_number,
            'date_joined': user.date_joined,
            'last_login': user.last_login,
            'is_admin': user.is_admin,
        }, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        logger.error(f"User with ID {user_id} does not exist")
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error debugging user {user_id}: {str(e)}")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_user(request, user_id):
    """Reject a user registration (admin only)"""
    if not request.user.is_admin:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id, status='pending')
        user.status = 'rejected'
        user.save()
        
        # Send rejection notification via email
        from .email_service import send_registration_rejection_email
        email_sent = send_registration_rejection_email(user)
        
        return Response({
            'message': 'User rejected successfully',
            'email_sent': email_sent
        }, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


# TODO: Passcode generation disabled until SMS service is properly configured
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def generate_passcode(request, user_id):
#     """Generate a random passcode for a user (admin only)"""
#     if not request.user.is_admin:
#         return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
#     
#     try:
#         user = User.objects.get(id=user_id, status='pending')
#         
#         # Generate a 6-digit random passcode
#         import random
#         passcode = str(random.randint(100000, 999999))
#         
#         # Store passcode in user's bio field temporarily (in production, use a separate field)
#         if not user.bio:
#             user.bio = f"Passcode: {passcode}"
#         else:
#             # Update existing bio with new passcode
#             if "Passcode:" in user.bio:
#                 user.bio = user.bio.split("Passcode:")[0].strip() + f" Passcode: {passcode}"
#             else:
#                 user.bio += f" Passcode: {passcode}"
#         
#         user.save()
#         
#         return Response({
#             'passcode': passcode,
#             'message': f'Passcode {passcode} generated for {user.get_full_name()}'
#         }, status=status.HTTP_200_OK)
#     except User.DoesNotExist:
#         return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


# TODO: SMS sending disabled until Twilio account is properly configured
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def send_passcode_sms(request, user_id):
#     """Send passcode via SMS (admin only)"""
#     if not request.user.is_admin:
#         return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
#     
#     try:
#         user = User.objects.get(id=user_id, status='pending')
#         passcode = request.data.get('passcode')
#         
#         if not passcode:
#             return Response({'error': 'Passcode is required'}, status=status.HTTP_400_BAD_REQUEST)
#         
#         # Import SMS service
#         from .sms_service import sms_service
#         
#         # Send SMS using the service
#         result = sms_service.send_passcode(
#             phone_number=user.phone_number,
#             passcode=passcode,
#             student_name=user.get_full_name()
#         )
#         
#         if result['success']:
#             return Response({
#                 'message': result['message'],
#                 'twilio_sid': result.get('twilio_sid'),
#                 'status': result.get('status'),
#                 'fallback': result.get('fallback', False)
#             }, status=status.HTTP_200_OK)
#         else:
#             return Response({
#                 'error': result['message'],
#                 'fallback': result.get('fallback', False)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
#             
#     except User.DoesNotExist:
#         return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


# Course-related views
class CourseListCreateView(generics.ListCreateAPIView):
    """List and create courses with filtering by year and semester"""
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Course.objects.all()
        year = self.request.query_params.get('year', None)
        semester = self.request.query_params.get('semester', None)
        
        if year:
            queryset = queryset.filter(year=year)
        if semester:
            queryset = queryset.filter(semester=semester)
            
        return queryset.order_by('year', 'semester', 'code')


class TimetableEntryListView(generics.ListAPIView):
    """List timetable entries with filtering by year and semester"""
    serializer_class = TimetableEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = TimetableEntry.objects.all()
        year = self.request.query_params.get('year', None)
        semester = self.request.query_params.get('semester', None)
        
        if year:
            queryset = queryset.filter(course__year=year)
        if semester:
            queryset = queryset.filter(course__semester=semester)
            
        return queryset.order_by('day', 'time')


class TimetableEntryCreateView(generics.CreateAPIView):
    """Create new timetable entry (admin only)"""
    serializer_class = TimetableEntrySerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        if not self.request.user.is_admin:
            raise permissions.PermissionDenied("Only administrators can create timetable entries")
        serializer.save()


class TimetableEntryUpdateView(generics.UpdateAPIView):
    """Update timetable entry (admin only)"""
    serializer_class = TimetableEntrySerializer
    permission_classes = [IsAuthenticated]
    queryset = TimetableEntry.objects.all()

    def perform_update(self, serializer):
        if not self.request.user.is_admin:
            raise permissions.PermissionDenied("Only administrators can update timetable entries")
        serializer.save()


class TimetableEntryDeleteView(generics.DestroyAPIView):
    """Delete timetable entry (admin only)"""
    permission_classes = [IsAuthenticated]
    queryset = TimetableEntry.objects.all()

    def perform_destroy(self, instance):
        if not self.request.user.is_admin:
            raise permissions.PermissionDenied("Only administrators can delete timetable entries")
        instance.delete()


class CourseMaterialListView(generics.ListAPIView):
    """List course materials with filtering"""
    serializer_class = CourseMaterialSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = CourseMaterial.objects.all()
        subject = self.request.query_params.get('subject', None)
        if subject:
            queryset = queryset.filter(course__name__icontains=subject)
        return queryset.order_by('-created_at')


class RecordingListView(generics.ListAPIView):
    """List recordings with filtering"""
    serializer_class = RecordingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Recording.objects.all()
        subject = self.request.query_params.get('subject', None)
        if subject:
            queryset = queryset.filter(course__name__icontains=subject)
        return queryset.order_by('-created_at')


class MeetingListView(generics.ListAPIView):
    """List meetings with filtering"""
    serializer_class = MeetingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Meeting.objects.all()
        subject = self.request.query_params.get('subject', None)
        if subject:
            queryset = queryset.filter(course__name__icontains=subject)
        return queryset.order_by('scheduled_time')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_courses(request):
    """Get courses for the current user based on their class"""
    user = request.user
    
    # Get courses based on user's class
    courses = Course.get_courses_for_user(user)
    
    serializer = CourseSerializer(courses, many=True)
    return Response({
        'courses': serializer.data,
        'user_class': user.class_display_name if user.is_student else None,
        'is_class_of_2029': user.is_class_of_2029 if user.is_student else False
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_class_courses(request, class_id):
    """Get courses for a specific class"""
    from school.models import Class
    
    try:
        student_class = Class.objects.get(id=class_id)
        courses = Course.get_courses_for_class(student_class)
        
        serializer = CourseSerializer(courses, many=True)
        return Response({
            'class': {
                'id': student_class.id,
                'name': student_class.display_name,
                'program': student_class.program,
                'graduation_year': student_class.graduation_year
            },
            'courses': serializer.data
        })
    except Class.DoesNotExist:
        return Response({'error': 'Class not found'}, status=status.HTTP_404_NOT_FOUND)


# Admin Views for Course Management
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_admin_courses(request):
    """Get all courses for admin management"""
    if not request.user.is_admin:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    courses = Course.objects.all().order_by('academic_year', 'year', 'semester', 'code')
    serializer = CourseWithDetailsSerializer(courses, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_course_timetable_entries(request, course_id):
    """Get timetable entries for a specific course with recordings and materials"""
    if not request.user.is_admin:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        course = Course.objects.get(id=course_id)
        # Get the last 3 timetable entries for this course, with ability to get more
        limit = int(request.query_params.get('limit', 3))
        entries = course.timetable_entries.all().order_by('-created_at')[:limit]
        
        serializer = TimetableEntryWithRecordingsSerializer(entries, many=True)
        return Response({
            'course': CourseSerializer(course).data,
            'timetable_entries': serializer.data,
            'total_entries': course.timetable_entries.count()
        })
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_recording(request):
    """Add a recording for a specific timetable entry"""
    if not request.user.is_admin:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = RecordingSerializer(data=request.data)
    if serializer.is_valid():
        recording = serializer.save(uploaded_by=request.user)
        return Response(RecordingSerializer(recording).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_course_material(request):
    """Add course material (course-wide, topic-wise, or lesson-specific)"""
    if not request.user.is_admin:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = CourseMaterialSerializer(data=request.data)
    if serializer.is_valid():
        material = serializer.save(uploaded_by=request.user)
        return Response(CourseMaterialSerializer(material).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_recording(request, recording_id):
    """Update a recording"""
    if not request.user.is_admin:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        recording = Recording.objects.get(id=recording_id)
        serializer = RecordingSerializer(recording, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Recording.DoesNotExist:
        return Response({'error': 'Recording not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_course_material(request, material_id):
    """Update a course material"""
    if not request.user.is_admin:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        material = CourseMaterial.objects.get(id=material_id)
        serializer = CourseMaterialSerializer(material, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except CourseMaterial.DoesNotExist:
        return Response({'error': 'Material not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_recording(request, recording_id):
    """Delete a recording"""
    if not request.user.is_admin:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        recording = Recording.objects.get(id=recording_id)
        recording.delete()
        return Response({'message': 'Recording deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    except Recording.DoesNotExist:
        return Response({'error': 'Recording not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_course_material(request, material_id):
    """Delete a course material"""
    if not request.user.is_admin:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        material = CourseMaterial.objects.get(id=material_id)
        material.delete()
        return Response({'message': 'Material deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    except CourseMaterial.DoesNotExist:
        return Response({'error': 'Material not found'}, status=status.HTTP_404_NOT_FOUND)


# Jitsi Meeting Management Views

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_jitsi_meeting(request):
    """Create a new Jitsi meeting"""
    try:
        data = request.data.copy()
        
        # Set platform to Jitsi if not specified
        if 'platform' not in data:
            data['platform'] = 'jitsi'
        
        # Validate required fields
        required_fields = ['title', 'scheduled_time', 'course']
        for field in required_fields:
            if field not in data:
                return Response({'error': f'{field} is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get course
        try:
            course = Course.objects.get(id=data['course'])
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Create meeting
        data['created_by'] = request.user.id
        serializer = MeetingSerializer(data=data)
        
        if serializer.is_valid():
            meeting = serializer.save()
            return Response({
                'message': 'Jitsi meeting created successfully',
                'meeting': MeetingSerializer(meeting).data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_jitsi_meeting(request, meeting_id):
    """Get details of a specific Jitsi meeting"""
    try:
        meeting = Meeting.objects.get(id=meeting_id, platform='jitsi')
        serializer = MeetingSerializer(meeting)
        return Response(serializer.data)
    except Meeting.DoesNotExist:
        return Response({'error': 'Meeting not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_meeting_status(request, meeting_id):
    """Update meeting status (start, end, cancel)"""
    try:
        meeting = Meeting.objects.get(id=meeting_id)
        
        # Check if user has permission to update this meeting
        if not (request.user.is_admin or meeting.created_by == request.user):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        new_status = request.data.get('status')
        if new_status not in ['scheduled', 'live', 'ended', 'cancelled']:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        meeting.status = new_status
        meeting.save()
        
        return Response({
            'message': f'Meeting status updated to {new_status}',
            'meeting': MeetingSerializer(meeting).data
        })
        
    except Meeting.DoesNotExist:
        return Response({'error': 'Meeting not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_jitsi_recording(request, meeting_id):
    """Start recording for a Jitsi meeting (for future Jibri integration)"""
    try:
        meeting = Meeting.objects.get(id=meeting_id, platform='jitsi')
        
        # Check if user has permission to start recording
        if not (request.user.is_admin or meeting.created_by == request.user):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        if not meeting.is_recording_enabled:
            return Response({'error': 'Recording is not enabled for this meeting'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if recording is already in progress
        active_recording = meeting.recordings.filter(status__in=['pending', 'recording']).first()
        if active_recording:
            return Response({'error': 'Recording already in progress'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create new recording entry
        import uuid
        recording_id = f"rec-{uuid.uuid4().hex[:12]}"
        
        recording = JitsiRecording.objects.create(
            meeting=meeting,
            recording_id=recording_id,
            status='pending'
        )
        
        # TODO: Integrate with Jibri to actually start recording
        # For now, just mark as pending
        
        return Response({
            'message': 'Recording start request submitted',
            'recording': JitsiRecordingSerializer(recording).data
        })
        
    except Meeting.DoesNotExist:
        return Response({'error': 'Meeting not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def stop_jitsi_recording(request, meeting_id):
    """Stop recording for a Jitsi meeting"""
    try:
        meeting = Meeting.objects.get(id=meeting_id, platform='jitsi')
        
        # Check if user has permission to stop recording
        if not (request.user.is_admin or meeting.created_by == request.user):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Find active recording
        active_recording = meeting.recordings.filter(status__in=['pending', 'recording']).first()
        if not active_recording:
            return Response({'error': 'No active recording found'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update recording status
        active_recording.status = 'processing'
        active_recording.save()
        
        # TODO: Integrate with Jibri to actually stop recording
        
        return Response({
            'message': 'Recording stop request submitted',
            'recording': JitsiRecordingSerializer(active_recording).data
        })
        
    except Meeting.DoesNotExist:
        return Response({'error': 'Meeting not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_meeting_recordings(request, meeting_id):
    """Get all recordings for a specific meeting"""
    try:
        meeting = Meeting.objects.get(id=meeting_id)
        recordings = meeting.recordings.all()
        serializer = JitsiRecordingSerializer(recordings, many=True)
        return Response(serializer.data)
    except Meeting.DoesNotExist:
        return Response({'error': 'Meeting not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_meeting(request, meeting_id):
    """Generate join URL for a meeting with user authentication"""
    try:
        meeting = Meeting.objects.get(id=meeting_id)
        
        # Check if user can join the meeting
        if not meeting.can_join_now:
            return Response({'error': 'Meeting is not available for joining at this time'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate video meeting URL with user info
        user_name = request.user.get_full_name() or request.user.email
        
        if meeting.platform == 'daily':
            # For Daily.co, we'll use the room URL directly
            # The frontend will handle token generation for authentication
            join_url = meeting.video_join_url
            
            # If Daily.co room URL is empty, fallback to Jitsi
            if not join_url:
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"Daily.co room URL is empty for meeting {meeting.id}, falling back to Jitsi")
                # Generate a Jitsi URL as fallback
                jitsi_room_name = f"meeting-{meeting.id}-{meeting.course.code.lower().replace(' ', '-')}"
                join_url = f"https://meet.jit.si/{jitsi_room_name}"
        elif meeting.platform == 'jitsi':
            # Add user display name to the URL
            base_url = meeting.jitsi_join_url
            
            # Add current user info to the URL
            if '?' in base_url:
                join_url = f"{base_url}&userInfo.displayName={user_name}"
            else:
                join_url = f"{base_url}?userInfo.displayName={user_name}"
        else:
            join_url = meeting.meeting_url
        
        # Generate Daily.co token if needed
        daily_token = None
        if meeting.platform == 'daily' and meeting.daily_room_name:
            try:
                from .daily_service import daily_service
                if daily_service.is_api_configured():
                    is_owner = request.user == meeting.admin_host or request.user.is_admin
                    token_data = daily_service.create_meeting_token(
                        room_name=meeting.daily_room_name,
                        user_id=str(request.user.id),
                        user_name=user_name,
                        is_owner=is_owner
                    )
                    daily_token = token_data.get('token')
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to generate Daily.co token: {str(e)}")
        
        # Determine the actual platform being used based on the URL
        actual_platform = meeting.platform
        if meeting.platform == 'daily' and 'daily.co' not in join_url:
            actual_platform = 'jitsi'  # Fallback to Jitsi
        
        return Response({
            'meeting_id': meeting.id,
            'join_url': join_url,
            'meeting_title': meeting.title,
            'user_name': user_name,
            'admin_host': meeting.admin_host.get_full_name() if meeting.admin_host else None,
            'platform': actual_platform,
            'daily_token': daily_token if actual_platform == 'daily' else None,
            'daily_room_name': meeting.daily_room_name if actual_platform == 'daily' else None
        })
        
    except Meeting.DoesNotExist:
        return Response({'error': 'Meeting not found'}, status=status.HTTP_404_NOT_FOUND)


# Timetable-Meeting Integration Views

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_meeting_for_timetable_entry(request, timetable_entry_id):
    """Create a Jitsi meeting for a specific timetable entry"""
    try:
        timetable_entry = TimetableEntry.objects.get(id=timetable_entry_id)
        
        # Check if user has permission (admin only for now)
        if not request.user.is_admin:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        # Check if meeting already exists
        existing_meeting = timetable_entry.meetings.filter(
            platform='jitsi',
            status__in=['scheduled', 'live']
        ).first()
        
        if existing_meeting:
            return Response({
                'message': 'Meeting already exists for this timetable entry',
                'meeting': MeetingSerializer(existing_meeting).data
            })
        
        # Create meeting for today
        meeting = timetable_entry.create_meeting_for_today(admin_host=request.user)
        
        if not meeting:
            return Response({'error': 'Failed to create meeting'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Update timetable entry to indicate it has video call
        timetable_entry.has_video_call = True
        timetable_entry.save()
        
        return Response({
            'message': 'Meeting created successfully for timetable entry',
            'meeting': MeetingSerializer(meeting).data,
            'timetable_entry': TimetableEntrySerializer(timetable_entry).data
        }, status=status.HTTP_201_CREATED)
        
    except TimetableEntry.DoesNotExist:
        return Response({'error': 'Timetable entry not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_timetable_with_meetings(request):
    """Get timetable entries with their associated meetings"""
    queryset = TimetableEntry.objects.all().prefetch_related('meetings', 'course')
    
    # Apply filters
    year = request.query_params.get('year', None)
    semester = request.query_params.get('semester', None)
    
    if year:
        queryset = queryset.filter(course__year=year)
    if semester:
        queryset = queryset.filter(course__semester=semester)
    
    serializer = TimetableEntrySerializer(queryset.order_by('day', 'time'), many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_timetable_meeting(request, timetable_entry_id):
    """Join the meeting associated with a timetable entry"""
    try:
        timetable_entry = TimetableEntry.objects.get(id=timetable_entry_id)
        
        # Get or create meeting for this timetable entry
        meeting = timetable_entry.get_or_create_meeting_for_today(admin_host=request.user)
        
        if not meeting:
            return Response({'error': 'Failed to create or retrieve meeting'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Check if user can join
        if not meeting.can_join_now:
            return Response({'error': 'Meeting is not available for joining at this time'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate join URL
        user_name = request.user.get_full_name() or request.user.email
        
        if meeting.platform == 'daily':
            # For Daily.co, we'll use the room URL directly
            join_url = meeting.video_join_url
            
            # If Daily.co room URL is empty, fallback to Jitsi
            if not join_url:
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"Daily.co room URL is empty for meeting {meeting.id}, falling back to Jitsi")
                # Generate a Jitsi URL as fallback
                jitsi_room_name = f"meeting-{meeting.id}-{meeting.course.code.lower().replace(' ', '-')}"
                join_url = f"https://meet.jit.si/{jitsi_room_name}"
        elif meeting.platform == 'jitsi':
            base_url = meeting.jitsi_join_url
            
            if '?' in base_url:
                join_url = f"{base_url}&userInfo.displayName={user_name}"
            else:
                join_url = f"{base_url}?userInfo.displayName={user_name}"
        else:
            join_url = meeting.meeting_url
        
        # Generate Daily.co token if needed
        daily_token = None
        if meeting.platform == 'daily' and meeting.daily_room_name:
            try:
                from .daily_service import daily_service
                if daily_service.is_api_configured():
                    is_owner = request.user == meeting.admin_host or request.user.is_admin
                    token_data = daily_service.create_meeting_token(
                        room_name=meeting.daily_room_name,
                        user_id=str(request.user.id),
                        user_name=user_name,
                        is_owner=is_owner
                    )
                    daily_token = token_data.get('token')
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to generate Daily.co token: {str(e)}")
        
        # Determine the actual platform being used based on the URL
        actual_platform = meeting.platform
        if meeting.platform == 'daily' and 'daily.co' not in join_url:
            actual_platform = 'jitsi'  # Fallback to Jitsi
        
        return Response({
            'meeting_id': meeting.id,
            'join_url': join_url,
            'meeting_title': meeting.title,
            'user_name': user_name,
            'admin_host': meeting.admin_host.get_full_name() if meeting.admin_host else None,
            'platform': actual_platform,
            'daily_token': daily_token if actual_platform == 'daily' else None,
            'daily_room_name': meeting.daily_room_name if actual_platform == 'daily' else None,
            'timetable_entry': TimetableEntrySerializer(timetable_entry).data
        })
        
    except TimetableEntry.DoesNotExist:
        return Response({'error': 'Timetable entry not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_meeting_for_timetable_entry(request, timetable_entry_id):
    """Delete the meeting associated with a timetable entry"""
    try:
        timetable_entry = TimetableEntry.objects.get(id=timetable_entry_id)
        
        # Check if user has permission (admin only)
        if not request.user.is_admin:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get meetings for this timetable entry
        meetings = timetable_entry.meetings.all()
        
        if not meetings.exists():
            return Response({'error': 'No meetings found for this timetable entry'}, status=status.HTTP_404_NOT_FOUND)
        
        # Delete meetings
        meeting_count = meetings.count()
        meetings.delete()
        
        # Update timetable entry
        timetable_entry.has_video_call = False
        timetable_entry.save()
        
        return Response({
            'message': f'Successfully deleted {meeting_count} meeting(s) for this timetable entry'
        })
        
    except TimetableEntry.DoesNotExist:
        return Response({'error': 'Timetable entry not found'}, status=status.HTTP_404_NOT_FOUND)


# Jitsi JWT Authentication Views
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_jitsi_token(request):
    """Generate JWT token for Jitsi Meet authentication"""
    try:
        data = request.data
        room_name = data.get('room_name')
        meeting_id = data.get('meeting_id')
        
        if not room_name:
            return Response({'error': 'Room name is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user has permission to join this room
        user = request.user
        
        # Determine if user should be moderator
        is_moderator = jitsi_auth.is_user_moderator(user, meeting_id)
        
        # Generate JWT token
        token = jitsi_auth.generate_token(
            user=user,
            room_name=room_name,
            moderator=is_moderator,
            display_name=f"{user.first_name} {user.last_name}".strip() or user.username
        )
        
        # Generate authenticated room URL
        room_url = jitsi_auth.generate_room_url(room_name, token)
        
        return Response({
            'token': token,
            'room_url': room_url,
            'room_name': room_name,
            'is_moderator': is_moderator,
            'user': {
                'id': user.id,
                'name': f"{user.first_name} {user.last_name}".strip() or user.username,
                'email': user.email
            }
        })
        
    except Exception as e:
        logger.error(f"Error generating Jitsi token: {str(e)}")
        return Response({'error': 'Failed to generate token'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_meeting_token(request, meeting_id):
    """Generate JWT token for a specific meeting"""
    try:
        meeting = Meeting.objects.get(id=meeting_id)
        user = request.user
        
        # Check if user has permission to join this meeting
        # For now, allow all authenticated users to join
        # You can add more specific permission checks here
        
        # Generate room name from meeting
        room_name = f"meeting-{meeting.id}-{meeting.course.code.lower().replace(' ', '-')}"
        
        # Determine if user should be moderator
        is_moderator = jitsi_auth.is_user_moderator(user, meeting_id)
        
        # Generate JWT token
        token = jitsi_auth.generate_token(
            user=user,
            room_name=room_name,
            moderator=is_moderator,
            display_name=f"{user.first_name} {user.last_name}".strip() or user.username
        )
        
        # Generate authenticated room URL
        room_url = jitsi_auth.generate_room_url(room_name, token)
        
        return Response({
            'token': token,
            'room_url': room_url,
            'room_name': room_name,
            'meeting_id': meeting.id,
            'is_moderator': is_moderator,
            'user': {
                'id': user.id,
                'name': f"{user.first_name} {user.last_name}".strip() or user.username,
                'email': user.email
            }
        })
        
    except Meeting.DoesNotExist:
        return Response({'error': 'Meeting not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error generating meeting token: {str(e)}")
        return Response({'error': 'Failed to generate token'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_jitsi_token(request):
    """Verify JWT token (for Jitsi server callback)"""
    try:
        token = request.data.get('token')
        if not token:
            return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify token
        payload = jitsi_auth.verify_token(token)
        
        return Response({
            'valid': True,
            'payload': payload
        })
        
    except Exception as e:
        return Response({
            'valid': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)