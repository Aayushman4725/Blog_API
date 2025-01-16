from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import CustomUserViewSet, CommentViewSet, ProfileViewSet

# Initializing the router
router = DefaultRouter()
router.register(r'users', CustomUserViewSet, basename='user')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'profiles', ProfileViewSet, basename='profile')

# Including the router's URLs
urlpatterns = [
    path('api/', include(router.urls)),
]