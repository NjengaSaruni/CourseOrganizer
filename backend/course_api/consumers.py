import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from collections import defaultdict
from .models import StudyGroup, StudyGroupMembership, GroupMessage

# Simple in-memory presence map per room. For multi-instance, migrate to Redis.
ROOM_ONLINE_USERS = defaultdict(set)  # room_name -> set of (user_id, user_name)


logger = logging.getLogger(__name__)


class StudyGroupChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_id = self.scope['url_route']['kwargs']['group_id']
        self.room_group_name = f'study_group_{self.group_id}'
        self.user = self.scope['user']

        try:
            logger.info(
                "WS connect attempt: group=%s user=%s auth=%s origin=%s host=%s",
                self.group_id,
                getattr(self.user, 'email', str(self.user)),
                getattr(self.user, 'is_authenticated', False),
                dict(self.scope.get('headers', [])).get(b'origin', b'').decode('latin1'),
                self.scope.get('server')
            )
        except Exception:
            # Best-effort logging only
            pass

        # Check if user is a member
        is_member = await self.check_membership()
        if not is_member:
            logger.warning(
                "WS connect denied: non-member or unauthenticated. group=%s user=%s",
                self.group_id,
                getattr(self.user, 'email', str(self.user))
            )
            await self.close()
            return

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        logger.info(
            "WS connected: group=%s user=%s channel=%s",
            self.group_id,
            getattr(self.user, 'email', str(self.user)),
            self.channel_name
        )

        # Identify current user to the client
        try:
            user_display = await self._get_user_display()
            user_data = {'id': int(self.user.id), 'name': user_display}
            logger.info(f"Whoami event - Sending user identity: user_id={user_data['id']}, name={user_data['name']}")
            await self.send(text_data=json.dumps({
                'type': 'whoami',
                'user': user_data
            }))
        except Exception as e:
            logger.error(f"Error sending whoami event: {e}")
            pass

        # Track presence and notify
        user_display = await self._get_user_display()
        ROOM_ONLINE_USERS[self.room_group_name].add((self.user.id, user_display))

        # Send presence snapshot to this client
        await self.send(text_data=json.dumps({
            'type': 'snapshot',
            'users': [
                {'id': int(uid), 'name': uname}
                for uid, uname in ROOM_ONLINE_USERS[self.room_group_name]
            ]
        }))

        # Broadcast join to others
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'presence_event',
                'action': 'join',
                'user': {'id': int(self.user.id), 'name': user_display},
            }
        )

    async def disconnect(self, close_code):
        # Leave room group
        if hasattr(self, 'room_group_name'):
            try:
                logger.info(
                    "WS disconnect: group=%s user=%s code=%s",
                    self.group_id,
                    getattr(self.user, 'email', str(self.user)),
                    close_code
                )
            except Exception:
                pass
            # Update presence and broadcast leave
            try:
                user_display = await self._get_user_display()
                ROOM_ONLINE_USERS[self.room_group_name].discard((self.user.id, user_display))
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'presence_event',
                        'action': 'leave',
                        'user': {'id': int(self.user.id), 'name': user_display},
                    }
                )
            except Exception:
                pass

            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        event_type = data.get('type')

        # Typing indicator event
        if event_type == 'typing':
            is_typing = bool(data.get('is_typing'))
            user_display = await self._get_user_display()
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'typing_event',
                    'user': {'id': int(self.user.id), 'name': user_display},
                    'is_typing': is_typing,
                }
            )
            return

        # Default: chat message
        message_body = data.get('body', '').strip()
        if not message_body:
            return
        client_id = data.get('client_id')
        reply_to = data.get('reply_to')
        
        logger.info(f"Received message data: body='{message_body}', client_id='{client_id}', reply_to={reply_to}")

        # Save message to database
        message = await self.save_message(message_body, reply_to)

        # Broadcast message to room group
        broadcast_message = {
            'id': message['id'],
            'sender': message['sender'],
            'sender_name': message['sender_name'],
            'body': message['body'],
            'created_at': message['created_at'],
            'client_id': client_id,
            'reply_to': message.get('reply_to'),
        }
        
        logger.info(f"Broadcasting message: {broadcast_message}")
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': broadcast_message
            }
        )

    async def chat_message(self, event):
        # Keep legacy shape (plain message) for compatibility
        await self.send(text_data=json.dumps(event['message']))

    async def typing_event(self, event):
        # Ensure user ID is properly serialized as integer
        user_data = {
            'id': int(event['user']['id']),
            'name': event['user']['name']
        }
        
        # Debug logging
        logger.info(f"Typing event - Sending typing indicator: user_id={user_data['id']}, name={user_data['name']}, is_typing={event['is_typing']}")
        
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'user': user_data,
            'is_typing': event['is_typing'],
        }))

    async def presence_event(self, event):
        await self.send(text_data=json.dumps({
            'type': 'presence',
            'action': event['action'],
            'user': event['user'],
        }))

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
    def save_message(self, body, reply_to=None):
        # Get the replied-to message if reply_to is provided
        replied_message = None
        if reply_to and reply_to.get('id'):
            try:
                replied_message = GroupMessage.objects.get(id=reply_to['id'], group_id=self.group_id)
            except GroupMessage.DoesNotExist:
                pass  # Reply to message not found, ignore reply
        
        msg = GroupMessage.objects.create(
            group_id=self.group_id,
            sender=self.user,
            body=body,
            reply_to=replied_message
        )
        
        result = {
            'id': msg.id,
            'sender': msg.sender.id,
            'sender_name': msg.sender.get_full_name(),
            'body': msg.body,
            'created_at': msg.created_at.isoformat()
        }
        
        # Add reply information if this is a reply
        if replied_message:
            result['reply_to'] = {
                'id': replied_message.id,
                'sender_name': replied_message.sender.get_full_name(),
                'body': replied_message.body,
                'created_at': replied_message.created_at.isoformat()
            }
            logger.info(f"Message {msg.id} is a reply to message {replied_message.id}")
        else:
            logger.info(f"Message {msg.id} is not a reply")
        
        return result

    @database_sync_to_async
    def _get_user_display(self):
        name = self.user.get_full_name()
        return name or getattr(self.user, 'username', str(self.user.id))

