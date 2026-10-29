/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define([
    '../common/scv_common_current_user.js',
    '../common/scv_common_purchord.js',
],
    (
        commCurUser,
        commonPurchOrd,
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
            let tgType = scriptContext.type;
            let newRec = scriptContext.newRecord;

            if(["create", "edit"].includes(tgType)) {
                beforeSubmit_SetExpiredDate(newRec);
                commCurUser.setCurrentUserEdit(newRec);
                
                commonPurchOrd.beforeSubmit_DefaultRateForFOC(newRec);
                commonPurchOrd.beforeSubmit_CalcRateImaPurPrice(scriptContext);
            }
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

        }

        const beforeSubmit_SetExpiredDate = (newRecord) => {
            let sl = "item";
            let totalLine = newRecord.getLineCount(sl);

            let arrExpReceiptDate = [];
            for(let i = 0; i < totalLine; i++) {
                let expectedreceiptdate = newRecord.getSublistValue(sl, "expectedreceiptdate", i);
                if(!!expectedreceiptdate) {
                    arrExpReceiptDate.push(expectedreceiptdate);
                }
            }

            if(arrExpReceiptDate.length > 0) {
                let expiredDate = new Date(Math.max(...arrExpReceiptDate));
                expiredDate.setDate(expiredDate.getDate() + 3);

                newRecord.setValue("custbody_scv_expired_date", expiredDate);
            }
        }

        return {beforeSubmit}

    });
