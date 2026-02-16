from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from apps.workflows.models import (
    WorkflowConfiguration, 
    WorkflowStep, 
    WorkflowRequest, 
    WorkflowActionLog
)
from apps.workflows.serializers import (
    WorkflowConfigurationSerializer, 
    WorkflowRequestSerializer,
    WorkflowActionLogSerializer
)
from apps.authentication.models import User

class WorkflowConfigurationViewSet(viewsets.ModelViewSet):
    queryset = WorkflowConfiguration.objects.filter(is_deleted=False)
    serializer_class = WorkflowConfigurationSerializer
    permission_classes = [permissions.IsAuthenticated] # Add restricted permission later

class WorkflowRequestViewSet(viewsets.ModelViewSet):
    queryset = WorkflowRequest.objects.filter(is_deleted=False)
    serializer_class = WorkflowRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'])
    def initiate(self, request, pk=None):
        """Start the heavy lifting: Initiate a workflow request."""
        workflow_request = self.get_object()
        
        if workflow_request.status != 'PENDING':
            return Response(
                {"detail": "Workflow already started or completed."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if workflow_request.initiate():
            # Log the initiation
            WorkflowActionLog.objects.create(
                workflow_request=workflow_request,
                actor=request.user,
                action='INITIATE',
                remarks='Workflow initiated manually'
            )
            return Response({"status": "Workflow initiated"})
        else:
            return Response(
                {"detail": "Could not initiate workflow. Check configuration."},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        workflow_request = self.get_object()
        user = request.user
        current_step = workflow_request.current_step
        
        if not current_step:
            return Response(
                {"detail": "No active step to approve."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Check permissions
        can_approve = False
        if current_step.approver_user == user:
            can_approve = True
        elif current_step.approver_role:
            # Check if user has this role
            if user.user_roles.filter(role=current_step.approver_role, is_active=True).exists():
                can_approve = True
        
        # Override for superadmin
        if user.is_super_admin:
            can_approve = True
            
        if not can_approve:
            return Response(
                {"detail": "You do not have permission to approve this step."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        remarks = request.data.get('remarks', '')
        
        with transaction.atomic():
            # Log action
            WorkflowActionLog.objects.create(
                workflow_request=workflow_request,
                step=current_step,
                actor=user,
                action='APPROVE',
                remarks=remarks
            )
            
            # Move to next step
            next_step = workflow_request.get_next_step()
            
            if next_step:
                workflow_request.current_step = next_step
                workflow_request.save()
                return Response({"status": "Approved, moved to next step", "next_step": next_step.name})
            else:
                workflow_request.current_step = None
                workflow_request.status = 'APPROVED'
                workflow_request.save()
                return Response({"status": "Workflow completed and approved"})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        workflow_request = self.get_object()
        user = request.user
        current_step = workflow_request.current_step
        
        if not current_step:
            return Response({"detail": "No active step to reject."}, status=status.HTTP_400_BAD_REQUEST)
            
        if not current_step.can_reject:
             return Response({"detail": "This step cannot be rejected."}, status=status.HTTP_400_BAD_REQUEST)

        # Check permissions (same as approve)
        can_reject = False
        if current_step.approver_user == user:
            can_reject = True
        elif current_step.approver_role:
             if user.user_roles.filter(role=current_step.approver_role, is_active=True).exists():
                can_reject = True
        if user.is_super_admin:
            can_reject = True
            
        if not can_reject:
            return Response({"detail": "You do not have permission to reject this step."}, status=status.HTTP_403_FORBIDDEN)

        remarks = request.data.get('remarks', '')
        if not remarks:
             return Response({"detail": "Remarks are required for rejection."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            WorkflowActionLog.objects.create(
                workflow_request=workflow_request,
                step=current_step,
                actor=user,
                action='REJECT',
                remarks=remarks
            )
            
            # Handle rejection logic
            if current_step.on_rejection == 'TERMINATE':
                workflow_request.status = 'REJECTED'
                workflow_request.current_step = None
                workflow_request.save()
                return Response({"status": "Workflow rejected and terminated"})
            elif current_step.on_rejection == 'BACK_TO_START':
                # Restart
                first_step = workflow_request.workflow_config.steps.order_by('step_order').first()
                workflow_request.current_step = first_step
                workflow_request.status = 'IN_PROGRESS' # Reset just in case
                workflow_request.save()
                return Response({"status": "Workflow returned to start"})
            elif current_step.on_rejection == 'BACK_TO_PREVIOUS':
                # Find previous step
                prev_step = workflow_request.workflow_config.steps.filter(
                    step_order__lt=current_step.step_order
                ).order_by('-step_order').first()
                
                if prev_step:
                    workflow_request.current_step = prev_step
                    workflow_request.save()
                    return Response({"status": "Workflow returned to previous step"})
                else:
                    # No previous step, so terminate
                    workflow_request.status = 'REJECTED'
                    workflow_request.current_step = None
                    workflow_request.save()
                    return Response({"status": "Workflow rejected (no previous step)"})
            
        return Response({"status": "Rejection processed"})
