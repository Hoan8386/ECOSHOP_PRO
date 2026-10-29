/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/redirect'],

(record, redirect) => {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
	const onRequest = (context) => {
    	let request = context.request;
		let parameters = request.parameters;
    	let id = parameters.trid;
		let type = parameters.trtype;
		
		let recEinvoiceSummaryToUpdate = record.create({type: 'customrecord_scv_einvoice_summary_toupd'});
		recEinvoiceSummaryToUpdate.setValue('name', id);
		recEinvoiceSummaryToUpdate.setValue('custrecord_scv_etu_transaction', id);
		recEinvoiceSummaryToUpdate.save({ignoreMandatoryFields: true});
		
    	redirect.toRecord({
		    type : type, 
		    id : id,
		    parameters: {} 
		});
    }
    
    return {
        onRequest
    };
    
});
