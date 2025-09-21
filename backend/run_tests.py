#!/usr/bin/env python
"""
Test runner script for Course Organizer
"""
import os
import sys
import django
from django.conf import settings
from django.test.utils import get_runner

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "course_organizer.test_settings")
    django.setup()
    TestRunner = get_runner(settings)
    test_runner = TestRunner()
    failures = test_runner.run_tests(["directory.tests", "course_api.tests", "course_content.tests"])
    sys.exit(bool(failures))
