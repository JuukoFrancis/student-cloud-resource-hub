"""
Resource and ActivityLog models for Cloud Academic Resource Hub.
"""

import os
import uuid

from django.conf import settings
from django.db import models


def resource_file_path(instance, filename):
    """Generate a unique file path for uploaded resources."""
    ext = filename.split('.')[-1]
    new_filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('resources', str(instance.uploaded_by_id), new_filename)


class Resource(models.Model):
    """Academic resource model — files stored in Azure Blob Storage."""

    class ResourceType(models.TextChoices):
        LECTURE_NOTES = 'lecture_notes', 'Lecture Notes'
        ASSIGNMENT = 'assignment', 'Assignment'
        PAST_PAPER = 'past_paper', 'Past Paper'
        TUTORIAL = 'tutorial', 'Tutorial'
        PROJECT_REPORT = 'project_report', 'Project Report'
        OTHER = 'other', 'Other'

    class Semester(models.TextChoices):
        SEM1_Y1 = '1_1', 'Year 1 - Semester 1'
        SEM2_Y1 = '1_2', 'Year 1 - Semester 2'
        SEM1_Y2 = '2_1', 'Year 2 - Semester 1'
        SEM2_Y2 = '2_2', 'Year 2 - Semester 2'
        SEM1_Y3 = '3_1', 'Year 3 - Semester 1'
        SEM2_Y3 = '3_2', 'Year 3 - Semester 2'
        SEM1_Y4 = '4_1', 'Year 4 - Semester 1'
        SEM2_Y4 = '4_2', 'Year 4 - Semester 2'

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    course = models.CharField(max_length=100)
    semester = models.CharField(
        max_length=5,
        choices=Semester.choices,
    )
    resource_type = models.CharField(
        max_length=20,
        choices=ResourceType.choices,
    )
    file_url = models.URLField(max_length=1024, blank=True)
    file_name = models.CharField(max_length=255, blank=True)
    file_size = models.PositiveBigIntegerField(default=0, help_text='File size in bytes')
    file = models.FileField(
        upload_to=resource_file_path,
        blank=True,
        help_text='Temporary local file — will be moved to Azure Blob Storage',
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='resources',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['course']),
            models.Index(fields=['semester']),
            models.Index(fields=['resource_type']),
            models.Index(fields=['uploaded_by']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return f"{self.title} ({self.get_resource_type_display()})"

    @property
    def file_size_mb(self):
        """Return file size in MB."""
        if self.file_size:
            return round(self.file_size / (1024 * 1024), 2)
        return 0


class ActivityLog(models.Model):
    """Tracks user activities on the platform."""

    class Action(models.TextChoices):
        UPLOAD = 'upload', 'Upload'
        DOWNLOAD = 'download', 'Download'
        VIEW = 'view', 'View'
        DELETE = 'delete', 'Delete'
        SHARE = 'share', 'Share'
        LOGIN = 'login', 'Login'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='activities',
    )
    action = models.CharField(max_length=20, choices=Action.choices)
    resource = models.ForeignKey(
        Resource,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='activities',
    )
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['action']),
            models.Index(fields=['-timestamp']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.get_action_display()} at {self.timestamp}"
