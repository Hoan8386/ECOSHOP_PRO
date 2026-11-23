/**
 * Nội dung: 
 * Key:
 * =======================================================================================
 *  Date                Author                  Description
 *  02 Nov 2026         Huy Pham			    Init, create file, PO Email to contact after Approved., from ms.Bảo Ngọc(https://app.clickup.com/t/3773072/14yhnhmhdmf)
 */
/**
 * @NApiVersion 2.1
 * @NScriptType WorkflowActionScript
 */
define([
    'N/email', 'N/search', 'N/render', 'N/runtime', 'N/query', 'N/record',
    '../lib/scv_lib_pdf.js', 
    '../common/scv_common_print_po.js',
],
    (
        email, search, render, runtime, query, record,
        libPdf,
        commonPrintPo,
    ) => {
        /**
         * Defines the WorkflowAction script trigger point.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.workflowId - Internal ID of workflow which triggered this action
         * @param {string} scriptContext.type - Event type
         * @param {Form} scriptContext.form - Current form that the script uses to interact with the record
         * @since 2016.1
         */
        const onAction = (scriptContext) => {
            let newRec = scriptContext.newRecord;

            let curScript = runtime.getCurrentScript();
            let tmplEmailId = curScript.getParameter({name : 'custscript_scv_po_sendemail_tmpl'});
            if(!tmplEmailId) return;

            let employeeId = newRec.getValue("employee");
            if(!employeeId) return;

            let entityId = newRec.getValue("entity");
            let arrEmailRecients = getEmailRecipents(entityId);
            if(arrEmailRecients.length == 0) return;

            let renderer = libPdf.renderTemplateWithXml("scv_print_po");
            let rec = addDefaultRecordRender(renderer, newRec.type, newRec.id);
            let objDefSub = addDefaultSubsidiary(rec, renderer);
            commonPrintPo.addDataSource(rec, renderer, objDefSub.record);

            let filePrintPdf = renderer.renderAsPdf();
            if(!filePrintPdf) return;

            filePrintPdf.name = rec.getValue('tranid') + '.pdf';

            let objMergeEmail = {
                templateId: tmplEmailId,
                transactionId: newRec.id,
            };

            let objResMergeEmail = {
                subject: "",
                body: "",
            };

            if(!!objMergeEmail.transactionId && !!objMergeEmail.templateId){
                objResMergeEmail  = render.mergeEmail(objMergeEmail);
            }
            
            email.send({
                author: employeeId,
                recipients: arrEmailRecients,
                subject: objResMergeEmail.subject,
                body: objResMergeEmail.body||"",
                attachments: [filePrintPdf],
                relatedRecords: {
                    transactionId: newRec.id,
                }
            });
        }

        const getEmailRecipents = (entityId) => {
            if(!entityId) return [];

            let arrResult = query.runSuiteQL({
                query: `SELECT
                    a.email,
                    a.company
                FROM
                    contact a,
                    CompanyContactRelationship b
                WHERE
                    a.isinactive = 'F'
                    AND a.email IS NOT NULL
                    AND a.id = b.contact
                    AND b.company = '${entityId}'`
            }).asMappedResults();

            return arrResult.map(e => e.email);
        }

        const addDefaultRecordRender = (renderer, type, id) => {
            let rec = record.load({
                type: type,
                id: id,
                isDynamic: false
            });
            renderer.addRecord('record', rec);
            return rec;
        }

        const addDefaultSubsidiary = (rec, renderer) => {
            let subsidiary_id = rec.getValue("subsidiary");
            if(!subsidiary_id) return {};

            let subRec = record.load({ type: "subsidiary", id: subsidiary_id });
            renderer.addRecord('subsidiary', subRec);

            let addressRec = subRec.getSubrecord({
                fieldId: 'mainaddress'
            });
            let objAddress = {
                addr1: addressRec.getValue("addr1"),
                addressee: addressRec.getValue("addressee"),
                country: addressRec.getValue("country"),
                addrphone: addressRec.getValue("addrphone"),
            };
            
            return {
                record: subRec,
                objAddress: objAddress
            };
        }

        return {onAction};
    });
