from blog.models import Blog
from django import forms
from django.contrib.auth.models import User
from authenticate.models import Comment
from django.contrib.auth import get_user_model
from authenticate.models import Profile
from .utils import SentimentAnalyzer
User = get_user_model()

class BlogForm(forms.ModelForm):
    class Meta:
        model = Blog
        fields = ['title', 'blog']

        widgets = {
            'title' : forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter a title'}),
            'blog' : forms.Textarea(attrs={'class': 'form-control', 'placeholder': 'Enter a blog'}),
        }

class BlogEdit(forms.ModelForm):
    class Meta:
        model = Blog
        fields = ['title', 'blog']

        widgets = {
            'title' : forms.TextInput(attrs={'class': 'form-control', 'id': 'floatingInput','placeholder': 'Enter a title'}),
            'blog' : forms.Textarea(attrs={'class': 'form-control', 'id': 'floatingInput', 'placeholder':'Write the blog here...'}),
           
        }  

from django import forms


class ComentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ['comment_text']  # 'user' and 'blog' will be assigned in the view

        widgets = {
            'comment_text': forms.Textarea(attrs={
                'class': 'form-control',
                'id': 'floatingInput',
                'placeholder': 'Enter a comment'
            }),
        }

    def save(self, commit=True):
        comment_instance = super().save(commit=False)

        # Sentiment Analysis
        analyzer = SentimentAnalyzer()
        sentiment = analyzer.analyze_sentiment(comment_instance.comment_text)  # Use analyze_sentiment instead of predict

        # Update fields based on sentiment analysis
        comment_instance.is_negative = (sentiment == 0)  # 0 means negative
        comment_instance.needs_review = comment_instance.is_negative

        if commit:
            comment_instance.save()

        return comment_instance



class EditProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['profile_picture', 'about']


        widgets = {
           
            'about' : forms.Textarea(attrs={'class': 'form-control', 'id': 'floatingInput','placeholder': 'Enter a comment'}),
           
        }  