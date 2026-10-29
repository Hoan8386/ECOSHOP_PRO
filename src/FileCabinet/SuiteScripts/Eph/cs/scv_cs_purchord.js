/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([
    '../common/scv_common_purchord.js',
],
function(
    commonPurchOrd,
) {

    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {

    }

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {
        const curRec = scriptContext.currentRecord;
        const sublistId = scriptContext.sublistId;
        const fieldId = scriptContext.fieldId;

        onChangeCalcRateByIMAPurPrice(curRec, sublistId, fieldId, false);
    }

    /**
     * Function to be executed when field is slaved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     *
     * @since 2015.2
     */
    function postSourcing(scriptContext) {
        const curRec = scriptContext.currentRecord;
        const sublistId = scriptContext.sublistId;
        const fieldId = scriptContext.fieldId;

        onChangeCalcRateByIMAPurPrice(curRec, sublistId, fieldId, true);
    }

    /**
     * Validation function to be executed when sublist line is committed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateLine(scriptContext) {
        const curRec = scriptContext.currentRecord;
        const sublistId = scriptContext.sublistId;

        const objPurPrice = validateLineItemByIMAPurPrice(curRec, sublistId);
        if(!objPurPrice.isValid) {
            alert(objPurPrice.message);
            return false;
        }
        
        return true;
    }

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) {

    }

    const onChangeCalcRateByIMAPurPrice = (curRec, sublistId, fieldId, isPostSrc = true) => {
        let isValid = ((["units", "item"].includes(fieldId) && isPostSrc === true) || (["custcol_scv_is_foc", "taxrate1"].includes(fieldId) && isPostSrc === false));
        
        // TODO: điều chỉnh luồng set rate cho PO -> Rate bắt buộc phải lấy từ IMA Purchase Price.
        if(sublistId === "item" && isValid) {
            let itemId = curRec.getCurrentSublistValue(sublistId, "item");
            let item_display = curRec.getCurrentSublistValue(sublistId, "item_display");
            let unitId = curRec.getCurrentSublistValue(sublistId, "units");
            let taxrate1 = curRec.getCurrentSublistValue(sublistId, "taxrate1");
            let is_foc = curRec.getCurrentSublistValue(sublistId, "custcol_scv_is_foc");

            if(is_foc === true) {
                curRec.setCurrentSublistValue({
                    sublistId: sublistId, fieldId: "custcol_scv_ima_pur_price", value: ""
                });
                curRec.setCurrentSublistValue({
                    sublistId: sublistId, fieldId: "rate", value: 0
                });
            } else if(!!itemId && !!unitId && (taxrate1 !== undefined && taxrate1 != null && taxrate1 !== '')) {
                let objSearch = commonPurchOrd.getDataObjSearchImaPurPrice({curRec, itemId, unitId});
                if(!objSearch.isValid) return;

                let objApplyPrice = commonPurchOrd.getDataAppliedImaPurPriceByPO(objSearch)[0] || {};
                let rate = 0;

                if(objApplyPrice?.id) {
                    rate = commonPurchOrd.calcRateFromAppliedImaPurPrice(objApplyPrice, objSearch.currency, taxrate1);
                    
                    curRec.setCurrentSublistValue({
                        sublistId: sublistId, fieldId: "custcol_scv_ima_pur_price", value: objApplyPrice.id
                    });
                }

                curRec.setCurrentSublistValue({
                    sublistId: sublistId, fieldId: "rate", value: rate
                });
            }
        }
    }

    const validateLineItemByIMAPurPrice = (curRec, sublistId) => {
        let objRes = {
            isValid: true,
            message: "Success."
        };

        let rate = curRec.getCurrentSublistValue(sublistId, "rate") * 1;
        let ima_pur_price = curRec.getCurrentSublistValue(sublistId, "custcol_scv_ima_pur_price");
        let item_display = curRec.getCurrentSublistValue(sublistId, "item_display");
        let lineuniquekey = curRec.getCurrentSublistValue(sublistId, "lineuniquekey");
        let is_foc = curRec.getCurrentSublistValue(sublistId, "custcol_scv_is_foc");

        if(rate === 0 && !ima_pur_price && !lineuniquekey && is_foc === false) {
            objRes = {
                isValid: false,
                message: commonPurchOrd.getNotifyIMAPurPriceNotFound([item_display])
            }
        }

        return objRes;
    }

    return {
        pageInit,
        fieldChanged,
        postSourcing,
        validateLine,
        // saveRecord: saveRecord
    };
    
});
