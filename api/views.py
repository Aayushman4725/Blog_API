from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from authenticate.models import CustomUser, Comment, Profile
from api.serializers import CustomUserSerializer, CommentSerializer, ProfileSerializer, BlogSerializer, LikeSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from blog.models import Blog, Like

# Create your views here.
class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

## for blog_app api

class BlogViewSet(viewsets.ModelViewSet):
    queryset = Blog.objects.all()
    serializer_class = BlogSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['POST'])
    def like(self, request, pk=None):
        blog = self.get_object()
        user = request.user
        
        try:
            # If like exists, remove it (unlike)
            like = Like.objects.get(user=user, blog=blog)
            like.delete()
            blog.likes -= 1
            blog.save()
            return Response({'status': 'unliked'})
        except Like.DoesNotExist:
            # If like doesn't exist, create it
            Like.objects.create(user=user, blog=blog)
            blog.likes += 1
            blog.save()
            return Response({'status': 'liked'})

class LikeViewSet(viewsets.ModelViewSet):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)