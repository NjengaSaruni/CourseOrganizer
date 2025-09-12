from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import login
from django.db.models import Q
from django.http import JsonResponse
from directory.models import User
from .models import Course, TimetableEntry, CourseMaterial, Recording, Meeting
from .serializers import (
    UserRegistrationSerializer, UserSerializer, LoginSerializer,
    CourseSerializer, TimetableEntrySerializer, CourseMaterialSerializer,
    RecordingSerializer, MeetingSerializer
)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint for Railway deployment"""
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
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'message': 'Registration successful. Your account is pending approval.',
            'user_id': user.id
        }, status=status.HTTP_201_CREATED)
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
    if not request.user.is_admin:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id, status='pending')
        user.status = 'approved'
        user.is_active = True
        user.save()
        
        # TODO: SMS notification disabled until Twilio account is properly configured
        # Send approval notification via SMS
        # from .sms_service import sms_service
        # sms_result = sms_service.send_approval_notification(
        #     phone_number=user.phone_number,
        #     student_name=user.get_full_name()
        # )
        
        response_data = {
            'message': 'User approved successfully',
            'sms_sent': False,  # sms_result['success'],
            'sms_message': 'SMS notification disabled - manual verification in progress'  # sms_result['message']
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


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
        return Response({'message': 'User rejected successfully'}, status=status.HTTP_200_OK)
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
    from directory.models import Class
    
    try:
        student_class = Class.objects.get(id=class_id)
        courses = Course.get_courses_for_class(student_class)
        
        serializer = CourseSerializer(courses, many=True)
        return Response({
            'class': {
                'id': student_class.id,
                'name': student_class.display_name,
                'program': student_class.get_program_display(),
                'graduation_year': student_class.graduation_year
            },
            'courses': serializer.data
        })
    except Class.DoesNotExist:
        return Response({'error': 'Class not found'}, status=status.HTTP_404_NOT_FOUND)