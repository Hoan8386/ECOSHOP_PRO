/**
 * Nội dung: 
 * Key word: 
 * =======================================================================================
 *  Date                Author                  Description
 *  10 Aug 2026         Phu Pham                Init, create file. thêm chức năng chặn tạo trùng data item gism.
 */
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define([
    '../common/scv_common_item_gism.js',
],
    (
        commonItemGISM,
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
            const curRec = scriptContext.newRecord;
            if(['create', 'edit'].includes(scriptContext.type)) {
                // check theo điều kiện create và edit bởi vì item gism ban đầu được tạo từ IMA và item related = null
                commonItemGISM.beforeSubmit_WarnDuplicateRecord(curRec);
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

        return { beforeSubmit }

    });
