from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.password_validation import validate_password
from .tokens import generate_token
from .models import Profile