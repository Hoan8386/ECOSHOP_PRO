/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([],

function() {
    
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
        defaultValueHeaderToLine(scriptContext);
    }

    function postSourcing(scriptContext) {
        defaultValueHeaderToLineItem(scriptContext);
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

    const defaultValueHeaderToLine = (scriptContext) => {
        let curRec = scriptContext.currentRecord;
        let sublistId = scriptContext.sublistId;
        let fieldId = scriptContext.fieldId;

        let fields = ['memo', 'department', 'location', 'class'];
        
        if(
            (sublistId === 'expense' && fieldId === 'account') ||
            (sublistId === 'other' && fieldId === 'account') ||
            (sublistId === 'cashback' && fieldId === 'account')
        ) {
            let account = curRec.getCurrentSublistValue(sublistId, fieldId);
            if(!account) return;
            fields.forEach((field) => {
                let value = curRec.getValue(field);
                curRec.setCurrentSublistValue(sublistId, field, value);
            });
        }
    }

    const defaultValueHeaderToLineItem = (scriptContext) => {
        let curRec = scriptContext.currentRecord;
        let sublistId = scriptContext.sublistId;
        let fieldId = scriptContext.fieldId;

        let headerFields = ['memo', 'department', 'location', 'class'];
        let sublistFields = ['description', 'department', 'location', 'class'];
        
        if(sublistId === 'item' && fieldId === 'item') {
            let item = curRec.getCurrentSublistValue(sublistId, fieldId);
            if(!item) return;
            for(let i = 0; i < headerFields.length; i++) {
                let value = curRec.getValue(headerFields[i]);
                curRec.setCurrentSublistValue(sublistId, sublistFields[i], value);
            }
        }
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        postSourcing: postSourcing,
        // saveRecord: saveRecord
    };
    
});
