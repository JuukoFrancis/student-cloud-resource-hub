"""
URL configuration for sharing app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'share', views.SharingViewSet, basename='sharing')

urlpatterns = [
    path('', include(router.urls)),
]
