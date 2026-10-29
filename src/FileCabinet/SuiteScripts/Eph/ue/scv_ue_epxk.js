/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/url', 'N/runtime', '../lib/scv_lib_function.js', '../lib/scv_lib_epxk'],

(record, search, url, runtime, libFunc, libPxk) => {
	
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
    		let einvoice_code = newRecord.getValue('custbody_scv_epxk_code');
    		let invoice_serial = newRecord.getValue('custbody_scv_epxk_serial');
    		let invoice_number = newRecord.getValue('custbody_scv_epxk_number');
    		let einvoice_action = newRecord.getValue('custbody_scv_epxk_status');
    		let transaction_uuid = newRecord.getValue('custbody_scv_epxk_tran_uuid');
    		if(einvoice_code) {
				if((!invoice_number)) {
					addButtonPrintPreview(form, internalId, type, 'Preview PXK');
					addButtonCreateEInvoice(form, internalId, type);
				} else if(invoice_serial && invoice_number && transaction_uuid) {
					if(einvoice_action !== libPxk.EinvoiceStatus.HOA_DON_XOA_BO && einvoice_action !== libPxk.EinvoiceStatus.BI_DIEU_CHINH ) {
						addButtonCancelEInvoice(form, internalId, type);
					} else if(einvoice_action === libPxk.EinvoiceStatus.HOA_DON_XOA_BO) {
						addButtonPrintPreview(form, internalId, type, 'Preview PXK');
						addButtonCreateEInvoice(form, internalId, type, null,'copyissueeinvoice');
					}
					addButtonViewEInvoice(form, internalId, type);
				}
    		}      		
    	} else if(tgType === 'copy') {
    		let newFields = ['custbody_scv_epxk_number', 'custbody_scv_epxk_reservation_code',
    		                 'custbody_scv_epxk_date', 'custbody_scv_epxk_status',
    		                 'custbody_scv_epxk_tran_uuid', 'custbody_scv_epxk_replace_times', 'custbody_scv_epxk_time'];
			let data = ['', '', '', '', '', '', '', '','', '', '','', '', '', '', ''];
			libFunc.setValueData(newRecord, newFields, data);
    	}
    }
	
	const addButtonPrintPreview = (form, internalId, type, label) => {
    	let createPdfUrl = url.resolveScript({
	        scriptId: 'customscript_scv_sl_epxk_draft',
	        deploymentId: 'customdeploy_scv_sl_epxk_draft',
	        returnExternalUrl: false,
			params: {
				trid: internalId, trtype: type
			}
    	});
        form.addButton({
            id: 'custpage_bt_epxk_preview',
            label: label,
            functionName: "window.open('" + createPdfUrl + "');"
        });

    }
	
	const addButtonViewEInvoice = (form, internalId, type) => {
        let viewUrl = url.resolveScript({
            scriptId: 'customscript_scv_sl_epxk_view',
            deploymentId: 'customdeploy_scv_sl_epxk_view',
            returnExternalUrl: false,
			params: {
				trid: internalId, trtype: type
			}
        });
        form.addButton({id: 'custpage_bt_epxk_view', label: 'View EInvoice', functionName: "window.open('" + viewUrl + "');"});
    }
	
	const addButtonCreateEInvoice = (form, internalId, type, btlabel, typeissueeinvoice) => {
        let viewUrl = url.resolveScript({
        	scriptId: 'customscript_scv_sl_epxk_create',
            deploymentId: 'customdeploy_scv_sl_epxk_create',
            returnExternalUrl: false,
			params: {
				trid: internalId, trtype: type
			}
        });
        if(!!typeissueeinvoice) {
			viewUrl = viewUrl + '&typeissueeinvoice=' + typeissueeinvoice
		}
        form.addButton({id: 'custpage_bt_epxk_create', label: btlabel || 'Issue PXK', functionName: "document.getElementById('custpage_bt_epxk_create').disabled = true; window.location.replace('" + viewUrl + "');"});
    }
	
	const addButtonCancelEInvoice = (form, internalId, type) => {
        let viewUrl = url.resolveScript({
            scriptId: 'customscript_scv_sl_epxk_cancel',
            deploymentId: 'customdeploy_scv_sl_epxk_cancel',
            returnExternalUrl: false,
			params: {
				trid: internalId, trtype: type
			}
        });
        form.addButton({id: 'custpage_bt_epxk_cancel', label: 'Cancel PXK', functionName: "window.location.replace('" + viewUrl + "');"});
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
    	if(tgType === 'create' || tgType === 'edit' || tgType === 'copy') {
    		let einvoice_code = newRecord.getValue('custbody_scv_epxk_code');
    		if(!einvoice_code) {
    			let subsidiary = newRecord.getValue('subsidiary');
				let lkFieldsSubsidiay = search.lookupFields({type: search.Type.SUBSIDIARY, id: subsidiary, columns: ['custrecord_scv_epxk_vcnb']});
				einvoice_code = lkFieldsSubsidiay.custrecord_scv_epxk_vcnb[0]?.value;
        		if(!einvoice_code) {
        			let c = ['internalid'];
            		let s = search.create({
            			type: 'customrecord_scv_einvoice_code',
            			filters: [['custrecord_scv_eic_subsidiary', 'anyof', subsidiary], 'and', ['isinactive', 'is', false]
            			          ,'and', ['custrecord_scv_eic_ispxk', 'is', true]],
            			columns: c
            		})
            		let r = s.run().getRange({start:0, end: 1})
            		if(r.length > 0) {
            			einvoice_code = r[0].id;		    			
            		}
        		}
        		newRecord.setValue('custbody_scv_epxk_code', einvoice_code);
    		}
    	}
    }
    
    return {
        beforeLoad,
        beforeSubmit
    };
    
});
