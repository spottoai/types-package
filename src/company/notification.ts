/** Notification subscription types */
export interface NotificationSubscription {
  id?: string;
  name: string;
  channel: {
    type: 'slack' | 'teams' | 'email' | 'webhook' | '';
    url?: string;
    email?: string;
    authTokenRef?: string;
  };
  subscriptions: {
    /** Array of selected recommendation flags */
    recommendations: number[];
    /** Array of selected user flags */
    users: number[];
    /** Array of selected cloud account flags */
    cloudAccounts: number[];
    /** Array of selected cost alert flags (legacy/general). */
    cost?: number[];
    /** Array of selected cost anomaly flags. */
    costAnomalies?: number[];
    /** Array of selected sharing flags */
    sharing: number[];
  };
}

/** Bitmask constants for resources */
export const RECOMMENDATION_FLAGS = {
  /** 001 */
  PRIORITIZED: 1,
  /** 010 */
  DISMISSED: 2,
  /** 100 */
  NEW: 4,
} as const;

/** Bitmask constants for users */
export const USER_FLAGS = {
  /** 001 */
  INVITE_ACCEPTED: 1,
} as const;

/** Bitmask constants for cloud accounts */
export const CLOUD_ACCOUNT_FLAGS = {
  /** 001 */
  SYNC_COMPLETED: 1,
} as const;

export const COST_ANOMALY_FLAGS = {
  /** 001 */
  DETECTED: 1,
} as const;

export const SHARING_FLAGS = {
  SHARE_CREATED: 1,
} as const;

/** Helper functions for bitmask operations */
export const hasFlag = (value: number, flag: number): boolean => (value & flag) !== 0;
export const addFlag = (value: number, flag: number): number => value | flag;
export const removeFlag = (value: number, flag: number): number => value & ~flag;

/** Array helper functions */
export const hasArrayFlag = (array: number[], flag: number): boolean => array.includes(flag);
export const addArrayFlag = (array: number[], flag: number): number[] => (array.includes(flag) ? array : [...array, flag]);
export const removeArrayFlag = (array: number[], flag: number): number[] => array.filter(f => f !== flag);

/** Get individual flags from resources array */
export const getRecommendationsFlags = (array: number[]) => ({
  new: hasArrayFlag(array, RECOMMENDATION_FLAGS.NEW),
  dismissed: hasArrayFlag(array, RECOMMENDATION_FLAGS.DISMISSED),
  prioritized: hasArrayFlag(array, RECOMMENDATION_FLAGS.PRIORITIZED),
});
