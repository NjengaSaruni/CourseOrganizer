"""
MCP Tools - Functions that AI agents can call through the MCP protocol.

Tools are executable functions that agents can invoke to perform actions related to courses.
Each tool has:
- A name (unique identifier)
- A description (what it does)
- Input schema (what parameters it accepts)
- Implementation (the actual function)
"""

from typing import Any, Dict, List
from datetime import datetime
from .models import ChatConversation, ChatMessage, Concept, ConceptMastery, CourseConcept, AgentInteraction
from course_api.models import Course, CourseMaterial, CourseContent
from course_content.models import CourseOutline
from directory.models import User
import json


class MCPTools:
    """Collection of tools exposed through the MCP server."""
    
    @staticmethod
    def get_tool_definitions() -> List[Dict[str, Any]]:
        """
        Returns the list of all available tools with their schemas.
        This is sent to the AI agent so it knows what tools are available.
        """
        return [
            {
                "name": "get_course_info",
                "description": "Get detailed information about a course including description, materials, and content",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "course_id": {
                            "type": "integer",
                            "description": "The ID of the course"
                        },
                        "course_code": {
                            "type": "string",
                            "description": "Alternative: Course code (e.g., 'CS101')"
                        }
                    }
                }
            },
            {
                "name": "search_course_materials",
                "description": "Search for course materials by keywords in title, description, or content",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "course_id": {
                            "type": "integer",
                            "description": "The ID of the course to search in"
                        },
                        "query": {
                            "type": "string",
                            "description": "Search query string"
                        },
                        "material_type": {
                            "type": "string",
                            "enum": ["pdf", "doc", "ppt", "video", "audio", "image", "link", "other"],
                            "description": "Filter by material type (optional)"
                        },
                        "limit": {
                            "type": "integer",
                            "description": "Maximum number of results (default: 10)"
                        }
                    },
                    "required": ["query"]
                }
            },
            {
                "name": "get_course_outline",
                "description": "Get the course outline for a specific course",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "course_id": {
                            "type": "integer",
                            "description": "The ID of the course"
                        },
                        "course_code": {
                            "type": "string",
                            "description": "Alternative: Course code"
                        }
                    }
                }
            },
            {
                "name": "get_course_concepts",
                "description": "Get all concepts associated with a course from its outline",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "course_id": {
                            "type": "integer",
                            "description": "The ID of the course"
                        }
                    },
                    "required": ["course_id"]
                }
            },
            {
                "name": "get_student_mastery",
                "description": "Get a student's mastery level for concepts in a course",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "user_id": {
                            "type": "integer",
                            "description": "The ID of the student user"
                        },
                        "course_id": {
                            "type": "integer",
                            "description": "The ID of the course"
                        }
                    },
                    "required": ["user_id", "course_id"]
                }
            },
            {
                "name": "update_concept_mastery",
                "description": "Update a student's mastery level for a concept based on assessment",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "user_id": {
                            "type": "integer",
                            "description": "The ID of the student user"
                        },
                        "concept_id": {
                            "type": "integer",
                            "description": "The ID of the concept"
                        },
                        "course_id": {
                            "type": "integer",
                            "description": "The ID of the course (optional but recommended)"
                        },
                        "mastery_score": {
                            "type": "number",
                            "description": "Mastery score from 0.0 to 1.0"
                        },
                        "mastery_level": {
                            "type": "string",
                            "enum": ["not_started", "introduced", "developing", "proficient", "mastered"],
                            "description": "Mastery level (optional, will be auto-determined from score if not provided)"
                        }
                    },
                    "required": ["user_id", "concept_id", "mastery_score"]
                }
            },
            {
                "name": "calculate_course_mastery_percentage",
                "description": "Calculate the overall mastery percentage for a student in a course based on all concepts in the course outline",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "user_id": {
                            "type": "integer",
                            "description": "The ID of the student user"
                        },
                        "course_id": {
                            "type": "integer",
                            "description": "The ID of the course"
                        }
                    },
                    "required": ["user_id", "course_id"]
                }
            }
        ]
    
    @staticmethod
    def get_course_info(course_id: int = None, course_code: str = None) -> Dict[str, Any]:
        """Get detailed information about a course."""
        try:
            if course_id:
                course = Course.objects.get(id=course_id)
            elif course_code:
                course = Course.objects.get(code=course_code)
            else:
                return {"success": False, "error": "Either course_id or course_code must be provided"}
            
            # Get course materials
            materials = CourseMaterial.objects.filter(course=course)[:10]
            materials_list = [
                {
                    "id": m.id,
                    "title": m.title,
                    "description": m.description,
                    "material_type": m.material_type,
                    "file_url": m.file_url
                }
                for m in materials
            ]
            
            # Get course content
            content = CourseContent.objects.filter(course=course)[:10]
            content_list = [
                {
                    "id": c.id,
                    "title": c.title,
                    "content_type": c.content_type,
                    "topic": c.topic,
                    "lesson_date": c.lesson_date.isoformat() if c.lesson_date else None
                }
                for c in content
            ]
            
            course_data = {
                "id": course.id,
                "code": course.code,
                "name": course.name,
                "description": course.description,
                "year": course.year,
                "semester": course.semester,
                "credits": course.credits,
                "materials": materials_list,
                "content": content_list,
                "materials_count": CourseMaterial.objects.filter(course=course).count(),
                "content_count": CourseContent.objects.filter(course=course).count()
            }
            
            AgentInteraction.objects.create(
                interaction_type='tool_call',
                tool_name='get_course_info',
                request_data={'course_id': course_id, 'course_code': course_code},
                response_data={'course_id': course.id},
                success=True
            )
            
            return {"success": True, "course": course_data}
        except Course.DoesNotExist:
            return {"success": False, "error": "Course not found"}
        except Exception as e:
            AgentInteraction.objects.create(
                interaction_type='tool_call',
                tool_name='get_course_info',
                request_data={'course_id': course_id, 'course_code': course_code},
                response_data={},
                success=False,
                error_message=str(e)
            )
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def search_course_materials(course_id: int, query: str, material_type: str = None, limit: int = 10) -> Dict[str, Any]:
        """Search for course materials by keywords."""
        try:
            course = Course.objects.get(id=course_id)
            materials = CourseMaterial.objects.filter(
                course=course,
                title__icontains=query
            ) | CourseMaterial.objects.filter(
                course=course,
                description__icontains=query
            )
            
            if material_type:
                materials = materials.filter(material_type=material_type)
            
            materials = materials.distinct()[:limit]
            
            materials_list = [
                {
                    "id": m.id,
                    "title": m.title,
                    "description": m.description,
                    "material_type": m.material_type,
                    "file_url": m.file_url
                }
                for m in materials
            ]
            
            AgentInteraction.objects.create(
                interaction_type='tool_call',
                tool_name='search_course_materials',
                request_data={'course_id': course_id, 'query': query, 'material_type': material_type, 'limit': limit},
                response_data={'count': len(materials_list)},
                success=True
            )
            
            return {"success": True, "materials": materials_list, "count": len(materials_list)}
        except Course.DoesNotExist:
            return {"success": False, "error": "Course not found"}
        except Exception as e:
            AgentInteraction.objects.create(
                interaction_type='tool_call',
                tool_name='search_course_materials',
                request_data={'course_id': course_id, 'query': query},
                response_data={},
                success=False,
                error_message=str(e)
            )
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def get_course_outline(course_id: int = None, course_code: str = None) -> Dict[str, Any]:
        """Get the course outline for a course."""
        try:
            if course_id:
                course = Course.objects.get(id=course_id)
            elif course_code:
                course = Course.objects.get(code=course_code)
            else:
                return {"success": False, "error": "Either course_id or course_code must be provided"}
            
            # Get the current academic year's outline
            from directory.models import AcademicYear
            academic_year = AcademicYear.get_current_academic_year()
            
            try:
                # Get semester for the course
                from directory.models import Semester
                semester = Semester.objects.filter(
                    academic_year=academic_year,
                    semester_type=course.semester
                ).first()
                
                if not semester:
                    return {"success": False, "error": "Semester not found for this course"}
                
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
                
                AgentInteraction.objects.create(
                    interaction_type='tool_call',
                    tool_name='get_course_outline',
                    request_data={'course_id': course_id, 'course_code': course_code},
                    response_data={'outline_id': outline.id},
                    success=True
                )
                
                return {"success": True, "outline": outline_data}
            except CourseOutline.DoesNotExist:
                return {"success": False, "error": "Course outline not found for this course"}
        except Course.DoesNotExist:
            return {"success": False, "error": "Course not found"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def get_course_concepts(course_id: int) -> Dict[str, Any]:
        """Get all concepts associated with a course."""
        try:
            course = Course.objects.get(id=course_id)
            from directory.models import AcademicYear
            academic_year = AcademicYear.get_current_academic_year()
            
            try:
                # Get semester for the course
                from directory.models import Semester
                semester = Semester.objects.filter(
                    academic_year=academic_year,
                    semester_type=course.semester
                ).first()
                
                if not semester:
                    return {"success": False, "error": "Semester not found for this course"}
                
                outline = CourseOutline.objects.get(
                    course=course,
                    academic_year=academic_year,
                    semester=semester
                )
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
                
                return {"success": True, "concepts": concepts_list, "count": len(concepts_list)}
            except CourseOutline.DoesNotExist:
                return {"success": False, "error": "Course outline not found"}
        except Course.DoesNotExist:
            return {"success": False, "error": "Course not found"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def get_student_mastery(user_id: int, course_id: int) -> Dict[str, Any]:
        """Get a student's mastery for concepts in a course."""
        try:
            user = User.objects.get(id=user_id)
            course = Course.objects.get(id=course_id)
            
            masteries = ConceptMastery.objects.filter(user=user, course=course)
            
            mastery_list = [
                {
                    "concept_id": m.concept.id,
                    "concept_name": m.concept.name,
                    "mastery_level": m.mastery_level,
                    "mastery_score": m.mastery_score,
                    "last_assessed_at": m.last_assessed_at.isoformat() if m.last_assessed_at else None
                }
                for m in masteries
            ]
            
            return {"success": True, "masteries": mastery_list, "count": len(mastery_list)}
        except (User.DoesNotExist, Course.DoesNotExist) as e:
            return {"success": False, "error": str(e)}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def update_concept_mastery(user_id: int, concept_id: int, mastery_score: float, course_id: int = None, mastery_level: str = None) -> Dict[str, Any]:
        """Update a student's mastery for a concept."""
        try:
            user = User.objects.get(id=user_id)
            concept = Concept.objects.get(id=concept_id)
            course = Course.objects.get(id=course_id) if course_id else None
            
            mastery, created = ConceptMastery.objects.get_or_create(
                user=user,
                concept=concept,
                course=course,
                defaults={'mastery_score': 0.0, 'mastery_level': 'not_started'}
            )
            
            mastery.update_mastery(mastery_score, mastery_level)
            
            return {
                "success": True,
                "created": created,
                "mastery": {
                    "concept_id": concept.id,
                    "concept_name": concept.name,
                    "mastery_level": mastery.mastery_level,
                    "mastery_score": mastery.mastery_score
                }
            }
        except (User.DoesNotExist, Concept.DoesNotExist) as e:
            return {"success": False, "error": str(e)}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def calculate_course_mastery_percentage(user_id: int, course_id: int) -> Dict[str, Any]:
        """Calculate overall mastery percentage for a student in a course."""
        try:
            user = User.objects.get(id=user_id)
            course = Course.objects.get(id=course_id)
            
            # Get all concepts for this course
            concepts = MCPTools.get_course_concepts(course_id)
            if not concepts["success"]:
                return concepts
            
            concept_ids = [c["id"] for c in concepts["concepts"]]
            
            if not concept_ids:
                return {"success": True, "mastery_percentage": 0.0, "total_concepts": 0, "assessed_concepts": 0}
            
            # Get mastery scores for these concepts
            masteries = ConceptMastery.objects.filter(
                user=user,
                course=course,
                concept_id__in=concept_ids
            )
            
            total_concepts = len(concept_ids)
            assessed_concepts = masteries.count()
            
            if total_concepts == 0:
                mastery_percentage = 0.0
            else:
                total_score = sum(m.mastery_score for m in masteries)
                # For concepts without mastery records, assume 0.0
                mastery_percentage = (total_score / total_concepts) * 100
            
            return {
                "success": True,
                "mastery_percentage": round(mastery_percentage, 2),
                "total_concepts": total_concepts,
                "assessed_concepts": assessed_concepts
            }
        except (User.DoesNotExist, Course.DoesNotExist) as e:
            return {"success": False, "error": str(e)}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @classmethod
    def execute_tool(cls, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a tool by name with the given arguments.
        This is the main entry point for tool execution.
        """
        tool_methods = {
            "get_course_info": cls.get_course_info,
            "search_course_materials": cls.search_course_materials,
            "get_course_outline": cls.get_course_outline,
            "get_course_concepts": cls.get_course_concepts,
            "get_student_mastery": cls.get_student_mastery,
            "update_concept_mastery": cls.update_concept_mastery,
            "calculate_course_mastery_percentage": cls.calculate_course_mastery_percentage,
        }
        
        if tool_name not in tool_methods:
            return {
                "success": False,
                "error": f"Unknown tool: {tool_name}"
            }
        
        try:
            return tool_methods[tool_name](**arguments)
        except Exception as e:
            # Log the error
            AgentInteraction.objects.create(
                interaction_type='tool_call',
                tool_name=tool_name,
                request_data=arguments,
                response_data={},
                success=False,
                error_message=str(e)
            )
            
            return {
                "success": False,
                "error": str(e)
            }

