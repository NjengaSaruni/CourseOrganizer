# AI Chat and MCP Server App

This Django app provides AI-powered chat functionality using the Model Context Protocol (MCP) for integration with Claude AI.

## Features

- **Chat Conversations**: Students can have conversations with an AI assistant about course content
- **MCP Server**: Exposes course data and functionality to AI agents via the Model Context Protocol
- **Knowledge Graph**: Tracks concepts from course outlines and student mastery levels
- **Mastery Tracking**: Calculates percentage mastery of course concepts based on assessments

## Models

### ChatConversation
Represents a conversation between a user and the AI assistant. Can be associated with a specific course.

### ChatMessage
Individual messages within a conversation. Supports user, assistant, and system roles.

### Concept
Represents a concept in the knowledge graph. Concepts can have parent-child relationships.

### CourseConcept
Links concepts to course outlines. Extracted concepts from course outlines that should be tracked for mastery.

### ConceptMastery
Tracks a student's mastery level for specific concepts within a course context.

### AgentInteraction
Logs all interactions with the MCP server for debugging and analysis.

## MCP Tools

The following tools are available to AI agents:

- `get_course_info`: Get detailed information about a course
- `search_course_materials`: Search course materials by keywords
- `get_course_outline`: Get the course outline for a course
- `get_course_concepts`: Get all concepts for a course
- `get_student_mastery`: Get a student's mastery levels
- `update_concept_mastery`: Update mastery based on assessments
- `calculate_course_mastery_percentage`: Calculate overall course mastery

## MCP Resources

The following resources are available:

- `courses://all`: List of all courses
- `course://{id}`: Detailed course information
- `course-outline://{course_id}`: Course outline
- `course-materials://{course_id}`: Course materials
- `course-concepts://{course_id}`: Course concepts

## Running the MCP Server

To run the MCP server:

```bash
python manage.py run_mcp_server
```

Or use the standalone script:

```bash
python ai_chat/mcp_server.py
```

## API Endpoints

- `GET/POST /api/ai-chat/conversations/`: List/create conversations
- `GET/POST /api/ai-chat/conversations/{id}/messages/`: Get/create messages
- `GET /api/ai-chat/concepts/`: List concepts (filter by course_id)
- `GET/POST /api/ai-chat/mastery/`: List/create mastery records
- `POST /api/ai-chat/mastery/calculate_course_mastery/`: Calculate course mastery percentage

## Future Enhancements

1. **Concept Extraction**: Automatically extract concepts from course outlines using AI
2. **Question Analysis**: Analyze student questions to identify concepts being discussed
3. **Adaptive Learning**: Use mastery data to recommend learning materials
4. **Progress Tracking**: Visual dashboards showing concept mastery progress

