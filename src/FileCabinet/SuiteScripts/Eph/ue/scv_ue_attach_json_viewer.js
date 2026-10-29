/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define([
    'N/runtime',
    '../cons/scv_cons_init_record.js',
],
    (
        runtime,
        constInitRecord,
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

        const FIELD_PREFIX = ['custrecord_scv_'];
        const TARGET_FIELD_TYPES = ['textarea', 'longtext'];
        const EXCLUDED_FIELDS = {
            
        };
        const INCLUDED_FIELDS = {
            customrecord_scv_itg_econnect_audit: ['custrecord_scv_eco_audit_saveexterr'],
        };
        
        const beforeLoad = (scriptContext) => {
            if(['view'].includes(scriptContext.type)) {
                beforeLoad_AttachJSONViewer(scriptContext);
            }
        }

        const beforeLoad_AttachJSONViewer = (scriptContext) => {
            if (![runtime.ContextType.USER_INTERFACE].includes(runtime.executionContext)) return;

            const newRec = scriptContext.newRecord;
            const form = scriptContext.form;
            
            const fields = getDataFieldsAttachViewer(newRec);
            if(fields.length === 0) return;

            const arrScript = ["scv_rec_attach_viewer.js"];

            const options = {
                rectype: newRec.type,
                recid: newRec.id,
                fields: fields
            };
            
            constInitRecord.injectCustomScripts(form, arrScript);
            form.addField({
                id: 'custpage_attach_view_json',
                label: 'Attach Viewer Json',
                type: "inlinehtml"
            }).defaultValue = `<script>
                scvAttachViewer.attachToRecord(${JSON.stringify(options)});
            </script>`;
        }

        const getDataFieldsAttachViewer = (newRec) => {
            const included = INCLUDED_FIELDS[newRec.type] || [];
            const excluded = EXCLUDED_FIELDS[newRec.type] || [];

            const fields = newRec.getFields().filter(hasPrefix);
            included.forEach(id => {
                if (!fields.includes(id)) fields.push(id);
            });

            // log.error("fields", fields);
            const arrResult = [];

            for (const id of fields) {
                if (excluded.includes(id)) continue;

                const objField = newRec.getField({ fieldId: id });
                if (!objField) continue;

                // field nằm trong INCLUDED_FIELDS thì bỏ qua kiểm tra type
                const isIncluded = included.includes(id);
                if (!isIncluded && !TARGET_FIELD_TYPES.includes(objField.type)) continue;

                const value = newRec.getValue({ fieldId: id });
                if (value && String(value).trim()) arrResult.push(id);
            }

            return arrResult;
        };

        const hasPrefix = (id) => FIELD_PREFIX.some(p => id.startsWith(p));

        return {beforeLoad}
    });
