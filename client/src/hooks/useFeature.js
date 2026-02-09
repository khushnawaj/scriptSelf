import { useSelector } from 'react-redux';

/**
 * Hook to check if a feature is enabled for the current user.
 * Supports both specific user feature flags and A/B group assignments.
 * 
 * @param {string} featureName - The unique key of the feature
 * @param {object} options - { abTest: 'A' | 'B' } - Option to bind feature to an A/B cohort
 * @returns {boolean}
 */
export const useFeature = (featureName, options = {}) => {
    const { user } = useSelector((state) => state.auth);

    // If no user is logged in, features are off by default (or you can define guest flags)
    if (!user) return false;

    // Priority 1: User-specific feature flags (Overrides A/B testing)
    // Mongoose Maps come as objects in plain JS
    const flags = user.featureFlags || {};
    if (flags[featureName] !== undefined) {
        return flags[featureName];
    }

    // Priority 2: A/B Testing Cohort
    if (options.abTest) {
        return user.experimentGroup === options.abTest;
    }

    return false;
};

/**
 * Component-based Feature Gate
 */
export const FeatureGate = ({ feature, abTest, children, fallback = null }) => {
    const isEnabled = useFeature(feature, { abTest });
    return isEnabled ? children : fallback;
};
