import logging
from django.db import transaction
from django_tenants.utils import tenant_context, schema_context
from apps.authentication.models import User
from apps.tenants.models import School, TenantConfig, Subscription
from apps.staff.models import StaffMember
from django.utils import timezone

logger = logging.getLogger(__name__)

def create_tenant_with_admin(school_data, admin_data, subscription_data=None, modules_data=None):
    """
    Creates a new school tenant, admin user, and initial configuration.
    
    Args:
        school_data (dict): Data for School model
        admin_data (dict): Data for Admin User (first_name, last_name, email, phone, password)
        subscription_data (dict, optional): Subscription details
        modules_data (dict, optional): Module configuration
        
    Returns:
        School: The created school instance
    """
    logger.info(f"Starting tenant creation for {school_data.get('name')}")
    
    # 1. Provide Default Subscription if not referenced
    if 'subscription' not in school_data:
        # Try to find a default subscription or create one?
        # Ideally frontend provides subscription ID.
        # If not, let's look for 'Basic' or similar
        try:
            default_sub = Subscription.objects.get(name='Basic')
        except Subscription.DoesNotExist:
            # Fallback for dev environment or first run
            default_sub = Subscription.objects.create(
                name='Basic',
                tier='BASIC',
                price_monthly=0,
                price_yearly=0
            )
        school_data['subscription'] = default_sub
        
        # Set start/end dates if not provided
        if 'subscription_start_date' not in school_data:
            school_data['subscription_start_date'] = timezone.now().date()
        if 'subscription_end_date' not in school_data:
            school_data['subscription_end_date'] = timezone.now().date() + timezone.timedelta(days=365)

    # 2. Create User (Global/Public Schema)
    # We do this first because User is shared
    email = admin_data.get('email')
    password = admin_data.get('password')
    
    try:
        user = User.objects.get(email=email)
        logger.info(f"User {email} already exists. Using existing user.")
        # Update details if needed?
    except User.DoesNotExist:
        logger.info(f"Creating new user {email}")
        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=admin_data.get('first_name', ''),
            last_name=admin_data.get('last_name', ''),
            phone=admin_data.get('phone', ''),
            user_type='SCHOOL_ADMIN', # Or PRINCIPAL
            is_active=True
        )

    # 3. Create School (Public Schema) - This triggers Schema Creation
    try:
        # Atomic transaction to ensure School + Config are consistent
        with transaction.atomic():
            school = School.objects.create(**school_data)
            school.created_by = user
            school.save()
            
            logger.info(f"School {school.name} created. Schema: {school.schema_name}")

            # 4. Update Tenant Config (Public Schema)
            if modules_data:
                config, created = TenantConfig.objects.get_or_create(school=school)
                
                # Map frontend module config to backend fields
                config.enable_library = modules_data.get('library', False)
                config.enable_transport = modules_data.get('transport', False)
                config.enable_online_payments = modules_data.get('onlinePayments', False)
                config.enable_biometric_attendance = modules_data.get('biometricAttendance', False)
                
                # Academic Board is stored in School model mostly, but config has academic settings
                # config.academic_board = modules_data.get('academicBoard') # Not in TenantConfig model
                
                config.save()

    except Exception as e:
        logger.error(f"Failed to create school: {e}")
        # If user was created just now, we might want to rollback?
        # But User is atomic separately unless we wrap entire function in atomic.
        # But User is in Public, School is in Public. So single atomic works.
        raise e

    # 5. Create Staff Profile (Tenant Schema)
    # We must switch context to the new tenant's schema
    try:
        with tenant_context(school):
            logger.info(f"Switched to tenant context {school.schema_name} for staff creation")
            
            # Create StaffMember linked to User
            if not StaffMember.objects.filter(user=user).exists():
                StaffMember.objects.create(
                    user=user,
                    first_name=user.first_name,
                    last_name=user.last_name,
                    email=user.email,
                    phone_number=user.phone or '',
                    designation='PRINCIPAL',
                    department='ADMINISTRATION',
                    joining_date=timezone.now().date(),
                    employment_type='PERMANENT',
                    employment_status='ACTIVE',
                    # Address fallback
                    current_address_line1=school.address,
                    current_city=school.city,
                    current_state=school.state,
                    current_pincode=school.pincode,
                    permanent_address_line1=school.address,
                    permanent_city=school.city,
                    permanent_state=school.state,
                    permanent_pincode=school.pincode,
                    # Mandatory fields needing defaults
                    date_of_birth=timezone.now().date() - timezone.timedelta(days=365*30), # Default 30yo
                    gender='O', # Default
                )
                logger.info("Principal staff profile created")
            else:
                logger.warning("Staff profile already exists for this user in this tenant??")

    except Exception as e:
        logger.error(f"Failed to create staff profile in tenant: {e}")
        # We don't rollback School creation here as it's outside the block?
        # Ideally, we should. But separate schema transactions are tricky.
        # School creation (Public) and Staff creation (Tenant) are separate DB transactions usually.
        # For now, we log error.
        pass


    return school


def process_subscription_payment(school_id, amount, transaction_id, period_months=1):
    """
    Process and record a subscription payment for a school.
    """
    from apps.tenants.models import School, SubscriptionBilling
    from datetime import timedelta
    
    with transaction.atomic():
        school = School.objects.select_for_update().get(id=school_id)
        
        # Calculate new end date
        # If current subscription is expired, start from today
        # Otherwise, extend from current end date
        today = timezone.now().date()
        start_date = max(school.subscription_end_date or today, today)
        
        # Approximate months as 30 days for simplicity, or use dateutil
        end_date = start_date + timedelta(days=30 * period_months)
        
        # Record billing
        billing = SubscriptionBilling.objects.create(
            school=school,
            subscription=school.subscription,
            amount=amount,
            period_start=start_date,
            period_end=end_date,
            transaction_id=transaction_id,
            status='SUCCESS'
        )
        
        # Update school subscription dates
        school.subscription_start_date = start_date
        school.subscription_end_date = end_date
        school.is_active = True
        school.save()
        
        logger.info(f"Subscription renewed for {school.name} until {end_date}")
        return billing

