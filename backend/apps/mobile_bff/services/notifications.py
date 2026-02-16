from asgiref.sync import sync_to_async
from django.db.models import Q
from apps.communication.models import Notification, Notice
from apps.students.models import StudentParent
import asyncio

class NotificationAggregator:
    @staticmethod
    async def get_feed(user):
        
        @sync_to_async
        def get_user_notifications():
            return list(Notification.objects.filter(
                recipient=user
            ).order_by('-created_at')[:20].values(
                'id', 'title', 'message', 'is_read', 'created_at', 'link'
            ))

        @sync_to_async
        def get_system_notices():
            audience_filter = Q(target_audience='ALL')
            
            if user.user_type == 'STUDENT':
                audience_filter |= Q(target_audience='STUDENTS')
            elif user.user_type == 'TEACHER':
                audience_filter |= Q(target_audience='TEACHERS')
            elif user.user_type == 'PARENT':
                audience_filter |= Q(target_audience='PARENTS')
                
                # Parents: Include notices for all their kids' classes
                # This could be complex queries, skipping for MVP/Performance
                # or simplified to just role-based
            
            return list(Notice.objects.filter(
                audience_filter,
                is_published=True
            ).order_by('-created_at')[:10].values(
                'id', 'title', 'content', 'created_at', 'priority'
            ))

        notifications, notices = await asyncio.gather(
            get_user_notifications(),
            get_system_notices()
        )
        
        # formatting
        feed = []
        for n in notifications:
            feed.append({
                "type": "PERSONAL",
                "id": str(n['id']),
                "title": n['title'],
                "message": n['message'],
                "is_read": n['is_read'],
                "timestamp": n['created_at'],
                "link": n.get('link')
            })
            
        for n in notices:
             feed.append({
                "type": "SYSTEM",
                "id": str(n['id']),
                "title": n['title'],
                "message": n['content'], # Mapping content to message
                "priority": n['priority'],
                "timestamp": n['created_at'],
                "is_read": False # Notices don't track read status per user efficiently in this model
            })
            
        # Sort by timestamp desc
        feed.sort(key=lambda x: x['timestamp'], reverse=True)
        
        unread_count = sum(1 for n in notifications if not n['is_read'])
        
        return {
            "feed": feed,
            "unread_count": unread_count
        }
