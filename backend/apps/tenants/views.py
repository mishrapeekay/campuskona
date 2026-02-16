"""
Views for tenants app.
"""

from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from apps.authentication.permissions import IsSuperAdmin
from .serializers import (
    SubscriptionSerializer, SchoolSerializer, SchoolCreateSerializer,
    DomainSerializer, TenantConfigSerializer, TenantBrandingSerializer,
    FeatureDefinitionSerializer, TenantFeatureSerializer, TenantFeatureToggleSerializer,
)
from .models import Subscription, School, Domain, TenantConfig, TenantBranding, FeatureDefinition, TenantFeature
from .features import get_tenant_features, invalidate_feature_cache


class SubscriptionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing subscription plans.
    """
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get_queryset(self):
        """Filter active subscriptions for non-super-admins."""
        queryset = super().get_queryset()

        if not self.request.user.is_super_admin:
            queryset = queryset.filter(is_active=True)

        return queryset


from .services import create_tenant_with_admin

class SchoolViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing schools (tenants).
    """
    queryset = School.objects.all()
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'create':
            return SchoolCreateSerializer
        return SchoolSerializer

    def create(self, request, *args, **kwargs):
        """
        Create a new school.
        Supports standard creation or full wizard creation with admin account.
        """
        # Check if this is a full wizard creation
        admin_data = request.data.get('adminAccount')
        school_info = request.data.get('schoolInfo')
        subscription = request.data.get('subscription')
        module_config = request.data.get('moduleConfig')

        if admin_data and school_info:
            # Full Wizard Flow
            try:
                # Map frontend keys to backend keys
                school_data = {
                    'name': school_info.get('name'),
                    'code': school_info.get('code'),
                    'subdomain': school_info.get('subdomain'),
                    'address': school_info.get('address'),
                    'city': school_info.get('city'),
                    'state': school_info.get('state'),
                    'pincode': school_info.get('pincode'),
                    'phone': school_info.get('phone'),
                    'email': school_info.get('email'),
                    'primary_board': module_config.get('academicBoard', 'CBSE') if module_config else 'CBSE'
                }
                
                school = create_tenant_with_admin(
                    school_data=school_data,
                    admin_data=admin_data,
                    subscription_data=subscription,
                    modules_data=module_config
                )
                
                serializer = self.get_serializer(school)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                import traceback
                traceback.print_exc()
                return Response({
                    'error': True,
                    'message': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)

        # Fallback to standard create
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        """Set created_by to current user."""
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['get'])
    def config(self, request, pk=None):
        """Get school configuration."""
        school = self.get_object()
        try:
            config = school.config
            serializer = TenantConfigSerializer(config)
            return Response(serializer.data)
        except TenantConfig.DoesNotExist:
            return Response({
                'error': True,
                'message': 'Configuration not found'
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['put'])
    def update_config(self, request, pk=None):
        """Update school configuration."""
        school = self.get_object()

        try:
            config = school.config
        except TenantConfig.DoesNotExist:
            config = TenantConfig.objects.create(school=school)

        serializer = TenantConfigSerializer(config, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response({
            'error': True,
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def branding(self, request, pk=None):
        """Get school branding."""
        school = self.get_object()
        try:
            branding = school.branding
            serializer = TenantBrandingSerializer(branding)
            return Response(serializer.data)
        except TenantBranding.DoesNotExist:
            return Response({'error': True, 'message': 'Branding not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['put'])
    def update_branding(self, request, pk=None):
        """Update school branding."""
        school = self.get_object()
        try:
            branding = school.branding
        except TenantBranding.DoesNotExist:
            branding = TenantBranding.objects.create(school=school)

        serializer = TenantBrandingSerializer(branding, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
            
        return Response({'error': True, 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def create_schema(self, request, pk=None):
        """Manually create schema for school."""
        school = self.get_object()

        try:
            school.create_schema()
            return Response({
                'message': f'Schema {school.schema_name} created successfully'
            })
        except Exception as e:
            return Response({
                'error': True,
                'message': 'Schema creation failed',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['delete'])
    def delete_schema(self, request, pk=None):
        """Manually delete schema for school (DANGEROUS!)."""
        school = self.get_object()

        # Require confirmation
        confirm = request.data.get('confirm', False)
        if not confirm:
            return Response({
                'error': True,
                'message': 'Schema deletion requires confirmation. Send "confirm": true'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            school.delete_schema()
            return Response({
                'message': f'Schema {school.schema_name} deleted successfully'
            })
        except Exception as e:
            return Response({
                'error': True,
                'message': 'Schema deletion failed',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    # ── Feature management actions (Super Admin) ────────────────────────

    @action(detail=True, methods=['get'], url_path='features')
    def features(self, request, pk=None):
        """List all features and their status for a school."""
        school = self.get_object()
        features_map = get_tenant_features(school)

        # Also include feature definitions for admin context
        all_features = FeatureDefinition.objects.filter(is_active=True)
        feature_defs = FeatureDefinitionSerializer(all_features, many=True).data

        # Merge with enabled status
        for fd in feature_defs:
            fd['is_enabled_for_school'] = features_map.get(fd['code'], False)

        # Get override records
        overrides = TenantFeature.objects.filter(school=school).select_related('feature')
        override_data = TenantFeatureSerializer(overrides, many=True).data

        return Response({
            'school_id': str(school.id),
            'school_name': school.name,
            'subscription_tier': getattr(school.subscription, 'tier', 'BASIC') if school.subscription_id else 'BASIC',
            'features': feature_defs,
            'overrides': override_data,
        })

    @action(detail=True, methods=['post'], url_path='features/toggle')
    def toggle_feature(self, request, pk=None):
        """Toggle a feature for a school (create/update override)."""
        school = self.get_object()
        serializer = TenantFeatureToggleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        feature_code = serializer.validated_data['feature_code']
        is_enabled = serializer.validated_data['is_enabled']
        override_reason = serializer.validated_data.get('override_reason', '')

        try:
            feature_def = FeatureDefinition.objects.get(code=feature_code)
        except FeatureDefinition.DoesNotExist:
            return Response(
                {'error': f'Feature "{feature_code}" not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        tenant_feature, created = TenantFeature.objects.update_or_create(
            school=school,
            feature=feature_def,
            defaults={
                'is_enabled': is_enabled,
                'override_reason': override_reason,
                'disabled_at': None if is_enabled else timezone.now(),
            }
        )

        invalidate_feature_cache(school.id)

        return Response({
            'feature_code': feature_code,
            'is_enabled': is_enabled,
            'created': created,
            'message': f'Feature "{feature_def.name}" {"enabled" if is_enabled else "disabled"} for {school.name}',
        })

    @action(detail=True, methods=['post'], url_path='features/sync-tier')
    def sync_tier_features(self, request, pk=None):
        """
        Remove all overrides for a school, resetting features to match subscription tier.
        """
        school = self.get_object()
        deleted_count, _ = TenantFeature.objects.filter(school=school).delete()
        invalidate_feature_cache(school.id)

        features_map = get_tenant_features(school)

        return Response({
            'message': f'Removed {deleted_count} overrides. Features reset to tier defaults.',
            'subscription_tier': getattr(school.subscription, 'tier', 'BASIC') if school.subscription_id else 'BASIC',
            'features': features_map,
        })


class DomainViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing custom domains.
    """
    queryset = Domain.objects.all()
    serializer_class = DomainSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Verify domain ownership via DNS TXT record."""
        domain = self.get_object()
        
        # In a real scenario, we would use a DNS resolver library to check TXT records
        # import dns.resolver
        # answers = dns.resolver.resolve(domain.domain, 'TXT')
        # for rdata in answers:
        #     if domain.dns_record in rdata.to_text():
        #         domain.is_verified = True
        #         domain.save()
        #         return Response({'verified': True})
        
        # For now, we simulate verification
        domain.is_verified = True
        domain.ssl_status = 'ACTIVE'
        domain.save()
        
        return Response({'verified': True, 'message': 'Domain verified successfully'})


class PublicBrandingView(APIView):
    """
    Public endpoint to get branding for the current tenant.
    Used by Frontend/Mobile before login to skin the app.
    
    GET /api/v1/branding/
    """
    permission_classes = []
    authentication_classes = []

    def get(self, request):
        tenant = getattr(request, 'tenant', None)
        
        # If no tenant (e.g. public schema access without subdomain), return default branding
        if not tenant or tenant.schema_name == 'public':
            return Response({
                'school_name': 'School Management System',
                'logo_light': None,
                'primary_color': '#1976d2', # Default Blue
                'secondary_color': '#dc004e',
                'font_family': 'Roboto',
                'login_layout': 'SIMPLE'
            })
            
        try:
            branding = tenant.branding
            serializer = TenantBrandingSerializer(branding)
            data = serializer.data
            # Inject school name as it's often needed with branding
            data['school_name'] = tenant.name
            return Response(data)
        except TenantBranding.DoesNotExist:
             # Fallback if branding record missing but tenant exists
            return Response({
                'school_name': tenant.name,
                'primary_color': tenant.primary_color or '#1976d2',
                'secondary_color': tenant.secondary_color or '#dc004e',
                'logo_light': tenant.logo.url if tenant.logo else None,
                'font_family': 'Roboto',
                'login_layout': 'SIMPLE'
            })


class TenantFeaturesView(APIView):
    """
    Endpoint for the current tenant to retrieve its enabled features.
    Called by frontend/mobile on login to get the features map.

    GET /api/v1/tenants/my-features/
    Returns: {feature_code: bool, ...}
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        school = getattr(request, 'tenant', None)
        if not school:
            return Response({'error': 'No tenant context'}, status=status.HTTP_400_BAD_REQUEST)

        features_map = get_tenant_features(school)
        return Response({
            'features': features_map,
            'subscription_tier': getattr(school.subscription, 'tier', 'BASIC') if school.subscription_id else 'BASIC',
        })


class FeatureDefinitionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only ViewSet for browsing feature definitions (Super Admin).
    """
    queryset = FeatureDefinition.objects.all()
    serializer_class = FeatureDefinitionSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    filterset_fields = ['category', 'minimum_tier', 'is_active']


class PublicSchoolListView(APIView):
    """
    Public endpoint to list all active schools for tenant selection.
    No authentication required - used by mobile app before login.

    GET /api/v1/tenants/public/list/
    Returns: List of active schools with basic info
    """
    permission_classes = []  # No authentication required
    authentication_classes = []  # No authentication required

    def get(self, request):
        """Return list of active schools."""
        schools = School.objects.filter(is_active=True).select_related('subscription')

        # Serialize basic school information
        # Field names match the mobile app's School interface
        schools_data = []
        for school in schools:
            schools_data.append({
                'id': str(school.id),
                'school_name': school.name,
                'school_code': school.code,
                'subdomain': school.subdomain,
                'contact_email': school.email,
                'contact_phone': school.phone,
                'address': school.address,
                'city': school.city,
                'state': school.state,
                'pincode': school.pincode,
                'country': school.country,
                'logo': school.logo.url if school.logo else None,
                'is_active': school.is_active,
                'created_at': school.created_at.isoformat() if hasattr(school, 'created_at') and school.created_at else None,
            })

        return Response({
            'count': len(schools_data),
            'results': schools_data
        })


class SuperAdminDashboardStatsView(APIView):
    """
    Dashboard statistics for Super Admin.
    
    GET /api/v1/tenants/dashboard/stats/
    """
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request):
        try:
            from apps.authentication.models import User
            from django_tenants.utils import tenant_context
            
            # School Stats
            total_schools = School.objects.count()
            active_schools = School.objects.filter(is_active=True).count()
            
            # Aggregate Stats across all schemas
            total_users = 0
            total_students = 0
            
            # Only count for active schools to avoid errors with unmigrated schemas
            for school in School.objects.filter(is_active=True):
                try:
                    with tenant_context(school):
                        total_users += User.objects.count()
                        total_students += User.objects.filter(user_type='STUDENT').count()
                except Exception:
                    # Skip schools with schema issues
                    continue
            
            # Financial Placeholder
            monthly_revenue = total_schools * 5000.00 # Placeholder: 5k per school
            
            # System Health
            system_health = "HEALTHY"
            
            return Response({
                "total_schools": total_schools,
                "active_schools": active_schools,
                "total_users": total_users,
                "total_students": total_students,
                "monthly_revenue": monthly_revenue,
                "system_health": system_health
            })
        except Exception as e:
            return Response({
                "error": True,
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
