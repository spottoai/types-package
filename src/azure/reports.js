"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeReasonType = void 0;
/** Specific reason types for cost changes */
var ChangeReasonType;
(function (ChangeReasonType) {
    ChangeReasonType["NEW_RESOURCE"] = "new_resource";
    ChangeReasonType["REMOVED_RESOURCE"] = "removed_resource";
    ChangeReasonType["QUANTITY_INCREASE"] = "quantity_increase";
    ChangeReasonType["QUANTITY_DECREASE"] = "quantity_decrease";
    ChangeReasonType["RATE_CHANGE"] = "rate_change";
    ChangeReasonType["SKU_CHANGE"] = "sku_change";
    ChangeReasonType["NEW_METER"] = "new_meter";
    ChangeReasonType["REMOVED_METER"] = "removed_meter";
})(ChangeReasonType || (exports.ChangeReasonType = ChangeReasonType = {}));
//# sourceMappingURL=reports.js.map