export interface TagRuleSet {
    version: '1.0';
    rules: TagRule[];
}
export type TagDeleteSource = 'azure' | 'spotto' | 'both';
export type TagDeleteMatch = 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'glob';
export interface TagDeleteRule {
    source?: TagDeleteSource;
    key?: string;
    keyMatch?: TagDeleteMatch;
    value?: string;
    valueMatch?: TagDeleteMatch;
    caseSensitive?: boolean;
}
export interface TagRule {
    name?: string;
    notes?: string;
    priority?: number;
    enabled?: boolean;
    where: string;
    scope?: RuleScope;
    tags: Record<string, string | null>;
    tagDeletes?: TagDeleteRule[];
}
export type RuleScope = 'self' | 'children' | 'descendants' | 'self-and-descendants';
export declare enum TagFlags {
    Required = 1,// 1
    Inherited = 2
}
export interface Tag {
    v: string;
    a: number;
}
export interface Tags {
    [key: string]: Tag;
}
//# sourceMappingURL=tags.d.ts.map