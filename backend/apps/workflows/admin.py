from django.contrib import admin
from .models import WorkflowConfiguration, WorkflowStep, WorkflowRequest, WorkflowActionLog


class WorkflowStepInline(admin.TabularInline):
    model = WorkflowStep
    extra = 1
    fields = ('step_order', 'name', 'approver_role', 'approver_user', 'is_final_step', 'can_reject', 'on_rejection')
    ordering = ('step_order',)


@admin.register(WorkflowConfiguration)
class WorkflowConfigurationAdmin(admin.ModelAdmin):
    list_display = ('name', 'workflow_type', 'is_active', 'step_count')
    list_filter = ('workflow_type', 'is_active')
    search_fields = ('name', 'description')
    inlines = [WorkflowStepInline]

    def step_count(self, obj):
        return obj.steps.count()
    step_count.short_description = 'Steps'


@admin.register(WorkflowStep)
class WorkflowStepAdmin(admin.ModelAdmin):
    list_display = ('step_order', 'name', 'workflow_config', 'approver_role', 'approver_user', 'is_final_step')
    list_filter = ('workflow_config', 'is_final_step', 'on_rejection')
    search_fields = ('name', 'workflow_config__name')
    ordering = ('workflow_config', 'step_order')


class WorkflowActionLogInline(admin.TabularInline):
    model = WorkflowActionLog
    extra = 0
    readonly_fields = ('actor', 'step', 'action', 'remarks', 'created_at')
    can_delete = False


@admin.register(WorkflowRequest)
class WorkflowRequestAdmin(admin.ModelAdmin):
    list_display = ('workflow_config', 'requester', 'status', 'current_step', 'created_at')
    list_filter = ('status', 'workflow_config')
    search_fields = ('requester__email', 'workflow_config__name')
    readonly_fields = ('content_type', 'object_id', 'created_at', 'updated_at')
    inlines = [WorkflowActionLogInline]


@admin.register(WorkflowActionLog)
class WorkflowActionLogAdmin(admin.ModelAdmin):
    list_display = ('workflow_request', 'actor', 'action', 'step', 'created_at')
    list_filter = ('action',)
    search_fields = ('actor__email', 'workflow_request__workflow_config__name')
    readonly_fields = ('created_at',)

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
