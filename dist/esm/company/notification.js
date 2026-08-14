/** Bitmask constants for resources */
export const RECOMMENDATION_FLAGS = {
    /** 001 */
    PRIORITIZED: 1,
    /** 010 */
    DISMISSED: 2,
    /** 100 */
    NEW: 4,
    /** 1000 */
    IMPLEMENTED: 8,
};
/** Bitmask constants for users */
export const USER_FLAGS = {
    /** 001 */
    INVITE_ACCEPTED: 1,
};
/** Bitmask constants for cloud accounts */
export const CLOUD_ACCOUNT_FLAGS = {
    /** 001 */
    SYNC_COMPLETED: 1,
};
export const COST_ANOMALY_FLAGS = {
    /** 001 */
    DETECTED: 1,
};
export const SHARING_FLAGS = {
    SHARE_CREATED: 1,
};
/** Helper functions for bitmask operations */
export const hasFlag = (value, flag) => (value & flag) !== 0;
export const addFlag = (value, flag) => value | flag;
export const removeFlag = (value, flag) => value & ~flag;
/** Array helper functions */
export const hasArrayFlag = (array, flag) => array.includes(flag);
export const addArrayFlag = (array, flag) => (array.includes(flag) ? array : [...array, flag]);
export const removeArrayFlag = (array, flag) => array.filter(f => f !== flag);
/** Get individual flags from resources array */
export const getRecommendationsFlags = (array) => ({
    new: hasArrayFlag(array, RECOMMENDATION_FLAGS.NEW),
    dismissed: hasArrayFlag(array, RECOMMENDATION_FLAGS.DISMISSED),
    prioritized: hasArrayFlag(array, RECOMMENDATION_FLAGS.PRIORITIZED),
    implemented: hasArrayFlag(array, RECOMMENDATION_FLAGS.IMPLEMENTED),
});
