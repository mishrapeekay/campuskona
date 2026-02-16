from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.academics import views

router = DefaultRouter()
router.register(r'academic-years', views.AcademicYearViewSet, basename='academic-year')
router.register(r'years', views.AcademicYearViewSet, basename='academic-year-alias')
router.register(r'boards', views.BoardViewSet, basename='board')
router.register(r'subjects', views.SubjectViewSet, basename='subject')
router.register(r'classes', views.ClassViewSet, basename='class')
router.register(r'sections', views.SectionViewSet, basename='section')
router.register(r'class-subjects', views.ClassSubjectViewSet, basename='class-subject')
router.register(r'enrollments', views.StudentEnrollmentViewSet, basename='enrollment')
router.register(r'student-subjects', views.StudentSubjectViewSet, basename='student-subject')
router.register(r'syllabus-units', views.SyllabusUnitViewSet, basename='syllabus-unit')
router.register(r'lesson-plans', views.LessonPlanViewSet, basename='lesson-plan')

urlpatterns = [
    path('', include(router.urls)),
    path('lesson-plans/suggest/', views.LessonPlanSuggestionView.as_view(), name='lesson-plan-suggest'),
]
