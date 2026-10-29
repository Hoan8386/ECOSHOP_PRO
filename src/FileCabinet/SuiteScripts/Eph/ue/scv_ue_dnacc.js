/**
 * Nội dung: lưu ý phần này bị chuyển sang aftersubmit. nên script sẽ ưu tiên đưa lên chạy đầu tiên
 * =======================================================================================
 *  Date                Author                  Description
 *  09 Jan 2025         Huy Pham			    Init, create file. Document Number - Sequence Number From Mil, from ms.Diệu(https://app.clickup.com/t/86cxkwy6q)
 */
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['../lib/scv_lib_dnacc.js'],
function(ldn) {
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {
        if(scriptContext.type != 'copy') return;

        let newRec = scriptContext.newRecord;

        newRec.setValue("custbody_scv_doc_number", "")
    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(scriptContext) {
        
    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) {
        if(!["create", "edit", "copy"].includes(scriptContext.type)) return;

        try{
            /**
             * 1 số case ở payment sẽ không sinh chứng từ, nên việc update sẽ lỗi record không tồn tại
             */
            ldn.makeDocNumber(scriptContext.newRecord);//to-do
        }catch(err){
            log.error("ERROR: Try-Catch", err)
        }
        
    }

    return {
        beforeLoad,
        afterSubmit
    };
    
});
