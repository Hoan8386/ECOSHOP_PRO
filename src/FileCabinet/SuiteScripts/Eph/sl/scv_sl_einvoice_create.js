/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/format', 'N/redirect', 'N/record',
				'../lib/scv_lib_function.js', '../lib/scv_lib_einvoice.js'],

(format, redirect, record, libFunc, libEinv) => {

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
		let typeissueeinvoice = parameters.typeissueeinvoice;
		
		let newRecord = record.load({type: type, id: id});
    	let einvoice_code = newRecord.getValue('custbody_scv_einvoice_code');
    	if(einvoice_code) {
			let {lkEIC, eic_econfig, lkEconfig} = libEinv.getInfoConfig(einvoice_code, newRecord.getValue('subsidiary'));
			
			let nameAudit = 'Create EInvoice';
			let invoice_date = !!typeissueeinvoice ? '' : newRecord.getValue('custbody_scv_invoice_date');
			
			let resCall = null, resultBody;
			let transactionUuid = libEinv.getTransactionUuidCreate(newRecord);
			if('copyissueeinvoice' === typeissueeinvoice) {
				transactionUuid = libEinv.getTransactionUuidReplace(newRecord);
			}
			let old_transaction_uuid = newRecord.getValue('custbody_scv_e_transaction_uuid');
			let ec_taxcode = lkEconfig.custrecord_scv_ec_taxcode;
			let accessToken = lkEconfig.custrecord_scv_ec_beartoken;
			let headers = libEinv.makeHeaderBearer(accessToken);
			
			if(transactionUuid === old_transaction_uuid) {
				({resCall, accessToken, resultBody} = libEinv.getInvoiceInfo(lkEconfig, eic_econfig, headers, ec_taxcode, transactionUuid));
			}
			if(transactionUuid !== old_transaction_uuid || !resCall || resCall.code !== 200) {
				if(!invoice_date) {
					invoice_date = libEinv.getDateNow(7);
				}
				let invoiceCreatedDate = libEinv.convertDateToString(invoice_date);
				let sign_quantity = 1, sign_price = 1;
				let adjust_type = newRecord.getValue('custbody_scv_invoice_adjust_type');
				if(adjust_type === libEinv.AdjustType.DIEU_CHINH_GIAM) {
					sign_quantity = -1;
				} else if(adjust_type === libEinv.AdjustType.DIEU_CHINH_GIAM_GIA) {
					sign_price = -1;
				}
				
				let body = libEinv.getBody(newRecord, lkEconfig, lkEIC, {transactionUuid, sign_quantity, sign_price, invoiceCreatedDate});
				let strBody = JSON.stringify(body);
				try {
					headers = libEinv.makeHeaderBearer(accessToken);
					let urlPost = lkEconfig.custrecord_scv_ec_domain + libEinv.ApiPathEinvoice.TAO_MOI_HOA_DON;
					({resCall, accessToken} = libEinv.callApiPost(urlPost, headers, strBody, lkEconfig, eic_econfig));
					libEinv.saveAudit(nameAudit, strBody, resCall, newRecord.id);
				} catch (e) {
					if(e.name === 'SSS_REQUEST_TIME_EXCEEDED') {
						record.submitFields({type: type, id: id, values: {custbody_scv_e_transaction_uuid: transactionUuid}});
					}
					libEinv.saveAudit(nameAudit, strBody, e, newRecord.id);
					throw e;
				}
				
				resultBody = JSON.parse(resCall.body);
				if(libEinv.CodeResponse.DA_TON_TAI === resultBody.code) {
					headers = libEinv.makeHeaderBearer(accessToken);
					({resCall, resultBody} = libEinv.getInvoiceInfo(lkEconfig, eic_econfig, headers, ec_taxcode, transactionUuid));
					if(resCall.code !== 200) throw resultBody;
				} else if(resCall.code !== 200) throw resultBody;
			}
			
			let data = resultBody.data;
			let lookupCode = data.lookupCode;
			let cqt_code = data.taxAuthorityCode;
			let serial = data.invoiceSymbol;
			let invoice_number = data.invoiceNumber;
			if(data.invoiceCreatedDate) {
				invoice_date = libEinv.convertToDate(data.invoiceCreatedDate);
			}
			
			let date_text = format.format({value: invoice_date, type: format.Type.DATE});
			let objEinvoiceTran = {
				custbody_scv_invoice_serial: serial, custbody_scv_invoice_number: invoice_number,
				custbody_scv_einvoice_reservation_code: lookupCode,
				custbody_scv_invoice_date: date_text, custbody_scv_einvoice_action: libEinv.EinvoiceStatus.HOA_DON_GOC,
				custbody_scv_e_transaction_uuid: transactionUuid,
				custbody_scv_cqt_status: '',
				custbody_scv_cqt_code: cqt_code,
				custbody_scv_cqt_error: '',
				custbody_scv_einvoice_replace_times: newRecord.getValue('custbody_scv_einvoice_replace_times'),
				custbody_scv_einvoice_seri: (newRecord.getText('custbody_scv_invoice_pattern') || '') + serial + invoice_number
			}
			
			let recEIH = record.create({type: 'customrecord_scv_einvoice_history'});
			let fieldEIH = ['custrecord_scv_eih_original_form', 'custrecord_scv_eih_original_serial', 'custrecord_scv_eih_original_number'
				,'custrecord_scv_eih_original_date', 'custrecord_scv_eih_einvoice_form', 'custrecord_scv_eih_einvoice_serial'
				,'custrecord_scv_eih_einvoice_number', 'custrecord_scv_eih_einvoice_date', 'custrecord_scv_eih_einvoice_action'
				,'custrecord_scv_eih_einvoice_memo', 'custrecord_scv_eih_reservation_code'
				,'custrecord_scv_eih_einvoice_reltran', 'name', 'custrecord_scv_eih_transaction_uuid'
				,'custrecord_scv_eih_sub'];
			let dataEIH = [einvoice_code, serial, invoice_number, invoice_date, einvoice_code, serial, invoice_number, invoice_date,
				libEinv.EinvoiceStatus.HOA_DON_GOC, nameAudit, lookupCode, newRecord.id, nameAudit, transactionUuid,
			    newRecord.getValue('subsidiary')];
			libFunc.setValueData(recEIH, fieldEIH, dataEIH);
			recEIH.save();		
			
			let options = {enablesourcing: false, ignoreMandatoryFields: true};
			try {
				record.submitFields({type: type, id: id, values: objEinvoiceTran, options: options});
			} catch (e) {
				log.error('exception', e);
				record.submitFields({type: type, id: id, values: objEinvoiceTran, options: options});
			}
    	}
		
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
	
	return {
		onRequest
	};

});
