from rest_framework import serializers
from .models import Blog, Like
from authenticate.models import Comment, Profile
from authenticate.models import CustomUser
from .utils import SentimentAnalyzer

# Blog serializer
class BlogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Blog
        fields = '__all__'

# Comment serializer
class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id','comment_text', 'is_negative', 'needs_review']
        read_only_fields = [ 'user', 'blog', 'needs_review']

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

