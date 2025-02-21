from rest_framework import serializers
from .models import Blog, Like
from authenticate.models import Comment, Profile
from authenticate.models import CustomUser
from .utils import SentimentAnalyzer
from django.contrib.humanize.templatetags.humanize import naturaltime



class BlogSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)  # Just set it as read_only
    user_name = serializers.SerializerMethodField()
    created_at = serializers.SerializerMethodField()

    class Meta:
        model = Blog
        fields = '__all__'

    def get_user_name(self, obj):
        # Accessing the related user and getting their username
        return obj.user.username if obj.user else None  # Check if user exists

    def get_created_at(self, obj):
        # Convert the created_at datetime to "time ago" format
        return naturaltime(obj.created_at)

    def validate_blog(self, value):
        # Remove extra spaces, newlines, and trim it to handle large content
        if len(value) > 5000:  # Increased length limit to allow longer content
            raise serializers.ValidationError("Blog content cannot exceed 5000 characters.")
        return value

    def create(self, validated_data):
        # Automatically set the user to the currently authenticated user
        user = self.context['request'].user  # Assuming request is available in the context
        validated_data['user'] = user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # You don't need to update the user; it should remain the same
        validated_data.pop('user', None)  # Ensure we don't update the user field
        return super().update(instance, validated_data)

        return value
    
# Comment serializer
class CommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)  # Display the user's name

    
    class Meta:
        model = Comment
        fields = ['id','comment_text','user', 'is_negative', 'needs_review']
        read_only_fields = ['blog', 'needs_review']

    def create(self, validated_data):
        # Perform sentiment analysis on the comment text
        sentiment_analyzer = SentimentAnalyzer()
        comment_text = validated_data.get('comment_text')
        is_negative = sentiment_analyzer.analyze_sentiment(comment_text)

        # Add the sentiment analysis result to the validated data
        validated_data['is_negative'] = is_negative == 'negative'
        validated_data['needs_review'] = validated_data['is_negative']

        # Now that the necessary fields are set, we create the comment instance
        comment = Comment.objects.create(**validated_data)
        return comment
    

    
# Profile serializer
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['profile_picture', 'about']

