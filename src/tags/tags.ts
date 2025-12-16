export interface TagRuleSet {
  version: '1.0';
  rules: TagRule[];
}

export interface TagRule {
  name?: string;
  notes?: string;
  priority?: number; // Default: 1000
  enabled?: boolean; // Default: true
  where: string; // JSONata expression
  scope?: RuleScope; // Default: "self-and-descendants"
  tags: Record<string, string | null>; // null = delete tag
}

export type RuleScope = 'self' | 'children' | 'descendants' | 'self-and-descendants';

// Bitmask flag constants
export enum TagFlags {
  Required = 1 << 0, // 1
  Inherited = 1 << 1, // 2
}

// Individual tag interface
export interface Tag {
  v: string; // value (e.g., "prod", "staging")
  a: number; // attributes (TagFlags)
}

// Main tags object interface
export interface Tags {
  [key: string]: Tag;
}
