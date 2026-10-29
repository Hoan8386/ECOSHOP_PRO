/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/file', 'N/format', 'N/search', '../lib/scv_lib_epxk'],
	
(file, format, search, libEpxk) => {
	
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
		if(obParam.trtype && obParam.trid) {
			let lkTran = search.lookupFields({type: obParam.trtype, id: obParam.trid,
				columns: ['subsidiary', 'custbody_scv_epxk_code', 'custbody_scv_epxk_date', 'custbody_scv_epxk_tran_uuid']});
			if(lkTran.custbody_scv_epxk_tran_uuid) {
				let epxk_code = lkTran.custbody_scv_epxk_code[0]?.value;
				let {eic_econfig, lkEconfig} = libEpxk.getInfoConfig(epxk_code, lkTran.subsidiary[0]?.value);
				
				let urlGetFilePdf = lkEconfig.custrecord_scv_ec_domain + libEpxk.getApiPathGetFilePdf(lkEconfig.custrecord_scv_ec_taxcode, lkTran.custbody_scv_epxk_tran_uuid, libEpxk.convertDateToString(format.parse({type: format.Type.DATE, value: lkTran.custbody_scv_epxk_date})));
				let {resCall} = libEpxk.callApiGet(urlGetFilePdf, libEpxk.makeHeaderBearer(lkEconfig.custrecord_scv_ec_beartoken), lkEconfig, eic_econfig);
				let resultBody = JSON.parse(resCall.body);
				if(resCall.code !== 200) throw resultBody;
				
				context.response.writeFile(createFile(`${lkTran.custbody_scv_epxk_tran_uuid}.pdf`, resultBody.data), true);
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
