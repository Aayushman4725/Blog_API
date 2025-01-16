from django.contrib import admin
from authenticate.models import CustomUser, Comment, Profile

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name')
    search_fields = ('username', 'email')

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'blog', 'created_at', 'is_negative', 'needs_review')
    list_filter = ('is_negative', 'needs_review')
    search_fields = ('user__username', 'blog__title', 'comment_text')

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone_number')
    search_fields = ('user__username', 'phone_number')