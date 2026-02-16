/**
 * useFeature Hook
 *
 * Check if a feature is enabled for the current tenant.
 *
 * Usage:
 *   const hasAITimetable = useFeature('ai_timetable_generator');
 *   const { enabled, tier } = useFeatureWithTier('ai_timetable_generator');
 */

import { useSelector } from 'react-redux';

/**
 * Returns true if the feature is enabled for the current tenant.
 * @param {string} featureCode - Feature code, e.g. 'ai_timetable_generator'
 * @returns {boolean}
 */
export const useFeature = (featureCode) => {
    const tenantFeatures = useSelector((state) => state.auth.tenantFeatures);
    return tenantFeatures?.[featureCode] ?? false;
};

/**
 * Returns the current subscription tier.
 * @returns {string} - 'BASIC' | 'STANDARD' | 'PREMIUM' | 'ENTERPRISE'
 */
export const useSubscriptionTier = () => {
    return useSelector((state) => state.auth.subscriptionTier) || 'BASIC';
};

/**
 * Returns all tenant features as a map.
 * @returns {Object} - {feature_code: bool, ...}
 */
export const useAllFeatures = () => {
    return useSelector((state) => state.auth.tenantFeatures) || {};
};

export default useFeature;
