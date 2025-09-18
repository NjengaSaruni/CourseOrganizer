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

# Setup school structure (creates default class for new students)
echo "🏫 Setting up school structure..."
python manage.py setup_school_structure || echo "School structure setup failed"

# Create admin user if missing (with secure password generation)
echo "👤 Setting up admin user..."
if [ -z "${ADMIN_PASSWORD:-}" ]; then
  echo "⚠️  No ADMIN_PASSWORD set. Creating admin with secure random password..."
  python manage.py manage_admin create --email admin@uon.ac.ke --force
else
  echo "Using provided ADMIN_PASSWORD..."
  python manage.py manage_admin create --email admin@uon.ac.ke --password "${ADMIN_PASSWORD}" --force
fi

# Seed demo data
echo "📚 Creating demo data..."
python manage.py create_uon_law_data || echo "Skipping demo data creation"

# Start server
echo "🌐 Starting Django server..."
exec gunicorn --bind 0.0.0.0:8080 --workers 3 --timeout 120 course_organizer.wsgi:application