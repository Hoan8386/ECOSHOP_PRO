/**
 * Nội dung:
 * Key:
 * =======================================================================================
 *  Date                Author                  Description
 *  04 Apr 2026         Khanh Tran              Init, create file. Nút Create Invoice tại Inventory Adjustment, from mr.Đại(https://app.clickup.com/t/86d2cz2g2)
 *  04 Apr 2026         Khanh Tran              Nút Create Journal tại Invoice, from mr.Đại(https://app.clickup.com/t/86d2cz2g2)
 */
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define([
    '../common/scv_common_invadj.js'
],
    
    (cmInvAdj) => {
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
            cmInvAdj.addBtnCreateInvoice(scriptContext);
            cmInvAdj.showResultINA2INV(scriptContext);

            cmInvAdj.addBtnCreateJournal(scriptContext);
            cmInvAdj.showResultINV2JRL(scriptContext);
        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {

        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {
            let triggerType = scriptContext.type;
            let newRec = scriptContext.newRecord;

            if (triggerType == "create") {

                try {//Phần này try-catch để không ảnh hưởng API
                    if (newRec.type === "inventoryadjustment") {
                        let invId = cmInvAdj.createInvoice(newRec.id);
                        cmInvAdj.inv2jrl(invId);
                    }
                    else if (newRec.type === "invoice") {
                        cmInvAdj.inv2jrl(newRec.id);
                    }
                } catch (error) {
                    log.error("afterSubmit", {
                        type: newRec.type,
                        id: newRec.id,
                        error
                    })
                }

            }
        }

        return {
            beforeLoad,
            // beforeSubmit,
            afterSubmit
        }

    });
