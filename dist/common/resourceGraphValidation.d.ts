import type { ArtifactProvider } from './artifactGeneration.js';
import { type ResourceGraphArtifact } from './resourceGraph.js';
import { type AttributeValue } from './resourceIdentity.js';
/** Account and Region a node's provider-native values must stay within. */
export interface ResourceGraphNodeScope {
    accountId: string;
    region?: string;
}
/**
 * Provider format rules. The generic validator checks structure only; each
 * provider supplies identifier formats here. Every callback throws on failure.
 */
export interface ResourceGraphValidationOptions<Provider extends ArtifactProvider = ArtifactProvider> {
    provider: Provider;
    isAccountId?: (value: string) => boolean;
    isRegion?: (value: string) => boolean;
    isResourceType?: (value: string) => boolean;
    validateNativeId?: (nativeId: string, scope: ResourceGraphNodeScope, field: string) => void;
    /** Validates a zone node name against its Region. */
    validateZone?: (zone: string, region: string, field: string) => void;
    validateAttribute?: (key: string, value: AttributeValue, scope: ResourceGraphNodeScope, field: string) => void;
    /** Rejects keys at every depth; `inAttributes` is true inside a node's provider-native attributes. */
    isForbiddenKey?: (key: string, inAttributes: boolean) => boolean;
}
/**
 * Validates one untrusted resource graph artifact. It checks structure and
 * identifier formats only; families are never checked against a service list.
 */
export declare function validateResourceGraphArtifact<Provider extends ArtifactProvider>(value: unknown, options: ResourceGraphValidationOptions<Provider>): ResourceGraphArtifact<Provider>;
//# sourceMappingURL=resourceGraphValidation.d.ts.map