import os
import asyncio
from typing import Optional

try:
    import slixmpp
except Exception:  # pragma: no cover
    slixmpp = None  # type: ignore


class _ProvisionClient(slixmpp.ClientXMPP):  # type: ignore
    def __init__(self, jid: str, password: str, room_jid: str, nick: str):
        super().__init__(jid, password)
        self.room_jid = room_jid
        self.nick = nick
        self.add_event_handler('session_start', self.start)
        self.add_event_handler('failed_auth', self.failed)
        self.result = asyncio.get_event_loop().create_future()

        # MUC plugin
        self.register_plugin('xep_0030')  # Service Discovery
        self.register_plugin('xep_0045')  # Multi-User Chat
        self.register_plugin('xep_0199')  # XMPP Ping

    async def start(self, _):
        try:
            await self.get_roster()
            self.send_presence()
            # Join creates the room if it doesn't exist (as an auth user)
            self.plugin['xep_0045'].join_muc(self.room_jid, self.nick, wait=True)
            # Leave immediately after ensuring existence
            self.plugin['xep_0045'].leave_muc(self.room_jid, self.nick)
            if not self.result.done():
                self.result.set_result(True)
        except Exception as e:  # pragma: no cover
            if not self.result.done():
                self.result.set_exception(e)
        finally:
            self.disconnect()

    def failed(self, _):  # pragma: no cover
        if not self.result.done():
            self.result.set_exception(RuntimeError('XMPP auth failed'))


def provision_room(room_jid: str, nick: str = 'room-bot') -> Optional[bool]:
    """Ensure an XMPP MUC room exists by joining with a service user once.

    Returns True if success, False/None on failure.
    """
    if slixmpp is None:
        return None

    service_jid = os.getenv('XMPP_SERVICE_JID')
    service_password = os.getenv('XMPP_SERVICE_PASSWORD')
    xmpp_host = os.getenv('XMPP_HOST', 'jitsi.riverlearn.co.ke')
    
    if not service_jid or not service_password:
        return None

    try:
        xmpp = _ProvisionClient(service_jid, service_password, room_jid, nick)
        # Use BOSH which is always accessible via HTTPS
        bosh_url = f'https://{xmpp_host}/http-bind'
        xmpp.use_proxy = False
        xmpp.connect(address=(xmpp_host, 5222), use_ssl=False, use_tls=True)
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(xmpp.result)
        finally:
            loop.close()
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning(f'Room provision failed for {room_jid}: {e}')
        return None


