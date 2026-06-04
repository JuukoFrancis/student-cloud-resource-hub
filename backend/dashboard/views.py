"""
Views for dashboard statistics and analytics.
"""

from django.db.models import Count, Sum
from django.db.models.functions import TruncDate
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from resources.models import Resource, ActivityLog
from accounts.permissions import IsAdminUser
from accounts.models import User


class DashboardStatsView(APIView):
    """Get dashboard statistics for the current user."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Total resources uploaded by user
        my_resources_count = Resource.objects.filter(uploaded_by=user).count()

        # Total storage used by user
        my_storage = Resource.objects.filter(
            uploaded_by=user
        ).aggregate(total=Sum('file_size'))['total'] or 0

        # Resources shared with user
        shared_with_me_count = user.shared_with_me.count()

        # Resources shared by user
        shared_by_me_count = user.shared_by_me.count()

        # Recent uploads (last 5)
        recent_uploads = Resource.objects.filter(
            uploaded_by=user
        ).order_by('-created_at')[:5]

        recent_data = []
        for r in recent_uploads:
            recent_data.append({
                'id': r.id,
                'title': r.title,
                'course': r.course,
                'resource_type': r.resource_type,
                'file_size_mb': r.file_size_mb,
                'created_at': r.created_at,
            })

        # Resources by course
        resources_by_course = (
            Resource.objects.filter(uploaded_by=user)
            .values('course')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        # Resources by type
        resources_by_type = (
            Resource.objects.filter(uploaded_by=user)
            .values('resource_type')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        # Recent activity (last 10)
        recent_activity = ActivityLog.objects.filter(
            user=user
        ).select_related('resource').order_by('-timestamp')[:10]

        activity_data = []
        for log in recent_activity:
            activity_data.append({
                'action': log.action,
                'action_display': log.get_action_display(),
                'resource_title': log.resource.title if log.resource else None,
                'timestamp': log.timestamp,
            })

        return Response({
            'my_resources_count': my_resources_count,
            'my_storage_bytes': my_storage,
            'my_storage_mb': round(my_storage / (1024 * 1024), 2) if my_storage else 0,
            'shared_with_me_count': shared_with_me_count,
            'shared_by_me_count': shared_by_me_count,
            'recent_uploads': recent_data,
            'resources_by_course': list(resources_by_course),
            'resources_by_type': list(resources_by_type),
            'recent_activity': activity_data,
        })


class AdminDashboardView(APIView):
    """Get admin dashboard statistics — admin only."""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        # Platform-wide stats
        total_users = User.objects.count()
        total_resources = Resource.objects.count()
        total_storage = Resource.objects.aggregate(
            total=Sum('file_size')
        )['total'] or 0

        # Users by role
        users_by_role = (
            User.objects.values('role')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        # Resources by course (top 10)
        resources_by_course = (
            Resource.objects.values('course')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
        )

        # Resources by type
        resources_by_type = (
            Resource.objects.values('resource_type')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        # Activity summary (last 30 days, by day)
        activity_summary = (
            ActivityLog.objects
            .annotate(date=TruncDate('timestamp'))
            .values('date', 'action')
            .annotate(count=Count('id'))
            .order_by('-date')[:50]
        )

        # Recent activity
        recent_activity = ActivityLog.objects.select_related(
            'user', 'resource'
        ).order_by('-timestamp')[:20]

        activity_data = []
        for log in recent_activity:
            activity_data.append({
                'username': log.user.username,
                'action': log.action,
                'action_display': log.get_action_display(),
                'resource_title': log.resource.title if log.resource else None,
                'timestamp': log.timestamp,
            })

        return Response({
            'total_users': total_users,
            'total_resources': total_resources,
            'total_storage_bytes': total_storage,
            'total_storage_mb': round(total_storage / (1024 * 1024), 2) if total_storage else 0,
            'users_by_role': list(users_by_role),
            'resources_by_course': list(resources_by_course),
            'resources_by_type': list(resources_by_type),
            'activity_summary': list(activity_summary),
            'recent_activity': activity_data,
        })
