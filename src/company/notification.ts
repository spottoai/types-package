// Notification subscription types
export interface NotificationSubscription {
  id?: string;
  name: string;
  channel: {
    type: 'slack' | 'teams' | '';
    url?: string;
  };
  subscriptions: {
    recommendations: number[]; // Array of selected recommendation flags
    users: number[]; // Array of selected user flags
    cloudAccounts: number[]; // Array of selected cloud account flags
  };
}

// Bitmask constants for resources
export const RECOMMENDATION_FLAGS = {
  PRIORITIZED: 1, // 001
  DISMISSED: 2, // 010
  NEW: 4, // 100
} as const;

// Bitmask constants for users
export const USER_FLAGS = {
  INVITE_ACCEPTED: 1, // 001
} as const;

// Bitmask constants for cloud accounts
export const CLOUD_ACCOUNT_FLAGS = {
  SYNC_COMPLETED: 1, // 001
} as const;

// Helper functions for bitmask operations
export const hasFlag = (value: number, flag: number): boolean => (value & flag) !== 0;
export const addFlag = (value: number, flag: number): number => value | flag;
export const removeFlag = (value: number, flag: number): number => value & ~flag;

// Array helper functions
export const hasArrayFlag = (array: number[], flag: number): boolean => array.includes(flag);
export const addArrayFlag = (array: number[], flag: number): number[] => (array.includes(flag) ? array : [...array, flag]);
export const removeArrayFlag = (array: number[], flag: number): number[] => array.filter(f => f !== flag);

// Get individual flags from resources array
export const getRecommendationsFlags = (array: number[]) => ({
  new: hasArrayFlag(array, RECOMMENDATION_FLAGS.NEW),
  dismissed: hasArrayFlag(array, RECOMMENDATION_FLAGS.DISMISSED),
  prioritized: hasArrayFlag(array, RECOMMENDATION_FLAGS.PRIORITIZED),
});
