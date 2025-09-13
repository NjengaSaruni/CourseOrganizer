# Communication App

The Communication app provides a comprehensive messaging and announcement system for the Course Organizer platform, with special privileges for Class Representatives.

## Features

### 1. Class Representatives (Class Reps)
- **Role Assignment**: Admins can assign students as Class Representatives for their respective classes
- **Permission System**: Granular permissions for different Class Rep capabilities
- **Special Privileges**: Class Reps can send announcements, create polls, and moderate messages

### 2. Messaging System
- **Class Messages**: General messages visible to all students in a class
- **Private Messages**: Direct messages between individual students
- **Announcements**: Official messages from Class Reps with priority levels
- **Message Reactions**: Students can react to messages with emojis
- **Read Status**: Track which users have read messages

### 3. Polls and Surveys
- **Class Polls**: Class Reps can create polls for class decisions
- **Multiple Choice**: Support for single or multiple choice polls
- **Anonymous Voting**: Option for anonymous poll responses
- **Poll Expiration**: Set expiration dates for polls

## Models

### ClassRepRole
Manages Class Representative roles and permissions.

**Fields:**
- `user`: The student assigned as Class Rep
- `student_class`: The class they represent
- `permissions`: List of granted permissions
- `is_active`: Whether the role is currently active
- `assigned_by`: Admin who assigned the role
- `assigned_at`: When the role was assigned

**Permissions:**
- `send_announcements`: Send official announcements
- `moderate_messages`: Moderate class messages
- `view_all_messages`: View all messages (including private)
- `manage_polls`: Create and manage polls
- `send_notifications`: Send push notifications

### Message
Handles all types of messages between users.

**Fields:**
- `sender`: User who sent the message
- `recipient`: Target user (for private messages)
- `student_class`: Class context
- `message_type`: Type of message (text, image, file, poll)
- `content`: Message content
- `is_private`: Whether it's a private message
- `is_announcement`: Whether it's an official announcement
- `attachment`: Optional file attachment

### Announcement
Official announcements from Class Representatives.

**Fields:**
- `sender`: Class Rep who created the announcement
- `student_class`: Target class
- `title`: Announcement title
- `content`: Announcement content
- `priority`: Priority level (low, normal, high, urgent)
- `is_pinned`: Whether to pin the announcement
- `expires_at`: Optional expiration date
- `attachment`: Optional file attachment

### Poll
Polls created by Class Representatives.

**Fields:**
- `creator`: Class Rep who created the poll
- `student_class`: Target class
- `title`: Poll title
- `description`: Poll description
- `options`: List of poll options
- `is_anonymous`: Whether votes are anonymous
- `allow_multiple_choices`: Whether multiple options can be selected
- `status`: Poll status (draft, active, closed)
- `expires_at`: Optional expiration date

### PollVote
Individual votes in polls.

**Fields:**
- `poll`: The poll being voted on
- `user`: User who voted
- `selected_options`: List of selected option indices

### MessageReaction
Reactions to messages.

**Fields:**
- `message`: The reacted message
- `user`: User who reacted
- `reaction_type`: Type of reaction (like, love, laugh, wow, sad, angry)

### MessageReadStatus
Tracks read status of messages.

**Fields:**
- `message`: The message
- `user`: User who read the message
- `read_at`: When the message was read

## API Endpoints

### Class Representatives
- `GET /api/communication/class-reps/` - List Class Reps
- `POST /api/communication/class-reps/` - Create Class Rep role
- `GET /api/communication/class-reps/{id}/` - Get Class Rep details
- `PUT /api/communication/class-reps/{id}/` - Update Class Rep role
- `DELETE /api/communication/class-reps/{id}/` - Delete Class Rep role
- `GET /api/communication/class-reps/{user_id}/permissions/` - Get user's Class Rep permissions
- `POST /api/communication/class-reps/{user_id}/update-permissions/` - Update Class Rep permissions

### Messages
- `GET /api/communication/messages/` - List messages
- `POST /api/communication/messages/` - Create message
- `GET /api/communication/messages/{id}/` - Get message details
- `PUT /api/communication/messages/{id}/` - Update message
- `DELETE /api/communication/messages/{id}/` - Delete message
- `POST /api/communication/messages/{id}/react/` - Add reaction to message
- `DELETE /api/communication/messages/{id}/unreact/` - Remove reaction
- `POST /api/communication/messages/{id}/mark-read/` - Mark message as read

### Announcements
- `GET /api/communication/announcements/` - List announcements
- `POST /api/communication/announcements/` - Create announcement
- `GET /api/communication/announcements/{id}/` - Get announcement details
- `PUT /api/communication/announcements/{id}/` - Update announcement
- `DELETE /api/communication/announcements/{id}/` - Delete announcement

### Polls
- `GET /api/communication/polls/` - List polls
- `POST /api/communication/polls/` - Create poll
- `GET /api/communication/polls/{id}/` - Get poll details
- `PUT /api/communication/polls/{id}/` - Update poll
- `DELETE /api/communication/polls/{id}/` - Delete poll
- `POST /api/communication/polls/{id}/vote/` - Vote in poll

### Statistics
- `GET /api/communication/stats/` - Get communication statistics

## Management Commands

### assign_class_rep
Assign a student as a Class Representative.

```bash
python manage.py assign_class_rep --user-id 123 --permissions send_announcements manage_polls
python manage.py assign_class_rep --registration-number GPR3/123456/2025 --permissions send_announcements
python manage.py assign_class_rep --user-id 123 --deactivate  # Deactivate Class Rep role
```

### list_class_reps
List all Class Representatives.

```bash
python manage.py list_class_reps
python manage.py list_class_reps --class-id 1 --active-only --with-permissions
```

## Usage Examples

### Assigning a Class Rep
```python
from communication.models import ClassRepRole
from directory.models import User
from school.models import Class

# Get user and class
user = User.objects.get(registration_number='GPR3/123456/2025')
student_class = Class.objects.get(graduation_year=2029)

# Create Class Rep role
class_rep = ClassRepRole.objects.create(
    user=user,
    student_class=student_class,
    permissions=['send_announcements', 'manage_polls'],
    assigned_by=admin_user,
)
```

### Creating an Announcement
```python
from communication.models import Announcement

# Only Class Reps with 'send_announcements' permission can create announcements
announcement = Announcement.objects.create(
    sender=class_rep.user,
    student_class=class_rep.student_class,
    title='Important Notice',
    content='Class meeting postponed to next week.',
    priority='high',
    is_pinned=True,
)
```

### Creating a Poll
```python
from communication.models import Poll

# Only Class Reps with 'manage_polls' permission can create polls
poll = Poll.objects.create(
    creator=class_rep.user,
    student_class=class_rep.student_class,
    title='Class Meeting Time',
    description='When should we have our next class meeting?',
    options=['Monday 2PM', 'Tuesday 3PM', 'Wednesday 4PM'],
    allow_multiple_choices=False,
    is_anonymous=True,
    status='active',
)
```

### Sending a Message
```python
from communication.models import Message

# Regular class message
message = Message.objects.create(
    sender=user,
    student_class=user.student_class,
    content='Hello everyone!',
    is_private=False,
)

# Private message
private_message = Message.objects.create(
    sender=user,
    recipient=target_user,
    student_class=user.student_class,
    content='Private message content',
    is_private=True,
)
```

## Permissions and Security

### Class Rep Validation
- Only students can be assigned as Class Reps
- Class Reps must belong to the class they represent
- Only admins can assign/modify Class Rep roles
- Class Rep permissions are validated before actions

### Message Access Control
- Students can only see messages from their class
- Private messages are only visible to sender and recipient
- Admins can see all messages
- Class Reps with 'view_all_messages' permission can see private messages

### Announcement Security
- Only Class Reps with 'send_announcements' permission can create announcements
- Announcements are validated before saving
- Only announcement creators or admins can edit/delete announcements

### Poll Security
- Only Class Reps with 'manage_polls' permission can create polls
- Polls are validated before saving
- Only poll creators or admins can edit/delete polls
- Users can only vote once per poll

## Testing

Run the communication app tests:

```bash
python manage.py test communication.tests
```

The tests cover:
- Class Rep role creation and validation
- Message creation and permissions
- Announcement creation by Class Reps
- Poll creation and voting
- Permission checking
- User model integration

## Admin Interface

The communication app includes a comprehensive Django admin interface for:
- Managing Class Rep roles and permissions
- Viewing and moderating messages
- Managing announcements
- Overseeing polls and votes
- Viewing communication statistics

Access the admin interface at `/admin/communication/` after logging in as an admin user.
