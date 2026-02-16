/**
 * Features API Service
 *
 * Endpoints for fetching tenant feature flags.
 */

import apiClient from './client';

/**
 * Get features for the current tenant.
 * Called after login to populate feature state.
 *
 * Returns: { features: {feature_code: bool, ...}, subscription_tier: string }
 */
export const getMyFeatures = () => {
    return apiClient.get('/tenants/my-features/');
};

/**
 * Get features for a specific school (Super Admin only).
 */
export const getSchoolFeatures = (schoolId) => {
    return apiClient.get(`/tenants/schools/${schoolId}/features/`);
};

/**
 * Toggle a feature for a school (Super Admin only).
 */
export const toggleSchoolFeature = (schoolId, featureCode, isEnabled, overrideReason = '') => {
    return apiClient.post(`/tenants/schools/${schoolId}/features/toggle/`, {
        feature_code: featureCode,
        is_enabled: isEnabled,
        override_reason: overrideReason,
    });
};

/**
 * Sync school features to subscription tier defaults (Super Admin only).
 */
export const syncTierFeatures = (schoolId) => {
    return apiClient.post(`/tenants/schools/${schoolId}/features/sync-tier/`);
};

/**
 * List all feature definitions (Super Admin only).
 */
export const getFeatureDefinitions = (params = {}) => {
    return apiClient.get('/tenants/feature-definitions/', { params });
};
