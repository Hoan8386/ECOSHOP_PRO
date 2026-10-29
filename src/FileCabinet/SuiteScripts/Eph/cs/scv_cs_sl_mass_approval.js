/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/url'],
    
    function (currentRecord, url) {
        
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
            let curRec = scriptContext.currentRecord;
            let lc = curRec.getLineCount("custpage_sl_result");
            let result_txt = document.querySelector("#custpage_sl_resulttxt");
            result_txt.innerHTML += " (" + changeCurrency(lc) + ")";
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
            let action = curRec.getText('custpage_action');
            if (confirm("Are you sure you want to " + action + " these documents?")) {
                let sl = "custpage_sl_result";
                let lc = curRec.getLineCount(sl);
                for (let i = 0; i < lc; i++) {
                    let chk = curRec.getSublistValue(sl, "custpage_col_chk", i);
                    if (chk === true || chk === "T") return true;
                }
                alert("Vui lòng chọn ít nhất 1 line!");
                return false;
            } else {
                return false;
            }
        }
        
        const onSearchResult = () => {
            window.onbeforeunload = null;
            let currRecord = currentRecord.get();
            let params = getParams(currRecord);
            params.isrun = 'T';
            let urlDC = url.resolveScript({
                scriptId: 'customscript_scv_sl_mass_approval',
                deploymentId: 'customdeploy_scv_sl_mass_approval',
                returnExternalUrl: false,
                params: params
            });
            window.location.replace(urlDC);
        }
        
        const getParams = (currRecord) => {
            return {
                custpage_action: currRecord.getValue('custpage_action'),
                whasetupid: currRecord.getValue('custpage_wha_setup'),
                custpage_subsidiary: (currRecord.getValue('custpage_subsidiary') || '').join(','),
                custpage_requestor: currRecord.getValue('custpage_requestor') || '',
                custpage_department: currRecord.getValue('custpage_department') || '',
                custpage_fromdt: currRecord.getText('custpage_fromdt') || '',
                custpage_todt: currRecord.getText('custpage_todt') || '',
                custpage_fromduedate: currRecord.getText('custpage_fromduedate') || '',
                custpage_toduedate: currRecord.getText('custpage_toduedate') || '',
                custpage_type: currRecord.getValue('custpage_type') || '',
                custpage_document_number: currRecord.getValue('custpage_document_number') || '',
                custpage_memo: currRecord.getValue('custpage_memo') || '',
                custpage_amount: currRecord.getValue('custpage_amount') || '',
                custpage_location: currRecord.getValue('custpage_location') || '',
                custpage_approval_status: currRecord.getValue('custpage_approval_status') || '',
                custpage_vendor: currRecord.getValue('custpage_vendor') || '',
            }
        };
        
        const onMark = (_mark) => {
            let sl = "custpage_sl_result";
            let curRec = currentRecord.get();
            let lc = curRec.getLineCount(sl);
            for (let i = 0; i < lc; i++) {
                curRec.selectLine(sl, i);
                curRec.setCurrentSublistValue(sl, "custpage_col_chk", _mark === "markall", true);
                curRec.commitLine(sl);
            }
        }
        
        const changeCurrency = (number) => {
            let parts = number.toString().split(".");
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            return parts.join(",");
        }

        const onRefresh = () => {
            window.onbeforeunload = null;
            window.location.reload();
        }
        
        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            saveRecord: saveRecord,
            onMark: onMark,
            onSearchResult: onSearchResult,
            onRefresh: onRefresh
        };
        
    });
