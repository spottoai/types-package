import type { AwsPortalRelationshipArtifact } from '../aws/portalRelationshipPublicArtifacts';
import type { RelationshipSnapshot } from '../azure/relationships';
import type { ProviderScope } from './provider';
/** Canonical provider scope used to select a provider-specific relationship artifact. */
export type PublicRelationshipProviderScope = ProviderScope;
/** Public relationship bodies accepted by provider-aware API and UI consumers. */
export type PublicRelationshipArtifact = RelationshipSnapshot | AwsPortalRelationshipArtifact;
//# sourceMappingURL=relationships.d.ts.map