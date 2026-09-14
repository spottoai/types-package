export type BastionScheduleSupportedSkuV1 = 'Basic' | 'Standard' | 'Premium';
export interface BastionScheduleSupportedProfileV1 {
    skuName: BastionScheduleSupportedSkuV1;
    location: string;
    zones?: string[];
    scaleUnits: number;
    disableCopyPaste: boolean;
    enableFileCopy: boolean;
    enableIpConnect: boolean;
    enableShareableLink: boolean;
    enableTunneling: boolean;
    enableKerberos: boolean;
    enableSessionRecording: false;
    enablePrivateOnlyBastion: false;
    tags: Record<string, string>;
    ipConfigurationName: string;
    publicIpId: string;
    subnetId: string;
    virtualNetworkId: string;
    sourceEtag: string;
}
/** Normalizes an eligible public dedicated Azure Bastion profile for schedule readiness and recovery. */
export declare function readSupportedBastionScheduleProfileV1(value: unknown, expectedResourceId: string): BastionScheduleSupportedProfileV1 | undefined;
//# sourceMappingURL=bastionScheduleProfile.d.ts.map