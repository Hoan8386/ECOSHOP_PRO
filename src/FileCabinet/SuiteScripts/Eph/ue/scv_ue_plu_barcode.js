/**
 * =======================================================================================
 *  Date                Author                  Description
 *  18 Jul 2025         Khanh Tran              Init & create file. Kiểm tra không tạo record khi trùng name from mr.Quân(https://app.clickup.com/t/86cyr4tc8)
 */
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/error',
    '../cons/scv_cons_plu_barcode.js'
],
    
    (error,
        constPluBarcode
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
            if(['edit', 'create'].includes(scriptContext.type)){
                constPluBarcode.updateInactiveName(newRec);

                if(constPluBarcode.isDuplicate(newRec)){
                    
                    throw error.create({
                        name: 'DUPLICATE',
                        message: constPluBarcode.MESSAGE_DUPLICATE,
                        notifyOff: true
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

        return {
            // beforeLoad, 
            beforeSubmit, 
            // afterSubmit
        }

    });
