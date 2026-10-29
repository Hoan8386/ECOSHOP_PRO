define([
    'N/search', 'N/format', 'N/record',
    '../lib/scv_lib_function.js'
], (
    search, format, record,
    lbf
) => {
    const ERROR_CODE_MSG = {
		SUCCESS: {
			CODE: "000",
			MSG: "Success."
		},
        SYSTEM_STANDARD: {
			CODE: "999",
			MSG: "Error System."
		},
		API_ACTION_KHONG_TON_TAI: {
			CODE: "001",
			MSG: "API.action doesn't exist."
		},
		API_TYPE_KHONG_TON_TAI: {
			CODE: "002",
			MSG: "API.type doesn't exist."
		},
		API_FIELDS_MANDATORY: {
			CODE: "003",
			MSG: "Required fields"
		},
		API_FIELDS_KHONG_TON_TAI: {
			CODE: "004",
			MSG: "API.fields doesn't exist."
		},
		API_FILTERS_MANDATORY: {
			CODE: "005",
			MSG: "Required filters"
		},
	};

    // TODO: search tax code
    const apiSearchTaxCode = (reqBody) => {
        let objStatus = createObjSuccessAPI();
        let objFilters = reqBody.filters || {};

        try {
            let resultSearch = search.load(reqBody.type);
			// let myFilters = resultSearch.filters;
			let objSearch = getDataSSTaxCode(resultSearch, objFilters);

			objStatus.data = objSearch.data;
			objStatus.info = objSearch.info;
        } catch(err) {
			objStatus = createObjErrorAPI(ERROR_CODE_MSG.SYSTEM_STANDARD, err.message);
			log.error("ERROR: TRY-CATCH", err);
		}
		return objStatus;
    }
    function getDataSSTaxCode(_resultSearch, _objFilters) {
		let _page = _objFilters.page;
		let _pageSize = _objFilters.pageSize;
		let myColumns = _resultSearch.columns;
		
		let resultSearch = _resultSearch.runPaged({pageSize: _pageSize});
		let arrResult = [];
		let currentPage = [];
		if(_page > 0 && _page <= resultSearch.pageRanges.length){
			currentPage = resultSearch.fetch({index : (_page - 1)}).data;
		}
		for(let i = 0; i < currentPage.length; i++){
			let obj = {
                internalid: currentPage[i].id,
                name: currentPage[i].getValue(myColumns[0]),
                itemid: currentPage[i].getValue(myColumns[1]),
                rate: currentPage[i].getValue(myColumns[2]),
                country: currentPage[i].getValue(myColumns[3]),
                country_display: currentPage[i].getText(myColumns[3]),
            };
            
			arrResult.push(obj);
		}

        return {data: arrResult, info:{pageSize: _pageSize, totalPage: resultSearch.pageRanges.length, page: _page, count: currentPage.length}};
	}

    // TODO: search item master tax schedule
    const apiSearchItemMasterTaxSchedule = (reqBody) => {
        let objStatus = createObjSuccessAPI();
        let objFilters = reqBody.filters || {};

        try {
            let resultSearch = search.load(reqBody.type);
			let myFilters = resultSearch.filters;
            if(!!objFilters.internalid) {
                myFilters.push(search.createFilter({
					name: "internalid",
					operator: "anyof",
					values: objFilters.internalid
				}));
            }
			let objSearch = getDataSSItemMasterTaxSchedule(resultSearch, objFilters);

			objStatus.data = objSearch.data;
			objStatus.info = objSearch.info;
        } catch(err) {
			objStatus = createObjErrorAPI(ERROR_CODE_MSG.SYSTEM_STANDARD, err.message);
			log.error("ERROR: TRY-CATCH", err);
		}
		return objStatus;
    }
    function getDataSSItemMasterTaxSchedule(_resultSearch, _objFilters) {
        let _page = _objFilters.page;
		let _pageSize = _objFilters.pageSize;
		let myColumns = _resultSearch.columns;
		
		let resultSearch = _resultSearch.runPaged({pageSize: _pageSize});
		let arrResult = [];
		let currentPage = [];
		if(_page > 0 && _page <= resultSearch.pageRanges.length){
			currentPage = resultSearch.fetch({index : (_page - 1)}).data;
		}
		for(let i = 0; i < currentPage.length; i++){
			let obj = {
                internalid: currentPage[i].id,
                itemid: currentPage[i].getValue(myColumns[0]),
                displayname: currentPage[i].getValue(myColumns[1]),
                salesdescription: currentPage[i].getValue(myColumns[2]),
                type: currentPage[i].getValue(myColumns[3]),
                type_display: currentPage[i].getText(myColumns[3]),
                baseprice: currentPage[i].getValue(myColumns[4]) * 1,
                taxschedule: currentPage[i].getValue(myColumns[5]),
                taxschedule_display: currentPage[i].getText(myColumns[5]),
                created: currentPage[i].getValue(myColumns[6]),
                modified: currentPage[i].getValue(myColumns[7]),
            };
            
			arrResult.push(obj);
		}

        return {data: arrResult, info:{pageSize: _pageSize, totalPage: resultSearch.pageRanges.length, page: _page, count: currentPage.length}};
    }

	const apiSearchCustomForm = (reqBody) => {
		let objStatus = createObjSuccessAPI();
		try {
			const objFilters = reqBody.filters || {};

			let objFilterMandatory = validateFieldsMandatory(objFilters, ["recordtype"]);
			if(!objFilterMandatory.isValidate) {
                let message = ERROR_CODE_MSG.API_FILTERS_MANDATORY.MSG + ": " + objFilterMandatory.arrFieldsInvalid.join(", ");
                let objError = createObjErrorAPI(ERROR_CODE_MSG.API_FILTERS_MANDATORY, message);
                return objError;
            }

			const rec = record.create({
                type: objFilters.recordtype,
                isDynamic: true
            });

            const formField = rec.getField({ fieldId: 'customform' });
            const forms = formField.getSelectOptions();

			objStatus.data = forms.map(e => ({id: e.value, name: e.text}));
		} catch(err) {
			objStatus = createObjErrorAPI(ERROR_CODE_MSG.SYSTEM_STANDARD, err.message);
			log.error("ERROR: TRY-CATCH", err);
		}
		return objStatus;
	}

	// TODO: Purchase Order
	const apiSearchPurchaseOrder = (reqBody) => {
		let objStatus = createObjSuccessAPI();
		try {
			let objSearch = getDataPurchaseOrder(reqBody, reqBody.filters);
			objStatus.data = objSearch.data;
			objStatus.info = objSearch.info;
		} catch(err) {
			objStatus = createObjErrorAPI(ERROR_CODE_MSG.SYSTEM_STANDARD, err.message);
			log.error("ERROR: TRY-CATCH", err);
		}
		return objStatus;
	}
	const apiGetPurchaseOrder = (reqBody) => {
		let objStatus = createObjSuccessAPI();
		try {
			let myFilters = {
				transactionline: true, page: 1, pageSize: 1000,
				internalid: reqBody.id
			};
			let objSearch = getDataPurchaseOrder(reqBody, myFilters);
			objStatus.data = objSearch.data?.[0] || {};
		} catch(err) {
			objStatus = createObjErrorAPI(ERROR_CODE_MSG.SYSTEM_STANDARD, err.message);
			log.error("ERROR: TRY-CATCH", err);
		}
		return objStatus;
	}

	function getDataPurchaseOrder(reqBody, objFilters){
		let myFilters = [
			["type","anyof","PurchOrd"], 
			"AND",
			["mainline","is","T"],
			"AND",
			["taxline","is","F"]
		];
		
		if(!!objFilters.internalid){
			myFilters.push("AND", ["internalid","anyof", objFilters.internalid]);
		}
		
		let myColumns = [
			{name: "internalid", label: "internalid", sort: "DESC"}, "tranid", "custbody_scv_external_id", {name: "mainname", label: "entity"}, "currency", "exchangerate", 
			{name: "internalid", join: "requestor", label: "employee"},
			{name: "custentity_scv_legal_name", join: "requestor", label: "employee_display"},
			"approvalstatus", "trandate", "memo", "subsidiary", "department", "location", "cseg_scv_sg_proj", "shipdate", "custbody_scv_expired_date"
		];

		let objResult = getDataCreateSearchWithPageRanges(reqBody.type, myFilters, myColumns, objFilters);

		if(objResult.data.length > 0 && objFilters.transactionline === true) {
			let arrPoId = objResult.data.map(e => e.internalid);
			let arrLineItem = getDataSublistItemPO(reqBody, arrPoId);
			
			objResult.data.forEach(function(objItem){
				let arrFilterItem = arrLineItem.filter(e => e.internalid == objItem.internalid);
				let items = arrFilterItem.map(e => {
					let {internalid, internalid_display, ...rest} = e;
					return rest;
				});
				objItem.item = items;
				return objItem;
			});
		}
		
        return objResult;
    }

	const getDataSublistItemPO = (reqBody, arrPoId) => {
		let myFilters = [
			["type","anyof","PurchOrd"], 
			"AND",
			["mainline","is","F"],
			"AND",
			["taxline","is","F"],
			"AND", 
			["internalid","anyof", arrPoId]
		];
		
		let myColumns = [
			"internalid", "item", "custcol_scv_invoice_entity", 
			{ name: "unitid", label: "units" }, { name: "unit", label: "units_display" },
			"custcol_scv_einvoice_item_unit", "quantity", "rate", "amount",
			"taxcode", "taxtotal", "class", "expectedreceiptdate", "custcol_atlas_promise_date", 
			"custcol_scv_po_sup_barcode", "custcol_scv_upc_code_po", "line"
		];

		let arrResult = getAllDataCreateSavedSearch(reqBody.type, myFilters, myColumns);
		return arrResult;
	}

	// TODO: InterCompany Transfer Order
	const apiSearchInterCompTransferOrder = (reqBody) => {
		let objStatus = createObjSuccessAPI();
		try {
			let objSearch = getDataInterCompTransferOrder(reqBody, reqBody.filters);
			objStatus.data = objSearch.data;
			objStatus.info = objSearch.info;
		} catch(err) {
			objStatus = createObjErrorAPI(ERROR_CODE_MSG.SYSTEM_STANDARD, err.message);
			log.error("ERROR: TRY-CATCH", err);
		}
		return objStatus;
	}
	const apiGetInterCompTransferOrder = (reqBody) => {
		let objStatus = createObjSuccessAPI();
		try {
			let myFilters = {
				transactionline: true, page: 1, pageSize: 1000,
				internalid: reqBody.id
			};
			let objSearch = getDataInterCompTransferOrder(reqBody, myFilters);
			objStatus.data = objSearch.data?.[0] || {};
		} catch(err) {
			objStatus = createObjErrorAPI(ERROR_CODE_MSG.SYSTEM_STANDARD, err.message);
			log.error("ERROR: TRY-CATCH", err);
		}
		return objStatus;
	}

	function getDataInterCompTransferOrder(reqBody, objFilters) {
		let myFilters = [
			["type", "anyof", "TrnfrOrd"],
			"AND",
			["mainline","is","T"]
		];

		if(!!objFilters.internalid) {
			myFilters.push("AND", ["internalid", "anyof", objFilters.internalid]);
		}
		
		let myColumns = [
			{name: "internalid", label: "internalid", sort: "DESC"}, "tranid", "transactionnumber", "custbody_scv_external_id", 
			"tosubsidiary", "subsidiary", "trandate", "memo", "firmed", "incoterm",
			{name: "internalid", join: "requestor", label: "employee"},
			{name: "custentity_scv_legal_name", join: "requestor", label: "employee_display"},
			"location", "transferlocation", "department", "class", "cseg_scv_channel",
			"cseg_scv_sg_proj", "shipdate", "shipcarrier"
		];

		let objResult = getDataCreateSearchWithPageRanges(reqBody.type, myFilters, myColumns, objFilters);

		if(objResult.data.length > 0 && objFilters.transactionline === true) {
			let arrTranId = objResult.data.map(e => e.internalid);
			let arrLineItem = getDataSublistItemInterCompTO(reqBody, arrTranId);
			
			objResult.data.forEach(function(objItem){
				let arrFilterItem = arrLineItem.filter(e => e.internalid == objItem.internalid);
				let items = arrFilterItem.map(e => {
					let {internalid, internalid_display, ...rest} = e;
					return rest;
				});
				objItem.item = items;
				return objItem;
			});
		}
		
        return objResult;
	}

	const getDataSublistItemInterCompTO = (reqBody, arrTranId) => {
		let myFilters = [
			["type", "anyof", "TrnfrOrd"],
			"AND",
			["mainline","is","F"],
			"AND",
			["taxline","is","F"],
			"AND", 
			["transactionlinetype","anyof", ["ITEM", "SHIPPING", "RECEIVING"]], 
			"AND",
			["internalid","anyof", arrTranId]
		];

		let myColumns = [
			"internalid", "item", "quantitycommitted", "quantitypicked", "quantitypacked",
			{ name: "unitid", label: "units" }, { name: "unit", label: "units_display" },
			"quantity", "amount", "custcol_scv_cost_avg_ban_le",
			"expectedreceiptdate", "class", "custcol_scv_distribute_unit",
			"transactionlinetype", "line"
		];

		let arrResult = getAllDataCreateSavedSearch(reqBody.type, myFilters, myColumns);
		return arrResult;
	}

	// TODO: Item fulfillment From TO
	const apiAddItemFulfillmentFromTO = (reqBody) => {
		let objStatus = createObjSuccessAPI();
		try {
			let objFields = reqBody.fields;

			let objFieldsMandatory = validateFieldsMandatory(objFields, ["createdfrom"]);
			if(!objFieldsMandatory.isValidate) {
                let message = ERROR_CODE_MSG.API_FIELDS_MANDATORY.MSG + ": " + objFieldsMandatory.arrFieldsInvalid.join(", ");
                let objError = createObjErrorAPI(ERROR_CODE_MSG.API_FIELDS_MANDATORY, message);
                return objError;
            }
			// format date
			let arrColumnDate = ["trandate"];
			arrColumnDate.forEach(ele => {
				objFields[ele] = !!objFields[ele] ? format.parse({value: objFields[ele], type: "date"}) : "";
			});

			// transform record
			let itfRec = record.transform({
				fromType: 'transferorder',
				fromId: objFields.createdfrom,
				toType: 'itemfulfillment',
				isDynamic: true,
			});

			// set body fields
			let bodyFields = [
				'custbody_scv_external_id', 'trandate', 'memo', 'incoterm', 'cseg_scv_channel', 
				'subsidiary', 'transferlocation', 'cseg_scv_sg_proj', 'custbody_scv_invoice_number',
				'custbody_scv_epxk_code', 'custbody_scv_external_id', 'externalid'
			];
			for(let fieldId of bodyFields) {
				itfRec.setValue(fieldId, objFields[fieldId]);
			}
			// editable line item
			let items = objFields.item;
			let objReqSublist = editLineItemRecItemFulfillment(itfRec, items);

			if(!objReqSublist.isSuccess) {
				let message = "Required fields in sublist item: " + objReqSublist.fields.join(", ");
                let objError = createObjErrorAPI(ERROR_CODE_MSG.API_FIELDS_MANDATORY, message);
                return objError;
			}
			// saved record
			let itfId = itfRec.save({enableSourcing: false, ignoreMandatoryFields: true});

			objStatus.data = {
				internalid: itfId,
				createdfrom: {
					value: itfRec.getValue("createdfrom"), 
					text: itfRec.getText("createdfrom"), 
				}
			};
		} catch(err) {
			objStatus = createObjErrorAPI(ERROR_CODE_MSG.SYSTEM_STANDARD, err.message);
			log.error("ERROR: TRY-CATCH", err);
		}
		return objStatus;
	}
	const editLineItemRecItemFulfillment = (tranRec, data) => {
		let objRequired = {
			isSuccess: true,
			fields: []
		};
		let isRequiredItem = data.every(e => e.item);
		let isRequiredOrderLine = data.every(e => e.orderline);
		
		if(isRequiredItem && isRequiredOrderLine) {
			let sl = "item";
			let totalLine = tranRec.getLineCount(sl);
			for(let i = 0; i < totalLine; i++) {
				let item = tranRec.getSublistValue(sl, "item", i);
				let orderline = tranRec.getSublistValue(sl, "orderline", i);
				
				let obj_find_data = data.find(e => e.item == item && e.orderline == orderline);
				
				tranRec.selectLine({ sublistId: sl, line: i });
				if(!!obj_find_data) {
					let sublistFields = [
						"description", "units", "location", "quantity", "class", "custcol_scv_distribute_unit"
					];
					for(let fieldId of sublistFields) {
						tranRec.setCurrentSublistValue(sl, fieldId, obj_find_data[fieldId]);
					}
				} else {
					tranRec.setCurrentSublistValue(sl, 'itemreceive', false);
				}
				tranRec.commitLine({ sublistId: sl });
			}
		} 
		else {
			objRequired.isSuccess = false;
			if(!isRequiredItem) {
				objRequired.fields.push("item");
			}
			if(!isRequiredOrderLine) {
				objRequired.fields.push("orderline");
			}
		}
		return objRequired;
	}
	const apiGetItemFulfillmentFromTO = (reqBody) => {
		let objStatus = createObjSuccessAPI();
		try {
			let myFilters = [
				["type","anyof","ItemShip"], 
				"AND",
				["mainline","is","F"],
				"AND",
				["taxline","is","F"],
				"AND", 
				["internalid","anyof", reqBody.id],
				"AND",
				["transactionlinetype","anyof", ["INTRANSIT"]], 
			];   

			let headerColumns = [
				"internalid", "tranid", "createdfrom", "custbody_scv_external_id", "trandate", "postingperiod",
				"memomain", "incoterm", "cseg_scv_channel", "subsidiary", "transferlocation", "cseg_scv_sg_proj",
				"custbody_scv_invoice_number", "custbody_scv_epxk_code",
			];
			let lineColumns = [
				"item", { name: "unitid", label: "units" }, { name: "unit", label: "units_display" }, 
				"location", "quantity", "class", 
				"custcol_scv_distribute_unit"
			]
			let arrResult = getAllDataCreateSavedSearch('itemfulfillment', myFilters, [...headerColumns, ...lineColumns]);
			let objResult = arrResult[0];

			let data = extractFields(objResult, headerColumns);
			data.item = arrResult.map(obj => extractFields(obj, lineColumns));
			
			objStatus.data = data;
		} catch(err) {
			objStatus = createObjErrorAPI(ERROR_CODE_MSG.SYSTEM_STANDARD, err.message);
			log.error("ERROR: TRY-CATCH", err);
		}
		return objStatus;
	}
	const apiUpdateItemFulfillmentFromTO = (reqBody) => {
		let objStatus = createObjSuccessAPI();
		try {
			let objFields = reqBody.fields || {};

			let itfRec = record.load({
				type: "itemfulfillment",
				id: reqBody.id,
				isDynamic: true
			});

			// format date
			let arrColumnDate = ["trandate"];
			arrColumnDate.forEach(ele => {
				objFields[ele] = !!objFields[ele] ? format.parse({value: objFields[ele], type: "date"}) : "";
			});

			let isUpdateBody = updateFieldOnBody(itfRec, objFields, [
				"trandate", "memo", "incoterm", "cseg_scv_channel", "subsidiary", 
				"transferlocation", "cseg_scv_sg_proj", "custbody_scv_invoice_number",
				"custbody_scv_epxk_code"
			]);
			if(!!isUpdateBody) {
				itfRec.save({enableSourcing: false, ignoreMandatoryFields : true});
			}
			objStatus.data = {
				internalid: reqBody.id
			}
		} catch(err) {
			objStatus = createObjErrorAPI(ERROR_CODE_MSG.SYSTEM_STANDARD, err.message);
			log.error("ERROR: TRY-CATCH", err);
		}
		return objStatus;
	}

	// TODO: Item Receipt From TO
	const apiAddItemReceiptFromTO = (reqBody) => {
		let objStatus = createObjSuccessAPI();
		try {
			let objFields = reqBody.fields;

			let objFieldsMandatory = validateFieldsMandatory(objFields, ["createdfrom"]);
			if(!objFieldsMandatory.isValidate) {
                let message = ERROR_CODE_MSG.API_FIELDS_MANDATORY.MSG + ": " + objFieldsMandatory.arrFieldsInvalid.join(", ");
                let objError = createObjErrorAPI(ERROR_CODE_MSG.API_FIELDS_MANDATORY, message);
                return objError;
            }
			// format date
			let arrColumnDate = ["trandate", "custbody_scv_invoice_date"];
			arrColumnDate.forEach(ele => {
				objFields[ele] = !!objFields[ele] ? format.parse({value: objFields[ele], type: "date"}) : "";
			});
			// transform record
			let itrRec = record.transform({
				fromType: 'transferorder',
				fromId: objFields.createdfrom,
				toType: 'itemreceipt',
				isDynamic: true,
			});
			// set body fields
			let bodyFields = [
				'department', 'employee', 'cseg_scv_sg_proj', 'currency', 'exchangerate',
				'memo', 'custbody_scv_external_id', 
				'custbody_scv_invoice_amount_gross', 'custbody_scv_invoice_date', 
				'custbody_scv_invoice_serial', 'custbody_scv_external_id', 'externalid'
			];
			for(let fieldId of bodyFields) {
				itrRec.setValue(fieldId, objFields[fieldId]);
			}
			// editable line item
			let items = objFields.item;
			let objReqSublist = editLineItemRecItemReceipt(itrRec, items);

			if(!objReqSublist.isSuccess) {
				let message = "Required fields in sublist item: " + objReqSublist.fields.join(", ");
                let objError = createObjErrorAPI(ERROR_CODE_MSG.API_FIELDS_MANDATORY, message);
                return objError;
			}
			// saved record
			let itrId = itrRec.save({enableSourcing: false, ignoreMandatoryFields: true});

			objStatus.data = {
				internalid: itrId,
				createdfrom: {
					value: itrRec.getValue("createdfrom"), 
					text: itrRec.getText("createdfrom"), 
				}
			};
		} catch(err) {
			objStatus = createObjErrorAPI(ERROR_CODE_MSG.SYSTEM_STANDARD, err.message);
			log.error("ERROR: TRY-CATCH", err);
		}
		return objStatus;
	}

	const editLineItemRecItemReceipt = (tranRec, data) => {
		let objRequired = {
			isSuccess: true,
			fields: []
		};
		let isRequiredItem = data.every(e => e.item);
		let isRequiredOrderLine = data.every(e => e.orderline);
		
		if(isRequiredItem && isRequiredOrderLine) {
			let sl = "item";
			let totalLine = tranRec.getLineCount(sl);
			for(let i = 0; i < totalLine; i++) {
				let item = tranRec.getSublistValue(sl, "item", i);
				let orderline = tranRec.getSublistValue(sl, "orderline", i);
				
				let obj_find_data = data.find(e => e.item == item && e.orderline == orderline);
				
				tranRec.selectLine({ sublistId: sl, line: i });
				if(!!obj_find_data) {
					let sublistFields = [
						"description", "units", "location", "quantity", "class", 
						"custcol_scv_distribute_unit", "custcol_atlas_promise_date"
					];
					for(let fieldId of sublistFields) {
						tranRec.setCurrentSublistValue(sl, fieldId, obj_find_data[fieldId]);
					}
				} else {
					tranRec.setCurrentSublistValue(sl, 'itemreceive', false);
				}
				tranRec.commitLine({ sublistId: sl });
			}
		} 
		else {
			objRequired.isSuccess = false;
			if(!isRequiredItem) {
				objRequired.fields.push("item");
			}
			if(!isRequiredOrderLine) {
				objRequired.fields.push("orderline");
			}
		}
		return objRequired;
	}

	const apiGetItemReceiptFromTO = (reqBody) => {
		let objStatus = createObjSuccessAPI();
		try {
			let myFilters = [
				["type","anyof","ItemRcpt"], 
				"AND",
				["mainline","is","F"],
				"AND",
				["taxline","is","F"],
				"AND", 
				["internalid","anyof", reqBody.id],
				"AND",
				["transactionlinetype","anyof", ["INTRANSIT"]], 
			];

			let headerColumns = [
				"internalid", "tranid", "transactionnumber", "trandate", "postingperiod",
				"createdfrom", "custbody_scv_external_id", "memomain",
				// {name: "internalid", join: "requestor", label: "employee"},
				// {name: "custentity_scv_legal_name", join: "requestor"},
				"currency", "exchangerate", "subsidiary", "department", "transferlocation", "location",
				"cseg_scv_sg_proj", "custbody_scv_vehicle_no",
				"custbody_scv_driver_name", "custbody_scv_container_no", "custbody_scv_invoice_amount_gross",
				"custbody_scv_invoice_date", "custbody_scv_invoice_serial"
			];
			let lineColumns = [
				"item", { name: "unitid", label: "units" }, { name: "unit", label: "units_display" }, 
				{name: "formulanumeric", formula: "ABS({quantity})", label: "quantity"}, 
				"class", "custcol_scv_distribute_unit", "custcol_atlas_promise_date"
			];

			let arrResult = getAllDataCreateSavedSearch('itemreceipt', myFilters, [...headerColumns, ...lineColumns]);
			let objResult = arrResult[0];

			
			let data = extractFields(objResult, headerColumns);
			data.item = arrResult.map(obj => extractFields(obj, lineColumns));
			
			objStatus.data = data;
		} catch(err) {
			objStatus = createObjErrorAPI(ERROR_CODE_MSG.SYSTEM_STANDARD, err.message);
			log.error("ERROR: TRY-CATCH", err);
		}
		return objStatus;
	}

	const apiUpdateItemReceiptFromTO = (reqBody) => {
		let objStatus = createObjSuccessAPI();
		try {
			let objFields = reqBody.fields || {};

			let itrRec = record.load({
				type: "itemreceipt",
				id: reqBody.id,
				isDynamic: true
			});

			// format date
			let arrColumnDate = ["trandate"];
			arrColumnDate.forEach(ele => {
				objFields[ele] = !!objFields[ele] ? format.parse({value: objFields[ele], type: "date"}) : "";
			});

			let isUpdateBody = updateFieldOnBody(itrRec, objFields, [
				"trandate", "memo", "currency", "exchangerate", "cseg_scv_channel", "subsidiary", "department",
				"transferlocation", "location", "cseg_scv_sg_proj", "custbody_scv_vehicle_no", "custbody_scv_driver_name",
				"custbody_scv_container_no"
			]);
			// if(!!isUpdateBody) {
			// 	itfRec.save({enableSourcing: false, ignoreMandatoryFields : true});
			// }
			// objStatus.data = {
			// 	internalid: reqBody.id
			// }
		} catch(err) {
			objStatus = createObjErrorAPI(ERROR_CODE_MSG.SYSTEM_STANDARD, err.message);
			log.error("ERROR: TRY-CATCH", err);
		}
		return objStatus;
	}

	// TODO: Item Receipt From PO
	const apiAddItemReceiptFromPO = (reqBody) => {
		let objStatus = createObjSuccessAPI();
		try {
			let objFields = reqBody.fields;

			let objFieldsMandatory = validateFieldsMandatory(objFields, ["createdfrom"]);
			if(!objFieldsMandatory.isValidate) {
                let message = ERROR_CODE_MSG.API_FIELDS_MANDATORY.MSG + ": " + objFieldsMandatory.arrFieldsInvalid.join(", ");
                let objError = createObjErrorAPI(ERROR_CODE_MSG.API_FIELDS_MANDATORY, message);
                return objError;
            }
			// format date
			let arrColumnDate = ["trandate", "custbody_scv_invoice_date"];
			arrColumnDate.forEach(ele => {
				objFields[ele] = !!objFields[ele] ? format.parse({value: objFields[ele], type: "date"}) : "";
			});
			// transform record
			let itrRec = record.transform({
				fromType: 'purchaseorder',
				fromId: objFields.createdfrom,
				toType: 'itemreceipt',
				isDynamic: true,
			});
			// set body fields
			let bodyFields = [
				'department', 'employee', 'cseg_scv_sg_proj', 'currency', 'exchangerate',
				'memo', 'custbody_scv_external_id', 
				'custbody_scv_invoice_amount_gross', 'custbody_scv_invoice_date', 
				'custbody_scv_invoice_serial', 'custbody_scv_external_id', 'externalid'
			];
			for(let fieldId of bodyFields) {
				itrRec.setValue(fieldId, objFields[fieldId]);
			}
			// editable line item
			let items = objFields.item;
			let objReqSublist = editLineItemRecItemReceipt(itrRec, items);

			if(!objReqSublist.isSuccess) {
				let message = "Required fields in sublist item: " + objReqSublist.fields.join(", ");
                let objError = createObjErrorAPI(ERROR_CODE_MSG.API_FIELDS_MANDATORY, message);
                return objError;
			}
			// saved record
			let itrId = itrRec.save({enableSourcing: false, ignoreMandatoryFields: true});

			objStatus.data = {
				internalid: itrId,
				createdfrom: {
					value: itrRec.getValue("createdfrom"), 
					text: itrRec.getText("createdfrom"), 
				}
			};
		} catch(err) {
			objStatus = createObjErrorAPI(ERROR_CODE_MSG.SYSTEM_STANDARD, err.message);
			log.error("ERROR: TRY-CATCH", err);
		}
		return objStatus;
	}

	const apiGetItemReceiptFromPO = (reqBody) => {
		let objStatus = createObjSuccessAPI();
		try {
			let myFilters = [
				["type","anyof","ItemRcpt"], 
				"AND",
				["mainline","is","F"],
				"AND",
				["taxline","is","F"],
				"AND", 
				["internalid","anyof", reqBody.id],
				// "AND",
				// ["transactionlinetype","anyof", ["INTRANSIT"]], 
			];

			let headerColumns = [
				"internalid", "tranid", "transactionnumber", "trandate", "postingperiod",
				"createdfrom", "custbody_scv_external_id", "memomain",
				// {name: "internalid", join: "requestor", label: "employee"},
				// {name: "custentity_scv_legal_name", join: "requestor"},
				"currency", "exchangerate", "subsidiary", "department", "transferlocation", "location",
				"cseg_scv_sg_proj", "custbody_scv_vehicle_no",
				"custbody_scv_driver_name", "custbody_scv_container_no", "custbody_scv_invoice_amount_gross",
				"custbody_scv_invoice_date", "custbody_scv_invoice_serial"
			];
			let lineColumns = [
				"item", { name: "unitid", label: "units" }, { name: "unit", label: "units_display" }, 
				"quantity", "class", "custcol_scv_distribute_unit", "custcol_atlas_promise_date"
			];

			let arrResult = getAllDataCreateSavedSearch('itemreceipt', myFilters, [...headerColumns, ...lineColumns]);
			let objResult = arrResult[0];

			
			let data = extractFields(objResult, headerColumns);
			data.item = arrResult.map(obj => extractFields(obj, lineColumns));
			
			objStatus.data = data;
		} catch(err) {
			objStatus = createObjErrorAPI(ERROR_CODE_MSG.SYSTEM_STANDARD, err.message);
			log.error("ERROR: TRY-CATCH", err);
		}
		return objStatus;
	}

	// TODO: Cash Sale
	const apiAddCashSale = (reqBody) => {
		let objStatus = createObjSuccessAPI();
		try {
			let objFields = reqBody.fields;

			let objFieldsMandatory = validateFieldsMandatory(objFields, ["entity", "subsidiary"]);
			if(!objFieldsMandatory.isValidate) {
                let message = ERROR_CODE_MSG.API_FIELDS_MANDATORY.MSG + ": " + objFieldsMandatory.arrFieldsInvalid.join(", ");
                let objError = createObjErrorAPI(ERROR_CODE_MSG.API_FIELDS_MANDATORY, message);
                return objError;
            }
			// format date
			let arrColumnDate = ["trandate", "saleseffectivedate", "shipdate"];
			arrColumnDate.forEach(ele => {
				objFields[ele] = !!objFields[ele] ? format.parse({value: objFields[ele], type: "date"}) : "";
			});
			// create record
			let cashSaleRec = record.create({type: "cashsale", isDynamic: true});
			// set body fields
			let bodyFields = [
				"entity", "currency", "exchangerate", "memo", "trandate", "otherrefnum", "salesrep", 
				"opportunity", "saleseffectivedate", "subsidiary", "department", "cseg_scv_sg_proj", 
				"cseg_scv_cfl", "cseg_scv_channel", "location", "shipdate", "shipmethod", "custbody_scv_nguoi_mua_hang",
				"custbody_scv_external_id", "externalid", "undepfunds", "custbody_scv_ex_rate_myr_vnd",
				"custbody_eco_trx_count", "custbody_eco_avg_basket_size", "custbody_eco_avg_basket_value"
			];
			for(let fieldId of bodyFields) {
				cashSaleRec.setValue(fieldId, objFields[fieldId]);
			}
			// insert line item
			let sublistFields = [
				"item", "description", "quantity", "units", "price", "rate", 
				"amount", "taxcode", "taxrate1", "grossamt", "tax1amt", "class",
			];
			insertLineItemTransaction(cashSaleRec, objFields.item, sublistFields);
			// saved record
			let cashSaleId = cashSaleRec.save({enableSourcing: false, ignoreMandatoryFields: true});

			objStatus.data = {
				internalid: cashSaleId
			};
		} catch(err) {
			objStatus = createObjErrorAPI(ERROR_CODE_MSG.SYSTEM_STANDARD, err.message);
			log.error("ERROR: TRY-CATCH", err);
		}
		return objStatus;
	}

	const apiGetCashSale = (reqBody) => {
		let objStatus = createObjSuccessAPI();
		try {
			let myFilters = [
				["type","anyof","CashSale"], 
				"AND",
				["mainline","is","F"],
				"AND",
				["taxline","is","F"],
				"AND", 
      			["cogs","is","F"],
				"AND", 
				["internalid","anyof", reqBody.id],
			];

			let headerColumns = [
				"internalid", "tranid", "entity", "currency", "exchangerate", "memomain", "trandate", "otherrefnum", 
				"salesrep", "opportunity", "saleseffectivedate", "subsidiary", "department", 
				"cseg_scv_sg_proj", "cseg_scv_cfl", "cseg_scv_channel", "location", "shipdate", "shipmethod", 
				"custbody_scv_nguoi_mua_hang",
			];
			let lineColumns = [
				"item", { name: "unitid", label: "units" }, { name: "unit", label: "units_display" }, 
				"quantity", "rate", "amount", "taxcode", "class"
			];

			let arrResult = getAllDataCreateSavedSearch(reqBody.type, myFilters, [...headerColumns, ...lineColumns]);
			let objResult = arrResult[0];

			let data = extractFields(objResult, headerColumns);
			data.item = arrResult.map(obj => extractFields(obj, lineColumns));
			
			objStatus.data = data;
		} catch(err) {
			objStatus = createObjErrorAPI(ERROR_CODE_MSG.SYSTEM_STANDARD, err.message);
			log.error("ERROR: TRY-CATCH", err);
		}
		return objStatus;
	}
	const apiUpdateCashSale = (reqBody) => {
		let objStatus = createObjSuccessAPI();
		try {
			
		} catch(err) {
			objStatus = createObjErrorAPI(ERROR_CODE_MSG.SYSTEM_STANDARD, err.message);
			log.error("ERROR: TRY-CATCH", err);
		}
		return objStatus;
	}
	
	// TODO: credit memo
	const apiAddCreditMemo = (reqBody) => {
		let objStatus = createObjSuccessAPI();
		try {
			let objFields = reqBody.fields;

			let objFieldsMandatory = validateFieldsMandatory(objFields, ["entity", "subsidiary"]);
			if(!objFieldsMandatory.isValidate) {
                let message = ERROR_CODE_MSG.API_FIELDS_MANDATORY.MSG + ": " + objFieldsMandatory.arrFieldsInvalid.join(", ");
                let objError = createObjErrorAPI(ERROR_CODE_MSG.API_FIELDS_MANDATORY, message);
                return objError;
            }
			// format date
			let arrColumnDate = ["trandate", "saleseffectivedate"];
			arrColumnDate.forEach(ele => {
				objFields[ele] = !!objFields[ele] ? format.parse({value: objFields[ele], type: "date"}) : "";
			});
			// create record
			let crmmRec = record.create({type: "creditmemo", isDynamic: true});
			// set body fields

			let bodyFields = [
				"entity", "subsidiary", "department", "currency", "exchangerate", "memo", "trandate", "otherrefnum", "salesrep", 
				"account", "saleseffectivedate", "cseg_scv_sg_proj", "cseg_scv_channel", 
				"location", "custbody_scv_nguoi_mua_hang", "custbody_scv_pay_method", "custbody_scv_external_id", "externalid"
			];
			for(let fieldId of bodyFields) {
				crmmRec.setValue(fieldId, objFields[fieldId]);
			}
			// insert line item
			let sublistFields = [
				"item", "description", "quantity", "units", "price", "rate", 
				"amount", "taxcode", "taxrate1", "grossamt", "tax1amt", "class",
			];
			insertLineItemTransaction(crmmRec, objFields.item, sublistFields);
			// saved record
			let cashSaleId = crmmRec.save({enableSourcing: false, ignoreMandatoryFields: true});

			objStatus.data = {
				internalid: cashSaleId
			};
		} catch(err) {
			objStatus = createObjErrorAPI(ERROR_CODE_MSG.SYSTEM_STANDARD, err.message);
			log.error("ERROR: TRY-CATCH", err);
		}
		return objStatus;
	}
	const apiGetCreditMemo = (reqBody) => {
		let objStatus = createObjSuccessAPI();
		try {
			let myFilters = [
				["type","anyof","CustCred"], 
				"AND",
				["mainline","is","F"],
				"AND",
				["taxline","is","F"],
				"AND", 
      			["cogs","is","F"],
				"AND", 
				["internalid","anyof", reqBody.id],
			];

			let headerColumns = [
				"internalid", "tranid", "entity", "currency", "exchangerate", "memomain", "trandate", "otherrefnum", 
				"postingperiod", "salesrep", "accountmain", "saleseffectivedate", "subsidiary", "department", 
				"cseg_scv_sg_proj", "cseg_scv_channel", "location", "custbody_scv_nguoi_mua_hang", "custbody_scv_pay_method",
				"custbody_scv_einvoice_code", "custbody_scv_invoice_serial", "custbody_scv_invoice_number", 
				"custbody_scv_invoice_date", "custbody_scv_einvoice_action"
			];
			let lineColumns = [
				"item", { name: "unitid", label: "units" }, { name: "unit", label: "units_display" }, 
				"quantity", "rate", "amount", "taxcode", "class"
			];

			let arrResult = getAllDataCreateSavedSearch(reqBody.type, myFilters, [...headerColumns, ...lineColumns]);
			let objResult = arrResult[0];

			let data = extractFields(objResult, headerColumns);
			data.item = arrResult.map(obj => extractFields(obj, lineColumns));
			
			objStatus.data = data;
		} catch(err) {
			objStatus = createObjErrorAPI(ERROR_CODE_MSG.SYSTEM_STANDARD, err.message);
			log.error("ERROR: TRY-CATCH", err);
		}
		return objStatus;
	}
	const apiUpdateCreditMemo = (reqBody) => {
		
	}

	// TODO: invoice
	const apiAddInvoice = (reqBody) => {
		let objStatus = createObjSuccessAPI();
		try {
			let objFields = reqBody.fields;

			let objFieldsMandatory = validateFieldsMandatory(objFields, ["entity", "subsidiary"]);
			if(!objFieldsMandatory.isValidate) {
                let message = ERROR_CODE_MSG.API_FIELDS_MANDATORY.MSG + ": " + objFieldsMandatory.arrFieldsInvalid.join(", ");
                let objError = createObjErrorAPI(ERROR_CODE_MSG.API_FIELDS_MANDATORY, message);
                return objError;
            }
			// format date
			let arrColumnDate = ["trandate", "saleseffectivedate", "custbody_scv_invoice_date"];
			arrColumnDate.forEach(ele => {
				objFields[ele] = !!objFields[ele] ? format.parse({value: objFields[ele], type: "date"}) : "";
			});
			// create record
			let invRec = record.create({type: "invoice", isDynamic: true});
			// set body fields
			let bodyFields = [
				"entity", "subsidiary", "department", "currency", "exchangerate", "memo", "trandate", "otherrefnum", 
				"salesrep", "account", "saleseffectivedate", "duedate", "startdate", "enddate", "opportunity", "cseg_scv_sg_proj", 
				"cseg_scv_channel", "location", "custbody_scv_nguoi_mua_hang", "custbody_scv_pay_method", "custbody_scv_einvoice_code", 
				"custbody_scv_invoice_serial", "custbody_scv_invoice_number", "custbody_scv_invoice_date", "custbody_scv_einvoice_action",
				"custbody_scv_external_id", "externalid"
			];
			for(let fieldId of bodyFields) {
				invRec.setValue(fieldId, objFields[fieldId]);
			}
			// insert line item
			let sublistFields = [
				"item", "description", "quantity", "units", "price", "rate", 
				"amount", "taxcode", "taxrate1", "grossamt", "tax1amt", "class",
			];
			insertLineItemTransaction(invRec, objFields.item, sublistFields);
			// saved record
			let invId = invRec.save({enableSourcing: false, ignoreMandatoryFields: true});

			objStatus.data = {
				internalid: invId
			};
		} catch(err) {
			objStatus = createObjErrorAPI(ERROR_CODE_MSG.SYSTEM_STANDARD, err.message);
			log.error("ERROR: TRY-CATCH", err);
		}
		return objStatus;
	}

	const apiGetInvoice = (reqBody) => {
		let objStatus = createObjSuccessAPI();
		try {
			let myFilters = [
				["type","anyof","CustInvc"], 
				"AND",
				["mainline","is","F"],
				"AND",
				["taxline","is","F"],
				"AND", 
				["internalid","anyof", reqBody.id],
			];

			let headerColumns = [
				"internalid", "tranid", "entity", "currency", "exchangerate", "memomain", "trandate", "otherrefnum", 
				"postingperiod", "salesrep", "accountmain", "saleseffectivedate", "subsidiary", "department", 
				"duedate", "startdate", "enddate", "opportunity", "cseg_scv_sg_proj", "cseg_scv_channel", 
				"location", "custbody_scv_nguoi_mua_hang", "custbody_scv_pay_method", "custbody_scv_einvoice_code", 
				"custbody_scv_invoice_serial", "custbody_scv_invoice_number", "custbody_scv_invoice_date", "custbody_scv_einvoice_action"
			];
			let lineColumns = [
				"item", { name: "unitid", label: "units" }, { name: "unit", label: "units_display" }, 
				{name: "formulanumeric", formula: "ABS({quantity})", label: "quantity"}, 
				"rate", "amount", "taxcode", "class"
			];

			let arrResult = getAllDataCreateSavedSearch(reqBody.type, myFilters, [...headerColumns, ...lineColumns]);
			let objResult = arrResult[0];

			let data = extractFields(objResult, headerColumns);
			data.item = arrResult.map(obj => extractFields(obj, lineColumns));
			
			objStatus.data = data;
		} catch(err) {
			objStatus = createObjErrorAPI(ERROR_CODE_MSG.SYSTEM_STANDARD, err.message);
			log.error("ERROR: TRY-CATCH", err);
		}
		return objStatus;
	}

	const apiUpdateInvoice = (reqBody) => {
		
	}

	// TODO: sales order
	const apiAddSalesOrder = (reqBody) => {
		let objStatus = createObjSuccessAPI();
		try {
			let objFields = reqBody.fields;

			let objFieldsMandatory = validateFieldsMandatory(objFields, ["entity", "subsidiary"]);
			if(!objFieldsMandatory.isValidate) {
                let message = ERROR_CODE_MSG.API_FIELDS_MANDATORY.MSG + ": " + objFieldsMandatory.arrFieldsInvalid.join(", ");
                let objError = createObjErrorAPI(ERROR_CODE_MSG.API_FIELDS_MANDATORY, message);
                return objError;
            }
			// format date
			let arrColumnDate = ["trandate", "saleseffectivedate", "custbody_scv_invoice_date"];
			arrColumnDate.forEach(ele => {
				objFields[ele] = !!objFields[ele] ? format.parse({value: objFields[ele], type: "date"}) : "";
			});
			// create record
			let soRec = record.create({type: "salesorder", isDynamic: true});
			// set body fields
			let bodyFields = [
				"entity", "subsidiary", "department", "currency", "exchangerate", "memo", "trandate", "otherrefnum", 
				"salesrep", "saleseffectivedate", "startdate", "enddate", "opportunity", "cseg_scv_sg_proj", 
				"cseg_scv_channel", "location", "custbody_scv_nguoi_mua_hang", "custbody_scv_pay_method", "custbody_scv_einvoice_code", 
				"custbody_scv_invoice_serial", "custbody_scv_invoice_number", "custbody_scv_invoice_date", "custbody_scv_einvoice_action",
				"custbody_scv_external_id", "externalid"
			];
			for(let fieldId of bodyFields) {
				soRec.setValue(fieldId, objFields[fieldId]);
			}
			// insert line item
			let sublistFields = [
				"item", "description", "quantity", "units", "rate", 
				"amount", "taxcode", "taxrate1", "grossamt", "tax1amt", "class",
			];
			insertLineItemTransaction(soRec, objFields.item, sublistFields);
			// saved record
			let soId = soRec.save({enableSourcing: false, ignoreMandatoryFields: true});

			objStatus.data = {
				internalid: soId
			};
		} catch(err) {
			objStatus = createObjErrorAPI(ERROR_CODE_MSG.SYSTEM_STANDARD, err.message);
			log.error("ERROR: TRY-CATCH", err);
		}
		return objStatus;
	}

	const apiGetSalesOrder = (reqBody) => {
		let objStatus = createObjSuccessAPI();
		try {
			let myFilters = [
				["type", "anyof", "SalesOrd"], 
				"AND",
				["mainline", "is", "F"],
				"AND",
				["taxline", "is", "F"],
				"AND", 
				["internalid", "anyof", reqBody.id],
			];

			let headerColumns = [
				"internalid", "tranid", "entity", "currency", "exchangerate", "memomain", "trandate", "otherrefnum", 
				"salesrep", "saleseffectivedate", "subsidiary", "department", "startdate", "enddate", "opportunity", 
				"cseg_scv_sg_proj", "cseg_scv_channel", "location", "shipdate", "shipcarrier", "shipmethod",
				"custbody_scv_nguoi_mua_hang", "custbody_scv_pay_method", "custbody_scv_einvoice_code", 
				"custbody_scv_invoice_serial", "custbody_scv_invoice_number", "custbody_scv_invoice_date", 
				"custbody_scv_einvoice_action"
			];
			let lineColumns = [
				"item", { name: "unitid", label: "units" }, { name: "unit", label: "units_display" }, 
				{name: "formulanumeric", formula: "ABS({quantity})", label: "quantity"}, 
				"rate", "amount", "taxcode", "class"
			];

			let arrResult = getAllDataCreateSavedSearch(reqBody.type, myFilters, [...headerColumns, ...lineColumns]);
			let objResult = arrResult[0];

			let data = extractFields(objResult, headerColumns);
			data.item = arrResult.map(obj => extractFields(obj, lineColumns));
			
			objStatus.data = data;
		} catch(err) {
			objStatus = createObjErrorAPI(ERROR_CODE_MSG.SYSTEM_STANDARD, err.message);
			log.error("ERROR: TRY-CATCH", err);
		}
		return objStatus;
	}

	const apiUpdateSalesOrder = (reqBody) => {

	}

	// TODO: API Item Location Configuration
	const apiUpdateItemLocationConfiguration = (reqBody) => {
		let objStatus = createObjSuccessAPI();
		try {
			let objFields = reqBody.fields || {};
			let ilcRec = record.load({ type: reqBody.type, id: reqBody.id });

			let isUpdateBody = updateFieldOnBody(ilcRec, objFields, [
				"custrecord_boc_dist_carton_fraction", "custrecord_boc_dist_inner_fraction"
			]);
			if(!!isUpdateBody) {
				ilcRec.save({enableSourcing: false, ignoreMandatoryFields : true});
			}
			objStatus.data = {
				internalid: reqBody.id
			}
		} catch(err) {
			objStatus = createObjErrorAPI(ERROR_CODE_MSG.SYSTEM_STANDARD, err.message);
			log.error("ERROR: TRY-CATCH", err);
		}
		return objStatus;
	}

	// TODO: API saved search listing
	const apiSearchITRFull = (reqBody) => {
		let objStatus = createObjSuccessAPI();
		try {
			let objFilters = reqBody.filters || {};
			let myFilters = [];

			if(!!objFilters.trandate_from) {
				myFilters.push(search.createFilter({
                    name: 'trandate', operator: "onorafter",
                    values: objFilters.trandate_from
                }));
			}
			if(!!objFilters.trandate_to) {
				myFilters.push(search.createFilter({
                    name: 'trandate', operator: "onorbefore",
                    values: objFilters.trandate_to
                }));
			}
			if(!!objFilters.item) {
				myFilters.push(search.createFilter({
                    name: 'item', operator: "anyof", values: objFilters.item
                }));
			}
			if(!!objFilters.subsidiary) {
				myFilters.push(search.createFilter({
                    name: 'subsidiary', operator: "anyof", values: objFilters.subsidiary
                }));
			}
			if(!!objFilters.location) {
				myFilters.push(search.createFilter({
                    name: 'location', operator: "anyof", values: objFilters.location
                }));
			}
			let objSearch = getDataSSDynamicColWithPageRanges(reqBody.type, myFilters, objFilters);
			
			objStatus.data = objSearch.data;
			objStatus.info = objSearch.info;
		} catch(err) {
			objStatus = createObjErrorAPI(ERROR_CODE_MSG.SYSTEM_STANDARD, err.message);
			log.error("ERROR: TRY-CATCH", err);
		}
		return objStatus;
	}

	const apiSearchPoDtlFull = (reqBody) => {
		let objStatus = createObjSuccessAPI();
		try {
			let objFilters = reqBody.filters || {};
			let myFilters = [];

			if(!!objFilters.trandate_from) {
				myFilters.push(search.createFilter({
                    name: 'trandate', operator: "onorafter",
                    values: objFilters.trandate_from
                }));
			}
			if(!!objFilters.trandate_to) {
				myFilters.push(search.createFilter({
                    name: 'trandate', operator: "onorbefore",
                    values: objFilters.trandate_to
                }));
			}

			if(!!objFilters.lastmodifieddate_from) {
				myFilters.push(search.createFilter({
                    name: 'lastmodifieddate', operator: "onorafter",
                    values: objFilters.lastmodifieddate_from
                }));
			}
			if(!!objFilters.lastmodifieddate_to) {
				myFilters.push(search.createFilter({
                    name: 'lastmodifieddate', operator: "onorbefore",
                    values: objFilters.lastmodifieddate_to
                }));
			}

			if(!!objFilters.linelastmodifieddate_from) {
				myFilters.push(search.createFilter({
                    name: 'linelastmodifieddate', operator: "onorafter",
                    values: objFilters.linelastmodifieddate_from
                }));
			}
			if(!!objFilters.linelastmodifieddate_to) {
				myFilters.push(search.createFilter({
                    name: 'linelastmodifieddate', operator: "onorbefore",
                    values: objFilters.linelastmodifieddate_to
                }));
			}

			if(!!objFilters.item) {
				myFilters.push(search.createFilter({
                    name: 'item', operator: "anyof", values: objFilters.item
                }));
			}
			if(!!objFilters.subsidiary) {
				myFilters.push(search.createFilter({
                    name: 'subsidiary', operator: "anyof", values: objFilters.subsidiary
                }));
			}
			if(!!objFilters.location) {
				myFilters.push(search.createFilter({
                    name: 'location', operator: "anyof", values: objFilters.location
                }));
			}
			if(!!objFilters.vendor) {
				myFilters.push(search.createFilter({
                    name: "externalid", join: "vendor", 
					operator: "is", values: objFilters.vendor
                }));
			}
			let objSearch = getDataSSDynamicColWithPageRanges(reqBody.type, myFilters, objFilters);
			
			objStatus.data = objSearch.data;
			objStatus.info = objSearch.info;
		} catch(err) {
			objStatus = createObjErrorAPI(ERROR_CODE_MSG.SYSTEM_STANDARD, err.message);
			log.error("ERROR: TRY-CATCH", err);
		}
		return objStatus;
	}

	const apiSearchInventoryAdjustFull = (reqBody) => {
		let objStatus = createObjSuccessAPI();
		try {
			let objFilters = reqBody.filters || {};
			let myFilters = [];

			if(!!objFilters.trandate_from) {
				myFilters.push(search.createFilter({
                    name: 'trandate', operator: "onorafter",
                    values: objFilters.trandate_from
                }));
			}
			if(!!objFilters.trandate_to) {
				myFilters.push(search.createFilter({
                    name: 'trandate', operator: "onorbefore",
                    values: objFilters.trandate_to
                }));
			}
			if(!!objFilters.item) {
				myFilters.push(search.createFilter({
                    name: 'item', operator: "anyof", values: objFilters.item
                }));
			}
			if(!!objFilters.subsidiary) {
				myFilters.push(search.createFilter({
                    name: 'subsidiary', operator: "anyof", values: objFilters.subsidiary
                }));
			}
			if(!!objFilters.location) {
				myFilters.push(search.createFilter({
                    name: 'location', operator: "anyof", values: objFilters.location
                }));
			}
			let objSearch = getDataSSDynamicColWithPageRanges(reqBody.type, myFilters, objFilters);
			
			objStatus.data = objSearch.data;
			objStatus.info = objSearch.info;
		} catch(err) {
			objStatus = createObjErrorAPI(ERROR_CODE_MSG.SYSTEM_STANDARD, err.message);
			log.error("ERROR: TRY-CATCH", err);
		}
		return objStatus;
	}

	const apiSearchToDtlFull = (reqBody) => {
		let objStatus = createObjSuccessAPI();
		try {
			let objFilters = reqBody.filters || {};
			let myFilters = [];

			if(!!objFilters.trandate_from) {
				myFilters.push(search.createFilter({
                    name: 'trandate', operator: "onorafter",
                    values: objFilters.trandate_from
                }));
			}
			if(!!objFilters.trandate_to) {
				myFilters.push(search.createFilter({
                    name: 'trandate', operator: "onorbefore",
                    values: objFilters.trandate_to
                }));
			}
			if(!!objFilters.item) {
				myFilters.push(search.createFilter({
                    name: 'item', operator: "anyof", values: objFilters.item
                }));
			}
			if(!!objFilters.subsidiary) {
				myFilters.push(search.createFilter({
                    name: 'subsidiary', operator: "anyof", values: objFilters.subsidiary
                }));
			}
			if(!!objFilters.location) {
				myFilters.push(search.createFilter({
                    name: 'location', operator: "anyof", values: objFilters.location
                }));
			}
			if(!!objFilters.transferlocation) {
				myFilters.push(search.createFilter({
                    name: 'transferlocation', operator: "anyof", values: objFilters.transferlocation
                }));
			}
			let objSearch = getDataSSDynamicColWithPageRanges(reqBody.type, myFilters, objFilters);
			
			objStatus.data = objSearch.data;
			objStatus.info = objSearch.info;
		} catch(err) {
			objStatus = createObjErrorAPI(ERROR_CODE_MSG.SYSTEM_STANDARD, err.message);
			log.error("ERROR: TRY-CATCH", err);
		}
		return objStatus;
	}

	const apiSearchCashSalesReport = (reqBody) => {
		let objStatus = createObjSuccessAPI();
		try {
			let objFilters = reqBody.filters || {};
			let myFilters = [];

			if(!!objFilters.trandate_from) {
				myFilters.push(search.createFilter({
                    name: 'trandate', operator: "onorafter",
                    values: objFilters.trandate_from
                }));
			}
			if(!!objFilters.trandate_to) {
				myFilters.push(search.createFilter({
                    name: 'trandate', operator: "onorbefore",
                    values: objFilters.trandate_to
                }));
			}
			if(!!objFilters.item) {
				myFilters.push(search.createFilter({
                    name: 'item', operator: "anyof", values: objFilters.item
                }));
			}
			if(!!objFilters.subsidiary) {
				myFilters.push(search.createFilter({
                    name: 'subsidiary', operator: "anyof", values: objFilters.subsidiary
                }));
			}
			if(!!objFilters.entity) {
				myFilters.push(search.createFilter({
                    name: 'entity', operator: "anyof", values: objFilters.entity
                }));
			}
			let objSearch = getDataSSDynamicColWithPageRanges(reqBody.type, myFilters, objFilters);
			
			objStatus.data = objSearch.data;
			objStatus.info = objSearch.info;
		} catch(err) {
			objStatus = createObjErrorAPI(ERROR_CODE_MSG.SYSTEM_STANDARD, err.message);
			log.error("ERROR: TRY-CATCH", err);
		}
		return objStatus;
	}
    // TODO: others
	
	function insertLineItemTransaction(tranRec, data, sublistFields) {
		let sublistId = "item";
		for(let objData of data) {
			tranRec.selectNewLine(sublistId);
			for(let fieldId of sublistFields) {
				if(objData[fieldId] != undefined && objData[fieldId] != null) {
					tranRec.setCurrentSublistValue(sublistId, fieldId, objData[fieldId]);
				}
			}
			tranRec.commitLine(sublistId);
		}
	}
	function extractFields(source, fields) {
		let result = {};
		for (let field of fields) {
			let fieldId = typeof field === 'object' ? field.label : field;
			result[fieldId] = source[fieldId];
			if (source[fieldId + "_display"]) {
				result[fieldId + "_display"] = source[fieldId + "_display"];
			}
		}
		return result;
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
	function getDataSSDynamicColWithPageRanges(_savedSearchId, _filters, _objFiltersReq) {
		let _page = _objFiltersReq.page;
		let _pageSize = _objFiltersReq.pageSize;
		// load saved search
		let resultSearch = search.load(_savedSearchId);
		let myFilters = resultSearch.filters;
		let myColumns = resultSearch.columns;

		// add filters
		if(util.isArray(_filters)){
			_filters.forEach(_objFilter => myFilters.push(_objFilter));
		}
		else if(util.isObject(_filters) || typeof(_filters) == "object"){
			myFilters.push(_filters)
		}

		// data with page ranges
		resultSearch = resultSearch.runPaged({pageSize: _pageSize});
		let arrResult = [];
		let currentPage = [];
		if(_page > 0 && _page <= resultSearch.pageRanges.length){
			currentPage = resultSearch.fetch({index : (_page - 1)}).data;
		}
		for(let i = 0; i < currentPage.length; i++){
			let obj = {};
			myColumns.forEach((eleColumn, idx) => {
				// let keyId = eleColumn.name;
				// if(!!eleColumn.join || eleColumn.name.slice(0, 7) === "formula") {
					// keyId = eleColumn.label;
				// }
				// keyId = keyId.replace("nohierarchy", "");

				keyId = eleColumn.label.trim();
				keyId = keyId.replaceAll(" ", "_");

				obj[keyId] = currentPage[i].getValue(eleColumn);
				let temp_display = currentPage[i].getText(eleColumn);
				if(lbf.isContainValue(temp_display)){
					obj[keyId + "_display"] = temp_display;
				}
			});
			arrResult.push(obj);
		}

        return {data: arrResult, info: {
			pageSize: _pageSize, totalPage: resultSearch.pageRanges.length, 
			page: _page, count: currentPage.length }
		};
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

	function updateFieldOnBody(_rec, _objSourceData, _arrFieldUpd){
		let isSetValue = false;
		for(let i = 0; i < _arrFieldUpd.length; i++){
			let fieldId = _arrFieldUpd[i];
			// log.error("fieldId", _objSourceData[fieldId]);
			if(_objSourceData[fieldId] != undefined && _objSourceData[fieldId] != null){
				_rec.setValue(fieldId, _objSourceData[fieldId]);

				isSetValue = true;
			}
		}

		return isSetValue;
	}

    const connect = (reqBody) => {
        log.error("res", reqBody);
    }

	function validateFieldsMandatory(objFields, arrFieldsMandatory){
		let isValidate = true;
		let arrFieldsInvalid = [];
		arrFieldsMandatory.forEach(eleFieldMan => {
			if(!lbf.isContainValue(objFields[eleFieldMan])){
				arrFieldsInvalid.push(eleFieldMan);
				isValidate = false;
			}
		})
		return {isValidate: isValidate, arrFieldsInvalid: arrFieldsInvalid};
	}

    function createObjSuccessAPI() {
		return {
			success: true, 
			code: ERROR_CODE_MSG.SUCCESS.CODE, 
			message: ERROR_CODE_MSG.SUCCESS.MSG
		}
	}

	function createObjErrorAPI(TYPE_ERROR, message) {
		return {
			success: false,
			code: TYPE_ERROR.CODE,
			message: message || TYPE_ERROR.MSG
		}
	}

    return {
        ERROR_CODE_MSG,
		validateFieldsMandatory,
        createObjSuccessAPI,
        createObjErrorAPI,
        connect,

        apiSearchTaxCode,
        apiSearchItemMasterTaxSchedule,
		apiSearchITRFull,
		apiSearchPoDtlFull,
		apiSearchInventoryAdjustFull,
		apiSearchToDtlFull,
		apiSearchCashSalesReport,

		apiSearchCustomForm,

		apiSearchPurchaseOrder,
		apiGetPurchaseOrder,

		apiSearchInterCompTransferOrder,
		apiGetInterCompTransferOrder,

		apiAddItemFulfillmentFromTO,
		apiGetItemFulfillmentFromTO,
		// apiUpdateItemFulfillmentFromTO,

		apiAddItemReceiptFromTO,
		apiGetItemReceiptFromTO,
		// apiUpdateItemReceiptFromTO,

		apiAddItemReceiptFromPO,
		apiGetItemReceiptFromPO,
		// apiUpdateItemReceiptFromPO,

		apiAddCashSale,
		apiGetCashSale,
		// apiUpdateCashSale,

		apiAddCreditMemo,
		apiGetCreditMemo,
		// apiUpdateCreditMemo,

		apiAddInvoice,
		apiGetInvoice,
		// apiUpdateInvoice,

		apiAddSalesOrder,
		apiGetSalesOrder,
		// apiUpdateSalesOrder,

		apiUpdateItemLocationConfiguration,
    }
});