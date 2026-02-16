from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HouseViewSet, HouseMembershipViewSet, HousePointLogViewSet

router = DefaultRouter()
router.register(r'houses', HouseViewSet)
router.register(r'memberships', HouseMembershipViewSet)
router.register(r'points', HousePointLogViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
