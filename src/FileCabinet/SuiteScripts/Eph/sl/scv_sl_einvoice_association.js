/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/format', 'N/redirect', 'N/runtime', 'N/record', 'N/query', 'N/search', 'N/ui/serverWidget'
        , '../lib/scv_lib_function.js', '../lib/scv_lib_report.js'],

(format, redirect, runtime, record, query, search, serverWidget, libFunc, libRep) => {
   
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
    	let subsidiary = parameters.custpage_subsidiary;
    	let trandate_from = parameters.custpage_trandate_from;
    	
    	let userObj = runtime.getCurrentUser();
    	let keySmtCreating = userObj.id + '_creating';
		validateCreating(keySmtCreating);
    	
    	let isRun = true, iscomplete = true;
    	if(!subsidiary || !trandate_from) {
    		isRun = false;
    	}
		subsidiary = subsidiary || userObj.subsidiary;
  
		let mdata = getSublistColMaster();
		let sl = mdata.sl;
    	let colid = mdata.c;
    	
    	if(request.method === 'GET') {
    		let form = creatForm(subsidiary, parameters, iscomplete);
    		if(isRun && iscomplete) {
    			let arrRes = [], columns = [], fields = [], filters = [];
    			pushColumnsFields(columns, fields);
				let listNoneOfSql = getNoneOfSql(subsidiary, parameters);
    			pushFilters(filters, subsidiary, parameters);
    			let lar = libRep.doSearch('transaction', arrRes, columns, fields, filters);
    			if(lar > 0) {
	    			form.addSubmitButton({label : 'Create SM'});
	        		form.addButton({id: 'custpage_bt_recal', label: 'Recal Header', functionName: 'recalTotal()'});
	        		addFieldDefaultToCreateCP(form, subsidiary, parameters);
	    		}
	    		let sublist = form.addSublist({id : sl, type : serverWidget.SublistType.LIST, label : 'KẾT QUẢ'});
	    		libRep.addFieldSelect(sublist, mdata.sf_select);
	    		libRep.addFieldSublistColId(sublist, colid);
	    		sublist.addMarkAllButtons();
				//sublist.addButton({id: 'custpage_bt_mark200', label: 'Mark 200', functionName: 'mark200()'});
				
				setSublistValueLine(sublist, colid, arrRes, lar, listNoneOfSql);
	    	}
	    	response.writePage(form);
    	} else {
    		try {
				let smtcid = createSmtCreating(keySmtCreating);
	    		let lcSl = request.getLineCount({group: sl});
	    		let vCheck;
	    		let trandate = parameters.custpage_trandate;
	    		trandate = format.parse({value: trandate, type: format.Type.DATE});
	    		let aggregate = parameters.custpage_aggregate;
				aggregate = aggregate === 'T' || aggregate === true;
	    		let recSO = record.create({type: 'customsale_scv_sum_transaction'});
	    		let line = 0, slIt = 'item';
	    		let nFieldHead = ['entity', 'subsidiary', 'trandate', 'memo', 'custbody_scv_sumtrans_aggregate',
					'custbody_scv_sum_trans_taxtotal', 'custbody_scv_sum_trans_amount', 'custbody_scv_sum_trans_grossamount',
					'location','custbody_scv_nguoi_mua_hang'
				];
	    		let dHead = [parameters.custpage_dfcustomer, subsidiary, trandate, parameters.custpage_memo, aggregate, parameters.custpage_totaltax, parameters.custpage_totalamount, parameters.custpage_totalgross, parameters.custpage_location, parameters.custpage_buyer];
	    		libFunc.setValueData(recSO, nFieldHead, dHead);
	    		let nFieldLine = ['item', 'units', 'rate', 'custcol_scv_sumtrans_line_taxcode', 'custcol_scv_sumtrans_line_taxrate',
					'custcol_scv_sumtrans_line_taxamt', 'custcol_scv_sumtrans_line_grossamt', 'custcol_scv_sumtrans_line_originno',
					'custcol_scv_sumtrans_line_quantity', 'custcol_scv_sumtrans_line_amount',
					'inventorydetailavail', 'quantity', 'amount', 'description'
				];
	    		let arrTaxrate = {};
	    		for(let i = 0; i < lcSl; i++) {
	    			vCheck = request.getSublistValue({group: sl, name: mdata.sf_select, line: i});
	    			if(vCheck === true || vCheck === 'T') {
	    				recSO.insertLine({sublistId: slIt, line: line});
	    				let dLine = makeDataLine(arrTaxrate, request, sl, i);
	    				libFunc.setSublistValueData(recSO, slIt, nFieldLine, line, dLine);
	    				line++;
	    			}
	    		}
	    		let id = recSO.save({enableSourcing: false, ignoreMandatoryFields : true});
	    		record.submitFields({type: 'customrecord_scv_einvoice_smtcreating', id: smtcid, values: {isinactive: true}});
	    		
	    		redirect.toRecord({
	                type: 'customsale_scv_sum_transaction',
	                id: id
	            });
    		} catch (e) {
    			throw e;
    		}			
    	}
    }
    
	const makeDataLine = (arrTaxrate, request, sl, line) => {
		let rate = request.getSublistValue({group: sl, name: 'rate', line: line});
		if(rate < 0) {
			rate = request.getSublistValue({group: sl, name: 'amount', line: line});
		}
		if(libFunc.isContainValue(rate)) {
			rate = parseFloat(rate);
		}
		let quantity = request.getSublistValue({group: sl, name: 'quantity', line: line});
		if(libFunc.isContainValue(quantity)) {
			quantity = 0;
		}
		return [request.getSublistValue({group: sl, name: 'item', line: line}),
			request.getSublistValue({group: sl, name: 'unitid', line: line}),
			rate,
			request.getSublistValue({group: sl, name: 'taxcode', line: line}),
			getTaxrate(arrTaxrate, request.getSublistValue({group: sl, name: 'taxcode', line: line})),
			request.getSublistValue({group: sl, name: 'taxamount', line: line}),
			request.getSublistValue({group: sl, name: 'grossamount', line: line}),
			request.getSublistValue({group: sl, name: 'internalid', line: line}),
			request.getSublistValue({group: sl, name: 'quantity', line: line}),
			request.getSublistValue({group: sl, name: 'amount', line: line}),
			false,
			quantity,
			request.getSublistValue({group: sl, name: 'amount', line: line}),
			request.getSublistValue({group: sl, name: 'memo', line: line})
		];
	}
	
	const creatForm = (subsidiary, parameters, iscomplete) => {
		let title = 'Create Summary Transaction';
		let form = serverWidget.createForm({
			title : title
		});
		form.clientScriptModulePath = '../cs/scv_cs_einvoice_association.js';
		form.addButton({id: 'custpage_bt_search', label: 'Search', functionName: 'searchReport()'});
		
		addFieldSearch(form, subsidiary, parameters);
		if(iscomplete === false) {
			form.addButton({id: 'custpage_bt_refresh', label: 'Refresh', functionName: 'refresh()'});
		}
		return form;
	}
	
	const validateCreating = (keySmtCreating) => {
		let list_smtc = searchKeySmtCreating(keySmtCreating);
		if(list_smtc && list_smtc.length > 0) {
			for(let i in list_smtc) {
				record.submitFields({type: 'customrecord_scv_einvoice_smtcreating', id: list_smtc[i].id, values: {isinactive: true}});
			}
			throw 'Đang tạo Summary Transaction!';
		}
	}
	
	const createSmtCreating = (keySmtCreating) => {
		let recSmtc = record.create({type: 'customrecord_scv_einvoice_smtcreating'});
		recSmtc.setValue('name', keySmtCreating);
		return recSmtc.save();
	}
	
	const setSublistValueLine = (sublist, colid, arrRes, lar, listNoneOfSql) => {
		let tempValue, line = 0, lc = colid.length;
		for(let i = 0; i < lar; i++) {
			let  objLine = arrRes[i];
			let objNoneOf = listNoneOfSql.find(o => (o.originno + '')  === objLine.internalid);
			if(!objNoneOf) {
				for(let j = 0; j < lc; j++) {
					if(colid[j].id) {
						tempValue = objLine[colid[j].id];
						if(tempValue || tempValue === 0) {
							if(colid[j].id === 'memo') {
								tempValue = tempValue.substring(0, 300);
							}
							sublist.setSublistValue({id : colid[j].id, line : line, value : tempValue});
						}
					}
				}
				line++;
			}
		}
	}
	
	const searchKeySmtCreating = (keySmtCreating) => {
		let sql = "select sc.id from customrecord_scv_einvoice_smtcreating sc where sc.isinactive = 'F' and sc.name = ?";
		let list_smtc = [];
		libRep.doSearchSql(list_smtc, null, sql, [keySmtCreating]);
		return list_smtc;
	}
	
	const getTaxrate = (arrTaxrate, taxcode) => {
		let taxrate = null;
		if(taxcode) {
			taxrate = arrTaxrate[taxcode];
			if(!taxrate && taxrate !== 0) {
				let lkFieldsTax = search.lookupFields({type: search.Type.SALES_TAX_ITEM,  id: taxcode, columns: ['rate']});
				taxrate = Number(lkFieldsTax.rate.replace('%',''));
				arrTaxrate[taxcode] = taxrate;
			}
		}
		return taxrate;
	}
	
	const getNoneOfSql = (subsidiary, parameters) => {
		let sql = "select tl.custcol_scv_sumtrans_line_originno originno from transactionline tl join transaction t on tl.custcol_scv_sumtrans_line_originno = t.id where tl.mainline = 'F' and tl.iscogs = 'F' and tl.taxline = 'F' and t.custbody_scv_einvoice_action is null and t.custbody_scv_invoice_number is null and t.status not in('E','V','D')";
		if(subsidiary) {
			sql = sql + " and tl.subsidiary=" + subsidiary;
		}
		if(parameters.custpage_trandate_from && parameters.custpage_trandate_from === parameters.custpage_trandate_to) {
			sql = sql + " and t.trandate='" + parameters.custpage_trandate_from + "'";
		} else {
			if(parameters.custpage_trandate_from) {
				sql = sql + " and t.trandate>='" + parameters.custpage_trandate_from + "'";
			}
			if(parameters.custpage_trandate_to) {
				sql = sql + " and t.trandate<='" + parameters.custpage_trandate_to + "'";
			}
		}
		if(parameters.custpage_customer) {
			sql = sql + " and t.entity=" + parameters.custpage_customer;
		}
		
		sql = sql + " group by tl.custcol_scv_sumtrans_line_originno";
		let listTrid = [];
		libRep.doSearchSqlAll(listTrid, sql, []);
		return listTrid;
	}
	
	const pushFilters = (filters, subsidiary, parameters) => {
    	filters.push(search.createFilter({name: 'mainline', operator: search.Operator.IS, values: false}));
    	filters.push(search.createFilter({name: 'taxline', operator: search.Operator.IS, values: false}));
    	filters.push(search.createFilter({name: 'cogs', operator: search.Operator.IS, values: false}));
    	filters.push(search.createFilter({name: 'type', operator: search.Operator.ANYOF, values: 'CustInvc'}));
    	filters.push(search.createFilter({name: 'subsidiary', operator: search.Operator.ANYOF, values: subsidiary}));
    	filters.push(search.createFilter({name: 'status', operator: search.Operator.NONEOF, values: ["SalesOrd:C","SalesOrd:H","SalesOrd:A","CustInvc:E","CustInvc:V","CustInvc:D"]}));
		//filters.push(search.createFilter({name: 'custbody_scv_auto_issue_e_inv', operator: search.Operator.IS, values: 'F'}));

    	if(parameters.custpage_main_location) {
    		filters.push(search.createFilter({name: 'location', operator: search.Operator.ANYOF, values: parameters.custpage_main_location.split(',')}));
    	}
    	filters.push(search.createFilter({name: 'custbody_scv_einvoice_action', operator: search.Operator.ANYOF, values: '@NONE@'}));
    	filters.push(search.createFilter({name: 'custbody_scv_invoice_number', operator: 'isempty', values: ''}));
    	if(parameters.custpage_trandate_to) {
    		filters.push(search.createFilter({name: 'trandate', operator: search.Operator.ONORBEFORE, values: parameters.custpage_trandate_to}));
    	}
    	if(parameters.custpage_trandate_from) {
    		filters.push(search.createFilter({name: 'trandate', operator: search.Operator.ONORAFTER, values: parameters.custpage_trandate_from}));
    	}
		if(parameters.custpage_customer) {
			filters.push(search.createFilter({name: 'entity', operator: search.Operator.ANYOF, values: parameters.custpage_customer}));
		}
    }
	
	const pushColumnsFields = (columns, fields) => {
    	columns.push({name: 'internalid', label: 'Internal Id'});
    	columns.push({name: 'entity', label: 'Customer Name'});
    	columns.push({name: 'formulatext', label: 'Customer Name', formula: '{entity}'});
    	columns.push({name: 'trandate', label: 'Date', sort: 'ASC'});
    	columns.push({name: 'type', label: 'Type'});
    	columns.push({name: 'currency', label: 'Currency'});
    	columns.push({name: 'tranid', label: 'Tran Id'});
    	columns.push({name: 'item', label: 'Item'});
    	columns.push({name: 'formulatext', label: 'Item', formula: '{item}'});
    	columns.push({name: 'unitid', label: 'Unit ID'});
    	columns.push({name: 'unit', label: 'Unit'});
    	columns.push({name: 'formulanumeric', formula: '{quantityuom}', label: 'Quantity'});
    	columns.push({name: 'rate', label: 'Item Rate'});
    	columns.push({name: "taxcode", label: "Taxcode"});
    	columns.push({name: 'formulatext', label: 'Taxcode', formula: '{taxcode}'});
    	columns.push({name: "formulacurrency", formula: "{grossamount}", label: "Amount"});
    	columns.push({name: "formulacurrency", formula: '{taxamount}', label: 'Amount (Tax)'});
    	columns.push({name: "formulacurrency", formula: "{grossamount} + {taxamount}", label: "Total Amount"});
    	columns.push({name: 'name', join: 'location', label: 'Location'});
    	columns.push({name: 'memo', label: 'Memo'});
		columns.push({name: 'itemtype', label: 'itemtype'});
    	
    	fields.push('internalid');
    	fields.push('entity');
    	fields.push('entity_text');
    	fields.push('trandate');
    	fields.push('type');
    	fields.push('currency');
    	fields.push('tranid');
    	fields.push('item'); 
    	fields.push('item_text');
    	fields.push('unitid');
    	fields.push('unit'); 
    	fields.push('quantity'); 
    	fields.push('rate');  
    	fields.push('taxcode'); 
    	fields.push('taxcode_text');
    	fields.push('amount');
    	fields.push('taxamount');
    	fields.push('grossamount');
    	fields.push('location');
    	fields.push('memo');
		fields.push('itemtype');
    }
	
	const getSublistColMaster = () => {
    	let sl = 'custpage_sl';
    	let slFields = 'custpage_slf_';
    	let c = [{id: 'internalid', label: 'Internal ID', type: 'text', display: 'hidden'}
			,{id: 'entity', label: 'Customer Name', type: 'select', display: 'hidden'}
			,{id: 'entity_text', label: 'Customer Name', type: 'text', display: 'disabled'}
			,{id: 'trandate', label: 'Date', type: 'date', display: 'disabled'}
			,{id: 'type', label: 'Type', type: 'text', display: 'hidden'}
			,{id: 'tranid', label: 'Tran Id', type: 'text', display: 'disabled'}
			,{id: 'item', label: 'Item', type: 'text', display: 'hidden'}
			,{id: 'item_text', label: 'Item...................', type: 'text', display: 'disabled'}
			//,{id: 'description', label: 'Description...................', type: 'text', display: 'hidden'}
			,{id: 'unitid', label: 'Unit', type: 'text', display: 'hidden'}
			,{id: 'unit', label: 'Unit', type: 'text', display: 'disabled'}
			,{id: 'quantity', label: 'Quantity', type: 'float', display: 'disabled'}
			,{id: 'rate', label: 'Rate', type: 'float', display: 'disabled'}
			,{id: 'taxcode', label: 'Taxcode', type: 'text', display: 'hidden'}
			,{id: 'taxcode_text', label: 'Taxcode', type: 'text', display: 'disabled'}
			,{id: 'amount', label: 'Amount', type: 'currency', display: 'disabled'}
			,{id: 'taxamount', label: 'Amount (Tax)', type: 'currency', display: 'disabled'}
			,{id: 'grossamount', label: 'Amount (Gross)', type: 'currency', display: 'disabled'}
			,{id: 'freegiftpromotion', label: 'FGP', type: 'text', display: 'hidden'}
			,{id: 'location', label: 'Location', type: 'text', display: 'disabled'}
			,{id: 'cseg_scv_seg_sc', label: 'Sales Channel', type: 'text', display: 'disabled'}
			,{id: 'cseg_scv_branch', label: 'Branch', type: 'text', display: 'disabled'}
			,{id: 'memo', label: 'Memo', type: 'text', display: 'disabled'}
			,{id: 'otherrefnum', label: 'PO#', type: 'text', display: 'disabled'}
			,{id: 'custcol_scv_tc_item_code', label: 'Item', type: 'text', display: 'hidden'}
			,{id: 'itemtype', label: 'itemtype', type: 'text', display: 'hidden'}
		];
    	let sf_select = 'custpage_slf_select';
    	return {sl: sl, slFields: slFields, c: c, sf_select: sf_select}
    }
	
	const addFieldSearch = (form, subsidiary, parameters) => {
    	let containerId = 'fieldgroup_dc_main';
		form.addFieldGroup({
    	    id : containerId,
    	    label : 'Criteria'
    	});
    	
    	let custpage_subsidiary = form.addField({
	        id: 'custpage_subsidiary', type: serverWidget.FieldType.SELECT,
	        label: 'Subsidiary', container: containerId
	    });
    	libRep.addSelectSubsidiary(custpage_subsidiary, subsidiary);
    	custpage_subsidiary.isMandatory = true;
    	
    	let fieldMainLocation = form.addField({
	        id: 'custpage_main_location', type: serverWidget.FieldType.MULTISELECT,
	        label: 'Location', container: containerId
	    });
		let filterLocation = [search.createFilter({name: 'isinactive', operator: search.Operator.IS, values: false}),
			search.createFilter({name: 'subsidiary', operator: search.Operator.ANYOF, values: subsidiary})
		];
		libRep.addSelectionMulti(fieldMainLocation, 'location', ['internalid', 'name'], filterLocation, true, parameters.custpage_main_location ? parameters.custpage_main_location.split('') : '');
    	
    	let fieldCustomer = form.addField({
	        id: 'custpage_customer', type: serverWidget.FieldType.SELECT,
	        label: 'Customer', container: containerId, source: 'customer'
	    });
    	fieldCustomer.defaultValue = parameters.custpage_customer;
    	
    	let fieldTrandateFrom = form.addField({
	        id: 'custpage_trandate_from', type: serverWidget.FieldType.DATE,
	        label: 'From Date', container: containerId
	    });
    	fieldTrandateFrom.isMandatory = true;
    	fieldTrandateFrom.defaultValue = parameters.custpage_trandate_from;
    	
    	let fieldTrandateTo = form.addField({
	        id: 'custpage_trandate_to', type: serverWidget.FieldType.DATE,
	        label: 'To Date', container: containerId
	    });
    	fieldTrandateTo.defaultValue = parameters.custpage_trandate_to;
    }
	
	const addFieldDefaultToCreateCP = (form, subsidiary, parameters) => {
    	let containerId = 'fieldgroup_dc_default';
		form.addFieldGroup({
    	    id : containerId,
    	    label : 'Default to Create Summary Transaction'
    	});
    	let fieldTrandate = form.addField({
	        id: 'custpage_trandate', type: serverWidget.FieldType.DATE,
	        label: 'Date', container: containerId
	    });
    	fieldTrandate.isMandatory = true;
    	
    	let fieldMemo = form.addField({
	        id: 'custpage_memo', type: serverWidget.FieldType.TEXT,
	        label: 'Memo', container: containerId
	    });
    	fieldMemo.isMandatory = true;
    	
    	let fieldDfCustomer = form.addField({
	        id: 'custpage_dfcustomer', type: serverWidget.FieldType.SELECT,
	        label: 'Customer', container: containerId
	    });
		let filterCustomer = [search.createFilter({name: 'isinactive', join: 'customer', operator: search.Operator.IS, values: false}),
			search.createFilter({name: 'subsidiary', operator: search.Operator.ANYOF, values: subsidiary})
		];
		libRep.addSelection(fieldDfCustomer, 'customersubsidiaryrelationship', ['entity', {name: 'formulatext', formula: '{entity}'}], filterCustomer, true, parameters.custpage_customer);
    	fieldDfCustomer.isMandatory = true;
    	
    	let fieldLocation = form.addField({
	        id: 'custpage_location', type: serverWidget.FieldType.SELECT,
	        label: 'Location', container: containerId
	    });
    	fieldLocation.isMandatory = true;
		let filterLocation = [search.createFilter({name: 'isinactive', operator: search.Operator.IS, values: false}),
			search.createFilter({name: 'subsidiary', operator: search.Operator.ANYOF, values: subsidiary})
		];
		libRep.addSelection(fieldLocation, 'location', ['internalid', 'name'], filterLocation, true, '');
    	
    	form.addField({
	        id: 'custpage_aggregate', type: serverWidget.FieldType.CHECKBOX,
	        label: 'Aggregate', container: containerId
	    });
    	
    	let fieldTtalamount = form.addField({
	        id: 'custpage_totalamount', type: serverWidget.FieldType.CURRENCY,
	        label: 'Total Amount', container: containerId
	    });
    	fieldTtalamount.updateDisplayType({
    	    displayType : serverWidget.FieldDisplayType.DISABLED
    	});
    	
    	let fieldTotaltax = form.addField({
	        id: 'custpage_totaltax', type: serverWidget.FieldType.CURRENCY,
	        label: 'Total Tax', container: containerId
	    });
    	fieldTotaltax.updateDisplayType({
    	    displayType : serverWidget.FieldDisplayType.DISABLED
    	});
    	
    	let fieldTotalgross = form.addField({
	        id: 'custpage_totalgross', type: serverWidget.FieldType.CURRENCY,
	        label: 'Total Gross', container: containerId
	    });
    	fieldTotalgross.updateDisplayType({
    	    displayType : serverWidget.FieldDisplayType.DISABLED
    	});
    	
    	form.addField({
	        id: 'custpage_buyer', type: serverWidget.FieldType.TEXT,
	        label: 'Buyer', container: containerId
	    });
    }
    
    return {
        onRequest
    };
    
});
