#!/bin/bash
set -euo pipefail

echo "🚀 Starting Course Organizer on GCE..."
echo "======================================"

# Ensure persistent SECRET_KEY
if [ -z "${SECRET_KEY:-}" ]; then
  if [ -f "/app/db/secret_key.txt" ]; then
    export SECRET_KEY="$(cat /app/db/secret_key.txt)"
    echo "Using existing SECRET_KEY from /app/db/secret_key.txt"
  else
    echo "Generating new SECRET_KEY..."
    SECRET_KEY_GEN=$(python - <<'PY'
import secrets
print(''.join(secrets.choice('abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(-_=+)') for _ in range(50)))
PY
)
    export SECRET_KEY="$SECRET_KEY_GEN"
    echo -n "$SECRET_KEY" > /app/db/secret_key.txt
    chmod 600 /app/db/secret_key.txt
    echo "SECRET_KEY generated and stored at /app/db/secret_key.txt"
  fi
fi

# Apply migrations
echo "⏳ Applying migrations..."
python manage.py migrate

# Create admin user if missing
echo "👤 Setting up admin user..."
python manage.py shell -c "
from directory.models import User
import os
if not User.objects.filter(email='admin@uon.ac.ke').exists():
    User.objects.create_superuser(
        email='admin@uon.ac.ke',
        password=os.environ.get('ADMIN_PASSWORD','admin123'),
        first_name='Admin',
        last_name='User',
        registration_number='GPR3/000001/2025',
        phone_number='+254700000000',
        user_type='admin'
    )
    print('Admin user created')
else:
    print('Admin user already exists')
"

# Seed demo data
echo "📚 Creating demo data..."
python manage.py create_uon_law_data || echo "Skipping demo data creation"

# Start server
echo "🌐 Starting Django server..."
exec gunicorn --bind 0.0.0.0:8080 --workers 3 --timeout 120 course_organizer.wsgi:application