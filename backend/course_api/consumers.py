import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import StudyGroup, StudyGroupMembership, GroupMessage


class StudyGroupChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_id = self.scope['url_route']['kwargs']['group_id']
        self.room_group_name = f'study_group_{self.group_id}'
        self.user = self.scope['user']

        # Check if user is a member
        is_member = await self.check_membership()
        if not is_member:
            await self.close()
            return

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_body = data.get('body', '').strip()
        
        if not message_body:
            return

        # Save message to database
        message = await self.save_message(message_body)

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': {
                    'id': message['id'],
                    'sender': message['sender'],
                    'sender_name': message['sender_name'],
                    'body': message['body'],
                    'created_at': message['created_at']
                }
            }
        )

    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps(event['message']))

    @database_sync_to_async
    def check_membership(self):
        try:
            return StudyGroupMembership.objects.filter(
                group_id=self.group_id,
                user=self.user
            ).exists()
        except Exception:
            return False

    @database_sync_to_async
    def save_message(self, body):
        msg = GroupMessage.objects.create(
            group_id=self.group_id,
            sender=self.user,
            body=body
        )
        return {
            'id': msg.id,
            'sender': msg.sender.id,
            'sender_name': msg.sender.get_full_name(),
            'body': msg.body,
            'created_at': msg.created_at.isoformat()
        }

