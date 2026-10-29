define([
    'N/runtime', 'N/search', 'N/format', 'N/https', 'N/record',
	'N/file', 'N/query',
    '../lib/scv_lib_function.js',
    '../olib/crypto-js.js',
	'../cons/scv_cons_format.js',
	'../cons/scv_cons_itemtype.js',
	'../cons/scv_cons_il_transactionstatus.js',
], (
    runtime, search, format, https, record, 
	file, query,
    lbf, CryptoJS,
	constFormat,
	constItemType,
	constILTranstatus
) => {
    
    const SECRET_PASSPHRASE = 'SCV@ECONNECT';
	const ECO_DATE_REQUIRED = "1900-01-01T00:00:00Z";

	const ApprStatusStandard = {
		Approved: { ID: "2", NAME: "Approved" },
	};

	const OrderStatus = {
		PendingApproval: { ID: "A", NAME: "Pending Approval" },
	};

	const LocationType = {
		Warehouse: {ID: 2, NAME: "Warehouse"},
	};

	const TransactionLineType = {
		SHIPPING: "SHIPPING",
		RECEIVING: "RECEIVING",
		ITEM: "ITEM"
	};

	const FIELD_MAX_NUMBER = 1000000;

	// TODO: currency
	const createCurrency = (objCfgEconnect, data, recType) => {
		let recordName = "Currency";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/general/currency`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	
	// TODO: country
	const createCountry = (objCfgEconnect, data, recType) => {
        let recordName = "Country";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};

		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/general/country`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }

	// TODO: icoterm
	const createIcoTerm = (objCfgEconnect, data, recType) => {
		let recordName = "Inco Term";
		let fileName = data.code + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.code,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/general/incoterm`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	// TODO: payment method
	const createPaymentMethod = (objCfgEconnect, data, recType) => {
        let recordName = "Payment Method";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/general/paymentMethod`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }
	const updatePaymentMethod = (objCfgEconnect, data, recType) => {
		let recordName = "Payment Method";
		let fileName = data.name + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/general/paymentMethod`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	// TODO: term
	const createTerm = (objCfgEconnect, data, recType) => {
        let recordName = "Term";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/general/terms`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }

	const createRegion = (objCfgEconnect, data, recType) => {
		let recordName = "Region";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/general/region`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const updateRegion = (objCfgEconnect, data, recType) => {
		let recordName = "Region";
		let fileName = data.name + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/general/region`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const createBusinessCoverage = (objCfgEconnect, data, recType) => {
		let recordName = "Business Coverage";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/companyProfile/businessCoverage`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const updateBusinessCoverage = (objCfgEconnect, data, recType) => {
		let recordName = "Business Coverage";
		let fileName = data.name + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/companyProfile/businessCoverage`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const createUnitsType = (objCfgEconnect, data, recType) => {
        let recordName = "Units Type";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/uom/unitType`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }

	const updateUnitsType = (objCfgEconnect, data, recType) => {
        let recordName = "Units Type";
		let fileName = data.name + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/uom/unitType`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }

	const createUnitsTypeUOM = (objCfgEconnect, data, recType) => {
		let recordName = "Units Type (UOM)";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/uom/unitTypeUOM`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const updateUnitsTypeUOM = (objCfgEconnect, data, recType) => {
		let recordName = "Units Type (UOM)";
		let fileName = data.name + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/uom/unitTypeUOM`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const createCostingMethod = (objCfgEconnect, data, recType) => {
        let recordName = "Costing Method";
		let fileName = data.description + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.description,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/postingAndFinance/costingMethod`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }

	const createSupplyReplenishmentType = (objCfgEconnect, data, recType) => {
		let recordName = "Replenishment Type";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/replenishmentMethod`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const createItemBrand = (objCfgEconnect, data, recType) => {
        let recordName = "Item Brand";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/itemBrand`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }
	const updateItemBrand = (objCfgEconnect, data, recType) => {
        let recordName = "Item Brand";
		let fileName = data.name + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/itemBrand`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }

	const createItemBuyerGroup = (objCfgEconnect, data, recType) => {
        let recordName = "Item Buyer Group";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/itemBuyerGroup`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }

	const updateItemBuyerGroup = (objCfgEconnect, data, recType) => {
        let recordName = "Item Buyer Group";
		let fileName = data.name + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/itemBuyerGroup`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }

	const createItemTradeType = (objCfgEconnect, data, recType) => {
        let recordName = "Trade Type";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/tradeType`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }
	const updateItemTradeType = (objCfgEconnect, data, recType) => {
        let recordName = "Trade Type";
		let fileName = data.name + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/tradeType`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }

	const createItemOriginType = (objCfgEconnect, data, recType) => {
        let recordName = "Origin Type";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/originType`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }
	const updateItemOriginType = (objCfgEconnect, data, recType) => {
        let recordName = "Origin Type";
		let fileName = data.name + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/originType`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }

	const createItemDisplayMethod = (objCfgEconnect, data, recType) => {
        let recordName = "Display Method";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/displayMethod`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }
	const updateItemDisplayMethod = (objCfgEconnect, data, recType) => {
        let recordName = "Display Method";
		let fileName = data.name + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/displayMethod`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }

	const createItemRQStatus = (objCfgEconnect, data, recType) => {
        let recordName = "RQ Status";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/rQStatus`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }
	const updateItemRQStatus = (objCfgEconnect, data, recType) => {
        let recordName = "RQ Status";
		let fileName = data.name + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/rQStatus`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }

	const createItemWarehouseGroup = (objCfgEconnect, data, recType) => {
        let recordName = "Warehouse Group";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/warehouseGroup`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }

	const updateItemWarehouseGroup = (objCfgEconnect, data, recType) => {
        let recordName = "Warehouse Group";
		let fileName = data.name + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/warehouseGroup`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }

	const createItemProductCluster = (objCfgEconnect, data, recType) => {
        let recordName = "Product Cluster";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/productCluster`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }

	const updateItemProductCluster = (objCfgEconnect, data, recType) => {
        let recordName = "Product Cluster";
		let fileName = data.name + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/productCluster`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }

	const createItemPackCode = (objCfgEconnect, data, recType) => {
        let recordName = "Pack Code";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/packCode`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }
	const updateItemPackCode = (objCfgEconnect, data, recType) => {
        let recordName = "Pack Code";
		let fileName = data.name + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/packCode`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }

	const createItemAllocationType = (objCfgEconnect, data, recType) => {
        let recordName = "Allocation Type";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/allocationType`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }
	const updateItemAllocationType = (objCfgEconnect, data, recType) => {
        let recordName = "Allocation Type";
		let fileName = data.name + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/allocationType`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }
	
	const createItemDateControl = (objCfgEconnect, data, recType) => {
        let recordName = "Date Control";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/dateControl`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }
	const updateItemDateControl = (objCfgEconnect, data, recType) => {
        let recordName = "Date Control";
		let fileName = data.name + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/dateControl`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }

	const createItemStatus = (objCfgEconnect, data, recType) => {
        let recordName = "Item Status";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/itemStatus`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }
	const updateItemStatus = (objCfgEconnect, data, recType) => {
        let recordName = "Item Status";
		let fileName = data.name + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/itemStatus`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }

	const createItemSpecHandlingIndicator = (objCfgEconnect, data, recType) => {
        let recordName = "Special Handling Indicator";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/specialHandlingIndicator`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }
	const updateItemSpecHandlingIndicator = (objCfgEconnect, data, recType) => {
        let recordName = "Special Handling Indicator";
		let fileName = data.name + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/specialHandlingIndicator`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }

	const createItemProductEntity = (objCfgEconnect, data, recType) => {
        let recordName = "Product Entity";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/productEntity`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }
	const updateItemProductEntity  = (objCfgEconnect, data, recType) => {
		let recordName = "Product Entity";
		let fileName = data.name + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/productEntity`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const createItemHSCode = (objCfgEconnect, data, recType) => {
        let recordName = "HS Code";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/hSCode`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }

	const updateItemHSCode = (objCfgEconnect, data, recType) => {
        let recordName = "HS Code";
		let fileName = data.name + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/hSCode`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }

	const createSalesQtyCombo = (objCfgEconnect, data, recType) => {
		let recordName = "Sales Qty Combo";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/itemSalesQtyCombo`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const updateSalesQtyCombo = (objCfgEconnect, data, recType) => {
		let recordName = "Sales Qty Combo";
		let fileName = data.name + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/itemSalesQtyCombo`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const createLocationSystem = (objCfgEconnect, data, recType) => {
		let recordName = "Location System";
		let fileName = data.externalId + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/location/locationSystem`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	
	const updateLocationSystem = (objCfgEconnect, data, recType) => {
		let recordName = "Location System";
		let fileName = data.externalId + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/location/locationSystem`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const createVietNamUnit = (eInvUnitRec, objCfgEconnect) => {
		let data = getDataVietNamUnit(eInvUnitRec);

		let fileName = eInvUnitRec.getValue("name") + "[Create: " + eInvUnitRec.type + "_"+ eInvUnitRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: eInvUnitRec.type,
			custrecord_scv_eco_audit_recordid: eInvUnitRec.id
		};

		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Create Vietnamese Unit: " + eInvUnitRec.getValue("name"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/eInvoiceUnit`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;

			if(!!resBody?.data?.internalId) {
				let sourceExtId = resBody.data.internalId;
				submitFieldExternalId(eInvUnitRec, 'custrecord_scv_ext_source_id', sourceExtId);
			}

			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		} catch(e) {
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	
	const updateVietNamUnit = (eInvUnitRec, objCfgEconnect) => {
		let data = getDataVietNamUnit(eInvUnitRec);

		let fileName = eInvUnitRec.getValue("name") + "[Update: " + eInvUnitRec.type + "_"+ eInvUnitRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: eInvUnitRec.type,
			custrecord_scv_eco_audit_recordid: eInvUnitRec.id
		};

		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Update Vietnamese Unit: " + eInvUnitRec.getValue("name"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/eInvoiceUnit`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;

			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		} catch(e) {
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const getDataVietNamUnit = (eInvUnitRec) => {
		let data = {
			"externalId": eInvUnitRec.id.toString(),
			"name": eInvUnitRec.getValue("name"),
		};
		return data;
	}

	const createLocationDeliverySchedule = (objCfgEconnect, data, recType) => {
        let recordName = "Location Delivery Schedule";
		let fileName = data.externalId + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.externalId,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/location/locationDeliverySchedule`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }
	const updateLocationDeliverySchedule  = (objCfgEconnect, data, recType) => {
        let recordName = "Location Delivery Schedule";
		let fileName = data.externalId + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.externalId,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/location/locationDeliverySchedule`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }

	const createConsolidatedExchangeRate = (objCfgEconnect, data, recType) => {
		let recordName = "Consolidated Exchange Rate";
		let fileName = data.description + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.description,
			objAuditUpdate: objAuditUpdate
		};
		
		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/postingAndFinance/consolidatedExchangeRate`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const createTaxSchedule = (taxScheduleRec, objCfgEconnect) => {
		let data = getDataObjTaxSchedule(taxScheduleRec);
		let recordName = "Tax Schedule";
		let fileName = taxScheduleRec.getValue("name") + " [Create: " + taxScheduleRec.type + 
		"_"+ taxScheduleRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: taxScheduleRec.type,
			custrecord_scv_eco_audit_recordid: taxScheduleRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + taxScheduleRec.getValue("name"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/tax/taxSchedule`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }

	const updateTaxSchedule = (taxScheduleRec, objCfgEconnect) => {
        let data = getDataObjTaxSchedule(taxScheduleRec);
		let recordName = "Tax Schedule";
		let fileName = taxScheduleRec.getValue("name") + " [Update: " + taxScheduleRec.type + 
		"_"+ taxScheduleRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: taxScheduleRec.type,
			custrecord_scv_eco_audit_recordid: taxScheduleRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + taxScheduleRec.getValue("name"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/tax/taxSchedule`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }

	const getDataObjTaxSchedule = (taxScheduleRec) => {
		let purchasetaxcode = taxScheduleRec.getSublistValue("nexuses", "purchasetaxcode", 0) || "";
		let salestaxcode = taxScheduleRec.getSublistValue("nexuses", "salestaxcode", 0) || "";
		let country = taxScheduleRec.getSublistValue("nexuses", "nexuscountry", 0) || "";
		let data = {
			"externalId": taxScheduleRec.id.toString(),
			"name": taxScheduleRec.getValue("name"),
			"description": taxScheduleRec.getValue("description"),
			"country": {
				"externalId": country
			},
			"purchaseTaxCode": {
				"externalId": purchasetaxcode
			},
			"salesTaxCode": {
				"externalId": salestaxcode
			},
			"isActive": true
		};
		return data;
	}

	const createTaxType = (objCfgEconnect, data, recType) => {
		let recordName = "Tax Type";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/tax/taxType`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const updateTaxType = (objCfgEconnect, data, recType) => {
		let recordName = "Tax Type";
		let fileName = data.name + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/tax/taxType`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const createAccountType = (objCfgEconnect, data, recType) => {
        let recordName = "Account Type";
		let fileName = data.description + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.description,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/postingAndFinance/accountType`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }

	const updateAccountType = (objCfgEconnect, data, recType) => {
        let recordName = "Account Type";
		let fileName = data.description + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.description,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/postingAndFinance/accountType`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
    }

	const updateTerm = (objCfgEconnect, data, recType) => {
		let recordName = "Term";
		let fileName = data.name + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/general/terms`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const createBOCListInOut = (objCfgEconnect, data, recType) => {
		let recordName = "List In/Out";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/itemLocationConfig/itemListInOut`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const updateBOCListInOut = (objCfgEconnect, data, recType) => {
		let recordName = "List In/Out";
		let fileName = data.name + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/itemLocationConfig/itemListInOut`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const createBOCListInOutReason = (objCfgEconnect, data, recType) => {
		let recordName = "List In/Out Reason Code";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/itemLocationConfig/itemListInOutReasonCode`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const updateBOCListInOutReason = (objCfgEconnect, data, recType) => {
		let recordName = "List In/Out Reason Code";
		let fileName = data.name + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/itemLocationConfig/itemListInOutReasonCode`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	// TODO: subsidiary
	const createSubsidiary = (subRec, objCfgEconnect) => {
		let data = getDataObjSubsidiary(subRec);

		let fileName = subRec.getValue("name") + "[Create: " + subRec.type + "_"+ subRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: subRec.type,
			custrecord_scv_eco_audit_recordid: subRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Create Subsidiary: " + subRec.getValue("name"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/companyProfile/subsidiary`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;

			if(!!resBody?.data?.internalId) {
				let sourceExtId = resBody.data.internalId;
				submitFieldExternalId(subRec, 'custrecord_scv_external_id_sub', sourceExtId);
			}

			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const updateSubsidiary = (subRec, objCfgEconnect, isDataArchived) => {
		let data = getDataObjSubsidiary(subRec);
		if(isDataArchived === true) {
			data.isDataArchived = isDataArchived;
		}
		updateFieldsEmptyStringToNullable(data, [
			"name", "legalName", "currency", "country", "addressLine1", "city", "state", 
		]);

		let fileName = subRec.getValue("name") + "[Update: " + subRec.type + "_"+ subRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: subRec.type,
			custrecord_scv_eco_audit_recordid: subRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Update Subsidiary: " + subRec.getValue("name"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/companyProfile/subsidiary`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const getDataObjSubsidiary = (subRec) => {
		let isinactive = subRec.getValue("isinactive");
		let parent = subRec.getValue("parent");
		let federalidnumber = subRec.getValue("federalidnumber");

		let subAddressRec = subRec.getSubrecord({
			fieldId: 'mainaddress'
		});

		let data = {
			"externalId": subRec.id.toString(),
			"parentSubsidiary": {},
			"name": subRec.getValue("name"),
			"legalName": subRec.getValue("legalname"),
			"currency": {
				"externalId": subRec.getValue("currency")
			},
			"website": subRec.getValue("url"),
			"email": subRec.getValue("email"),
			"faxNo": subRec.getValue("fax"),
			"documentNumberPrefix": subRec.getValue("tranprefix"),
			"transactionNumberPrefix": subRec.getValue("traninternalprefix"),
			"isActive": !isinactive,
			"phoneNo": "",
			"legacyCode": "",
			"taxIdentificationNumber": federalidnumber || "",
			"companyRegistrationNumber": federalidnumber || "",
			"country": {
				"externalId": subAddressRec.getValue("country")
			},
			"addressLine1": subAddressRec.getValue("addr1"),
			"addressLine2": subAddressRec.getValue("addr2"),
			"addressLine3": subAddressRec.getValue("addr3"),
			"postalCode": subAddressRec.getValue("zip"),
			"city": subAddressRec.getValue("city"),
			"state": subAddressRec.getValue("state"),
		};
		if(parent) {
			data.parentSubsidiary.externalId = parent;
		} else {
			data.parentSubsidiary.externalId = null;
		}
		return data;
	}
	// TODO: Item Hierarchy
	const createItemHierarchy = (objCfgEconnect, data, recType, internalId) => {
		let fileName = data.code + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: internalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create Item Hierarchy: ` + data.code,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/itemHierarchy`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			if(!!resBody?.data?.internalId) {
				let itemHierarchyId = resBody.data.internalId;
				submitFieldsItemHierarchy(itemHierarchyId, recType, internalId);
			}
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const updateItemHierarchy = (objCfgEconnect, data, recType, internalId) => {
		let fileName = data.code + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: internalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update Item Hierarchy: ` + data.code,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/itemHierarchy`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const submitFieldsItemHierarchy = (itemHierarchyId, recType, internalId) => {
		let keyValue = "";
		if(recType === "customrecord_boc_grpcode_item_list") {
			keyValue = "custrecord_boc_grp_code_ext_id";
		} else if(recType === "customrecord_boc_divcode_item_list") {
			keyValue = "custrecord_eco_divi_code_ext_id";
		} else if(recType === "customrecord_boc_deptcode_item_list") {
			keyValue = "custrecord_eco_dpt_code_ext_id";
		} else if(recType === "customrecord_boc_catcode_item_list") {
			keyValue = "custrecord_eco_category_code_ext_id";
		} else if(recType === "customrecord_boc_subcatcode_itm_list") {
			keyValue = "custrecord_eco_sub_cate_code_ext_id";
		} else if(recType === "customrecord_boc_subclass_list") {
			keyValue = "custrecord_eco_sub_class1_ext_id";
		} else {
			keyValue = "custrecord_boc_external_id_itm";
		}

		record.submitFields({
			type: recType,
			id: internalId,
			values: {
				[keyValue]: itemHierarchyId
			}
		});
	}
	// TODO: Location
	const createLocationType = (objCfgEconnect, data, recType) => {
		let recordName = "Location Type";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/location/locationType`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;

		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const updateLocationType = (objCfgEconnect, data, recType) => {
		let recordName = "Location Type";
		let fileName = data.name + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/location/locationType`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;

		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const createLocationCostingGroup = (objCfgEconnect, data, recType) => {
		let recordName = "Location Group";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/location/locationGroup`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;

		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const updateLocationCostingGroup = (objCfgEconnect, data, recType) => {
		let recordName = "Location Group";
		let fileName = data.name + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/location/locationGroup`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;

		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const createLocationAreaCode = (objCfgEconnect, data, recType) => {
		let recordName = "Location Area Code";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/location/locationAreaCode`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;

		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const updateLocationAreaCode = (objCfgEconnect, data, recType) => {
		let recordName = "Location Area Code";
		let fileName = data.name + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/location/locationAreaCode`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;

		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const createLocOutletSizeCluster = (objCfgEconnect, data, recType) => {
		let recordName = "Outlet Size Cluster";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/location/locationOutletSizeCluster`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;

		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const updateLocOutletSizeCluster = (objCfgEconnect, data, recType) => {
		let recordName = "Outlet Size Cluster";
		let fileName = data.name + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/location/locationOutletSizeCluster`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;

		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const createLocOutletSize = (objCfgEconnect, data, recType) => {
		let recordName = "Outlet Size";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/location/locationOutletSize`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;

		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const updateLocOutletSize = (objCfgEconnect, data, recType) => {
		let recordName = "Outlet Size";
		let fileName = data.name + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/location/locationOutletSize`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;

		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const syncLocationData = (curRec) => {
		let locRec = record.load({ type: curRec.type, id: curRec.id });
		let externalid = locRec.getValue("custrecord_scv_external_id_loc");

		let objCfgEconnect = getInfoEconnectConfig();

		let auditId = null;
		if(!externalid) {
			auditId = createLocation(locRec, objCfgEconnect);
		} else {
			auditId = updateLocation(locRec, objCfgEconnect);
		}
		return auditId;
	}
	const createLocation = (locRec, objCfgEconnect) => {
		let data = getDataObjLocation(locRec);
		let fileName = locRec.getValue("name") + "[Create: " + locRec.type + "_"+ locRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: locRec.type,
			custrecord_scv_eco_audit_recordid: locRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Create Location: " + locRec.getValue("name"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/location/location`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;

			if(!!resBody?.data?.internalId) {
				let sourceExtId = resBody.data.internalId;
				submitFieldExternalId(locRec, 'custrecord_scv_external_id_loc', sourceExtId);
			}

			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const updateLocation = (locRec, objCfgEconnect, isDataArchived) => {
		let data = getDataObjLocation(locRec);
		if(isDataArchived === true) {
			data.isDataArchived = isDataArchived;
		}
		let lstFieldsAllowNull = [
			"parentLocation", "displayName", "name", "locationType", "locationBanner", "locationGroup", "customer",
			"city", "state", "country", "primaryWarehouse", "storeReplenishmentDayOfWeek", "areaCode", "outletReference",
			"outletSizeCluster", "outletSize",
		];

		updateFieldsEmptyStringToNullable(data, lstFieldsAllowNull);

		let fileName = locRec.getValue("name") + "[Update: " + locRec.type + "_"+ locRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: locRec.type,
			custrecord_scv_eco_audit_recordid: locRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Update Location: " + locRec.getValue("name"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/location/location`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const getDataObjLocation = (locRec) => {
		let isinactive = locRec.getValue("isinactive");
		let parent = locRec.getValue("parent");
		let subsidiary = locRec.getValue("subsidiary");
		let name = locRec.getValue("name");
		let opening_date = locRec.getValue("custrecord_scv_location_opendate");
		let closing_date = locRec.getValue("custrecord_scv_location_closedate");

		let loc_extension_id = locRec.getValue("custrecord_scv_loc_exten");
		let objLocExtension = getDataObjLocExtension(loc_extension_id);
		let locAddressRec = locRec.getSubrecord({
			fieldId: 'mainaddress'
		});
		
		let data = {
			"externalId": locRec.id.toString(),
			"subsidiary": {
				"externalId": subsidiary
			},
			"parentLocation": {},
			"displayName": name,
			"name": name,
			"locationCode": locRec.getValue("custrecord_scv_location_code"),
			"legacyLocationCode": "",
			"locationType": {
				"externalId": locRec.getValue("locationtype")
			},
			"locationBanner": {
				"externalId": null
			},
			"locationGroup": {
				"externalId": null
			},
			"customer": {
				"externalId": locRec.getValue("custrecord_boc_loc_cust_code") || ""
			},
			"primaryWarehouse": {
				"externalId": ""
			},
			"outletEmail": locRec.getValue("custrecord_scv_location_mail"),
			"addressLine1": locAddressRec.getValue("addr1") || locAddressRec.getValue("addressee"),
			"addressLine2": locAddressRec.getValue("addr2"),
			"addressLine3": locAddressRec.getValue("addr3"),
			"postalCode": "",
			"city": locAddressRec.getValue("city"),
			"state": locAddressRec.getValue("state"),
			"country": {
				"externalId": locAddressRec.getValue("country")
			},
			"documentNumberPrefix": locRec.getValue("tranprefix"),
			"transactionNumberPrefix": locRec.getValue("traninternalprefix"),
			"latitude": locRec.getValue("latitude") * 1,
			"longitude": locRec.getValue("longitude") * 1,
			"isActive": !isinactive,
			"defaultAllocationPriority": locRec.getValue("defaultallocationpriority") * 1,
			"isFirstLorry": false,
			"hasTrolley": false,
			"isInventoryAvailable": locRec.getValue("makeinventoryavailable"),
			"isSupplyPlanningIncluded": false,
			"isPostBySalesInvoice": true,
			"openDate": formatDateToEcoSystem(opening_date),
			"closeDate": formatDateToEcoSystem(closing_date),
			"leafioLicenseStartDate": ECO_DATE_REQUIRED,
			"leafioLicenseEndDate": ECO_DATE_REQUIRED,
			"outletCapacityEcoShop": 0,
			"outletCapacityEcoPlus": 0,
			"outletReference": {
				"externalId": ""
			},
			"usedSystem": {
				"externalId": locRec.getValue("custrecord_boc_loc_system"),
			},
			"storeReplenishmentDayOfWeek": "",
			...objLocExtension
		};

		if(parent) {
			data.parentLocation.externalId = parent;
		} else {
			data.parentLocation.externalId = null;
		}
		return data;
	}

	const getDataObjLocExtension = (loc_extension_id) => {
		let objResult = {
			"storePriority": 0,
			// "OperationManagerInternalId": "",
			// "AssistantAreaManagerInternalId": "",
			// "ZoneManagerInternalId": "",
			// "OperationalGeneralManagerInternalId": "",
			"OperationGeneralManagerInternalId": "",

			"operationManager": {
				"externalId": ""
			},
			"assistantAreaManager": {
				"externalId": ""
			},
			"zoneManager": {
				"externalId": ""
			},
			"operationGeneralManager": {
				"externalId": ""
			},
			"areaCode": {
				"externalId": ""
			},
			"outletSizeCluster": {
				"externalId": ""
			},
			"outletSize": {
				"externalId": ""
			},
			"floorSpaceInM2": 0,
			"lorryMaxTon": 0,
			"outletBayCount": 0,
			"outletStoreArea": 0,
			"outletDisplayArea": 0,
			"outletTotalArea": 0,
		};
		if(!!loc_extension_id) {
			let myFilters = [
				["isinactive", "is", "F"],
				"AND",
				["internalid", "anyof", loc_extension_id]
			];

			let myColumns = [
				"internalid", "custrecord_boc_location_areacode", "custrecord_boc_loc_storepriority", 
				"custrecord_boc_loc_outletsizecluster", "custrecord_boc_loc_outletsize", "custrecord_boc_loc_floorspace_m2",
				"custrecord_boc_loc_outletbaycount", "custrecord_boc_loc_storearea", "custrecord_boc_loc_outletdisplayarea",
				"custrecord_boc_loc_outlettotalarea", "custrecord_boc_loc_lorrymaxm3",
				"custrecord_boc_location_pic1", "custrecord_boc_location_pic2", "custrecord_boc_location_pic3", 
				"custrecord_boc_location_pic4", "custrecord_boc_location_pic5",
				// {name: "email", join: "custrecord_boc_location_pic1", label: "operationManagerEmail"}, 
				// {name: "email", join: "custrecord_boc_location_pic2", label: "assistantAreaManagerEmail"}, 
				// {name: "email", join: "custrecord_boc_location_pic3", label: "zoneManagerEmail"}, 
				// {name: "email", join: "custrecord_boc_location_pic4", label: "operationalGeneralManagerEmail"}, 
				// {name: "email", join: "custrecord_boc_location_pic5", label: "operationGeneralManagerEmail"}, 
			];
			let objSearch = getDataCreateSavedSearchWithId("customrecord_scv_location_extension", myFilters, myColumns);
			objResult = {
				"storePriority": objSearch.custrecord_boc_loc_storepriority * 1,
				// "OperationManagerInternalId": objSearch.custrecord_boc_location_pic1,
				// "AssistantAreaManagerInternalId": objSearch.custrecord_boc_location_pic2,
				// "ZoneManagerInternalId": objSearch.custrecord_boc_location_pic3,
				// "OperationalGeneralManagerInternalId": objSearch.custrecord_boc_location_pic4,
				"OperationGeneralManagerInternalId": objSearch.custrecord_boc_location_pic5,

				"operationManager": {
					"externalId": objSearch.custrecord_boc_location_pic1
				},
				"assistantAreaManager": {
					"externalId": objSearch.custrecord_boc_location_pic2
				},
				"zoneManager": {
					"externalId": objSearch.custrecord_boc_location_pic3
				},
				"operationGeneralManager": {
					"externalId": objSearch.custrecord_boc_location_pic4
				},
				"areaCode": {
					"externalId": objSearch.custrecord_boc_location_areacode || ""
				},
				"outletSizeCluster": {
					"externalId": objSearch.custrecord_boc_loc_outletsizecluster || ""
				},
				"outletSize": {
					"externalId": objSearch.custrecord_boc_loc_outletsize || ""
				},
				"floorSpaceInM2": objSearch["custrecord_boc_loc_floorspace_m2"] * 1,
				"lorryMaxTon": objSearch["custrecord_boc_loc_lorrymaxm3"] * 1,
				"outletBayCount": objSearch.custrecord_boc_loc_outletbaycount * 1,
				"outletStoreArea": objSearch.custrecord_boc_loc_storearea * 1,
				"outletDisplayArea": objSearch.custrecord_boc_loc_outletdisplayarea * 1,
				"outletTotalArea": objSearch.custrecord_boc_loc_outlettotalarea * 1,
			};
		}

		return objResult;
	}

	// TODO: customer
	const createCustomerCategory = (objCfgEconnect, data, recType) => {
		let recordName = "Customer Category";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/customer/customerCategory`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;

		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const updateCustomerCategory = (objCfgEconnect, data, recType) => {
		let recordName = "Customer Category";
		let fileName = data.name + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/customer/customerCategory`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const createPriceLevel = (objCfgEconnect, data, recType) => {
		let recordName = "Price Level";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/customer/priceLevel`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const updatePriceLevel = (objCfgEconnect, data, recType) => {
		let recordName = "Price Level";
		let fileName = data.name + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/customer/priceLevel`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const syncCustomerData = (curRec) => {
		let customerRec = record.load({ type: curRec.type, id: curRec.id });
		let externalid = customerRec.getValue("custentity_scv_external_id_entity");

		let objCfgEconnect = getInfoEconnectConfig();

		let auditId = null;
		if(!externalid) {
			auditId = createCustomer(customerRec, objCfgEconnect);
		} else {
			auditId = updateCustomer(customerRec, objCfgEconnect);
		}
		return auditId;
	}
	const createCustomer = (customerRec, objCfgEconnect) => {
		let data = getDataObjCustomer(customerRec);

		let fileName = customerRec.getValue("nameorig") + "[Create: " + customerRec.type + "_"+ customerRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: customerRec.type,
			custrecord_scv_eco_audit_recordid: customerRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Create Customer: " + customerRec.getValue("nameorig"),
			objAuditUpdate: objAuditUpdate
		};
		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/customer/customer`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;

			if(!!resBody?.data?.internalId) {
				let sourceExtId = resBody.data.internalId;
				submitFieldExternalId(customerRec, 'custentity_scv_external_id_entity', sourceExtId);
			}

			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const updateCustomer = (customerRec, objCfgEconnect, isDataArchived) => {
		let data = getDataObjCustomer(customerRec);
		if(isDataArchived === true) {
			data.isDataArchived = isDataArchived;
		}
		deleteFieldsInObject(data, [
			"bcCustomerCode", "bcCustomerPostingGroup", "bcBusinessPostingGroup", "bcDimensionPurpose", 
			"bcDimensionLocation", "bcDimensionTenancyAndDepartment", "eInvoiceMalaysiaStandardIndustrialClassification",
			"eInvoiceIdentidicationType", "gstRegistrationNo", "sstRegistrationNo", "taxIdentificationNo",
			"vendorMapping", "region", "nric", "passport", "army", "personalName", "emailForEinvoice",
			"hasTaxIdentificationNoValidated", "alcoholRecipientType", "comments", "status"
		]);
		updateFieldsEmptyStringToNullable(data, [
			"primarySubsidiary", "customerCategory", "billingAddressLine1", "billingAddressCity", "billingAddressState",
			"billingAddressCountry", "shippingAddressLine1", "shippingAddressCity", "shippingAddressState", "shippingAddressCountry", 
			"priceLevel", "primaryCurrency", "terms"
		]);

		let fileName = customerRec.getValue("nameorig") + "[Update: " + customerRec.type + "_"+ customerRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: customerRec.type,
			custrecord_scv_eco_audit_recordid: customerRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Update Customer: " + customerRec.getValue("nameorig"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/customer/customer`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const createCustomerSubMapping = (objCfgEconnect, data, recType) => {
		let recordName = "Customer Subsidiary Relationship";
		let fileName = data.externalId + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.externalId,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/customer/customerSubsidiaryMapping`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const createCustomerContact = (contactRec, objCfgEconnect) => {
		let data = getDataObjCustomerContact(contactRec);
		
		let fileName = contactRec.getValue("entityid") + "[Create: " + contactRec.type + "_"+ contactRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: contactRec.type,
			custrecord_scv_eco_audit_recordid: contactRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Create Customer Contact: " + contactRec.getValue("entityid"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/customer/customerContact`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;

			if(!!resBody?.data?.internalId) {
				let sourceExtId = resBody.data.internalId;
				submitFieldExternalId(contactRec, 'custentity_scv_customer_contact_extid', sourceExtId);
			}

			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const updateCustomerContact = (contactRec, objCfgEconnect) => {
		let data = getDataObjCustomerContact(contactRec);

		updateFieldsEmptyStringToNullable(data, [
			"billingAddressLine1", "billingAddressCity", "billingAddressState", "billingAddressCountry", "shippingAddressLine1", "shippingAddressCity", 
			"shippingAddressState", "shippingAddressCountry"
		]);
		
		let fileName = contactRec.getValue("entityid") + "[Update: " + contactRec.type + "_"+ contactRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: contactRec.type,
			custrecord_scv_eco_audit_recordid: contactRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Update Customer Contact: " + contactRec.getValue("entityid"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/customer/customerContact`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const getDataObjCustomer = (customerRec) => {
		let isinactive = customerRec.getValue("isinactive");
		let objAddress = getDataAddressbookEntity(customerRec);
		let startdate = customerRec.getValue("startdate");
		let enddate = customerRec.getValue("enddate");

		let data = {
			"externalId": customerRec.id.toString(),
			"primarySubsidiary": {
				"externalId": customerRec.getValue("subsidiary")
			},
			"customerId": customerRec.getValue("nameorig"),
			"bcCustomerCode": "",
			"companyName": customerRec.getValue("companyname"),
			"legalName": customerRec.getValue("custentity_scv_legal_name"),
			"customerCategory": {
				"externalId": customerRec.getValue("category")
			},
			"vendorMapping": { 
				"externalId": customerRec.getValue("custentity_boc_vendor_code_map")
			},
			"bcCustomerPostingGroup": { "externalId": "" },
			"bcBusinessPostingGroup": { "externalId": "" },
			"companyRegistrationNumber": customerRec.getValue("custentity_scv_tax_number"),
			"gstRegistrationNo": "",
			"sstRegistrationNo": "",
			"taxIdentificationNo": "",
			"email": customerRec.getValue("email"),
			"phone": customerRec.getValue("custentity_scv_phone_no"),
			"alternatePhone": customerRec.getValue("phone"),
			"companyContactPhone": "",
			"fax": customerRec.getValue("fax"),
			...objAddress,
			"region": {"externalId": ""},
			"outletAccountNo": "",
			"bcDimensionPurpose": {"externalId": ""},
			"bcDimensionLocation": {"externalId": ""},
			"bcDimensionTenancyAndDepartment": {"externalId": ""},
			"isPerson": false,
			"isOversea": false,
			"isXilnexSalesOperator": false,
			"salesRepresentative": {
				"externalId": customerRec.getValue("salesrep"),
			},
			"accountNo": customerRec.getText("receivablesaccount"),
			"contractStartDate": formatDateToEcoSystem(startdate),
			"contractEndDate": formatDateToEcoSystem(enddate),
			"contractRenewalReminderDays": customerRec.getValue("reminderdays") * 1,
			"priceLevel": {
				"externalId": customerRec.getValue("pricelevel")
			},
			"primaryCurrency": {
				"externalId": customerRec.getValue("currency")
			},
			"terms": {
				"externalId": customerRec.getValue("terms")
			},
			"creditLimit": 0,
			"einvoiceStartDate": ECO_DATE_REQUIRED,
			"eInvoiceMalaysiaStandardIndustrialClassification": { "externalId": "" },
			"eInvoiceIdentidicationType": { "externalId": "" },
			"nric": "",
			"passport": "",
			"army": "",
			"personalName": "",
			"emailForEinvoice": "",
			"hasTaxIdentificationNoValidated": false,
			"alcoholRecipientType": "",
			"comments": customerRec.getValue("comments"),
			"status": customerRec.getText("entitystatus"),
			"isChildSubsidiaryMappingIncluded": true,
			"isActive": !isinactive
		};
		return data;
	}
	const getDataObjCustomerContact = (contactRec) => {
		let objAddress = getDataAddressbookEntity(contactRec);
		let data = {
			"externalId": contactRec.id.toString(),
			"customer": {
				"externalId": contactRec.getValue("company")
			},
			"personName": contactRec.getValue("entityid"),
			"firstName": contactRec.getValue("firstname"),
			"middleName": contactRec.getValue("middlename"),
			"lastName": contactRec.getValue("lastname"),
			"jobTitle": contactRec.getValue("title"),
			"role": contactRec.getValue("contactrole"),
			"email": contactRec.getValue("email"),
			"mainPhone": contactRec.getValue("phone"),
			"phoneNo": contactRec.getValue("custentity_scv_phone_no"),
			"fax": contactRec.getValue("fax"),
			...objAddress
		}
		return data;
	}
	// TODO: employee
	const createEmployee = (empRec, objCfgEconnect) => {
		let data = getDataObjEmployee(empRec);

		let fileName = empRec.getValue("custentity_scv_legal_name") + "[Create: " + empRec.type + "_"+ empRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: empRec.type,
			custrecord_scv_eco_audit_recordid: empRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Create Employee: " + empRec.getValue("custentity_scv_legal_name"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/employee/employee`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;

			if(!!resBody?.data?.internalId) {
				let sourceExtId = resBody.data.internalId;
				submitFieldExternalId(empRec, 'custentity_scv_external_id_employee', sourceExtId);
			}

			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const updateEmployee = (empRec, objCfgEconnect) => {
		let data = getDataObjEmployee(empRec);
		deleteFieldsInObject(data, ["einvoiceStartDate"]);
		updateFieldsEmptyStringToNullable(data, [
			"addressLine1", "postalCode", "city", "state", "country"
		]);

		let fileName = empRec.getValue("custentity_scv_legal_name") + "[Update: " + empRec.type + "_"+ empRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: empRec.type,
			custrecord_scv_eco_audit_recordid: empRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Update Employee: " + empRec.getValue("custentity_scv_legal_name"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/employee/employee`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const getDataObjEmployee = (empRec) => {
		let isinactive = empRec.getValue("isinactive");
		let objAddress = getDataAddressbookEmployee(empRec);

		let data = {
			"externalId": empRec.id.toString(),
			"subsidiary": {
				"externalId": empRec.getValue("subsidiary")
			},
			"department": {
				"externalId": empRec.getValue("department")
			},
			"class": {
				"externalId": empRec.getValue("class")
			},
			"location": {
				"externalId": empRec.getValue("location")
			},
			"employeeId": empRec.getValue("nameorig"),
			"salutation": empRec.getValue("salutation"),
			"firstName": empRec.getValue("firstname"),
			"middleName": empRec.getValue("middlename"),
			"lastName": empRec.getValue("lastname"),
			"fullName": empRec.getValue("custentity_scv_legal_name"),
			"initials": empRec.getValue("initials"),
			"jobTitle": empRec.getValue("title"),
			"supervisor": {
				"externalId": empRec.getValue("supervisor"),
			},
			"currency": {
				"externalId": empRec.getValue("currency"),
			},
			"email": empRec.getValue("email"),
			"phoneNo": empRec.getValue("custentity_scv_phone_no"),
			"officePhoneNo": empRec.getValue("officephone"),
			"mobilePhoneNo": empRec.getValue("mobilephone"),
			"homePhoneNo": empRec.getValue("homephone"),
			"faxNo": empRec.getValue("fax"),
			...objAddress,
			"accountNumber": empRec.getValue("accountnumber"),
			"expenseApprover": {
				"externalId": empRec.getValue("approver"),
			},
			"purchaseApprover": {
				"externalId": empRec.getValue("purchaseorderapprover"),
			},
			"vendorMasterApprover": {
				"externalId": null
			},
			"itemMasterApprover": {
				"externalId": null
			},
			"vendorPricingApprover": {
				"externalId": null
			},
			"salesPricingApprover": {
				"externalId": null
			},
			"delegateApprover": {
				"externalId": null
			},
			"einvoiceStartDate": ECO_DATE_REQUIRED,
			"notes": empRec.getValue("comments"),
			"isSalesRepresentative": empRec.getValue("issalesrep"),
			"isGiveAccess": empRec.getValue("giveaccess"),
			"isActive": !isinactive
		};
		return data;
	}
	const getDataAddressbookEmployee = (curRec) => {
		let objResult = {
			"addressLine1": "",
			"addressLine2": "",
			"addressLine3": "",
			"postalCode": "",
			"city": "",
			"state": "",
			"country": { "externalId": "" },
		};

		let sl = "addressbook";
		let totalLine = curRec.getLineCount(sl);
		for(let i = 0; i < totalLine; i++) {
			let defaultshipping = curRec.getSublistValue(sl, "defaultshipping", i);
			let defaultbilling = curRec.getSublistValue(sl, "defaultbilling", i);
			
			let addressSubRec = curRec.getSublistSubrecord({ sublistId: sl, fieldId: "addressbookaddress", line: i});
			if(defaultshipping === true || defaultbilling === true) {
				objResult["addressLine1"] = addressSubRec.getValue("addr1") || addressSubRec.getValue("addressee");
				objResult["addressLine2"] = addressSubRec.getValue("addr2");
				objResult["addressLine3"] = addressSubRec.getValue("addr3");
				objResult["postalCode"] = addressSubRec.getValue("zip");
				objResult["city"] = addressSubRec.getValue("city");
				objResult["state"] = addressSubRec.getValue("state");
				objResult["country"] = { 
					"externalId": addressSubRec.getValue("country")
				};
				break;
			}
		}
		return objResult;
	}
	// TODO: vendor
	const createVendorCategory = (objCfgEconnect, data, recType) => {
		let recordName = "Vendor Category";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/vendor/vendorCategory`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const updateVendorCategory = (objCfgEconnect, data, recType) => {
		let recordName = "Vendor Category";
		let fileName = data.name + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/vendor/vendorCategory`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;

		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const createSupplierType = (objCfgEconnect, data, recType) => {
		let recordName = "Supplier Type";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/vendor/supplierType`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;

		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const updateSupplierType = (objCfgEconnect, data, recType) => {
		let recordName = "Supplier Type";
		let fileName = data.name + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/vendor/supplierType`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;

		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const createDeliveryMethod = (objCfgEconnect, data, recType) => {
		let recordName = "Delivery Method";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/vendor/deliveryMethod`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;

		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const updateDeliveryMethod = (objCfgEconnect, data, recType) => {
		let recordName = "Delivery Method";
		let fileName = data.name + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/vendor/deliveryMethod`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;

		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const createDeliveryLocation = (objCfgEconnect, data, recType) => {
		let recordName = "Delivery Location";
		let fileName = data.name + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/vendor/deliveryLocation`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;

		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const updateDeliveryLocation = (objCfgEconnect, data, recType) => {
		let recordName = "Delivery Location";
		let fileName = data.name + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.name,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/vendor/deliveryLocation`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;

		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const syncVendorData = (curRec) => {
		let vendorRec = record.load({ type: curRec.type, id: curRec.id });
		let externalid = vendorRec.getValue("custentity_scv_external_id_vendor");

		let objCfgEconnect = getInfoEconnectConfig();

		let auditId = null;
		if(!externalid) {
			auditId = createVendor(vendorRec, objCfgEconnect);
		} else {
			auditId = updateVendor(vendorRec, objCfgEconnect);
		}
		return auditId;
	}
	const createVendor = (vendorRec, objCfgEconnect) => {
		let data = getDataObjVendor(vendorRec);

		let fileName = vendorRec.getValue("nameorig") + "[Create: " + vendorRec.type + "_"+ vendorRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: vendorRec.type,
			custrecord_scv_eco_audit_recordid: vendorRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Create Vendor: " + vendorRec.getValue("nameorig"),
			objAuditUpdate: objAuditUpdate
		};
		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/vendor/vendor`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;

			if(!!resBody?.data?.internalId) {
				let sourceExtId = resBody.data.internalId;
				submitFieldExternalId(vendorRec, 'custentity_scv_external_id_vendor', sourceExtId);
			}

			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const updateVendor = (vendorRec, objCfgEconnect, isDataArchived) => {
		let data = getDataObjVendor(vendorRec);
		if(isDataArchived === true) {
			data.isDataArchived = isDataArchived;
		}
		deleteFieldsInObject(data, [
			"bcVendorPostingGroup", "bcBusinessPostingGroup", "holdingCompany", "dateOfIncorporationRegistration", 
			"businessRegistrationNo", "oldBusinessRegistrationNo", "gstRegistrationNo", "gstRegistrationDate", "sstRegistrationNo", "qqNo", "fax", "purchaserName",
			"vendorOverseasLocationCode", "emailForB2b", "hasB2bSubscription", 
			"b2bSubscriptionEffectiveDate", "b2bSubscriptionTerminationDate", "hasCmsSubscription", "cmsSubscriptionEffectiveDate", "isTaxRegisteredCompany", 
			"equityStructureAccumulatedCapital", "equityStructureAuthorizedCapital", "equityStructurePaidUpCapital", "shareholderStructureBumiputera", 
			"shareholderStructureNonBumiputera", "shareholderStructureForeigner", "bankBranch", "financialFacilities", "creditPaymentDiscount", "bankGuaranteeAmount", "bankGuaranteeEntitledForCreditLimitRatio",
			"paymentMethod", "bcDimensionPurpose", "bcDimensionLocation", "bcDimensionTenancyAndDepartment", "isSelfBill", "eInvoiceStartDate", 
			"eInvoiceMalaysiaStandardIndustrialClassification", "eInvoiceIdentificationType", "nric", "passport", "army", "emailForEinvoice", 
			"vendorBlockStatus", "blockStatusNextApprover", "isChildSubsidiaryMappingIncluded", "isInactiveReactivate",
		]);
		updateFieldsEmptyStringToNullable(data, [
			"supplierCode", "companyType", "vendorCategory", "supplierType", "taxIdentificationNo", "primaryContactNo", "billingAddressLine1",
			"billingAddressCity", "billingAddressState", "billingAddressCountry", "shippingAddressLine1", "shippingAddressCity", 
			"shippingAddressState", "shippingAddressCountry", "incoterm", "terms", "primaryCurrency", "companyEmail"
		]);

		let fileName = vendorRec.getValue("nameorig") + "[Update: " + vendorRec.type + "_"+ vendorRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: vendorRec.type,
			custrecord_scv_eco_audit_recordid: vendorRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Update Vendor: " + vendorRec.getValue("nameorig"),
			objAuditUpdate: objAuditUpdate
		};
		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/vendor/vendor`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		} catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const createVendorSubMapping = (objCfgEconnect, data, recType) => {
		let recordName = "Vendor Subsidiary Relationship";
		let fileName = data.externalId + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.externalId,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/vendor/vendorSubsidiaryMapping`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const createVendorBusinessCoverageMapping = (objCfgEconnect, data, recType) => {
		let recordName = "Vendor Business Coverage Mapping";
		let fileName = data.externalId + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.externalId,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/vendor/vendorBusinessCoverageMapping`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const createVendorContact = (contactRec, objCfgEconnect) => {
		let data = getDataObjVendorContact(contactRec);
		
		let fileName = contactRec.getValue("entityid") + "[Create: " + contactRec.type + "_"+ contactRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: contactRec.type,
			custrecord_scv_eco_audit_recordid: contactRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Create Vendor Contact: " + contactRec.getValue("entityid"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/vendor/vendorContact`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;

			if(!!resBody?.data?.internalId) {
				let sourceExtId = resBody.data.internalId;
				submitFieldExternalId(contactRec, 'custentity_scv_vendor_contact_extid', sourceExtId);
			}

			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const updateVendorContact = (contactRec, objCfgEconnect) => {
		let data = getDataObjVendorContact(contactRec);

		updateFieldsEmptyStringToNullable(data, [
			"billingAddressLine1", "billingAddressCity", "billingAddressState", "billingAddressCountry", "shippingAddressLine1", "shippingAddressCity", 
			"shippingAddressState", "shippingAddressCountry"
		]);
		
		let fileName = contactRec.getValue("entityid") + "[Update: " + contactRec.type + "_"+ contactRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: contactRec.type,
			custrecord_scv_eco_audit_recordid: contactRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Update Vendor Contact: " + contactRec.getValue("entityid"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/vendor/vendorContact`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const getDataObjVendor = (vendorRec) => {
		let isinactive = vendorRec.getValue("isinactive");
		let objAddress = getDataAddressbookEntity(vendorRec);

		let data = {
			"externalId": vendorRec.id.toString(),
			"primarySubsidiary": {
				"externalId": vendorRec.getValue("subsidiary")
			},
			"vendorCategory": {
				"externalId": vendorRec.getValue("category")
			},
			"supplierType": {
				"externalId": vendorRec.getValue("custentity_boc_vnd_suppliertype")
			},
			"bcBusinessPostingGroup": {
				"externalId": ""
			},
			// "businessCoverage": {
			// 	"externalId": vendorRec.getValue("custentity_boc_business_coverage")
			// },
			"bcVendorCode": vendorRec.getValue("custentity_scv_entity_code"),
			"holdingCompany": "",
			"bcVendorPostingGroup": {
				"externalId": ""
			},
			"dateOfIncorporationRegistration": ECO_DATE_REQUIRED,
			"gstRegistrationDate": ECO_DATE_REQUIRED,
			"businessRegistrationNo": "",
			"oldBusinessRegistrationNo": "",
			"gstRegistrationNo": "",
			"sstRegistrationNo": "",
			"qqNo": "",
			"fax": "",
			...objAddress,
			"businessName": vendorRec.getValue("custentity_scv_eng_name"),
			"supplierCode": vendorRec.getValue("nameorig"),
			"taxIdentificationNo": vendorRec.getValue("custentity_scv_tax_number"),
			"primaryContactNo": vendorRec.getValue("custentity_scv_phone_no"),
			"companyEmail": vendorRec.getValue("email"),
			"purchaserName": vendorRec.getValue("custentity_boc_vnd_purchasername"),
			"vendorOverseasLocationCode": {
				"externalId": null
			},
			"incoterm": {
				"externalId": vendorRec.getValue("incoterm")
			},
			"terms": {
				"externalId": vendorRec.getValue("terms")
			},
			"primaryCurrency": {
				"externalId": vendorRec.getValue("currency")
			},
			"companyType": {
				"externalId": ""
			},
			"paymentMethod": {
				"externalId": ""
			},
			"deliveryLocation": {
				"externalId": vendorRec.getValue("custentity_boc_delivery_location")
			},
			"deliveryLeadTimeDays": vendorRec.getValue("custentity_boc_lead_time_calculation") * 1,
			"isBackhaulSupplier": vendorRec.getValue("custentity_boc_is_backhaul"),
			"isAutoPo": vendorRec.getValue("custentity_boc_auto_po"),
			"isCrossdock": vendorRec.getValue("custentity_boc_is_crossdock"),
			"emailForB2b": "",
			"hasB2bSubscription": false,
			"b2bSubscriptionEffectiveDate": ECO_DATE_REQUIRED,
			"b2bSubscriptionTerminationDate": ECO_DATE_REQUIRED,
			"hasCmsSubscription": false,
			"cmsSubscriptionEffectiveDate": ECO_DATE_REQUIRED,
			"isTaxRegisteredCompany": false,
			"equityStructureAccumulatedCapital": "",
			"equityStructureAuthorizedCapital": "",
			"equityStructurePaidUpCapital": "",
			"shareholderStructureBumiputera": "",
			"shareholderStructureNonBumiputera": "",
			"shareholderStructureForeigner": "",
			"bankBranch": "",
			"financialFacilities": "",
			"legalName": vendorRec.getValue("custentity_scv_legal_name"),
			"bankName": vendorRec.getValue("custentity_boc_bank_name"),
			"preferredBankAccountCode": vendorRec.getValue("custentity_boc_preferred_bank_code"),
			"swiftCode": vendorRec.getValue("custentity_boc_swift_code"),
			"creditLimit": 0,
			"creditPaymentDiscount": 0,
			"bankGuaranteeAmount": 0,
			"bankGuaranteeEntitledForCreditLimitRatio": 0,
			"bcDimensionPurpose": {
				"externalId": ""
			},
			"bcDimensionLocation": {
				"externalId": ""
			},
			"bcDimensionTenancyAndDepartment": {
				"externalId": ""
			},
			"isSelfBill": false,
			"eInvoiceStartDate": ECO_DATE_REQUIRED,
			"eInvoiceMalaysiaStandardIndustrialClassification": {
				"externalId": ""
			},
			"eInvoiceIdentificationType": {
				"externalId": ""
			},
			"nric": "",
			"passport": "",
			"army": "",
			"emailForEinvoice": "",
			"vendorBlockStatus": {
				"externalId": ""
			},
			"blockStatusNextApprover": "",
			"isChildSubsidiaryMappingIncluded": true,
			"isInactiveReactivate": false,
			"isActive": !isinactive
		};
		return data;
	}
	const getDataObjVendorContact = (contactRec) => {
		let objAddress = getDataAddressbookEntity(contactRec);
		let data = {
			"externalId": contactRec.id.toString(),
			"vendor": {
				"externalId": contactRec.getValue("company")
			},
			"personName": contactRec.getValue("entityid"),
			"firstName": contactRec.getValue("firstname"),
			"middleName": contactRec.getValue("middlename"),
			"lastName": contactRec.getValue("lastname"),
			"jobTitle": contactRec.getValue("title"),
			"role": contactRec.getValue("contactrole"),
			"email": contactRec.getValue("email"),
			"mainPhone": contactRec.getValue("phone"),
			"phoneNo": contactRec.getValue("custentity_scv_phone_no"),
			"fax": contactRec.getValue("fax"),
			...objAddress
		}
		return data;
	}
	// TODO: Tax Code 
	const createTaxCode = (taxCodeRec, objCfgEconnect) => {
		let data = getDataObjTaxCode(taxCodeRec);
		let recordName = "Tax Code";
		let fileName = data.code + " [Create: " + taxCodeRec.type + 
		"_"+ taxCodeRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: taxCodeRec.type,
			custrecord_scv_eco_audit_recordid: taxCodeRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.code,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/tax/taxCode`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;

			if(!!resBody?.data?.internalId) {
				let sourceExtId = resBody.data.internalId;
				submitFieldExternalId(taxCodeRec, 'custrecord_scv_taxcode_externalid', sourceExtId);
			}

			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const updateTaxCode = (taxCodeRec, objCfgEconnect) => {
		let data = getDataObjTaxCode(taxCodeRec);
		let recordName = "Tax Code";
		let fileName = data.code + " [Update: " + taxCodeRec.type + 
		"_"+ taxCodeRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: taxCodeRec.type,
			custrecord_scv_eco_audit_recordid: taxCodeRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.code,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/tax/taxCode`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const createTaxCodeSubMapping = (objCfgEconnect, data, recType) => {
		let recordName = "Tax Code Subsidiary Mapping";
		let fileName = data.externalId + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.externalId,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/tax/taxCodeSubsidiaryMapping`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const getDataObjTaxCode = (taxCodeRec) => {
		let isinactive = taxCodeRec.getValue("isinactive");
		let effectivefrom = taxCodeRec.getValue("effectivefrom");
		let validuntil = taxCodeRec.getValue("validuntil");

		let data = {
			"externalId": taxCodeRec.id.toString(),
			"taxType": {
				"externalId": taxCodeRec.getValue("taxtype")
			},
			"code": taxCodeRec.getValue("itemid"),
			"description": taxCodeRec.getValue("description"),
			"rate": taxCodeRec.getValue("rate"),
			"effectiveDate": formatDateToEcoSystem(effectivefrom),
			"validUntil": formatDateToEcoSystem(validuntil),
			"isChildSubsidiaryMappingIncluded": taxCodeRec.getValue("includechildren"),
			"isActive": !isinactive
		};

		return data;

	}
	// TODO: department
	const createDepartment = (depRec, objCfgEconnect) => {
		let data = getDataObjDepartment(depRec.id);

		let fileName = depRec.getValue("name") + "[Create: " + depRec.type + "_"+ depRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: depRec.type,
			custrecord_scv_eco_audit_recordid: depRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Create Department: " + depRec.getValue("name"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/classification/department`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;

			if(!!resBody?.data?.internalId) {
				let sourceExtId = resBody.data.internalId;
				submitFieldExternalId(depRec, 'custrecord_scv_dept_externalid', sourceExtId);
			}

			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const updateDepartment = (depRec, objCfgEconnect, isDataArchived) => {
		let data = getDataObjDepartment(depRec.id);
		if(isDataArchived === true) {
			data.isDataArchived = isDataArchived;
		}
		updateFieldsEmptyStringToNullable(data, ["code"]);

		let fileName = depRec.getValue("name") + "[Update: " + depRec.type + "_"+ depRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: depRec.type,
			custrecord_scv_eco_audit_recordid: depRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Update Department: " + depRec.getValue("name"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/classification/department`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const createDepartmentSubMapping = (objCfgEconnect, data, recType) => {
		let recordName = "Department Subsidiary Mapping";
		let fileName = data.externalId + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.externalId,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/classification/departmentSubsidiaryMapping`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const getDataObjDepartment = (departmentId) => {
		let resultSQL = query.runSuiteQL({
			query: `SELECT id, name, custrecord_scv_dept_code, custrecord_scv_memo_dept, 
				parent, fullname, isinactive, includechildren
				FROM department WHERE id = ${departmentId}`
		}).asMappedResults();

		let objDepartment = resultSQL[0];

		let data = {
			"externalId": objDepartment.id.toString(),
			"parentDepartment": {
				"externalId": objDepartment?.parent?.toString() || null
			},
			"code": objDepartment.custrecord_scv_dept_code || "",
			"name": objDepartment.name || "",
			"fullName": objDepartment.fullname || "",
			"memo": objDepartment.custrecord_scv_memo_dept || "",
			"isChildSubsidiaryMappingIncluded": objDepartment.includechildren === "T",
			"isActive": objDepartment.isinactive === "T" ? false : true
		};
		
		return data;
	}
	// TODO: classification
	const createClassification = (classRec, objCfgEconnect) => {
		let data = getDataObjClassification(classRec.id);
		
		let fileName = classRec.getValue("name") + "[Create: " + classRec.type + "_"+ classRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: classRec.type,
			custrecord_scv_eco_audit_recordid: classRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Create Classification: " + classRec.getValue("name"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/classification/class`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;

			if(!!resBody?.data?.internalId) {
				let sourceExtId = resBody.data.internalId;
				submitFieldExternalId(classRec, 'custrecord_scv_class_externalid', sourceExtId);
			}

			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const updateClassification = (classRec, objCfgEconnect, isDataArchived) => {
		let data = getDataObjClassification(classRec.id);
		if(isDataArchived === true) {
			data.isDataArchived = isDataArchived;
		}
		updateFieldsEmptyStringToNullable(data, ["code"]);
		
		let fileName = classRec.getValue("name") + "[Update: " + classRec.type + "_"+ classRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: classRec.type,
			custrecord_scv_eco_audit_recordid: classRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Update Classification: " + classRec.getValue("name"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/classification/class`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const createClassSubMapping = (objCfgEconnect, data, recType) => {
		let recordName = "Class Subsidiary Mapping";
		let fileName = data.externalId + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.externalId,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/classification/classSubsidiaryMapping`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const getDataObjClassification = (classId) => {
		let resultSQL = query.runSuiteQL({
			query: `SELECT id, name, isinactive, custrecord_scv_class_code, 
				custrecord_scv_class_description, parent, fullname, includechildren
				FROM classification WHERE id = ${classId}`
		}).asMappedResults();
		let objClass = resultSQL[0];

		let data = {
			"externalId": objClass.id.toString(),
			"parentClass": {
				"externalId": objClass?.parent?.toString() || null
			},
			"code": objClass.custrecord_scv_class_code || "",
			"name": objClass.name || "",
			"fullName": objClass.fullname || "",
			"description": objClass.custrecord_scv_class_description || "",
			"isChildSubsidiaryMappingIncluded": objClass.includechildren === "T",
			"isActive": objClass.isinactive === "T" ? false : true
		}
		return data;
	}
	// TODO: account
	const createAccount = (accountRec, objCfgEconnect) => {
		let data = getDataObjAccount(accountRec);

		let fileName = accountRec.getValue("acctname") + "[Create: " + accountRec.type + "_"+ accountRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: accountRec.type,
			custrecord_scv_eco_audit_recordid: accountRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Create Account: " + accountRec.getValue("acctname"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/postingAndFinance/account`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;

			if(!!resBody?.data?.internalId) {
				let sourceExtId = resBody.data.internalId;
				submitFieldExternalId(accountRec, 'custrecord_scv_account_externalid', sourceExtId);
			}

			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const updateAccount = (accountRec, objCfgEconnect, isDataArchived) => {
		let data = getDataObjAccount(accountRec);
		if(isDataArchived === true) {
			data.isDataArchived = isDataArchived;
		}

		let fileName = accountRec.getValue("acctname") + "[Update: " + accountRec.type + "_"+ accountRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: accountRec.type,
			custrecord_scv_eco_audit_recordid: accountRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Update Account: " + accountRec.getValue("acctname"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/postingAndFinance/account`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const createAccountSubMapping = (objCfgEconnect, data, recType) => {
		let recordName = "Account Subsidiary Mapping";
		let fileName = data.externalId + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.externalId,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/postingAndFinance/accountSubsidiaryMapping`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const getDataObjAccount = (accountRec) => {
		let isinactive = accountRec.getValue("isinactive");

		let data = {
			"externalId": accountRec.id.toString(),
			"parentAccount": {
				"externalId": null
			},
			"name": accountRec.getValue("acctname"),
			"description": accountRec.getValue("description"),
			"accountType": {
				"externalId": accountRec.getValue("accttype")
			},
			"specialAccountType": {
				"externalId": null
			},
			"generalRateType": {
				"externalId": accountRec.getValue("generalrate")
			},
			"cashFlowRateType": {
				"externalId": accountRec.getValue("cashflowrate")
			},
			"restrictToClass": {
				"externalId": accountRec.getValue("class")
			},
			"restrictToDepartment": {
				"externalId": accountRec.getValue("department")
			},
			"restrictToLocation": {
				"externalId": accountRec.getValue("location")
			},
			"currency": {
				"externalId": accountRec.getValue("currency")
			},
			"bankName": accountRec.getValue("sbankname") || "",
			"bankRouting": accountRec.getValue("sbankroutingnumber") || "",
			"isInventory": accountRec.getValue("inventory"),
			"isSummary": accountRec.getValue("issummary"),
			"isRevalueOpenBalanceForForeignCurrencyTransactions": accountRec.getValue("revalue"),
			"isUseMatchBankDataAndReconcileAccountStatementPages": accountRec.getValue("reconcilewithmatching"),
			"isChildSubsidiaryMappingIncluded": accountRec.getValue("includechildren"),
			"isActive": !isinactive
		}
		return data;
	}
	// TODO: items
	const syncItemData = (curRec) => {
		let itemRec = record.load({ type: curRec.type, id: curRec.id });
		let externalid = itemRec.getValue("custitem_scv_external_id_item");

		let objCfgEconnect = getInfoEconnectConfig();
		let auditId = null;

		if(!externalid) {
			auditId = createItem(itemRec, objCfgEconnect);
		} else {
			auditId = updateItem(itemRec, objCfgEconnect);
		}
		return auditId;
	}
	const createItem = (itemRec, objCfgEconnect) => {
		let data = getDataObjItem(itemRec);

		let fileName = itemRec.getValue("itemid") + "[Create: " + itemRec.type + "_"+ itemRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: itemRec.type,
			custrecord_scv_eco_audit_recordid: itemRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Create Item: " + itemRec.getValue("itemid"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/item`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;

			if(!!resBody?.data?.internalId) {
				let sourceExtId = resBody.data.internalId;
				submitFieldExternalId(itemRec, 'custitem_scv_external_id_item', sourceExtId);
			}

			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const updateItem = (itemRec, objCfgEconnect, isDataArchived) => {
		let data = getDataObjItem(itemRec);
		deleteFieldsInObject(data, [
			"bcItemCode", "bcItemCategoryCode", "top250ControlMonthStock", "orderMultiplePurchase", 
			"banner", "stockType", "ownTransportRebateType", "ownTransportRebatePrice", "qtyRestrictionGrouping", "itemStorageCondition",
			"vatProductPostingGroup", "purchaseOrderQuantityTolerance", "purchaseOrderAmountTolerance", "purchaseOrderQuantityDifference",
			"itemReceiptQuantityTolerance", "itemReceiptAmountTolerance", "itemReceiptQuantityDifference"
		]);
		updateFieldsEmptyStringToNullable(data, [
			"itemCode", "displayName", "vendorItemNameCode", "stockDescription", "overseasPackagingDescription", "purchaseDescription", 
			"priceLabelDescription",
		]);
		if(isDataArchived === true) {
			data.isDataArchived = isDataArchived;
		}
		let fileName = itemRec.getValue("itemid") + "[Update: " + itemRec.type + "_"+ itemRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: itemRec.type,
			custrecord_scv_eco_audit_recordid: itemRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Update Item: " + itemRec.getValue("itemid"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/item`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		} catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const createItemSubMapping = (objCfgEconnect, data, recType) => {
		let recordName = "Item Subsidiary Mapping";
		let fileName = data.externalId + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.externalId,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/itemSubsidiaryMapping`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const getDataObjItem = (itemRec) => {
		let isinactive = itemRec.getValue("isinactive");
		let parent = itemRec.getValue("parent");
		let item_hierarchy = itemRec.getValue("custitem_boc_subclass2_item");
		let min_days_ship = itemRec.getValue("custitem_boc_min_days_ship") * 1;
		let min_days_receive = itemRec.getValue("custitem_boc_min_days_receive") * 1;
		let max_days_receive = itemRec.getValue("custitem_boc_max_days_receive") * 1;
		let shelf_life_days = itemRec.getValue("custitem_boc_shelf_life_days") * 1;

		if(!!item_hierarchy) {
			let itemHierarchyLKF = search.lookupFields({
				type: "customrecord_boc_subclass2_item_list",
				id: item_hierarchy,
				columns: ["custrecord_boc_code_itm"]
			});
			
			item_hierarchy = itemHierarchyLKF.custrecord_boc_code_itm;
		}

		let itemtype = itemRec.getValue("itemtype");
		if(!!itemtype) {
			itemtype = constItemType.getInternalIdByItemType(itemtype);
		}

		let data = {
			"externalId": itemRec.id.toString(),
			"parentItem": {
				"externalId": parent?.toString() || null
			},
			"tradeType": {
				"externalId": itemRec.getValue("custitem_boc_trade_type")
			},
			"itemCode": itemRec.getValue("itemid"),
			"bcItemCode": "",
			"displayName": itemRec.getValue("displayname"),
			"vendorItemNameCode": itemRec.getValue("vendorname"),
			"stockDescription": itemRec.getValue("stockdescription"),
			"overseasPackagingDescription": itemRec.getValue("custitem_boc_oversea_pkgdesc"),
			"purchaseDescription": itemRec.getValue("purchasedescription"),
			"priceLabelDescription": itemRec.getValue("custitem_boc_pricelabel_desc"),
			"originType": {
				"externalId": itemRec.getValue("custitem_boc_local_oversea")
			},
			"productEntity": {
				"externalId": null
			},
			"itemBrand": {
				"externalId": itemRec.getValue("custitem_boc_home_brand")
			},
			"primaryVendor": {
				"externalId": itemRec.getValue("custitem_boc_primary_vendor")
			},
			"isConsignment": false,
			"isReorder": itemRec.getValue("custitem_boc_reorder"),
			"reorderReason": itemRec.getValue("custitem_boc_reorder_reason"),
			"rqStatus": {
				"externalId": itemRec.getValue("custitem_boc_rq_status")
			},
			"productSeasonalType": itemRec.getValue("custitem_boc_product_seasonal_type"),
			"isReturnable": itemRec.getValue("custitem_eco_item_return_supplier"),
			"isOpenPriceFlag": itemRec.getValue("custitem_boc_open_price"),
			"primaryUnitsType": {
				"externalId": itemRec.getValue("unitstype"),
			},
			"primaryBaseUnit": {
				"externalId": itemRec.getValue("baseunit"),
			},
			"primaryStockUnit": {
				"externalId": itemRec.getValue("stockunit"),
			},
			"primaryPurchaseUnit": {
				"externalId": itemRec.getValue("purchaseunit"),
			},
			"primarySaleUnit": {
				"externalId": itemRec.getValue("saleunit"),
			},
			"primaryConsumptionUnit": {
				"externalId": itemRec.getValue("consumptionunit"),
			},
			// "einvoiceUnit": {
			// 	"externalId": itemRec.getValue("custitem_scv_einvoice_unit"),
			// },
			"subEinvoiceUnit": {
				"externalId": itemRec.getValue("custitem_scv_einvoice_unit"),
			},
			"itemImageName": "",
			"itemHierarchy": {
				"externalId": item_hierarchy,
				// "externalId": itemRec.getValue("custitem_boc_subclass2_item"),
			},
			"displayMethod": {
				"externalId": itemRec.getValue("custitem_boc_display_method"),
			},
			"bcItemCategoryCode": "",
			"itemBuyerGroup": {
				"externalId": itemRec.getValue("custitem_boc_item_buyer_grp"),
			},
			"cartonHeightCm": itemRec.getValue("custitem_boc_ctn_height") * 1,
			"cartonLengthInCm": itemRec.getValue("custitem_boc_ctn_length") * 1,
			"cartonWidthInCm": itemRec.getValue("custitem_boc_ctn_width") * 1,
			"cartonVolumeInM3": itemRec.getValue("custitem_boc_volume") * 1,
			"eachesHeightInCm": itemRec.getValue("custitem_boc_ea_height") * 1,
			"eachesLengthInCm": itemRec.getValue("custitem_boc_ea_length") * 1,
			"eachesWidthInCm": itemRec.getValue("custitem_boc_ea_width") * 1,
			"eachesVolumeInM3": itemRec.getValue("custitem_boc_item_measure") * 1,
			"eachesWeightInGram": itemRec.getValue("weight") * 1,
			"innerFraction": itemRec.getValue("custitem_scv_packing_uom_con_rate_iner") * 1,
			"cartonFraction": itemRec.getValue("custitem_scv_packing_uom_con_rate") * 1,
			"department": {
				"externalId": itemRec.getValue("department"),
			},
			"class": {
				"externalId": itemRec.getValue("class"),
			},
			"location": {
				"externalId": itemRec.getValue("location"),
			},
			"costingMethod": {
				"externalId": itemRec.getValue("costingmethod"),
			},
			"isMatchBillToReceipt": true,
			"manufacturer": itemRec.getValue("manufacturer"),
			"manufacturerPartNumber": itemRec.getValue("mpn"),
			"countryOfManufacturer": {
				"externalId": itemRec.getValue("countryofmanufacture"),
			},
			"warehouseGroup": {
				"externalId": null
			},
			"productCluster": {
				"externalId": itemRec.getValue("custitem_boc_product_cluster"),
			},
			"packCode": {
				"externalId": itemRec.getValue("custitem_boc_pack_code"),
			},
			"orderMultiplePurchase": 0,
			"minimumOrderQuantityPurchase": itemRec.getValue("custitem_boc_po_moq") * 1,
			"dateControl": {
				"externalId": itemRec.getValue("custitem_boc_date_ctrl"),
			},
			"allocationType": {
				"externalId": itemRec.getValue("custitem_boc_allocation_type"),
			},
			"isFastExpiration": itemRec.getValue("custitem_boc_fast_exp"),
			"minDaysToShip": min_days_ship?.toString(),
			"minDaysToReceive": min_days_receive?.toString(),
			"maxDaysToReceive": max_days_receive?.toString(),
			"shelfLifeDays": shelf_life_days?.toString(),
			"isEcoFriendly": itemRec.getValue("custitem_boc_eco_friendly"),
			"packagingType": {
				"externalId": null
			},
			"top250ControlMonthStock": 0,
			"isLicenseProduct": false,
			"isApplicableToEastMalaysia": false,
			"generalProductPostingGroup": {
				"externalId": null
			},
			"banner": {
				"externalId": null
			},
			"stockType": {
				"externalId": null
			},
			"hsCode": {
				"externalId": itemRec.getValue("custitem_boc_hscode")
			},
			"specialHandlingIndicator": {
				"externalId": itemRec.getValue("custitem_boc_spec_handling")
			},
			"itemStatus": {
				"externalId": itemRec.getValue("custitem_boc_item_status")
			},
			"replenishmentMethod": {
				"externalId": null
			},
			"alternateSourceItem": {
				"externalId": null
			},
			"isAutoPurchaseLeadTime": itemRec.getValue("autoleadtime"),
			"isAutoPo": itemRec.getValue("custitem_boc_autopo"),
			"ownTransportRebateType": {
				"externalId": null
			},
			"ownTransportRebatePrice": 0,
			"palletFraction": itemRec.getValue("custitem_boc_pallet_fraction") * 1,
			"qtyRestrictionGrouping": {
				"externalId": null
			},
			"itemStorageCondition": {
				"externalId": null
			},
			"vatProductPostingGroup": {
				"externalId": null
			},
			"cogsAccount": {
				"externalId": itemRec.getValue("cogsaccount")
			},
			"assetAccount": {
				"externalId": itemRec.getValue("assetaccount")
			},
			"incomeAccount": {
				"externalId": itemRec.getValue("incomeaccount")
			},
			"vendorReturnVarianceAccount": {
				"externalId": itemRec.getValue("vendreturnvarianceaccount")
			},
			"customerReturnVarianceAccount": {
				"externalId": itemRec.getValue("custreturnvarianceaccount")
			},
			"exchangeRateVarianceAccount": {
				"externalId": itemRec.getValue("billexchratevarianceacct")
			},
			"quantityVarianceAccount": {
				"externalId": itemRec.getValue("billqtyvarianceacct")
			},
			"priceVarianceAccount": {
				"externalId": itemRec.getValue("billpricevarianceacct")
			},
			"gainLossAccount": {
				"externalId": itemRec.getValue("gainlossaccount")
			},
			"purchaseOrderQuantityTolerance": 0,
			"purchaseOrderAmountTolerance": 0,
			"purchaseOrderQuantityDifference": 0,
			"itemReceiptQuantityTolerance": 0,
			"itemReceiptAmountTolerance": 0,
			"itemReceiptQuantityDifference": 0,
			"taxSchedule": {
				"externalId": itemRec.getValue("taxschedule")
			},
			"isSeasonalDemand": itemRec.getValue("seasonaldemand"),
			"isTrackLandedCost": itemRec.getValue("tracklandedcost"),
			"isChildSubsidiaryMappingIncluded": itemRec.getValue("includechildren"),
			"itemType": {
				"externalId": itemtype?.toString(),
			},
			// "itemType": {
			// 	"externalId": convertTypeOfItemToEcoValue(itemRec),
			// },
			"salesQtyCombo": {
				"externalId": itemRec.getValue("custitem_dm_item_sales_qty_combo"),
			},
			"isLoosePick": itemRec.getValue("custitem_boc_is_loose_pick_item"),
			"isActive": !isinactive
		};
		return data;
	}

	const convertTypeOfItemToEcoValue = (itemRec) => {
		let itemtype = itemRec.getValue("itemtype");

		if(itemtype === "InvtPart") return "InvtPart";
		if(itemtype === "OthCharge") return "OthCharge";
		if(itemtype === "Service") return "3";
		if(itemtype === "NonInvtPart") return "2";
		if(itemtype === "Description") return "11";
		if(itemtype === "TaxItem") return "13";
		if(itemtype === "Expense") return "19";
		if(itemtype === "Markup") return "9";
		if(itemtype === "Payment") return "12";
		if(itemtype === "Assembly") return "5";
		if(itemtype === "Discount") return "8";
		if(itemtype === "Group") return "7";

		return "";
	}

	// TODO: purchase order
	const syncPurchaseOrderData = (curRec) => {
		let poRec = record.load({ type: curRec.type, id: curRec.id });
		let externalid = poRec.getValue("custbody_scv_external_id");

		let objCfgEconnect = getInfoEconnectConfig();

		let auditId = null;
		if(!externalid) {
			auditId = createPurchaseOrder(poRec, objCfgEconnect);
		} else {
			auditId = updatePurchaseOrder(poRec, objCfgEconnect);
		}
		return auditId;
	}
	const createPurchaseOrder = (poRec, objCfgEconnect) => {
		let approvalstatus = poRec.getValue("approvalstatus");
		if(approvalstatus != ApprStatusStandard.Approved.ID) return;

		let data = getDataObjPurchaseOrder(poRec);

		let fileName = poRec.getValue("tranid") + "[Create: " + poRec.type + "_"+ poRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: poRec.type,
			custrecord_scv_eco_audit_recordid: poRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Create Purchase Order: " + poRec.getValue("tranid"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/transaction/purchaseOrder`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;

			if(!!resBody?.data?.internalId) {
				let sourceExtId = resBody.data.internalId;
				submitFieldExternalId(poRec, 'custbody_scv_external_id', sourceExtId);
			}

			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const updatePurchaseOrder = (poRec, objCfgEconnect) => {
		let approvalstatus = poRec.getValue("approvalstatus");
		if(approvalstatus != ApprStatusStandard.Approved.ID) return;

		let data = getDataObjPurchaseOrder(poRec);

		let fileName = poRec.getValue("tranid") + "[Update: " + poRec.type + "_"+ poRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: poRec.type,
			custrecord_scv_eco_audit_recordid: poRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Update Purchase Order: " + poRec.getValue("tranid"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/transaction/purchaseOrder`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const getDataObjPurchaseOrder = (poRec) => {
		let orderstatus = poRec.getValue("orderstatus");
		let subsidiary = poRec.getValue("subsidiary");
		let department = poRec.getValue("department");
		let entity = poRec.getValue("entity");
		let trandate = poRec.getValue("trandate");
		let location = poRec.getValue("location");
		let receipt_date_po = poRec.getValue("custbody_scv_expect_recp_date_po");
		let oversea_ship_date = poRec.getValue("custbody_scv_oversea_ship_date");
		let expired_date = poRec.getValue("custbody_scv_expired_date");
		let currency = poRec.getValue("currencyname");
		let exchangerate = poRec.getValue("exchangerate");
		let taxtotal = poRec.getValue("taxtotal") * 1;
		let total = poRec.getValue("total") * 1;
		let subtotal = poRec.getValue("subtotal") * 1;

		let createddate = poRec.getValue("createddate");
		let lastmodifieddate = poRec.getValue("lastmodifieddate");
		let recordcreatedby = poRec.getValue("recordcreatedby");
		let currentuseredit = poRec.getValue("custbody_scv_current_user_edit");

		let subRec = record.load({ type: "subsidiary", id: subsidiary});
		let arrLocation = queryDataLocOnTransaction([location]);
		let arrEmployee = queryDataEmployee([recordcreatedby, currentuseredit]);
		
		let objCreatedBy = arrEmployee.find(e => e.id == recordcreatedby) || {};
		let objCurUserEdit = arrEmployee.find(e => e.id == currentuseredit) || {};
		let objLocation = arrLocation.find(e => e.id == location) || {};
		let objDepartment = getDataDepOnTransaction(department);
		let objVendor = getDataVendorOnTransaction(entity);
		let objSubsidiary = getDataObjSubsidiary(subRec);
		// get data sublist
		let sl = "item";
		let totalLine = poRec.getLineCount(sl);
		// let arrItemId = groupDataByFieldId(arrSublist, "itemCode");
		let arrItem = getDataItemOnTransaction(poRec, sl, totalLine);

		let arrSublist = [];
		let totalQty = 0, totalOrderedWeightInKg = 0, totalOrderedM3 = 0;
		for(let i = 0; i < totalLine; i++) {
			let item_id = poRec.getSublistValue(sl, "item", i);
			let rate = poRec.getSublistValue(sl, "rate", i) * 1;
			let tax1amt = poRec.getSublistValue(sl, "tax1amt", i) * 1;
			let amount = poRec.getSublistValue(sl, "amount", i) * 1;
			let grossamt = poRec.getSublistValue(sl, "grossamt", i) * 1;
			let unitconversionrate = poRec.getSublistValue(sl, "unitconversionrate", i) * 1;
			let quantity = poRec.getSublistValue(sl, "quantity", i) * 1;
			let isclosed = poRec.getSublistValue(sl, "isclosed", i);
			let rate_taxinlcy = rate * exchangerate;
			let unitcost_taxincly = (rate + tax1amt) * exchangerate;
			// total
			totalQty += quantity;

			let objSublist = {
				"lineNumber": poRec.getSublistValue(sl, "line", i) * 1,
				"itemBarcode": "",
				"itemCode": poRec.getSublistValue(sl, "item_display", i),
				"legacyItemCode": "",
				"itemDescription": poRec.getSublistValue(sl, "description", i),
				"supplierItemCode": poRec.getSublistValue(sl, "custcol_scv_po_sup_barcode", i),
				"orderedUom": poRec.getSublistValue(sl, "units_display", i),
				"orderedQty": quantity,
				"qtyPerOrderedUom": unitconversionrate,
				"baseQty": (unitconversionrate * quantity),
				"unitCostExcludingTax": rate,
				"unitCostExcludingTaxInLcy": rate_taxinlcy,
				"unitCostIncludingTax": (rate + tax1amt),
				"unitCostIncludingTaxInLcy": unitcost_taxincly,
				"currencyCode": currency,
				"currencyRate": exchangerate,
				"unitDiscount": 0,
				"discountRate": 0,
				"proratedDiscount": 0,
				"discountAmount": 0,
				"discountAmountInLcy": 0,
				"taxType": poRec.getSublistValue(sl, "taxcode_display", i),
				"taxRate": poRec.getSublistValue(sl, "taxrate1", i) * 1,
				"taxAmount": tax1amt,
				"taxAmountInLcy": (tax1amt * exchangerate),
				"amountExcludingTax": amount,
				"amountExcludingTaxInLcy": (amount * exchangerate),
				"amountIncludingTax": grossamt,
				"amountIncludingTaxInLcy": (grossamt * exchangerate),
				"systemCreatedBy": objCreatedBy.entityid || "",
				"originalDocumentLineNumber": poRec.getSublistValue(sl, "custcol_scv_origin_line_num", i) || "",
				"baseUom": "",
				"orderedWeightInKg": 0,
				"orderedVolumeInM3": 0,
				"unitWeightInKg": 0,
				"unitVolumeInM3": 0,
				"baseWeightInKg": 0,
				"baseVolumeInM3": 0,
				"hsCode": "",
				"systemCreatedAt": formatDateToEcoSystem(createddate),
				"systemEditedAt": formatDateToEcoSystem(lastmodifieddate),
				"systemEditedBy": objCurUserEdit.entityid || "",
				"status": {
					"externalId": isclosed === true ? "CLD" : "APV"
				}
			};

			let obj_find_item = arrItem.find(e => e.id == item_id);
			if(!!obj_find_item) {
				let weight = obj_find_item.weight * 1;
				let item_measure = obj_find_item.custitem_boc_item_measure * 1;

				objSublist.hsCode = obj_find_item.custitem_boc_hscode?.toString() || "";
				objSublist.baseUom = obj_find_item.baseunit_name || "";
				objSublist.baseWeightInKg = (weight / 1000);
				objSublist.baseVolumeInM3 = item_measure;
				objSublist.unitWeightInKg = (weight * unitconversionrate) / 1000;
				objSublist.unitVolumeInM3 = (item_measure * unitconversionrate);

				if(objSublist.orderedUom == objSublist.baseUom) {
					objSublist.orderedWeightInKg = (quantity * weight) / 1000;
					objSublist.orderedVolumeInM3 = (quantity * item_measure);
				} else {
					objSublist.orderedWeightInKg = (quantity * (unitconversionrate * weight)) / 1000;
					objSublist.orderedVolumeInM3 = (quantity * (unitconversionrate * item_measure));
				}
				// total
				totalOrderedWeightInKg += objSublist.orderedWeightInKg;
				totalOrderedM3 += objSublist.orderedVolumeInM3;
			}
			roundDecimalNumberInObj(objSublist, [
				"orderedQty", "qtyPerOrderedUom", "baseQty", "currencyRate", "unitCostExcludingTax", "unitCostExcludingTaxInLcy", 
				"unitCostIncludingTax", "unitCostIncludingTaxInLcy", "unitDiscount", "discountRate", "proratedDiscount", "discountAmount", 
				"discountAmountInLcy", "taxRate", "taxAmount", "taxAmountInLcy", "amountExcludingTax", "amountExcludingTaxInLcy", "amountIncludingTax", 
				"amountIncludingTaxInLcy", "unitWeightInKg", "orderedWeightInKg", "unitVolumeInM3", "orderedVolumeInM3", "baseWeightInKg", "baseVolumeInM3"
			]);
			// push data object
			arrSublist.push(objSublist);
		}

		let data = {
			"externalId": poRec.id.toString(),
			"subsidiary": {
				"externalId": subsidiary
			},
			"documentNo": poRec.getValue("tranid"),
			"sourceTransactionCode": poRec.getText("custbody_scv_po_type"),
			"documentDate": formatDateToEcoSystem(trandate),
			"expectedReceiptDate": formatDateToEcoSystem(receipt_date_po),
			"billOfLadingDate": formatDateToEcoSystem(oversea_ship_date),
			"expiryDate": formatDateToEcoSystem(expired_date),
			"actualCloseDocumentDate": formatDateToEcoSystem(expired_date),
			"department": {
				"externalId": department
			},
			"buyerCode": poRec.getText("subsidiary"),
			"buyerName": poRec.getText("subsidiary"),
			"buyerCompanyRegistrationNo": "",
			"buyerTaxIdentificationNo": "",
			"buyerGstRegistrationNo": "",
			"buyerAddressLine1": objSubsidiary.addressLine1,
			"buyerAddressLine2": objSubsidiary.addressLine2,
			"buyerAddressLine3": objSubsidiary.addressLine3,
			"buyerPostalCode": objSubsidiary.postalCode,
			"buyerState": objSubsidiary.state,
			"buyerCountry": objSubsidiary.country.externalId,
			"buyerPhoneNo": objSubsidiary.phoneNo,
			"buyerFaxNo": objSubsidiary.faxNo,
			"buyerEmail": objSubsidiary.email,
			"buyerDepartmentCode": department,
			"buyerDepartmentDescription": objDepartment.custrecord_scv_memo_dept,
			"vendorCode": objVendor.entityid,
			"legacyVendorCode": "",
			"vendorName": poRec.getText("entity"),
			"vendorTaxIdentificationNo": "",
			"vendorGstRegistrationNo": "",
			"vendorCompanyRegistrationNo": objVendor.custentity_scv_tax_number || "",
			"vendorAddressLine1": objVendor.addr1 || "",
			"vendorAddressLine2": objVendor.addr2 || "",
			"vendorAddressLine3": objVendor.addr3 || "",
			"vendorPostalCode": objVendor.zip || "",
			"vendorState": objVendor.state || "",
			"vendorCountry": objVendor.country || "",
			"vendorContactName": objVendor.contact || "",
			"vendorPhoneNo": objVendor.custentity_scv_phone_no || "",
			"vendorFaxNo": objVendor.fax || "",
			"vendorEmail": objVendor.email || "",
			"location": {
				"externalId": location
			},
			"locationCode": objLocation.custrecord_scv_location_code || "",
			"legacyLocationCode": "",
			"locationFaxNo": "",
			"locationPhoneNo": "",
			"locationDescription": "",
			"locationName": objLocation.name || "",
			"locationType": objLocation.locationtype?.toString() || "",
			"locationAddressLine1": objLocation.addr1 || objLocation.addressee || "",
			"locationAddressLine2": objLocation.addr2 || "",
			"locationAddressLine3": objLocation.addr3 || "",
			"locationPostalCode": objLocation.zip || "",
			"locationState": objLocation.state || "",
			"locationCountry": objLocation.country || "",
			"locationEmail": objLocation.custrecord_scv_location_mail || "",
			"totalDiscount": 0,
			"totalDiscountInLcy": 0,
			"totalTaxAmount": taxtotal,
			"totalTaxAmountInLcy": (taxtotal * exchangerate),
			"totalAmountExcludingDiscount": total,
			"totalAmountExcludingDiscountInLcy": (total * exchangerate),
			"totalAmountExcludingTax": subtotal,
			"totalAmountExcludingTaxInLcy": (subtotal * exchangerate),
			"totalAmountIncludingTax": total,
			"totalAmountIncludingTaxInLcy": (total * exchangerate),
			"termsCode": poRec.getText("terms"),
			"termsDescription": poRec.getText("terms"),
			"currencyCode": currency,
			"currencyRate": exchangerate,
			"taxType": "",
			"taxRate": 0,
			"totalLine": totalLine,
			"totalOrderedQty": totalQty,
			"totalOrderedWeightInKg": totalOrderedWeightInKg,
			"totalOrderedM3": totalOrderedM3,
			"remarks": poRec.getValue("custbody_scv_purchase_note"),
			"memo": poRec.getValue("memo"),
			"referenceNo1": poRec.getValue("custbody_scv_container_no"),
			"referenceNo2": "",
			"reasonForCancellationOrClosure": poRec.getValue("custbody_scv_reason_close"),
			"isExcludedForServiceLevelAgreementReport": false,
			"systemCreatedAt": formatDateToEcoSystem(createddate),
			"systemCreatedBy": objCreatedBy.entityid || "",
			"systemEditedAt": formatDateToEcoSystem(lastmodifieddate),
			"systemEditedBy": objCurUserEdit.entityid || "",
			"employee": {
				"externalId": poRec.getValue("employee")
			},
			"status": {
				"externalId": orderstatus == "H" ? "CLD" : "APV"
			},
			"purchaseOrderType": {
				"externalId": "1"
			},
			"isVanSales": poRec.getValue("custbody_boc_is_van_sale"),
			"referenceDocumentNumber": poRec.getValue("custbody_boc_ref_doc_number"),
			"details": arrSublist,
		};
		roundDecimalNumberInObj(data, [
			"currencyRate", "taxRate", "totalDiscount", "totalDiscountInLcy", "totalTaxAmount", "totalTaxAmountInLcy", "totalAmountExcludingDiscount", 
			"totalAmountExcludingDiscountInLcy", "totalAmountExcludingTax", "totalAmountExcludingTaxInLcy", "totalAmountIncludingTax", "totalAmountIncludingTaxInLcy", 
			"totalOrderedQty", "totalOrderedWeightInKg", "totalOrderedM3"
		]);
		return data;
	}

	const syncEmployeeData = (curRec) => {
		let employeeRec = record.load({ type: curRec.type, id: curRec.id });
		let externalid = employeeRec.getValue("custentity_scv_external_id_employee");

		let objCfgEconnect = getInfoEconnectConfig();

		let auditId = null;
		if(!externalid) {
			auditId = createEmployee(employeeRec, objCfgEconnect);
		} else {
			auditId = updateEmployee(employeeRec, objCfgEconnect);
		}
		return auditId;
	}

	const syncVietNamUnitData = (curRec) => {
		let unitRec = record.load({ type: curRec.type, id: curRec.id });
		let externalid = unitRec.getValue("custrecord_scv_ext_source_id");

		let objCfgEconnect = getInfoEconnectConfig();

		let auditId = null;
		if(!externalid) {
			auditId = createVietNamUnit(unitRec, objCfgEconnect);
		} else {
			auditId = updateVietNamUnit(unitRec, objCfgEconnect);
		}
		return auditId;
	}

	// TODO: transfer order
	const syncTransferOrderData = (curRec) => {
		let toRec = record.load({ type: curRec.type, id: curRec.id });
		let externalid = toRec.getValue("custbody_scv_external_id");

		let objCfgEconnect = getInfoEconnectConfig();

		let auditId = null;
		if(!externalid) {
			auditId = createTransferOrder(toRec, objCfgEconnect);
		} else {
			auditId = updateTransferOrder(toRec, objCfgEconnect);
		}
		return auditId;
	}
	const createTransferOrder = (toRec, objCfgEconnect) => {
		let location = toRec.getValue("location");
		let transferlocation = toRec.getValue("transferlocation");
		let arrLocation = queryDataLocOnTransaction([location, transferlocation]);

		let isSync = getDataSyncTransferOrder(toRec, arrLocation);
		if(isSync === false) return;
		let data = getDataObjTransferOrder(toRec, arrLocation);

		let fileName = toRec.getValue("tranid") + "[Create: " + toRec.type + "_"+ toRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: toRec.type,
			custrecord_scv_eco_audit_recordid: toRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Create Transfer Order: " + toRec.getValue("tranid"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/transaction/transferOrder`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;

			if(!!resBody?.data?.internalId) {
				let sourceExtId = resBody.data.internalId;
				submitFieldExternalId(toRec, 'custbody_scv_external_id', sourceExtId);
			}

			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const updateTransferOrder = (toRec, objCfgEconnect) => {
		let location = toRec.getValue("location");
		let transferlocation = toRec.getValue("transferlocation");
		let arrLocation = queryDataLocOnTransaction([location, transferlocation]);

		let isSync = getDataSyncTransferOrder(toRec, arrLocation);
		if(isSync === false) return;
		let data = getDataObjTransferOrder(toRec, arrLocation);

		let fileName = toRec.getValue("tranid") + "[Update: " + toRec.type + "_"+ toRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: toRec.type,
			custrecord_scv_eco_audit_recordid: toRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Update Transfer Order: " + toRec.getValue("tranid"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/transaction/transferOrder`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const getDataSyncTransferOrder = (toRec) => {
		let orderstatus = toRec.getValue("orderstatus");
		if(orderstatus == OrderStatus.PendingApproval.ID) {
			return false;
		}
		return true;
	}

	const getDataObjTransferOrder = (toRec, arrLocation) => {
		let icto = toRec.getValue("icto");
		let orderstatus = toRec.getValue("orderstatus");
		let currency = toRec.getValue("currencyname");
		let exchangerate = toRec.getValue("exchangerate");
		let trandate = toRec.getValue("trandate");

		let department = toRec.getValue("department");
		let location = toRec.getValue("location");
		let transferlocation = toRec.getValue("transferlocation");
		let oversea_ship_date = toRec.getValue("custbody_scv_oversea_ship_date");
		let total = toRec.getValue("total") * 1;

		let createddate = toRec.getValue("createddate");
		let lastmodifieddate = toRec.getValue("lastmodifieddate");
		let recordcreatedby = toRec.getValue("recordcreatedby");
		let currentuseredit = toRec.getValue("custbody_scv_current_user_edit");
		let arrEmployee = queryDataEmployee([recordcreatedby, currentuseredit]);

		let objCreatedBy = arrEmployee.find(e => e.id == recordcreatedby) || {};
		let objCurUserEdit = arrEmployee.find(e => e.id == currentuseredit) || {};
		let objFromLocation = arrLocation.find(e => e.id == location) || {};
		let objToLocation = arrLocation.find(e => e.id == transferlocation) || {};
		// get data sublist
		// log.error("arrEmployee", arrEmployee);
		let sl = "item";
		let totalLine = toRec.getLineCount(sl);
		let arrItem = getDataItemOnTransaction(toRec, sl, totalLine);
		let arrTransLine = getAllDataTransactionLineTO(toRec.id);

		let arrSublist = [];
		let totalOrderedWeightInKg = 0, totalOrderedM3 = 0;
		for(let i = 0; i < totalLine; i++) {
			let item_id = toRec.getSublistValue(sl, "item", i);
			let originalLineNum = toRec.getSublistValue(sl, "custcol_scv_origin_line_num", i) || "";
			let rate = toRec.getSublistValue(sl, "rate", i) * 1;
			let amount = toRec.getSublistValue(sl, "amount", i) * 1;
			let unitconversionrate = toRec.getSublistValue(sl, "unitconversionrate", i) * 1;
			let quantity = toRec.getSublistValue(sl, "quantity", i) * 1;
			let isclosed = toRec.getSublistValue(sl, "isclosed", i);

			let objShipping = arrTransLine.find(e => e.item == item_id && e.custcol_scv_origin_line_num == originalLineNum && e.transactionlinetype === TransactionLineType.SHIPPING) || {};
			let objReceiving = arrTransLine.find(e => e.item == item_id && e.custcol_scv_origin_line_num == originalLineNum && e.transactionlinetype === TransactionLineType.RECEIVING) || {};
			let objSublist = {
				"lineNumber": toRec.getSublistValue(sl, "line", i) * 1,
				"itemReceiptLineNumber": (objReceiving.line * 1) || 0,
				"itemFulFillmentLineNumber": (objShipping.line * 1) || 0,
				"originalDocumentLineNumber": originalLineNum,
				"itemBarcode": "",
				"legacyItemCode": "",
				"itemCode": toRec.getSublistValue(sl, "item_display", i),
				"itemDescription": toRec.getSublistValue(sl, "description", i),
				"orderedUom": toRec.getSublistValue(sl, "units_display", i),
				"orderedQty": quantity,
				"qtyPerOrderedUom": unitconversionrate,
				"baseQty": (unitconversionrate * quantity),
				"currencyCode": currency,
				"currencyRate": exchangerate,
				"unitCostExcludingTax": rate,
				"unitCostExcludingTaxInLcy": (rate * exchangerate),
				"unitCostIncludingTax": rate,
				"unitCostIncludingTaxInLcy": (rate * exchangerate),
				"unitDiscount": 0,
				"discountRate": 0,
				"proratedDiscount": 0,
				"discountAmount": 0,
				"discountAmountInLcy": 0,
				"taxType": "",
				"taxRate": 0,
				"taxAmount": 0,
				"taxAmountInLcy": 0,
				"amountExcludingTax": amount,
				"amountExcludingTaxInLcy": (amount * exchangerate),
				"amountIncludingTax": amount,
				"amountIncludingTaxInLcy": (amount * exchangerate),
				"baseUom": "",
				"hsCode": "",
				"unitWeightInKg": 0,
				"orderedWeightInKg": 0,
				"unitVolumeInM3": 0,
				"orderedVolumeInM3": 0,
				"baseWeightInKg": 0,
				"baseVolumeInM3": 0,
				"systemCreatedBy": objCreatedBy.entityid,
				"systemCreatedAt": formatDateToEcoSystem(createddate),
				"systemEditedAt": formatDateToEcoSystem(lastmodifieddate),
				"systemEditedBy": objCurUserEdit.entityid,
				"status": {
					"externalId": isclosed === true ? "CLD" : "APV"
				}
			};

			let obj_find_item = arrItem.find(e => e.id == item_id);
			if(!!obj_find_item) {
				let weight = obj_find_item.weight * 1;
				let item_measure = obj_find_item.custitem_boc_item_measure * 1;

				objSublist.hsCode = obj_find_item.custitem_boc_hscode?.toString() || "";
				objSublist.baseUom = obj_find_item.baseunit_name || "";

				objSublist.unitWeightInKg = (weight * unitconversionrate) / 1000;
				objSublist.unitVolumeInM3 = (item_measure * unitconversionrate);
				objSublist.baseWeightInKg = (weight / 1000);
				objSublist.baseVolumeInM3 = item_measure;

				if(objSublist.orderedUom == objSublist.baseUom) {
					objSublist.orderedWeightInKg = (quantity * weight) / 1000;
					objSublist.orderedVolumeInM3 = (quantity * item_measure);
				} else {
					objSublist.orderedWeightInKg = (quantity * (unitconversionrate * weight)) / 1000;
					objSublist.orderedVolumeInM3 = (quantity * (unitconversionrate * item_measure));
				}

				totalOrderedWeightInKg += objSublist.orderedWeightInKg;
				totalOrderedM3 += objSublist.orderedVolumeInM3;
			}
			roundDecimalNumberInObj(objSublist, [
				"orderedQty", "qtyPerOrderedUom", "baseQty", "currencyRate", "unitCostExcludingTax", "unitCostExcludingTaxInLcy", 
				"unitCostIncludingTax", "unitCostIncludingTaxInLcy", "unitDiscount", "discountRate", "proratedDiscount", "discountAmount", 
				"discountAmountInLcy", "taxRate", "taxAmount", "taxAmountInLcy", "amountExcludingTax", "amountExcludingTaxInLcy", "amountIncludingTax", 
				"amountIncludingTaxInLcy", "unitWeightInKg","orderedWeightInKg","unitVolumeInM3","orderedVolumeInM3","baseWeightInKg",
				"baseVolumeInM3"
			]);
			// push data object
			arrSublist.push(objSublist);
		}

		let data = {
			"externalId": toRec.id.toString(),
			"transferOrderType": {
				"externalId": ""
			},
			"documentNo": toRec.getValue("tranid"),
			"sourceTransactionCode": toRec.getText("custbody_scv_transfer_type"),
			"documentDate": formatDateToEcoSystem(trandate),
			"expectedDeliveryDate": formatDateToEcoSystem(oversea_ship_date),
			"department": {
				"externalId": department
			},
			"project": toRec.getValue("cseg_scv_sg_proj"),
			"saleChannel": toRec.getValue("cseg_scv_channel"),
			"fromSubsidiary": {
				"externalId": toRec.getValue("subsidiary"),
			},
			"fromLocationCode": objFromLocation.custrecord_scv_location_code || "",
			"fromLegacyLocationCode": "",
			"fromLocationName": objFromLocation.name || "",
			"fromLocationDescription": "",
			"fromLocationType": objFromLocation.locationtype?.toString() || "",
			"fromLocationAddressLine1": objFromLocation.addr1 || objFromLocation.addressee || "",
			"fromLocationAddressLine2": objFromLocation.addr2 || "",
			"fromLocationAddressLine3": objFromLocation.addr3 || "",
			"fromLocationPostalCode": objFromLocation.zip || "",
			"fromLocationState": objFromLocation.state || "",
			"fromLocationCountry": objFromLocation.country || "",
			"fromLocationPhoneNo": "",
			"fromLocationFaxNo": "",
			"fromLocationEmail": objFromLocation.custrecord_scv_location_mail || "",
			"toSubsidiary": {
				"externalId": toRec.getValue("tosubsidiary"),
			},
			"toLocationCode": objToLocation.custrecord_scv_location_code || "",
			"toLegacyLocationCode": "",
			"toLocationDescription": "",
			"toLocationName": objToLocation.name || "",
			"toLocationType": objToLocation.locationtype?.toString() || "",
			"toLocationAddressLine1": objToLocation.addr1 || objToLocation.addressee || "",
			"toLocationAddressLine2": objToLocation.addr2 || "",
			"toLocationAddressLine3": objToLocation.addr3 || "",
			"toLocationPostalCode": objToLocation.zip || "",
			"toLocationState": objToLocation.state || "",
			"toLocationCountry": objToLocation.country || "",
			"toLocationPhoneNo": "",
			"toLocationFaxNo": "",
			"toLocationEmail": objToLocation.custrecord_scv_location_mail || "",
			"incoterm": {
				"externalId": toRec.getValue("incoterm")
			},
			"shipmentCarrierCode": toRec.getValue("shipcarrier") || "",
			"shipmentCarrierName": toRec.getText("shipcarrier") || "",
			"shippingMethod": toRec.getValue("shipmethod"),
			"taxType": "",
			"taxRate": 0,
			"totalDiscount": 0,
			"totalDiscountInLcy": 0,
			"totalTaxAmount": 0,
			"totalTaxAmountInLcy": 0,
			"totalAmountExcludingDiscount": total,
			"totalAmountExcludingDiscountInLcy": (total * exchangerate),
			"totalAmountExcludingTax": total,
			"totalAmountExcludingTaxInLcy": (total * exchangerate),
			"totalAmountIncludingTax": total,
			"totalAmountIncludingTaxInLcy": (total * exchangerate),
			"totalLine": totalLine,
			"totalOrderedQty": toRec.getValue("custbody_scv_ito_order_qty") * 1,
			"totalOrderedWeightInKg": totalOrderedWeightInKg,
			"totalOrderedM3": totalOrderedM3,
			"remarks": toRec.getValue("memo"),
			"memo": toRec.getValue("memo"),
			"referenceNo1": toRec.getValue("custbody_scv_container_no"),
			"referenceNo2": "",
			"status": {
				"externalId": orderstatus == "H" ? "CLD" : "APV"
			},
			"reasonForCancellationOrClosure": toRec.getValue("custbody_scv_reason_close"),
			"systemCreatedBy": objCreatedBy.entityid,
			"systemCreatedAt": formatDateToEcoSystem(createddate),
			"systemEditedAt": formatDateToEcoSystem(lastmodifieddate),
			"systemEditedBy": objCurUserEdit.entityid,
			"employee": {
				"externalId": toRec.getValue("employee")
			},
			"transferOrderType": {
				"externalId": getTransferOrderType(objFromLocation, icto),
			},
			"crossDockNo": toRec.getText("custbody_boc_cd_code"),
			"details": arrSublist
		};

		// TODO: 2025-06-11: đồng bộ thêm record transfer order và thêm điều icto = F thì ko truyền to subsidiary
		if(icto === "F" || icto === false) {
			delete data["toSubsidiary"];
		}

		roundDecimalNumberInObj(data, [
			"taxRate", "totalDiscount", "totalDiscountInLcy", "totalTaxAmount", "totalTaxAmountInLcy", "totalAmountExcludingDiscount", 
			"totalAmountExcludingDiscountInLcy", "totalAmountExcludingTaxInLcy", "totalAmountIncludingTax", 
			"totalAmountIncludingTaxInLcy", "totalOrderedQty", "totalOrderedWeightInKg", "totalOrderedM3"
		]);
		return data;
	}

	const getTransferOrderType = (objFromLocation, icto) => {
		let type = "";
		// to
		if(icto === "F" || icto === false) {
			type = (objFromLocation.custrecord_boc_location_wh == LocationType.Warehouse.ID) ? "1" : "3";
		} 
		// ito
		else {
			type = (objFromLocation.custrecord_boc_location_wh == LocationType.Warehouse.ID) ? "2" : "4";
		}
		return type;
	}

	const getDataTransactionLineTO = (toId) => {
		let resultSQL = query.runSuiteQL({
			query: `SELECT id, linesequencenumber, item, transactionlinetype, custcol_scv_origin_line_num 
			FROM transactionline 
			WHERE transaction = ${toId}`
		});
		let data = resultSQL.asMappedResults();
		return data;
	}

	const getAllDataTransactionLineTO = (internalId) => {
		let arrTransLineType = [TransactionLineType.ITEM, TransactionLineType.SHIPPING, TransactionLineType.RECEIVING];
		let myFilters = [
			["type", "anyof", "TrnfrOrd"], 
			"AND", 
			["mainline", "is", "F"], 
			"AND", 
			["taxline", "is", "F"], 
			"AND", 
			["internalid", "anyof", internalId], 
			"AND", 
			["transactionlinetype", "anyof", arrTransLineType]
		];
		
		let myColumns = [
			"internalid", "item", "custcol_scv_origin_line_num", "line",
			"linesequencenumber", "transactionlinetype"
		];

		let arrResult = getAllDataCreateSavedSearch("transaction", myFilters, myColumns);
		return arrResult;
	}

	const queryDataEmployee = (arrEntityId) => {
		arrEntityId = arrEntityId.filter(e => !!e);

		let resultSQL = query.runSuiteQL({
			query: `SELECT
				id, entityid
			FROM
				employee
			WHERE id IN ('${arrEntityId.join("', '")}')`
		});
		let data = resultSQL.asMappedResults();
		return data;
	}


	const queryDataLocOnTransaction = (arrLocation) => {
		arrLocation = arrLocation.filter(e => !!e);
		if(arrLocation.length === 0) return [];
		let resultSQL = query.runSuiteQL({
			query: `SELECT
				Location.id,
				Location.custrecord_boc_location_wh,
				Location.Name,
				BUILTIN.DF(Location.LocationType) as LocationType,
				Location.custrecord_scv_location_mail,
				Location.custrecord_scv_location_code,
				Address.Zip,
				Address.State,
				Address.Addressee,
				Address.Addr1,
				Address.Addr2,
				Address.Addr3,
				Address.Country
			FROM
				Location
			LEFT OUTER JOIN LocationMainAddress AS Address ON
				(Address.Nkey = Location.MainAddress)
			WHERE Location.id IN ('${arrLocation.join("', '")}')`
		});
		let data = resultSQL.asMappedResults();
		return data;
	}

	const getDataDepOnTransaction = (department) => {
		let objRes = {
			"custrecord_scv_memo_dept": ""
		};
		if(!!department) {
			let departmentLKF = search.lookupFields({
				type: "department",
				id: department,
				columns: ["custrecord_scv_memo_dept"]
			});
			objRes.custrecord_scv_memo_dept = departmentLKF.custrecord_scv_memo_dept || "";
		}
		return objRes;
	}

	const getDataVendorOnTransaction = (vendorId) => {
		let resultSQL = query.runSuiteQL({
			query: `SELECT
				v.id, v.entityid, v.email, v.fax, v.contact,
				v.custentity_scv_phone_no, v.custentity_scv_tax_number,
				address.addr1, address.addr2, address.addr3,
				address.country, address.state, address.zip
				FROM Vendor v
				LEFT JOIN EntityAddress address
				ON (v.DefaultShippingAddress = address.nKey)
				WHERE v.id = ${vendorId}`
		});
		resultSQL = resultSQL.asMappedResults();
		return resultSQL.length > 0 ? resultSQL[0] : {};
	}

	const getDataItemOnTransaction = (poRec, sl, totalLine) => {
		let arrItemId = [];
		for(let i = 0; i < totalLine; i++) {
			let item_id = poRec.getSublistValue(sl, "item", i);
			arrItemId.push(item_id);
		}
		let resultSQL = query.runSuiteQL({
			query: `SELECT 
				i.id, 
				i.itemid, 
				i.weight, 
				i.custitem_boc_item_measure, 
				i.custitem_boc_hscode, 
				uom.unitname AS baseunit_name,
				uom.internalid AS baseunit_id
			FROM 
				item i
			LEFT JOIN 
				unitstype ut ON i.unitstype = ut.id
			LEFT JOIN 
				unitstypeUOM uom ON uom.unitstype = ut.id AND uom.baseunit = 'T'
			WHERE i.id IN ('${arrItemId.join("', '")}')`,
		});
		resultSQL = resultSQL.asMappedResults();
		return resultSQL;
	}
	// TODO: PLU Barcode
	const syncPLUBarcodeData = (curRec) => {
		let pluBarcodeRec = record.load({ type: curRec.type, id: curRec.id });
		let externalid = pluBarcodeRec.getValue("custrecord_scv_plu_externalid");

		let objCfgEconnect = getInfoEconnectConfig();
		let auditId = null;

		if(!externalid) {
			auditId = createPLUBarcode(pluBarcodeRec, objCfgEconnect);
		} else {
			auditId = updatePLUBarcode(pluBarcodeRec, objCfgEconnect);
		}
		return auditId;
	}
	const createPLUBarcode = (pluBarcodeRec, objCfgEconnect) => {
		let data = getDataObjPLUBarcode(pluBarcodeRec);

		let fileName = pluBarcodeRec.getValue("name") + "[Create: " + pluBarcodeRec.type + "_"+ pluBarcodeRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: pluBarcodeRec.type,
			custrecord_scv_eco_audit_recordid: pluBarcodeRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Create PLU Barcode: " + pluBarcodeRec.getValue("name"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/itemBarcode`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			

			if(!!resBody?.data?.internalId) {
				let sourceExtId = resBody.data.internalId;
				submitFieldExternalId(pluBarcodeRec, 'custrecord_scv_plu_externalid', sourceExtId);
			}

			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const updatePLUBarcode = (pluBarcodeRec, objCfgEconnect, isDataArchived) => {
		let data = getDataObjPLUBarcode(pluBarcodeRec);
		updateFieldsEmptyStringToNullable(data, ["barcode"]);
		if(isDataArchived === true) {
			data.isDataArchived = isDataArchived;
		}
		let fileName = pluBarcodeRec.getValue("name") + "[Update: " + pluBarcodeRec.type + "_"+ pluBarcodeRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: pluBarcodeRec.type,
			custrecord_scv_eco_audit_recordid: pluBarcodeRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Update PLU Barcode: " + pluBarcodeRec.getValue("name"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/itemBarcode`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const getDataObjPLUBarcode = (pluBarcodeRec) => {
		let isinactive = pluBarcodeRec.getValue("isinactive");
		let data = {
			"externalId": pluBarcodeRec.id.toString(),
			"item": {
				"externalId": pluBarcodeRec.getValue("custrecord_scv_plu_barcode_item")
			},
			"unitOfMeasure": {
				"externalId": pluBarcodeRec.getValue("custrecord_scv_plu_unit")
			},
			"barcode": pluBarcodeRec.getValue("name"),
			"isActive": !isinactive
		};
		return data;
	}

	// TODO: item location configuration
	const syncItemLocationConfigData = (curRec) => {
		let ilcRec = record.load({ type: curRec.type, id: curRec.id });
		let externalid = ilcRec.getValue("custrecord_boc_ext_source_id");

		let objCfgEconnect = getInfoEconnectConfig();
		let auditId = null;
		if(!externalid) {
			auditId = createItemLocationConfig(ilcRec, objCfgEconnect);
		} else {
			auditId = updateItemLocationConfig(ilcRec, objCfgEconnect);
		}
		return auditId;
	}
	const createItemLocationConfig = (ilcRec, objCfgEconnect) => {
		let data = getDataObjItemLocationConfig(ilcRec);

		let fileName = ilcRec.getValue("name") + "[Create: " + ilcRec.type + "_"+ ilcRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: ilcRec.type,
			custrecord_scv_eco_audit_recordid: ilcRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Create Item Location Configuration: " + ilcRec.getValue("name"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/itemLocationConfig/itemLocationConfiguration`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;

			if(!!resBody?.data?.internalId) {
				let sourceExtId = resBody.data.internalId;
				// submitFieldExternalId(ilcRec, 'custrecord_boc_ext_source_id', sourceExtId);
				ilcRec.setValue("custrecord_boc_ext_source_id", sourceExtId);
				ilcRec.save({enableSourcing: false, ignoreMandatoryFields: true});
			}

			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const updateItemLocationConfig = (ilcRec, objCfgEconnect) => {
		let data = getDataObjItemLocationConfig(ilcRec);

		let fileName = ilcRec.getValue("name") + "[Update: " + ilcRec.type + "_"+ ilcRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: ilcRec.type,
			custrecord_scv_eco_audit_recordid: ilcRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Update Item Location Configuration: " + ilcRec.getValue("name"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/itemLocationConfig/itemLocationConfiguration`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const getDataObjItemLocationConfig = (ilcRec) => {
		let objWeek = getDataWeekItemLocationConfig(ilcRec);
		let data = {
			"externalId": ilcRec.id.toString(),
			"subsidiary": {
				"externalId": ilcRec.getValue("subsidiary")
			},
			"vendor": {
				"externalId": ilcRec.getValue("custrecord_boc_locn_vendor")
			},
			"item": {
				"externalId": ilcRec.getValue("item")
			},
			"location": {
				"externalId": ilcRec.getValue("location")
			},
			"name": ilcRec.getValue("name"),
			"memo": ilcRec.getValue("memo"),
			"primarySourcingWarehouse": {
				"externalId": ""
			},
			"purchaseLeadTime": ilcRec.getValue("leadtime") * 1,
			"reorderPoint": ilcRec.getValue("reorderpoint") * 1,
			"reorderPointLevelDays": ilcRec.getValue("custrecord_boc_reorder_days") * 1,
			"preferredStockLevel": ilcRec.getValue("preferredstocklevel") * 1,
			"preferredStockLevelDays": ilcRec.getValue("custrecord_boc_preferred_days") * 1,
			"distributionUom": {
				"externalId": ilcRec.getValue("custrecord_boc_distr_uom"),
			},
			"distributionReorderMultiple": ilcRec.getValue("custrecord_boc_distr_reorder_multiple") * 1,
			"adjustmentQuantity": ilcRec.getValue("custrecord_boc_adj_quantity") * 1,
			"backwardConsumptionDays": 0,
			"bufferStock": ilcRec.getValue("custrecord_boc_buffer_stock") * 1,
			"inventoryClassification": 0,
			"countInterval": 0,
			"defaultReturnCost": ilcRec.getValue("defaultreturncost") * 1,
			"demandAverage": ilcRec.getValue("custrecord_boc_demand_average") * 1,
			"demandSource": {
				"externalId": ""
			},
			"demandTimeFence": 0,
			"firmReleaseAdvanceWarningThreshold": 0,
			"fixedLotMultiple": 0,
			"fixedLotSize": 0,
			"forwardConsumptionDays": 0,
			"highImpactLateDemandThreshold": 0,
			"latePeriodDays": 0,
			"leadTimeOffset": 0,
			"itemListInOut": {
				"externalId": ilcRec.getValue("custrecord_boc_list_inout"),
			},
			"itemListInOutReasonCode": {
				"externalId": ilcRec.getValue("custrecord_boc_list_inout_reason"),
			},
			"lotSizingMethod": {
				"externalId": ""
			},
			"minimumOrderQuantity": 0,
			"minimumReorderQuantity": 0,
			"minimumRescheduleDays": 0,
			"pastDueForecastDays": 0,
			"periodsOfSupplyIncrement": 0,
			"periodsOfSupplyType": {
				"externalId": ""
			},
			"planningTimeFence": 0,
			"poReceiptCost": 0,
			"projectedDemandByLeadTime": ilcRec.getValue("custrecord_boc_demand_by_leadtime") * 1,
			"promoUpliftModifer": 0,
			"rescheduleHorizon": 0,
			"rescheduleInDays": 0,
			"rescheduleOutDays": 0,
			"safetyStockLevel": ilcRec.getValue("safetystocklevel") * 1,
			"supplyType": {
				"externalId": ""
			},
			"isInspectionHoldItem": ilcRec.getValue("custrecord_boc_inspection_hold_item"),
			...objWeek
		};
		return data;
	}

	const getDataWeekItemLocationConfig = (ilcRec) => {
		let objRes = {};
		for(let i = 1; i <= 52; i++) {
			objRes["week" + i] = ilcRec.getValue("custrecord_boc_week" + i) || 0;
		}
		return objRes;
	}

	// TODO: Item fulfillment
	const syncItemFulfillmentData = (curRec) => {
		let itfRec = record.load({ type: curRec.type, id: curRec.id });
		let externalid = itfRec.getValue("custbody_scv_ext_id_if_ir");

		let objCfgEconnect = getInfoEconnectConfig();

		let auditId = null;
		if(!externalid) {
			auditId = createItemFulfillment(itfRec, objCfgEconnect);
		} else {
			auditId = updateItemFulfillment(itfRec, objCfgEconnect);
		}
		return auditId;
	}

	const createItemFulfillment = (itfRec, objCfgEconnect) => {
		let data = getDataObjItemFulfillment(itfRec);

		let fileName = itfRec.getValue("tranid") + "[Create: " + itfRec.type + "_"+ itfRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: itfRec.type,
			custrecord_scv_eco_audit_recordid: itfRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Create Item Fulfillment: " + itfRec.getValue("tranid"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/transaction/itemFulfillment`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;

			if(!!resBody?.data?.internalId) {
				let sourceExtId = resBody.data.internalId;
				submitFieldExternalId(itfRec, 'custbody_scv_ext_id_if_ir', sourceExtId);
			}

			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		} catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const updateItemFulfillment = (itfRec, objCfgEconnect) => {
		let data = getDataObjItemFulfillment(itfRec);

		let fileName = itfRec.getValue("tranid") + "[Update: " + itfRec.type + "_"+ itfRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: itfRec.type,
			custrecord_scv_eco_audit_recordid: itfRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Update Item Fulfillment: " + itfRec.getValue("tranid"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/transaction/itemFulfillment`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;

			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		} catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const getDataObjItemFulfillment = (itfRec) => {
		// header
		let trandate = itfRec.getValue("trandate");
		let createdfrom = itfRec.getValue("createdfrom");

		let currency = itfRec.getValue("currencycode");
		let createddate = itfRec.getValue("createddate");
		let lastmodifieddate = itfRec.getValue("lastmodifieddate");
		let recordcreatedby = itfRec.getValue("recordcreatedby");
		let currentuseredit = itfRec.getValue("custbody_scv_current_user_edit");

		let arrEmployee = queryDataEmployee([recordcreatedby, currentuseredit]);
		let objCreatedBy = arrEmployee.find(e => e.id == recordcreatedby) || {};
		let objCurUserEdit = arrEmployee.find(e => e.id == currentuseredit) || {};

		let createdfromtype = lbf.getTranRecordType(createdfrom);
		let objTranRec = getDataCreatedFromIF(itfRec, createdfromtype, createdfrom);
		// sublist
		let arrSublist = [];
		let sl = "item";
		let totalLine = itfRec.getLineCount(sl);

		let arrItem = getDataItemOnTransaction(itfRec, sl, totalLine);
		let total = 0, totalOrderedWeightInKg = 0, totalOrderedM3 = 0;
		let arrSlTranRec = objTranRec.sublist;

		for(let i = 0; i < totalLine; i++) {
			let item = itfRec.getSublistValue(sl, "item", i);
			let originalLineNum = itfRec.getSublistValue(sl, "custcol_scv_origin_line_num", i) || "";
			let quantity = itfRec.getSublistValue(sl, "quantity", i) * 1;
			let unitconversionrate = itfRec.getSublistValue(sl, "unitconversion", i) * 1;

			let obj_find_tranrec = arrSlTranRec.find(e => e.item == item && e.origin_line_num == originalLineNum) || {};
			let rate = obj_find_tranrec?.rate || 0;
			let amount = quantity * rate;
			let isclosed = obj_find_tranrec?.isclosed || false;

			let objSublist = {
				"lineNumber": itfRec.getSublistValue(sl, "line", i) * 1,
				"originalDocumentLineNumber": originalLineNum,
				"itemBarcode": "",
				"legacyItemCode": "",
				"itemCode": itfRec.getSublistValue(sl, "itemname", i),
				"itemDescription": itfRec.getSublistValue(sl, "description", i),
				"orderedUom": itfRec.getSublistValue(sl, "unitsdisplay", i),
				"orderedQty": quantity,
				"qtyPerOrderedUom": unitconversionrate,
				"baseQty": (unitconversionrate * quantity),
				"currencyCode": currency,
				"currencyRate": objTranRec.exchangerate,
				"unitCostExcludingTax": rate,
				"unitCostExcludingTaxInLcy": (rate * objTranRec.exchangerate),
				"unitCostIncludingTax": rate,
				"unitCostIncludingTaxInLcy": (rate * objTranRec.exchangerate),
				"unitDiscount": 0,
				"discountRate": 0,
				"proratedDiscount": 0,
				"discountAmount": 0,
				"discountAmountInLcy": 0,
				"taxType": "",
				"taxRate": 0,
				"taxAmount": 0,
				"taxAmountInLcy": 0,
				"amountExcludingTax": amount,
				"amountExcludingTaxInLcy": (amount * objTranRec.exchangerate),
				"amountIncludingTax": amount,
				"amountIncludingTaxInLcy": (amount * objTranRec.exchangerate),
				"unitWeightInKg": 0,
				"orderedWeightInKg": 0,
				"unitVolumeInM3": 0,
				"orderedVolumeInM3": 0,
				"baseWeightInKg": 0,
				"baseVolumeInM3": 0,
				"hsCode": "",
				"baseUom": "",
				"systemCreatedBy": objCreatedBy.entityid,
				"systemCreatedAt": formatDateToEcoSystem(createddate),
				"systemEditedAt": formatDateToEcoSystem(lastmodifieddate),
				"systemEditedBy": objCurUserEdit.entityid,
				"status": {
					"internalId": isclosed === true ? constILTranstatus.ILStatus.Closed.ID : constILTranstatus.ILStatus.Approved.ID
				}
			};

			let obj_find_item = arrItem.find(e => e.id == item);
			if(!!obj_find_item) {
				let weight = obj_find_item.weight * 1;
				let item_measure = obj_find_item.custitem_boc_item_measure * 1;

				objSublist.hsCode = obj_find_item.custitem_boc_hscode?.toString() || "";
				objSublist.baseUom = obj_find_item.baseunit_name || "";

				objSublist.unitWeightInKg = (weight * unitconversionrate) / 1000;
				objSublist.unitVolumeInM3 = (item_measure * unitconversionrate);
				objSublist.baseWeightInKg = (weight / 1000);
				objSublist.baseVolumeInM3 = item_measure;

				if(objSublist.orderedUom == objSublist.baseUom) {
					objSublist.orderedWeightInKg = (quantity * weight) / 1000;
					objSublist.orderedVolumeInM3 = (quantity * item_measure);
				} else {
					objSublist.orderedWeightInKg = (quantity * (unitconversionrate * weight)) / 1000;
					objSublist.orderedVolumeInM3 = (quantity * (unitconversionrate * item_measure));
				}

				totalOrderedWeightInKg += objSublist.orderedWeightInKg;
				totalOrderedM3 += objSublist.orderedVolumeInM3;
			}

			roundDecimalNumberInObj(objSublist, [
				"orderedQty", "qtyPerOrderedUom", "baseQty", "currencyRate", "unitCostExcludingTax", "unitCostExcludingTaxInLcy", 
				"unitCostIncludingTax", "unitCostIncludingTaxInLcy", "unitDiscount", "discountRate", "proratedDiscount", "discountAmount", 
				"discountAmountInLcy", "taxRate", "taxAmount", "taxAmountInLcy", "amountExcludingTax", "amountExcludingTaxInLcy", "amountIncludingTax", 
				"amountIncludingTaxInLcy", "unitWeightInKg","orderedWeightInKg","unitVolumeInM3","orderedVolumeInM3","baseWeightInKg",
				"baseVolumeInM3"
			]);

			convertEmptyValueToNull(objSublist, [
				"systemCreatedAt", "systemCreatedBy", "systemEditedAt", "systemEditedBy"
			]);

			// push data object
			arrSublist.push(objSublist);
		}

		// request data
		let data = {
			"externalId": itfRec.id.toString(),
			"documentNo": itfRec.getValue("tranid"),
			"sourceTransactionCode": itfRec.getText("custbody_scv_transfer_type"),
			"documentDate": formatDateToEcoSystem(trandate),
			"expectedDeliveryDate": formatDateToEcoSystem(objTranRec.custbody_scv_oversea_ship_date),
			"project": itfRec.getValue("cseg_scv_sg_proj"),
			"saleChannel": itfRec.getValue("cseg_scv_channel"),
			"fromSubsidiary": {
				"externalId": objTranRec.subsidiary
			},
			"department": {
				"externalId": objTranRec.department
			},
			// "department": objTranRec.department,
			"fromLocationCode": objTranRec.location.custrecord_scv_location_code || "",
			"fromLegacyLocationCode": "",
			"fromLocationName": objTranRec.location.name || "",
			"fromLocationDescription": "",
			"fromLocationType": objTranRec.location.locationtype?.toString() || "",
			"fromLocationAddressLine1": objTranRec.location.addr1 || objTranRec.location.addressee || "",
			"fromLocationAddressLine2": objTranRec.location.addr2 || "",
			"fromLocationAddressLine3": objTranRec.location.addr3 || "",
			"fromLocationPostalCode": objTranRec.location.zip || "",
			"fromLocationState": objTranRec.location.state || "",
			"fromLocationCountry": objTranRec.location.country || "",
			"fromLocationPhoneNo": "",
			"fromLocationFaxNo": "",
			"fromLocationEmail": objTranRec.location.custrecord_scv_location_mail || "",
			"toSubsidiary": {
				"externalId": objTranRec.tosubsidiary
			},
			"toLocationCode": objTranRec.transferlocation.custrecord_scv_location_code || "",
			"toLegacyLocationCode": "",
			"toLocationDescription": "",
			"toLocationName": objTranRec.transferlocation.name || "",
			"toLocationType": objTranRec.transferlocation.locationtype?.toString() || "",
			"toLocationAddressLine1": objTranRec.transferlocation.addr1 || objTranRec.transferlocation.addressee || "",
			"toLocationAddressLine2": objTranRec.transferlocation.addr2 || "",
			"toLocationAddressLine3": objTranRec.transferlocation.addr3 || "",
			"toLocationPostalCode": objTranRec.transferlocation.zip || "",
			"toLocationState": objTranRec.transferlocation.state || "",
			"toLocationCountry": objTranRec.transferlocation.country || "",
			"toLocationPhoneNo": "",
			"toLocationFaxNo": "",
			"toLocationEmail": objTranRec.transferlocation.custrecord_scv_location_mail || "",
			"incoterm": {
				"externalId": itfRec.getValue("incoterm")
			},
			"shipmentCarrierCode": itfRec.getValue("shipcarrier") || "",
			"shipmentCarrierName": itfRec.getText("shipcarrier") || "",
			"shippingMethod": itfRec.getValue("shipmethod"),
			"taxType": "",
			"taxRate": 0,
			"totalDiscount": 0,
			"totalDiscountInLcy": 0,
			"totalTaxAmount": 0,
			"totalTaxAmountInLcy": 0,
			"totalAmountExcludingDiscount": total,
			"totalAmountExcludingDiscountInLcy": (total * objTranRec.exchangerate),
			"totalAmountExcludingTax": total,
			"totalAmountExcludingTaxInLcy": (total * objTranRec.exchangerate),
			"totalAmountIncludingTax": total,
			"totalAmountIncludingTaxInLcy": (total * objTranRec.exchangerate),
			"totalLine": totalLine,
			"totalOrderedQty": objTranRec.custbody_scv_ito_order_qty * 1,
			"totalOrderedWeightInKg": totalOrderedWeightInKg,
			"totalOrderedM3": totalOrderedM3,
			"remarks": itfRec.getValue("memo"),
			"memo": itfRec.getValue("memo"),
			"referenceNo1": objTranRec.tranid,
			"referenceNo2": objTranRec.referenceNo2 || "",
			"status": {
				"internalId": constILTranstatus.getILTranStatusByOrderStatus(createdfromtype, objTranRec.orderstatus),
			},
			"reasonForCancellationOrClosure": objTranRec.custbody_scv_reason_close,
			"systemCreatedAt": formatDateToEcoSystem(createddate),
			"systemCreatedBy": objCreatedBy.entityid,
			"systemEditedAt": formatDateToEcoSystem(lastmodifieddate),
			"systemEditedBy": objCurUserEdit.entityid,
			"employee": {
				"externalId": objTranRec.employee,
			},
			"referenceNo3": itfRec.getValue("custbody_boc_load_number"),
			"details": arrSublist
		};

		if(objTranRec.icto === "F" || objTranRec.icto === false) {
			delete data["toSubsidiary"];
		}

		roundDecimalNumberInObj(data, [
			"taxRate", "totalDiscount", "totalDiscountInLcy", "totalTaxAmount", "totalTaxAmountInLcy", "totalAmountExcludingTax", 
			"totalAmountExcludingTaxInLcy", "totalAmountIncludingTax", "totalAmountIncludingTaxInLcy", "totalAmountExcludingDiscount",
			"totalAmountExcludingDiscountInLcy", "totalLine", "totalOrderedQty", "totalOrderedWeightInKg", "totalOrderedM3"
		]);
		convertEmptyValueToNull(data, [
			"department", "systemCreatedAt", "systemCreatedBy", 
			"systemEditedAt", "systemEditedBy",
		]);

		return data;
	}

	const getDataCreatedFromIF = (itfRec, createdfromtype, createdfrom) => {
		let objRes = {
			sublist: []
		};
		if(!!createdfrom) {
			const tranRec = record.load({
				type: createdfromtype,
				id: createdfrom
			});

			objRes.icto = tranRec.getValue("icto");
			objRes.exchangerate = tranRec.getValue("exchangerate") || 1; 
			objRes.custbody_scv_oversea_ship_date = tranRec.getValue("custbody_scv_oversea_ship_date");
			objRes.department = tranRec.getValue("department");
			objRes.subsidiary = tranRec.getValue("subsidiary");
			objRes.tosubsidiary = tranRec.getValue("tosubsidiary");
			objRes.tranid = tranRec.getValue("tranid");
			objRes.statusRef = tranRec.getValue("statusRef");
			objRes.orderstatus = tranRec.getValue("orderstatus");
			objRes.custbody_scv_reason_close = tranRec.getValue("custbody_scv_reason_close");
			objRes.employee = tranRec.getValue("employee");
			objRes.custbody_scv_ito_order_qty = tranRec.getValue("custbody_scv_ito_order_qty");

			let memo = itfRec.getValue("memo");
			let location = tranRec.getValue("location");
			let transferlocation = tranRec.getValue("transferlocation");

			let arrLocation = queryDataLocOnTransaction([location, transferlocation]);
			let objFromLocation = arrLocation.find(e => e.id == location) || {};
			let objToLocation = arrLocation.find(e => e.id == transferlocation) || {};

			objRes.location = objFromLocation;
			objRes.transferlocation = objToLocation;

			if(objRes.location.custrecord_scv_location_code == "V65WTN") {
				objRes.referenceNo2 = memo.replace("V65WTN-", "");
			} else {
				objRes.referenceNo2 = memo;
			}

			// ! sublist
			let sl = "item";
			let lc = tranRec.getLineCount(sl);
			for(let i = 0; i < lc; i++) {
				let objSublist = {
					item: tranRec.getSublistValue(sl, "item", i),
					origin_line_num: tranRec.getSublistValue(sl, "custcol_scv_origin_line_num", i),
					rate: tranRec.getSublistValue(sl, "rate", i),
					isclosed: tranRec.getSublistValue(sl, "isclosed", i),
				};
				objRes.sublist.push(objSublist);
			}
		}
		return objRes;
	}

	const createInventoryAdjustmentReason = (inaResonRec, objCfgEconnect) => {
		let data = getDataObjInvAdjReason(inaResonRec);

		let fileName = inaResonRec.getValue("name") + "[Create: " + inaResonRec.type + "_"+ inaResonRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: inaResonRec.type,
			custrecord_scv_eco_audit_recordid: inaResonRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Create Inventory Adjustment Reason: " + inaResonRec.getValue("name"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/transactionData/adjustmentReason`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;

			if(!!resBody?.data?.internalId) {
				let sourceExtId = resBody.data.internalId;
				submitFieldExternalId(inaResonRec, 'custrecord_scv_inv_adj_reason_ex_id', sourceExtId);
			}

			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const updateInventoryAdjustmentReason = (inaResonRec, objCfgEconnect) => {
		let data = getDataObjInvAdjReason(inaResonRec);

		let fileName = inaResonRec.getValue("name") + "[Update: " + inaResonRec.type + "_"+ inaResonRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: inaResonRec.type,
			custrecord_scv_eco_audit_recordid: inaResonRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Update Inventory Adjustment Reason: " + inaResonRec.getValue("name"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/transactionData/adjustmentReason`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}
	const getDataObjInvAdjReason = (inaResonRec) => {
		let isinactive = inaResonRec.getValue("isinactive");

		let data = {
			"externalId": inaResonRec.id.toString(),
			"code": inaResonRec.getValue("custrecord_scv_inv_adj_reason_code"),
			"description": inaResonRec.getValue("custrecord_scv_inv_adj_reason_des"),
			"generalLedgerAccount": {
				"externalId": inaResonRec.getValue("custrecord_atlas_glaccount")
			},
			"department": {
				"externalId": inaResonRec.getValue("custrecord_atlas_dept")
			},
			"remark": inaResonRec.getValue("custrecord_scv_inv_adj_reason_remark"),
			"isActive": !isinactive
		};
		return data;
	}

	const createInventoryAdjustmentReasonMap = (inaResonMapRec, objCfgEconnect) => {
		let data = getDataObjInvAdjReasonMap(inaResonMapRec);

		let fileName = inaResonMapRec.getValue("name") + "[Create: " + inaResonMapRec.type + "_"+ inaResonMapRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: inaResonMapRec.type,
			custrecord_scv_eco_audit_recordid: inaResonMapRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Create Inventory Adjustment Reason Mapping: " + inaResonMapRec.getValue("name"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/transactionData/adjustmentReasonMapping`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;

			if(!!resBody?.data?.internalId) {
				let sourceExtId = resBody.data.internalId;
				submitFieldExternalId(inaResonMapRec, 'custrecord_scv_inv_adj_reason_ext_id_map', sourceExtId);
			}

			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const updateInventoryAdjustmentReasonMap = (inaResonMapRec, objCfgEconnect) => {
		let data = getDataObjInvAdjReasonMap(inaResonMapRec);

		let fileName = inaResonMapRec.getValue("name") + "[Update: " + inaResonMapRec.type + "_"+ inaResonMapRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: inaResonMapRec.type,
			custrecord_scv_eco_audit_recordid: inaResonMapRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Update Inventory Adjustment Reason Mapping: " + inaResonMapRec.getValue("name"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/transactionData/adjustmentReasonMapping`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const getDataObjInvAdjReasonMap = (inaResonMapRec) => {
		let isinactive = inaResonMapRec.getValue("isinactive");

		let data = {
			"externalId": inaResonMapRec.id.toString(),
			"sourceAdjustmentReason": {
				"externalId": inaResonMapRec.getValue("custrecord_scv_soucre_inv_adj_reason_map")
			},
			"mappedAdjustmentReasonCode": inaResonMapRec.getValue("custrecord_scv_inv_adj_reason_code_map"),
			"mappedAdjustmentReasonDescription": inaResonMapRec.getValue("custrecord_scv_inv_adj_reason_des_map"),
			"mappedSystem": inaResonMapRec.getValue("custrecord_scv_inv_adj_reason_map_system"),
			"remark": inaResonMapRec.getValue("custrecord_scv_inv_adj_reason_remark_map"),
			"isActive": !isinactive
		};
		return data;
	}

	const createPOTransactionCodeMap = (poCodeMapRec, objCfgEconnect) => {
		let data = getDataPOTransactionCodeMap(poCodeMapRec);

		let fileName = poCodeMapRec.getValue("name") + "[Create: " + poCodeMapRec.type + "_"+ poCodeMapRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: poCodeMapRec.type,
			custrecord_scv_eco_audit_recordid: poCodeMapRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Create PO Transaction Code Mapping: " + poCodeMapRec.getValue("name"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/transactionData/purchaseOrderTransactionCodeMapping`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;

			if(!!resBody?.data?.internalId) {
				let sourceExtId = resBody.data.internalId;
				submitFieldExternalId(poCodeMapRec, 'custrecord_scv_po_trans_code_ext_id', sourceExtId);
			}

			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const updatePOTransactionCodeMap = (poCodeMapRec, objCfgEconnect) => {
		let data = getDataPOTransactionCodeMap(poCodeMapRec);

		let fileName = poCodeMapRec.getValue("name") + "[Update: " + poCodeMapRec.type + "_"+ poCodeMapRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: poCodeMapRec.type,
			custrecord_scv_eco_audit_recordid: poCodeMapRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Update PO Transaction Code Mapping: " + poCodeMapRec.getValue("name"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/transactionData/purchaseOrderTransactionCodeMapping`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const getDataPOTransactionCodeMap = (poCodeMapRec) => {
		let data = {
			"externalId": poCodeMapRec.id.toString(),
			"type": poCodeMapRec.getText("custrecord_scv_po_trans_code_type"),
			"companyCode": poCodeMapRec.getValue("custrecord_scv_po_trans_code_company"),
			"warehouseCode": poCodeMapRec.getValue("custrecord_scv_po_trans_code_warehouse"),
			"sourceTransactionCode": poCodeMapRec.getText("custrecord_scv_po_trans_code_source"),
			"mappedTransactionCode": poCodeMapRec.getValue("custrecord_scv_po_trans_code_map"),
		};
		return data;
	}

	const createTOTransactionCodeMap = (toCodeMapRec, objCfgEconnect) => {
		let data = getDataTOTransactionCodeMap(toCodeMapRec);

		let fileName = toCodeMapRec.getValue("name") + "[Create: " + toCodeMapRec.type + "_"+ toCodeMapRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: toCodeMapRec.type,
			custrecord_scv_eco_audit_recordid: toCodeMapRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Create TO Transaction Code Mapping: " + toCodeMapRec.getValue("name"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/transactionData/transferOrderTransactionCodeMapping`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;

			if(!!resBody?.data?.internalId) {
				let sourceExtId = resBody.data.internalId;
				submitFieldExternalId(toCodeMapRec, 'custrecord_scv_ito_trans_code_ext_id', sourceExtId);
			}

			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const updateTOTransactionCodeMap = (toCodeMapRec, objCfgEconnect) => {
		let data = getDataTOTransactionCodeMap(toCodeMapRec);

		let fileName = toCodeMapRec.getValue("name") + "[Update: " + toCodeMapRec.type + "_"+ toCodeMapRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: toCodeMapRec.type,
			custrecord_scv_eco_audit_recordid: toCodeMapRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Update TO Transaction Code Mapping: " + toCodeMapRec.getValue("name"),
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/transactionData/transferOrderTransactionCodeMapping`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const getDataTOTransactionCodeMap = (toCodeMapRec) => {
		let data = {
			"externalId": toCodeMapRec.id.toString(),
			"companyCode": toCodeMapRec.getValue("custrecord_scv_ito_trans_code_com"),
			"warehouseCode": toCodeMapRec.getValue("custrecord_scv_ito_trans_code_warehouse"),
			"sourceTransactionCode": toCodeMapRec.getText("custrecord_scv_ito_trans_code_source"),
			"mappedTransactionCode": toCodeMapRec.getValue("custrecord_scv_ito_trans_code_map"),
		};
		return data;
	}

	const createItemSellingPrice = (objCfgEconnect, data, recType) => {
		let recordName = "Item Selling Price";
		let fileName = data.externalId + " [Create: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Create ${recordName}: ` + data.externalId,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/itemSalesPrice`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);

			if(!!resBody?.data?.internalId) {
				record.submitFields({
					type: recType,
					id: data.externalId,
					values: {
						custrecord_scv_ext_id_sale_detail: resBody.data.internalId
					}
				});
			}
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const updateItemSellingPrice = (objCfgEconnect, data, recType) => {
		let recordName = "Item Selling Price";
		let fileName = data.externalId + " [Update: " + recType + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: recType,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Update ${recordName}: ` + data.externalId,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/itemSalesPrice`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;
			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const createItemPurchasePrice = (purPriceRec, objCfgEconnect) => {
		let data = getDataItemPurchasePrice(purPriceRec);
		
		let fileName = purPriceRec.id + "[Create: " + purPriceRec.type + "_"+ purPriceRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: purPriceRec.type,
			custrecord_scv_eco_audit_recordid: purPriceRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Create Item Purchase Price: " + purPriceRec.id,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/itemPurchasePrice`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;

			if(!!resBody?.data?.internalId) {
				let sourceExtId = resBody.data.internalId;
				submitFieldExternalId(purPriceRec, 'custrecord_scv_purchase_detail_ext_id', sourceExtId);
			}

			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const updateItemPurchasePrice = (purPriceRec, objCfgEconnect) => {
		let data = getDataItemPurchasePrice(purPriceRec);
		
		let fileName = purPriceRec.id + "[Update: " + purPriceRec.type + "_"+ purPriceRec.id + "] - " + "<"+Math.round((new Date()).getTime())+">";
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: purPriceRec.type,
			custrecord_scv_eco_audit_recordid: purPriceRec.id
		};
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: "Update Item Purchase Price: " + purPriceRec.id,
			objAuditUpdate: objAuditUpdate
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/master/item/itemPurchasePrice`;
			
        	let resBody = callPutHttps(urlCallAPI, access_token, data);
			options.isSuccess = resBody?.success || false;

			let auditId = createAutditEConnect(resBody, data, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), data, options);
			return auditId;
		}
	}

	const getDataItemPurchasePrice = (purPriceRec) => {
		let resultSQL = query.runSuiteQL({
			query: `SELECT 
				pu.id, pu.name, i.purchaseunit,
				p.custrecord_scv_purchase_start_date,
				p.custrecord_scv_purchase_end_date
			FROM customrecord_scv_purchase_price_detail pu
			INNER JOIN customrecord_scv_purchase_price_update p ON p.id = pu.custrecord_scv_purchase_detail_id
			INNER JOIN item i ON pu.custrecord_scv_purchase_detail_item = i.id
			WHERE pu.id = ${purPriceRec.id}`
		}).asMappedResults();

		let objPurPrice = resultSQL[0];
		if(!!objPurPrice.custrecord_scv_purchase_start_date) {
			objPurPrice.custrecord_scv_purchase_start_date = format.parse({ value: objPurPrice.custrecord_scv_purchase_start_date, type: "date" });
		}
		if(!!objPurPrice.custrecord_scv_purchase_end_date) {
			objPurPrice.custrecord_scv_purchase_end_date = format.parse({ value: objPurPrice.custrecord_scv_purchase_end_date, type: "date" });
		}

		// data
		let isinactive = purPriceRec.getValue("isinactive");
		let data = {
			"externalId": purPriceRec.id.toString(),
			"subsidiary": {
				"externalId": purPriceRec.getValue("custrecord_scv_purchcase_detail_sub")
			},
			"vendor": {
				"externalId": purPriceRec.getValue("custrecord_scv_purchase_detail_vendor")
			},
			"location": {
				"externalId": purPriceRec.getValue("custrecord_scv_purchcase_detail_location")
			},
			"item": {
				"externalId": purPriceRec.getValue("custrecord_scv_purchase_detail_item")
			},
			"unitOfMeasure": {
				"externalId": objPurPrice.purchaseunit?.toString() || ""
			},
			"currency": {
				"externalId": purPriceRec.getValue("custrecord_scv_purchase_detail_currency")
			},
			"price": purPriceRec.getValue("custrecord_scv_purchase_detail_modified") * 1,
			"startDate": formatDateToEcoSystem(objPurPrice.custrecord_scv_purchase_start_date),
			"endDate": formatDateToEcoSystem(objPurPrice.custrecord_scv_purchase_end_date),
			"isActive": !isinactive
		};
		return data;
	}

	const purchaseOrderCloseValidation = (data) => {
		let fileName = data.tranid + " [Close: " + data.type + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: data.type,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let objCfgEconnect = getInfoEconnectConfig();
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Close Validation Purchase Order: ` + data.tranid,
			objAuditUpdate: objAuditUpdate
		};

		let objReqBody = {
			externalId: data.externalId
		};
		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/transaction/purchaseOrderCloseValidation`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, objReqBody);
			options.isSuccess = resBody?.success || false;

			record.submitFields({
				type: data.type, id: data.externalId, 
				values: { 
					custbody_scv_closed_verify_mess: resBody?.message || "",
					custbody_scv_verify_close: options.isSuccess,
				},
			});

			let auditId = createAutditEConnect(resBody, objReqBody, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), objReqBody, options);
			return auditId;
		}
	}

	const transferOrderCloseValidation = (data) => {
		let fileName = data.tranid + " [Close: " + data.type + 
		"_"+ data.externalId + "] - " + "<"+Math.round((new Date()).getTime())+">";

		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: data.type,
			custrecord_scv_eco_audit_recordid: data.externalId
		};
		let objCfgEconnect = getInfoEconnectConfig();
		let options = {
			reqfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_reqfolderid,
			resfolderid: objCfgEconnect.custrecord_scv_itg_eco_cfg_resfolderid,
			fileName: fileName,
			name: `Close Validation Transfer Order: ` + data.tranid,
			objAuditUpdate: objAuditUpdate
		};

		let objReqBody = {
			externalId: data.externalId
		};
		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/transaction/transferOrderCloseValidation`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, objReqBody);
			options.isSuccess = resBody?.success || false;

			record.submitFields({
				type: data.type, id: data.externalId, 
				values: { 
					custbody_scv_closed_verify_mess: resBody?.message || "",
					custbody_scv_verify_close: options.isSuccess,
				}
			});
			let auditId = createAutditEConnect(resBody, objReqBody, options);
			if(!!options.isSuccess) {
				createWarehouseTOClose(data);
			}
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), objReqBody, options);
			return auditId;
		}
	}

	const createWarehouseTOClose = (data) => {
		let objAuditUpdate = {
			custrecord_scv_eco_audit_recordtype: data.type,
			custrecord_scv_eco_audit_recordid: data.externalId
		};

		let objCfgEconnect = getInfoEconnectConfig();
		let options = {
			name: `Create Warehouse Transfer Order (TO) Close: ` + data.tranid,
			objAuditUpdate: objAuditUpdate
		};

		let resultSearch = constSearch.createSearchWithFilter({
			type: "transferorder",
			filters: [
				["type", "anyof", "TrnfrOrd"],
				"AND",
				["mainline","is","T"],
        		"AND",
        		["internalid", "anyof", data.externalId]
			],
			columns: [
				search.createColumn({
					name: "custrecord_scv_location_code",
					join: "location",
					label: "location code",
				}),
				search.createColumn({
					name: "custbody_scv_current_user_edit",
					label: "user edit",
				}),
				search.createColumn({
					name: "tranid",
					label: "tranid",
				}),
			]
		});
    
    	resultSearch = resultSearch.run().getRange(0, 1);
		if(resultSearch.length === 0) return;

		let objReqBody = {
			"warehouse": resultSearch[0].getValue({ name: "custrecord_scv_location_code", join: "location" }) || "",
			"document_number": resultSearch[0].getValue("tranid") || "",
			"close_by": resultSearch[0].getText("custbody_scv_current_user_edit") || "",
		};

		try{
			let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
			let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;

			let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/transaction/warehouseTransferOrderClose`;
			
        	let resBody = callPostHttps(urlCallAPI, access_token, objReqBody);
			options.isSuccess = resBody?.success || false;

			let auditId = createAutditEConnect(resBody, objReqBody, options);
			return auditId;
		}catch(e){
			log.error("error", e);
			options.isSuccess = false;
			let auditId = createAutditEConnect(JSON.parse(e), objReqBody, options);
			return auditId;
		}
	}

	// TODO: create audit econnect
	function createAutditEConnect(resBody, objResult, options) {
		let objAuditUpdate = options.objAuditUpdate;
		let auditECRec = record.create({
			type: "customrecord_scv_itg_econnect_audit"
		});
		let fields = [
			'name', 'custrecord_scv_eco_audit_issuccess'
		];
		lbf.setValueData(auditECRec, fields, [options.name, options.isSuccess]);
		for(let property in objAuditUpdate) {
			auditECRec.setValue(property, objAuditUpdate[property]);
		}

		// TODO: 2025-07-02 không tạo file và lưu trên File Cabinet 
		auditECRec.setValue("custrecord_scv_eco_audit_reqbody", getDataStringJSON(objResult));
		auditECRec.setValue("custrecord_scv_eco_audit_response", getDataStringJSON(resBody, true));

		let auditId = auditECRec.save();
		return auditId;
	}

	const getDataStringJSON = (objRes, isResponse) => {
		let jsonString = JSON.stringify(objRes);
		if(jsonString.length > FIELD_MAX_NUMBER) {
			if(isResponse) {
				let data = objRes.data;
				delete data.details;
			} else {
				delete objRes.details;
			}
			jsonString = JSON.stringify(objRes);
		}
		return jsonString;
	}

	// TODO: get data
	function getDataPurchaseOrder(recType, objFilters){
		let myFilters = [
			["type","anyof","PurchOrd"], 
			"AND",
			["mainline","is","T"],
			"AND",
			["taxline","is","F"], 
			"AND",
			["approvalstatus", "anyof", ApprStatusStandard.Approved.ID]
			// ["status", "noneof", "PurchOrd:H"],
			// "AND",
			// ["custbody_scv_external_id", "isnotempty", ""]
		];
		
		let myColumns = [
			{name: "internalid", label: "id", sort: "DESC"}, "tranid", "custbody_scv_external_id", 
			{name: "mainname", label: "entity"}, "currency", "exchangerate", "approvalstatus", "trandate", 
			"memo", "subsidiary", "department", "location", "status"
		];

		if(!objFilters) {
			objFilters = { page: 1, pageSize: 1000 };
		}

		let objResult = getDataCreateSearchWithPageRanges(recType, myFilters, myColumns, objFilters);
		
		return objResult;
	}

	function getDataTransferOrder(recType, objFilters) {
		let myFilters = [
			["type", "anyof", "TrnfrOrd"],
			"AND",
			["mainline","is","T"],
			// "AND", 
      		// ["multisubsidiary","is","T"]
		];
		
		let myColumns = [
			{name: "internalid", label: "id", sort: "DESC"}, "tranid", "custbody_scv_external_id", 
			"trandate", "exchangerate",  "currency", "memo", "status", "tosubsidiary", "subsidiary",
			"location", "transferlocation", "multisubsidiary"
		];

		if(!objFilters) {
			objFilters = { page: 1, pageSize: 1000 };
		}

		let objResult = getDataCreateSearchWithPageRanges(recType, myFilters, myColumns, objFilters);
		
		return objResult;
	}

	const getDataSublistItemPO = (params) => {
		let myFilters = [
			["type","anyof", params.dbstrantype], 
			"AND",
			["mainline","is","F"],
			"AND",
			["taxline","is","F"],
			"AND", 
			["internalid","anyof", params.recid]
		];
		
		let myColumns = [
			"internalid", "item", { name: "unitid", label: "units" }, { name: "unit", label: "units_display" },
			"quantity", "rate", "amount", "taxcode", "taxtotal", "class"
		];

		let arrResult = getAllDataCreateSavedSearch(params.rectype, myFilters, myColumns);
		return arrResult;
	}

	function getDataItemFulfillment(recType, objFilters) {
		let myFilters = [
			["type", "anyof", "ItemShip"],
			"AND",
			["mainline","is","T"],
		];
		
		let myColumns = [
			{name: "internalid", label: "id", sort: "DESC"}, "tranid", "custbody_scv_ext_id_if_ir", 
			"trandate", "exchangerate",  "currency", "memo", "createdfrom", "subsidiary",
			"custbody_scv_transfer_type"
		];

		if(!objFilters) {
			objFilters = { page: 1, pageSize: 1000 };
		}

		let objResult = getDataCreateSearchWithPageRanges(recType, myFilters, myColumns, objFilters);
		return objResult;
	}

	// TODO: other functions
	const submitFieldExternalId = (rec, fieldId, sourceExtId) => {
		let objValues = { [fieldId]: sourceExtId };
		record.submitFields({
			type: rec.type, id: rec.id, values: objValues
		});
	}
	const groupDataByFieldId = (data, field) => {
		let objGroup = {};
		for(let i = 0; i < data.length; i++) {
			let fieldValue = data[i][field];
			if(objGroup[fieldValue] === undefined && !!fieldValue) {
				objGroup[fieldValue] = fieldValue;
			}
		}
		return Object.values(objGroup);
	}
	const roundDecimalNumberInObj = (objData, fields) => {
		for(let fieldId of fields) {
			objData[fieldId] = constFormat.roundNumber(objData[fieldId], 8);
		}
	}

	const convertEmptyValueToNull = (objData, fields) => {
		for(let fieldId of fields) {
			if(!objData[fieldId]) {
				objData[fieldId] = null;
			}
		}
	}

	function getDataCreateSearchWithPageRanges(_type, _filters, _columns, _objFiltersReq) {
		let _page = _objFiltersReq.page;
		let _pageSize = _objFiltersReq.pageSize;

		let resultSearch = search.create({
			type: _type,
			filters: _filters,
			columns: [..._columns]
		});
		resultSearch = resultSearch.runPaged({pageSize: _pageSize});
		let arrResult = [];
		let currentPage = [];
		if(_page > 0 && _page <= resultSearch.pageRanges.length){
			currentPage = resultSearch.fetch({index : (_page - 1)}).data;
		}
		for(let i = 0; i < currentPage.length; i++){
			let obj = {};
			_columns.forEach(eleColumn => {
				let eleColumnId = eleColumn;
				if(typeof eleColumn == 'object'){
					eleColumnId = eleColumn.label;
				}
				obj[eleColumnId] = currentPage[i].getValue(eleColumn);

				let temp_display = currentPage[i].getText(eleColumn);
				if(lbf.isContainValue(temp_display)){
					obj[eleColumnId + "_display"] = temp_display;
				}
			})
			arrResult.push(obj);
		}

        return {data: arrResult, info:{pageSize: _pageSize, totalPage: resultSearch.pageRanges.length, page: _page, count: currentPage.length}};
	}
	function getAllDataCreateSavedSearch(_type, _filters, _columns) {
		let resultSearch = search.create({
			type: _type,
			filters: _filters,
			columns: [..._columns]
		});
		resultSearch = resultSearch.runPaged({pageSize: 1000});

		let arrResult = [];
		for(let i = 0; i < resultSearch.pageRanges.length; i++){
            let currentPage = resultSearch.fetch({index : i}).data;
            for(let idx = 0; idx < currentPage.length; idx++){
                let obj = {};
				_columns.forEach(eleColumn => {
					let eleColumnId = eleColumn;
					if(typeof eleColumn == 'object'){
						eleColumnId = eleColumn.label;
					}
					obj[eleColumnId] = currentPage[idx].getValue(eleColumn);

					let temp_display = currentPage[idx].getText(eleColumn);
					if(lbf.isContainValue(temp_display)){
						obj[eleColumnId + "_display"] = temp_display;
					}
				});
				arrResult.push(obj);
            }
        }
		return arrResult;
	}
	const formatDateToEcoSystem = (date) => {
		if(!!date) {
			return date.toISOString();
		} else {
			return ECO_DATE_REQUIRED;
		}
	}
	const updateFieldsEmptyStringToNullable = (data, lstFieldsAllowNull) => {
		for(let property in data) {
			if(lstFieldsAllowNull.includes(property)) {
				if(typeof data[property] === "object") {
					if(!data[property]["externalId"]) {
						data[property]["externalId"] = null;
					}
				} else {
					if(!data[property]) {
						data[property] = null;
					}
				}
			}
		}
	}

	const deleteFieldsInObject = (data, lstFieldsDelete) => {
		for(let property in data) {
			if(lstFieldsDelete.includes(property)) {
				delete data[property];
			}
		}
	}

	const getDataAddressbookEntity = (curRec) => {
		let objResult = {
			"billingAddressLine1": "",
			"billingAddressLine2": "",
			"billingAddressLine3": "",
			"billingAddressPostalCode": "",
			"billingAddressCity": "",
			"billingAddressState": "",
			"billingAddressCountry": { "externalId": "" },
			"shippingAddressLine1": "",
			"shippingAddressLine2": "",
			"shippingAddressLine3": "",
			"shippingAddressPostalCode": "",
			"shippingAddressCity": "",
			"shippingAddressState": "",
			"shippingAddressCountry": { "externalId": "" },
		};

		let sl = "addressbook";
		let totalLine = curRec.getLineCount(sl);
		for(let i = 0; i < totalLine; i++) {
			let defaultshipping = curRec.getSublistValue(sl, "defaultshipping", i);
			let defaultbilling = curRec.getSublistValue(sl, "defaultbilling", i);
			
			let addressSubRec = curRec.getSublistSubrecord({ sublistId: sl, fieldId: "addressbookaddress", line: i});
			if(defaultshipping === true) {
				objResult["shippingAddressLine1"] = addressSubRec.getValue("addr1") || addressSubRec.getValue("addressee");
				objResult["shippingAddressLine2"] = addressSubRec.getValue("addr2");
				objResult["shippingAddressLine3"] = addressSubRec.getValue("addr3");
				objResult["shippingAddressPostalCode"] = addressSubRec.getValue("zip");
				objResult["shippingAddressCity"] = addressSubRec.getValue("city");
				objResult["shippingAddressState"] = addressSubRec.getValue("state");
				objResult["shippingAddressCountry"] = { 
					"externalId": addressSubRec.getValue("country")
				};
			}
			if(defaultbilling === true) {
				objResult["billingAddressLine1"] = addressSubRec.getValue("addr1") || addressSubRec.getValue("addressee");
				objResult["billingAddressLine2"] = addressSubRec.getValue("addr2");
				objResult["billingAddressLine3"] = addressSubRec.getValue("addr3");
				objResult["billingAddressPostalCode"] = addressSubRec.getValue("zip");
				objResult["billingAddressCity"] = addressSubRec.getValue("city");
				objResult["billingAddressState"] = addressSubRec.getValue("state");
				objResult["billingAddressCountry"] = { 
					"externalId": addressSubRec.getValue("country")
				};
			}
		}
		return objResult;
	}

	const getDataCreateSavedSearchWithId = (_type, _filters, _columns) => {
		let resultSearch = search.create({
			type: _type,
			filters: _filters,
			columns: [..._columns]
		});
		resultSearch = resultSearch.run().getRange(0, 1);

		let objResult = {};

		_columns.forEach(eleColumn => {
			let eleColumnId = eleColumn;
			if(typeof eleColumn == 'object'){
				eleColumnId = eleColumn.label;
			}
			objResult[eleColumnId] = resultSearch[0].getValue(eleColumn);
		});

		return objResult;
	}
    const getInfoEconnectConfig = (_syncToken = true) => {
        let siteAccount = runtime.accountId;

		let resultSearch = search.create({
			type: "customrecord_scv_itg_econnect_cfg",
			filters:
			[
				["isinactive","is","F"],
				"AND",
				["custrecord_scv_itg_eco_cfg_siteaccount", "is", siteAccount]
			],
			columns:
			[
				"internalid", "name", "custrecord_scv_itg_eco_cfg_url_api", "custrecord_scv_itg_eco_cfg_user", "custrecord_scv_itg_eco_cfg_password", 
				"custrecord_scv_itg_eco_cfg_access_token", "custrecord_scv_itg_eco_cfg_expired", "custrecord_scv_itg_eco_cfg_siteaccount",
                "custrecord_scv_itg_eco_cfg_version", "custrecord_scv_itg_eco_cfg_reqfolderid", "custrecord_scv_itg_eco_cfg_resfolderid"
			]
		});
		let myColumns = resultSearch.columns;
		resultSearch = resultSearch.run().getRange(0, 1);

		if(resultSearch.length == 0) return;

		let objCfgEconnect = {
			id: resultSearch[0].getValue(myColumns[0]),
            name: resultSearch[0].getValue(myColumns[1]),
            custrecord_scv_itg_eco_cfg_url_api: resultSearch[0].getValue(myColumns[2]),
            custrecord_scv_itg_eco_cfg_user: resultSearch[0].getValue(myColumns[3]),
            custrecord_scv_itg_eco_cfg_password: resultSearch[0].getValue(myColumns[4]),
            custrecord_scv_itg_eco_cfg_access_token: resultSearch[0].getValue(myColumns[5]),
            custrecord_scv_itg_eco_cfg_expired: resultSearch[0].getValue(myColumns[6]),
            custrecord_scv_itg_eco_cfg_siteaccount: resultSearch[0].getValue(myColumns[7]),
            custrecord_scv_itg_eco_cfg_version: resultSearch[0].getValue(myColumns[8]),
			custrecord_scv_itg_eco_cfg_reqfolderid: resultSearch[0].getValue(myColumns[9]),
			custrecord_scv_itg_eco_cfg_resfolderid: resultSearch[0].getValue(myColumns[10]),
		};

		if(!_syncToken) return objCfgEconnect;

		let today = new Date();
		let expdt = new Date();
		if(!!objCfgEconnect.custrecord_scv_itg_eco_cfg_expired){
			expdt = format.parse({value: objCfgEconnect.custrecord_scv_itg_eco_cfg_expired, type: "datetime"});
		}
		
		if (expdt.getTime() > today.getTime())  return objCfgEconnect;

        let objAccessToken = createAccessToken(objCfgEconnect.id);
        if(!objAccessToken.token) return objCfgEconnect;


        let expiry = new Date(objAccessToken.expiry);
        record.submitFields({
            type: "customrecord_scv_itg_econnect_cfg",
            id: objCfgEconnect.id,
            values: {
                custrecord_scv_itg_eco_cfg_access_token: objAccessToken.token,
                custrecord_scv_itg_eco_cfg_expired: expiry
            }
        });

		objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token = objAccessToken.token;
		objCfgEconnect.custrecord_scv_itg_eco_cfg_expired = expiry;
		return objCfgEconnect;
	}

    const createAccessToken = () => {
		let objCfgEco = getInfoEconnectConfig(false);
        let version = objCfgEco.custrecord_scv_itg_eco_cfg_version;

		let response = https.post({
			url: objCfgEco.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/auth/token`,
			headers: {
				"Content-Type": "application/json",
				"Accept": "*/*"
			},
			body: JSON.stringify({
				"username": objCfgEco.custrecord_scv_itg_eco_cfg_user,
				"password": handlePasswordsSafely(objCfgEco.custrecord_scv_itg_eco_cfg_password, true)
			})
		});
		return getResponseBody(response);
	}

	const callPutHttps = (url, access_token, body) => {
		let response = https.put({
			url: url,
			headers: getHeaderAPI(access_token),
			body: JSON.stringify(body)
		});
		return getResponseBody(response);
	}

    const callPostHttps = (url, access_token, body) => {
		let response = https.post({
			url: url,
			headers: getHeaderAPI(access_token),
			body: JSON.stringify(body)
		});
		return getResponseBody(response);
	}

    const getHeaderAPI = (access_token) =>  {
		let header = {};
		header['Content-Type'] = 'application/json';
		header['Accept'] = "*/*";
		header['Authorization']= `Bearer ${access_token}`;

		return header;
	}

    const getResponseBody = (_res) => {
		if(_res.code == 200) {
			let body = JSON.parse(_res.body);
			return body;
		}
		log.error("ECO-ERR-INFO", _res.body);

		if(_res.body) {
			return JSON.parse(_res.body);
		} else {
			return _res;
		}
	}

	function searchEconnectAudit(_rectype) {
		let myFilters = ['AND', ['custrecord_scv_eco_audit_recordtype', 'is', _rectype]];
		if(Array.isArray(_rectype)) {
			myFilters = ["AND", ["formulatext: case when {custrecord_scv_eco_audit_recordtype} in ('"+ _rectype.join("','") +"') then 1 else 0 end", "is", "1"]];
		}
		let resultSearch = search.create({
			type: 'customrecord_scv_itg_econnect_audit',
			filters: [
				['custrecord_scv_eco_audit_issuccess', 'is', 'T'],
				...myFilters
			],
			columns: [
				search.createColumn({
					name: 'custrecord_scv_eco_audit_recordid',
					summary: search.Summary.GROUP
				}),
				search.createColumn({
					name: 'internalid',
					summary: search.Summary.MAX
				}),
				search.createColumn({
					name: 'custrecord_scv_eco_audit_recordtype',
					summary: search.Summary.GROUP
				}),
			]
		});
		let myColumns = resultSearch.columns;

		resultSearch = resultSearch.run().getRange({ start: 0, end: 1000 });
		let arrResult = [];

		for(let obj of resultSearch) {
			arrResult.push({
				internalid: obj.getValue(myColumns[1]),
				recordid: obj.getValue(myColumns[0]),
				recordtype: obj.getValue(myColumns[2]),
			});
		}
		
		return arrResult;
	}

    function handlePasswordsSafely(value, isDecrypt) {
		if(!value) return '';

		if(!isDecrypt) {
			return CryptoJS.AES.encrypt(value, SECRET_PASSPHRASE).toString();
		}

		let decrypted = CryptoJS.AES.decrypt(value, SECRET_PASSPHRASE);
		return decrypted.toString(CryptoJS.enc.Utf8);
	}

    const addInlineHtmlHiddenPassword = (form, isView) => {
		let custpage_scv_hidden_password = form.addField({
			id : "custpage_scv_hidden_password",
			type : "inlinehtml",
			label : "Hidden Password"
		});
		if(isView === true) {
			custpage_scv_hidden_password.defaultValue = `<script>
				let attempts = 0;

				function addHiddenUserPassword() {
					const wrapperPassword = document.querySelector('div[data-walkthrough="Field:custrecord_scv_itg_eco_cfg_password"]');
					if(!wrapperPassword && attempts < 3) {
						attempts++;
						setTimeout(() => addHiddenUserPassword(), 100);
					} else {
						wrapperPassword.setAttribute('style', 'display: none;');
					}

					const wrapperAccessToken = document.querySelector('div[data-walkthrough="Field:custrecord_scv_itg_eco_cfg_access_token"]');
					wrapperAccessToken.setAttribute('style', 'word-break: break-all;');
				}

				addHiddenUserPassword();
			</script>`;
		} else {
			custpage_scv_hidden_password.defaultValue = `<script>
				let attempts = 0;

				function addHiddenUserPassword() {
					const iptPassword = document.querySelector('input[id="custrecord_scv_itg_eco_cfg_password"]');
					if(!iptPassword && attempts < 3) {
						attempts++;
						setTimeout(() => addHiddenUserPassword(), 100);
					} else {
						iptPassword.type = 'password';
					}
				}

				addHiddenUserPassword();
			</script>`;
		}
	}

    return {
		ECO_DATE_REQUIRED,
		formatDateToEcoSystem,
		// TODO: after submit record
		syncItemData,
		syncPLUBarcodeData,
		syncCustomerData,
		syncVendorData,
		syncLocationData,
		syncPurchaseOrderData,
		syncTransferOrderData,
		syncVietNamUnitData,
		syncEmployeeData,
		syncItemLocationConfigData,
		syncItemFulfillmentData,
		// TODO: suitelet and after submit record
		createItem,
		updateItem,	
		createPLUBarcode,
		updatePLUBarcode,

		createVendor,
		updateVendor,
		createCustomer,
		updateCustomer,
		createLocation,
		updateLocation,

		createPurchaseOrder,
		updatePurchaseOrder,
		createTransferOrder,
		updateTransferOrder,

		createItemLocationConfig,
		updateItemLocationConfig,
		createItemFulfillment,
		updateItemFulfillment,
		// TODO: đồng bộ trên suitelet
		createEmployee,
		updateEmployee,
		createItemHierarchy,
		updateItemHierarchy, 

		createItemSubMapping,
		createVendorSubMapping,
		createVendorBusinessCoverageMapping,
		createVendorContact,
		updateVendorContact,

		createCustomerSubMapping,
		createCustomerContact,
		updateCustomerContact,
		createTaxCode,
		updateTaxCode,
		createTaxCodeSubMapping,
		createTaxSchedule,
		updateTaxSchedule,

		createDepartment,
		updateDepartment,
		createDepartmentSubMapping,
		createClassification,
		updateClassification,
		createClassSubMapping,

		createAccount,
		updateAccount,
		createAccountSubMapping,
		createSubsidiary,
		updateSubsidiary,

		createSupplierType,
		updateSupplierType,
		createDeliveryMethod,
		updateDeliveryMethod,

		createDeliveryLocation,
		updateDeliveryLocation,
		createLocationType,
		updateLocationType,

		createLocationCostingGroup,
		updateLocationCostingGroup,
		createLocationAreaCode,
		updateLocationAreaCode,

		createLocOutletSizeCluster,
		updateLocOutletSizeCluster,
		createLocOutletSize,
		updateLocOutletSize,

		createCustomerCategory,
		updateCustomerCategory,
		createPriceLevel,
		updatePriceLevel,
		createVendorCategory,
		updateVendorCategory,

		createCurrency,
		createCountry,
		createIcoTerm,
		createCostingMethod,
		createSupplyReplenishmentType,
		createConsolidatedExchangeRate,

		createPaymentMethod,
		updatePaymentMethod,
		createTerm,
		updateTerm,
		createRegion,
		updateRegion,

		createUnitsType,
		updateUnitsType,
		createUnitsTypeUOM,
		updateUnitsTypeUOM,	

		createItemBrand,
		updateItemBrand,
		createAccountType,
		updateAccountType,
		createTaxType,
		updateTaxType,

		createBusinessCoverage,
		updateBusinessCoverage,
		createItemBuyerGroup,
		updateItemBuyerGroup,
		createItemTradeType,
		updateItemTradeType,
		createItemOriginType,
		updateItemOriginType,

		createItemDisplayMethod,
		updateItemDisplayMethod,
		createItemRQStatus,
		updateItemRQStatus,
		createItemPackCode,
		updateItemPackCode,
		createItemWarehouseGroup,
		updateItemWarehouseGroup,

		createItemProductCluster,
		updateItemProductCluster,
		createItemAllocationType,
		updateItemAllocationType,
		createItemDateControl,
		updateItemDateControl,
		createItemStatus,
		updateItemStatus,

		createItemSpecHandlingIndicator,
		updateItemSpecHandlingIndicator,
		createItemProductEntity,
		updateItemProductEntity,
		createItemHSCode,
		updateItemHSCode,

		createSalesQtyCombo,
		updateSalesQtyCombo,
		createVietNamUnit,
		updateVietNamUnit,
		createLocationSystem,
		updateLocationSystem,

		createItemSellingPrice,
		updateItemSellingPrice,

		createItemPurchasePrice,
		updateItemPurchasePrice,
		createLocationDeliverySchedule,
		updateLocationDeliverySchedule,
		
		createBOCListInOut,
		updateBOCListInOut,
		createBOCListInOutReason,
		updateBOCListInOutReason,

		createInventoryAdjustmentReason,
		updateInventoryAdjustmentReason,
		createInventoryAdjustmentReasonMap,
		updateInventoryAdjustmentReasonMap,

		createPOTransactionCodeMap,
		updatePOTransactionCodeMap,
		createTOTransactionCodeMap,
		updateTOTransactionCodeMap,

		purchaseOrderCloseValidation,
		transferOrderCloseValidation,
		// TODO: get data
		getDataObjTransferOrder,
		getAllDataTransactionLineTO,
		getDataPurchaseOrder,
		getDataTransferOrder,
		getDataSublistItemPO,
		getDataItemFulfillment,
		// TODO: others function
		getDataCreateSearchWithPageRanges,
        createAccessToken,
        getInfoEconnectConfig,
		searchEconnectAudit,
        handlePasswordsSafely,
        addInlineHtmlHiddenPassword
    }
});