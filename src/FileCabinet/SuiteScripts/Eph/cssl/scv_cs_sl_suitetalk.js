/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([
    'N/currentRecord',
],
function(
    currentRecord,
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
    const REST_API_BROWSER = "https://system.netsuite.com/help/helpcenter/en_US/APIs/REST_API_Browser/record/v1/2023.1/index.html";
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

    const onSearchResult = () => {
        window.onbeforeunload = null;
        let curRec = currentRecord.get();

        let rectype = curRec.getValue("custpage_rectype");
        if(!rectype) {
            return alert("Please enter the Record Type to perform this function!");
        }

        let host = window.location.host;
        let isExternalUrl = host.includes("extforms.netsuite.com");
        
        let urlSearch = isExternalUrl ? curRec.getValue("custpage_exturl") : curRec.getValue("custpage_cururl");
        let urlDC = urlSearch + `&custpage_rectype=${rectype}&isrun=T`;
        window.location.replace(urlDC);
    }

    const onViewDocuments = () => {
        window.onbeforeunload = null;

        window.open(REST_API_BROWSER);
    }

    const onExtAccessUrl = () => {
        window.onbeforeunload = null;
        let curRec = currentRecord.get();
        
        let extAccessUrl = curRec.getValue("custpage_exturl");
        window.open(extAccessUrl);
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        onSearchResult: onSearchResult,
        onViewDocuments: onViewDocuments,
        onExtAccessUrl: onExtAccessUrl
        // saveRecord: saveRecord
    };
    
});
