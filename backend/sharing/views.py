"""
Views for resource sharing.
"""

from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from accounts.models import User
from accounts.permissions import IsOwnerOfShare, IsAdminUser
from resources.models import Resource, ActivityLog
from .models import SharedResource
from .serializers import SharedResourceSerializer, ShareResourceSerializer


class SharingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing resource sharing.
    """
    serializer_class = SharedResourceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SharedResource.objects.select_related(
            'resource', 'owner', 'shared_with'
        ).all()

    @action(detail=False, methods=['post'], url_path='share')
    def share_resource(self, request):
        """Share a resource with another user."""
        serializer = ShareResourceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        resource_id = serializer.validated_data['resource_id']
        shared_with_username = serializer.validated_data['shared_with_username']

        # Get the resource
        try:
            resource = Resource.objects.get(id=resource_id)
        except Resource.DoesNotExist:
            return Response(
                {'error': 'Resource not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Only owner or admin can share
        if resource.uploaded_by != request.user and request.user.role != 'admin':
            return Response(
                {'error': 'You can only share resources you own.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Get the target user
        shared_with_user = User.objects.get(username=shared_with_username)

        # Cannot share with yourself
        if shared_with_user == request.user:
            return Response(
                {'error': 'You cannot share a resource with yourself.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if already shared
        if SharedResource.objects.filter(
            resource=resource,
            shared_with=shared_with_user,
        ).exists():
            return Response(
                {'error': f'Resource already shared with {shared_with_username}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        shared = SharedResource.objects.create(
            resource=resource,
            owner=request.user,
            shared_with=shared_with_user,
        )

        # Log the share activity
        ActivityLog.objects.create(
            user=request.user,
            action=ActivityLog.Action.SHARE,
            resource=resource,
        )

        output_serializer = SharedResourceSerializer(shared)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='shared-with-me')
    def shared_with_me(self, request):
        """Get resources shared with the current user."""
        shared = SharedResource.objects.filter(
            shared_with=request.user
        ).select_related('resource', 'owner', 'shared_with')

        serializer = SharedResourceSerializer(shared, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='shared-by-me')
    def shared_by_me(self, request):
        """Get resources shared by the current user."""
        shared = SharedResource.objects.filter(
            owner=request.user
        ).select_related('resource', 'owner', 'shared_with')

        serializer = SharedResourceSerializer(shared, many=True)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """Remove a sharing permission — only owner or admin."""
        instance = self.get_object()

        if instance.owner != request.user and request.user.role != 'admin':
            return Response(
                {'error': 'You can only remove shares you created.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        instance.delete()
        return Response(
            {'message': 'Sharing permission removed.'},
            status=status.HTTP_204_NO_CONTENT,
        )
