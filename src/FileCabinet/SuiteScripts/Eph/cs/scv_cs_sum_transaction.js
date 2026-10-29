/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['../lib/scv_lib_function.js'],

function(libFunc) {
    
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
    	var currentRecord = scriptContext.currentRecord;
    	var sublistId = scriptContext.sublistId;
    	var fieldId = scriptContext.fieldId;
    	if(fieldId === 'custcol_scv_sumtrans_line_quantity' || fieldId === 'rate') {
    		var quantity = currentRecord.getCurrentSublistValue({sublistId: sublistId, fieldId: 'custcol_scv_sumtrans_line_quantity'});
    		var rate = currentRecord.getCurrentSublistValue({sublistId: sublistId, fieldId: 'rate'});
    		var taxrate = currentRecord.getCurrentSublistValue({sublistId: sublistId, fieldId: 'custcol_scv_sumtrans_line_taxrate'})/100;
    		var line_amount = Math.round(quantity * rate);
    		var line_taxamt = Math.round(line_amount * taxrate);
    		var fields = ['custcol_scv_sumtrans_line_amount', 'custcol_scv_sumtrans_line_taxamt', 'custcol_scv_sumtrans_line_grossamt'];
    		var data = [line_amount, line_taxamt, line_amount + line_taxamt];
    		libFunc.setCurrentSublistValueData(currentRecord, sublistId, fields, data);
    	}
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

    }

    /**
     * Function to be executed after sublist is inserted, removed, or edited.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function sublistChanged(scriptContext) {

    }

    /**
     * Function to be executed after line is selected.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function lineInit(scriptContext) {

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

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        postSourcing: postSourcing,
        sublistChanged: sublistChanged,
        lineInit: lineInit,
        saveRecord: saveRecord
    };
    
});
