"""
Custom permissions for Cloud Academic Resource Hub.
"""

from rest_framework.permissions import BasePermission


class IsOwnerOrAdmin(BasePermission):
    """
    Allow access only to the owner of the object or an admin user.
    Assumes the model instance has an `uploaded_by` attribute.
    """

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        return obj.uploaded_by == request.user


class IsOwnerOrSharedWith(BasePermission):
    """
    Allow access to the owner, users the resource is shared with, or admins.
    """

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        if obj.uploaded_by == request.user:
            return True
        return obj.shares.filter(shared_with=request.user).exists()


class IsAdminUser(BasePermission):
    """Allow access only to admin users."""

    def has_permission(self, request, view):
        return request.user.role == 'admin'


class IsLecturerOrAdmin(BasePermission):
    """Allow access to lecturers and admins."""

    def has_permission(self, request, view):
        return request.user.role in ('lecturer', 'admin')


class IsOwnerOfShare(BasePermission):
    """Allow access only to the owner of the share or an admin."""

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        return obj.owner == request.user
