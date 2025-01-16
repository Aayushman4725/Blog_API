from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import CustomUserViewSet, CommentViewSet, ProfileViewSet, BlogViewSet, LikeViewSet

# Initializing the router
router = DefaultRouter()
router.register(r'users', CustomUserViewSet, basename='user')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'profiles', ProfileViewSet, basename='profile')
router.register(r'blogs', BlogViewSet)
router.register(r'likes', LikeViewSet)

# Including the router's URLs
urlpatterns = [
    path('', include(router.urls)),
]