/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
    'N/query', 'N/cache', 'N/task', 'N/search', 'N/file',
    '../lib/scv_lib_function.js',
    '../cons/scv_cons_form.js',
    '../cons/scv_cons_appr_status.js',
    '../cons/scv_cons_format.js',
    '../cons/scv_cons_datastore.js',
    
    '../cons/scv_cons_search_ima_pendingapproval.js',
    '../cons/scv_cons_search_ima_purprice.js',
    '../cons/scv_cons_search_ima_salsesprice.js',
],
    (
        query, cache, task, search, file,
        lbf,
        constForm,
        constApprStatus,
        constFormat,
        constDataStore,
        
        searchImaPendApproval,
        searchImaPurPrice,
        searchImaSalesPrice,
    ) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */

        const RecType = {
            IMA: {
                ID: "customrecord_scv_item_ma",
                NAME: "Item Master Application",
                MR_ID: "customscript_scv_mr_mass_approval_ima",
                MR_DEPLOYMENT: "customdeploy_scv_mr_mass_approval_ima",
                MR_INPUT: "custscript_scv_mass_approval_ima"
            },
            IMA_PurPrice: {
                ID: "customrecord_scv_ima_pur_price",
                NAME: "IMA Purchase Price",

                MR_ID: "customscript_scv_mr_itempurprice",
                MR_DEPLOYMENT: "customdeploy_scv_mr_itempurprice",
                MR_INPUT: "custscript_scv_inpt_item_purprice"
            },
            IMA_SalesPrice: {
                ID: "customrecord_scv_ima_sa_price",
                NAME: "IMA Sales Price",
                
                MR_ID: "customscript_scv_mr_item_salesprice",
                MR_DEPLOYMENT: "customdeploy_scv_mr_item_salesprice",
                MR_INPUT: "custscript_scv_inpt_item_salesprice"
            },
        };

        const MAX_INPUT_PARAM = 5000;
        const BATCH_SIZE = 30000;

        const onRequest = (scriptContext) => {
            // log.error("test", constDataStore.getFolderIdByName(constDataStore.RECORDS.Folder.IMA.NAME));
            constForm.setContext(scriptContext);
            let request = scriptContext.request;
            let params = request.parameters;

            let myCache = cache.getCache({ name: 'cUpdateStt', scope: cache.Scope.PRIVATE });
            // TODO: create form ui
            if(request.method == "GET"){
                onCreateFormUI(params, myCache);
                constForm.writePage();
            } 
            // TODO: submit data approval ima
            else {
                const objResponse = {
                    isSuccess: true,
                };

                const objInput = {
                    rectype: params.custpage_rectype,
                    approval_status: params.custpage_approval_status,
                    files: [],
                    data: []
                };
                
                let arrSublist = hanldeDataSublistDxGrid(params);
                let objMapReduce = getDataObjMapReduce(params.custpage_rectype);

                if(arrSublist.length <= MAX_INPUT_PARAM) {
                    objInput.data = arrSublist;
                } else {
                    objInput.files = createBatchFiles(arrSublist);
                }

                // run map/ reduce
                let mrTask = task.create({
                    taskType: task.TaskType.MAP_REDUCE,
                    scriptId: objMapReduce.id,
                    deploymentId: objMapReduce.deployment,
                });
                mrTask.params = {
                    [objMapReduce.input]: JSON.stringify(objInput),
                };
                let mrTaskId = mrTask.submit();
                myCache.put({ 
                    key: 'mrTaskId', 
                    value: JSON.stringify({
                        taskId: mrTaskId,
                        rectype: params.custpage_rectype,
                        files: objInput.files,
                    }) 
                });

                constForm.write(objResponse);
            }
        }

        const createBatchFiles = (arrSublist) => {
            let folderId = constDataStore.getFolderIdByName(constDataStore.RECORDS.Folder.IMA.NAME);
            const batches = chunkArray(arrSublist);

            const fileIds = [];
            batches.forEach((e) => {
                const fileObj = file.create({
                    name: `${lbf.uuidv4()}.json`,
                    fileType: file.Type.JSON,
                    contents: JSON.stringify(e),
                    folder: folderId
                });

                let fileId = fileObj.save();
                fileIds.push(fileId);
            });

            return fileIds;
        }

        function chunkArray(arr) {
            const result = [];

            for (let i = 0; i < arr.length; i += BATCH_SIZE) {
                result.push(arr.slice(i, i + BATCH_SIZE));
            }

            return result;
        }

        const hanldeDataSublistDxGrid = (params) => {
            let arrSublist = JSON.parse(params.arrResult);

            let fields = [];
            switch (params.custpage_rectype) {
                case RecType.IMA.ID:
                    fields = ["internalid"];
                    break;
                case RecType.IMA_PurPrice.ID:
                    fields = ["internalid", "applied"];
                    break;
                case RecType.IMA_SalesPrice.ID:
                    fields = ["internalid", "applied", "item", "price_level", "currency", "price_before_tax"];
                    break;
            }

            arrSublist = arrSublist.map(e => {
                let obj = {};
                for(let fieldId of fields) {
                    obj[fieldId] = e[fieldId];
                }
                return obj;
            });

            return arrSublist;
        }

        const getDataObjMapReduce = (rectype) => {
            let objResult = {};
            for(let property in RecType) {
                if(RecType[property].ID === rectype) {
                    return {
                        id: RecType[property].MR_ID,
                        deployment: RecType[property].MR_DEPLOYMENT,
                        input: RecType[property].MR_INPUT,
                    }
                }
            }
            return objResult;
        }

        const getAllResultsByParams = (params) => {
            let arrResult = {};

            switch (params.custpage_rectype) {
                case RecType.IMA.ID:
                    let imaFilters = [];
                    if(!!params.custpage_recid) {
                        imaFilters.push(search.createFilter({
                            name: 'internalid', 
                            operator: "anyof", 
                            values: params.custpage_recid
                        }));
                    }
                    arrResult = searchImaPendApproval.getDataSource(imaFilters);
                    break;
                case RecType.IMA_PurPrice.ID:
                    arrResult = handleDataSearchImaPurPrice(params);
                    break;
                case RecType.IMA_SalesPrice.ID:
                    arrResult = handleDataSearchImaSalesPrice(params);
                    break;
            }
            return arrResult;
        }

        const handleDataSearchImaPurPrice = (params) => {
            let arrApplied = searchImaPurPrice.getDataSource(search.createFilter({
                name: "custrecord_scv_ima_pur_price_eff_date", 
                operator: "onorbefore", 
                values: "today"
            }));
            arrApplied = arrApplied.map(e => ({...e, applied: "T"}));

            let arrUnApllied = searchImaPurPrice.getDataSource(search.createFilter({
                name: "custrecord_scv_ima_pur_price_eff_date", 
                operator: "after", 
                values: "today"
            }));
            arrUnApllied = arrUnApllied.map(e => ({...e, applied: "F"}));

            return arrApplied.concat(arrUnApllied);
        }

        const handleDataSearchImaSalesPrice = (params) => {
            let arrApplied = searchImaSalesPrice.getDataSource(search.createFilter({
                name: "custrecord_scv_ima_sa_eff_date", 
                operator: "onorbefore", 
                values: "today"
            }));
            arrApplied = arrApplied.map(e => ({...e, applied: "T"}));

            let arrUnApllied = searchImaSalesPrice.getDataSource(search.createFilter({
                name: "custrecord_scv_ima_sa_eff_date", 
                operator: "after", 
                values: "today"
            }));
            arrUnApllied = arrUnApllied.map(e => ({...e, applied: "F"}));

            return arrApplied.concat(arrUnApllied);
        }

        const onCreateFormUI = (params, myCache) => {
            let imaName = "";
            if(!!params.custpage_recid) {
                let imaLKF = search.lookupFields({
                    type: "customrecord_scv_item_ma",
                    id: params.custpage_recid,
                    columns: ["name"]
                });

                imaName = ` (${imaLKF.name})`;
            }

            constForm.createForm({title: "Mass Approval IMA" + imaName}, "../cssl/scv_cs_sl_mass_approval_ima.js");
            constForm.addPageLink([searchImaPendApproval.ID, searchImaPurPrice.ID, searchImaSalesPrice.ID]);

            constForm.addButton({id: "custpage_btn_approval", label: "Approve", functionName: "onApproval()"}, {styleSubmit: true});
            constForm.addButton({id: "custpage_btn_reject", label: "Reject", functionName: "onReject()"});
            constForm.addButton({id: "custpage_btn_refresh", label: "Refresh", functionName: "onRefresh()"});

            let mainGrp = constForm.addFieldGroup({id: "fieldgrp_main", label: "Main"});
            // update status
            let mrTaskId = myCache.get({ key: 'mrTaskId', loader: 'loader' });
            let isShowSublist = true;
            if (!!mrTaskId) {
                const objTask = JSON.parse(mrTaskId);
                if(params.custpage_rectype == objTask.rectype) {
                    isShowSublist = false;
                    let taskStatus = task.checkStatus(objTask.taskId);
                    let messageInfo = 'Status of Update Approve Status is: ' + taskStatus.status;
                    constForm.addPageInitMessage(messageInfo);
                    
                    if(taskStatus.status == 'COMPLETE') {
                        isShowSublist = true;
                        deleteFiles(objTask.files);
                        myCache.remove({ key: 'mrTaskId' });
                    }
                }
            }

            // add field
            let arrRecType = getDataRecType();
            let arrStatus = getDataApprovalStatus();
            let isDisabled = params.custpage_recid;

            constForm.addField({
                id: 'custpage_rectype', label: 'Rec Type', container: mainGrp.id,
                type: "select"
            }, true, {
                defaultValue: params.custpage_rectype,
                displayType: isDisabled ? "disabled" : "normal",
                lookup: { data: arrRecType }
            });

            constForm.addField({
                id: 'custpage_recid', label: 'Rec ID', container: mainGrp.id,
                type: "text", 
            }, true, {
                defaultValue: params.custpage_recid,
                displayType: "hidden"
            });

            let columns = [];
            if(params.custpage_rectype == RecType.IMA_PurPrice.ID) {
                columns = getDataColumnIMA_PurPrice();
            } else if (params.custpage_rectype == RecType.IMA_SalesPrice.ID) {
                columns = getDataColumnIMA_SalesPrice();
            } else {
                columns = getDataColumnIMA();
            }

            constForm.addGridDx({
                id: "custpage_sl_result",
                type: "grid",
                label: "Result",
                optionsDx: {
                    wordWrapEnabled: true,
                    selection: {
                        mode: 'multiple',
                    },
                },
                columns: columns
            });

            // show sublist data
            if(params.isrun === "T" && !!isShowSublist) {
                let arrResult = getAllResultsByParams(params);
                if(!!params.custpage_recid) {
                    arrResult = arrResult.map(e => ({...e, select: "T"}));
                }
                constForm.setDataDx("custpage_sl_result", arrResult);
            }
        }

        const deleteFiles = (files) => {
            for(let fileId of files) {
                try {
                    file.delete({ id: fileId });
                } catch (err) {
                    log.error("DELETE FILE ERROR: ", fileId);
                }
            }
        }

        const getDataColumnIMA = () => {
            return [
                {dataField: 'internalid', caption: "Internal ID", dataType: 'string', width: 100},
                {
                    dataField: 'record', caption: "Record", dataType: 'string', width: 170,
                    cellTemplate: (container, options) => {
                        let tagHtml = options.data.record || "";
                        $('<div>').append($(tagHtml)).appendTo(container);
                    }
                },
                {dataField: 'requestor_display', caption: "Requestor", dataType: 'string', width: 120},
                {dataField: 'name', caption: "Name", dataType: 'string', width: 140},
                {dataField: 'trade_display', caption: "Trade/ Non Trade", dataType: 'string', width: 120},
                {dataField: 'displayname', caption: "Display Name", dataType: 'string', width: 140},
                {dataField: 'class_display', caption: "Class", dataType: 'string', width: 120},
                {dataField: 'status_display', caption: "Status", dataType: 'string', width: 120},
                {dataField: 'sub_class2_display', caption: "Sub class 2", dataType: 'string', width: 140},
                {dataField: 'item_cate_code_display', caption: "Item Category Code", dataType: 'string', width: 140},
                {dataField: 'related_item', caption: "Related Item", dataType: 'string', width: 120},
            ];
        }

        const getDataColumnIMA_PurPrice = () => {
            let maskFormatNumber = constFormat.getTemplateFormatNumber(2);
            return [
                {dataField: 'applied', caption: "For Applied?", dataType: 'string', width: 95},
                {dataField: 'internalid', caption: "Internal ID", dataType: 'string', width: 100},
                {
                    dataField: 'record', caption: "Record", dataType: 'string', width: 140,
                    cellTemplate: (container, options) => {
                        let tagHtml = options.data.record || "";
                        $('<div>').append($(tagHtml)).appendTo(container);
                    }
                },
                {dataField: 'requestor', caption: "Requestor", dataType: 'string', width: 120},
                {dataField: 'item_display', caption: "Item", dataType: 'string', width: 120},
                {dataField: 'displayname', caption: "Display Name", dataType: 'string', width: 140},
                {dataField: 'vendor_display', caption: "Vendor", dataType: 'string', width: 170},
                {dataField: 'location_display', caption: "Location", dataType: 'string', width: 140},
                {dataField: 'eff_date', caption: "Start Date", dataType: 'string', width: 100},
                {dataField: 'unit_display', caption: "Unit", dataType: 'string', width: 80},
                {dataField: 'currency_display', caption: "Currency", dataType: 'string', width: 90},
                {dataField: 'purchase_price', caption: "Price", dataType: 'number', format: maskFormatNumber, width: 120},
            ];
        }

        const getDataColumnIMA_SalesPrice = () => {
            let maskFormatNumber = constFormat.getTemplateFormatNumber(2);
            return [
                {dataField: 'applied', caption: "For Applied?", dataType: 'string', width: 95},
                {dataField: 'internalid', caption: "Internal ID", dataType: 'string', width: 100},
                {
                    dataField: 'record', caption: "Record", dataType: 'string', width: 140,
                    cellTemplate: (container, options) => {
                        let tagHtml = options.data.record || "";
                        $('<div>').append($(tagHtml)).appendTo(container);
                    }
                },
                {dataField: 'requestor', caption: "Requestor", dataType: 'string', width: 120},
                {dataField: 'item_display', caption: "Item", dataType: 'string', width: 120},
                {dataField: 'displayname', caption: "Display Name", dataType: 'string', width: 140},
                {dataField: 'price_level_display', caption: "Price Level", dataType: 'string', width: 120},
                {dataField: 'eff_date', caption: "Start Date", dataType: 'string', width: 100},
                {dataField: 'unit_display', caption: "Unit", dataType: 'string', width: 80},
                {dataField: 'currency_display', caption: "Currency", dataType: 'string', width: 90},
                {dataField: 'price_before_tax', caption: "Price Before Tax", dataType: 'number', format: maskFormatNumber, width: 120},
                {dataField: 'price_after_tax', caption: "Price After Tax", dataType: 'number', format: maskFormatNumber, width: 120},
            ];
        }

        const getDataRecType = () => {
            let arrResult = [];
            for(let property in RecType) {
                arrResult.push({
                    id: RecType[property].ID,
                    name: RecType[property].NAME
                });
            }
            return arrResult;
        }

        const getDataApprovalStatus = () => {
            let arrStatusId = [constApprStatus.Records.Approved.ID, constApprStatus.Records.Rejected.ID];

            const resultQuery = query.runSuiteQL({
                query: `SELECT id, name
                    FROM customrecord_scv_approval_status
                    WHERE id IN (${arrStatusId.join(",")}) AND isinactive = 'F'`
            }).asMappedResults();

            return resultQuery;
        }

        return {onRequest}

    });
