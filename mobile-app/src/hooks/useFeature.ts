/**
 * useFeature Hook - React Native
 *
 * Check if a feature is enabled for the current tenant.
 *
 * Usage:
 *   const hasAITimetable = useFeature('ai_timetable_generator');
 */

import { useSelector } from 'react-redux';
import { RootState } from '@/store';

/**
 * Returns true if the feature is enabled for the current tenant.
 */
export const useFeature = (featureCode: string): boolean => {
  const tenantFeatures = useSelector((state: RootState) => state.auth.tenantFeatures);
  return tenantFeatures?.[featureCode] ?? false;
};

/**
 * Returns the current subscription tier.
 */
export const useSubscriptionTier = (): string => {
  return useSelector((state: RootState) => state.auth.subscriptionTier) || 'BASIC';
};

/**
 * Returns all tenant features as a map.
 */
export const useAllFeatures = (): Record<string, boolean> => {
  return useSelector((state: RootState) => state.auth.tenantFeatures) || {};
};

/**
 * Non-hook utility to check feature from a features map.
 * Use this in non-component contexts (e.g., navigation config).
 */
export const hasFeature = (
  features: Record<string, boolean> | null,
  featureCode: string
): boolean => {
  if (!features) return true; // If features not loaded, default to visible
  return features[featureCode] ?? true;
};

export default useFeature;
