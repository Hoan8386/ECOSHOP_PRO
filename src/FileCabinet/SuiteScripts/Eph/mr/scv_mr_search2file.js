/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  21 Oct 2025         Huy Pham                Init & create file, Upload Saved Search to Folder, from mr.Đại(https://app.clickup.com/t/86d0j4gyz)
 */
/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define([
    'N/runtime', 'N/record',
    '../common/scv_common_search2file.js',
    '../cons/scv_cons_format.js',
],
    (
        runtime, record,
        commonSearch2File,
        constFormat,
    ) => {

        const getInputData = (inputContext) => {
            let curScript = runtime.getCurrentScript();

            let params = {};

            if(curScript.deploymentId == "customdeploy_scv_mr_search2file"){
                let paramsInput = curScript.getParameter({name : "custscript_scv_mr_search2file_params"});
                params = !!paramsInput ? JSON.parse(paramsInput) : {};
            }

            let arrResult = commonSearch2File.getDataRecordConfigUpload(params);

            arrResult.forEach(objConfig => {
                objConfig.params = {...params};
            });

            log.error("huy-getInputData-arrResult: " + arrResult.length, arrResult)
            return arrResult;
        }

        const map = (mapContext) => {
            let objRes = JSON.parse(mapContext.value);
            let params = objRes.params;
            try{
                if(!params.executeDate){
                    let today = new Date();
                    today.setDate(today.getDate() + 1);
                    params.executeDate = constFormat.formatDate(today);
                }
                
                commonSearch2File.processSearch2File(objRes.internalid, params.executeDate);
            }
            catch(err){
                log.error("ERROR: Try-Catch-map: DataInput", objRes)
                log.error("ERROR: Try-Catch-map", err);
            }
        }

        return {getInputData, map}

    }
);
