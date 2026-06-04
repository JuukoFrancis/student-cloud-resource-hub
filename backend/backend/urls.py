"""
URL configuration for Cloud Academic Resource Hub backend.
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from accounts.admin_views import (
    AdminUserListView,
    AdminUserDetailView,
    AdminResourceModerationView,
    AdminActivityLogView,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # Authentication
    path('api/auth/', include('accounts.urls')),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Resources
    path('api/resources/', include('resources.urls')),

    # Sharing
    path('api/resources/', include('sharing.urls')),

    # Dashboard
    path('api/dashboard/', include('dashboard.urls')),

    # Admin management
    path('api/admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('api/admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('api/admin/resources/<int:pk>/', AdminResourceModerationView.as_view(), name='admin-resource-moderation'),
    path('api/admin/activity/', AdminActivityLogView.as_view(), name='admin-activity-log'),
]
