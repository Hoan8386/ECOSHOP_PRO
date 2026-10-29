/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define([
    '../common/scv_common_ima_salesprice.js',
],
    
    (
        commonImaSalesPrice,
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
            let triggerType = scriptContext.type;
            let newRec = scriptContext.newRecord;
            
            if(['create', 'edit'].includes(triggerType)) {
                beforeSubmit_CalcPriceBefTax(newRec);
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

        const beforeSubmit_CalcPriceBefTax = (newRec) => {
            if(['inventoryitem', 'assemblyitem'].includes(newRec.type)) {
                let tax_rate = newRec.getValue("custitem_scv_item_tax_rate") * 1;
                let sl = "recmachcustrecord_scv_ima_sa_price_item";
                let lc = newRec.getLineCount(sl);
                
                for(let i = 0; i < lc; i++) {
                    let price_af_tax = newRec.getSublistValue(sl, "custrecord_scv_price_af_tax", i);
                    let currency = newRec.getSublistValue(sl, "custrecord_scv_ima_sa_currency", i);

                    let price_bf_tax = commonImaSalesPrice.calcPriceBeforeTaxSalesPrice({
                        currency, price_af_tax, tax_rate
                    });
                    newRec.setSublistValue(sl, "custrecord_scv_ima_sa_price_bf_tax", i, price_bf_tax);
                }
            }
        }

        return {beforeSubmit}

    });
