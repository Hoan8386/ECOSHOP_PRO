/**
 * Nội dung:
 * Key word:
 * =======================================================================================
 *  Date                Author                  Description
 *  18 Mar 2026         Phu Pham                Init, create file
 */
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/url', '../cons/scv_cons_eco_config.js'],
    
    (url, constEcoCfg) => {
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
			let trigger_type = scriptContext.type;
			let curRec = scriptContext.newRecord;
            let form = scriptContext.form;

			if(trigger_type == "view") {
                constEcoCfg.addBtnGetAccessToken(form, curRec);
                constEcoCfg.addInlineHtmlHiddenPassword(form, true);
			}
            if(["edit", "create", "copy"].includes(trigger_type)) {
                constEcoCfg.addInlineHtmlHiddenPassword(form);
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
            constEcoCfg.beforeSubmit_HandlePassWord(scriptContext);
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
            beforeLoad,
			beforeSubmit,
			//afterSubmit
        }

    });
