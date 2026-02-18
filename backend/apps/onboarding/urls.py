from django.urls import path
from . import views

urlpatterns = [
    path('readiness/', views.OnboardingReadinessView.as_view(), name='onboarding-readiness'),
    path('master-template/', views.MasterTemplateView.as_view(), name='onboarding-master-template'),
    path('master-upload/', views.MasterUploadView.as_view(), name='onboarding-master-upload'),
    path('classes-sections/template/', views.ClassSectionTemplateView.as_view(), name='class-section-template'),
    path('classes-sections/upload/', views.ClassSectionBulkUploadView.as_view(), name='class-section-upload'),
    path('fee-structure/template/', views.FeeStructureTemplateView.as_view(), name='fee-structure-template'),
    path('fee-structure/upload/', views.FeeStructureBulkUploadView.as_view(), name='fee-structure-upload'),
]
