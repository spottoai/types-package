import type { Company } from './company';

export type CompanyClassification = 'customer' | 'container';

export type CompanyHierarchyMoveReasonCode =
  | 'self'
  | 'descendant_cycle'
  | 'outside_root_tree'
  | 'outside_admin_scope'
  | 'max_depth_exceeded'
  | 'subtree_too_large'
  | 'sibling_name_conflict'
  | 'stale_hierarchy_version'
  | 'not_found'
  | 'global_admin_required'
  | 'invalid_parent';

export type CompanyHierarchyRebuildViolationCode =
  | 'orphan_parent'
  | 'cycle'
  | 'max_depth_exceeded'
  | 'sibling_name_conflict'
  | 'missing_metadata'
  | 'snapshot_stale';

export interface CompanyHierarchyMetadata {
  rootCompanyId?: string;
  depth?: number;
  pathCompanyIds?: string[];
  classification?: CompanyClassification;
  hierarchyVersion?: number;
}

export type CompanyWithHierarchy = Company & CompanyHierarchyMetadata;

export interface CompanyHierarchyMoveRequest {
  newParentCompanyId: string;
  expectedMovedHierarchyVersion: number;
  expectedNewParentHierarchyVersion?: number;
}

export interface CompanyHierarchyMoveResponse {
  companyId: string;
  companyName: string;
  oldParentCompanyId?: string;
  newParentCompanyId: string;
  rootCompanyId: string;
  pathCompanyIds: string[];
  pathCompanyNames?: string[];
  affectedCompanyCount: number;
  hierarchyVersion: number;
}

export interface CompanyHierarchyRootSnapshot {
  rootCompanyId: string;
  hierarchyVersion: number;
  builtAt: string;
  root: CompanyHierarchySnapshotNode;
}

export type CompanyHierarchyResponse = CompanyHierarchyRootSnapshot;

export interface CompanyHierarchySnapshotNode {
  companyId: string;
  companyName: string;
  classification: CompanyClassification;
  hierarchyVersion: number;
  children: CompanyHierarchySnapshotNode[];
}

export interface CompanyHierarchyRebuildReport {
  dryRun: boolean;
  repaired: boolean;
  companiesScanned: number;
  companiesUpdated: number;
  snapshotsWritten: number;
  violations: CompanyHierarchyRebuildViolation[];
}

export interface CompanyHierarchyRebuildViolation {
  code: CompanyHierarchyRebuildViolationCode;
  companyId?: string;
  relatedCompanyId?: string;
  message: string;
}
