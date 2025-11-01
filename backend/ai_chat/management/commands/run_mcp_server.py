"""
Django management command to run the MCP server.

Usage:
    python manage.py run_mcp_server

This command starts the MCP server which communicates with AI agents (Claude)
via stdio transport.
"""

from django.core.management.base import BaseCommand
from ai_chat.mcp_server import CourseOrganizerMCPServer
import asyncio


class Command(BaseCommand):
    help = 'Run the MCP server for AI agent communication'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting MCP server...'))
        self.stdout.write(self.style.WARNING('The server will communicate via stdio'))
        
        try:
            server = CourseOrganizerMCPServer()
            asyncio.run(server.run())
        except KeyboardInterrupt:
            self.stdout.write(self.style.WARNING('\nMCP server stopped'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error running MCP server: {e}'))

