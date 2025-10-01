from django.core.management.base import BaseCommand
from course_api.models import StudyGroup
from course_api.xmpp_provisioner import provision_room


class Command(BaseCommand):
    help = 'Provision XMPP MUC rooms for all study groups'

    def handle(self, *args, **options):
        count = 0
        for g in StudyGroup.objects.all():
            if g.xmpp_room_jid:
                ok = provision_room(g.xmpp_room_jid)
                if ok:
                    count += 1
        self.stdout.write(self.style.SUCCESS(f'Provisioned {count} rooms'))


