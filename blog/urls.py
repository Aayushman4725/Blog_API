from django.urls import path
from .views import *

urlpatterns = [
    path('blogs/', blog_list, name='blog_list'),
    path('blogs/<int:pk>/', blog_detail, name='blog_detail'),
    path('blogs/<int:pk>/comments/', CommentAPIView.as_view(), name='create_comment'),
    path('blogs/<int:pk>/like/', like_blog, name='like_blog'),
    path('profile/update/', update_profile, name='update_profile'),
    path('create/', CreateBlogAPIView.as_view(), name='create_blog'),
    path('edit/<int:pk>/', EditBlogAPIView.as_view(), name='edit_blog'),
    path('delete/<int:pk>/', DeleteBlogAPIView.as_view(), name='delete_blog'),
    path('blogs/<int:pk>/translate/', TranslateBlogView.as_view(), name='translate_blog'),
    
]