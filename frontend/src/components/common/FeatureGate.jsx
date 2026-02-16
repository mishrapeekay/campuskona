/**
 * FeatureGate Component
 *
 * Conditionally renders children based on whether a feature is enabled
 * for the current tenant. Shows an optional fallback (e.g., upgrade prompt)
 * when the feature is not available.
 *
 * Usage:
 *   <FeatureGate feature="ai_timetable_generator">
 *       <TimetableGenerator />
 *   </FeatureGate>
 *
 *   <FeatureGate feature="ai_timetable_generator" fallback={<UpgradePrompt />}>
 *       <TimetableGenerator />
 *   </FeatureGate>
 */

import { useFeature, useSubscriptionTier } from '../../hooks/useFeature';

const FeatureGate = ({ feature, children, fallback = null, showUpgrade = false }) => {
    const isEnabled = useFeature(feature);
    const tier = useSubscriptionTier();

    if (isEnabled) {
        return children;
    }

    if (fallback) {
        return fallback;
    }

    if (showUpgrade) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                        />
                    </svg>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">
                        Premium Feature
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        This feature is not available on your current plan ({tier}).
                        Please contact your administrator to upgrade.
                    </p>
                </div>
            </div>
        );
    }

    return null;
};

export default FeatureGate;
