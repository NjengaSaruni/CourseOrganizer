from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.conf import settings
import os
import shutil
from pathlib import Path


class Command(BaseCommand):
    help = 'Reset the database completely - delete data, recreate migrations, and populate with fresh data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--skip-data',
            action='store_true',
            help='Skip creating initial data after reset',
        )

    def handle(self, *args, **options):
        """Reset the database completely"""
        
        self.stdout.write("🔄 Starting database reset process...")
        
        # Step 1: Delete the database file
        db_path = settings.DATABASES['default']['NAME']
        if os.path.exists(db_path):
            os.remove(db_path)
            self.stdout.write(
                self.style.SUCCESS(f"✅ Deleted database: {db_path}")
            )
        else:
            self.stdout.write(f"ℹ️  Database file not found: {db_path}")
        
        # Step 2: Remove migration files (except __init__.py)
        migrations_dir = Path('course_api/migrations')
        if migrations_dir.exists():
            for file in migrations_dir.iterdir():
                if file.name != '__init__.py' and file.suffix == '.py':
                    file.unlink()
                    self.stdout.write(f"✅ Removed migration: {file.name}")
        
        # Step 3: Create fresh migrations
        self.stdout.write("\n📝 Creating fresh migrations...")
        try:
            call_command('makemigrations', 'course_api')
            self.stdout.write(
                self.style.SUCCESS("✅ Fresh migrations created successfully")
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Error creating migrations: {e}")
            )
            return
        
        # Step 4: Apply migrations
        self.stdout.write("\n🚀 Applying migrations...")
        try:
            call_command('migrate')
            self.stdout.write(
                self.style.SUCCESS("✅ Migrations applied successfully")
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Error applying migrations: {e}")
            )
            return
        
        # Step 5: Create initial data (unless skipped)
        if not options['skip_data']:
            self.stdout.write("\n📚 Creating initial data...")
            try:
                # Set up academic year
                call_command('setup_academic_year')
                self.stdout.write("✅ Academic year setup completed")
                
                # Create UoN Law data
                call_command('create_uon_law_data')
                self.stdout.write("✅ UoN Law data created")
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"❌ Error creating initial data: {e}")
                )
                return
        
        self.stdout.write(
            self.style.SUCCESS("\n🎉 Database reset completed successfully!")
        )
        self.stdout.write("\n📋 Summary:")
        self.stdout.write("  - Database deleted and recreated")
        self.stdout.write("  - Fresh migrations applied")
        self.stdout.write("  - Academic year 2025/2026 configured")
        if not options['skip_data']:
            self.stdout.write("  - UoN Law courses and data created")
        self.stdout.write("  - Ready for First Year First Semester students")
