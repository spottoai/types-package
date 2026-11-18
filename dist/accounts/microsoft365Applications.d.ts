export declare const MICROSOFT365_APPLICATIONS_SCHEMA_VERSION: "microsoft-365-applications/v1";
export interface Microsoft365ApplicationWindow {
    /** Distinct accounts with a successful interactive sign-in on an observed date. */
    activeAccounts: number;
    /** Complete tenant dates in this window, excluding coverage gaps. */
    observedDays: number;
}
export interface Microsoft365ApplicationEntry {
    appId: string;
    /** Service principal name, latest nonempty sign-in name, or unknown. */
    name: string | null;
    nameSource: 'servicePrincipal' | 'signIn' | null;
    publisher: string | null;
    firstParty: boolean;
    /** Provider value; the contract does not close the vocabulary of SSO modes. */
    ssoMode: string | null;
    /** Inclusive UTC dates within the retained coverage range. */
    firstSeen: string;
    lastSeen: string;
    /** Both windows end at coverage.through and start no earlier than coverage.from. */
    last30Days: Microsoft365ApplicationWindow;
    last90Days: Microsoft365ApplicationWindow;
}
/** Anonymous tenant projection; no account identifiers or personal details. */
export interface Microsoft365ApplicationDirectory {
    schemaVersion: typeof MICROSOFT365_APPLICATIONS_SCHEMA_VERSION;
    tenantId: string;
    generatedAt: string;
    tenantSyncRunId: string;
    coverage: {
        /** Inclusive UTC calendar dates, including partially/unobserved dates. */
        from: string;
        through: string;
        observedDays: number;
        /** Unique missing, partial, denied or failed dates within the retained range. */
        unobservedDates: string[];
    };
    /** At most 5000 entries; producers sort by active accounts descending, then name. */
    applications: Microsoft365ApplicationEntry[];
    omittedCount?: number;
}
/**
 * Strict dependency-free artifact guard shared by API and UI readers.
 * Validation is linear in retained gaps and applications, without expanding the date range.
 */
export declare function isMicrosoft365ApplicationDirectory(value: unknown): value is Microsoft365ApplicationDirectory;
//# sourceMappingURL=microsoft365Applications.d.ts.map