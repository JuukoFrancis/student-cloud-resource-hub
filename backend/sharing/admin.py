from django.contrib import admin
from .models import SharedResource


@admin.register(SharedResource)
class SharedResourceAdmin(admin.ModelAdmin):
    list_display = ('resource', 'owner', 'shared_with', 'shared_date')
    list_filter = ('shared_date',)
    search_fields = ('resource__title', 'owner__username', 'shared_with__username')
