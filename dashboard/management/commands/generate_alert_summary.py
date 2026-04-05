from django.core.management.base import BaseCommand
from dashboard.models import Alert, AlertSummary
from django.utils import timezone
from datetime import timedelta

class Command(BaseCommand):
    help = 'Generate alert summary every 5 minutes and delete processed alerts'

    def handle(self, *args, **options):
        # Get the last summary time
        last_summary = AlertSummary.objects.order_by('-created_at').first()
        if last_summary:
            since = last_summary.created_at
        else:
            # If no summary, summarize all alerts from the last 5 minutes
            since = timezone.now() - timedelta(minutes=5)

        # Get alerts since last summary
        alerts = Alert.objects.filter(timestamp__gte=since)

        if alerts.exists():
            # Generate summary
            alert_count = alerts.count()
            cameras = alerts.values_list('camera__name', flat=True).distinct()
            summary_text = f"Summary: {alert_count} alerts from cameras: {', '.join(cameras)}"

            # Create summary
            AlertSummary.objects.create(
                summary_text=summary_text,
                alert_count=alert_count
            )

            # Delete the alerts
            alerts.delete()

            self.stdout.write(self.style.SUCCESS(f'Summary generated: {summary_text}'))
        else:
            self.stdout.write('No new alerts to summarize')