/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/file', 'N/format', 'N/search', '../lib/scv_lib_einvoice'],

(file, format, search, libEinv) => {

	/**
	 * Definition of the Suitelet script trigger point.
	 * 
	 * @param {Object} context
	 * @param {ServerRequest} context.request - Encapsulation of the incoming request
	 * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
	 * @Since 2015.2
	 */
	const onRequest = (context) => {
		let obParam = context.request.parameters;
    	if(obParam.id) {
	    	let lkTran = search.lookupFields({type: libEinv.RecordType.EINVOICE_HISTORY, id: obParam.id, columns: ['custrecord_scv_eih_einvoice_form', 'custrecord_scv_eih_sub', 'custrecord_scv_eih_einvoice_date', 'custrecord_scv_eih_transaction_uuid']});
			if(lkTran.custrecord_scv_eih_transaction_uuid) {
				let einvoice_code = lkTran.custrecord_scv_eih_einvoice_form[0]?.value;
				let {eic_econfig, lkEconfig} = libEinv.getInfoConfig(einvoice_code, lkTran.custrecord_scv_eih_sub[0]?.value);
				
				let urlGetFilePdf = lkEconfig.custrecord_scv_ec_domain + libEinv.getApiPathGetFilePdf(lkEconfig.custrecord_scv_ec_taxcode, lkTran.custrecord_scv_eih_transaction_uuid, libEinv.convertDateToString(format.parse({type: format.Type.DATE, value: lkTran.custrecord_scv_eih_einvoice_date})));
				let {resCall} = libEinv.callApiGet(urlGetFilePdf, libEinv.makeHeaderBearer(lkEconfig.custrecord_scv_ec_beartoken), lkEconfig, eic_econfig);
				let resultBody = JSON.parse(resCall.body);
				if(resCall.code !== 200) throw resultBody;
				
				context.response.writeFile(createFile(`${lkTran.custrecord_scv_eih_transaction_uuid}.pdf`, resultBody.data), true);
			}
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
