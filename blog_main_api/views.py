from django.shortcuts import get_object_or_404, redirect, render
from blog.models import Blog



def home(request): 
    return render(request, 'blog_list.html')




