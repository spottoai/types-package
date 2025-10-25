import { SurveyResponse } from '../company';
export interface CloudAccount {
    companyId: string;
    id: string;
    name: string;
    companyName: string;
    provider: string;
    tenantId?: string;
    secret?: string;
    secretExpiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    status: string;
    objectives?: SurveyResponse[];
}
export interface SubscriptionAccount {
    id: string;
    companyId: string;
    name: string;
    cloudAccountId: string;
    cloudAccountName: string;
    status?: string;
    statusLabel?: string;
    error?: string;
    lastUpdated?: string;
    quotaId?: string;
    duration?: string;
    currency?: string;
    currencySymbol?: string;
    foundCurrency?: boolean;
    ready?: boolean;
    secureScore?: number;
    showAmortizedCosts?: boolean;
    totalCost?: number;
    billingItems?: number;
    activityItems?: number;
    eventId?: string;
}
//# sourceMappingURL=accounts.d.ts.map