# Course Organizer

A comprehensive course management system built with Django REST Framework backend and Angular frontend, designed specifically for University of Nairobi School of Law Module II evening students.

## 🏗️ Architecture

This is a monorepo containing:

- **Backend**: Django REST Framework API
- **Frontend**: Angular application
- **Database**: PostgreSQL (production) / SQLite (development)
- **Containerization**: Docker & Docker Compose

## 📁 Project Structure

```
course-organizer/
├── backend/                  # Django + DRF backend
│   ├── manage.py
│   ├── requirements.txt
│   ├── pytest.ini           # Pytest configuration
│   ├── course_api/          # Django app for API
│   │   ├── tests/           # API tests
│   │   └── models.py
│   ├── directory/           # User management app
│   │   ├── tests/           # User model tests
│   │   └── models.py
│   ├── course_content/      # Content management app
│   ├── course_organizer/    # Django project settings
│   │   ├── settings.py
│   │   └── test_settings.py # Test-specific settings
│   └── static/              # Angular build output (served by Django)
├── frontend/                 # Angular app
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/        # Services, guards, interceptors
│   │   │   │   └── *.spec.ts # Unit tests
│   │   │   └── features/    # Feature modules
│   │   └── environments/
│   ├── package.json
│   ├── angular.json
│   └── tailwind.config.js
├── .github/                  # GitHub Actions workflows
│   └── workflows/
│       ├── ci.yml           # Continuous Integration
│       └── deploy-gce.yml   # GCE deployment
├── scripts/                  # Utility scripts
│   └── cleanup.py           # Code cleanup script
├── docker/                   # Docker configuration
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx.conf
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- Docker & Docker Compose (optional)
- Git

### Development Setup

#### Option 1: Quick Start Script (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd course-organizer

# Run the development startup script
./start-dev.sh

# This will start both backend and frontend automatically
# Frontend: http://localhost:4200
# Backend API: http://localhost:8000/api/
# Django Admin: http://localhost:8000/admin/
```

#### Option 2: Manual Setup

**Backend Setup:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py create_uon_law_data
python manage.py runserver 0.0.0.0:8000
```

**Frontend Setup (in a new terminal):**
```bash
cd frontend
npm install
npm start
```

#### Option 3: Docker (Alternative)

```bash
# Use the simplified development Docker setup
docker-compose -f docker/docker-compose.dev.yml up --build

# Access the application
# Frontend: http://localhost:4200
# Backend API: http://localhost:8000/api/
# Django Admin: http://localhost:8000/admin/
```

#### Check Service Status

```bash
# Check if all services are running
./check-status.sh
```

## 🔐 Authentication

The system uses token-based authentication with the following demo accounts:

### Demo Accounts

**Admin Account:**
- Email: `admin@uon.ac.ke`
- Password: `admin123`
- Registration: `GPR3/000001/2025`
- Role: Admin (can approve/reject registrations)

**Student Account:**
- Email: `john.doe@student.uon.ac.ke`
- Password: `student123`
- Registration: `GPR3/123456/2025`
- Role: Student

**Pending Account:**
- Email: `jane.smith@student.uon.ac.ke`
- Password: `student123`
- Registration: `GPR3/789012/2025`
- Status: Pending approval

## 📋 Features

### For Students
- **Registration**: Submit registration with University of Nairobi registration number
- **Dashboard**: View course overview and quick access to materials
- **Timetable**: View class schedule
- **Materials**: Access course materials and documents
- **Recordings**: Watch recorded lectures
- **Meetings**: Join online meetings and virtual classes

### For Administrators
- **User Management**: Approve/reject student registrations
- **Content Management**: Upload course materials, recordings, and schedule meetings
- **Admin Panel**: Access Django admin interface

## 🎨 Design System

The application uses the University of Nairobi color palette:

- **Primary Blue**: #2A68AF (Cerulean Blue)
- **Navy**: #122B40 (Elephant)
- **Accent**: #FF492C (Red Orange)

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/profile/` - Get user profile

### Admin
- `GET /api/admin/pending-registrations/` - Get pending registrations
- `POST /api/admin/approve-user/{id}/` - Approve user
- `POST /api/admin/reject-user/{id}/` - Reject user

### Course Data
- `GET /api/timetable/` - Get timetable entries
- `GET /api/materials/` - Get course materials
- `GET /api/recordings/` - Get recordings
- `GET /api/meetings/` - Get meetings

## 🛠️ Development

### Backend Development

```bash
cd backend
source venv/bin/activate

# Run tests
python manage.py test

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Load demo data
python manage.py create_uon_law_data
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## 🐳 Docker Commands

```bash
# Build and start all services
docker-compose -f docker/docker-compose.yml up --build

# Start in background
docker-compose -f docker/docker-compose.yml up -d

# Stop all services
docker-compose -f docker/docker-compose.yml down

# View logs
docker-compose -f docker/docker-compose.yml logs -f

# Rebuild specific service
docker-compose -f docker/docker-compose.yml up --build backend
```

## 📦 Production Deployment

### Environment Variables

Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=your-domain.com
DATABASE_URL=postgresql://user:password@localhost:5432/course_organizer
```

### Database Migration

```bash
# For production, use PostgreSQL
pip install psycopg2-binary

# Update settings.py to use PostgreSQL
# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic
```

## 🧪 Testing

### Backend Testing

The backend uses **pytest** with comprehensive test coverage:

```bash
# Install test dependencies
cd backend
pip install -r requirements.txt

# Run all tests
pytest

# Run tests with coverage
pytest --cov=. --cov-report=html

# Run specific test file
pytest directory/tests/test_models.py

# Run tests with verbose output
pytest -v
```

**Test Structure:**
- `directory/tests/` - User model and authentication tests
- `course_api/tests/` - Course and meeting model tests
- `course_content/tests/` - Content management tests

### Frontend Testing

The frontend uses **Jasmine** and **Karma** for unit testing:

```bash
# Install dependencies
cd frontend
npm install

# Run tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:ci

# Run tests with coverage
npm run test:coverage
```

**Test Structure:**
- `*.spec.ts` files alongside components
- Service tests in `core/` directory
- Component tests for each feature

### Test Coverage

- **Backend**: Minimum 80% coverage required
- **Frontend**: Minimum 70% coverage required
- Coverage reports generated in `htmlcov/` and `coverage/` directories

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

#### 1. Continuous Integration (`ci.yml`)
- **Triggers**: Push to `main`/`develop`, Pull Requests
- **Jobs**:
  - Backend tests with PostgreSQL
  - Frontend tests with coverage
  - Security scanning with Trivy
  - Build verification
  - Staging deployment (develop branch)
  - Production deployment (main branch)

#### 2. GCE Deployment (`deploy-gce.yml`)
- **Triggers**: Push to `main`, Manual dispatch
- **Features**:
  - Automated deployment to Google Cloud Engine
  - Health checks and rollback capability
  - Zero-downtime deployments
  - Environment-specific configurations

### Deployment Process

1. **Code Push** → GitHub Actions triggered
2. **Tests Run** → Backend & Frontend tests executed
3. **Security Scan** → Vulnerability scanning
4. **Build** → Application built and packaged
5. **Deploy** → Deployed to GCE instance
6. **Health Check** → Verify deployment success
7. **Rollback** → Automatic rollback if deployment fails

## 🧹 Code Quality & Cleanup

### Automated Cleanup Script

Use the provided cleanup script to maintain code quality:

```bash
# Basic cleanup (removes cache, build artifacts, etc.)
python scripts/cleanup.py

# Full cleanup with all optimizations
python scripts/cleanup.py --all

# Specific cleanup options
python scripts/cleanup.py --format    # Format code
python scripts/cleanup.py --lint      # Run linting
python scripts/cleanup.py --optimize  # Optimize images
python scripts/cleanup.py --update    # Update dependencies
```

### Code Quality Tools

**Backend:**
- **Black** - Code formatting
- **Flake8** - Linting and style checking
- **Pytest** - Testing framework
- **Coverage** - Test coverage analysis

**Frontend:**
- **Prettier** - Code formatting
- **ESLint** - Linting and style checking
- **Jasmine/Karma** - Testing framework
- **Angular CLI** - Built-in testing tools

### Pre-commit Hooks

Set up pre-commit hooks for automatic code quality checks:

```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install

# Run on all files
pre-commit run --all-files
```

## 🔒 Security

### Security Measures

- **Dependency Scanning** - Automated vulnerability scanning
- **Code Analysis** - Static code analysis with Trivy
- **Environment Variables** - Sensitive data in environment variables
- **HTTPS Only** - All production traffic encrypted
- **Authentication** - Token-based authentication
- **Authorization** - Role-based access control

### Security Best Practices

1. **Never commit secrets** - Use environment variables
2. **Regular updates** - Keep dependencies updated
3. **Input validation** - Validate all user inputs
4. **SQL injection prevention** - Use Django ORM
5. **XSS prevention** - Angular's built-in protection
6. **CSRF protection** - Django's CSRF middleware

## 📊 Monitoring & Logging

### Application Monitoring

- **Health Checks** - Automated health monitoring
- **Error Tracking** - Comprehensive error logging
- **Performance Metrics** - Response time monitoring
- **User Analytics** - Usage statistics

### Logging Configuration

- **Development** - Console logging with debug level
- **Production** - File logging with error level
- **Structured Logging** - JSON format for easy parsing

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Write** tests for your changes
4. **Implement** your feature
5. **Run** tests and ensure they pass
6. **Format** code using provided tools
7. **Commit** your changes (`git commit -m 'Add some amazing feature'`)
8. **Push** to the branch (`git push origin feature/amazing-feature`)
9. **Open** a Pull Request

### Pull Request Requirements

- ✅ All tests must pass
- ✅ Code coverage must not decrease
- ✅ Code must be formatted and linted
- ✅ Security scan must pass
- ✅ Documentation updated if needed
- ✅ No breaking changes without migration

### Code Review Process

1. **Automated Checks** - CI/CD pipeline runs automatically
2. **Peer Review** - At least one team member review
3. **Testing** - Manual testing of new features
4. **Approval** - Maintainer approval required
5. **Merge** - Squash and merge to main branch

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

## 🔮 Future Enhancements

- [ ] Email notifications for registration approval
- [ ] File upload functionality for course materials
- [ ] Real-time notifications
- [ ] Mobile app development
- [ ] Integration with University systems
- [ ] Advanced analytics and reporting
- [ ] Multi-language support