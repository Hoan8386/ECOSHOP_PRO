/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define([
    'N/record', 'N/runtime',
    '../common/scv_common_unitstype.js',
],
    (
        record, runtime,
        commonUnitsType,
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
            let form = scriptContext.form;
            let newRecord = scriptContext.newRecord;
            let tgType = scriptContext.type;

            if(["view", "edit"].includes(tgType)) {
                let arrContext = [
                    runtime.ContextType.USER_INTERFACE, runtime.ContextType.RESTLET, 
                    runtime.ContextType.SCHEDULED, runtime.ContextType.USEREVENT,
                ];
                if(arrContext.includes(runtime.executionContext)) {
                    commonUnitsType.addILExternalSourceFields(form, newRecord, tgType);
                }
            }
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
            // afterSubmit_SyncDataToIL(scriptContext);
        }

        const afterSubmit_SyncDataToIL = (scriptContext) => {
            // ko dc chay o action nay
            if (runtime.executionContext == runtime.ContextType.RESTLET) return;

            let tgType = scriptContext.type;
            if(!["create", "edit"].includes(tgType)) return;

            let newRecord = scriptContext.newRecord;
            let oldRecord = scriptContext.oldRecord;

            // TODO: load lai record moi lay dc internal id cua line dc tao moi
            let unitsTypeRec = record.load({
                type: newRecord.type, id: newRecord.id,
                isDynamic: true
            });

            try {
                commonUnitsType.autoSyncUnitsTypeToIL(unitsTypeRec);
                commonUnitsType.autoSyncUnitsTypeUOMToIL(unitsTypeRec, tgType, oldRecord);
            } catch(err) {
                log.error("Auto Sync units type to IL error: ", err);
            }
        }

        return {beforeLoad, afterSubmit}
    });
