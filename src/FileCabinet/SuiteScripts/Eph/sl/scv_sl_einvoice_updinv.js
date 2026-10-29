/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/cache', 'N/redirect', 'N/runtime', 'N/search', 'N/ui/serverWidget', 'N/ui/message', 'N/task'
        , '../lib/scv_lib_report.js'],

(cache, redirect, runtime, search, serverWidget, message, task, libRep) => {
   
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
    	let cfromdate = parameters.custpage_cfromdate;
    	let ctodate = parameters.custpage_ctodate;    	
    	let tranid = parameters.custpage_tranid;
    	
    	
    	let isRun = true, iscomplete = true;
    	if(!subsidiary || !cfromdate || !ctodate) {
    		isRun = false;
    	}
    	let myCache = cache.getCache({
		    name: 'crunSoInv',
		    scope: cache.Scope.PUBLIC
		});
    	
    	let mrTaskId = parameters.mrTaskId;
		if(!mrTaskId) {
			mrTaskId = myCache.get({key: 'mrTaskId', loader: 'loader'});
		}
    	let messageInfo = '';
		if(mrTaskId) {
			let taskStatus = task.checkStatus(mrTaskId);
    		messageInfo = 'TaskId ' + mrTaskId + ' for Update Invoice number is: ' + taskStatus.status;
    		if(taskStatus.status === 'COMPLETE' || taskStatus.status === 'FAILED') {
    			myCache.remove({key: 'mrTaskId'});
    		} else {
    			iscomplete = false;
    		} 
		}
		let mdata = getSublistColMaster();
		let sl = mdata.sl;
    	let colid = mdata.c;
    	let lc = colid.length;
    	
    	if(request.method === 'GET') {
    		let title = 'Update Invoice number từ Summary Transaction về Invoice';
    		let form = serverWidget.createForm({
	    		title : title
	    	});
    		form.clientScriptModulePath = '../cs/scv_cs_einvoice_updinv.js';
    		form.addButton({id: 'custpage_bt_search', label: 'Search', functionName: 'searchReport()'});
    		addFieldSearch(form, subsidiary, cfromdate, ctodate, tranid);
    		if(iscomplete === false) {
    			form.addButton({id: 'custpage_bt_refresh', label: 'Refresh', functionName: 'refresh()'});	    		
    		} 
    		if(messageInfo) {
    			form.addPageInitMessage({type: message.Type.INFORMATION, message: messageInfo, duration: -1});
    		}
    		if(isRun && iscomplete) {
    			
	    		let arrRes = [], filters = [];
	    		let columns = ['internalid', 'tranid'];
				let fields = ['internalid', 'tranid'];
	    		pushFilters(filters, subsidiary, cfromdate, ctodate, tranid);	    		
	    		libRep.doSearch('customsale_scv_sum_transaction', arrRes, columns, fields, filters);
	    		
	    		let lar = arrRes.length;
	    		if(lar > 0) {
	    			form.addSubmitButton({label : 'Update'});	    			
	    		}
	    		let sublist = form.addSublist({id : sl, type : serverWidget.SublistType.LIST, label : 'KẾT QUẢ'});
	    		sublist.addMarkAllButtons();
	    		libRep.addFieldLineColList(sublist, colid);
	    		let tempValue;
	    		for(let i = 0; i < lar; i++) {
					for(let j = 0; j < lc; j++) {
						tempValue = arrRes[i][colid[j].id];
						if(tempValue || tempValue === 0) {
							sublist.setSublistValue({id : colid[j].id, line : i, value : tempValue});
						}						
					}					
				}
	    	}
	    	response.writePage(form);
    	} else {
    		let list_value = [];
			let lcSl = request.getLineCount({group: sl});
    		let internalid, slf_select;    		
    		for(let i = 0; i < lcSl; i++) {
    			slf_select = request.getSublistValue({group: sl, name: 'custpage_slf_select', line: i});
				if(slf_select === true || slf_select === 'T') {
	    			internalid = request.getSublistValue({group: sl, name: 'internalid', line: i});					
	    			list_value.push(internalid);					
				}
    		}    		
    		let mrTaskId = '';
    		try {
    			let mrTask = task.create({taskType: task.TaskType.MAP_REDUCE,
    				scriptId : 'customscript_scv_mr_einvoice_updtran',
					deploymentId : 'customdeploy_scv_mr_einvoice_updtran'
				});
				mrTask.params = {custscript_scv_smt_tran_id: JSON.stringify(list_value)};
	    		mrTaskId = mrTask.submit();	
	    		myCache.put({key: 'mrTaskId', value: mrTaskId});
        	} catch (e) {
        		log.error('exception', e);
        	}
    		redirect.toSuitelet({
    			scriptId: 'customscript_scv_sl_einvoice_updinv',
    		    deploymentId: 'customdeploy_scv_sl_einvoice_updinv',
    		    parameters: {mrTaskId: mrTaskId, custpage_subsidiary: subsidiary, custpage_cfromdate: cfromdate
    		    	, custpage_ctodate: ctodate, custpage_tranid: tranid}
    		});
    	}
    }
	
	const pushFilters = (filters, subsidiary, cfromdate, ctodate, tranid) => {
    	filters.push(search.createFilter({name: 'mainline', operator: search.Operator.IS, values: true}));
    	if(subsidiary) {
    		filters.push(search.createFilter({name: 'subsidiary', operator: search.Operator.ANYOF, values: subsidiary}));
    	}
    	if(cfromdate) {
			filters.push(search.createFilter({name: 'formuladate', operator: search.Operator.ONORAFTER, values: cfromdate
    			,formula: '{trandate}'}));
		}
		if(ctodate) {
			filters.push(search.createFilter({name: 'formuladate', operator: search.Operator.ONORBEFORE, values: ctodate
				,formula: '{trandate}'}));	
		}
		if(tranid) {
			filters.push(search.createFilter({name: 'formulatext', formula: '{tranid}', operator: search.Operator.IS, values: tranid}));
		}
		
    }
	
	const getSublistColMaster = () => {
    	let sl = 'custpage_sl';
    	let slFields = 'custpage_slf_';
	    let c = [
	       {id: 'custpage_slf_select', label: 'Select', type: 'checkbox'}      
	       ,{id: 'internalid', label: 'Internal ID', type: 'text', display: 'disabled'}
	       ,{id: 'tranid', label: 'Document Number', type: 'text', display: 'disabled'}
   	     	
         ];
    	let sf_select = 'custpage_slf_select';
    	return {sl: sl, slFields: slFields, c: c, sf_select: sf_select}
    }
	
	const addFieldSearch = (form, subsidiary, cfromdate, ctodate, tranid) => {
    	form.addFieldGroup({
    	    id : 'fieldgroup_dc_main',
    	    label : 'Criteria'
    	});    	
    	let datenow = new Date();
    	let datefirst = new Date(datenow.getFullYear(), datenow.getMonth(), 1);
    	
    	let custpage_subsidiary = form.addField({
	        id: 'custpage_subsidiary', type: serverWidget.FieldType.SELECT,
	        label: 'Subsidiary', container: 'fieldgroup_dc_main'
	    });
    	libRep.addSelectSubsidiary(custpage_subsidiary, subsidiary);
    	custpage_subsidiary.isMandatory = true;
    	
    	let custpage_cfromdate = form.addField({
	        id: 'custpage_cfromdate', type: serverWidget.FieldType.DATE,
	        label: 'Ngày Từ', container: 'fieldgroup_dc_main'
	    });
    	custpage_cfromdate.isMandatory = true;
    	custpage_cfromdate.defaultValue = cfromdate || datefirst;
    	custpage_cfromdate.updateLayoutType({layoutType: serverWidget.FieldLayoutType.STARTROW})
    	
    	let custpage_ctodate = form.addField({
	        id: 'custpage_ctodate', type: serverWidget.FieldType.DATE,
	        label: 'Ngày Đến', container: 'fieldgroup_dc_main'
	    });
    	custpage_ctodate.isMandatory = true;
    	custpage_ctodate.defaultValue = ctodate || datenow;
    	custpage_ctodate.updateLayoutType({layoutType: serverWidget.FieldLayoutType.ENDROW})
    	
    	let custpage_tranid = form.addField({
	        id: 'custpage_tranid', type: serverWidget.FieldType.TEXT,
	        label: 'Document Number', container: 'fieldgroup_dc_main'
	    });
    	custpage_tranid.defaultValue = tranid;    	
    	
    }
    
    return {
		onRequest
    };
    
});
