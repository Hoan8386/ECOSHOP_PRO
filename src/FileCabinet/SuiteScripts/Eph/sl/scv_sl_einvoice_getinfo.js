/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/format', 'N/record', 'N/redirect', 'N/search', '../lib/scv_lib_einvoice.js'],
	
(format, record, redirect, search, libEinv) => {
	
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
		let transactionUuid = parameters.transaction_uuid || id;
		
		let {eic_econfig, lkEconfig} = libEinv.getInfoConfig(parameters.einvoice_code, parameters.subsidiary);
		let ec_taxcode = lkEconfig.custrecord_scv_ec_taxcode;
		let accessToken = lkEconfig.custrecord_scv_ec_beartoken;
		let headers = libEinv.makeHeaderBearer(accessToken);
		let {resCall, resultBody} = libEinv.getInvoiceInfo(lkEconfig, eic_econfig, headers, ec_taxcode, transactionUuid);
		libEinv.saveAudit('Get Info', '', resCall, id);
		if(resCall.code !== 200) throw resultBody;
		
		let lkFieldsTran = search.lookupFields({type: type, id: id, columns: ['custbody_scv_invoice_pattern']});
		let invoice_pattern = lkFieldsTran.custbody_scv_invoice_pattern[0].text || '';
		let data = resultBody.data;
		let objHeader = {
			custbody_scv_invoice_serial: data.invoiceSymbol,
			custbody_scv_invoice_number: data.invoiceNumber,
			custbody_scv_einvoice_reservation_code: data.lookupCode,
			custbody_scv_invoice_date: format.format({type: format.Type.DATE, value: libEinv.convertToDate(data.invoiceCreatedDate)}),
			custbody_scv_einvoice_action: libEinv.EinvoiceStatus[data.invoiceStatus],
			custbody_scv_e_transaction_uuid: transactionUuid,
			custbody_scv_einvoice_seri: invoice_pattern + data.invoiceSymbol + data.invoiceNumber,
			custbody_scv_cqt_status: libEinv.TvanStatus[String(data.tvanStatus)],
			custbody_scv_cqt_code: data.taxAuthorityCode
		}
		let options = {enablesourcing: false, ignoreMandatoryFields: true};
		record.submitFields({type: type, id: id, values: objHeader, options: options});
		
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
