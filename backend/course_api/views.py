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
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        login(request, user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)
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
        return Response({'message': 'User approved successfully'}, status=status.HTTP_200_OK)
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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_passcode(request, user_id):
    """Generate a random passcode for a user (admin only)"""
    if not request.user.is_admin:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id, status='pending')
        
        # Generate a 6-digit random passcode
        import random
        passcode = str(random.randint(100000, 999999))
        
        # Store passcode in user's bio field temporarily (in production, use a separate field)
        if not user.bio:
            user.bio = f"Passcode: {passcode}"
        else:
            # Update existing bio with new passcode
            if "Passcode:" in user.bio:
                user.bio = user.bio.split("Passcode:")[0].strip() + f" Passcode: {passcode}"
            else:
                user.bio += f" Passcode: {passcode}"
        
        user.save()
        
        return Response({
            'passcode': passcode,
            'message': f'Passcode {passcode} generated for {user.get_full_name()}'
        }, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_passcode_sms(request, user_id):
    """Send passcode via SMS (admin only)"""
    if not request.user.is_admin:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id, status='pending')
        passcode = request.data.get('passcode')
        
        if not passcode:
            return Response({'error': 'Passcode is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # In a real implementation, you would integrate with an SMS service like Twilio
        # For now, we'll just log the SMS content
        sms_message = f"Your Course Organizer passcode is: {passcode}. Use this to complete your registration."
        
        print(f"SMS to {user.phone_number}: {sms_message}")
        
        # TODO: Integrate with actual SMS service
        # Example with Twilio:
        # from twilio.rest import Client
        # client = Client(account_sid, auth_token)
        # message = client.messages.create(
        #     body=sms_message,
        #     from_='+1234567890',
        #     to=user.phone_number
        # )
        
        return Response({
            'message': f'SMS sent to {user.phone_number} with passcode {passcode}'
        }, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


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