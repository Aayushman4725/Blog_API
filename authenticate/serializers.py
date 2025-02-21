from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.password_validation import validate_password
from .tokens import generate_token
from .models import Profile

User = get_user_model()

class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirm_password']

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        validate_password(data['password'])  # Validate password strength
        return data
    
    def create(self, validated_data):
        validated_data.pop('confirm password')
        user = User.objects.create_user
        (
            username = validated_data['username'],
            email = validated_data['email'],
            password = vaidated_data['password'],

        )
        user.is_active = False
        user.save()
        return user
