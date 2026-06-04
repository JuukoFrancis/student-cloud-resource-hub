"""
Admin views for user management and resource moderation.
"""

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated

from accounts.models import User
from accounts.permissions import IsAdminUser
from accounts.serializers import UserListSerializer
from resources.models import Resource, ActivityLog


class AdminUserListView(ListAPIView):
    """List all users — admin only."""
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserListSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    search_fields = ['username', 'email']
    filter_fields = ['role', 'is_active']


class AdminUserDetailView(RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a user — admin only."""
    queryset = User.objects.all()
    serializer_class = UserListSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        if user == request.user:
            return Response(
                {'error': 'You cannot delete your own account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.is_active = False
        user.save()
        return Response(
            {'message': f'User {user.username} has been deactivated.'},
            status=status.HTTP_200_OK,
        )


class AdminResourceModerationView(APIView):
    """Admin can remove inappropriate resources."""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def delete(self, request, pk):
        try:
            resource = Resource.objects.get(pk=pk)
        except Resource.DoesNotExist:
            return Response(
                {'error': 'Resource not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Log the deletion
        ActivityLog.objects.create(
            user=request.user,
            action=ActivityLog.Action.DELETE,
            resource=resource,
        )

        resource.delete()
        return Response(
            {'message': 'Resource removed successfully.'},
            status=status.HTTP_204_NO_CONTENT,
        )


class AdminActivityLogView(ListAPIView):
    """View all activity logs — admin only."""
    from resources.serializers import ActivityLogSerializer
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_fields = ['action', 'user']
    ordering = ['-timestamp']

    def get_queryset(self):
        return ActivityLog.objects.select_related('user', 'resource').all()
