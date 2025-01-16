from rest_framework import serializers
from authenticate.models import CustomUser, Comment, Profile
from blog.models import Blog, Like

# Serializers for authenticate models API
class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
        )
        return user

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'user', 'blog', 'comment_text', 'created_at', 'is_negative', 'needs_review']

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['id', 'user', 'profile_picture', 'phone_number', 'about']

# Serializers for blog models API
class BlogSerializer(serializers.ModelSerializer):
    likes_count = serializers.IntegerField(source='likes_count', read_only=True)

    class Meta:
        model = Blog
        fields = ['id', 'user', 'title', 'blog', 'summarized_blog', 'created_at', 'updated_at', 'likes', 'translated_blog', 'likes_count']

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ['id', 'user', 'blog', 'liked_at']
