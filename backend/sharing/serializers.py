"""
Serializers for SharedResource model.
"""

from rest_framework import serializers
from .models import SharedResource


class SharedResourceSerializer(serializers.ModelSerializer):
    """Serializer for shared resource entries."""
    resource_title = serializers.CharField(source='resource.title', read_only=True)
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    shared_with_username = serializers.CharField(
        source='shared_with.username', read_only=True
    )

    class Meta:
        model = SharedResource
        fields = (
            'id', 'resource', 'resource_title',
            'owner', 'owner_username',
            'shared_with', 'shared_with_username',
            'shared_date',
        )
        read_only_fields = ('owner', 'shared_date')


class ShareResourceSerializer(serializers.Serializer):
    """Serializer for sharing a resource with another user."""
    resource_id = serializers.IntegerField(required=True)
    shared_with_username = serializers.CharField(required=True)

    def validate_shared_with_username(self, value):
        from accounts.models import User
        if not User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                f'User "{value}" does not exist.'
            )
        return value
