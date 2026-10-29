/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define([
    'N/runtime', 'N/record', 'N/file',
    '../cons/scv_cons_appr_status.js',
    '../cons/scv_cons_plu_barcode.js',
    '../cons/scv_cons_item_gism.js',
    '../common/scv_common_ima.js',
],
    (
        runtime, record, file,
        constApprStatus,
        constPLUBarCode,
        constItemGISM,
        commonIMA,
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
            ID: "customscript_scv_mr_mass_approval_ima",
            DEPLOYID: "customdeploy_scv_mr_mass_approval_ima",
            INPUT_PARAM: "custscript_scv_mass_approval_ima"
        };

        const getInputData = (inputContext) => {
            let currentScript = runtime.getCurrentScript();
            let objInput = currentScript.getParameter({
                name: MapReduce.INPUT_PARAM
            });

            const arrResult = handleDataInput(JSON.parse(objInput));
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
                    rectype: objInput.rectype,
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
            let objResult = mapContext.value;
            objResult = JSON.parse(objResult);

            try {
                if(objResult.approval_status == constApprStatus.Records.Rejected.ID) {
                    commonIMA.rejectApprovalItem(objResult.internalid);
                } else {
                    // TODO: IMA new version
                    const imaRec = record.load({ 
                        type: 'customrecord_scv_item_ma', id: objResult.internalid, 
                        isDynamic: true 
                    });

                    let saleunit = imaRec.getValue("custrecord_scv_ima_saleunit");
                    let isCreateILC = imaRec.getValue("custrecord_scv_ima_cre_item_conf");
                    let related_item = imaRec.getValue("custrecord_scv_ima_rel_item");
                    let objItemType = commonIMA.getDataItemType(imaRec.getValue("custrecord_scv_ima_item_type"));

                    let objData = {
                        item_type: commonIMA.getItemRecordType(objItemType),
                        rel_ima: objResult.internalid,
                        effective_date: commonIMA.getTodayByTimezone()
                    };

                    let arrDefLoc = [], arrPLUBarCode = [], arrItemGISM = [];
                    // TODO: sales price
                    let arrSalesPrice = [];
                    if([record.Type.INVENTORY_ITEM, record.Type.ASSEMBLY_ITEM, record.Type.NON_INVENTORY_ITEM].includes(objData.item_type)) {
                        arrSalesPrice = commonIMA.getDataUpdItemSalesPrice(objData);
                    }

                    // TODO: submit approval
                    let itemId = (related_item || null);
                    if(!related_item) {
                        itemId = commonIMA.createItemRecord({ objData, imaRec, arrSalesPrice });

                        arrDefLoc = commonIMA.getDataDefLocationConfig(isCreateILC);
                        arrPLUBarCode = constPLUBarCode.queryDataPLUBarCodeByIMA(imaRec.id);
                        arrItemGISM = constItemGISM.queryDataItemGISMByIMA(imaRec.id);
                    }
                    // TODO: re-submit approval (ko can create ILC, Item GISM and update PLU Barcode)
                    else {
                        const itemRec = record.load({ type: objData.item_type, id: related_item, isDynamic: true });
                        commonIMA.updateItemSalesPrice(itemRec, arrSalesPrice);
                        itemRec.save({enableSourcing: false, ignoreMandatoryFields: true});
                    }

                    // TODO: update ima
                    let arrPurPrice = [];
                    if([record.Type.INVENTORY_ITEM, record.Type.NON_INVENTORY_ITEM].includes(objData.item_type)) {
                        arrPurPrice = commonIMA.getDataUpdItemPurchasePrice(objData);
                    }

                    let arrSublistIMA = commonIMA.updateItemMA({ imaRec, itemId, arrSalesPrice, arrPurPrice });
                    // TODO: call api IMA sales price, IMA purchase price, PLU BarCode

                    const data = handleDataRelatedIMA({
                        arrDefLoc, arrPLUBarCode, arrItemGISM, 
                        arrSublistIMA, itemId, saleunit
                    });

                    data.forEach(obj => {
                        let reduceKey = obj.rectype + "_" + obj.recid + "_" + objResult.internalid;
                        mapContext.write({
                            key: reduceKey,
                            value: JSON.stringify({ ...obj })
                        });
                    });
                }
            } catch (err) {
                log.error("ERROR-Approval Item: " + objResult.internalid, err.message);
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
            // commonIMA.createAndSyncItemLocation(isCreateILC, itemId);

            reduceContext.values.forEach(v => {
                const data = JSON.parse(v);
                try {
                    const fields = data.fields;

                    if(data.action === "update" && !!data.rectype && !!data.recid) {
                        let curRec = record.load({
                            type: data.rectype,
                            id: data.recid
                        });

                        for(let property in fields) {
                            curRec.setValue(property, fields[property]);
                        }

                        curRec.save({ enableSourcing: false, ignoreMandatoryFields: true });
                    } else if(data.action === "create" && data.rectype === "itemlocationconfiguration") {
                        commonIMA.createAndSyncItemLocation(data.rectype, fields);
                    }
                } catch (err) {
                    log.error("ERR: Related IMA: " + reduceContext.key, err);
                }
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

        const handleDataRelatedIMA = ({
            arrDefLoc, arrPLUBarCode, arrItemGISM, arrSublistIMA,
            itemId, saleunit
        }) => {
            // IMA Sales Price, IMA Purchase Price
            let arrResult = arrSublistIMA;
            
            // Item Location Config
            for(let objDefLoc of arrDefLoc) {
                arrResult.push({
                    action: "create",
                    rectype: "itemlocationconfiguration",
                    recid: objDefLoc.id,
                    fields: {
                        item: itemId,
                        subsidiary: objDefLoc.subsidiary,
                        location: objDefLoc.id
                    }
                });
            }

            // Item PLU BarCode
            for(let objBarCode of arrPLUBarCode) {
                arrResult.push({
                    action: "update",
                    rectype: "customrecord_scv_plu_barcode_no",
                    recid: objBarCode.id,
                    fields: {
                        custrecord_scv_plu_barcode_item: itemId,
                        // custrecord_scv_plu_unit: saleunit
                    }
                });
            }
            // Item GISM
            for(let objItemGISM of arrItemGISM) {
                arrResult.push({
                    action: "update",
                    rectype: "customrecord_scv_ite_glo_ins_sys_mtn",
                    recid: objItemGISM.id,
                    fields: {
                        custrecord_scv_ima_ite_item_rel: itemId,
                    }
                });
            }

            return arrResult;
        }

        return {getInputData, map, reduce}

    });
