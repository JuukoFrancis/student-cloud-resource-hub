"""
Serializers for User authentication and profile.
"""

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
    )
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 'role')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError(
                {'password_confirm': 'Passwords do not match.'}
            )
        return attrs

    def validate_role(self, value):
        if value not in [User.Role.STUDENT, User.Role.LECTURER]:
            raise serializers.ValidationError(
                'Role must be either "student" or "lecturer".'
            )
        return value

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile retrieval and updates."""

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'role',
            'first_name', 'last_name', 'date_joined',
        )
        read_only_fields = ('id', 'username', 'role', 'date_joined')


class UserListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing users (admin view)."""

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'is_active', 'date_joined')
