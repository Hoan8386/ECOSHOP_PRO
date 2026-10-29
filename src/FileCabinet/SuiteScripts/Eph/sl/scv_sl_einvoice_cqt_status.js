/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/redirect', 'N/search', '../lib/scv_lib_einvoice.js'],

(record, redirect, search, libEinv) => {

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
		let body_cqt_status = parameters.cqt_status;
		
		let {eic_econfig, lkEconfig} = libEinv.getInfoConfig(parameters.einvoice_code, parameters.subsidiary);
		let objValue = {
			custrecord_scv_eih_cqt_status: 	'',
			custrecord_scv_eih_cqt_code: ''
		}
		
		let ec_taxcode = lkEconfig.custrecord_scv_ec_taxcode;
		let accessToken = lkEconfig.custrecord_scv_ec_beartoken;
		let headers = libEinv.makeHeaderBearer(accessToken);
		let {resCall, resultBody} = libEinv.getInvoiceInfo(lkEconfig, eic_econfig, headers, ec_taxcode, transactionUuid);
		if(resCall.code !== 200) throw resultBody;
		let data = resultBody.data;
		objValue.custrecord_scv_eih_cqt_code = data.taxAuthorityCode;
		objValue.custrecord_scv_eih_cqt_status = data.tvanStatus
		
		let objHeader = {
			custbody_scv_cqt_status: libEinv.TvanStatus[String(data.tvanStatus)],
			custbody_scv_cqt_code: data.taxAuthorityCode
		}
		let options = {enablesourcing: false, ignoreMandatoryFields: true};
		
		let filters = [["custrecord_scv_eih_einvoice_reltran", "anyof", id], 'and', ['custrecord_scv_eih_transaction_uuid', 'is', transactionUuid]];
		let columns = [{name: 'internalid'}, {name:'custrecord_scv_eih_transaction_uuid'}];
		let s = search.create({
			type: libEinv.RecordType.EINVOICE_HISTORY,
			filters: filters,
			columns: columns
		});
		let r = s.run().getRange(0,100);
		let lR = r.length;
		if(lR > 0) {
			record.submitFields({type: libEinv.RecordType.EINVOICE_HISTORY, id: r[0].id, values: objValue, options: options});
		}
		
		if(objHeader.custbody_scv_cqt_status !== body_cqt_status) {
			record.submitFields({type: type, id: id, values: objHeader, options: options});
		}
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
