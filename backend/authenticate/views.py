from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth import login, logout
from django.contrib.sites.shortcuts import get_current_site
from django.core.mail import send_mail, EmailMessage
from django.conf import settings
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from .serializers import SignupSerializer, LoginSerializer, ActivateSerializer,ProfileUpdateSerializer
from .tokens import generate_token
from django.template.loader import render_to_string
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from .models import Profile
from django.utils.encoding import force_str
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.urls import reverse
import logging
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponseRedirect
from rest_framework.parsers import MultiPartParser, FormParser

logger = logging.getLogger(__name__)


User=get_user_model()

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)

    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # Send activation email
            current_site = get_current_site(request)  # You need to import get_current_site from django.contrib.sites.shortcuts
            email_subject = "Activate your account for Blog App"
            
            # Generate activation link
            activation_link = reverse('api_activate', kwargs={
                'uidb64': urlsafe_base64_encode(force_bytes(user.pk)),
                'token': default_token_generator.make_token(user),
            })
            activation_url = f"http://{current_site.domain}{activation_link}"
            
            logger.info(f"Generated activation URL: {activation_url}")  # Log the URL for debugging

            # Render the email content as HTML
            message = render_to_string('email_confirmation.html', {
                'name': user.username,
                'activation_url': activation_url,
            })
            
            # Create the email and set content type to HTML
            email = EmailMessage(
                email_subject,  # Subject
                message,        # Message body (HTML content)
                settings.EMAIL_HOST_USER,  # From email
                [user.email],   # To email
            )
            email.content_subtype = 'html'  # Specify the content type as HTML
            
            # Send email and log success or failure
            try:
                email.send(fail_silently=False)
                logger.info(f"Activation email sent to {user.email}")
            except Exception as e:
                logger.error(f"Failed to send activation email to {user.email}: {e}")
            
            return Response({"detail": "Account created. Please check your email to activate your account."}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            login(request, user)

            # Debugging
            print(f"User: {user}, is_staff: {user.is_staff}")

            token = get_tokens_for_user(user)
            Profile.objects.get_or_create(user=user)
            return Response({
                'token': token,
                'is_admin': user.is_staff,
                'id' : user.id,
                'detail': "Logged in successfully."
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ActivateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist) as e:
            logger.error(f"Activation link error: {e}")
            return Response({"detail": "Invalid activation link."}, status=status.HTTP_400_BAD_REQUEST)

        if default_token_generator.check_token(user, token):
            if user.is_active:
                return Response({"detail": "Your account is already activated."}, status=status.HTTP_200_OK)

            user.is_active = True
            user.save()
             # Redirect to the React dashboard page after successful activation
            dashboard_url = "http://localhost:5173"  # Replace with your actual React app URL
            return HttpResponseRedirect(dashboard_url)
        
        logger.warning(f"Token validation failed for user {user.username if user else 'unknown'}.")
        return Response({"detail": "Invalid activation link."}, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({"detail": "Logged out successfully."}, status=status.HTTP_200_OK)


class PasswordResetView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]
    @csrf_exempt
    def post(self, request):
        logger.info("Password reset post method triggered.")  # Log statement

        email = request.data.get("email")
        if not email:
            return Response({"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=email).first()
        if not user:
            return Response({"detail": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)

        # Generate reset token and UID
        uid = urlsafe_base64_encode(str(user.pk).encode())
        token = default_token_generator.make_token(user)

        # Send reset password email
        current_site = get_current_site(request)
        email_subject = "Reset Your Password"
        message = render_to_string('password_reset_email.html', {
            'domain': current_site.domain,
            'link': f"http://{current_site.domain}{reverse('password_reset_confirm', kwargs={'uidb64': uid, 'token': token})}",
        })
        email = EmailMessage(email_subject, message, settings.EMAIL_HOST_USER, [user.email])
        email.send(fail_silently=True)
        return Response({"detail": "Password reset link sent to your email."}, status=status.HTTP_200_OK)

class ProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            profile = Profile.objects.get(user = request.user)
            serializer = ProfileUpdateSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except Profile.DoesNotExist:
            return Response({'error': 'Profile does not exist'}, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request):
        try:
            profile = Profile.objects.get(user = request.user)
            serializer = ProfileUpdateSerializer(profile, data = request.data, partial = True)
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status = status.HTTP_400_BAD_REQUEST)
        
        except Profile.DoesNotExist:
            return Response({'error': 'Profile does not exist'}, status=status.HTTP_404_NOT_FOUND)
            
            
            
    