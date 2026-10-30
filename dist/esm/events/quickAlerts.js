export const QUICK_ALERT_TYPES = ['credentialExpiry', 'benefitExpiry', 'serviceRetirement', 'backupFailure', 'earlySpend'];
export const isQuickAlertType = (value) => QUICK_ALERT_TYPES.includes(value);
