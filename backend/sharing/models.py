"""
SharedResource model for Cloud Academic Resource Hub.
"""

from django.conf import settings
from django.db import models


class SharedResource(models.Model):
    """Tracks resource sharing between users."""

    resource = models.ForeignKey(
        'resources.Resource',
        on_delete=models.CASCADE,
        related_name='shares',
    )
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='shared_by_me',
    )
    shared_with = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='shared_with_me',
    )
    shared_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('resource', 'shared_with')
        ordering = ['-shared_date']
        indexes = [
            models.Index(fields=['owner']),
            models.Index(fields=['shared_with']),
        ]

    def __str__(self):
        return f"{self.owner.username} shared '{self.resource.title}' with {self.shared_with.username}"
