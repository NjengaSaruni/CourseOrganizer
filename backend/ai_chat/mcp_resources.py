"""
MCP Resources - Data sources that AI agents can read.

Resources are read-only data sources that agents can access to get information about courses.
Each resource has:
- A URI (unique identifier like course://123 or courses://all)
- A name (human-readable name)
- A description (what data it provides)
- A MIME type (format of the data)
"""

from typing import Any, Dict, List
from .models import AgentInteraction
from course_api.models import Course, CourseMaterial
from course_content.models import CourseOutline
from directory.models import AcademicYear
import json


class MCPResources:
    """Collection of resources exposed through the MCP server."""
    
    @staticmethod
    def get_resource_definitions() -> List[Dict[str, Any]]:
        """
        Returns the list of all available resources with their schemas.
        This is sent to the AI agent so it knows what resources it can access.
        """
        return [
            {
                "uri": "courses://all",
                "name": "All Courses",
                "description": "Complete list of all courses in the system",
                "mimeType": "application/json"
            },
            {
                "uri": "course://{id}",
                "name": "Single Course",
                "description": "Detailed information about a specific course by ID",
                "mimeType": "application/json"
            },
            {
                "uri": "course-outline://{course_id}",
                "name": "Course Outline",
                "description": "Course outline for a specific course",
                "mimeType": "application/json"
            },
            {
                "uri": "course-materials://{course_id}",
                "name": "Course Materials",
                "description": "All materials for a specific course",
                "mimeType": "application/json"
            },
            {
                "uri": "course-concepts://{course_id}",
                "name": "Course Concepts",
                "description": "All concepts extracted from a course outline",
                "mimeType": "application/json"
            }
        ]
    
    @staticmethod
    def read_resource(uri: str) -> Dict[str, Any]:
        """
        Read a resource by its URI.
        This is the main entry point for resource access.
        """
        try:
            # Parse the URI
            if uri == "courses://all":
                return MCPResources._read_all_courses()
            elif uri.startswith("course://"):
                course_id = int(uri.split("://")[1])
                return MCPResources._read_single_course(course_id)
            elif uri.startswith("course-outline://"):
                course_id = int(uri.split("://")[1])
                return MCPResources._read_course_outline(course_id)
            elif uri.startswith("course-materials://"):
                course_id = int(uri.split("://")[1])
                return MCPResources._read_course_materials(course_id)
            elif uri.startswith("course-concepts://"):
                course_id = int(uri.split("://")[1])
                return MCPResources._read_course_concepts(course_id)
            else:
                return {
                    "success": False,
                    "error": f"Unknown resource URI: {uri}"
                }
        except Exception as e:
            # Log the error
            AgentInteraction.objects.create(
                interaction_type='resource_read',
                resource_uri=uri,
                request_data={'uri': uri},
                response_data={},
                success=False,
                error_message=str(e)
            )
            
            return {
                "success": False,
                "error": str(e)
            }
    
    @staticmethod
    def _read_all_courses() -> Dict[str, Any]:
        """Read all courses."""
        academic_year = AcademicYear.get_current_academic_year()
        courses = Course.objects.filter(academic_year=academic_year)
        
        course_list = [
            {
                "id": course.id,
                "code": course.code,
                "name": course.name,
                "description": course.description,
                "year": course.year,
                "semester": course.semester,
                "credits": course.credits
            }
            for course in courses
        ]
        
        # Log the interaction
        AgentInteraction.objects.create(
            interaction_type='resource_read',
            resource_uri='courses://all',
            request_data={'uri': 'courses://all'},
            response_data={'count': len(course_list)},
            success=True
        )
        
        return {
            "success": True,
            "uri": "courses://all",
            "mimeType": "application/json",
            "data": course_list
        }
    
    @staticmethod
    def _read_single_course(course_id: int) -> Dict[str, Any]:
        """Read a single course with full details."""
        try:
            course = Course.objects.get(id=course_id)
            
            # Get materials count
            materials_count = CourseMaterial.objects.filter(course=course).count()
            
            course_data = {
                "id": course.id,
                "code": course.code,
                "name": course.name,
                "description": course.description,
                "year": course.year,
                "semester": course.semester,
                "credits": course.credits,
                "is_core": course.is_core,
                "materials_count": materials_count
            }
            
            uri = f"course://{course_id}"
            
            # Log the interaction
            AgentInteraction.objects.create(
                interaction_type='resource_read',
                resource_uri=uri,
                request_data={'uri': uri, 'course_id': course_id},
                response_data={'course_id': course_id},
                success=True
            )
            
            return {
                "success": True,
                "uri": uri,
                "mimeType": "application/json",
                "data": course_data
            }
        except Course.DoesNotExist:
            return {
                "success": False,
                "error": f"Course with ID {course_id} not found"
            }
    
    @staticmethod
    def _read_course_outline(course_id: int) -> Dict[str, Any]:
        """Read course outline for a specific course."""
        try:
            course = Course.objects.get(id=course_id)
            academic_year = AcademicYear.get_current_academic_year()
            
            try:
                # Get semester for the course
                from directory.models import Semester
                semester = Semester.objects.filter(
                    academic_year=academic_year,
                    semester_type=course.semester
                ).first()
                
                if not semester:
                    return {
                        "success": False,
                        "error": f"Semester not found for course {course_id}"
                    }
                
                outline = CourseOutline.objects.get(
                    course=course,
                    academic_year=academic_year,
                    semester=semester
                )
                
                outline_data = {
                    "id": outline.id,
                    "title": outline.title,
                    "description": outline.description,
                    "file_url": outline.file_url,
                    "file_path": outline.file_path,
                    "material_type": outline.material_type
                }
                
                uri = f"course-outline://{course_id}"
                
                AgentInteraction.objects.create(
                    interaction_type='resource_read',
                    resource_uri=uri,
                    request_data={'uri': uri, 'course_id': course_id},
                    response_data={'outline_id': outline.id},
                    success=True
                )
                
                return {
                    "success": True,
                    "uri": uri,
                    "mimeType": "application/json",
                    "data": outline_data
                }
            except CourseOutline.DoesNotExist:
                return {
                    "success": False,
                    "error": f"Course outline not found for course {course_id}"
                }
        except Course.DoesNotExist:
            return {
                "success": False,
                "error": f"Course with ID {course_id} not found"
            }
    
    @staticmethod
    def _read_course_materials(course_id: int) -> Dict[str, Any]:
        """Read all materials for a specific course."""
        try:
            course = Course.objects.get(id=course_id)
            materials = CourseMaterial.objects.filter(course=course)
            
            materials_list = [
                {
                    "id": m.id,
                    "title": m.title,
                    "description": m.description,
                    "material_type": m.material_type,
                    "file_url": m.file_url,
                    "upload_date": m.upload_date.isoformat() if hasattr(m, 'upload_date') and m.upload_date else None
                }
                for m in materials
            ]
            
            uri = f"course-materials://{course_id}"
            
            AgentInteraction.objects.create(
                interaction_type='resource_read',
                resource_uri=uri,
                request_data={'uri': uri, 'course_id': course_id},
                response_data={'count': len(materials_list)},
                success=True
            )
            
            return {
                "success": True,
                "uri": uri,
                "mimeType": "application/json",
                "data": materials_list
            }
        except Course.DoesNotExist:
            return {
                "success": False,
                "error": f"Course with ID {course_id} not found"
            }
    
    @staticmethod
    def _read_course_concepts(course_id: int) -> Dict[str, Any]:
        """Read all concepts for a specific course."""
        try:
            course = Course.objects.get(id=course_id)
            academic_year = AcademicYear.get_current_academic_year()
            
            try:
                # Get semester for the course
                from directory.models import Semester
                semester = Semester.objects.filter(
                    academic_year=academic_year,
                    semester_type=course.semester
                ).first()
                
                if not semester:
                    return {
                        "success": False,
                        "error": f"Semester not found for course {course_id}"
                    }
                
                outline = CourseOutline.objects.get(
                    course=course,
                    academic_year=academic_year,
                    semester=semester
                )
                from .models import CourseConcept
                course_concepts = CourseConcept.objects.filter(course_outline=outline)
                
                concepts_list = [
                    {
                        "id": cc.concept.id,
                        "name": cc.concept.name,
                        "description": cc.concept.description,
                        "extracted_at": cc.extracted_at.isoformat()
                    }
                    for cc in course_concepts
                ]
                
                uri = f"course-concepts://{course_id}"
                
                AgentInteraction.objects.create(
                    interaction_type='resource_read',
                    resource_uri=uri,
                    request_data={'uri': uri, 'course_id': course_id},
                    response_data={'count': len(concepts_list)},
                    success=True
                )
                
                return {
                    "success": True,
                    "uri": uri,
                    "mimeType": "application/json",
                    "data": concepts_list
                }
            except CourseOutline.DoesNotExist:
                return {
                    "success": False,
                    "error": f"Course outline not found for course {course_id}"
                }
        except Course.DoesNotExist:
            return {
                "success": False,
                "error": f"Course with ID {course_id} not found"
            }

