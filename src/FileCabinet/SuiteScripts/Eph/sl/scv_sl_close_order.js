/**
 * Nội dung: 
 * Key word: 
 * =======================================================================================
 *  Date                Author                  Description
 *  22 May 2025         Khanh Tran              Init, create file. Close 'Purchase Order', 'Intercompany Transfer Order' from mr.Quân(https://app.clickup.com/t/86cz0w7qh)
 *  04 Jun 2025         Khanh Tran              Init, create file. Auto Closed PO khi ngày hiện tại vượt quá Expried Date from mr.Quân(https://app.clickup.com/t/86cz5pejv)
 */
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/runtime', 'N/record', 'N/ui/serverWidget'],
    
    (runtime, record, serverWidget) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */

        const cur_script = {
            ID: 'customscript_scv_sl_close_order',
            DEPLOYID_UI: 'customdeploy_scv_sl_close_order',
            DEPLOYID_DATA: 'customdeploy_scv_sl_close_order_data'
        }

        const onRequest = (scriptContext) => {
            let response = scriptContext.response;
            let request = scriptContext.request;
            let params = request.parameters;
            let curScript = runtime.getCurrentScript();
            if(curScript.deploymentId == cur_script.DEPLOYID_DATA){
                let objResponse = {data: [], isSuccess: true, message: ''};
                if(params.action == 'closeorder'){
                    objResponse.data = closeOrder(JSON.parse(params.requestData));
                }
                
                response.setHeader({name: 'Content-Type', value: 'application/json'});
                response.write(JSON.stringify(objResponse));
            }else{
                if(scriptContext.request.method == 'GET'){
                    let mainForm = onCreateFormUI(params);
                    scriptContext.response.writePage(mainForm.form);
                }
            }
        }

        const closeOrder = (params) => {//từ mr k bắt đc lỗi cần thêm try catch ở đây
            try {
                const MAX_CLOSE_PER_RUN = 1000;
                let closedCount = 0;

                let curRec = record.load({
                    type: params.rectype,
                    id: params.recid,
                    isDynamic: true
                });

                let lc = curRec.getLineCount({ sublistId: "item" });

                if (params.closedReason) {
                    curRec.setValue({
                        fieldId: 'custbody_scv_reason_close', value: params.closedReason
                    });
                }

                for (let i = 0; i < lc; i++) {
                    if (closedCount >= MAX_CLOSE_PER_RUN) {
                        break;
                    }

                    let isClosed = curRec.getSublistValue({
                        sublistId: 'item', fieldId: 'isclosed', line: i
                    });
                    
                    if (!isClosed) {
                        curRec.selectLine({
                            sublistId: 'item', line: i
                        });

                        curRec.setCurrentSublistValue({
                            sublistId: 'item', fieldId: 'isclosed', value: true
                        });

                        curRec.commitLine({ sublistId: 'item' });

                        closedCount++;
                    }
                }

                if (closedCount > 0) {
                    curRec.save({
                        enableSourcing: false,
                        ignoreMandatoryFields: true
                    });
                }

                log.error('closeOrder', {
                    recid: params.recid, closedCount: closedCount, totalLine: lc
                });
                

            } catch (error) {
                log.error('closeOrder-error', {
                    recid: params.recid, error: error
                });

                return false;
            }
        };

        const onCreateFormUI = (params) => {
            let form = serverWidget.createForm({title: `${params.tranid}`});
            form.clientScriptModulePath = '../cs/scv_cs_sl_close_order.js';
            form.addSubmitButton({label: 'Submit'});
            let custpage_closed_reason = form.addField({
                id: 'custpage_closed_reason',
                type: 'text',
                label: 'Enter the reason why you close'
            }) .setHelpText('Enter the reason why you close');
            custpage_closed_reason.isMandatory = true;

            return {
                form
            }
        }

        return {
            onRequest,
            closeOrder
        }

    });
