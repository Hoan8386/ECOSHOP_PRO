/**
 * Nội dung: 
 * Key word: 
 * =======================================================================================
 *  Date                Author                  Description
 *  22 May 2025         Khanh Tran              Init, create file. Close 'Purchase Order', 'Intercompany Transfer Order' from mr.Quân(https://app.clickup.com/t/86cz0w7qh)
 */
/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope Public
 */
define(['N/https',
    '../lib/scv_lib_cs.js'
], 
    function (https,
        libCs,
    ) {

        const cur_script = {
            ID: 'customscript_scv_sl_close_order',
            DEPLOYID_UI: 'customdeploy_scv_sl_close_order',
            DEPLOYID_DATA: 'customdeploy_scv_sl_close_order_data'
        }

        function pageInit(scriptContext) {
           
        }

        function saveRecord(scriptContext) {
            window.onbeforeunload = null;
            let curRec = scriptContext.currentRecord;
            let isValid = libCs.validateFieldMandatory(curRec, ['custpage_closed_reason']);
            if(!isValid) return;

            libCs.showLoadingDialog(true);
            setTimeout(() => {
                try {
                    let params = libCs.getObjParamsUrl(curRec);
                    https.post({
                        url: "/app/site/hosting/scriptlet.nl?script=" + cur_script.ID + "&deploy=" + cur_script.DEPLOYID_DATA, 
                        body: {
                            action: 'closeorder', requestData: JSON.stringify({
                                recid: params.recid,
                                rectype: params.rectype,
                                closedReason: curRec.getValue('custpage_closed_reason'),
                            })
                        }
                    })

                    libCs.showLoadingDialog(false); 
                    window.parent.location.reload();
                } catch (error) {
                    libCs.showLoadingDialog(false);
                    alert(error.message);
                }
            }, 0);
            
        }
        return {
            pageInit,
            saveRecord,
        };
    
    });
    