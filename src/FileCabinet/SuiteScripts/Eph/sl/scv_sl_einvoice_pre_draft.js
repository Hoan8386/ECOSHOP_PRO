/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/redirect', 'N/ui/serverWidget'],
    
(redirect, serverWidget) => {
    /**
     * Defines the Suitelet script trigger point.
     * @param {Object} scriptContext
     * @param {ServerRequest} scriptContext.request - Incoming request
     * @param {ServerResponse} scriptContext.response - Suitelet response
     * @since 2015.2
     */
    const onRequest = (scriptContext) => {
        let request = scriptContext.request;
        let parameters = request.parameters;
        if(request.method === 'GET') {
            if(parameters.adjust_type) {
                redirectToEinvoiceDraft(copyParameters(parameters));
            } else {
                scriptContext.response.writePage(createFormPreDraft(parameters));
            }
        } else {
            redirectToEinvoiceDraft({
                trid: parameters.custpage_id,
                trtype: parameters.custpage_type,
                adjust_type: parameters.custpage_adjust_type
            });
        }
    }
    
    const copyParameters = (parameters) => {
        return {
            trid: parameters.trid,
            trtype: parameters.trtype,
            adjust_type: parameters.adjust_type
        }
    }
    
    const createFormPreDraft = (parameters) => {
        let form = serverWidget.createForm({
            title : 'Preview Einvoice'
        });
        addFieldHiden(form, 'custpage_id', 'Id', parameters.trid);
        addFieldHiden(form, 'custpage_type', 'Record Type', parameters.trtype);
        
        let fieldAdjustType = form.addField({
            id : 'custpage_adjust_type',
            type : serverWidget.FieldType.SELECT, source: 'customlist_scv_einv_adjtype',
            label : 'E Invoice Adjust Type'
        });
        fieldAdjustType.isMandatory = true;
        fieldAdjustType.defaultValue = parameters.adjust_type;
        
        form.addSubmitButton({label: 'Preview'});
        
        return form;
    }
    
    const addFieldHiden = (form, id, label, value) => {
        let fId = form.addField({
            id : id,
            type : serverWidget.FieldType.TEXT,
            label : label
        });
        fId.updateDisplayType({
            displayType : serverWidget.FieldDisplayType.HIDDEN
        });
        fId.defaultValue = value;
    }
    
    const redirectToEinvoiceDraft = (parameters) => {
        redirect.toSuitelet({
            scriptId: 'customscript_scv_sl_einvoice_draft',
            deploymentId: 'customdeploy_scv_sl_einvoice_draft',
            isExternal: false,
            parameters: parameters
        });
    }
    
    return {onRequest}

});
