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
        validated_data.pop('confirm_password')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )
        user.is_active = False
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError({"detail": "Invalid credentials."})
        if not user.is_active:
            raise serializers.ValidationError({"detail": "Account is not activated."})
        return user


class ActivateSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()

    def validate(self, data):
        try:
            uid = urlsafe_base64_decode(data['uid']).decode()
            user = User.objects.get(pk=uid)
        except (ValueError, User.DoesNotExist):
            raise serializers.ValidationError({"detail": "Invalid activation link."})

        if not generate_token.check_token(user, data['token']):
            raise serializers.ValidationError({"detail": "Invalid activation token."})

        user.is_active = True
        user.save()
        return user




class ProfileUpdateSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username')  # Include user fields like username
    userId = serializers.CharField(source='user.id',read_only=True)  # Include user fields like username
    email = serializers.CharField(source='user.email',read_only=True)  # Include email from the user model
    is_admin = serializers.BooleanField(source='user.is_staff',read_only=True) 
    profile_picture = serializers.ImageField(required=False)  # Allow updating profile picture
    
    class Meta:
        model = Profile
        fields = ['profile_picture', 'phone_number', 'about', 'user', 'email','is_admin','userId',]
    
    def update(self, instance, validated_data):
        # Extract nested user data
        user_data = validated_data.pop("user", None)

        # Update the Profile instance
        instance.phone_number = validated_data.get("phone_number", instance.phone_number)
        instance.about = validated_data.get("about", instance.about)

        # Handle profile picture update
        profile_picture = validated_data.get("profile_picture")
        if profile_picture:
            instance.profile_picture = profile_picture

        instance.save()

        # Update the related User instance
        if user_data:
            user = instance.user
            user.username = user_data.get("username", user.username)
            user.save()

        return instance
    
    
