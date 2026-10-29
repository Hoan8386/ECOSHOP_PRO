/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define([
    'N/runtime',
    '../common/scv_common_itg_econnect.js',
],
    (
        runtime,
        commonItgEco,
    ) => {
        /**
         * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
         * @param {Object} inputContext
         * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Object} inputContext.ObjectRef - Object that references the input data
         * @typedef {Object} ObjectRef
         * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
         * @property {string} ObjectRef.type - Type of the record instance that contains the input data
         * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
         * @since 2015.2
         */

        const MapReduce = {
            ID: "customscript_scv_mr_econnect_service_v2",
            DEPLOYMENT: "customdeploy_scv_mr_econnect_service_v2",
            INPUT_PARAM: "custscript_scv_inpt_eco_service_v2"
        };

        const getInputData = (inputContext) => {
            let currentScript = runtime.getCurrentScript();
            let inputParam = currentScript.getParameter({
                name: MapReduce.INPUT_PARAM
            });
            inputParam = JSON.parse(inputParam);

            let arrResult = inputParam.arrSublist.map(e => ({
                ...e,
                objIlIntMap: inputParam.objIlIntMap
            }));
            return arrResult;
        }

        /**
         * Defines the function that is executed when the map entry point is triggered. This entry point is triggered automatically
         * when the associated getInputData stage is complete. This function is applied to each key-value pair in the provided
         * context.
         * @param {Object} mapContext - Data collection containing the key-value pairs to process in the map stage. This parameter
         *     is provided automatically based on the results of the getInputData stage.
         * @param {Iterator} mapContext.errors - Serialized errors that were thrown during previous attempts to execute the map
         *     function on the current key-value pair
         * @param {number} mapContext.executionNo - Number of times the map function has been executed on the current key-value
         *     pair
         * @param {boolean} mapContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} mapContext.key - Key to be processed during the map stage
         * @param {string} mapContext.value - Value to be processed during the map stage
         * @since 2015.2
         */

        const map = (mapContext) => {
            let objData = mapContext.value;
            objData = JSON.parse(objData);

            let {id, issync, jsondata, objIlIntMap} = objData;

            try {
                let auditId = commonItgEco.syncDataToILByRecType({ objIlIntMap, objRecData: jsondata });
                // log.error("auditId", auditId);
            } catch (err) {
                log.error("ERROR MR Econnect Service - V2", err);
            }
        }

        return {getInputData, map}

    });
