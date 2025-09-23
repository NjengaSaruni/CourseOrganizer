from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.db.models import Q
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from .models import User, AcademicYear, Semester
from school.models import Class
from .extended_models import Student, Teacher, RegistrationRequest
from .serializers import (
    UserSerializer, StudentSerializer, StudentUserSerializer, TeacherSerializer,
    RegistrationRequestSerializer, RegistrationRequestCreateSerializer,
    StudentRegistrationSerializer,
    LoginSerializer, UserProfileSerializer, AcademicYearSerializer, ClassSerializer,
    SemesterSerializer
)
from course_api.email_service import notify_admin_of_student_registration


class AcademicYearListView(generics.ListAPIView):
    """List all academic years"""
    queryset = AcademicYear.objects.all()
    serializer_class = AcademicYearSerializer
    permission_classes = [permissions.IsAuthenticated]


class SemesterListView(generics.ListAPIView):
    """List all semesters, optionally filtered by academic year"""
    queryset = Semester.objects.all()
    serializer_class = SemesterSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        academic_year_id = self.request.query_params.get('academic_year')
        if academic_year_id:
            queryset = queryset.filter(academic_year_id=academic_year_id)
        return queryset


class ClassListView(generics.ListAPIView):
    """List all classes"""
    queryset = Class.objects.all()
    serializer_class = ClassSerializer
    permission_classes = [permissions.IsAuthenticated]


class ClassDetailView(generics.RetrieveAPIView):
    """Get class details"""
    queryset = Class.objects.all()
    serializer_class = ClassSerializer
    permission_classes = [permissions.IsAuthenticated]


class UserListView(generics.ListAPIView):
    """List all users (admin only)"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Only admins can see all users
        if not self.request.user.is_admin:
            return User.objects.none()
        return User.objects.all()


class UserDetailView(generics.RetrieveUpdateAPIView):
    """Get or update user details"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        # Users can only view/edit their own profile unless they're admin
        if self.request.user.is_admin and 'pk' in self.kwargs:
            return User.objects.get(pk=self.kwargs['pk'])
        return self.request.user


class StudentListView(generics.ListAPIView):
    """List all students"""
    queryset = User.objects.filter(user_type='student')
    serializer_class = StudentUserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Only admins and teachers can see all students
        if not (self.request.user.is_admin or self.request.user.is_teacher):
            return User.objects.none()
        
        queryset = User.objects.filter(user_type='student')
        
        # Filter by class_id if provided (now uses school.Class)
        class_id = self.request.query_params.get('class_id')
        if class_id:
            queryset = queryset.filter(student_class_id=class_id)
        
        # Filter by status if provided
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        
        return queryset


class StudentDetailView(generics.RetrieveAPIView):
    """Get student details"""
    queryset = User.objects.filter(user_type='student')
    serializer_class = StudentUserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        # Students can only view their own profile unless they're admin/teacher
        if self.request.user.is_admin or self.request.user.is_teacher:
            return User.objects.get(pk=self.kwargs['pk'])
        elif self.request.user.is_student:
            return self.request.user
        return None


class TeacherListView(generics.ListAPIView):
    """List all teachers"""
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [permissions.IsAuthenticated]


class TeacherDetailView(generics.RetrieveAPIView):
    """Get teacher details"""
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        # Teachers can only view their own profile unless they're admin
        if self.request.user.is_admin:
            return Teacher.objects.get(pk=self.kwargs['pk'])
        elif self.request.user.is_teacher and hasattr(self.request.user, 'teacher'):
            return self.request.user.teacher
        return None


class RegistrationRequestListView(generics.ListCreateAPIView):
    """List and create registration requests"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return RegistrationRequestCreateSerializer
        return RegistrationRequestSerializer
    
    def get_queryset(self):
        # Only admins can see all requests, others can only see their own
        if self.request.user.is_admin:
            return RegistrationRequest.objects.all()
        return RegistrationRequest.objects.filter(email=self.request.user.email)
    
    def perform_create(self, serializer):
        # Set the academic year to current if not provided
        if not serializer.validated_data.get('academic_year'):
            current_year = AcademicYear.get_current_academic_year()
            if current_year:
                serializer.save(academic_year=current_year)
            else:
                serializer.save()
        else:
            serializer.save()

        # Notify admin about new registration request
        try:
            data = serializer.validated_data
            notify_admin_of_student_registration(
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', ''),
                email=data.get('email', ''),
                registration_number=data.get('registration_number', None),
                source="registration_request"
            )
        except Exception:
            # Don't block creation if email fails
            pass


class RegistrationRequestDetailView(generics.RetrieveUpdateAPIView):
    """Get or update registration request details"""
    queryset = RegistrationRequest.objects.all()
    serializer_class = RegistrationRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        request_obj = RegistrationRequest.objects.get(pk=self.kwargs['pk'])
        # Users can only view their own requests unless they're admin
        if not self.request.user.is_admin and request_obj.email != self.request.user.email:
            return None
        return request_obj


@api_view(['POST'])
@authentication_classes([])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """User login endpoint"""
    import logging
    from django.contrib.auth import login
    
    logger = logging.getLogger(__name__)
    logger.info(f"Directory login attempt for email: {request.data.get('email', 'No email provided')}")
    
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        logger.info(f"User authenticated: {user.email}, Last login before: {user.last_login}")
        
        token, created = Token.objects.get_or_create(user=user)
        logger.info(f"Token {'created' if created else 'retrieved'}: {token.key[:10]}...")
        
        # Log before login
        logger.info(f"Before login() call - User last_login: {user.last_login}")
        
        # Call Django's login function to update last_login
        login(request, user)
        
        # Refresh user from database to get updated last_login
        user.refresh_from_db()
        logger.info(f"After login() call - User last_login: {user.last_login}")
        
        # Get user profile data
        user_data = UserSerializer(user).data
        logger.info(f"Returning user data with last_login: {user_data.get('last_login')}")
        
        # Add profile-specific data
        if user.is_student and hasattr(user, 'student'):
            user_data['student_profile'] = StudentSerializer(user.student).data
        elif user.is_teacher and hasattr(user, 'teacher'):
            user_data['teacher_profile'] = TeacherSerializer(user.teacher).data
        
        return Response({
            'token': token.key,
            'user': user_data
        })
    else:
        logger.error(f"Directory login failed for {request.data.get('email', 'No email')}: {serializer.errors}")
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def logout_view(request):
    """User logout endpoint"""
    import logging
    from django.contrib.auth import logout
    
    logger = logging.getLogger(__name__)
    
    # Get the token from the Authorization header
    auth_header = request.META.get('HTTP_AUTHORIZATION', '')
    if auth_header.startswith('Token '):
        token_key = auth_header.split(' ')[1]
        try:
            # Find and delete the token
            token = Token.objects.get(key=token_key)
            user = token.user
            logger.info(f"Logging out user: {user.email}")
            
            # Delete the token
            token.delete()
            
            # Also call Django's logout function to clear session
            if request.user.is_authenticated:
                logout(request)
            
            logger.info(f"Successfully logged out user: {user.email}")
            return Response({'message': 'Successfully logged out'})
            
        except Token.DoesNotExist:
            logger.warning(f"Attempted logout with invalid token: {token_key[:10]}...")
            # Token doesn't exist, but that's fine - user is already logged out
            return Response({'message': 'Already logged out'})
        except Exception as e:
            logger.error(f"Error during logout: {e}")
            return Response({'error': 'Error logging out'}, status=status.HTTP_400_BAD_REQUEST)
    else:
        logger.warning("Logout attempt without valid authorization header")
        # No token provided, but that's fine - user is already logged out
        return Response({'message': 'Already logged out'})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_profile(request):
    """Get current user's profile"""
    user_data = UserSerializer(request.user).data
    
    # Add profile-specific data
    if request.user.is_student and hasattr(request.user, 'student'):
        user_data['student_profile'] = StudentSerializer(request.user.student).data
    elif request.user.is_teacher and hasattr(request.user, 'teacher'):
        user_data['teacher_profile'] = TeacherSerializer(request.user.teacher).data
    
    return Response(user_data)


@api_view(['PUT', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_profile(request):
    """Update current user's profile"""
    serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def approve_registration_request(request, pk):
    """Approve a registration request (admin only)"""
    if not request.user.is_admin:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        reg_request = RegistrationRequest.objects.get(pk=pk)
        user = reg_request.approve(request.user)
        
        return Response({
            'message': 'Registration request approved successfully',
            'user': UserSerializer(user).data
        })
    except RegistrationRequest.DoesNotExist:
        return Response({'error': 'Registration request not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def reject_registration_request(request, pk):
    """Reject a registration request (admin only)"""
    if not request.user.is_admin:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        reg_request = RegistrationRequest.objects.get(pk=pk)
        notes = request.data.get('notes', '')
        reg_request.reject(request.user, notes)
        
        return Response({'message': 'Registration request rejected successfully'})
    except RegistrationRequest.DoesNotExist:
        return Response({'error': 'Registration request not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([permissions.AllowAny])
def register_student(request):
    """Register a student based on their registration number"""
    print(f"DEBUG: register_student called with method: {request.method}")
    print(f"DEBUG: request.user: {request.user}")
    print(f"DEBUG: request.user.is_authenticated: {request.user.is_authenticated}")
    print(f"DEBUG: request.data: {request.data}")
    print(f"DEBUG: request.headers: {dict(request.headers)}")
    
    serializer = StudentRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        print(f"DEBUG: User created successfully: {user.id}")
        # Notify admin that a student signed up and is pending approval
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
            'message': f'Registration successful! Your account is pending approval for {user.class_display_name}.',
            'user_id': user.id,
            'class': user.class_display_name,
            'program': user.student_class.program if user.student_class else 'Unknown',
            'graduation_year': user.class_of,
            'status': 'pending_approval'
        }, status=status.HTTP_201_CREATED)
    print(f"DEBUG: Serializer errors: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def search_users(request):
    """Search users by name, email, or registration number"""
    query = request.GET.get('q', '')
    user_type = request.GET.get('type', '')
    
    if not query:
        return Response({'error': 'Search query is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Build search query
    search_query = Q(first_name__icontains=query) | Q(last_name__icontains=query) | \
                   Q(email__icontains=query) | Q(registration_number__icontains=query)
    
    if user_type:
        search_query &= Q(user_type=user_type)
    
    users = User.objects.filter(search_query)
    
    # Limit results and apply permissions
    if not request.user.is_admin:
        # Non-admins can only see approved users
        users = users.filter(status='approved')
    
    users = users[:50]  # Limit to 50 results
    
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def class_info(request, class_id):
    """Get information about a specific class"""
    try:
        student_class = Class.objects.get(id=class_id)
        students = User.objects.filter(student_class=student_class, status='approved')
        
        class_data = ClassSerializer(student_class).data
        students_data = UserSerializer(students, many=True).data
        
        return Response({
            'class': class_data,
            'students': students_data,
            'total_students': students.count(),
            'pending_students': User.objects.filter(student_class=student_class, status='pending').count()
        })
    except Class.DoesNotExist:
        return Response({'error': 'Class not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_class_info(request):
    """Get current user's class information"""
    if not request.user.is_student or not request.user.student_class:
        return Response({'error': 'User is not assigned to any class'}, status=status.HTTP_400_BAD_REQUEST)
    
    student_class = request.user.student_class
    classmates = User.objects.filter(student_class=student_class, status='approved').exclude(id=request.user.id)
    
    class_data = ClassSerializer(student_class).data
    classmates_data = UserSerializer(classmates, many=True).data
    
    return Response({
        'class': class_data,
        'classmates': classmates_data,
        'total_classmates': classmates.count(),
        'is_class_of_2029': request.user.is_class_of_2029,
        'is_first_year_law_student': request.user.is_first_year_law_student
    })