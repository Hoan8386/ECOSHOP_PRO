/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/file', 'N/format', 'N/record', 'N/runtime', 'N/search', '../lib/scv_lib_einvoice.js'],

(file, format, record, runtime, search, libEinv) => {
	
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
    	let newRecord = record.load({type: parameters.trtype, id: parameters.trid});
    	let einvoice_code = newRecord.getValue('custbody_scv_einvoice_code');
    	if(einvoice_code) {
	    	let {lkEIC, eic_econfig, lkEconfig} = libEinv.getInfoConfig(einvoice_code, newRecord.getValue('subsidiary'));
			
			let adjust_for = newRecord.getValue('custbody_scv_invoice_adjust_for');
			let replace_for = newRecord.getValue('custbody_scv_einvoice_replace_for');
			let adjust_type = newRecord.getValue('custbody_scv_invoice_adjust_type') || parameters.adjust_type;
			let sign_quantity = 1, sign_price = 1;
			if(adjust_type === libEinv.AdjustType.DIEU_CHINH_GIAM) {
				sign_quantity = -1;
			} else if(adjust_type === libEinv.AdjustType.DIEU_CHINH_GIAM_GIA) {
				sign_price = -1;
			}
			let transactionUuid = `draft_${runtime.getCurrentUser().id}_${libEinv.getTransactionUuid(newRecord)}_${libEinv.genUUIDv4()}`;
			let bodyXoa = {
				"taxCode": lkEconfig.custrecord_scv_ec_taxcode,
				"requestId": transactionUuid
			}
			
			let invoice_date = newRecord.getValue('custbody_scv_invoice_date');
			if(!invoice_date) {
				invoice_date = libEinv.getDateNow(7);
			}
			let invoiceCreatedDate = libEinv.convertDateToString(invoice_date);
			let body = libEinv.getBody(newRecord, lkEconfig, lkEIC, {transactionUuid, sign_quantity, sign_price, invoiceCreatedDate});
			body.autoRelease = false;
			body.autoSign = false;
			body.autoSendCQT = false;
			
			if(adjust_for || replace_for) {
				let lkOrg = search.lookupFields({type: 'transaction', id: adjust_for || replace_for,
					columns: ['custbody_scv_e_transaction_uuid', 'custbody_scv_invoice_date', 'custbody_scv_invoice_serial', 'custbody_scv_invoice_number', 'custbody_scv_einvoice_code.custrecord_scv_eic_type']}
				);
				body.invoice.refRequestId = lkOrg.custbody_scv_e_transaction_uuid;
				body.invoice.relatedInvoiceCreatedDate = libEinv.convertDateToString(format.parse({type: format.Type.DATE, value: lkOrg.custbody_scv_invoice_date}));
				if(!lkOrg.custbody_scv_e_transaction_uuid) {
					body.invoice.relatedInvoiceSymbol = lkOrg.custbody_scv_invoice_serial;
					body.invoice.relatedInvoiceNumber = lkOrg.custbody_scv_invoice_number;
					body.invoice.relatedInvoiceType = Number(lkOrg['custbody_scv_einvoice_code.custrecord_scv_eic_type']);
					if(adjust_for) {
						for(let objProduct of body.invoice.products) {
							objProduct.isAdjustment = 0;
						}
					}
				}
			}
			//let uuid_draft = newRecord.getValue('custbody_scv_einvoice_uuid_draft');
			
			let urlPost = lkEconfig.custrecord_scv_ec_domain;
			if(adjust_for) {
				urlPost = urlPost + libEinv.ApiPathEinvoice.DIEU_CHINH_HOA_DON;
			} else if(replace_for) {
				urlPost = urlPost + libEinv.ApiPathEinvoice.THAY_THE_HOA_DON;
			} else {
				urlPost = urlPost + libEinv.ApiPathEinvoice.TAO_MOI_HOA_DON;
			}
			let urlDelete = lkEconfig.custrecord_scv_ec_domain + libEinv.ApiPathEinvoice.XOA_HOA_DON;
			
			let headers = libEinv.makeHeaderBearer(lkEconfig.custrecord_scv_ec_beartoken);
			let strBody = JSON.stringify(body);
			let {resCall, accessToken} = libEinv.callApiPost(urlPost, headers, strBody, lkEconfig, eic_econfig);
			libEinv.saveAudit('Preview', strBody, resCall, newRecord.id);
			let resultBody = JSON.parse(resCall.body);
			if(libEinv.CodeResponse.DA_TON_TAI === resultBody.code) {
				headers = libEinv.makeHeaderBearer(accessToken);
				libEinv.callApiPost(urlDelete, headers, JSON.stringify(bodyXoa), lkEconfig, eic_econfig);
				throw resultBody;
				//({resCall, resultBody} = libEinv.callApiPost(urlPost, headers, strBody, lkEconfig, eic_econfig));
			}
			if(resCall.code !== 200) throw resultBody;
			
			let urlGetFilePdf = lkEconfig.custrecord_scv_ec_domain + libEinv.getApiPathGetFilePdf(lkEconfig.custrecord_scv_ec_taxcode, transactionUuid, libEinv.convertDateToString(invoice_date));
			({resCall} = libEinv.callApiGet(urlGetFilePdf, libEinv.makeHeaderBearer(accessToken), lkEconfig, eic_econfig));
			libEinv.callApiPost(urlDelete, headers, JSON.stringify(bodyXoa), lkEconfig, eic_econfig);
			resultBody = JSON.parse(resCall.body);
			if(resCall.code !== 200) throw resultBody;
			context.response.writeFile(createFile('preview.pdf', resultBody.data), true);
			
    	}
    }
    
	const createFile = (fileName, contents) => {
		return file.create({
			name: fileName,
			fileType: file.Type.PDF,
			contents: contents,
			encoding: file.Encoding.UTF8,
			folder: -4,
			isOnline: true
		});
	}
	
    return {
        onRequest
    };
    
});
