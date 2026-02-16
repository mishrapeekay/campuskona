"""
Feature flag checking utilities for multi-tenant feature gating.

Provides cached feature checking functions that determine whether a school
has access to a specific feature based on:
1. Global kill switch (FeatureDefinition.is_active)
2. Per-tenant override (TenantFeature row)
3. Subscription tier hierarchy (BASIC < STANDARD < PREMIUM < ENTERPRISE)
"""

import logging
from django.core.cache import cache

logger = logging.getLogger(__name__)

# Tier hierarchy — higher index = higher tier
TIER_HIERARCHY = {
    'BASIC': 0,
    'STANDARD': 1,
    'PREMIUM': 2,
    'ENTERPRISE': 3,
}

CACHE_TTL = 300  # 5 minutes
CACHE_KEY_PREFIX = 'tenant_features'


def _get_cache_key(school_id):
    return f"{CACHE_KEY_PREFIX}:{school_id}"


def _tier_gte(school_tier, required_tier):
    """Check if school_tier >= required_tier in the tier hierarchy."""
    return TIER_HIERARCHY.get(school_tier, 0) >= TIER_HIERARCHY.get(required_tier, 0)


def get_tenant_features(school):
    """
    Returns a dict of {feature_code: bool} for all active features.

    Used by the API endpoint to send to frontend/mobile and by middleware
    to attach to request.tenant_features.

    Result is cached for 5 minutes per school.
    """
    if not school:
        return {}

    cache_key = _get_cache_key(school.id)
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    from apps.tenants.models import FeatureDefinition, TenantFeature

    # Get all globally active features
    all_features = FeatureDefinition.objects.filter(is_active=True).values_list(
        'id', 'code', 'minimum_tier'
    )

    # Get all overrides for this school
    overrides = dict(
        TenantFeature.objects.filter(
            school=school
        ).values_list('feature_id', 'is_enabled')
    )

    # Determine the school's subscription tier
    school_tier = getattr(school.subscription, 'tier', 'BASIC') if school.subscription_id else 'BASIC'

    result = {}
    for feature_id, code, minimum_tier in all_features:
        if feature_id in overrides:
            # Explicit override exists — use it
            result[code] = overrides[feature_id]
        else:
            # No override — check tier hierarchy
            result[code] = _tier_gte(school_tier, minimum_tier)

    cache.set(cache_key, result, CACHE_TTL)
    return result


def has_feature(school, feature_code):
    """
    Check if a school has access to a specific feature.

    Args:
        school: School model instance
        feature_code: str feature code, e.g. "ai_timetable_generator"

    Returns:
        bool: True if the school has access to the feature
    """
    features = get_tenant_features(school)
    return features.get(feature_code, False)


def invalidate_feature_cache(school_id):
    """
    Clear cached features for a school.
    Call this when features are toggled via admin or API.
    """
    cache_key = _get_cache_key(school_id)
    cache.delete(cache_key)
    logger.info(f"Invalidated feature cache for school {school_id}")


def invalidate_all_feature_caches():
    """
    Clear all tenant feature caches.
    Call this when a FeatureDefinition is modified (global change).
    """
    # Since we can't enumerate cache keys reliably with all backends,
    # we use a version key approach
    from apps.tenants.models import School
    school_ids = School.objects.filter(is_active=True).values_list('id', flat=True)
    for school_id in school_ids:
        invalidate_feature_cache(school_id)
    logger.info(f"Invalidated feature cache for {len(school_ids)} schools")
