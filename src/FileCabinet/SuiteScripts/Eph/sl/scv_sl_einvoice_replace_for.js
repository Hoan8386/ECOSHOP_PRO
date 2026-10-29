/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/format', 'N/record', 'N/redirect', 'N/search', 'N/ui/serverWidget',
				'../lib/scv_lib_einvoice.js', '../lib/scv_lib_function.js'],

(format, record, redirect, search, serverWidget, libEinv, libFunc) => {

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
		let lkFields = ['custbody_scv_invoice_serial', 'custbody_scv_invoice_number', 'custbody_scv_einvoice_reservation_code',
			'custbody_scv_invoice_date', 'custbody_scv_einvoice_action', 'custbody_scv_invoice_pattern',
			'custbody_scv_einvoice_code', 'custbody_scv_einvoice_replace_for', 'recordtype'
		];
		if (request.method === 'GET') {
			if (!parameters.trid || !parameters.trtype) {
				return;
			}
			let form = createForm(parameters, lkFields);
			response.writePage(form);
		} else if (request.method === 'POST') {
			let id = parameters.custpage_id;
			let type = parameters.custpage_type;
			let orgInvoiceNo = parameters.custpage_invoiceno;
			let invoiceNote = parameters.custpage_replace_reason;
			let org_id = parameters.custpage_org_id;
			
			let newRecord = record.load({type: type, id: id});
			let einvoice_code = newRecord.getValue('custbody_scv_einvoice_code');
			if(einvoice_code) {
				let {lkEIC, eic_econfig, lkEconfig} = libEinv.getInfoConfig(einvoice_code, newRecord.getValue('subsidiary'));
				org_id = org_id.split(';');
				let lkOrg = search.lookupFields({type: org_id[0], id: org_id[1],
					columns: ['custbody_scv_e_transaction_uuid', 'custbody_scv_invoice_date', 'custbody_scv_invoice_serial', 'custbody_scv_invoice_number', 'custbody_scv_einvoice_code.custrecord_scv_eic_type']}
				);
				let original_invoice_date_text = lkOrg.custbody_scv_invoice_date;
				let original_invoice_date = format.parse({type: format.Type.DATE, value: original_invoice_date_text});
				let invoice_date = newRecord.getValue('custbody_scv_invoice_date');
				let adjtype = newRecord.getValue('custbody_scv_invoice_adjust_type');
				
				let nameAudit = 'Replace EInvoice';
				let resCall = null, resultBody;
				
				let transactionUuid = libEinv.getTransactionUuidCreate(newRecord);
				let old_transaction_uuid = newRecord.getValue('custbody_scv_e_transaction_uuid');
				let ec_taxcode = lkEconfig.custrecord_scv_ec_taxcode;
				let accessToken = lkEconfig.custrecord_scv_ec_beartoken;
				let headers = libEinv.makeHeaderBearer(accessToken);
				
				if(transactionUuid === old_transaction_uuid) {
					({resCall, accessToken, resultBody} = libEinv.getInvoiceInfo(lkEconfig, eic_econfig, headers, ec_taxcode, transactionUuid));
					if(resCall.code !== 200) throw resultBody;
				}
				if(transactionUuid !== old_transaction_uuid || !resCall || resCall.code !== 200) {
					let sign_quantity = 1, sign_price = 1;
					if(adjtype === libEinv.AdjustType.DIEU_CHINH_GIAM) {
						sign_quantity = -1;
					} else if(adjtype === libEinv.AdjustType.DIEU_CHINH_GIAM_GIA) {
						sign_price = -1;
					}
					
					if(!invoice_date) {
						invoice_date = libEinv.getDateNow(7);
					}
					let invoiceCreatedDate = libEinv.convertDateToString(invoice_date);
					let body = libEinv.getBody(newRecord, lkEconfig, lkEIC, {transactionUuid, sign_quantity, sign_price, invoiceCreatedDate});
					body.invoice.refRequestId = lkOrg.custbody_scv_e_transaction_uuid;
					body.invoice.relatedInvoiceCreatedDate = libEinv.convertDateToString(original_invoice_date);
					if(!lkOrg.custbody_scv_e_transaction_uuid) {
						body.invoice.relatedInvoiceSymbol = lkOrg.custbody_scv_invoice_serial;
						body.invoice.relatedInvoiceNumber = lkOrg.custbody_scv_invoice_number;
						body.invoice.relatedInvoiceType = Number(lkOrg['custbody_scv_einvoice_code.custrecord_scv_eic_type']);
					}
					body.invoice.invoiceNote = invoiceNote;
					
					let strBody = JSON.stringify(body);
					headers = libEinv.makeHeaderBearer(accessToken);//Do token co the thay doi nen cai lay lai
					try {
						let urlPost = lkEconfig.custrecord_scv_ec_domain + libEinv.ApiPathEinvoice.THAY_THE_HOA_DON;
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
				let einvoice_status = libEinv.EinvoiceStatus.HOA_DON_THAY_THE;
				
				let objEinvoiceTran = {
					custbody_scv_invoice_serial: serial, custbody_scv_invoice_number: invoice_number,
					custbody_scv_einvoice_reservation_code: lookupCode,
					custbody_scv_invoice_date: date_text, custbody_scv_einvoice_action: einvoice_status,
					custbody_scv_e_transaction_uuid: transactionUuid,
					custbody_scv_einvoice_seri: (newRecord.getText('custbody_scv_invoice_pattern') || '') + serial + invoice_number,
					custbody_scv_cqt_code: cqt_code
				}
				
				let original_form = einvoice_code;
				let original_serial = orgInvoiceNo.substring(0,6);
				let original_number = orgInvoiceNo.substring(6);
				
				let recEIH = record.create({type: 'customrecord_scv_einvoice_history'});
				let fieldEIH = ['custrecord_scv_eih_original_form', 'custrecord_scv_eih_original_serial', 'custrecord_scv_eih_original_number',
					'custrecord_scv_eih_original_date', 'custrecord_scv_eih_einvoice_action' ,'custrecord_scv_eih_einvoice_memo',
					'custrecord_scv_eih_einvoice_reltran', 'name', 'custrecord_scv_eih_einvoice_form',
					'custrecord_scv_eih_einvoice_serial', 'custrecord_scv_eih_einvoice_number', 'custrecord_scv_eih_einvoice_date',
					'custrecord_scv_eih_reservation_code', 'custrecord_scv_eih_eadjust_type', 'custrecord_scv_eih_transaction_uuid',
					'custrecord_scv_eih_sub'
				];
				let dataEIH = [original_form, original_serial, original_number,
					original_invoice_date, einvoice_status, invoiceNote,
					id, nameAudit, einvoice_code,
					serial, invoice_number, invoice_date,
					lookupCode, adjtype, transactionUuid,
					newRecord.getValue('subsidiary')
				];
				libFunc.setValueData(recEIH, fieldEIH, dataEIH);
				recEIH.save();
				
				let options = {enablesourcing: false, ignoreMandatoryFields: true};
				try {
					record.submitFields({type: type, id: id, values: objEinvoiceTran, options: options});
				} catch (e) {
					log.error('exception', e);
					record.submitFields({type: type, id: id, values: objEinvoiceTran, options: options});
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
		}
	}
	
	const createForm = (parameters, lkFields) => {
		let id = parameters.trid;
		let type = parameters.trtype;
		
		let lkTranReplaceFor = search.lookupFields({type : 'transaction', id : parameters.replace_for, columns : lkFields});
		let invoice_pattern = lkTranReplaceFor.custbody_scv_invoice_pattern[0]?.text;
		let invoiceNo = lkTranReplaceFor.custbody_scv_invoice_serial + lkTranReplaceFor.custbody_scv_invoice_number;
		let form = serverWidget.createForm({
			title : 'Replace EInvoice'
		});
		
		form.addFieldGroup({
			id : 'fieldgroup_main',
			label : 'Main'
		});
		libEinv.addFieldHiden(form, 'custpage_id', 'Id', id);
		libEinv.addFieldHiden(form, 'custpage_type', 'Record Type', type);
		libEinv.addFieldHiden(form, 'custpage_org_id', 'Org Id', lkTranReplaceFor.recordtype + ';' + parameters.replace_for);
		
		let fInoiceNo = form.addField({
			id : 'custpage_invoiceno',
			type : serverWidget.FieldType.TEXT,
			label : 'Thay thế cho hóa đơn số'
		});
		fInoiceNo.updateDisplayType({
			displayType : serverWidget.FieldDisplayType.DISABLED
		});
		fInoiceNo.defaultValue = invoiceNo;
		fInoiceNo.isMandatory = true;
		
		let fAdjustReason = form.addField({
			id : 'custpage_replace_reason',
			type : serverWidget.FieldType.TEXTAREA,
			label : 'Replace Reason', container: 'fieldgroup_main'
		});
		fAdjustReason.isMandatory = true;
		fAdjustReason.updateDisplayType({
			displayType : serverWidget.FieldDisplayType.NORMAL
		});
		fAdjustReason.defaultValue = 'Hóa đơn thay thế cho hóa đơn điện tử mẫu ' + invoice_pattern + ' ký hiệu ' + lkTranReplaceFor.custbody_scv_invoice_serial + ' số ' +  lkTranReplaceFor.custbody_scv_invoice_number + ' lập ngày ' + lkTranReplaceFor.custbody_scv_invoice_date;
		
		form.addSubmitButton({label : 'Submit'});
		libFunc.addButtonBack(form, id, type);
		
		return form;
	}
	return {
		onRequest
	};

});
