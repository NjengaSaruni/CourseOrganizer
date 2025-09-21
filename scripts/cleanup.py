#!/usr/bin/env python3
"""
Code cleanup script for Course Organizer
"""
import os
import sys
import shutil
import subprocess
from pathlib import Path

def run_command(command, cwd=None):
    """Run a shell command and return the result"""
    try:
        result = subprocess.run(command, shell=True, cwd=cwd, capture_output=True, text=True)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def cleanup_python_cache():
    """Remove Python cache files"""
    print("🧹 Cleaning Python cache files...")
    
    cache_dirs = [
        "backend/__pycache__",
        "backend/*/__pycache__",
        "backend/*/*/__pycache__",
        "backend/*/*/*/__pycache__",
    ]
    
    for pattern in cache_dirs:
        run_command(f"find . -name '__pycache__' -type d -exec rm -rf {{}} + 2>/dev/null || true")
        run_command(f"find . -name '*.pyc' -delete 2>/dev/null || true")
        run_command(f"find . -name '*.pyo' -delete 2>/dev/null || true")

def cleanup_node_modules():
    """Remove node_modules and package-lock.json"""
    print("🧹 Cleaning Node.js files...")
    
    node_dirs = [
        "frontend/node_modules",
        "jitsi-service/node_modules",
    ]
    
    for dir_path in node_dirs:
        if os.path.exists(dir_path):
            print(f"  Removing {dir_path}")
            shutil.rmtree(dir_path, ignore_errors=True)
    
    # Remove package-lock.json files
    run_command("find . -name 'package-lock.json' -delete 2>/dev/null || true")

def cleanup_build_artifacts():
    """Remove build artifacts"""
    print("🧹 Cleaning build artifacts...")
    
    build_dirs = [
        "frontend/dist",
        "frontend/coverage",
        "backend/static/browser",
        "backend/media",
        "backend/test_media",
    ]
    
    for dir_path in build_dirs:
        if os.path.exists(dir_path):
            print(f"  Removing {dir_path}")
            shutil.rmtree(dir_path, ignore_errors=True)
    
    # Remove specific files
    files_to_remove = [
        "backend/db.sqlite3",
        "backend/debug.log",
        "debug.log",
        "*.log",
        "*.tmp",
        "*.temp",
    ]
    
    for pattern in files_to_remove:
        run_command(f"find . -name '{pattern}' -delete 2>/dev/null || true")

def cleanup_test_artifacts():
    """Remove test artifacts"""
    print("🧹 Cleaning test artifacts...")
    
    test_dirs = [
        "backend/htmlcov",
        "backend/.coverage",
        "backend/.pytest_cache",
        "frontend/coverage",
    ]
    
    for dir_path in test_dirs:
        if os.path.exists(dir_path):
            print(f"  Removing {dir_path}")
            shutil.rmtree(dir_path, ignore_errors=True)
    
    # Remove test result files
    run_command("find . -name 'test-results.xml' -delete 2>/dev/null || true")
    run_command("find . -name '.coverage' -delete 2>/dev/null || true")

def cleanup_git_files():
    """Remove Git-related temporary files"""
    print("🧹 Cleaning Git files...")
    
    git_files = [
        ".git/hooks/*.sample",
        ".git/refs/original",
        ".git/logs",
    ]
    
    for pattern in git_files:
        run_command(f"rm -rf {pattern} 2>/dev/null || true")

def cleanup_ide_files():
    """Remove IDE-specific files"""
    print("🧹 Cleaning IDE files...")
    
    ide_patterns = [
        ".vscode/settings.json",
        ".idea/",
        "*.swp",
        "*.swo",
        "*~",
        ".DS_Store",
        "Thumbs.db",
    ]
    
    for pattern in ide_patterns:
        run_command(f"find . -name '{pattern}' -delete 2>/dev/null || true")

def optimize_images():
    """Optimize images (if imagemagick is available)"""
    print("🖼️  Optimizing images...")
    
    success, _, _ = run_command("which convert")
    if not success:
        print("  ImageMagick not found, skipping image optimization")
        return
    
    image_dirs = [
        "frontend/public",
        "backend/media",
    ]
    
    for dir_path in image_dirs:
        if os.path.exists(dir_path):
            run_command(f"find {dir_path} -name '*.png' -exec convert {{}} -strip {{}} \\; 2>/dev/null || true")
            run_command(f"find {dir_path} -name '*.jpg' -exec convert {{}} -strip -quality 85 {{}} \\; 2>/dev/null || true")

def format_code():
    """Format code using available formatters"""
    print("🎨 Formatting code...")
    
    # Format Python code
    success, _, _ = run_command("which black")
    if success:
        print("  Formatting Python code with Black...")
        run_command("black backend/ --line-length 100 --exclude venv")
    else:
        print("  Black not found, skipping Python formatting")
    
    # Format TypeScript/JavaScript code
    if os.path.exists("frontend/package.json"):
        print("  Formatting TypeScript code with Prettier...")
        run_command("cd frontend && npm run format 2>/dev/null || true")

def lint_code():
    """Run linting on code"""
    print("🔍 Linting code...")
    
    # Lint Python code
    success, _, _ = run_command("which flake8")
    if success:
        print("  Linting Python code with Flake8...")
        run_command("flake8 backend/ --exclude=venv,migrations --max-line-length=100")
    else:
        print("  Flake8 not found, skipping Python linting")
    
    # Lint TypeScript code
    if os.path.exists("frontend/package.json"):
        print("  Linting TypeScript code with ESLint...")
        run_command("cd frontend && npm run lint 2>/dev/null || true")

def update_dependencies():
    """Update dependencies to latest versions"""
    print("📦 Updating dependencies...")
    
    # Update Python dependencies
    if os.path.exists("backend/requirements.txt"):
        print("  Updating Python dependencies...")
        run_command("cd backend && pip install --upgrade pip")
        run_command("cd backend && pip install -r requirements.txt --upgrade")
    
    # Update Node.js dependencies
    if os.path.exists("frontend/package.json"):
        print("  Updating Node.js dependencies...")
        run_command("cd frontend && npm update")

def generate_documentation():
    """Generate documentation"""
    print("📚 Generating documentation...")
    
    # Generate API documentation
    success, _, _ = run_command("which sphinx-build")
    if success and os.path.exists("docs/"):
        print("  Generating API documentation...")
        run_command("cd docs && make html")
    else:
        print("  Sphinx not found or docs directory missing, skipping documentation generation")

def main():
    """Main cleanup function"""
    print("🚀 Starting Course Organizer cleanup...")
    print("=" * 50)
    
    # Change to project root
    project_root = Path(__file__).parent.parent
    os.chdir(project_root)
    
    # Run cleanup tasks
    cleanup_python_cache()
    cleanup_node_modules()
    cleanup_build_artifacts()
    cleanup_test_artifacts()
    cleanup_git_files()
    cleanup_ide_files()
    
    # Optional tasks (can be enabled/disabled)
    if "--optimize" in sys.argv:
        optimize_images()
    
    if "--format" in sys.argv:
        format_code()
    
    if "--lint" in sys.argv:
        lint_code()
    
    if "--update" in sys.argv:
        update_dependencies()
    
    if "--docs" in sys.argv:
        generate_documentation()
    
    print("=" * 50)
    print("✅ Cleanup completed successfully!")
    print("\nUsage:")
    print("  python scripts/cleanup.py                    # Basic cleanup")
    print("  python scripts/cleanup.py --optimize         # Include image optimization")
    print("  python scripts/cleanup.py --format           # Include code formatting")
    print("  python scripts/cleanup.py --lint             # Include code linting")
    print("  python scripts/cleanup.py --update           # Include dependency updates")
    print("  python scripts/cleanup.py --docs             # Include documentation generation")
    print("  python scripts/cleanup.py --all              # Include all optional tasks")

if __name__ == "__main__":
    main()
