/**
 * =======================================================================================
 *  Date                Author                  Description
 *  05 Mar 2026         Khanh Trần              Init & create file. Chặn tạo hoặc edit trùng Item Code & Cluster của Item Cluster Setup from mr.Quân(https://app.clickup.com/t/86d23h5yh)
 */
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/error', 'N/query',
],
    
    (error, query,
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
            let newRec = scriptContext.newRecord;
            if(["create", "edit"].includes(scriptContext.type)){
                if(isDuplicate(newRec)){
                    throw error.create({
                        name: 'DUPLICATE_ITEM_CLUSTER',
                        message: 'Duplicate Item Code and Cluster, please enter different Item Code and Cluster.',
                        notifyOff: false
                    });
                }
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

        const isDuplicate = (newRec) => {
            if (newRec.getValue('isinactive')) return;

            let boc_ics_item = newRec.getValue('custrecord_boc_ics_item');
            let boc_ics_cluster = newRec.getValue('custrecord_boc_ics_cluster');
            let recId = newRec.id || 0;
            let resultSQL = query.runSuiteQL({
                query: `
                    SELECT id
                    FROM customrecord_boc_item_cluster
                    WHERE custrecord_boc_ics_item = ?
                    AND custrecord_boc_ics_cluster = ?
                    AND isinactive = 'F'
                    AND id <> ?
                    FETCH FIRST 1 ROWS ONLY
                `,
                params: [boc_ics_item, boc_ics_cluster, recId]
            });
            resultSQL = resultSQL.asMappedResults();
            
            return resultSQL.length > 0
        }

        return {
            // beforeLoad,
            beforeSubmit,
            // afterSubmit
        }

    });
