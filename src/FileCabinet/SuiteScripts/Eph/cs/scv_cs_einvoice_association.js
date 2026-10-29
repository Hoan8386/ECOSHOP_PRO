/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/url', '../lib/scv_lib_cs.js'],

function(ccr, url, libCs) {
    
	function refresh() {
		window.location.reload();
	}
	
	function searchReport() {
		window.onbeforeunload = null;
		var currentRecord = ccr.get();
		var urlDC = url.resolveScript({
			scriptId: 'customscript_scv_sl_einvoice_association',
		    deploymentId: 'customdeploy_scv_sl_einvoice_association',
		    returnExternalUrl: false,
			params: getParams(currentRecord)
		});
		window.location.replace(urlDC);
	}
	
	function checkAll() {
		setValueSelect(true);
		recalTotal();
	}
	
	function unCheckAll() {
		setValueSelect(false);
		var currentRecord = ccr.get();
		currentRecord.setValue('custpage_totalamount', '');
		currentRecord.setValue('custpage_totaltax', '');
		currentRecord.setValue('custpage_totalgross', '');
	}
	
	function recalTotal() {
		var currentRecord = ccr.get();
		var sublistId = 'custpage_sl';
		var total = getTotalAmountPayment(currentRecord, sublistId);
		currentRecord.setValue('custpage_totalamount', total.totalamount);
		currentRecord.setValue('custpage_totaltax', total.totaltax);
		currentRecord.setValue('custpage_totalgross', total.totalgross);
	}
	
	function setValueSelect(value) {
		var currentRecord = ccr.get();
		var sl = 'custpage_sl';
		var sf_select = 'custpage_slf_select';
		var lc = currentRecord.getLineCount(sl);
		for(var i = 0; i < lc; i++) {
			currentRecord.selectLine({sublistId: sl, line: i});
			currentRecord.setCurrentSublistValue({sublistId: sl, fieldId: sf_select, value: value});
			currentRecord.commitLine(sl);
		}
	}
	
	function getParams(currentRecord) {
		return {
			custpage_subsidiary: currentRecord.getValue('custpage_subsidiary'),
			custpage_trandate_from: currentRecord.getText('custpage_trandate_from'),
			custpage_trandate_to: currentRecord.getText('custpage_trandate_to'),
			custpage_customer: currentRecord.getText('custpage_customer'),
			custpage_main_location: currentRecord.getText('custpage_main_location')
		}
	}
	
	function pageInit(scriptContext) {
		removeElement('tbl_custpage_sl_insert');
		removeElement('tbl_custpage_sl_remove');
    }
	
	function removeElement(id) {
		var elm = document.getElementById(id);
		if(isContainValue(elm)) {
			elm.remove();
		}
	}
	
	function getTotalAmountPayment(currentRecord, sublistId) {
		autoCheck(currentRecord, sublistId);
		var lc = currentRecord.getLineCount(sublistId);
		var vCheck, totalgross = 0, totalamount = 0, totaltax = 0;
		for(var i = 0; i < lc; i++) {
			vCheck = currentRecord.getSublistValue({sublistId: sublistId, fieldId: 'custpage_slf_select', line: i});
			if(vCheck === true || vCheck === 'T') {
				totalamount = totalamount + currentRecord.getSublistValue({sublistId: sublistId, fieldId: 'amount', line: i}) * 1;
				totaltax = totaltax + currentRecord.getSublistValue({sublistId: sublistId, fieldId: 'taxamount', line: i}) * 1;
				totalgross = totalgross + currentRecord.getSublistValue({sublistId: sublistId, fieldId: 'grossamount', line: i}) * 1;				
			}
			
		}		
		return {totalamount: totalamount, totaltax: totaltax, totalgross: totalgross};
	}
	
	function autoCheck(currentRecord, sublistId) {
		var vCheck, vnextCheck, vpreCheck, curr_internalid, next_internalid, pre_internalid;
		var lc = currentRecord.getLineCount(sublistId);
		for(var i = 0; i < lc; i++) {
			vCheck = currentRecord.getSublistValue({sublistId: sublistId, fieldId: 'custpage_slf_select', line: i});
			if(vCheck === true || vCheck === 'T') {
				curr_internalid = currentRecord.getSublistValue({sublistId: sublistId, fieldId: 'internalid', line: i});
				if(i < lc - 1) {
					next_internalid = currentRecord.getSublistValue({sublistId: sublistId, fieldId: 'internalid', line: i + 1});
					vnextCheck = currentRecord.getSublistValue({sublistId: sublistId, fieldId: 'custpage_slf_select', line: i + 1});
					if(curr_internalid === next_internalid && !(vnextCheck === true || vnextCheck === 'T')) {
						console.log(curr_internalid);
						currentRecord.selectLine({sublistId: sublistId, line: i + 1});
						currentRecord.setCurrentSublistValue({sublistId: sublistId, fieldId: 'custpage_slf_select', value: true});
						currentRecord.commitLine(sublistId);
					}
				}
			}
			
		}
		lc = lc - 1;
		for(var j = lc; j > 0; j--) {
			vCheck = currentRecord.getSublistValue({sublistId: sublistId, fieldId: 'custpage_slf_select', line: j});
			if(vCheck === true || vCheck === 'T') {
				curr_internalid = currentRecord.getSublistValue({sublistId: sublistId, fieldId: 'internalid', line: j});
				if(j > 0) {
					pre_internalid = currentRecord.getSublistValue({sublistId: sublistId, fieldId: 'internalid', line: j - 1});
					vpreCheck = currentRecord.getSublistValue({sublistId: sublistId, fieldId: 'custpage_slf_select', line: j - 1});
					if(curr_internalid === pre_internalid && !(vpreCheck === true || vpreCheck === 'T')) {
						currentRecord.selectLine({sublistId: sublistId, line: j - 1});
						currentRecord.setCurrentSublistValue({sublistId: sublistId, fieldId: 'custpage_slf_select', value: true});
						currentRecord.commitLine(sublistId);
					}
				}
			}
		}
	}
	
	function fieldChanged(scriptContext){
		var currentRecord = scriptContext.currentRecord;
    	if(scriptContext.fieldId === 'custpage_subsidiary') {
            var subsidiary = currentRecord.getValue('custpage_subsidiary');            
            var c = ['internalid', 'namenohierarchy', 'name'];
            var f = [['isinactive', 'is', false]];
            if(libCs.isContainValue(subsidiary)) {
            	f.push('and');
            	f.push(['subsidiary', 'anyOf', subsidiary]);
            }
            var list_fields = [currentRecord.getField('custpage_location'), currentRecord.getField('custpage_main_location')];
            libCs.insertSelection(list_fields, 'location', c, f, true, null);
            
	        var cc =  ['entity', {name: 'formulatext', formula: '{entity}'}];
	        var fc = [['customer.isinactive', 'is', false]];
	        if(libCs.isContainValue(subsidiary)) {
	        	fc.push('and')
	        	fc.push(['subsidiary', 'anyOf', subsidiary]);
	        }
	        list_fields = [currentRecord.getField('custpage_dfcustomer')];
	        libCs.insertSelection(list_fields, 'customersubsidiaryrelationship', cc, fc, false, null);
    	}
    }
	
	function sublistChanged(scriptContext) {		
		
	}
	
	function postSourcing(scriptContext) {		
		
    }
	
	function saveRecord(scriptContext) {
		recalTotal();
		var isValid = false, sublistId = 'custpage_sl';
		var currentRecord = scriptContext.currentRecord;
		var lc = currentRecord.getLineCount(sublistId);
		var vCheck, taxcode, arrTX = [];
		for(var i = 0; i < lc; i++) {
			vCheck = currentRecord.getSublistValue({sublistId: sublistId, fieldId: 'custpage_slf_select', line: i});
			if(vCheck === true || vCheck === 'T') {
				taxcode = currentRecord.getSublistValue({sublistId: sublistId, fieldId: 'taxcode', line: i});
				isValid = true;
				pushArr(arrTX, taxcode);
			}
			
		}
		var aggregate = currentRecord.getValue('custpage_aggregate');
		if(isValid === false) {
			alert('Hãy chọn ít nhất một giao dịch!');
			return isValid;
		} else {
			if((aggregate === true || aggregate === 'T') && arrTX.length > 1) {
				alert('Hóa đơn gộp chỉ áp dụng cho 1 loại thuế!');
				return false;
			} else {
				return confirm('Bạn có muốn tạo Summary Transaction không?');
			}
		}
	}
	
	function isExists(arr, id) {
		var isExists = false;
		var lArr = arr.length;
		for(var i = 0; i < lArr; i++) {
			if(arr[i] === id) {
				isExists = true;
				break;
			}
		}
		return isExists;
	}
	
	function pushArr(arr, id) {
		if(isExists(arr, id) === false) {
			arr.push(id);
		}
	}
	
	function isContainValue(value) {
		var isContain = false;
		if(value !== undefined && value != null && value !== '') {
			if(util.isArray(value)) {
				if(value.length > 0) {
					isContain = true;
				}
			} else {
				isContain = true;
			}
		}
		return isContain;
	}
	
	function mark200() {
		let currentRecord = ccr.get();
		let sublistId = 'custpage_sl';
		let lc = currentRecord.getLineCount(sublistId);
		let fieldSelect = 'custpage_slf_select';
		if(lc > 200) {
			lc = 200;
		}
		for(var i = 0; i < lc; i++) {
			currentRecord.selectLine({sublistId: sublistId, line: i});
			currentRecord.setCurrentSublistValue({sublistId: sublistId, fieldId: fieldSelect, value: true});
			currentRecord.commitLine(sublistId);
		}
	}
	
    return {
    	refresh: refresh,    	
    	searchReport: searchReport,
    	checkAll: checkAll,
    	unCheckAll: unCheckAll,
    	recalTotal: recalTotal,
    	pageInit: pageInit,
    	fieldChanged: fieldChanged,
    	sublistChanged: sublistChanged,
    	postSourcing: postSourcing,
    	saveRecord: saveRecord,
		mark200: mark200
    };
    
});
