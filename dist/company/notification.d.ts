/** Notification subscription types */
export interface NotificationSubscription {
    id?: string;
    name: string;
    channel: {
        type: 'slack' | 'teams' | '';
        url?: string;
    };
    subscriptions: {
        /** Array of selected recommendation flags */
        recommendations: number[];
        /** Array of selected user flags */
        users: number[];
        /** Array of selected cloud account flags */
        cloudAccounts: number[];
        /** Array of selected sharing flags */
        sharing: number[];
    };
}
/** Bitmask constants for resources */
export declare const RECOMMENDATION_FLAGS: {
    /** 001 */
    readonly PRIORITIZED: 1;
    /** 010 */
    readonly DISMISSED: 2;
    /** 100 */
    readonly NEW: 4;
};
/** Bitmask constants for users */
export declare const USER_FLAGS: {
    /** 001 */
    readonly INVITE_ACCEPTED: 1;
};
/** Bitmask constants for cloud accounts */
export declare const CLOUD_ACCOUNT_FLAGS: {
    /** 001 */
    readonly SYNC_COMPLETED: 1;
};
export declare const SHARING_FLAGS: {
    readonly SHARE_CREATED: 1;
};
/** Helper functions for bitmask operations */
export declare const hasFlag: (value: number, flag: number) => boolean;
export declare const addFlag: (value: number, flag: number) => number;
export declare const removeFlag: (value: number, flag: number) => number;
/** Array helper functions */
export declare const hasArrayFlag: (array: number[], flag: number) => boolean;
export declare const addArrayFlag: (array: number[], flag: number) => number[];
export declare const removeArrayFlag: (array: number[], flag: number) => number[];
/** Get individual flags from resources array */
export declare const getRecommendationsFlags: (array: number[]) => {
    new: boolean;
    dismissed: boolean;
    prioritized: boolean;
};
//# sourceMappingURL=notification.d.ts.map