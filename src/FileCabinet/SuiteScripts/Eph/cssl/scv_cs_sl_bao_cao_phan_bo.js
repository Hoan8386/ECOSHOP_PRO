
/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  11 Mar 2026         Huy Pham			    Init, create file, Move from MMA, from ms.Thắm (chat)
 */
/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/url'],

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
        function pageInit(scriptContext) {
            if(isRunData()){
                let currRecord = currentRecord.get();
                let lc = currRecord.getLineCount("custpage_sl_result");
                for(let i = 0; i < lc; i++){
                    let level = currRecord.getSublistValue("custpage_sl_result", "custpage_col_level", i);
                    let idrow = "custpage_sl_resultrow" + i;
                    let getRow = document.getElementById(idrow);
                    if(level == "1" || level == "total"){
                        getRow.style.setProperty("font-weight", "bold", "important");
                        let getCell = getRow.querySelectorAll("td");
                        getCell.forEach(function (cell, idx) {
                            let style = level == "1" ? "lightblue" : "lightgreen";
                            cell.style.setProperty("background-color", style, "important");
                        });
                    }
                }
            }
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

        }
        function isRunData() {
            let query = window.location.search.substring(1);
            let vars = query.split("&");
            for (let i = 0; i < vars.length; i++) {
                let pair = vars[i].split("=");
                if(vars[i] == 'isrun=T'){
                    return true;
                }
            }
            return false;
        }


        function onSearchResult(){
            window.onbeforeunload = null;
            debugger;
            let currRecord = currentRecord.get();
            let urlDC = url.resolveScript({
                scriptId: 'customscript_scv_sl_bao_cao_phan_bo',
                deploymentId: 'customdeploy_scv_sl_bao_cao_phan_bo',
                returnExternalUrl: false
            });
            urlDC = urlDC + plusParam(currRecord) + "&isrun=T";
            window.location.replace(urlDC);
        }
        function onExport(){
            window.onbeforeunload = null;
            let currRecord = currentRecord.get();

            let urlDC = url.resolveScript({
                scriptId: 'customscript_scv_sl_bao_cao_phan_bo',
                deploymentId: 'customdeploy_scv_sl_bao_cao_phan_bo',
                returnExternalUrl: false
            });
            urlDC = urlDC + plusParam(currRecord) + "&isexport=T";
            window.open(urlDC);
        }
        function plusParam(currRecord) {
            return '&custpage_rpt_type=' + currRecord.getValue('custpage_rpt_type')
                + '&custpage_subsidiary=' + currRecord.getValue('custpage_subsidiary')
                + '&custpage_fromdt=' + currRecord.getText('custpage_fromdt')
                + '&custpage_todt=' + currRecord.getText('custpage_todt')
                + '&custpage_show_zero=' + (currRecord.getValue('custpage_show_zero') ? "T" : "F");

        }
        return {
            pageInit,
            fieldChanged,
            onSearchResult,
            onExport
        };

    });
