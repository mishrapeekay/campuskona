import os, django, sys
sys.path.append('G:/School Mgmt System/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()
from apps.staff.models import StaffMember
print('Status:', sorted(list(set(StaffMember.objects.values_list('employment_status', flat=True)))))
