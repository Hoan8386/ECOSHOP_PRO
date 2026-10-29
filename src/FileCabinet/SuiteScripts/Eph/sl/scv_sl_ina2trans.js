/**
 * Nội dung:
 * Key:
 * =======================================================================================
 *  Date                Author                  Description
 *  10 Apr 2026         Khanh Tran              Init, create file.
 *  10 Apr 2026         Khanh Tran              Chức năng tự động tạo Invoice và Journal Có Nguồn từ Inventory Adjustment, from mr.Đại(https://app.clickup.com/t/86d2cz2g2)
 */
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(["N/runtime", "N/redirect",
    
    "../cons/scv_cons_form.js",

    "../common/scv_common_invadj.js",
],
    
    (runtime, redirect,

        constForm,

        cmInvAdj,
    ) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */

        const onRequest = (scriptContext) => {
            constForm.setContext(scriptContext);
            constForm.setServiceScript(cmInvAdj.SuiteletInvAdj2Trans.ID, cmInvAdj.SuiteletInvAdj2Trans.DEPLOYID_DATA);

            let request = scriptContext.request;
            let params = request.parameters;log.error('params', params);
            let curScript = runtime.getCurrentScript();

            if (curScript.deploymentId == cmInvAdj.SuiteletInvAdj2Trans.DEPLOYID_DATA) {
                let objResponse = { data: [] };

                switch (params.action) {
                    case "ina2inv":
                        let objINV = ina2inv(params);
                        
                        redirect.toRecord({
                            type: params.rectype, id: params.recid, parameters: {
                                action: params.action,
                                success: objINV.success,
                                msg: encodeURIComponent(objINV.msg),
                            }
                        });

                        break;

                    case "inv2jrl":
                        let objJRL = inv2jrl(params);
                        
                        redirect.toRecord({
                            type: params.rectype, id: params.recid, parameters: {
                                action: params.action,
                                success: objJRL.success,
                                msg: encodeURIComponent(objJRL.msg),
                            }
                        });

                        break;
                }

                constForm.write(objResponse);
            } else {
                if (request.method == "GET") {

                }
            }
        };

        const ina2inv = (params) =>{
            let objData = { success: true, msg: "Success" };

            try {
                let inaId = params.recid;
                cmInvAdj.createInvoice(inaId);
            }
            catch(err) {
                log.error("ERROR-createInvoice", err);

                objData.success = false;
                objData.msg = err.message;
            }

            return objData;
        }

        const inv2jrl = (params) =>{
            let objData = { success: true, msg: "Success" };

            try {
                let invId = params.recid;
                cmInvAdj.inv2jrl(invId);
            }
            catch(err) {
                log.error("ERROR-inv2jrl", err);

                objData.success = false;
                objData.msg = err.message;
            }

            return objData;
        }

        return {onRequest}

    });
