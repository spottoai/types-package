import type { ResourceCostSummary } from '../azure/prices';

/** Bucketed per-resource Azure-shape cost lines, published in an AWS resources view. */
export interface AwsResourceCostItemsDescriptorV1 {
  schemaVersion: 1;
  kind: 'sha256-prefix2';
  chunks: Record<string, string>;
}

/**
 * Resource entries are omitted when billed or amortized evidence is missing; signed credits/refunds remain values.
 * Digest preimage uses fixed envelope key order, ordinal-sorted resource/item keys and preserved array order.
 */
export interface AwsResourceCostItemsChunkV1 {
  schemaVersion: 1;
  accountId: string;
  bucket: string;
  currency: string;
  /** Reuses ResourceCostSummary unchanged. Entry sums reconcile to the resource row's captured spend window. */
  itemsByResourceId: Record<string, ResourceCostSummary[]>;
}
