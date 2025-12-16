export interface TagRuleSet {
    version: '1.0';
    rules: TagRule[];
}
export interface TagRule {
    name?: string;
    notes?: string;
    priority?: number;
    enabled?: boolean;
    where: string;
    scope?: RuleScope;
    tags: Record<string, string | null>;
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