/** Specific reason types for cost changes */
export var ChangeReasonType;
(function (ChangeReasonType) {
    ChangeReasonType["NEW_RESOURCE"] = "new_resource";
    ChangeReasonType["REMOVED_RESOURCE"] = "removed_resource";
    ChangeReasonType["QUANTITY_INCREASE"] = "quantity_increase";
    ChangeReasonType["QUANTITY_DECREASE"] = "quantity_decrease";
    ChangeReasonType["RATE_CHANGE"] = "rate_change";
    ChangeReasonType["SKU_CHANGE"] = "sku_change";
    ChangeReasonType["NEW_METER"] = "new_meter";
    ChangeReasonType["REMOVED_METER"] = "removed_meter";
})(ChangeReasonType || (ChangeReasonType = {}));
