from django.urls import path

from .views import (
    HealthView,
    ReadinessView,
    PostListCreateView,
    PostCommentsView,
)


urlpatterns = [
    path("health/", HealthView.as_view(), name="health"),
    path("readiness/", ReadinessView.as_view(), name="readiness"),

    path(
        "posts/",
        PostListCreateView.as_view(),
        name="posts"
    ),

    path(
        "posts/<int:post_id>/comments/",
        PostCommentsView.as_view(),
        name="post-comments"
    ),
]