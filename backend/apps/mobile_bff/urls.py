from django.urls import path
from apps.mobile_bff.views import dashboard, parent, attendance, sync, notifications, attendance_sync_views, today_view
from apps.tenants.views import PublicBrandingView

urlpatterns = [
    # Dashboard Aggregation
    path('dashboard/admin/', dashboard.AdminDashboardView.as_view(), name='dashboard-admin'),
    path('dashboard/teacher/', dashboard.TeacherDashboardView.as_view(), name='dashboard-teacher'),
    path('teacher/home/', dashboard.TeacherHomeView.as_view(), name='teacher-home'), # Action-First Dashboard
    path('dashboard/student/', dashboard.StudentDashboardView.as_view(), name='dashboard-student'),
    path('dashboard/parent/', dashboard.ParentDashboardView.as_view(), name='dashboard-parent'),
    # path('dashboard/accountant/', dashboard.AccountantDashboardView.as_view(), name='dashboard-accountant'), # Not implemented yet
    # path('dashboard/librarian/', dashboard.LibrarianDashboardView.as_view(), name='dashboard-librarian'), # Not implemented yet
    
    # Today View - Single Aggregated API
    path('student/today/', today_view.StudentTodayView.as_view(), name='student-today-view'),
    path('parent/today/', today_view.ParentTodayView.as_view(), name='parent-today-view'),
    path('today/cache-stats/', today_view.TodayViewCacheStatsView.as_view(), name='today-cache-stats'),
    path('today/invalidate-cache/', today_view.InvalidateTodayViewCacheView.as_view(), name='today-invalidate-cache'),
    
    # Parent Unified Endpoint
    path('parent/overview/', parent.ParentOverviewView.as_view(), name='parent-overview'),

    # Lightweight Roster
    path('attendance/class-roster/', attendance.ClassRosterView.as_view(), name='class-roster'),

    # Notifications
    path('notifications/feed/', notifications.NotificationFeedView.as_view(), name='notification-feed'),

    # Sync
    path('sync/pull/', sync.SyncPullView.as_view(), name='sync-pull'),
    path('sync/push/', sync.SyncPushView.as_view(), name='sync-push'),
    path('attendance/sync/', attendance_sync_views.OfflineAttendanceSyncView.as_view(), name='attendance-sync'),
    
    # Branding
    path('branding/', PublicBrandingView.as_view(), name='public-branding'),
]
