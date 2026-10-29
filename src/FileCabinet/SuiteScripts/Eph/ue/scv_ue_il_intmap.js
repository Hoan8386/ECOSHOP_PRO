/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define([
    'N/ui/message',
],
    (message) => {
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
            const form = scriptContext.form;
            const newRec = scriptContext.newRecord;

            let rectype = newRec.getValue("custrecord_scv_il_intmap_rectype");
            let notes = getNotesByRecType(rectype);
            if(!!notes) {
                form.addPageInitMessage({
                    type: message.Type.WARNING,
                    message: notes,
                    duration: -1
                });
            }
        }

        const getNotesByRecType = (_rectype) => {
            let msgItemHierarchy = `This record <b>uses an alternate code instead of an ID</b> when synchronizing with IL, as all custom Item Hierarchy records are stored in a single table in IL.`;

            const notes = {
                "customrecord_scv_ima_pur_price": "Get the corresponding ID for records with <b>custrecord_scv_ima_pur_price_status = 'Approved'</b>",
                "customrecord_scv_ima_sa_price": "Get the corresponding ID for records with <b>custrecord_scv_ima_sale_price_status = 'Approved'</b>",
                "customrecord_boc_grpcode_item_list": msgItemHierarchy,
                "customrecord_boc_divcode_item_list": msgItemHierarchy,
                "customrecord_boc_deptcode_item_list": msgItemHierarchy,
                "customrecord_boc_catcode_item_list": msgItemHierarchy,
                "customrecord_boc_subcatcode_itm_list": msgItemHierarchy,
                "customrecord_boc_subclass_list": msgItemHierarchy,
                "customrecord_boc_subclass2_item_list": msgItemHierarchy,
            };

            return notes[_rectype];
        }

        return {beforeLoad}

    });
