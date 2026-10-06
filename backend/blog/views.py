from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import Author, Post, Comment
from .serializers import PostSerializer, CommentSerializer


class HealthView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"status": "ok"})


class ReadinessView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"status": "ready"})


class PostListCreateView(APIView):

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated()]
        return [AllowAny()]

    def get(self, request):
        posts = Post.objects.all().order_by("-created_at")
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)

    def post(self, request):
        author, created = Author.objects.get_or_create(
            user=request.user
        )

        serializer = PostSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(author=author)

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class PostCommentsView(APIView):

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated()]
        return [AllowAny()]

    def get(self, request, post_id):

        try:
            post = Post.objects.get(id=post_id)

        except Post.DoesNotExist:
            return Response(
                {"detail": "Post not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        comments = Comment.objects.filter(
            post=post
        ).order_by("-created_at")

        serializer = CommentSerializer(
            comments,
            many=True
        )

        return Response(serializer.data)

    def post(self, request, post_id):

        try:
            post = Post.objects.get(id=post_id)

        except Post.DoesNotExist:
            return Response(
                {"detail": "Post not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        author, created = Author.objects.get_or_create(
            user=request.user
        )

        serializer = CommentSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save(
                post=post,
                author=author
            )

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )