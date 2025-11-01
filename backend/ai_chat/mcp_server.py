"""
MCP Server Implementation for Course Organizer

This module implements the Model Context Protocol (MCP) server that exposes
course-related functionality to AI agents (Claude). The server runs as a separate
process and communicates with AI agents through the MCP protocol.

Key Concepts:
- Server: The MCP server that handles protocol communication
- Tools: Executable functions agents can call (ask questions, get course info, etc.)
- Resources: Read-only data sources agents can access (course outlines, materials, etc.)
- Prompts: Pre-defined prompt templates agents can use
"""

import asyncio
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'course_organizer.settings')
django.setup()

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import (
    Tool,
    Resource,
    TextContent,
)
from .mcp_tools import MCPTools
from .mcp_resources import MCPResources
import json


class CourseOrganizerMCPServer:
    """
    Course Organizer MCP Server implementation.
    
    This server exposes course-related functionality through the MCP protocol,
    allowing AI agents (Claude) to interact with the course organizer application.
    """
    
    def __init__(self):
        self.server = Server("course-organizer-mcp-server")
        self.setup_handlers()
    
    def setup_handlers(self):
        """Set up all MCP protocol handlers."""
        
        @self.server.list_tools()
        async def list_tools() -> list[Tool]:
            """
            List all available tools.
            
            This handler is called when an agent wants to know what tools
            are available. It returns the tool definitions from MCPTools.
            """
            tool_defs = MCPTools.get_tool_definitions()
            
            return [
                Tool(
                    name=tool_def["name"],
                    description=tool_def["description"],
                    inputSchema=tool_def["inputSchema"]
                )
                for tool_def in tool_defs
            ]
        
        @self.server.call_tool()
        async def call_tool(name: str, arguments: dict) -> list[TextContent]:
            """
            Execute a tool.
            
            This handler is called when an agent wants to execute a tool.
            It calls the appropriate tool implementation from MCPTools.
            """
            result = MCPTools.execute_tool(name, arguments)
            
            return [
                TextContent(
                    type="text",
                    text=json.dumps(result, indent=2)
                )
            ]
        
        @self.server.list_resources()
        async def list_resources() -> list[Resource]:
            """
            List all available resources.
            
            This handler is called when an agent wants to know what resources
            are available for reading.
            """
            resource_defs = MCPResources.get_resource_definitions()
            
            return [
                Resource(
                    uri=resource_def["uri"],
                    name=resource_def["name"],
                    description=resource_def["description"],
                    mimeType=resource_def["mimeType"]
                )
                for resource_def in resource_defs
            ]
        
        @self.server.read_resource()
        async def read_resource(uri: str) -> str:
            """
            Read a resource.
            
            This handler is called when an agent wants to read data from
            a resource. It returns the resource data as JSON.
            """
            result = MCPResources.read_resource(uri)
            return json.dumps(result, indent=2)
    
    async def run(self):
        """Run the MCP server using stdio transport."""
        async with stdio_server() as (read_stream, write_stream):
            await self.server.run(
                read_stream,
                write_stream,
                self.server.create_initialization_options()
            )


def main():
    """Main entry point for the MCP server."""
    server = CourseOrganizerMCPServer()
    asyncio.run(server.run())


if __name__ == "__main__":
    main()

