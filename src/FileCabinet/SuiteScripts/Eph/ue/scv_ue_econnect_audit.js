/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define([
    'N/file'
],
    (
        file
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
            // beforeLoad_CustomView(scriptContext);
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

        }

        const beforeLoad_CustomView = (scriptContext) => {
            const tgType = scriptContext.type;
            if(tgType !== "view") return;

            const form = scriptContext.form;
            const newRecord = scriptContext.newRecord;
            let resBody = newRecord.getValue("custrecord_scv_eco_audit_reqbody");

            if(!!resBody) {
                let htmlField = form.addField({
                    id: 'custpage_view_json_file',
                    label: 'Hidden',
                    type: "inlinehtml"
                }).defaultValue = `<script>
                    let rectype = '${newRecord.type}';
                    let recid = '${newRecord.id}';
                    ${file.load({id: '../js/scv_js_econnect_audit.js'}).getContents()}
                </script>`;
            }
        }

        return {beforeLoad}

    });
