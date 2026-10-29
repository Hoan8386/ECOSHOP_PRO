/**
 * Nội dung:
 * Key word:
 * =======================================================================================
 *  Date                Author                  Description
 *  28 Jun 2024         Khanh Tran              Nút 'PO Print' tại 'Purchase Order', from mr.Quân(https://app.clickup.com/t/86cxpyf25)
 *  13 May 2025         Phu Pham                Mẫu in VRA from mr. Quân (https://app.clickup.com/t/86cyxct1e)
 *  22 Jul 2024         Khanh Tran              Nút 'IR2 Print' tại 'Item Receipt', from mr.Quân(https://app.clickup.com/t/86czqbxkn)
 *  13 Jan 2026         Khanh Tran              Nút 'Close' tại 'Purchase Order', 'Intercompany Transfer Order', 'Transfer Order'from mr.Quân (https://app.clickup.com/t/86d1jnrr5)
 *  28 May 2026         Phu Pham                Add Button 'Compare 1st Date' trên màn hình Item Location Configuration.
 *  24 Jul 2026         Phu Pham                Move code chức năng Approval Item từ DM sang EPH from mr. Đại (https://app.clickup.com/t/3773072/86d1b1bup)
 */
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define([
    'N/url', 'N/search', 'N/query', 'N/file', 'N/runtime', 'N/format',
    '../lib/scv_lib_function.js', '../lib/scv_lib_common_html.js',
    'N/ui/message',
    '../cons/scv_cons_appr_status.js',
],
    
    (
        url, search, query, file, runtime, format,
        lbf, libHtml, message,
        constApprStatus
    ) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */

        const beforeLoad = (scriptContext) => {
            addButtonTypeView(scriptContext);
        }

        const addButtonTypeView = (scriptContext) => {
            if(scriptContext.type != "view") return;

            let form = scriptContext.form;
            let newRec = scriptContext.newRecord;
            let request = scriptContext.request;
            let objCurUser = runtime.getCurrentUser();

            let arrBtnPrint = [], objPrint;
            addBtnCloseOrder(form, newRec, request);

            switch (newRec.type){
                case "customrecord_scv_item_ma":
                    addBtnItemApproval(form, newRec, objCurUser);
                    break;
                case "purchaseorder":
                    addBtnPrintPdf(form, newRec, arrBtnPrint, 'custpage_po_print', 'PO Print', 'scv_po_print');
                    break;
                case "vendorreturnauthorization":
                    addBtnPrintPdf(form, newRec, arrBtnPrint, 'custpage_vra_print', 'VRA Print', 'scv_vra_print');
                    break;
                case "itemreceipt":
                    addBtnPrintPdf(form, newRec, arrBtnPrint, 'custpage_ir_phieu_nhap_kho', 'IR2 Print', 'scv_phieu_nhap_kho');
                    break;
                case "itemlocationconfiguration":
                    addBtnCompare1stDate(form, newRec);
                    break;
            }
            libHtml.addIconButtonExport(form, arrBtnPrint, "custpage_add_icon_prt");
        }

        const addBtnItemApproval = (form, newRec, objCurUser) => {
            let rel_item = newRec.getValue("custrecord_scv_ima_rel_item");
            if(!!rel_item) return;

            let app_status = newRec.getValue("custrecord_scv_ima_app_status");
            if(app_status != constApprStatus.Records.PendingSupervisorApproval.ID) return;

            let ima_approver = newRec.getValue("custrecord_scv_ima_approver");
            if(!ima_approver) return;
            
            let objEmployee = getDataObjEmployee(ima_approver);
            if(objCurUser.id == ima_approver || objCurUser.id == objEmployee.custentity_scv_delegate_to) {
                let urlSL = url.resolveScript({
                    scriptId: 'customscript_scv_sl_mass_approval_ima',
                    deploymentId: 'customdeploy_scv_sl_mass_approval_ima',
                    params: { 
                        custpage_recid: newRec.id,  
                        custpage_rectype: newRec.type, 
                        // custpage_approval_status: constApprStatus.Records.Approved.ID,
                        isrun: "T"
                    }
                });

                form.addButton({
                    id: 'custpage_scv_approval_item',
                    label: 'Approval Item',
                    functionName: "window.location.replace('" + urlSL + "');"
                });
            }
        }

        const getDataObjEmployee = (employeeId) => {
            let entityType = lbf.getEntityType(employeeId);
            if(entityType !== "employee") return {};

            let resultSQL = query.runSuiteQL({
                query: `
                    SELECT id, custentity_scv_delegate_to 
                    FROM employee
                    WHERE id = ${employeeId}`
            });
            resultSQL = resultSQL.asMappedResults();

            return resultSQL[0] || {};
        }

        const addBtnCloseOrder = (form, newRec, request) => {
            if(!['purchaseorder', 'intercompanytransferorder', 'transferorder'].includes(newRec.type)) return;
            let btnClose = form.getButton({ id: 'closeremaining' });
            if(!btnClose) return;

            form.removeButton({ id: 'closeremaining' });

            let isVerifyClose = newRec.getValue("custbody_scv_verify_close");

            if(isVerifyClose === true || (['intercompanytransferorder', 'transferorder'].includes(newRec.type))) {
                addButtonCloseRemaining(form, newRec);
            } 
            // else {
            //     addButtonVerifyClose(form, newRec);
            // }

            // let params = request?.parameters || {};
            // if(!!params.auditId) {
            //     let isSuccess = getDataEcoAuditIsSuccess(params.auditId);
            //     let messageType = isSuccess === "T" ? message.Type.INFORMATION : message.Type.ERROR;
            //     let recordName = newRec.getText("ntype");
                
            //     // let tranid = newRec.getValue('tranid');
            //     // let msgInfo = recordName + " Close Validation: " + createTagLink("customrecord_scv_itg_econnect_audit", params.auditId, tranid);
            //     let msgInfo = recordName + " Close Validation: " + newRec.getValue("custbody_scv_closed_verify_mess");
            //     form.addPageInitMessage({type: messageType, message: msgInfo, duration: -1});
            // }
        }

        const getDataEcoAuditIsSuccess = (auditId) => {
            let resultSQL = query.runSuiteQL({
                query: `
                    SELECT id, custrecord_scv_eco_audit_issuccess 
                    FROM customrecord_scv_itg_econnect_audit
                    WHERE id = ${auditId}`
            });
            resultSQL = resultSQL.asMappedResults();
            return resultSQL.length > 0 ? resultSQL[0].custrecord_scv_eco_audit_issuccess : "F";
        }

        const addButtonVerifyClose = (form, newRec) => {
            let urlScript = url.resolveScript({
                scriptId: 'customscript_scv_sl_econnect_verifyclose',
                deploymentId: 'customdeploy_scv_sl_econnect_verifyclose',
                params: {
                    tranid: newRec.getValue('tranid'), 
                    recid: newRec.id, 
                    rectype: newRec.type
                }
            });
            form.addButton({
                id: 'custpage_scv_verify_close',
                label: 'Verify Close',
                functionName: "window.location.replace('" + urlScript + "');"
            });
            libHtml.addClassBtnSubmit(form, 'custpage_scv_verify_close');
        }

        const addBtnCompare1stDate = (form, newRec) => {
            let urlSL = url.resolveScript({
                scriptId: 'customscript_scv_sl_compare_1st_date',
                deploymentId: 'customdeploy_scv_sl_compare_1st_date',
                params: {
                    recid: newRec.id,
                    rectype: newRec.type,
                }
            });

            form.addButton({
                id: 'custpage_scv_compare_1st_date',
                label: 'Compare 1st Date',
                functionName: `nlExtOpenWindow('${urlSL}', 'scvCompare1stDate', window.innerWidth - 400, window.innerHeight - 200, this, true, 'Compare 1st Date');`
            });
        }
        
        const addButtonCloseRemaining = (form, newRec) => {
            let urlSL = url.resolveScript({
                scriptId: 'customscript_scv_sl_close_order',
                deploymentId: 'customdeploy_scv_sl_close_order',
                params: {
                    tranid: newRec.getValue('tranid'), 
                    recid: newRec.id,
                    rectype: newRec.type,
                    action: 'closeorder'
                    
                }
            });
            form.addButton({
                id: 'custpage_scv_close_remaining',
                label: 'Close',
                functionName: "window.location.replace('" + urlSL + "');"
            });
            libHtml.addClassBtnSubmit(form, 'custpage_scv_close_remaining');
        }

        const addBtnPrintPdf = (form, curRec, arrBtnPrint, btnId, btnLabel, printfile) => {
            let recType = curRec.type;
            let createPdfUrl = url.resolveScript({
                scriptId: 'customscript_scv_sl_addition_print',
                deploymentId: 'customdeploy_scv_sl_addition_print',
                returnExternalUrl: false
            });
            createPdfUrl += '&id=' + curRec.id + '&type=' + recType + '&printfile=' + printfile;
            form.addButton({
                id: btnId,
                label: btnLabel,
                functionName: "window.open('" + createPdfUrl + "');"
            });
            arrBtnPrint.push({export_type: "PDF", id: btnId});
        }

        const addBtnExpWord = (form, curRec, arrBtnPrint, btnId, btnLabel, functionCal) => {
            form.addButton({
                id: btnId, label: btnLabel, functionName: functionCal(curRec)
            });
            arrBtnPrint.push(
                {export_type: "WORD", id: btnId},
            );

            if(!form.getField('custpage_scv_inlinehtml_word_libs')){
                let libWord = file.load({id: '../js/scv_js_export_word.js'}).url;
                let docxtemplater = file.load({id: '../olib/docxtemplater.min.js'}).url;
                let jquery = file.load({id: '../olib/jquery.min.js'}).url;
                let FileSaver = file.load({id: '../olib/FileSaver.min.js'}).url;
                let PizZipUtils = file.load({id: '../olib/pizzip-utils.js'}).url;
                let pizzip = file.load({id: '../olib/pizzip.js'}).url;
                form.addField({
                    id: 'custpage_scv_inlinehtml_word_libs', label: 'inlinehtml', type: 'inlinehtml',
                }).defaultValue = `
                    <script type="text/javascript" src="${libWord}"></script>
                    <script type="text/javascript" src="${docxtemplater}"></script>
                    <script type="text/javascript" src="${jquery}"></script>
                    <script type="text/javascript" src="${FileSaver}"></script>
                    <script type="text/javascript" src="${PizZipUtils}"></script>
                    <script type="text/javascript" src="${pizzip}"></script>
                `
            }
        }

        return { beforeLoad }

    });
