import type { RelationshipSnapshot } from '../azure/relationships';
import type { ProviderScope } from './provider';
import type { ResourceGraphArtifact } from './resourceGraph';

/** Canonical provider scope used to select a provider-specific relationship artifact. */
export type PublicRelationshipProviderScope = ProviderScope;

/** Public relationship bodies accepted by provider-aware API and UI consumers: the Azure snapshot or the provider-neutral resource graph. */
export type PublicRelationshipArtifact = RelationshipSnapshot | ResourceGraphArtifact;
