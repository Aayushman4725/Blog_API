from django.urls import path
from .views import SignupView, LoginView, ActivateView, LogoutView, PasswordResetView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='api_signup'),
    path('login/', LoginView.as_view(), name='api_login'),
    path('activate/<str:uidb64>/<str:token>/', ActivateView.as_view(), name='api_activate'),
    path('logout/', LogoutView.as_view(), name='api_logout'),
    path('password-reset/', PasswordResetView.as_view(), name='api_password_reset'),
]
