/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/format', 'N/ui/serverWidget', 'N/redirect', 'N/record', 'N/search'
		, '../lib/scv_lib_function.js', '../lib/scv_lib_einvoice.js'],

(format, serverWidget, redirect, record, search, libFunc, libEinv) => {
   
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
    	let response = context.response;
    	let parameters = request.parameters;
    	if(request.method === 'GET') {
			if (!parameters.trid || !parameters.trtype) {
				return;
			}
			let form = createForm(parameters);
    		response.writePage(form);
    	} else if(request.method === 'POST') {
    		let id = parameters.custpage_id;
    		let type = parameters.custpage_type;
    		let cancel_reason = parameters.custpage_cancel_reason;
			let lkFieldsTran = search.lookupFields({type: type, id: id, columns: [
					'custbody_scv_einvoice_code', 'custbody_scv_invoice_serial', 'custbody_scv_invoice_number', 'custbody_scv_invoice_date',
					'custbody_scv_einvoice_reservation_code', 'subsidiary', 'custbody_scv_e_transaction_uuid'
				]
			});
    		
    		let einvoice_code = lkFieldsTran.custbody_scv_einvoice_code[0]?.value;
        	if(einvoice_code) {
				let subsidiary = lkFieldsTran.subsidiary[0]?.value;
				let {eic_econfig, lkEconfig} = libEinv.getInfoConfig(einvoice_code, subsidiary);
				let nameAudit = 'Cancel EInvoice';
				let ec_taxcode = lkEconfig.custrecord_scv_ec_taxcode;
				let access_token = lkEconfig.custrecord_scv_ec_beartoken;
				let headers = libEinv.makeHeaderBearer(access_token);
				let resCall;
				
				let bodyCancel = {
					"taxCode": ec_taxcode,
					"requestId": lkFieldsTran.custbody_scv_e_transaction_uuid,
					"reason": cancel_reason
				}
				let strBody = JSON.stringify(bodyCancel);
				let urlPost = lkEconfig.custrecord_scv_ec_domain + libEinv.ApiPathEinvoice.HUY_HOA_DON;
				({resCall} = libEinv.callApiPost(urlPost, headers, strBody, lkEconfig, eic_econfig));
				libEinv.saveAudit(nameAudit, strBody, resCall, id);
				if(resCall.code !== 200) throw resCall.body;
				
				let original_date = format.parse({type: format.Type.DATE, value: lkFieldsTran.custbody_scv_invoice_date});
				let original_serial = lkFieldsTran.custbody_scv_invoice_serial;
				let original_number = lkFieldsTran.custbody_scv_invoice_number;
				
				let recEIH = record.create({type: libEinv.RecordType.EINVOICE_HISTORY});
				let fieldEIH = ['custrecord_scv_eih_original_form', 'custrecord_scv_eih_original_serial', 'custrecord_scv_eih_original_number',
					'custrecord_scv_eih_original_date', 'custrecord_scv_eih_einvoice_action' ,'custrecord_scv_eih_einvoice_memo',
					'custrecord_scv_eih_einvoice_reltran', 'name', 'custrecord_scv_eih_einvoice_form',
					'custrecord_scv_eih_einvoice_serial', 'custrecord_scv_eih_einvoice_number', 'custrecord_scv_eih_einvoice_date',
					'custrecord_scv_eih_reservation_code' ,'custrecord_scv_eih_sub',
					'custrecord_scv_eih_transaction_uuid', 'custrecord_scv_destroy_reason'
				];
				let dataEIH = [einvoice_code, original_serial, original_number,
					original_date, libEinv.EinvoiceStatus.HOA_DON_XOA_BO, cancel_reason,
					id, nameAudit, einvoice_code,
					original_serial, original_number, original_date,
					lkFieldsTran.custbody_scv_einvoice_reservation_code, subsidiary,
					lkFieldsTran.custbody_scv_e_transaction_uuid, cancel_reason
				];
				libFunc.setValueData(recEIH, fieldEIH, dataEIH);
				recEIH.save();
				
				record.submitFields({type: type, id: id, values: {custbody_scv_einvoice_action: libEinv.EinvoiceStatus.HOA_DON_XOA_BO}});
				
				if(type === 'customsale_scv_sum_transaction') {
			    	redirect.toSuitelet({
					    scriptId: 'customscript_scv_sl_einvoice_ass_aft' ,
					    deploymentId: 'customdeploy_scv_sl_einvoice_ass_aft',
					    parameters: {'trid': id, 'trtype': type} 
					});
		    	} else {
					redirect.toRecord({
					    type : type, 
					    id : id,
					    parameters: {} 
					});
		    	}
        	}
    	}
    }
	
	const createForm = (parameters) => {
		let newFields = ['custbody_scv_invoice_serial', 'custbody_scv_invoice_number', 'custbody_scv_invoice_date'];
		let id = parameters.trid;
		let type = parameters.trtype;
		
		let lkTran = search.lookupFields({type: type, id: id, columns: newFields});
		let invoiceNo = lkTran.custbody_scv_invoice_serial + lkTran.custbody_scv_invoice_number;
		let form = serverWidget.createForm({
			title: 'Cancel EInvoice'
		});
		
		libEinv.addFieldHiden(form, 'custpage_id', 'Id', id);
		libEinv.addFieldHiden(form, 'custpage_type', 'Id', type);
		
		let fMessage = form.addField({
			id : 'custpage_message',
			type : serverWidget.FieldType.TEXT,
			label : 'Message'
		});
		fMessage.updateDisplayType({displayType : serverWidget.FieldDisplayType.INLINE});
		fMessage.defaultValue = 'Bạn có muốn hủy EInvoice số: ' + invoiceNo + ' ngày ' + lkTran.custbody_scv_invoice_date;
		
		let fCancelReason = form.addField({
			id : 'custpage_cancel_reason',
			type : serverWidget.FieldType.TEXTAREA,
			label : 'Cancel Reason'
		});
		fCancelReason.isMandatory = true;
		fCancelReason.updateDisplayType({displayType : serverWidget.FieldDisplayType.NORMAL});
		
		form.addSubmitButton({label: 'Submit'});
		libFunc.addButtonBack(form, id, type);
		
		return form;
	}
	
    return {
        onRequest
    };
    
});