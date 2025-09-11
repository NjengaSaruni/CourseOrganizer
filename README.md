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
│   ├── course_api/          # Django app for API
│   ├── course_organizer/    # Django project settings
│   └── static/              # Angular build output (served by Django)
│       └── angular/         # Contains index.html, JS, CSS
├── frontend/                 # Angular app
│   ├── src/
│   ├── package.json
│   ├── angular.json
│   └── tailwind.config.js
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
- Node.js 18+
- Docker & Docker Compose (optional)

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

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