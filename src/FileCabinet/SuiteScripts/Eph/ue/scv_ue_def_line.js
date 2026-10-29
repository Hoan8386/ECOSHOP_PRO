/**
 * Nội dung:
 * + Mặc định dữ liệu ban đầu cho các line sublist record
 * ! Hiện tại chỉ sử dụng cho màn hình transaction
 * =======================================================================================
 *  Date                Author                  Description
 * 	07 Jan 2025         Huy Pham                Move code from Adv, Chức năng Original Line ID, from ms.Thắm (https://app.clickup.com/t/86cxjygw0)
 */
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/runtime',
    '../lib/scv_lib_def_line.js'],
    
    (runtime,
        libDefLine
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
            let newRec = scriptContext.newRecord;
            let recType = newRec.type;
            
            if(recType.indexOf("customrecord") == -1){
                libDefLine.resetOriLineNumTrans(scriptContext);
            }

            if (runtime.executionContext == runtime.ContextType.USER_INTERFACE){
                libDefLine.hideColumnLineNo(scriptContext);
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
            let newRec = scriptContext.newRecord;
            let recType = newRec.type;
            if(recType.indexOf("customrecord") == -1){
                libDefLine.setOriLineNumTrans(scriptContext);
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
            beforeLoad,
			beforeSubmit,
			//afterSubmit
        }

    });
