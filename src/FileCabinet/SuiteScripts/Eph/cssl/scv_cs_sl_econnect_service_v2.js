/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([
    '../cons/scv_cons_il_intaction.js',
    '../cons/scv_cons_il_intmap.js',
],

function(
    constIlIntAction,
    constIlIntMap,
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
        let curRec = scriptContext.currentRecord;
        let sublistId = scriptContext.sublistId;
        let fieldId = scriptContext.fieldId;

        fieldChanged_RecordType(curRec, sublistId, fieldId);
        fieldChanged_FetchPage(curRec, sublistId, fieldId);
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
        let curRec = scriptContext.currentRecord;
        let objValidate = validateSubmitData(curRec);

        if(objValidate.isValid === false) {
            alert(objValidate.message);
            return false;
        }
        
        return true;
    }

    const validateSubmitData = (curRec) => {
        let sl = "custpage_sl_result";
        let itgType = curRec.getValue("custpage_rectype");
        let objIlIntMap = constIlIntMap.getDataIlIntMapById(itgType);
        let totalLine = curRec.getLineCount(sl);
        
        let isValid = false;
        for(let i = 0; i < totalLine; i++) {
            let select = curRec.getSublistValue(sl, "select", i);
            let issync = curRec.getSublistValue(sl, "issync", i);
            
            if(select === true && issync === true && objIlIntMap?.custrecord_scv_il_intmap_action == constIlIntAction.Records.Create.ID) {
                return {isValid: false, message: "This record does not trigger an API call to update the IL system."};
            }

            if(select === true) {
                isValid = true;
            }
        }

        if(isValid === true) {
            return { isValid, message: "Success." };
        }

        return {isValid, message: "Please select at least one line to submit data!"};
    }

    const fieldChanged_RecordType = (curRec, sublistId, fieldId) => {
        if(!sublistId && fieldId === "custpage_rectype") {
            let recType = curRec.getValue(fieldId);
            if(!recType) return;

            window.onbeforeunload = null;
            let curScriptUrl = _scvForm.currentScript.url;
            let params = _scvForm.getParameter();

            let urlDC = curScriptUrl + `&custpage_rectype=${params.custpage_rectype}&custpage_page=1&isrun=T`;
            window.location.replace(urlDC);
        }
    }

    const fieldChanged_FetchPage = (curRec, sublistId, fieldId) => {
        if(!sublistId && fieldId === "custpage_page") {
            let page = curRec.getValue(fieldId);
            if(!page) return;

            window.onbeforeunload = null;
            let curScriptUrl = _scvForm.currentScript.url;
            let params = _scvForm.getParameter();

            let urlDC = curScriptUrl + `&custpage_rectype=${params.custpage_rectype}&custpage_page=${page}&isrun=T`;
            window.location.replace(urlDC);
        }
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        saveRecord: saveRecord
    };
    
});
