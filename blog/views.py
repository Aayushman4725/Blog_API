from django.shortcuts import render, redirect,get_object_or_404
from authenticate.models import Comment
from blog.models import Blog,Like
from django.views.generic.list import ListView
from django.views.generic.detail import DetailView
from django.views.generic.edit import CreateView,UpdateView,DeleteView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from .forms import BlogForm,BlogEdit,ComentForm,EditProfileForm
from django.views import View
from django.contrib.auth.models import User
from authenticate.models import Profile
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from .utils import translate_text,summarize_blog
import json
from django.contrib.admin.views.decorators import staff_member_required
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from .utils import SentimentAnalyzer

User=get_user_model()


# views.py
class BlogList(ListView):
    model = Blog
    template_name = 'blog_list.html'
    context_object_name = 'blogs'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        search_input = self.request.GET.get('search_area') or ''
        if search_input:
            context['blogs'] = context['blogs'].filter(title__startswith=search_input)
        else:
            context['blogs'] = self.get_queryset()

        for blog in context['blogs']:
            # Check if the summary already exists in the database, otherwise, generate it
            if not blog.summarized_blog:
                blog.summarized_blog = summarize_blog(blog.blog)
                blog.save()  # Save the summary in the database

            blog.summary = blog.summarized_blog  # Use the stored summary

        context['search_input'] = search_input
        return context


def translate_blog_view(request, pk):
    blog = get_object_or_404(Blog, pk=pk)

    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            target_lang = data.get('language', 'fr')  # Default to French
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)

        try:
            translated_content = translate_text(blog.blog, target_lang)
            # Log the translated content to see what's returned
            print(f"Translated content: {translated_content}")
            return JsonResponse({'translated_content': translated_content})
        except Exception as e:
            return JsonResponse({'error': 'Translation failed', 'details': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=400)


class UserList(LoginRequiredMixin,ListView):
    model = Blog
    template_name = 'user_list.html'
    context_object_name = 'blogs'  

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # context['blogs'] = context['blogs'].filter(user=self.request.user)
        search_input = self.request.GET.get('search_area') or ''
        
        
        if search_input:
            context['blogs'] =  context['blogs'].filter(title__startswith=search_input)
        else:
            context['blogs'] = self.get_queryset()

        if self.request.user.is_authenticated:
            context['blogs'] = context['blogs'].filter(user=self.request.user)
            profile, created = Profile.objects.get_or_create(user=self.request.user)
            context['profile'] = profile
        
        context['search_input'] = search_input
        return context
    




class createBlog(LoginRequiredMixin,CreateView):
    model = Blog
    template_name = 'blog_form.html'
    form_class = BlogForm
    success_url = reverse_lazy('blog')

    def form_valid(self, form):
        form.instance.user = self.request.user
        return super(createBlog, self).form_valid(form)

class EditBlog(LoginRequiredMixin ,UpdateView):
    model = Blog
    template_name = 'edit_blog.html'
    form_class = BlogEdit
    
    success_url = reverse_lazy('user_dashboard')
    def get_success_url(self):
        return reverse_lazy('user_dashboard', kwargs={'pk': self.request.user.pk})

class DeleteBlog(LoginRequiredMixin ,DeleteView):
    model = Blog
    template_name = 'delete_blog.html'
    get_object_name = 'blog'
    success_url = reverse_lazy('user_dashboard')
    
    def get_success_url(self):
        return reverse_lazy('user_dashboard', kwargs={'pk': self.request.user.pk})
    

def liked_blog(request, pk):
   
        blog = get_object_or_404(Blog, pk=pk)
        if not Like.objects.filter(user=request.user, blog=blog).exists():
            Like.objects.create(user=request.user, blog=blog)
        else:
            like = Like.objects.filter(user=request.user, blog=blog).first()
            like.delete()
        return render(request, 'like.html', {'b': blog})   # Make sure 'blog' is the correct name of the URL pattern for your blog list or detail view.

class CommentView(View):
    form_class = ComentForm
    template_name = 'comment.html'
    success_url = reverse_lazy('blog')  # Replace with your actual success URL

    def get_blog(self, pk):
        try:
            return Blog.objects.get(pk=pk)
        except Blog.DoesNotExist:
            return None

    def post(self, request, pk, *args, **kwargs):
        blog = self.get_blog(pk)
        if blog is None:
            return render(request, '404.html')  # Handle missing blog gracefully

        form = self.form_class(request.POST)
        if form.is_valid():
            # Assign the logged-in user and blog to the comment instance
            form.instance.user = request.user
            form.instance.blog = blog

            # Analyze the comment sentiment
            sentiment_analyzer = SentimentAnalyzer()
            is_negative = sentiment_analyzer.analyze_sentiment(form.cleaned_data['comment_text'])

            # Update the 'is_negative' and 'needs_review' fields
            form.instance.is_negative = is_negative == 'negative'  # Adjust based on your model output
            form.instance.needs_review = form.instance.is_negative  # Flag for admin review if negative

            # Save the comment instance
            form.save()

            # Redirect after saving
            return redirect(self.success_url)
        
        # Render the form with errors if not valid
        return render(request, self.template_name, {'form': form, 'blog': blog})
class CommentDetail(ListView):
    model = Comment
    template_name = 'comentDetail.html'
    context_object_name = 'comments'

    def get_queryset(self):
        pk = self.kwargs.get('pk')
        return Comment.objects.filter(blog_id=pk)

@method_decorator(staff_member_required, name='dispatch')
class AdminCommentReviewView(ListView):
    model = Comment
    template_name = 'admin_review_comments.html'
    context_object_name = 'comments'

    def get_queryset(self):
        return Comment.objects.filter(needs_review=True)

@csrf_exempt
def approve_comment(request, pk):
    if request.method == 'POST':
        comment = Comment.objects.get(pk=pk)
        comment.needs_review = False
        comment.save()
        return redirect('admin_review_comments')
    return HttpResponse(status=405)

@csrf_exempt
def delete_comment(request, pk):
    if request.method == 'POST':
        comment = Comment.objects.get(pk=pk)
        comment.delete()
        return redirect('admin_review_comments')
    return HttpResponse(status=405)

# def change_profile_pic(request,pk):
#     user = get_object_or_404(User, pk=pk)


class EditProfile(UpdateView):
    form_class = EditProfileForm
    template_name = 'EditProfile.html'
    
    success_url = reverse_lazy('user_dashboard')
    
    def get_object(self, queryset=None):
        return get_object_or_404(Profile, user=self.request.user)

    def get_success_url(self):
        return reverse_lazy('user_dashboard', kwargs={'pk': self.request.user.pk})