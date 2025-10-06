from urllib.parse import parse_qs
from typing import Optional

from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework.authtoken.models import Token


async def _get_user_for_token(key: str):
    try:
        token: Token = await database_sync_to_async(Token.objects.select_related("user").get)(key=key)
        return token.user
    except Token.DoesNotExist:
        return AnonymousUser()


class TokenAuthMiddleware:
    """ASGI middleware that authenticates a user via DRF Token passed as ?token=... or Authorization: Token ...

    This supplements session-based auth so that WebSocket connections can be authenticated
    when the frontend primarily uses DRF TokenAuthentication for HTTP APIs.
    """

    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        user = None

        # 1) Query string token
        try:
            query_string = (scope.get("query_string") or b"").decode("utf-8", "ignore")
            query_params = parse_qs(query_string)
            token = (query_params.get("token") or [None])[0]
        except Exception:
            token = None

        # 2) Authorization header fallback
        if not token:
            try:
                headers = dict(scope.get("headers") or [])
                auth = headers.get(b"authorization")
                if auth:
                    value = auth.decode("latin1")
                    if value.lower().startswith("token "):
                        token = value.split(" ", 1)[1].strip()
            except Exception:
                token = None

        if token:
            user = await _get_user_for_token(token)

        if user is not None:
            scope["user"] = user

        return await self.inner(scope, receive, send)


