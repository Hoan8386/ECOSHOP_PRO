/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/url'],

function(ccr, url) {
    
	function refresh() {
		window.location.reload();
	}
	
	function searchReport() {
		window.onbeforeunload = null;
		var currentRecord = ccr.get();
		var urlDC = url.resolveScript({
			scriptId: 'customscript_scv_sl_einvoice_updinv',
		    deploymentId: 'customdeploy_scv_sl_einvoice_updinv',
		    returnExternalUrl: false,
			params: getParams(currentRecord)
		});
		window.location.replace(urlDC);
	}
	
	function checkAll() {
		setValueSelect(true);
	}
	
	function unCheckAll() {
		setValueSelect(false);
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
			custpage_cfromdate: currentRecord.getText('custpage_cfromdate'),
			custpage_ctodate: currentRecord.getText('custpage_ctodate'),
			custpage_subsidiary: currentRecord.getValue('custpage_subsidiary'),
			custpage_tranid: currentRecord.getValue('custpage_tranid')
		}
	}
	
	function pageInit(scriptContext) {
		removeElement('tbl_custpage_sl_insert');
		removeElement('tbl_custpage_sl_remove');
		removeElement('tbl_custpage_sl_addedit');
    }
	
	function removeElement(id) {
		var elm = document.getElementById(id);
		if(isContainValue(elm)) {
			elm.remove();
		}
	}
	
	function saveRecord(scriptContext) {
		var isValid = false;
		var currentRecord = scriptContext.currentRecord;
		var sl = 'custpage_sl', select;
		var lc = currentRecord.getLineCount(sl);
		for(var i = 0; i < lc; i++) {
			select = currentRecord.getSublistValue({sublistId: sl, fieldId: 'custpage_slf_select', line: i});
			if(select === 'T' || select === true) {
				isValid = true;
				break;
			}
		}
		if(isValid === false) {
			alert('Bạn có phải chọn ít nhất một line!');
			return isValid;
		} else {
			return confirm('Bạn có muốn update không?');
		}
	}
	
	function isContainValue(value) {
		var isContain = false;
		if(value !== undefined && value !== null && value !== '') {
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
	
    return {
    	refresh: refresh,    	
    	searchReport: searchReport,
    	checkAll: checkAll,
    	unCheckAll: unCheckAll,
    	pageInit: pageInit,
    	saveRecord: saveRecord
    };
    
});
