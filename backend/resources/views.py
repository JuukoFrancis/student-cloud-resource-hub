"""
Views for resource management: CRUD, upload, download, search.
"""

import os

from django.conf import settings
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from rest_framework import status, viewsets, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Resource, ActivityLog
from .serializers import (
    ResourceListSerializer,
    ResourceDetailSerializer,
    ResourceUploadSerializer,
)
from .azure_storage import azure_storage, get_content_type
from accounts.permissions import IsOwnerOrAdmin, IsOwnerOrSharedWith, IsAdminUser


class ResourceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for resource CRUD operations.
    - List: all resources (paginated, filterable)
    - Create: upload a new resource (file → Azure Blob Storage)
    - Retrieve: single resource detail
    - Update: update metadata only (owner or admin)
    - Destroy: delete resource (owner or admin)
    """
    permission_classes = [IsAuthenticated]
    filter_fields = ['course', 'semester', 'resource_type', 'uploaded_by']
    search_fields = ['title', 'description', 'course']
    ordering_fields = ['created_at', 'title', 'file_size']
    ordering = ['-created_at']

    def get_queryset(self):
        return Resource.objects.select_related('uploaded_by').all()

    def get_serializer_class(self):
        if self.action == 'create':
            return ResourceUploadSerializer
        if self.action == 'list':
            return ResourceListSerializer
        return ResourceDetailSerializer

    parser_classes = [MultiPartParser, FormParser]

    def create(self, request, *args, **kwargs):
        """Upload a new resource — file goes to Azure Blob Storage."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        resource = serializer.save(uploaded_by=request.user)

        # Handle file upload to Azure Blob Storage
        uploaded_file = resource.file
        if uploaded_file:
            file_name = uploaded_file.name
            blob_name = f"resources/{request.user.id}/{os.path.basename(file_name)}"
            content_type = get_content_type(file_name)

            # Upload to Azure Blob Storage
            file_url = azure_storage.upload_file(
                uploaded_file.read(),
                blob_name,
                content_type=content_type,
            )

            if file_url:
                resource.file_url = file_url
                resource.file_name = file_name
                resource.file_size = uploaded_file.size
            else:
                # Fallback: store locally if Azure is not configured
                resource.file_url = uploaded_file.url
                resource.file_name = file_name
                resource.file_size = uploaded_file.size

            resource.save()

        # Log the upload activity
        ActivityLog.objects.create(
            user=request.user,
            action=ActivityLog.Action.UPLOAD,
            resource=resource,
        )

        output_serializer = ResourceDetailSerializer(resource)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, *args, **kwargs):
        """Get a single resource detail — logs a view activity."""
        resource = self.get_object()
        self.check_object_permissions(request, resource)

        ActivityLog.objects.create(
            user=request.user,
            action=ActivityLog.Action.VIEW,
            resource=resource,
        )

        serializer = self.get_serializer(resource)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        """Update resource metadata — only owner or admin."""
        resource = self.get_object()
        self.check_object_permissions(request, resource)

        if not (resource.uploaded_by == request.user or request.user.role == 'admin'):
            return Response(
                {'error': 'You do not have permission to edit this resource.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Delete a resource — only owner or admin."""
        resource = self.get_object()
        self.check_object_permissions(request, resource)

        if not (resource.uploaded_by == request.user or request.user.role == 'admin'):
            return Response(
                {'error': 'You do not have permission to delete this resource.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Delete from Azure Blob Storage if file_url exists
        if resource.file_url:
            blob_name = f"resources/{resource.uploaded_by_id}/{resource.file_name}"
            azure_storage.delete_file(blob_name)

        # Log the delete activity
        ActivityLog.objects.create(
            user=request.user,
            action=ActivityLog.Action.DELETE,
            resource=resource,
        )

        resource.delete()
        return Response(
            {'message': 'Resource deleted successfully.'},
            status=status.HTTP_204_NO_CONTENT,
        )

    @action(detail=True, methods=['get'], url_path='download')
    def download(self, request, pk=None):
        """Get the download URL for a resource."""
        resource = self.get_object()

        if not resource.file_url:
            return Response(
                {'error': 'No file attached to this resource.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Log the download activity
        ActivityLog.objects.create(
            user=request.user,
            action=ActivityLog.Action.DOWNLOAD,
            resource=resource,
        )

        return Response({
            'file_url': resource.file_url,
            'file_name': resource.file_name,
            'file_size': resource.file_size,
        })

    @action(detail=False, methods=['get'], url_path='my-uploads')
    def my_uploads(self, request):
        """Get resources uploaded by the current user."""
        queryset = self.get_queryset().filter(uploaded_by=request.user)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = ResourceListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = ResourceListSerializer(queryset, many=True)
        return Response(serializer.data)


class ResourceSearchView(viewsets.GenericViewSet):
    """
    Search endpoint for resources.
    Supports keyword search + filters.
    """
    serializer_class = ResourceListSerializer
    permission_classes = [IsAuthenticated]
    filter_fields = ['course', 'semester', 'resource_type']
    search_fields = ['title', 'description', 'course']
    ordering_fields = ['created_at', 'title', 'file_size']
    ordering = ['-created_at']

    def get_queryset(self):
        return Resource.objects.select_related('uploaded_by').all()

    def list(self, request):
        """Search resources with filters and sorting."""
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
