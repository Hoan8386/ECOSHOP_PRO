/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/file', 'N/format', 'N/record', 'N/runtime', 'N/search', '../lib/scv_lib_epxk.js'],
	
(file, format, record, runtime, search, libEpxk) => {
	
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
		let einvoice_code = newRecord.getValue('custbody_scv_epxk_code');
		if(einvoice_code) {
			let {lkEIC, eic_econfig, lkEconfig} = libEpxk.getInfoConfig(einvoice_code, newRecord.getValue('subsidiary'));
			
			let adjust_for = newRecord.getValue('custbody_scv_epxk_adjust_for');
			let replace_for = newRecord.getValue('custbody_scv_epxk_replace_for');
			let adjust_type = newRecord.getValue('custbody_scv_epxk_adjust_type') || parameters.adjust_type;
			let sign_quantity = 1, sign_price = 1;
			if(adjust_type === libEpxk.AdjustType.DIEU_CHINH_GIAM) {
				sign_quantity = -1;
			} else if(adjust_type === libEpxk.AdjustType.DIEU_CHINH_GIAM_GIA) {
				sign_price = -1;
			}
			let transactionUuid = `draft_${runtime.getCurrentUser().id}_${libEpxk.getTransactionUuid(newRecord)}_${libEpxk.genUUIDv4()}`;
			let bodyXoa = {
				"taxCode": lkEconfig.custrecord_scv_ec_taxcode,
				"requestId": transactionUuid
			}
			
			let invoice_date = newRecord.getValue('custbody_scv_epxk_date');
			if(!invoice_date) {
				invoice_date = libEpxk.getDateNow(7);
			}
			let invoiceCreatedDate = libEpxk.convertDateToString(invoice_date);
			let body = libEpxk.getBody(newRecord, lkEconfig, lkEIC, {transactionUuid, sign_quantity, sign_price, invoiceCreatedDate});
			body.autoRelease = false;
			body.autoSign = false;
			body.autoSendCQT = false;
			
			if(adjust_for || replace_for) {
				let lkAdj = search.lookupFields({type: 'transaction', id: adjust_for || replace_for, columns: ['custbody_scv_epxk_tran_uuid', 'custbody_scv_epxk_date']});
				body.invoice.refRequestId = lkAdj.custbody_scv_epxk_tran_uuid;
				body.invoice.relatedInvoiceCreatedDate = libEpxk.convertDateToString(format.parse({type: format.Type.DATE, value: lkAdj.custbody_scv_epxk_date}));
			}
			let uuid_draft = newRecord.getValue('custbody_scv_epxk_uuid_draft');
			
			let urlPost = lkEconfig.custrecord_scv_ec_domain;
			if(adjust_for) {
				urlPost = urlPost + libEpxk.ApiPathEinvoice.DIEU_CHINH_HOA_DON;
			} else if(replace_for) {
				urlPost = urlPost + libEpxk.ApiPathEinvoice.THAY_THE_HOA_DON;
			} else {
				urlPost = urlPost + libEpxk.ApiPathEinvoice.TAO_MOI_HOA_DON;
			}
			let urlDelete = lkEconfig.custrecord_scv_ec_domain + libEpxk.ApiPathEinvoice.XOA_HOA_DON;
			
			let headers = libEpxk.makeHeaderBearer(lkEconfig.custrecord_scv_ec_beartoken);
			let strBody = JSON.stringify(body);
			let {resCall, accessToken} = libEpxk.callApiPost(urlPost, headers, strBody, lkEconfig, eic_econfig);
			libEpxk.saveAudit('Preview PXK', strBody, resCall, newRecord.id);
			let resultBody = JSON.parse(resCall.body);
			if(libEpxk.CodeResponse.DA_TON_TAI === resultBody.code) {
				headers = libEpxk.makeHeaderBearer(accessToken);
				libEpxk.callApiPost(urlDelete, headers, JSON.stringify(bodyXoa), lkEconfig, eic_econfig);
				throw resultBody;
				//({resCall, resultBody} = libEpxk.callApiPost(urlPost, headers, strBody, lkEconfig, eic_econfig));
			}
			if(resCall.code !== 200) throw resultBody;
			
			let urlGetFilePdf = lkEconfig.custrecord_scv_ec_domain + libEpxk.getApiPathGetFilePdf(lkEconfig.custrecord_scv_ec_taxcode, transactionUuid, libEpxk.convertDateToString(invoice_date));
			({resCall} = libEpxk.callApiGet(urlGetFilePdf, libEpxk.makeHeaderBearer(accessToken), lkEconfig, eic_econfig));
			libEpxk.callApiPost(urlDelete, headers, JSON.stringify(bodyXoa), lkEconfig, eic_econfig);
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
