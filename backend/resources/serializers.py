"""
Serializers for Resource and ActivityLog models.
"""

from rest_framework import serializers
from .models import Resource, ActivityLog


class ResourceListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing resources."""
    uploaded_by_username = serializers.CharField(
        source='uploaded_by.username', read_only=True
    )
    resource_type_display = serializers.CharField(
        source='get_resource_type_display', read_only=True
    )
    semester_display = serializers.CharField(
        source='get_semester_display', read_only=True
    )
    file_size_mb = serializers.FloatField(read_only=True)

    class Meta:
        model = Resource
        fields = (
            'id', 'title', 'course', 'semester', 'semester_display',
            'resource_type', 'resource_type_display',
            'file_name', 'file_size', 'file_size_mb',
            'uploaded_by', 'uploaded_by_username',
            'created_at', 'updated_at',
        )


class ResourceDetailSerializer(serializers.ModelSerializer):
    """Full serializer for resource detail view."""
    uploaded_by_username = serializers.CharField(
        source='uploaded_by.username', read_only=True
    )
    resource_type_display = serializers.CharField(
        source='get_resource_type_display', read_only=True
    )
    semester_display = serializers.CharField(
        source='get_semester_display', read_only=True
    )
    file_size_mb = serializers.FloatField(read_only=True)
    is_shared = serializers.SerializerMethodField()

    class Meta:
        model = Resource
        fields = (
            'id', 'title', 'description', 'course', 'semester', 'semester_display',
            'resource_type', 'resource_type_display',
            'file_url', 'file_name', 'file_size', 'file_size_mb',
            'uploaded_by', 'uploaded_by_username',
            'is_shared', 'created_at', 'updated_at',
        )
        read_only_fields = ('file_url', 'file_size', 'uploaded_by')

    def get_is_shared(self, obj):
        return obj.shares.exists()


class ResourceUploadSerializer(serializers.ModelSerializer):
    """Serializer for uploading a new resource with file."""

    class Meta:
        model = Resource
        fields = (
            'id', 'title', 'description', 'course', 'semester',
            'resource_type', 'file',
        )

    def validate_file(self, value):
        if value:
            allowed_extensions = ['pdf', 'docx', 'pptx', 'zip', 'jpg', 'jpeg', 'png', 'gif']
            ext = value.name.split('.')[-1].lower()
            if ext not in allowed_extensions:
                raise serializers.ValidationError(
                    f'File type ".{ext}" is not allowed. '
                    f'Allowed types: {", ".join(allowed_extensions)}'
                )
            # 50 MB limit
            if value.size > 52428800:
                raise serializers.ValidationError(
                    'File size cannot exceed 50 MB.'
                )
        return value


class ActivityLogSerializer(serializers.ModelSerializer):
    """Serializer for activity log entries."""
    username = serializers.CharField(source='user.username', read_only=True)
    resource_title = serializers.CharField(
        source='resource.title', read_only=True, default=None
    )
    action_display = serializers.CharField(
        source='get_action_display', read_only=True
    )

    class Meta:
        model = ActivityLog
        fields = (
            'id', 'user', 'username', 'action', 'action_display',
            'resource', 'resource_title', 'timestamp',
        )
