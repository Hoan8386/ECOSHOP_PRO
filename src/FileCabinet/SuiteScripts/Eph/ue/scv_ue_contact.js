/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  25 Feb 2025         Khanh Tran              Init & create file. Update to Vendor from mr.Bính(https://app.clickup.com/t/86cy2tfde)
 */
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define([
    '../cons/scv_cons_contact.js'
],(
    constContact
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
            let curRec = scriptContext.newRecord;
            if(['edit', 'create'].includes(triggerType)){
                constContact.addContactEmailToVendor(curRec);
            }
            
        }

        return {
            // beforeLoad, 
            // beforeSubmit, 
            afterSubmit
        }

    });
