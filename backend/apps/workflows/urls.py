from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.workflows.views import WorkflowConfigurationViewSet, WorkflowRequestViewSet

router = DefaultRouter()
router.register(r'configs', WorkflowConfigurationViewSet)
router.register(r'requests', WorkflowRequestViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
