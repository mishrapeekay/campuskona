from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AdmissionEnquiryViewSet,
    AdmissionApplicationViewSet,
    AdmissionDocumentViewSet,
    AdmissionSettingViewSet,
)

router = DefaultRouter()
router.register(r'enquiries', AdmissionEnquiryViewSet, basename='enquiry')
router.register(r'applications', AdmissionApplicationViewSet, basename='application')
router.register(r'documents', AdmissionDocumentViewSet, basename='document')
router.register(r'settings', AdmissionSettingViewSet, basename='setting')

urlpatterns = [
    path('', include(router.urls)),
]
