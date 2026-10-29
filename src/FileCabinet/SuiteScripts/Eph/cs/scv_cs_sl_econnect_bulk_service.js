/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([
    'N/currentRecord', 'N/url'
],

function(currentRecord, url) {
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */

    const CUR_SCRIPT = {
        ID: 'customscript_scv_sl_econnect_bulkservice',
        DEPLOYID_UI: 'customdeploy_scv_sl_econnect_bulkservice'
    };

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

        onChangeRecordType(curRec, sublistId, fieldId);
        onChangeFetchPage(curRec, sublistId, fieldId);
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
        return true;
    }
    
    const markUnmarkTop10Rows = () => {
        const btnElement = document.getElementById("custpage_btn_mark_unmark");
        let isMark = btnElement.getAttribute("data-scv-ismark");
        
        isMark = (!isMark || isMark === "T") ? true : false;
        let curRec = currentRecord.get();
        let sl = "custpage_sl_result";
        let lc = curRec.getLineCount(sl);
        lc = lc > 10 ? 10 : lc;
        
        for(let i = 0; i < lc; i++) {
            curRec.selectLine(sl, i);
            curRec.setCurrentSublistValue(sl, "custpage_col_select", isMark);
            curRec.commitLine(sl);
        }
        btnElement.setAttribute("data-scv-ismark", isMark ? "F" : "T");
        btnElement.value = isMark ? "UnMark Top10 Rows" : "Mark Top10 Rows";
    }

    const displayRowIsSync = () => {
        let curRec = currentRecord.get();
        let sl = "custpage_sl_result";

        let lc = curRec.getLineCount(sl);
        for(let i = 0; i < lc; i++) {
            let isSync = curRec.getSublistValue(sl, "custpage_col_issync", i);
            if(isSync === false || isSync === "F") {
                let rowElement = document.getElementById("custpage_sl_resultrow" + i);
                rowElement.style.display = "none";
            }
        }
    }

    const onChangeRecordType = (curRec, sublistId, fieldId) => {
        if(!sublistId && fieldId === "custpage_rectype") {
            let recType = curRec.getValue(fieldId);
            if(!recType) return;

            window.onbeforeunload = null;
            let urlSearch = url.resolveScript({
                scriptId: CUR_SCRIPT.ID,
                deploymentId: CUR_SCRIPT.DEPLOYID_UI,
                returnExternalUrl: false
            });
            let urlDC = urlSearch + plusParam(curRec, 1) + "&isrun=T";
            window.location.replace(urlDC);
        }
    }

    const onChangeFetchPage = (curRec, sublistId, fieldId) => {
        if(!sublistId && fieldId === "custpage_page") {
            let page = curRec.getValue(fieldId);
            if(!page) return;

            window.onbeforeunload = null;
            let urlSearch = url.resolveScript({
                scriptId: CUR_SCRIPT.ID,
                deploymentId: CUR_SCRIPT.DEPLOYID_UI,
                returnExternalUrl: false
            });
            let urlDC = urlSearch + plusParam(curRec, page) + "&isrun=T";
            window.location.replace(urlDC);
        }
    }

    function getTotalLineSelected(curRec, sublist) {
        let total = 0;
        let lc = curRec.getLineCount(sublist);
        for(let i = 0; i < lc; i++){
            let chk = curRec.getSublistValue(sublist, "custpage_col_select", i);
            if(chk == true || chk == "T") {
                total++;
            }
        }
        return total;
	}

    function plusParam(currRecord, page) {
        let rectype = currRecord.getValue('custpage_rectype');
        let urlParams = '&custpage_rectype=' + rectype + `&custpage_page=` + page;
        return urlParams;
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        // saveRecord: saveRecord,
    };
    
});
