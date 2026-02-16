from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import FeeLedgerEntry
from .serializers import FeeLedgerEntrySerializer
from .services import FeeLedgerService

class ParentFeeLedgerViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Viewset for parents to view their student's fee ledger.
    """
    serializer_class = FeeLedgerEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Assuming parents are linked to students in a 'Student' model
        # Filter ledger entries for students belongs to this parent
        if hasattr(user, 'parent_profile'):
            return FeeLedgerEntry.objects.filter(
                student__parent_profile=user.parent_profile
            ).order_by('created_at')
        return FeeLedgerEntry.objects.none()

    @action(detail=True, methods=['get'])
    def verify_integrity(self, request, pk=None):
        """
        Verify the integrity of a student's ledger.
        """
        # In this context, 'pk' might be the student ID passed to the action
        from apps.students.models import Student
        try:
            student = Student.objects.get(pk=pk)
            # Permission check: is this parent allowed to see this student?
            if student.parent_profile != request.user.parent_profile:
                return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
            
            is_valid, msg = FeeLedgerService.verify_chain_integrity(student)
            return Response({
                "student_id": student.id,
                "is_valid": is_valid,
                "message": msg
            })
        except Student.DoesNotExist:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)
