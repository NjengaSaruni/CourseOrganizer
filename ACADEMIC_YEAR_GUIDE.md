# Academic Year Structure Guide

## Overview
This application is designed to primarily support **First Year First Semester students** for the **2025/2026 school year** at the University of Nairobi (UoN) School of Law. The expected year of completion is **2029**.

## Academic Year Structure

### Academic Year Format
- **Academic Year**: 2025/2026 (September 2025 - August 2026)
- **Expected Graduation**: 2029 (Class of 2029)
- **Primary Focus**: First Year First Semester students

### Semester Structure
The application supports **three semesters** per academic year:

1. **First Semester**: September 1st - December 13th
2. **Second Semester**: January - April (following year)
3. **Holiday Semester**: May - August (break period)

### Key Dates for 2025/2026 Academic Year
- **First Semester Start**: September 1, 2025
- **First Semester End**: December 13, 2025
- **Second Semester Start**: January 2026
- **Second Semester End**: April 2026
- **Holiday Period**: May - August 2026

## Current Application Focus

### Target Users
- **Primary**: First Year First Semester UoN School of Law students
- **Academic Year**: 2025/2026
- **Registration Format**: GPR3/XXXXXX/2025

### Course Structure
- **Year 1 Courses**: GPR31xx series
- **Semester**: First Semester only (for current focus)
- **Credits**: Standard 3 credit hours per course

## Technical Implementation

### Database Models
- `AcademicYear`: Tracks academic years (2025/2026, 2026/2027, etc.)
- `Course`: Linked to specific academic year and semester
- `User`: Tracks current academic year and semester
- `TimetableEntry`: Course-specific scheduling

### Frontend Focus
- Dashboard optimized for First Year First Semester
- Course materials filtered for current semester
- Timetable showing only relevant courses
- Registration limited to 2025/2026 academic year

## Future Expansion
While currently focused on First Year First Semester, the structure supports:
- Multi-year progression (Year 1 → Year 2 → Year 3 → Year 4)
- Multi-semester support within each academic year
- Gradual expansion to other years and semesters
- Academic year transitions (2025/2026 → 2026/2027)

## Notes
- Academic years can span calendar years (e.g., 2025/2026)
- First semester typically starts in September
- Holiday semester is included for completeness but may not have active courses
- Registration numbers follow UoN Law format: GPR3/XXXXXX/2025
