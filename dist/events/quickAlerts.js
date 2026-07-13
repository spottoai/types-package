"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isQuickAlertType = exports.QUICK_ALERT_TYPES = void 0;
exports.QUICK_ALERT_TYPES = ['credentialExpiry', 'benefitExpiry', 'serviceRetirement', 'backupFailure'];
const isQuickAlertType = (value) => exports.QUICK_ALERT_TYPES.includes(value);
exports.isQuickAlertType = isQuickAlertType;
//# sourceMappingURL=quickAlerts.js.map