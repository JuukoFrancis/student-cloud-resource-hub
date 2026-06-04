"""
URL configuration for dashboard app.
"""

from django.urls import path
from . import views

urlpatterns = [
    path('stats/', views.DashboardStatsView.as_view(), name='dashboard-stats'),
    path('admin/', views.AdminDashboardView.as_view(), name='dashboard-admin'),
]
