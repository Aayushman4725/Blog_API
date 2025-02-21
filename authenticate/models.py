from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from .managers import CustomUserManager
from django.conf import settings
from blog.models import Blog
# Create your models here.
class CustomUser(AbstractUser):
    username = models.CharField(_("Username"), max_length=100, unique=True)
    email = models.EmailField(_("Email"), unique=True)
    # comment = models.TextField(_("Comment"), blank=True, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']  # Add 'username' to REQUIRED_FIELDS

    objects = CustomUserManager()

    def __str__(self):
        return self.username

class Comment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
    blog = models.ForeignKey(Blog, on_delete=models.CASCADE)
    comment_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_negative = models.BooleanField(default=False)
    needs_review = models.BooleanField(default=False)

    def __str__(self):
        return f"Comment by {self.user.username} on {self.blog.title}"

    
class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    profile_picture = models.ImageField(default='images/profile_picture/default.jpg', upload_to='images/profile_picture')
    phone_number = models.CharField(("Phone Number"), max_length=15, blank=True, null=True)
    about = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.user.username
    









   