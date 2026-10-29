/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/redirect', 'N/search'],

(record, redirect, search) => {
   
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
		let lkFieldsTransaction = search.lookupFields({type: type, id: id, columns: ['custbody_scv_invoice_pattern', 'custbody_scv_einvoice_code', 'custbody_scv_invoice_number', 'custbody_scv_invoice_date']});
		let einvoice_code = lkFieldsTransaction.custbody_scv_einvoice_code[0]?.value;
		let invoice_number = lkFieldsTransaction.custbody_scv_invoice_number;
		let invoice_date = lkFieldsTransaction.custbody_scv_invoice_date;
		if(einvoice_code && !invoice_number && !invoice_date) {
			let c = ['internalid', 'custrecord_scv_eih_einvoice_serial', 'custrecord_scv_eih_einvoice_number', 'custrecord_scv_eih_reservation_code', 'custrecord_scv_eih_transaction_id', 'custrecord_scv_eih_einvoice_date',
				'custrecord_scv_eih_einvoice_action', 'custrecord_scv_eih_transaction_uuid'
			];
			let s = search.create({
				type: 'customrecord_scv_einvoice_history',
				filters: [['custrecord_scv_eih_einvoice_reltran', 'anyof', id], 'and',
				          ['custrecord_scv_eih_einvoice_action', 'anyof', 1]],
				columns: c
			});
			let r = s.run().getRange(0,1);
			if(r.length > 0) {
				let recEH = r[0];
				let objEinvoiceTran = {
					custbody_scv_invoice_serial: recEH.getValue('custrecord_scv_eih_einvoice_serial'),
					custbody_scv_invoice_number: recEH.getValue('custrecord_scv_eih_einvoice_number'),
					custbody_scv_einvoice_reservation_code: recEH.getValue('custrecord_scv_eih_reservation_code'),
					custbody_scv_einvoice_transactionid: recEH.getValue('custrecord_scv_eih_transaction_id'),
					custbody_scv_invoice_date: recEH.getText('custrecord_scv_eih_einvoice_date'),
					custbody_scv_einvoice_action: recEH.getValue('custrecord_scv_eih_einvoice_action'),
					custbody_scv_e_transaction_uuid: recEH.getValue('custrecord_scv_eih_transaction_uuid'),
					custbody_scv_einvoice_seri: (lkFieldsTransaction.custbody_scv_invoice_pattern[0]?.value || '')
						+ recEH.getValue('custrecord_scv_eih_einvoice_serial') + recEH.getValue('custrecord_scv_eih_einvoice_number')
				}
				let options = {enablesourcing: false, ignoreMandatoryFields: true};
				record.submitFields({type: type, id: id, values: objEinvoiceTran, options: options});
			}
		}
		redirect.toRecord({type : type, id : id});
    }

    return {
        onRequest
    };
    
});
