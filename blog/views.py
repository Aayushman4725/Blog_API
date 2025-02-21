from rest_framework import status
from rest_framework.decorators import api_view, permission_classes,authentication_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import BlogSerializer, CommentSerializer, ProfileSerializer
from .models import Blog,Like
from authenticate.models import Comment, Profile
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from .utils import translate_text
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

# Blog list API view
@api_view(['GET'])
@authentication_classes([])  # Disable authentication
@permission_classes([AllowAny])  # Allow any user to access the view
def blog_list(request):
    if request.method == 'GET':
        blogs = Blog.objects.all()
        serializer = BlogSerializer(blogs, many=True)
        return Response(serializer.data)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])  
def blog_list_user(request):
    print(f"Authenticated User: {request.user}")  # Debugging line
    blogs = Blog.objects.filter(user=request.user)
    print(f"Blogs Returned: {blogs}")  # Debugging line
    serializer = BlogSerializer(blogs, many=True)
    return Response(serializer.data)

    

# Blog detail API view
@api_view(['GET'])
def blog_detail(request, pk):
    blog = get_object_or_404(Blog, pk=pk)
    if request.method == 'GET':
        serializer = BlogSerializer(blog)
        return Response(serializer.data)
    

# Create a comment API view
class CommentAPIView(APIView):
    def get_permissions(self):
        """
        Dynamically assign permissions based on the HTTP method.
        - AllowAny for GET (public access).
        - IsAuthenticated for POST (only authenticated users).
        """
        if self.request.method == "POST":
            return [IsAuthenticated()]
        return [AllowAny()]
    def get(self, request, pk=None):
        # If a blog ID is provided, filter comments for that blog
        
        comments = Comment.objects.filter(blog_id=pk)
        
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    def post(self, request, pk, *args, **kwargs):
        # Fetch the blog using the primary key (pk)
        blog = get_object_or_404(Blog, pk=pk)

        # Prepare the data to be serialized
        serializer = CommentSerializer(data=request.data)

        if serializer.is_valid():
            # Add the blog and user to the validated data
            serializer.validated_data['blog'] = blog
            serializer.validated_data['user'] = request.user

            # Save the comment and return a response
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    

class AdminCommentReviewView(generics.ListAPIView):
    queryset = Comment.objects.filter(needs_review=True)
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAdminUser]  # Ensures only admin users can access this view

    def get_queryset(self):
        return Comment.objects.filter(needs_review=True)
    
class ApproveCommentAPIView(APIView):
    
    def post(self, request, pk, *args, **kwargs):
        # Fetch the comment using pk
        comment = get_object_or_404(Comment, pk=pk)
        
        # Update the 'needs_review' field to False
        comment.needs_review = False
        comment.save()
        
        return Response({"message": "Comment approved successfully."}, status=status.HTTP_200_OK)
    
class DeleteCommentAPIView(APIView):
    
    def post(self, request, pk, *args, **kwargs):
        # Fetch the comment using pk
        comment = get_object_or_404(Comment, pk=pk)
        
        # Delete the comment
        comment.delete()
        
        return Response({"message": "Comment deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

# Like a blog API view
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def like_blog(request, pk):
    blog = get_object_or_404(Blog, pk=pk)

    # Check if the user has already liked the blog
    if not Like.objects.filter(user=request.user, blog=blog).exists():
        # Create the like object
        Like.objects.create(user=request.user, blog=blog)
        # Increment the likes count in the blog model
        blog.likes += 1
        blog.save()  # Save the updated blog with the incremented like count
        return Response({'status': 'Liked', 'likes': blog.likes}, status=status.HTTP_201_CREATED)
    else:
        # If the user has already liked the blog, remove the like
        like = Like.objects.filter(user=request.user, blog=blog).first()
        like.delete()
        # Decrement the likes count in the blog model
        blog.likes -= 1
        blog.save()  # Save the updated blog with the decremented like count
        return Response({'status': 'Unliked', 'likes': blog.likes}, status=status.HTTP_200_OK)

# Profile update API view
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    profile = get_object_or_404(Profile, user=request.user)
    if request.method == 'PUT':
        serializer = ProfileSerializer(profile, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class TranslateBlogView(APIView):
    def post(self, request, pk):
        blog = get_object_or_404(Blog, pk=pk)

        # Parse the JSON body
        target_lang = request.data.get('language', 'fr')  # Default to French

        try:
            # Translate the blog content
            translated_content = translate_text(blog.blog, target_lang)
            # Log the translated content to see what's returned
            print(f"Translated content: {translated_content}")
            return Response({'translated_content': translated_content}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': 'Translation failed', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        


# Create Blog
class CreateBlogAPIView(generics.CreateAPIView):
    queryset = Blog.objects.all()
    serializer_class = BlogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        

# Edit Blog
class EditBlogAPIView(generics.UpdateAPIView):
    queryset = Blog.objects.all()
    serializer_class = BlogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Blog.objects.filter(user=self.request.user)
    

# Delete Blog
class DeleteBlogAPIView(generics.DestroyAPIView):
    queryset = Blog.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Blog.objects.filter(user=self.request.user)