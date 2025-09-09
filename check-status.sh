#!/bin/bash

echo "🔍 Checking Course Organizer Services Status..."
echo ""

# Check backend
echo "🔧 Backend (Django API):"
if curl -s http://localhost:8000/api/ > /dev/null; then
    echo "  ✅ Running on http://localhost:8000"
    echo "  📊 API: http://localhost:8000/api/"
    echo "  ⚙️ Admin: http://localhost:8000/admin/"
else
    echo "  ❌ Not running"
fi

echo ""

# Check frontend
echo "🎨 Frontend (Angular):"
if curl -s http://localhost:4200 > /dev/null; then
    echo "  ✅ Running on http://localhost:4200"
else
    echo "  ❌ Not running"
fi

echo ""

# Check database
echo "🗄️ Database:"
if curl -s http://localhost:8000/admin/ > /dev/null; then
    echo "  ✅ Connected (Django admin accessible)"
else
    echo "  ❌ Not accessible"
fi

echo ""
echo "📱 Access Points:"
echo "  Frontend: http://localhost:4200"
echo "  Backend API: http://localhost:8000/api/"
echo "  Django Admin: http://localhost:8000/admin/"
echo ""
echo "🔐 Demo Accounts:"
echo "  Admin: admin@uon.ac.ke / admin123"
echo "  Student: john.doe@student.uon.ac.ke / student123"
echo "  Pending: jane.smith@student.uon.ac.ke / student123"