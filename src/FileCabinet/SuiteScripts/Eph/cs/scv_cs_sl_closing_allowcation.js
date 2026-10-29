/**
 * Nội dung:
 * =======================================================================================
 *  Date                Author                  Description
 * 07 Jan 2025          Huy Pham                Init, create file, Move Chức năng Allocation từ CPL qua Ladophar, from ms.Chín(https://app.clickup.com/t/86cxjmg3p)
 */
/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/url'],
    
    function (ccr, url) {
        
        function refresh() {
            window.location.reload();
        }
        
        function searchReport() {
            let currentRecord = ccr.get();
            let urlDC = url.resolveScript({
                scriptId: 'customscript_scv_sl_closing_allowcation',
                deploymentId: 'customdeploy_scv_sl_closing_allowcation',
                returnExternalUrl: false
            });
            urlDC = urlDC + plusParam(currentRecord);
            window.location.replace(urlDC);
        }
        
        function plusParam(currentRecord) {
            return '&custpage_template=' + currentRecord.getValue('custpage_template')
                + '&custpage_subsidiary=' + currentRecord.getValue('custpage_subsidiary')
                + '&custpage_trandate=' + document.getElementById("custpage_trandate").value;
        }
        
        function fieldChanged(scriptContext) {
        
        }
        
        
        return {
            refresh,
            searchReport,
            fieldChanged
        };
        
    });
