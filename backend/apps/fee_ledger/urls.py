from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ParentFeeLedgerViewSet

router = DefaultRouter()
router.register(r'ledger', ParentFeeLedgerViewSet, basename='parent-fee-ledger')

urlpatterns = [
    path('', include(router.urls)),
]
