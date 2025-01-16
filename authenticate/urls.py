from django.contrib import admin
from django.urls import include, path
from .views import CustomPasswordResetView
from . import views
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('sign_in/', views.sign_in, name='sign_in'),
    path('sign_up/',views.signup, name='sign_up'),
    path('sign_out/',views.signout, name='sign_out'),
    path('activate/<uidb64>/<token>',views.activate, name='activate'),
    path('password-reset/', CustomPasswordResetView.as_view(), name='password_reset'),
    path('password-reset-confirm/<uidb64>/<token>',auth_views.PasswordResetConfirmView.as_view(template_name= 'password_reset_confirm.html'), name='password_reset_confirm'),
    path('password-reset-complete/', auth_views.PasswordResetCompleteView.as_view(template_name = 'password_reset_complete.html'), name='password_reset_complete'),
]
   