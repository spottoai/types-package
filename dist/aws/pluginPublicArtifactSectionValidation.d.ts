import { type AwsPluginArtifactTarget, type AwsPluginResourceTarget, type AwsPluginSectionSourceBinding, type AwsPluginSubscriptionTarget } from './pluginPublicArtifacts';
export declare function validateSubscriptionSections(value: unknown, target: AwsPluginSubscriptionTarget, outputGeneratedAt: string): void;
export declare function validateResourceSections(value: unknown, target: AwsPluginResourceTarget, outputGeneratedAt: string): void;
export declare function validateSourceBinding(value: unknown, accountId: string, section: string, field: string): AwsPluginSectionSourceBinding;
export declare function validateSourceBindingForTarget(source: AwsPluginSectionSourceBinding, target: AwsPluginArtifactTarget, field: string): void;
//# sourceMappingURL=pluginPublicArtifactSectionValidation.d.ts.map