import type { Company } from './company';
export type CompanyClassification = 'customer' | 'container';
export type CompanyHierarchyMoveReasonCode = 'self' | 'descendant_cycle' | 'outside_root_tree' | 'outside_admin_scope' | 'max_depth_exceeded' | 'subtree_too_large' | 'sibling_name_conflict' | 'not_found' | 'global_admin_required' | 'invalid_parent';
export type CompanyHierarchyRebuildViolationCode = 'orphan_parent' | 'cycle' | 'max_depth_exceeded' | 'sibling_name_conflict' | 'missing_metadata' | 'tree_stale';
export interface CompanyHierarchyMetadata {
    rootCompanyId?: string;
}
export type CompanyWithHierarchy = Company & CompanyHierarchyMetadata;
export interface CompanyHierarchyMoveRequest {
    newParentCompanyId: string;
}
export interface CompanyHierarchyMoveResponse {
    companyId: string;
    companyName: string;
    oldParentCompanyId?: string;
    newParentCompanyId: string;
    rootCompanyId: string;
    affectedCompanyCount: number;
}
export interface CompanyHierarchyClassificationUpdateRequest {
    classification: CompanyClassification;
}
export interface CompanyHierarchyClassificationUpdateResponse {
    companyId: string;
    rootCompanyId: string;
    classification: CompanyClassification;
}
export interface CompanyHierarchyTreeDocument {
    builtAt: string;
    root: CompanyHierarchyTreeNode;
}
export type CompanyHierarchyResponse = CompanyHierarchyTreeDocument;
export interface CompanyHierarchyTreeNode {
    companyId: string;
    companyName: string;
    classification: CompanyClassification;
    children: CompanyHierarchyTreeNode[];
}
export interface CompanyHierarchyRebuildReport {
    dryRun: boolean;
    repaired: boolean;
    companiesScanned: number;
    companiesUpdated: number;
    treesWritten: number;
    violations: CompanyHierarchyRebuildViolation[];
}
export interface CompanyHierarchyRebuildViolation {
    code: CompanyHierarchyRebuildViolationCode;
    companyId?: string;
    relatedCompanyId?: string;
    message: string;
}
//# sourceMappingURL=companyHierarchy.d.ts.map