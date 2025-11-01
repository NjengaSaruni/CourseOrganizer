from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'conversations', views.ChatConversationViewSet, basename='conversation')
router.register(r'concepts', views.ConceptViewSet, basename='concept')
router.register(r'mastery', views.ConceptMasteryViewSet, basename='mastery')

urlpatterns = [
    path('', include(router.urls)),
]

