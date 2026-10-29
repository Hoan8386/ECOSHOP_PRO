/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define([
    'N/search', 'N/record',
    '../cons/scv_cons_format.js',
    '../cons/scv_cons_search_recieve_date_it_lo.js',
    '../cons/scv_cons_search_sale_date_it_lo.js',
    '../cons/scv_cons_search_item_loc_1st_rec_sal_d.js',
    '../cons/scv_cons_search_1st_purchase_date_it_lo.js'
],
    (
        search, record,
        constFormat,
        searchReceiveDate,
        searchSalesDate,
        searchItemLocation,
        searchPurchaseDate
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

        const getInputData = (inputContext) => {
            // ! ERROR 
            return [];
            let searchResult = runFilterSS();

            // log.error("search-info", searchResult);
            return searchResult;
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
            try {
                let objData = mapContext.value;
                objData = JSON.parse(objData);

                let ilcRec = record.load({ type: "itemlocationconfiguration", id: objData.internalid });

                if(!!objData.receved_date) {
                    ilcRec.setValue("custrecord_scv_1st_receved_date", constFormat.parseDate(objData.receved_date));
                }
                if(!!objData.sales_date) {
                    ilcRec.setValue("custrecord_scv_1st_sales_date", constFormat.parseDate(objData.sales_date));
                }
                if(!!objData.purchase_date) {
                    ilcRec.setValue("custrecord_scv_1st_purchase_date", constFormat.parseDate(objData.purchase_date));
                }

                let ilcId = ilcRec.save({enableSourcing: false, ignoreMandatoryFields: true});
            } catch(err) {
                log.error("ERR", err.message);
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

        const runFilterSS = () => {
            let arrReceiveDate = searchReceiveDate.getDataSource();
            let arrSalesDate = searchSalesDate.getDataSource();
            let arrPurchaseDate = searchPurchaseDate.getDataSource();
            // let arrItemLoc = searchItemLocation.getDataSource(search.createFilter({
            //     name: 'internalid', operator: "anyof", values: "2382511"
            // }));
            let arrItemLoc = searchItemLocation.getDataSource();
            let arrResult = [];
            for(let objItemLoc of arrItemLoc) {
                let objReceiveDate = arrReceiveDate.find(e => e.location_id == objItemLoc.location_id && e.item_id == objItemLoc.item_id) || {};
                let objSalesDate = arrSalesDate.find(e => e.location_id == objItemLoc.location_id && e.item_id == objItemLoc.item_id) || {};
                let objPurchaseDate = arrPurchaseDate.find(e => e.location_id == objItemLoc.location_id && e.item_id == objItemLoc.item_id) || {};
                
                let isUpdate = false;
                if(!!objReceiveDate.trandate) {
                    isUpdate = true;
                    objItemLoc.receved_date = objReceiveDate.trandate;
                }
                if(!!objSalesDate.trandate) {
                    isUpdate = true;
                    objItemLoc.sales_date = objSalesDate.trandate;
                }
                if(!!objPurchaseDate.trandate) {
                    isUpdate = true;
                    objItemLoc.purchase_date = objPurchaseDate.trandate;
                }
                if(!!isUpdate) {
                    arrResult.push(objItemLoc);
                }
            }

            log.error("getDataInput_TotalRecords_Updated: ", arrResult.length);
            return arrResult;
        }

        return {getInputData, map}

    });
