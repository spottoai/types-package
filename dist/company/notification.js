"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecommendationsFlags = exports.removeArrayFlag = exports.addArrayFlag = exports.hasArrayFlag = exports.removeFlag = exports.addFlag = exports.hasFlag = exports.SHARING_FLAGS = exports.COST_ANOMALY_FLAGS = exports.CLOUD_ACCOUNT_FLAGS = exports.USER_FLAGS = exports.RECOMMENDATION_FLAGS = void 0;
/** Bitmask constants for resources */
exports.RECOMMENDATION_FLAGS = {
    /** 001 */
    PRIORITIZED: 1,
    /** 010 */
    DISMISSED: 2,
    /** 100 */
    NEW: 4,
};
/** Bitmask constants for users */
exports.USER_FLAGS = {
    /** 001 */
    INVITE_ACCEPTED: 1,
};
/** Bitmask constants for cloud accounts */
exports.CLOUD_ACCOUNT_FLAGS = {
    /** 001 */
    SYNC_COMPLETED: 1,
};
exports.COST_ANOMALY_FLAGS = {
    /** 001 */
    DETECTED: 1,
};
exports.SHARING_FLAGS = {
    SHARE_CREATED: 1,
};
/** Helper functions for bitmask operations */
const hasFlag = (value, flag) => (value & flag) !== 0;
exports.hasFlag = hasFlag;
const addFlag = (value, flag) => value | flag;
exports.addFlag = addFlag;
const removeFlag = (value, flag) => value & ~flag;
exports.removeFlag = removeFlag;
/** Array helper functions */
const hasArrayFlag = (array, flag) => array.includes(flag);
exports.hasArrayFlag = hasArrayFlag;
const addArrayFlag = (array, flag) => (array.includes(flag) ? array : [...array, flag]);
exports.addArrayFlag = addArrayFlag;
const removeArrayFlag = (array, flag) => array.filter(f => f !== flag);
exports.removeArrayFlag = removeArrayFlag;
/** Get individual flags from resources array */
const getRecommendationsFlags = (array) => ({
    new: (0, exports.hasArrayFlag)(array, exports.RECOMMENDATION_FLAGS.NEW),
    dismissed: (0, exports.hasArrayFlag)(array, exports.RECOMMENDATION_FLAGS.DISMISSED),
    prioritized: (0, exports.hasArrayFlag)(array, exports.RECOMMENDATION_FLAGS.PRIORITIZED),
});
exports.getRecommendationsFlags = getRecommendationsFlags;
//# sourceMappingURL=notification.js.map