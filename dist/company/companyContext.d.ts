import type { ProviderScope } from '../common/provider';
import type { CompanyNoteContextCategory } from './companyNotes';
export declare const COMPANY_CONTEXT_SCHEMA_VERSION: 1;
/** Safe company-owned source kinds. Private conversation identifiers are never shared sources. */
export type CompanyContextSourceKind = 'company-note' | 'company-memory' | 'company-statement' | 'resource-note' | 'recommendation-discussion' | 'decision-brief' | 'review-checklist' | 'ticket' | 'environment';
export type CompanyContextSourceVersion = {
    kind: 'revision';
    revisionId: string;
    generationId?: never;
    contentHash?: never;
} | {
    kind: 'generation';
    generationId: string;
    revisionId?: never;
    contentHash?: never;
} | {
    kind: 'content-hash';
    contentHash: string;
    revisionId?: never;
    generationId?: never;
};
/** Locators address an exact version. Offsets, when supplied, use UTF-16 code units, end exclusive. */
export type CompanyContextSourceLocator = {
    kind: 'document';
} | {
    kind: 'question';
    questionId: string;
} | {
    kind: 'passage';
    passageId: string;
    startCharacter?: number;
    endCharacter?: number;
};
export type CompanyContextSource = {
    companyId: string;
    sourceId: string;
    locator: CompanyContextSourceLocator;
} & ({
    kind: 'company-note' | 'company-memory' | 'company-statement';
    version: Extract<CompanyContextSourceVersion, {
        kind: 'revision';
    }>;
} | {
    kind: 'environment';
    version: Extract<CompanyContextSourceVersion, {
        kind: 'generation';
    }>;
} | {
    kind: Exclude<CompanyContextSourceKind, 'company-note' | 'company-memory' | 'company-statement' | 'environment'>;
    version: CompanyContextSourceVersion;
});
export type CompanyContextNoteSource = CompanyContextSource & {
    kind: 'company-note';
    version: {
        kind: 'revision';
        revisionId: string;
    };
};
export interface CompanyContextScope {
    companyId: string;
    providerScopes?: ProviderScope[];
    resourceIds?: string[];
    areaIds?: string[];
}
export interface CompanyContextFacets {
    topics: CompanyNoteContextCategory[];
    areaIds: string[];
    personIds: string[];
    teamIds: string[];
}
/** Server-attributed audit actor, never an authorization grant or a caller-supplied mutation field. */
export type CompanyContextActor = {
    kind: 'user';
    userId: string;
    displayName?: string;
} | {
    kind: 'service';
    serviceId: string;
    displayName?: string;
};
export interface CompanyContextExcerpt {
    source: CompanyContextSource;
    title: string;
    text: string;
    observedAt?: string;
    updatedAt?: string;
    /** API-issued company-safe navigation; consumers validate destination and current access. */
    sourceLink?: string;
    /** Present only when the source service can supply more authorized content. */
    continuation?: string;
    historicalStatus?: 'corrected' | 'forgotten' | 'superseded' | 'expired';
}
/** No source identity, title, count or content is disclosed for an inaccessible source family. */
export interface CompanyContextUnavailableSource {
    sourceKind: CompanyContextSourceKind;
    status: 'denied' | 'unavailable' | 'unsupported';
    reasonCode: string;
    source?: never;
    title?: never;
    text?: never;
    count?: never;
}
export type CompanyContextSourceCoverage = CompanyContextUnavailableSource | {
    sourceKind: CompanyContextSourceKind;
    status: 'available' | 'empty' | 'partial' | 'unread' | 'stale';
    reasonCode?: string;
    consultedCount?: number;
    omittedCount?: number;
};
/** Complete means all relevant discovery and reads succeeded, not merely the returned page. */
export type CompanyContextCoverage = {
    sources: CompanyContextSourceCoverage[];
} & ({
    status: 'complete';
    reasonCodes?: never;
} | {
    status: 'partial' | 'unavailable';
    reasonCodes: [string, ...string[]];
});
export interface CompanyContextSearchRequest {
    companyId: string;
    query: string;
    sourceKinds?: CompanyContextSourceKind[];
    topics?: CompanyNoteContextCategory[];
    areaIds?: string[];
    personIds?: string[];
    teamIds?: string[];
    cursor?: string;
    /** A request hint; the API enforces its own finite limit. */
    limit?: number;
}
export interface CompanyContextSearchResponse {
    schemaVersion: typeof COMPANY_CONTEXT_SCHEMA_VERSION;
    companyId: string;
    contextVersion: string;
    matches: CompanyContextExcerpt[];
    coverage: CompanyContextCoverage;
    nextCursor?: string;
}
export interface CompanyContextReadRequest {
    companyId: string;
    source: CompanyContextSource;
    continuation?: string;
}
/** A supplied reference identifies content; the source service must resolve current authority and access independently. */
export type CompanyContextReadResponse = {
    companyId: string;
    contextVersion: string;
} & ({
    status: 'available';
    excerpt: CompanyContextExcerpt;
    coverage: CompanyContextCoverage;
} | {
    status: 'denied' | 'unavailable' | 'stale';
    reasonCode: string;
    excerpt?: never;
});
export interface CompanyContextIdentitySummary {
    identityId: string;
    displayName: string;
}
export interface CompanyContextTopicSummary {
    topic: CompanyNoteContextCategory;
    status: 'available' | 'empty' | 'unavailable';
    sources: CompanyContextSource[];
}
/** Navigation and selected shared constraints; availability is not evidence that every source was read. */
export interface CompanyContextOverview {
    schemaVersion: typeof COMPANY_CONTEXT_SCHEMA_VERSION;
    companyId: string;
    contextVersion: string;
    generatedAt: string;
    aboutCompany: CompanyContextExcerpt[];
    topics: CompanyContextTopicSummary[];
    areas: CompanyContextIdentitySummary[];
    people: CompanyContextIdentitySummary[];
    teams: CompanyContextIdentitySummary[];
    coverage: CompanyContextCoverage;
}
/** Only excerpts actually used for this answer, not all context available to the turn. */
export interface CompanyContextUsage {
    companyId: string;
    contextVersion: string;
    matches: CompanyContextExcerpt[];
    coverage: CompanyContextCoverage;
}
//# sourceMappingURL=companyContext.d.ts.map