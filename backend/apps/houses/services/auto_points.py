from apps.houses.models import House, HousePointLog, HouseMembership
from django.contrib.auth import get_user_model
from django.db import transaction
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

class AutoPointService:
    """
    Automates House Point awarding based on academic or behavioral triggers.
    """
    
    @staticmethod
    @transaction.atomic
    def award_for_academic_excellence(student, subject_name, mark_percentage, grade_name):
        """
        Awards points when a student achieves high grades.
        """
        # Define logic: A+ gets 20 points, A gets 10 points
        points = 0
        if grade_name in ['A+', 'O', 'Distinction', 'Outstanding']:
            points = 20
        elif grade_name in ['A', 'A1', 'Exemplary']:
            points = 10
            
        if points > 0:
            membership = HouseMembership.objects.filter(student=student).first()
            if not membership:
                return None
                
            # Use a system user or admin for auto-awards
            system_user = User.objects.filter(user_type='SUPER_ADMIN').first()
            
            return HousePointLog.objects.create(
                house=membership.house,
                student=student,
                points=points,
                reason=f"Academic Excellence: {grade_name} in {subject_name}",
                category='ACADEMIC',
                awarded_by=system_user
            )
        return None

    @staticmethod
    def award_for_behavior(student, remark_type, note_text):
        """
        Awards points for positive teacher remarks.
        """
        points = 0
        # Logic: If remark contains 'Exemplary' or 'Commendable'
        if any(word in note_text.lower() for word in ['exemplary', 'commendable', 'outstanding', 'leader']):
            points = 15
        elif 'good behavior' in note_text.lower():
            points = 5
            
        if points > 0:
            membership = HouseMembership.objects.filter(student=student).first()
            if not membership:
                return None
                
            system_user = User.objects.filter(user_type='SUPER_ADMIN').first()
            
            return HousePointLog.objects.create(
                house=membership.house,
                student=student,
                points=points,
                reason=f"Positive Conduct: {remark_type}",
                category='DISCIPLINE',
                awarded_by=system_user
            )
        return None
