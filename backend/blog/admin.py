from django.contrib import admin
from .models import Blog,Like

# Register your models here.
admin.site.register(Blog)


from authenticate.models import Comment

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'blog', 'comment_text', 'is_negative', 'needs_review', 'created_at')
    list_filter = ('is_negative', 'needs_review', 'created_at')
    search_fields = ('comment_text', 'user__username', 'blog__title')
    actions = ['approve_comments', 'delete_comments']

    def approve_comments(self, request, queryset):
        queryset.update(needs_review=False)
        self.message_user(request, "Selected comments have been approved.")
    approve_comments.short_description = "Approve selected comments"

    def delete_comments(self, request, queryset):
        queryset.delete()
        self.message_user(request, "Selected comments have been deleted.")
    delete_comments.short_description = "Delete selected comments"


admin.site.register(Like)