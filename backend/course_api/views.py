import logging
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import login
from django.db.models import Q
from django.http import JsonResponse
from directory.models import User
from .models import Course, TimetableEntry, CourseMaterial, Recording, Meeting, JitsiRecording, CourseContent, StudyGroup, StudyGroupMembership, GroupMeeting, StudyGroupJoinRequest, GroupMessage
from .serializers import (
    UserRegistrationSerializer, UserSerializer, LoginSerializer,
    CourseSerializer, TimetableEntrySerializer, CourseMaterialSerializer,
    RecordingSerializer, MeetingSerializer, JitsiRecordingSerializer, TimetableEntryWithRecordingsSerializer,
    CourseWithDetailsSerializer, CourseContentSerializer, CourseContentCreateSerializer, CourseTimelineSerializer,
    StudyGroupSerializer, StudyGroupCreateSerializer, StudyGroupMembershipSerializer, GroupMeetingSerializer, StudyGroupJoinRequestSerializer, GroupMessageSerializer
)
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def group_messages(request, group_id: int):
    try:
        group = StudyGroup.objects.get(pk=group_id)
    except StudyGroup.DoesNotExist:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    # Only members can access
    if not StudyGroupMembership.objects.filter(group=group, user=request.user).exists():
        return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        limit = int(request.query_params.get('limit', 50))
        msgs = GroupMessage.objects.filter(group=group, deleted=False).order_by('-created_at')[:limit]
        data = GroupMessageSerializer(reversed(list(msgs)), many=True, context={'request': request}).data
        return Response(data)

    # POST
    serializer = GroupMessageSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    GroupMessage.objects.create(group=group, sender=request.user, body=serializer.validated_data['body'])
    return Response({'status': 'ok'})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_message(request, group_id: int, message_id: int):
    """Soft delete a message. Only the sender or group admin can delete messages."""
    try:
        group = StudyGroup.objects.get(pk=group_id)
        message = GroupMessage.objects.get(pk=message_id, group=group)
    except (StudyGroup.DoesNotExist, GroupMessage.DoesNotExist):
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    # Only members can access
    if not StudyGroupMembership.objects.filter(group=group, user=request.user).exists():
        return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    # Check if user can delete this message (sender or admin)
    is_sender = message.sender == request.user
    is_admin = StudyGroupMembership.objects.filter(
        group=group, user=request.user, role='admin'
    ).exists()

    if not (is_sender or is_admin):
        return Response({'detail': 'You can only delete your own messages or be an admin'}, status=status.HTTP_403_FORBIDDEN)

    # Soft delete the message
    from django.utils import timezone
    message.deleted = True
    message.deleted_at = timezone.now()
    message.deleted_by = request.user
    message.save()

    return Response({'status': 'deleted'})
from .jitsi_auth import jitsi_auth
from .email_service import notify_admin_of_student_registration

# Module-level logger for use across views
logger = logging.getLogger(__name__)


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
            # Notify admin of new signup pending approval
            try:
                notify_admin_of_student_registration(
                    first_name=user.first_name,
                    last_name=user.last_name,
                    email=user.email,
                    registration_number=user.registration_number,
                    source="student_signup"
                )
            except Exception:
                pass
            
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


# -------------------------
# Study Groups
# -------------------------

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def list_create_study_groups(request):
    """List study groups in user's class or create a new group."""
    if request.method == 'GET':
        queryset = StudyGroup.objects.all()
        # If user belongs to a class, default scope to their class
        if getattr(request.user, 'student_class', None):
            queryset = queryset.filter(student_class=request.user.student_class)
        name = request.query_params.get('q')
        if name:
            queryset = queryset.filter(name__icontains=name)
        groups = queryset.order_by('name')
        return Response(StudyGroupSerializer(groups, many=True).data)

    # POST create
    serializer = StudyGroupCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        group = serializer.save()
        return Response(StudyGroupSerializer(group).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_study_groups(request):
    """List groups where the current user is a member."""
    memberships = StudyGroupMembership.objects.filter(user=request.user).select_related('group')
    groups = [m.group for m in memberships]
    return Response(StudyGroupSerializer(groups, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_join_study_group(request, group_id):
    """Request to join a study group (auto-join if not private and capacity allows)."""
    try:
        group = StudyGroup.objects.get(id=group_id)
    except StudyGroup.DoesNotExist:
        return Response({'error': 'Group not found'}, status=status.HTTP_404_NOT_FOUND)

    # Already a member?
    if StudyGroupMembership.objects.filter(group=group, user=request.user).exists():
        return Response({'message': 'Already a member'}, status=status.HTTP_200_OK)

    # Enforce single group per course per user
    if group.course:
        existing_membership = StudyGroupMembership.objects.filter(
            user=request.user,
            group__course=group.course
        ).first()
        if existing_membership:
            return Response({'error': 'You already belong to a study group for this course'}, status=status.HTTP_400_BAD_REQUEST)

    # Capacity check
    if group.memberships.count() >= group.max_members:
        return Response({'error': 'Group is full'}, status=status.HTTP_400_BAD_REQUEST)

    if group.is_private:
        # Create a pending join request
        join_req, created = StudyGroupJoinRequest.objects.get_or_create(group=group, user=request.user)
        if not created and join_req.status == 'pending':
            return Response({'message': 'Join request already pending'})
        join_req.status = 'pending'
        join_req.save()
        return Response({'message': 'Join request submitted'}, status=status.HTTP_201_CREATED)
    else:
        # Auto-join
        StudyGroupMembership.objects.create(group=group, user=request.user, role='member')
        return Response({'message': 'Joined group successfully'}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def group_members(request, group_id):
    """List members of a group."""
    try:
        group = StudyGroup.objects.get(id=group_id)
    except StudyGroup.DoesNotExist:
        return Response({'error': 'Group not found'}, status=status.HTTP_404_NOT_FOUND)
    members = StudyGroupMembership.objects.filter(group=group).select_related('user')
    return Response(StudyGroupMembershipSerializer(members, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def group_meetings(request, group_id):
    """List meetings for a group."""
    try:
        group = StudyGroup.objects.get(id=group_id)
    except StudyGroup.DoesNotExist:
        return Response({'error': 'Group not found'}, status=status.HTTP_404_NOT_FOUND)
    meetings = GroupMeeting.objects.filter(group=group).order_by('-scheduled_time')
    return Response(GroupMeetingSerializer(meetings, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_group_meeting(request, group_id):
    """Create a meeting for a group (creator becomes host)."""
    try:
        group = StudyGroup.objects.get(id=group_id)
    except StudyGroup.DoesNotExist:
        return Response({'error': 'Group not found'}, status=status.HTTP_404_NOT_FOUND)

    # Only members can create meetings
    if not StudyGroupMembership.objects.filter(group=group, user=request.user).exists():
        return Response({'error': 'Only group members can create meetings'}, status=status.HTTP_403_FORBIDDEN)

    data = request.data.copy()
    data['group'] = group.id
    data['created_by'] = request.user.id

    # default platform jitsi; allow physical with required location
    platform = data.get('platform') or 'jitsi'
    data['platform'] = platform
    if platform == 'physical' and not data.get('location'):
        return Response({'error': 'Location is required for physical meetings'}, status=status.HTTP_400_BAD_REQUEST)

    serializer = GroupMeetingSerializer(data=data)
    if serializer.is_valid():
        meeting = serializer.save()
        return Response(GroupMeetingSerializer(meeting).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_join_request(request, group_id, request_id):
    """Approve a pending join request (class rep or group admin)."""
    try:
        group = StudyGroup.objects.get(id=group_id)
        join_req = StudyGroupJoinRequest.objects.get(id=request_id, group=group)
    except (StudyGroup.DoesNotExist, StudyGroupJoinRequest.DoesNotExist):
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    # Permission: group admins or class reps can approve
    is_group_admin = StudyGroupMembership.objects.filter(group=group, user=request.user, role='admin').exists()
    is_class_rep = hasattr(request.user, 'class_rep_role') and request.user.class_rep_role.is_active
    if not (is_group_admin or is_class_rep or request.user.is_admin):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    if join_req.status != 'pending':
        return Response({'error': 'Request is not pending'}, status=status.HTTP_400_BAD_REQUEST)

    # Enforce single group per course before approving
    if group.course and StudyGroupMembership.objects.filter(user=join_req.user, group__course=group.course).exists():
        return Response({'error': 'User already in a study group for this course'}, status=status.HTTP_400_BAD_REQUEST)

    # Capacity check
    if group.memberships.count() >= group.max_members:
        return Response({'error': 'Group is full'}, status=status.HTTP_400_BAD_REQUEST)

    StudyGroupMembership.objects.create(group=group, user=join_req.user, role='member')
    join_req.status = 'approved'
    join_req.approver = request.user
    join_req.save()
    return Response({'message': 'Join request approved'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deny_join_request(request, group_id, request_id):
    """Deny a pending join request (class rep or group admin)."""
    try:
        group = StudyGroup.objects.get(id=group_id)
        join_req = StudyGroupJoinRequest.objects.get(id=request_id, group=group)
    except (StudyGroup.DoesNotExist, StudyGroupJoinRequest.DoesNotExist):
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    is_group_admin = StudyGroupMembership.objects.filter(group=group, user=request.user, role='admin').exists()
    is_class_rep = hasattr(request.user, 'class_rep_role') and request.user.class_rep_role.is_active
    if not (is_group_admin or is_class_rep or request.user.is_admin):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    if join_req.status != 'pending':
        return Response({'error': 'Request is not pending'}, status=status.HTTP_400_BAD_REQUEST)

    join_req.status = 'denied'
    join_req.approver = request.user
    join_req.save()
    return Response({'message': 'Join request denied'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_member_to_group(request, group_id):
    """Add a member directly (class rep or group admin)."""
    try:
        group = StudyGroup.objects.get(id=group_id)
    except StudyGroup.DoesNotExist:
        return Response({'error': 'Group not found'}, status=status.HTTP_404_NOT_FOUND)

    is_group_admin = StudyGroupMembership.objects.filter(group=group, user=request.user, role='admin').exists()
    is_class_rep = hasattr(request.user, 'class_rep_role') and request.user.class_rep_role.is_active
    if not (is_group_admin or is_class_rep or request.user.is_admin):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    user_id = request.data.get('user_id')
    if not user_id:
        return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        target_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    if StudyGroupMembership.objects.filter(group=group, user=target_user).exists():
        return Response({'message': 'User already a member'})

    if group.course and StudyGroupMembership.objects.filter(user=target_user, group__course=group.course).exists():
        return Response({'error': 'User already in a study group for this course'}, status=status.HTTP_400_BAD_REQUEST)

    if group.memberships.count() >= group.max_members:
        return Response({'error': 'Group is full'}, status=status.HTTP_400_BAD_REQUEST)

    StudyGroupMembership.objects.create(group=group, user=target_user, role='member')
    return Response({'message': 'Member added'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_member_from_group(request, group_id):
    """Remove a member (class rep or group admin)."""
    try:
        group = StudyGroup.objects.get(id=group_id)
    except StudyGroup.DoesNotExist:
        return Response({'error': 'Group not found'}, status=status.HTTP_404_NOT_FOUND)

    is_group_admin = StudyGroupMembership.objects.filter(group=group, user=request.user, role='admin').exists()
    is_class_rep = hasattr(request.user, 'class_rep_role') and request.user.class_rep_role.is_active
    if not (is_group_admin or is_class_rep or request.user.is_admin):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    user_id = request.data.get('user_id')
    if not user_id:
        return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    deleted, _ = StudyGroupMembership.objects.filter(group=group, user_id=user_id).delete()
    if deleted:
        return Response({'message': 'Member removed'})
    return Response({'error': 'Membership not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def leave_study_group(request, group_id):
    """Leave a study group (self-removal)."""
    try:
        group = StudyGroup.objects.get(id=group_id)
    except StudyGroup.DoesNotExist:
        return Response({'error': 'Group not found'}, status=status.HTTP_404_NOT_FOUND)

    # Check if user is a member
    membership = StudyGroupMembership.objects.filter(group=group, user=request.user).first()
    if not membership:
        return Response({'error': 'You are not a member of this group'}, status=status.HTTP_400_BAD_REQUEST)

    # Check if user is the only admin (prevent leaving if they're the only admin)
    admin_count = StudyGroupMembership.objects.filter(group=group, role='admin').count()
    if membership.role == 'admin' and admin_count == 1:
        return Response({'error': 'Cannot leave group as the only admin. Transfer admin role first or delete the group.'}, status=status.HTTP_400_BAD_REQUEST)

    # Remove the membership
    membership.delete()
    return Response({'message': 'Successfully left the group'})


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


# Course Content Management Views

class CourseContentListView(generics.ListAPIView):
    """List course content with filtering"""
    serializer_class = CourseContentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = CourseContent.objects.filter(is_published=True)
        
        # Filter by course
        course_id = self.request.query_params.get('course_id')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        # Filter by content type
        content_type = self.request.query_params.get('content_type')
        if content_type:
            queryset = queryset.filter(content_type=content_type)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(lesson_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(lesson_date__lte=end_date)
        
        return queryset.order_by('lesson_date', 'lesson_order')


class CourseContentCreateView(generics.CreateAPIView):
    """Create new course content (admin and class rep only)"""
    serializer_class = CourseContentCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Check permissions
        if not self._has_content_permission():
            raise permissions.PermissionDenied("Only administrators and class representatives can add course content")
        
        serializer.save(uploaded_by=self.request.user)

    def _has_content_permission(self):
        """Check if user has permission to add content"""
        user = self.request.user
        
        # Admins can always add content
        if user.is_admin:
            return True
        
        # Check if user is a class rep
        if hasattr(user, 'class_rep_role') and user.class_rep_role.is_active:
            return True
        
        return False


class CourseContentUpdateView(generics.UpdateAPIView):
    """Update course content (admin and class rep only)"""
    serializer_class = CourseContentCreateSerializer
    permission_classes = [IsAuthenticated]
    queryset = CourseContent.objects.all()

    def perform_update(self, serializer):
        # Check permissions
        if not self._has_content_permission():
            raise permissions.PermissionDenied("Only administrators and class representatives can update course content")
        
        serializer.save()

    def _has_content_permission(self):
        """Check if user has permission to update content"""
        user = self.request.user
        
        # Admins can always update content
        if user.is_admin:
            return True
        
        # Check if user is a class rep
        if hasattr(user, 'class_rep_role') and user.class_rep_role.is_active:
            return True
        
        return False


class CourseContentDeleteView(generics.DestroyAPIView):
    """Delete course content (admin only)"""
    permission_classes = [IsAuthenticated]
    queryset = CourseContent.objects.all()

    def perform_destroy(self, instance):
        if not self.request.user.is_admin:
            raise permissions.PermissionDenied("Only administrators can delete course content")
        instance.delete()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_course_timeline(request, course_id):
    """Get course content timeline grouped by lesson date"""
    try:
        course = Course.objects.get(id=course_id)
        
        # Get date range filters
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        # Get timeline data from old CourseContent model
        timeline_data = CourseContent.get_timeline_for_course(course, start_date, end_date)
        
        # Get new course content types
        from course_content.models import CourseOutline, PastPaper, Material, Assignment, Announcement
        from course_content.serializers import CourseOutlineSerializer, PastPaperSerializer, MaterialSerializer, AssignmentSerializer, AnnouncementSerializer
        
        # Get all new content types for this course
        course_outlines = CourseOutline.objects.filter(course=course, is_published=True)
        past_papers = PastPaper.objects.filter(course=course, is_published=True)
        materials = Material.objects.filter(course=course, is_published=True)
        assignments = Assignment.objects.filter(course=course, is_published=True)
        announcements = Announcement.objects.filter(course=course, is_published=True)
        
        # Group by lesson date
        from collections import defaultdict
        grouped_content = defaultdict(list)
        
        # Add old content
        for content in timeline_data:
            grouped_content[content.lesson_date].append({
                'type': 'old_content',
                'data': CourseContentSerializer(content).data
            })
        
        # Add new content types (these don't have lesson_date, so we'll add them to a general section)
        general_content = []
        
        # Add course outlines
        for outline in course_outlines:
            general_content.append({
                'type': 'course_outline',
                'data': CourseOutlineSerializer(outline).data
            })
        
        # Add past papers
        for paper in past_papers:
            general_content.append({
                'type': 'past_paper',
                'data': PastPaperSerializer(paper).data
            })
        
        # Add materials
        for material in materials:
            general_content.append({
                'type': 'material',
                'data': MaterialSerializer(material).data
            })
        
        # Add assignments
        for assignment in assignments:
            general_content.append({
                'type': 'assignment',
                'data': AssignmentSerializer(assignment).data
            })
        
        # Add announcements
        for announcement in announcements:
            general_content.append({
                'type': 'announcement',
                'data': AnnouncementSerializer(announcement).data
            })
        
        # Create timeline response
        timeline = []
        
        # Add lesson-based content
        for lesson_date, content_list in sorted(grouped_content.items()):
            timeline.append({
                'lesson_date': lesson_date,
                'lesson_date_display': lesson_date.strftime('%B %d, %Y'),
                'content': content_list,
                'total_content': len(content_list)
            })
        
        # Add general content (course outlines, past papers, etc.) to a special section
        if general_content:
            timeline.append({
                'lesson_date': None,
                'lesson_date_display': 'Course Materials',
                'content': general_content,
                'total_content': len(general_content)
            })
        
        return Response({
            'course': CourseSerializer(course).data,
            'timeline': timeline,
            'total_lessons': len(timeline),
            'total_content': timeline_data.count() + len(general_content)
        })
        
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_lesson_content(request, course_id, lesson_date):
    """Get all content for a specific lesson date"""
    try:
        course = Course.objects.get(id=course_id)
        
        # Parse lesson date
        from datetime import datetime
        lesson_date_obj = datetime.strptime(lesson_date, '%Y-%m-%d').date()
        
        # Get lesson content
        content = CourseContent.get_lesson_content(course, lesson_date_obj)
        
        return Response({
            'course': CourseSerializer(course).data,
            'lesson_date': lesson_date,
            'lesson_date_display': lesson_date_obj.strftime('%B %d, %Y'),
            'content': CourseContentSerializer(content, many=True).data,
            'total_content': content.count()
        })
        
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
    except ValueError:
        return Response({'error': 'Invalid date format. Use YYYY-MM-DD'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def increment_content_view(request, content_id):
    """Increment view count for content"""
    try:
        content = CourseContent.objects.get(id=content_id, is_published=True)
        content.increment_view_count()
        
        return Response({
            'message': 'View count incremented',
            'view_count': content.view_count
        })
        
    except CourseContent.DoesNotExist:
        return Response({'error': 'Content not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def increment_content_download(request, content_id):
    """Increment download count for content"""
    try:
        content = CourseContent.objects.get(id=content_id, is_published=True)
        content.increment_download_count()
        
        return Response({
            'message': 'Download count incremented',
            'download_count': content.download_count
        })
        
    except CourseContent.DoesNotExist:
        return Response({'error': 'Content not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_course_content(request):
    """Get course content for the current user's courses"""
    user = request.user
    
    if not user.is_student:
        return Response({'error': 'Only students can access this endpoint'}, status=status.HTTP_403_FORBIDDEN)
    
    # Get user's courses
    courses = Course.get_courses_for_user(user)
    
    # Get recent content for each course
    course_content = []
    for course in courses:
        recent_content = course.course_contents.filter(is_published=True).order_by('-lesson_date', '-lesson_order')[:5]
        course_content.append({
            'course': CourseSerializer(course).data,
            'recent_content': CourseContentSerializer(recent_content, many=True).data,
            'total_content': course.course_contents.filter(is_published=True).count()
        })
    
    return Response({
        'user_courses': course_content,
        'total_courses': len(course_content)
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_course_content_file(request):
    """Upload file for course content (admin and class rep only)"""
    # Check permissions
    user = request.user
    has_permission = user.is_admin or (hasattr(user, 'class_rep_role') and user.class_rep_role.is_active)
    
    if not has_permission:
        return Response({'error': 'Only administrators and class representatives can upload files'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    # Handle file upload
    if 'file' not in request.FILES:
        return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    uploaded_file = request.FILES['file']
    
    # Validate file type and size
    allowed_types = ['audio/', 'video/', 'application/pdf', 'application/msword', 
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.ms-powerpoint',
                    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                    'image/']
    
    if not any(uploaded_file.content_type.startswith(t) for t in allowed_types):
        return Response({'error': 'File type not allowed'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check file size (50MB limit)
    max_size = 50 * 1024 * 1024  # 50MB
    if uploaded_file.size > max_size:
        return Response({'error': 'File size too large. Maximum size is 50MB'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Save file
    import os
    from django.conf import settings
    from django.utils import timezone
    
    # Create upload directory if it doesn't exist
    upload_dir = os.path.join(settings.MEDIA_ROOT, 'course_content')
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
    file_extension = os.path.splitext(uploaded_file.name)[1]
    filename = f"{timestamp}_{uploaded_file.name}"
    file_path = os.path.join(upload_dir, filename)
    
    # Save file
    with open(file_path, 'wb+') as destination:
        for chunk in uploaded_file.chunks():
            destination.write(chunk)
    
    # Return file information
    file_url = f"{settings.MEDIA_URL}course_content/{filename}"
    
    return Response({
        'message': 'File uploaded successfully',
        'file_url': file_url,
        'file_path': file_path,
        'file_size': uploaded_file.size,
        'content_type': uploaded_file.content_type,
        'filename': filename
    }, status=status.HTTP_201_CREATED)