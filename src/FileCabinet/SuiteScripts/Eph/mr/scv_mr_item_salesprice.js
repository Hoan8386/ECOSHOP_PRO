/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define([
    'N/format', 'N/record', 'N/runtime', 'N/search', 'N/file',
    '../lib/scv_lib_function.js',
    '../cons/scv_cons_appr_status.js',
    '../cons/scv_cons_ima_salesprice.js',
    '../cons/scv_cons_search_ima_salsesprice_apply.js',

    '../common/scv_common_ima.js',
],
    (
        format, record, runtime, search, file,
        lbf,
        constApprStatus,
        constImaSalesPrice,
        searchImaSalesPrice,

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
            ID: "customscript_scv_mr_item_salesprice",
            DEPLOY_NOTSCH: "customdeploy_scv_mr_item_salesprice",
            DEPLOY_SCH: "customdeploy_scv_mr_item_salesprice_sch",
            INPUT_PARAM: "custscript_scv_inpt_item_salesprice"
        };

        const getInputData = (inputContext) => {
            let currentScript = runtime.getCurrentScript();
            let arrUpdSaPirce = [];

            if(currentScript.deploymentId === "customdeploy_scv_mr_item_salesprice") {
                let objInput = currentScript.getParameter({
                    name: MapReduce.INPUT_PARAM
                });
                arrUpdSaPirce = handleDataInput(JSON.parse(objInput));
            } else if(currentScript.deploymentId === "customdeploy_scv_mr_item_salesprice_sch") {
                const arrImaSalesPrice = searchImaSalesPrice.getDataSource(search.createFilter({
                    name: "custrecord_scv_ima_sa_eff_date", 
                    operator: "on", 
                    values: commonIMA.getTodayByTimezone(format.Timezone.ASIA_MANILA)
                }));

                arrUpdSaPirce = arrImaSalesPrice.map(e => ({
                    ...e,
                    applied: "T",
                    approval_status: constApprStatus.Records.Approved.ID
                }));
            }

            let arrResult = handleDataItemSalesPrice(arrUpdSaPirce);
            return arrResult;
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
            // TODO: new version

            try {
                let arrSalesPrice = objData.arrSalesPrice;
                arrSalesPrice = arrSalesPrice.map(e => ({
                    ...e,
                    custrecord_scv_ima_sa_currency: e.currency,
                    custrecord_scv_price_list: e.price_level,
                    custrecord_scv_ima_sa_price_bf_tax: e.price_before_tax,
                }));

                let objValues = {
                    custrecord_scv_ima_sale_price_status: objData.approval_status
                };

                if(objData.approval_status == constApprStatus.Records.Rejected.ID) {
                    for(let objSalesPrice of arrSalesPrice) {
                        let objMapContext = {
                            id: objSalesPrice.internalid,
                            values: objValues
                        };
                        mapContext.write({
                            key: objMapContext.id.toString(),
                            value: JSON.stringify({ ...objMapContext })
                        });
                    }
                } else {
                    let arrExpire = [];
                    let arrApplied = arrSalesPrice.filter(e => e.applied === "T" || e.applied === true);
                    let arrUnApplied = arrSalesPrice.filter(e => e.applied === "F" || e.applied === false);

                    if(arrApplied.length > 0) {
                        let itemType = lbf.getItemRecordType(objData.itemId);
                        const itemRec = record.load({ type: itemType, id: objData.itemId, isDynamic: true });
                        commonIMA.updateItemSalesPrice(itemRec, arrApplied);
                        itemRec.save({enableSourcing: false, ignoreMandatoryFields: true});

                        let arrCurrency = groupDataByFieldId(arrApplied, "currency");
                        let arrPriceLevel = groupDataByFieldId(arrApplied, "price_level");
                        arrExpire = constImaSalesPrice.getDataCurApplyPrice(objData.itemId, arrCurrency, arrPriceLevel);
                    }

                    let arrResult = getDataUpdateItemSalesPrice(arrApplied, arrUnApplied, arrExpire, objValues, objData.itemId);

                    arrResult.forEach(obj => {
                        mapContext.write({
                            key: obj.id.toString(),
                            value: JSON.stringify({ ...obj })
                        });
                    });
                }
            } catch (err) {
                log.error("ERROR-Update Item Sales Price:", err.message);
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
            reduceContext.values.forEach(v => {
                const data = JSON.parse(v);
                commonIMA.updateIMASalesPrice(data.id, data.values);
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

        const getDataUpdateItemSalesPrice = (arrApplied, arrUnApplied, arrExpire, objValues, itemId) => {
            const arrResult = [];

            for(let objApplied of arrApplied) {
                let arrFilterExpire = arrExpire.filter(e => {
                    return e.custrecord_scv_ima_sa_price_item == itemId && 
                        e.custrecord_scv_ima_sa_currency == objApplied.custrecord_scv_ima_sa_currency &&
                        e.custrecord_scv_price_list == objApplied.custrecord_scv_price_list
                });

                arrResult.push({
                    id: objApplied.internalid,
                    values: {
                        ...objValues,
                        custrecord_scv_ima_sa_applied: true
                    }
                });

                for(let objExpire of arrFilterExpire) {
                    arrResult.push({
                        id: objExpire.id,
                        values: {
                            custrecord_scv_ima_sa_applied: false
                        }
                    });
                }
            }

            for(let objUnApplied of arrUnApplied) {
                arrResult.push({
                    id: objUnApplied.internalid,
                    values: objValues
                });
            }

            return arrResult;
        }

        const handleDataItemSalesPrice = (arrUpdSaPirce) => {
            if(arrUpdSaPirce.length === 0) return [];

            let arrItem = groupDataByFieldId(arrUpdSaPirce, "item");

            let arrResult = [];
            for(let itemId of arrItem) {
                let arrSalesPrice = arrUpdSaPirce.filter(e => e.item == itemId);
                arrResult.push({
                    itemId,
                    approval_status: arrSalesPrice[0].approval_status,
                    arrSalesPrice
                });
            }
            return arrResult;
        }

        const groupDataByFieldId = (data, field) => {
            let objGroup = {};
            for(let i = 0; i < data.length; i++) {
                let fieldValue = data[i][field];
                if(objGroup[fieldValue] === undefined && !!fieldValue) {
                    objGroup[fieldValue] = fieldValue;
                }
            }
            return Object.values(objGroup);
        }

        return {getInputData, map, reduce}

    });
