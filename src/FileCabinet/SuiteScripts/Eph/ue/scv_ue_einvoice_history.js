/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/url'],

(record, search, url) => {
   
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
    	if(scriptContext.type === 'view') {
    		let newRecord = scriptContext.newRecord;
    		addButtonViewEInvoice(scriptContext.form, newRecord.id)
    	}
    }
    
    const addButtonViewEInvoice = (form, internalId) => {
        let viewUrl = url.resolveScript({
            scriptId: 'customscript_scv_sl_einvoice_view_his',
            deploymentId: 'customdeploy_scv_sl_einvoice_view_his',
            returnExternalUrl: false,
            params: {
                id: internalId
            }
        });
        form.addButton({id: 'custpage_bt_einvoice_view', label: 'View EInvoice', functionName: "window.open('" + viewUrl + "');"});
    }
    

    return {
        beforeLoad
    };
    
});
