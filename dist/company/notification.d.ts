export interface NotificationSubscription {
    id?: string;
    name: string;
    channel: {
        type: 'slack' | 'teams' | '';
        url?: string;
    };
    subscriptions: {
        recommendations: number[];
        users: number[];
        cloudAccounts: number[];
        sharing: number[];
    };
}
export declare const RECOMMENDATION_FLAGS: {
    readonly PRIORITIZED: 1;
    readonly DISMISSED: 2;
    readonly NEW: 4;
};
export declare const USER_FLAGS: {
    readonly INVITE_ACCEPTED: 1;
};
export declare const CLOUD_ACCOUNT_FLAGS: {
    readonly SYNC_COMPLETED: 1;
};
export declare const SHARING_FLAGS: {
    readonly SHARE_CREATED: 1;
};
export declare const hasFlag: (value: number, flag: number) => boolean;
export declare const addFlag: (value: number, flag: number) => number;
export declare const removeFlag: (value: number, flag: number) => number;
export declare const hasArrayFlag: (array: number[], flag: number) => boolean;
export declare const addArrayFlag: (array: number[], flag: number) => number[];
export declare const removeArrayFlag: (array: number[], flag: number) => number[];
export declare const getRecommendationsFlags: (array: number[]) => {
    new: boolean;
    dismissed: boolean;
    prioritized: boolean;
};
//# sourceMappingURL=notification.d.ts.map