/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define([
    'N/format', 'N/runtime', 'N/search', 'N/record', 'N/file',
    '../cons/scv_cons_appr_status.js',
    '../cons/scv_cons_ima_purprice.js',
    '../cons/scv_cons_search_ima_purprice_apply.js',

    '../common/scv_common_ima.js',
],
    (
        format, runtime, search, record, file,
        constApprStatus,
        constImaPurPrice,
        searchImaPurPrice,

        commonIMA
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
            ID: "customscript_scv_mr_itempurprice",
            DEPLOY_NOTSCH: "customdeploy_scv_mr_itempurprice",
            DEPLOY_SCH: "customdeploy_scv_mr_itempurprice_sche",
            INPUT_PARAM: "custscript_scv_inpt_item_purprice"
        };

        const getInputData = (inputContext) => {
            let currentScript = runtime.getCurrentScript();

            let arrUpdPurPrice = [];
            if(currentScript.deploymentId === "customdeploy_scv_mr_itempurprice") {
                let objInput = currentScript.getParameter({
                    name: MapReduce.INPUT_PARAM
                });
                arrUpdPurPrice = handleDataInput(JSON.parse(objInput));

            } else if(currentScript.deploymentId === "customdeploy_scv_mr_itempurprice_sche") {
                const arrImaPurPrice = searchImaPurPrice.getDataSource(search.createFilter({
                    name: "custrecord_scv_ima_pur_price_eff_date", 
                    operator: "on", 
                    values: commonIMA.getTodayByTimezone(format.Timezone.ASIA_MANILA)
                }));

                arrUpdPurPrice = arrImaPurPrice.map(e => ({
                    internalid: e.internalid,
                    applied: "T",
                    approval_status: constApprStatus.Records.Approved.ID
                }))
            }

            return arrUpdPurPrice;
        }

        const handleDataInput = (objInput) => {
            let data = objInput.data || [];
            let files = objInput.files || [];

            const arrResult = [];
            if(files.length > 0) {
                for(let i = 0; i < files.length; i++) {
                    const objFileJson = file.load({id: files[i]});
                    let contents = objFileJson.getContents();

                    data = data.concat(JSON.parse(contents));
                }
            }

            for(let i = 0; i < data.length; i++) {
                arrResult.push({
                    approval_status: objInput.approval_status,
                    ...data[i]
                });
            }

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

            try {
                const imaPurPriceRec = record.load({type: "customrecord_scv_ima_pur_price", id: objData.internalid});
                let location = imaPurPriceRec.getValue("custrecord_scv_ima_pur_price_loc");
                let vendor = imaPurPriceRec.getValue("custrecord_scv_pur_price_vendor");
                let currency = imaPurPriceRec.getValue("custrecord_scv_ima_pur_currency");
                let item = imaPurPriceRec.getValue("custrecord_scv_ima_pur_price_item");
                let unit = imaPurPriceRec.getValue("custrecord_scv_pur_price_unit");

                let objValues = {
                    custrecord_scv_ima_pur_price_status: objData.approval_status
                };

                if(objData.approval_status == constApprStatus.Records.Rejected.ID) {
                    commonIMA.updateIMAPurchasePrice(objData.internalid, objValues);
                } else {
                    let arrExpire = [];

                    if(objData.applied === "T" || objData.applied === true) {
                        objValues.custrecord_scv_ima_pur_price_app_price = true;

                        arrExpire = constImaPurPrice.getDataCurApplyPrice({
                            location, vendor, currency,
                            item, unit
                        });
                    }

                    commonIMA.updateIMAPurchasePrice(objData.internalid, objValues);
                    if(arrExpire.length > 0) {
                        arrExpire.forEach(obj => {
                            mapContext.write({
                                key: obj.id.toString(),
                                value: obj.id
                            });
                        });
                    }
                }
            } catch (err) {
                log.error("ERROR-Update Item Purchase Price: " + objData.internalid, err.message);
            }
        }

        /**
         * Defines the function that is executed when the reduce entry point is triggered. This entry point is triggered
         * automatically when the associated map stage is complete. This function is applied to each group in the provided context.
         * @param {Object} reduceContext - Data collection containing the groups to process in the reduce stage. This parameter is
         *     provided automatically based on the results of the map stage.
         * @param {Iterator} reduceContext.errors - Serialized errors that were thrown during previous attempts to execute the
         *     reduce function on the current group
         * @param {number} reduceContext.executionNo - Number of times the reduce function has been executed on the current group
         * @param {boolean} reduceContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} reduceContext.key - Key to be processed during the reduce stage
         * @param {List<String>} reduceContext.values - All values associated with a unique key that was passed to the reduce stage
         *     for processing
         * @since 2015.2
         */
        const reduce = (reduceContext) => {
            const id = reduceContext.key;

            // log.error("unapplied ima purchase price", id);
            commonIMA.updateIMAPurchasePrice(id, {
                custrecord_scv_ima_pur_price_app_price: false
            });
        }


        /**
         * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
         * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
         * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
         * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
         *     script
         * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
         * @param {boolean} summaryContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Iterator} summaryContext.output - Serialized keys and values that were saved as output during the reduce stage
         * @param {number} summaryContext.seconds - Total seconds elapsed when running the map/reduce script
         * @param {number} summaryContext.usage - Total number of governance usage units consumed when running the map/reduce
         *     script
         * @param {number} summaryContext.yields - Total number of yields when running the map/reduce script
         * @param {Object} summaryContext.inputSummary - Statistics about the input stage
         * @param {Object} summaryContext.mapSummary - Statistics about the map stage
         * @param {Object} summaryContext.reduceSummary - Statistics about the reduce stage
         * @since 2015.2
         */
        const summarize = (summaryContext) => {

        }

        return {getInputData, map, reduce}

    });
