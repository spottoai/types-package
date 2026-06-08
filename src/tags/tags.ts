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
  priority?: number; // Default: 1000
  enabled?: boolean; // Default: true
  where: string; // JSONata expression
  scope?: RuleScope; // Default: "self-and-descendants"
  tags: Record<string, string | null>; // null = delete tag
  tagDeletes?: TagDeleteRule[]; // remove matching Azure and/or Spotto tags at read time
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
