export enum ProviderName {
  Azure = 'azure',
  Aws = 'aws',
}

export interface ProviderScope {
  providerName: ProviderName;
  providerScopeId: string;
}
