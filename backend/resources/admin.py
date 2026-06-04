from django.contrib import admin
from .models import Resource, ActivityLog


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'semester', 'resource_type', 'uploaded_by', 'file_size_mb', 'created_at')
    list_filter = ('resource_type', 'semester', 'course')
    search_fields = ('title', 'description', 'course')
    readonly_fields = ('file_url', 'file_size', 'created_at', 'updated_at')


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'resource', 'timestamp')
    list_filter = ('action',)
    readonly_fields = ('timestamp',)
