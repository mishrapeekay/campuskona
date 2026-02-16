# Workflow Engine

A generic, configurable workflow engine for managing approvals (Leaves, Fee Concessions, etc.) with role-based access control.

## Key Features
- **Configurable Steps**: Define any number of approval steps.
- **Role-Based Approvals**: Assign steps to specific Roles (e.g., Principal) or specific Users.
- **Generic Integration**: Can be attached to any Django model (LeaveRequest, FeeConcession, etc.).
- **Audit Logging**: Full history of actions (Approve, Reject, Comments).

## Models

### 1. WorkflowConfiguration
Defines the template for a workflow.
- `name`: e.g., "Student Leave Approval"
- `workflow_type`: e.g., "LEAVE"
- `content_types`: List of models this workflow applies to.

### 2. WorkflowStep
Steps within a configuration.
- `step_order`: 1, 2, 3...
- `approver_role` / `approver_user`: Who can approve.
- `on_rejection`: Action to take if rejected (Terminate, Restart, etc.).

### 3. WorkflowRequest
An instance of a workflow for a specific object.
- `content_object`: The object being approved.
- `current_step`: The current active step.
- `status`: PENDING, APPROVED, REJECTED.

## API Usage

### 1. Create a Configuration
`POST /api/v1/workflows/configs/`
```json
{
  "name": "Staff Leave Workflow",
  "workflow_type": "LEAVE",
  "steps": [
    {
      "name": "HOD Approval",
      "step_order": 1,
      "approver_role": "uuid-of-hod-role",
      "on_rejection": "TERMINATE"
    },
    {
      "name": "Principal Approval",
      "step_order": 2,
      "approver_role": "uuid-of-principal-role",
      "is_final_step": true
    }
  ]
}
```

### 2. Initiate a Request
`POST /api/v1/workflows/requests/{id}/initiate/`

### 3. Approve a Step
`POST /api/v1/workflows/requests/{id}/approve/`
```json
{
  "remarks": "Looks good."
}
```

### 4. Reject a Step
`POST /api/v1/workflows/requests/{id}/reject/`
```json
{
  "remarks": "Please provide medical certificate."
}
```

## Integration Example (Python)

```python
from apps.workflows.models import WorkflowRequest, WorkflowConfiguration

# 1. Get the config
config = WorkflowConfiguration.objects.get(name="Staff Leave Workflow")

# 2. Create a request linked to a Leave object
request = WorkflowRequest.objects.create(
    workflow_config=config,
    content_object=my_leave_application,
    requester=user
)

# 3. Start it
request.initiate()
```
