from django.core.management.base import BaseCommand
from apps.authentication.models import Role, Permission
from django.db import transaction

class Command(BaseCommand):
    help = 'Seed teacher-specific roles and permissions'

    def handle(self, *args, **options):
        self.stdout.write('Seeding teacher roles and permissions...')
        
        with transaction.atomic():
            # 1. Define Granular Permissions
            permissions_data = [
                # Academics / Base Teacher
                ('academics', 'view_assigned', 'View Assigned Classes & Students'),
                ('attendance', 'mark', 'Mark Student Attendance'),
                ('homework', 'manage', 'Post and Manage Homework'),
                ('lesson_plans', 'manage', 'Create and Manage Lesson Plans'),
                ('observations', 'create', 'Create Student Observation Notes'),
                
                # Class Management / Class Teacher
                ('students', 'create_draft', 'Create Draft Student Profiles'),
                ('students', 'upload_docs', 'Upload Student Documents'),
                ('students', 'verify_docs', 'Verify Student Documents'),
                ('discipline', 'track', 'Track Student Discipline'),
                ('wellbeing', 'observe', 'Observe Student Well-being'),
                
                # Privacy / DPDP Coordinator
                ('privacy', 'view_status', 'View DPDP Consent Status'),
                ('privacy', 'trigger_reconsent', 'Trigger DPDP Re-consent'),
                ('privacy', 'audit_logs', 'View Data Access Audit Logs'),
                ('privacy', 'mask_sensitive', 'Mask/Unmask Sensitive Data'),
                
                # Planning / Academic Planner
                ('timetable', 'generate', 'Generate Class Timetables'),
                ('timetable', 'publish', 'Publish/Update Timetables'),
                ('substitute', 'assign', 'Assign Substitute Teachers'),
                
                # Culture / House Master
                ('houses', 'view_members', 'View House Member Profiles'),
                ('houses', 'assign_points', 'Assign House Points'),
                ('houses', 'manage_duties', 'Manage House Duties'),
                
                # Activities / Activity Teacher
                ('activities', 'manage_rosters', 'Manage Activity Rosters'),
                ('activities', 'assess_skills', 'Assess Student Skills'),
                ('activities', 'upload_media', 'Upload Activity Media'),
                
                # Editorial / Media Coordinator
                ('magazine', 'approve_submissions', 'Approve Magazine Submissions'),
                ('magazine', 'publish_edition', 'Publish Magazine Edition'),
                ('magazine', 'manage_contributors', 'Manage Student Contributors'),
            ]

            perms_map = {}
            for module, action, name in permissions_data:
                code = f"{module}.{action}"
                perm, created = Permission.objects.get_or_create(
                    code=code,
                    defaults={
                        'module': module,
                        'action': action,
                        'name': name,
                        'category': 'ACADEMIC' if module in ['academics', 'attendance', 'homework', 'lesson_plans'] else 'OPERATIONAL'
                    }
                )
                perms_map[code] = perm
                if created:
                    self.stdout.write(f"  - Created permission: {code}")

            # 2. Define Roles
            roles_data = [
                {
                    'name': 'Base Teacher',
                    'code': 'TEACHER_BASE',
                    'description': 'Deliver instruction and maintain academic records',
                    'permissions': [
                        'academics.view_assigned', 'attendance.mark', 
                        'homework.manage', 'lesson_plans.manage', 'observations.create'
                    ]
                },
                {
                    'name': 'Class Teacher',
                    'code': 'CLASS_TEACHER',
                    'description': 'Pastoral care and student onboarding',
                    'parent': 'TEACHER_BASE',
                    'permissions': [
                        'students.create_draft', 'students.upload_docs', 
                        'students.verify_docs', 'discipline.track', 'wellbeing.observe'
                    ]
                },
                {
                    'name': 'DPDP Coordinator',
                    'code': 'DPDP_COORDINATOR',
                    'description': 'Data steward for class/house compliance',
                    'parent': 'CLASS_TEACHER',
                    'permissions': [
                        'privacy.view_status', 'privacy.trigger_reconsent', 
                        'privacy.audit_logs', 'privacy.mask_sensitive'
                    ]
                },
                {
                    'name': 'Academic Planner',
                    'code': 'ACADEMIC_PLANNER',
                    'description': 'Manage timetables and exam schedules',
                    'parent': 'TEACHER_BASE',
                    'permissions': [
                        'timetable.generate', 'timetable.publish', 'substitute.assign'
                    ]
                },
                {
                    'name': 'House Master',
                    'code': 'HOUSE_MASTER',
                    'description': 'Manage house culture and point allocation',
                    'parent': 'TEACHER_BASE',
                    'permissions': [
                        'houses.view_members', 'houses.assign_points', 'houses.manage_duties'
                    ]
                },
                {
                    'name': 'Activity Teacher',
                    'code': 'ACTIVITY_TEACHER',
                    'description': 'Conduct non-academic activities and assessments',
                    'parent': 'TEACHER_BASE',
                    'permissions': [
                        'activities.manage_rosters', 'activities.assess_skills', 'activities.upload_media'
                    ]
                },
                {
                    'name': 'Editorial Lead',
                    'code': 'EDITORIAL_LEAD',
                    'description': 'Curate and publish school media content',
                    'parent': 'TEACHER_BASE',
                    'permissions': [
                        'magazine.approve_submissions', 'magazine.publish_edition', 'magazine.manage_contributors'
                    ]
                }
            ]

            role_objs = {}
            for rd in roles_data:
                parent = role_objs.get(rd.get('parent'))
                role, created = Role.objects.get_or_create(
                    code=rd['code'],
                    defaults={
                        'name': rd['name'],
                        'description': rd['description'],
                        'parent_role': parent,
                        'is_system_role': True
                    }
                )
                role_objs[rd['code']] = role
                
                # Assign permissions
                role_perms = [perms_map[p] for p in rd['permissions']]
                role.permissions.set(role_perms)
                
                if created:
                    self.stdout.write(f"✅ Created role: {rd['name']}")
                else:
                    self.stdout.write(f"ℹ️ Role exists: {rd['name']}")

        self.stdout.write(self.style.SUCCESS('\nSuccessfully seeded all teacher roles and permissions.'))
