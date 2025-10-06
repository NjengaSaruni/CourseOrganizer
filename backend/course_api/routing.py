from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'^ws/study-groups/(?P<group_id>\d+)/$', consumers.StudyGroupChatConsumer.as_asgi()),
]

