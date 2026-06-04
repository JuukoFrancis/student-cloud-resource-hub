"""
Custom User model for Cloud Academic Resource Hub.
Supports three roles: student, lecturer, admin.
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user model with role-based access control."""

    class Role(models.TextChoices):
        STUDENT = 'student', 'Student'
        LECTURER = 'lecturer', 'Lecturer'
        ADMIN = 'admin', 'Admin'

    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STUDENT,
    )

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    class Meta:
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    @property
    def is_student(self):
        return self.role == self.Role.STUDENT

    @property
    def is_lecturer(self):
        return self.role == self.Role.LECTURER

    @property
    def is_admin_user(self):
        return self.role == self.Role.ADMIN
