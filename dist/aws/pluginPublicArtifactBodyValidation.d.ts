import { type AwsPluginArtifactTarget, type AwsPluginResourceDetailArtifact, type AwsPluginSubscriptionDetailArtifact } from './pluginPublicArtifacts';
export { validateSourceBinding } from './pluginPublicArtifactSectionValidation';
/** Validates and returns one lossless AWS plugin subscription-detail body. */
export declare function validateAwsPluginSubscriptionDetailArtifact(value: unknown): AwsPluginSubscriptionDetailArtifact;
/** Validates and returns one lossless AWS plugin resource-detail body. */
export declare function validateAwsPluginResourceDetailArtifact(value: unknown): AwsPluginResourceDetailArtifact;
export declare function validateTarget<Kind extends 'subscription-detail' | 'resource-detail'>(value: unknown, kind: Kind): Extract<AwsPluginArtifactTarget, {
    kind: Kind;
}>;
//# sourceMappingURL=pluginPublicArtifactBodyValidation.d.ts.map