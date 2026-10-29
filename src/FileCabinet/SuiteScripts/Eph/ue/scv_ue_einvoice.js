/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/query', 'N/record', 'N/runtime', 'N/search', 'N/url',
        '../lib/scv_lib_function.js', '../lib/scv_lib_einvoice'],
(query, record, runtime, search, url, lbf, libEinv) => {
	const isPermission = () => {
    	let currentUser = runtime.getCurrentUser();
		let role = currentUser.role;
		let isPermiss;
		if(currentUser.roleId === 'administrator') {
			isPermiss = true;
		} else {
			isPermiss = search.lookupFields({type: search.Type.ROLE, id: role, columns: ['custrecord_scv_role_issue_einvoice']}).custrecord_scv_role_issue_einvoice;
		}
		
		return isPermiss;
    }
	
	const isStatus = (newRecord) => {
		let status = newRecord.getValue('status');
		let arrStatus = ['Closed', 'Cancelled', 'Pending Approval', 'Rejected', 'Voided', 'Undefined'];
		return !arrStatus.includes(status);
	}
	
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
	const beforeLoad = (scriptContext) => {
    	let tgType = scriptContext.type;
    	let newRecord = scriptContext.newRecord;
    	let form = scriptContext.form;
    	let type = newRecord.type;
    	let internalId = newRecord.id;	
    	if(tgType === 'view') {
    		let subsidiary = newRecord.getValue('subsidiary');
    		let einvoice_code = newRecord.getValue('custbody_scv_einvoice_code');
    		let invoice_serial = newRecord.getValue('custbody_scv_invoice_serial');
    		let invoice_number = newRecord.getValue('custbody_scv_invoice_number');
    		let invoice_date = newRecord.getValue('custbody_scv_invoice_date');
    		let einvoice_action = newRecord.getValue('custbody_scv_einvoice_action');
    		let adjust_for = newRecord.getValue('custbody_scv_invoice_adjust_for');
			let replace_for = newRecord.getValue('custbody_scv_einvoice_replace_for');
    		let adjust_type = newRecord.getValue('custbody_scv_invoice_adjust_type');
    		let transaction_uuid = newRecord.getValue('custbody_scv_e_transaction_uuid');
    		let cqt_status = newRecord.getValue('custbody_scv_cqt_status');
			let cqt_code = newRecord.getValue('custbody_scv_cqt_code');
			let cqt_error = newRecord.getValue('custbody_scv_cqt_error');
			
    		let ispermission = isPermission();
    		if(einvoice_code && isStatus(newRecord)) {
    			if(ispermission) {
        			let isDisplay = isDisplayEinvoice(newRecord);
    				if(isDisplay) {
    					if(!invoice_number) {
							addButtonPreviewEinvoice(form, internalId, type, 'Preview E-Invoice', adjust_type, adjust_for);
							if(adjust_for) {
								addButtonAdjustEInvoice(form, internalId, type, adjust_for);
							} else if(replace_for) {
								addButtonReplaceForEInvoice(form, internalId, type, replace_for);
							} else if(transaction_uuid) {
								addButtonGetInfo(form, internalId, type, transaction_uuid, einvoice_code, subsidiary);
							} else {
								addButtonCreateEInvoice(form, internalId, type, subsidiary);
							}
		    			} else if(invoice_serial && invoice_number && invoice_date) {
							if(transaction_uuid) {
								addButtonViewEInvoice(form, internalId, type);
								if(!cqt_code && !cqt_error) {
									addButtonCqtStatusEInvoice(form, internalId, type, transaction_uuid, cqt_status, einvoice_code, subsidiary);
								}
							}
							if(!cqt_error) {
								if(einvoice_action !== libEinv.EinvoiceStatus.HOA_DON_XOA_BO && adjust_type !== libEinv.AdjustType.DIEU_CHINH_THONG_TIN) {
									if(type === 'salesorder' || type === 'invoice' || type === 'customsale_scv_sum_transaction') {
										addButtonCopyToAdjust(form, internalId, type);
									}
									if(einvoice_action !== libEinv.EinvoiceStatus.HOA_DON_DIEU_CHINH && einvoice_action !== libEinv.EinvoiceStatus.BI_DIEU_CHINH){
										addButtonReplaceEInvoice(form, internalId, type);
									}
								}
								if(einvoice_action !== libEinv.EinvoiceStatus.HOA_DON_XOA_BO && einvoice_action !== libEinv.EinvoiceStatus.BI_DIEU_CHINH &&  transaction_uuid) {
									addButtonCancelEInvoice(form, internalId, type);
								}
							}
							if(cqt_error || einvoice_action === libEinv.EinvoiceStatus.HOA_DON_XOA_BO) {
								addButtonCreateEInvoice(form, internalId, type, subsidiary, 'Copy Issue Einvoice', 'copyissueeinvoice');
							}
		    			} 
	    				
    				}	
    			}	
    		}      		
    	} else if(tgType === 'copy') {
    		let newFields = ['custbody_scv_invoice_number', 'custbody_scv_einvoice_reservation_code',
				 'custbody_scv_einvoice_transactionid', 'custbody_scv_invoice_date', 'custbody_scv_einvoice_action',
				 'custbody_scv_invoice_adjust_for', 'custbody_scv_e_transaction_uuid', 'custbody_scv_invoice_adjust_type',
				 'custbody_scv_einvoice_replace_times', 'custbody_scv_einvoice_time',
				 'custbody_scv_cqt_code', 'custbody_scv_cqt_status', 'custbody_scv_cqt_error', 'custbody_scv_related_transaction'
			];
			let data = ['', '', '', '', '', '', '', '','', '', '','', '', '', '', '', '', '', '', ''];
			lbf.setValueData(newRecord, newFields, data);
			let request = scriptContext.request;
    		if(!request) {
    			return;
    		}    		
    		let param = request.parameters;
			if(param?.adjust_for) {
				lbf.setValueData(newRecord, ['custbody_scv_invoice_adjust_for'], [param.adjust_for]);
			}
    	
    	} else if(tgType === 'create') {
    		let newFields = ['custbody_scv_invoice_number', 'custbody_scv_einvoice_reservation_code',
			 	'custbody_scv_einvoice_transactionid', 'custbody_scv_invoice_date', 'custbody_scv_einvoice_action',
			 	'custbody_scv_invoice_adjust_for', 'custbody_scv_e_transaction_uuid', 'custbody_scv_invoice_adjust_type',
			 	'custbody_scv_einvoice_replace_times', 'custbody_scv_einvoice_time', 'custbody_scv_related_transaction'
			];
			let data = ['', '', '', '', '', '', '', '','', '', '','', '', '', '', '', '', '', '', ''];
 			if(type === 'creditmemo' || type === 'returnauthorization' || type === 'vendorreturnauthorization' || type === 'vendorcredit') {
 				lbf.setValueData(newRecord, newFields, data);
 			} 						
    	}
    }
	
	const isDisplayEinvoice = (newRecord) => {
    	let isDisplay = true;
    	let recType = newRecord.type;
    	let summary_transaction = newRecord.getValue('custbody_scv_summary_transaction');
    	if(!!summary_transaction) {
    		isDisplay = false;
    	}
    	if((recType === 'invoice' || recType === 'salesorder') && isDisplay) {
    		let sql = 'select tl.id from transactionline tl where tl.custcol_scv_sumtrans_line_originno = ' + newRecord.id;
    		let r = query.runSuiteQLPaged({
				query: sql,
				params: [],
				pageSize: 10
			});
    		let numPage = r.pageRanges.length;
    		if(numPage > 0) {
    			isDisplay = false;
    		}
    	}
    	return isDisplay;
    }
    
	const addButtonPreviewEinvoice = (form, internalId, type, label, adjust_type, adjust_for, typeissueeinvoice) => {
		let previewPdfUrl;
		if(adjust_type || !adjust_for) {
			previewPdfUrl = url.resolveScript({
				scriptId: 'customscript_scv_sl_einvoice_draft',
				deploymentId: 'customdeploy_scv_sl_einvoice_draft',
				returnExternalUrl: false,
				params: {adjust_type: adjust_type, trid: internalId, trtype: type}
			});
		} else {
			previewPdfUrl = url.resolveScript({
				scriptId: 'customscript_scv_sl_einvoice_pre_draft',
				deploymentId: 'customdeploy_scv_sl_einvoice_pre_draft',
				returnExternalUrl: false,
				params: {trid: internalId, trtype: type, typeissueeinvoice}
			});
		}
        form.addButton({
            id: 'custpage_bt_preview',
            label: label,
            functionName: "window.open('" + previewPdfUrl + "');"
        });

    }
	
	const addButtonViewEInvoice = (form, internalId, type) => {
        let viewUrl = url.resolveScript({
            scriptId: 'customscript_scv_sl_einvoice_view',
            deploymentId: 'customdeploy_scv_sl_einvoice_view',
            returnExternalUrl: false,
			params: {trid: internalId, trtype: type}
        });
        form.addButton({id: 'custpage_bt_einvoice_view', label: 'View EInvoice', functionName: "window.open('" + viewUrl + "');"});
    }
	
	const addButtonCreateEInvoice = (form, internalId, type, subsidiary_id, btlabel, typeissueeinvoice) => {
        let viewUrl = url.resolveScript({
            scriptId: 'customscript_scv_sl_einvoice_create',
            deploymentId: 'customdeploy_scv_sl_einvoice_create',
            returnExternalUrl: false,
			params: {trid: internalId, trtype: type, typeissueeinvoice}
        });
        let funcBtnClick = "document.getElementById('custpage_bt_einvoice_create').disabled = true; window.location.replace('" + viewUrl + "');";
        form.addButton({id: 'custpage_bt_einvoice_create', label: btlabel || 'Issue EInvoice', functionName: funcBtnClick});
    }
	
	const addButtonCqtStatusEInvoice = (form, internalId, type, transaction_uuid, cqt_status, einvoice_code, subsidiary) =>  {
        let viewUrl = url.resolveScript({
            scriptId: 'customscript_scv_sl_einvoice_cqt_status',
            deploymentId: 'customdeploy_scv_sl_einvoice_cqt_status',
            returnExternalUrl: false,
			params: {trid: internalId, trtype: type, transaction_uuid, cqt_status, einvoice_code, subsidiary}
        });
        form.addButton({id: 'custpage_bt_einvoice_cqtstatus', label: 'CQT Status EInvoice', functionName: "document.getElementById('custpage_bt_einvoice_cqtstatus').disabled = true; window.location.replace('" + viewUrl + "');"});
    }
	
	const addButtonGetInfo = (form, internalId, type, transaction_uuid, einvoice_code, subsidiary) =>  {
		let viewUrl = url.resolveScript({
			scriptId: 'customscript_scv_sl_einvoice_getinfo',
			deploymentId: 'customdeploy_scv_sl_einvoice_getinfo',
			returnExternalUrl: false,
			params: {trid: internalId, trtype: type, transaction_uuid, einvoice_code, subsidiary}
		});
		form.addButton({id: 'custpage_bt_einvoice_getinfo', label: 'Get EInvoice Info', functionName: "document.getElementById('custpage_bt_einvoice_getinfo').disabled = true; window.location.replace('" + viewUrl + "');"});
	}
	
	const addButtonCancelEInvoice = (form, internalId, type) => {
        let viewUrl = url.resolveScript({
            scriptId: 'customscript_scv_sl_einvoice_cancel',
            deploymentId: 'customdeploy_scv_sl_einvoice_cancel',
            returnExternalUrl: false,
			params: {trid: internalId, trtype: type}
        });
        form.addButton({id: 'custpage_bt_einvoice_cancel', label: 'Cancel EInvoice', functionName: "window.location.replace('" + viewUrl + "');"});
    }
	
	const addButtonAdjustEInvoice = (form, internalId, type, adjust_for) => {
        let viewUrl = url.resolveScript({
            scriptId: 'customscript_scv_sl_einvoice_adjust',
            deploymentId: 'customdeploy_scv_sl_einvoice_adjust',
            returnExternalUrl: false,
			params: {trid: internalId, trtype: type, adjust_for}
        });
        form.addButton({id: 'custpage_bt_einvoice_adjust', label: 'Adjust EInvoice', functionName: "window.location.replace('" + viewUrl + "');"});
    }
	
	const addButtonCopyToAdjust = (form, internalId, type) => {
    	let viewUrl = url.resolveRecord({
    	    recordType: type,
    	    recordId: internalId,
    	    isEditMode: true,
			params: {memdoc: '0', adjust_for: internalId}
    	});
        form.addButton({id: 'custpage_bt_cptadjust', label: 'Copy to Adjust', functionName: "window.location.replace('" + viewUrl + "');"});
    }
	
	const addButtonReplaceEInvoice = (form, internalId, type) => {
        let viewUrl = url.resolveScript({
            scriptId: 'customscript_scv_sl_einvoice_replace',
            deploymentId: 'customdeploy_scv_sl_einvoice_replace',
            returnExternalUrl: false,
			params: {trid: internalId, trtype: type}
        });
        form.addButton({id: 'custpage_bt_einvoice_replace', label: 'Replace EInvoice', functionName: "window.location.replace('" + viewUrl + "');"});
    }
	
	const addButtonReplaceForEInvoice = (form, internalId, type, replace_for) => {
		let viewUrl = url.resolveScript({
			scriptId: 'customscript_scv_sl_einvoice_replace_for',
			deploymentId: 'customdeploy_scv_sl_einvoice_replace_for',
			returnExternalUrl: false,
			params: {trid: internalId, trtype: type, replace_for}
		});
		form.addButton({
			id: 'custpage_bt_replace_einvoice',
			label: 'Replace EInvoice',
			functionName: "window.location.replace('" + viewUrl + "');"
		});
	}
	
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
	const beforeSubmit = (scriptContext) => {
    	let tgType = scriptContext.type;
    	let newRecord = scriptContext.newRecord;
    	if(tgType === 'create') {
    		let einvoice_code = newRecord.getValue('custbody_scv_einvoice_code');
    		if(!einvoice_code) {
    			let subsidiary = newRecord.getValue('subsidiary');
				let lkFieldsSubsidiay = search.lookupFields({type: search.Type.SUBSIDIARY, id: subsidiary, columns: ['custrecord_scv_einvoice_form', 'custrecord_scv_einvoice_form.custrecord_scv_eic_invoice_pattern']});
				einvoice_code = lkFieldsSubsidiay.custrecord_scv_einvoice_form[0]?.value;
				let invoice_pattern = lkFieldsSubsidiay['custrecord_scv_einvoice_form.custrecord_scv_eic_invoice_pattern'][0]?.value;
				if(!einvoice_code) {
					let c = ['internalid', 'custrecord_scv_eic_invoice_pattern'];
					let s = search.create({
						type: libEinv.RecordType.EINVOCIE_CODE,
						filters: [['custrecord_scv_eic_subsidiary', 'anyof', subsidiary], 'and', ['isinactive', 'is', false], 'and', ['custrecord_scv_eic_isvat', 'is', true]],
						columns: c
					})
					let r = s.run().getRange({start:0, end: 1});
					if(r.length > 0) {
						einvoice_code = r[0].id;
						invoice_pattern = r[0].getValue(c[1]);
					}
				}
    			
        		newRecord.setValue('custbody_scv_einvoice_code', einvoice_code);
        		newRecord.setValue('custbody_scv_invoice_pattern', invoice_pattern);
    		}
    	}
    	
    }
	
	/*const addButtonReloadEInvoice = (form, internalId, type) => {
    	let viewUrl = url.resolveScript({
            scriptId: 'customscript_scv_sl_einvoice_reload',
            deploymentId: 'customdeploy_scv_sl_einvoice_reload',
            returnExternalUrl: false,
            params: {trid: internalId, trtype: type}
        });
        form.addButton({id: 'custpage_bt_reload_einvoice', label: 'Reload EInvoice', functionName: "window.location.replace('" + viewUrl + "');"});
    }
	
	const isReload = (newRecord) => {
    	let einvoice_code = newRecord.getValue('custbody_scv_einvoice_code');
		let invoice_number = newRecord.getValue('custbody_scv_invoice_number');
		let invoice_date = newRecord.getValue('custbody_scv_invoice_date');
		let isReloadInv = false;
		if(lbf.isContainValue(einvoice_code) && lbf.isContainValue(invoice_number) === false && lbf.isContainValue(invoice_date) === false && lbf.isContainValue(newRecord.id)) {
			let c = ['internalid'];
			let s = search.create({
				type: 'customrecord_scv_einvoice_history',
				filters: [['custrecord_scv_eih_einvoice_reltran', 'anyof', newRecord.id], 'and',
				          ['custrecord_scv_eih_einvoice_action', 'anyof', 1]],
				columns: c
			});
			let r = s.run().getRange(0,1);
			if(r.length > 0) {
				isReloadInv = true;
			}
		}
		return isReloadInv;
    }*/
    
    return {
        beforeLoad, beforeSubmit
    };
    
});
