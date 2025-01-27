from django.urls import path
from .views import *

urlpatterns = [
    path('blog_list/', blog_list, name='blog_list'),
    path('blogs/<int:pk>/', blog_detail, name='blog_detail'),
    path('blogs/<int:pk>/comments/', CommentAPIView.as_view(), name='create_comment'),
    path('blogs/<int:pk>/like/', like_blog, name='like_blog'),
    path('profile/update/', update_profile, name='update_profile'),
    path('create/', CreateBlogAPIView.as_view(), name='create_blog'),
    path('edit/<int:pk>/', EditBlogAPIView.as_view(), name='edit_blog'),
    path('delete/<int:pk>/', DeleteBlogAPIView.as_view(), name='delete_blog'),
    path('blogs/<int:pk>/translate/', TranslateBlogView.as_view(), name='translate_blog'),
    path('approve_comment/<int:pk>/', ApproveCommentAPIView.as_view(), name='approve_comment'),
    path('delete_comment/<int:pk>/', DeleteCommentAPIView.as_view(), name='delete_comment'),
    path('admin/review-comments/', AdminCommentReviewView.as_view(), name='admin_review_comments_api'),
    path('blogs/<int:pk>/comments/', CommentAPIView.as_view(), name='comment'),

    
]