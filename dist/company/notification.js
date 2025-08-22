"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecommendationsFlags = exports.removeArrayFlag = exports.addArrayFlag = exports.hasArrayFlag = exports.removeFlag = exports.addFlag = exports.hasFlag = exports.CLOUD_ACCOUNT_FLAGS = exports.USER_FLAGS = exports.RECOMMENDATION_FLAGS = void 0;
// Bitmask constants for resources
exports.RECOMMENDATION_FLAGS = {
    PRIORITIZED: 1, // 001
    DISMISSED: 2, // 010
    NEW: 4, // 100
};
// Bitmask constants for users
exports.USER_FLAGS = {
    INVITE_ACCEPTED: 1, // 001
};
// Bitmask constants for cloud accounts
exports.CLOUD_ACCOUNT_FLAGS = {
    SYNC_COMPLETED: 1, // 001
};
// Helper functions for bitmask operations
const hasFlag = (value, flag) => (value & flag) !== 0;
exports.hasFlag = hasFlag;
const addFlag = (value, flag) => value | flag;
exports.addFlag = addFlag;
const removeFlag = (value, flag) => value & ~flag;
exports.removeFlag = removeFlag;
// Array helper functions
const hasArrayFlag = (array, flag) => array.includes(flag);
exports.hasArrayFlag = hasArrayFlag;
const addArrayFlag = (array, flag) => (array.includes(flag) ? array : [...array, flag]);
exports.addArrayFlag = addArrayFlag;
const removeArrayFlag = (array, flag) => array.filter(f => f !== flag);
exports.removeArrayFlag = removeArrayFlag;
// Get individual flags from resources array
const getRecommendationsFlags = (array) => ({
    new: (0, exports.hasArrayFlag)(array, exports.RECOMMENDATION_FLAGS.NEW),
    dismissed: (0, exports.hasArrayFlag)(array, exports.RECOMMENDATION_FLAGS.DISMISSED),
    prioritized: (0, exports.hasArrayFlag)(array, exports.RECOMMENDATION_FLAGS.PRIORITIZED),
});
exports.getRecommendationsFlags = getRecommendationsFlags;
//# sourceMappingURL=notification.js.map