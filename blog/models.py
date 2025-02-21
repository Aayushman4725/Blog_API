from django.db import models
from django.conf import settings

# Create your models here.
class Blog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=100)
    blog = models.TextField(max_length=5000)
    summarized_blog = models.TextField(max_length=5000, blank=True, null=True)  # Field for storing summary
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    likes = models.IntegerField(default=0)
    translated_blog = models.TextField(max_length=5000, blank=True, null=True)

    def __str__(self):
        return self.title

    
    @property
    def likes_count(self):
        return self.like_set.count()
    
class Like(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    blog = models.ForeignKey('Blog', on_delete=models.CASCADE)
    liked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'blog')

    def __str__(self):
        return self.blog.title