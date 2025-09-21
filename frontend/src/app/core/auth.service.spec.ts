import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login user successfully', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      full_name: 'Test User',
      registration_number: 'GPR1234',
      is_active: true,
      is_staff: false,
      is_superuser: false
    };

    const mockResponse = {
      token: 'mock-token',
      user: mockUser
    };

    service.login('test@example.com', 'password').subscribe(response => {
      expect(response.token).toBe('mock-token');
      expect(response.user.email).toBe('test@example.com');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'test@example.com',
      password: 'password'
    });

    req.flush(mockResponse);
  });

  it('should register user successfully', () => {
    const mockUser = {
      id: 1,
      email: 'newuser@example.com',
      full_name: 'New User',
      registration_number: 'GPR5678',
      is_active: true,
      is_staff: false,
      is_superuser: false
    };

    const registrationData = {
      email: 'newuser@example.com',
      full_name: 'New User',
      registration_number: 'GPR5678',
      phone_number: '+254712345678',
      password: 'password123',
      password_confirm: 'password123'
    };

    service.register(registrationData).subscribe(response => {
      expect(response.email).toBe('newuser@example.com');
      expect(response.full_name).toBe('New User');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(registrationData);

    req.flush(mockUser);
  });

  it('should logout user successfully', () => {
    service.logout().subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/logout/`);
    expect(req.request.method).toBe('POST');

    req.flush({});
  });

  it('should get current user from localStorage', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      full_name: 'Test User',
      registration_number: 'GPR1234',
      is_active: true,
      is_staff: false,
      is_superuser: false
    };

    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    localStorage.setItem('authToken', 'mock-token');

    const currentUser = service.getCurrentUser();
    expect(currentUser).toEqual(mockUser);

    const token = service.getAuthToken();
    expect(token).toBe('mock-token');
  });

  it('should clear user data on logout', () => {
    localStorage.setItem('currentUser', JSON.stringify({}));
    localStorage.setItem('authToken', 'mock-token');

    service.logout().subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/logout/`);
    req.flush({});

    // Check that localStorage is cleared
    expect(localStorage.getItem('currentUser')).toBeNull();
    expect(localStorage.getItem('authToken')).toBeNull();
  });

  it('should handle login error', () => {
    service.login('test@example.com', 'wrongpassword').subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(400);
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login/`);
    req.flush({ error: 'Invalid credentials' }, { status: 400, statusText: 'Bad Request' });
  });
});
