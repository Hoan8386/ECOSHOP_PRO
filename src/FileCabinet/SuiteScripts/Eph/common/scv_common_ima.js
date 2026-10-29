/**
 *  Date                Author                  Description
 *  19 Dec 2025         Phu Pham			    Init, create file
 */
define([
    'N/record', 'N/query', 'N/config', 'N/format', 'N/search',
    '../lib/scv_lib_function.js',
    '../cons/scv_cons_ima_series_max.js',
    '../cons/scv_cons_ima_salesprice.js',
    '../cons/scv_cons_ima_purprice.js',
    '../cons/scv_cons_appr_status.js',
    '../cons/scv_cons_il_intmap.js',
    '../cons/scv_cons_plu_barcode.js',
    '../cons/scv_cons_country_origin.js',
    '../cons/scv_cons_item_gism.js',
    '../cons/scv_cons_country.js',

    './scv_common_itg_econnect.js',
],
    function(
        record, query, config, format, search,
        lbf,
        constIMASeriesMax,
        consIMASalesPrice,
        consIMAPurPrice,
        constApprStatus,
        constIlIntMap,
        constPLUBarCode,
        constCOO,
        constItemGISM,
        constCountry,

        commonItgEco,
    ) {
        const EMPTY_CODE = "[EMPTY]";

        // TODO: create item record
        const createItemRecord = ({ imaRec, objData = {}, arrSalesPrice = [] }) => {
            const itemRec = record.create({ type: objData.item_type, isDynamic: true });
            // itemRec.setValue("subtype", "Sale");
            let itemFields = [
                'custitem_boc_trade_type', 'unitstype', 'custitem_boc_primary_vendor', 'subsidiary', 'includechildren', 
                'taxschedule', 'custitem_scv_packing_uom_carton', 'custitem_scv_packing_uom_con_rate', 'custitem_boc_date_ctrl', 
                'custitem_boc_allocation_type', 'custitem_boc_min_days_ship', 'custitem_boc_max_days_receive', 
                'custitem_boc_shelf_life_days', 'custitem_boc_min_days_receive'
            ];
            let imaFields = [
                'custrecord_scv_boc_trade_type', 'custrecord_scv_ima_unit_type', 'custrecord_scv_ima_boc_primary_vendor', 
                'custrecord_scv_ima_sub', 'custrecord_scv_ima_in_child', 'custrecord_scv_ima_tax_sch', 'custrecord_scv_ima_packing_uom_carton', 
                'custrecord_scv_ima_packing_uom_con_rate', 'custrecord_scv_ima_date_ctr', 'custrecord_scv_ima_allo_type', 
                'custrecord_scv_ima_min_days_ship', 'custrecord_scv_ima_max_days_rec', 'custrecord_scv_ima_shelf_life_days', 
                'custrecord_scv_ima_min_days_rec'
            ];

            let countryofmanufacture = imaRec.getValue("custrecord_scv_ima_countryofmanufacture");
            let objCountry = constCountry.getInfoCountryByUniqueKey(countryofmanufacture);

            lbf.setValue(itemRec, imaRec, itemFields, imaFields);

            let itemCode = imaRec.getValue("custrecord_scv_ima_item_code");
            let itemSubType = imaRec.getText("custrecord_scv_ima_subtype");
            if(!itemCode) {
                itemCode = generateItemCode(imaRec);
            }

            lbf.setValueData(itemRec, [
                'subtype', 'itemid', 'custitem_scv_related_ima',
                'countryofmanufacture'
            ], [
                itemSubType, itemCode, imaRec.id,
                objCountry.id
            ]);

            updateItemSalesPrice(itemRec, arrSalesPrice);

            let itemId = itemRec.save();
            log.error("create item successfully from IMA", itemId);
            return itemId;
        }

        const updateItemSalesPrice = (itemRec, arrSalesPrice) => {
            let arrCurrency = lbf.onGroupByArray(arrSalesPrice, ["custrecord_scv_ima_sa_currency"]);
            for(let obj of arrCurrency) {
                let sl = "price" + obj.custrecord_scv_ima_sa_currency;
                let totalLine = itemRec.getLineCount(sl);

                let arrFilterPrice = arrSalesPrice.filter(e => e.custrecord_scv_ima_sa_currency == obj.custrecord_scv_ima_sa_currency);
                for(let i = 0; i < totalLine; i++) {
                    let pricelevel = itemRec.getSublistValue(sl, "pricelevel", i);
                    let objFindPrice = arrFilterPrice.find(e => e.custrecord_scv_price_list == pricelevel);
                    if(!!objFindPrice) {
                        itemRec.selectLine(sl, i);
                        itemRec.setCurrentSublistValue(sl, "price_1_", objFindPrice.custrecord_scv_ima_sa_price_bf_tax || 0);
                        itemRec.commitLine(sl);
                    }
                }
            }
        }

        const generateItemCode = (imaRec) => {
            let trade_type = imaRec.getValue("custrecord_scv_boc_trade_type");
            let country_origin = imaRec.getValue("custrecord_scv_ima_cou_of_ori");
            if(!trade_type || !country_origin) return EMPTY_CODE;

            let objCountry = constCOO.queryCountryOriginByIds(country_origin)[0] || {};
            if(!objCountry.custrecord_scv_coo_country_code) return EMPTY_CODE;

            let objSeriesMax = constIMASeriesMax.getDataSourceWithFilters({
                custrecord_scv_ima_ser_trad: trade_type
            })[0] || {};
            if(!objSeriesMax.internalid) return EMPTY_CODE;

            objSeriesMax.custrecord_scv_ima_ser_num_fr = objSeriesMax.custrecord_scv_ima_ser_num_fr * 1;
            objSeriesMax.custrecord_scv_ima_ser_num_to = objSeriesMax.custrecord_scv_ima_ser_num_to * 1;
            objSeriesMax.custrecord_scv_ima_ser_last_ser_num = objSeriesMax.custrecord_scv_ima_ser_last_ser_num * 1;

            if(objSeriesMax.custrecord_scv_ima_ser_last_ser_num < objSeriesMax.custrecord_scv_ima_ser_num_fr) {
                throw "Cannot generate item code when Last Series Number < Serial Number From!";
            }
            if(objSeriesMax.custrecord_scv_ima_ser_last_ser_num > objSeriesMax.custrecord_scv_ima_ser_num_to) {
                throw "Cannot generate item code when Last Series Number > Serial Number To!";
            }

            let nexLastSeqNum = objSeriesMax.custrecord_scv_ima_ser_last_ser_num + 1;
            constIMASeriesMax.updateCurrentLastSerNum(objSeriesMax.internalid, nexLastSeqNum);

            return objCountry.custrecord_scv_coo_country_code + "" + objSeriesMax.custrecord_scv_ima_ser_last_ser_num;
        }

        // TODO: update IMA and sublist IMA Purchase Price, IMA Sales Price
        const updateItemMA = ({
            imaRec, // required
            itemId = null, 
            arrSalesPrice = [],
            arrPurPrice = [],
        }) => {
            let approval_status = constApprStatus.Records.Approved.ID;
            lbf.setValueData(imaRec, ['custrecord_scv_ima_rel_item', 'custrecord_scv_ima_app_status'], [itemId, approval_status]);

            let arrSA = updateSublistSalesPrice(imaRec, arrSalesPrice, itemId, approval_status);
            let arrPP = updateSublistPurchasePrice(imaRec, arrPurPrice, itemId, approval_status);
            imaRec.save({enableSourcing: false, ignoreMandatoryFields: true});

            return [...arrSA, ...arrPP];
        }

        const updateSublistSalesPrice = (imaRec, arrSalesPrice, itemId, approval_status) => {
            let arrResult = [];

            let sl = "recmachcustrecord_scv_ima_sa_price_rel_ima";
            let totalLine = imaRec.getLineCount(sl);

            for(let i = 0; i < totalLine; i++) {
                let id = imaRec.getSublistValue(sl, "id", i);
                let price_item = imaRec.getSublistValue(sl, "custrecord_scv_ima_sa_price_item", i);
                let objSalesPrice = arrSalesPrice.find(e => e.internalid == id);

                let fields = {
                    custrecord_scv_ima_sa_price_item: itemId,
                    custrecord_scv_ima_sale_price_status: approval_status,
                };

                if(!!objSalesPrice) {
                    fields.custrecord_scv_ima_sa_applied = true;
                }
                // push data
                arrResult.push({
                    action: "update",
                    rectype: "customrecord_scv_ima_sa_price",
                    recid: id,
                    fields: fields,
                });
            }

            return arrResult;
        }

        const updateSublistPurchasePrice = (imaRec, arrPurPrice, itemId, approval_status) => {
            let arrResult = [];

            let sl = "recmachcustrecord_scv_pur_price_rel_ima";
            let totalLine = imaRec.getLineCount(sl);

            for(let i = 0; i < totalLine; i++) {
                let id = imaRec.getSublistValue(sl, "id", i);
                let price_item = imaRec.getSublistValue(sl, "custrecord_scv_ima_pur_price_item", i);
                let objPurPrice = arrPurPrice.find(e => e.internalid == id);

                let fields = {
                    custrecord_scv_ima_pur_price_item: itemId,
                    custrecord_scv_ima_pur_price_status: approval_status
                };
                if(!!objPurPrice) {
                    fields.custrecord_scv_ima_pur_price_app_price = true;
                }

                // push data
                arrResult.push({
                    action: "update",
                    rectype: "customrecord_scv_ima_pur_price",
                    recid: id,
                    fields: fields,
                });
            }

            return arrResult;
        }

        // TODO: Create Item GISM
        const afterSubmit_CreateItemGISM = (imaRec) => {
            const recType = "customrecord_scv_ite_glo_ins_sys_mtn";
            let ima_name = imaRec.getValue("name");
            let itemId = imaRec.getValue("custrecord_scv_ima_rel_item");
            let originId = imaRec.getValue("custrecord_scv_ima_cou_of_ori");
            if(!originId) return;

            let originLKF = search.lookupFields({
                type: "customrecord_scv_country_of_ori",
                id: originId,
                columns: ["custrecord_scv_coo_isprimary"]
            });
            if(originLKF?.custrecord_scv_coo_isprimary !== true) return;

            let arrCOO = constCOO.getDataNonPrimaryCOO();
            let objIlIntMap = constIlIntMap.getDataIlIntMapByRecType(recType);

            for(let data of arrCOO) {
                const itemGISM = record.create.promise({
                    type: recType,
                    isDynamic: true
                });

                itemGISM.then(function(objRecord) {
                    try {
                        let externalid = ima_name + "_" + data.custrecord_scv_ido_code;
                        objRecord.setValue("custrecord_scv_ite_des_origins", data.id);

                        lbf.setValue(objRecord, imaRec, [
                            "custrecord_scv_ima_ite_rq_status", "custrecord_scv_ima_ite_reo_reason"
                        ], [
                            "custrecord_scv_ima_rq_status", "custrecord_scv_ima_reorder_rs_lov"
                        ]);
                        lbf.setValueData(objRecord, [
                            "custrecord_scv_ima_ite_ima_rel", "custrecord_scv_ima_ite_is_sysc", 
                            "custrecord_scv_ima_ite_item_rel",
                            "externalid"
                        ], [
                            imaRec.id, false, itemId, externalid
                        ]);

                        objRecord.save.promise({
                            enableSourcing: false, ignoreMandatoryFields: true
                        }).then(function(internalid){
                            // if(!objIlIntMap?.id) return;
                            // let sqlQuery = objIlIntMap.custrecord_scv_il_intmap_sqlquery;
                            
                            // let objRecData = commonItgEco.queryDataSourceByRecId(sqlQuery, internalid);
                            // if(!!objRecData?.id) {
                            //     let auditId = commonItgEco.syncDataToILByRecType({ objIlIntMap, objRecData });
                            // }
                        }).catch(function(errReason) {
                            log.error("ERROR-Save Item GISM From IMA: " + imaRec.id, errReason)
                        });
                    } catch (err) {
                        log.error("ERROR-Create Item GISM From IMA: ", err);
                    }
                }, function(errReason){
                    log.error("ERROR-Create Item GISM Promise From IMA: " + imaRec.id, errReason)
                });
            }
        }

        const getDataUpdItemSalesPrice = (params) => {
            if(!params.effective_date) return [];

            let myFilters = [];
            myFilters.push(search.createFilter({
                name: 'custrecord_scv_ima_sa_applied', 
                operator: "is", 
                values: "F"
            }));

            myFilters.push(search.createFilter({
                name: 'custrecord_scv_ima_sa_eff_date', 
                operator: "on", 
                values: params.effective_date
            }));

            myFilters.push(search.createFilter({
                name: 'custrecord_scv_ima_sale_price_status', 
                operator: "noneof", 
                values: constApprStatus.Records.Approved.ID
            }));

            if(!!params.rel_ima) {
                myFilters.push(search.createFilter({
                    name: 'custrecord_scv_ima_sa_price_rel_ima', 
                    operator: "anyof", 
                    values: params.rel_ima
                }));
            }

            if(!!params.none_of_item) {
                myFilters.push(search.createFilter({
                    name: 'custrecord_scv_ima_rel_item',
                    join: 'custrecord_scv_ima_sa_price_rel_ima', 
                    operator: "noneof", 
                    values: params.none_of_item
                }));
            }
            
            let data = consIMASalesPrice.createSearchWithFilter(myFilters);
            return data;
        }

        const getDataUpdItemPurchasePrice = (params) => {
            if(!params.effective_date) return [];

            let myFilters = [];
            myFilters.push(search.createFilter({
                name: 'custrecord_scv_ima_pur_price_app_price', 
                operator: "is", 
                values: "F"
            }));

            myFilters.push(search.createFilter({
                name: 'custrecord_scv_ima_pur_price_eff_date', 
                operator: "onorbefore", 
                values: params.effective_date
            }));

            myFilters.push(search.createFilter({
                name: 'custrecord_scv_ima_pur_price_status', 
                operator: "noneof", 
                values: constApprStatus.Records.Approved.ID
            }));

            if(!!params.rel_ima) {
                myFilters.push(search.createFilter({
                    name: 'custrecord_scv_pur_price_rel_ima', 
                    operator: "anyof", 
                    values: params.rel_ima
                }));
            }

            if(!!params.none_of_item) {
                myFilters.push(search.createFilter({
                    name: 'custrecord_scv_ima_rel_item',
                    join: 'custrecord_scv_pur_price_rel_ima', 
                    operator: "noneof", 
                    values: params.none_of_item
                }));
            }

            let data = consIMAPurPrice.createSearchWithFilter(myFilters);
            return data;
        }

        const rejectApprovalItem = (imaId) => {
            record.submitFields({
                type: 'customrecord_scv_item_ma',
                id: imaId,
                values: {
                    custrecord_scv_ima_app_status: constApprStatus.Records.Rejected.ID
                },
                options: {enableSourcing: false, ignoreMandatoryFields: true}
            });
        }

        const approvalItemFromIMA = (imaId) => {
            record.submitFields({
                type: 'customrecord_scv_item_ma',
                id: imaId,
                values: {
                    custrecord_scv_ima_app_status: constApprStatus.Records.Approved.ID
                },
                options: {enableSourcing: false, ignoreMandatoryFields: true}
            });
        }

        const getItemRecordType = (objItemType) => {
            switch (objItemType.id) {
                case 'InvtPart':
                    return record.Type.INVENTORY_ITEM;
                case 'NonInvtPart':
                    return record.Type.NON_INVENTORY_ITEM;
                case 'Service':
                    return record.Type.SERVICE_ITEM;
                case 'OthCharge':
                    return record.Type.OTHER_CHARGE_ITEM;
                case 'Assembly':
                    return record.Type.ASSEMBLY_ITEM;
                case 'Kit':
                    return record.Type.KIT_ITEM;
                case 'Discount':
                    return record.Type.DISCOUNT_ITEM;
                case 'Markup':
                    return record.Type.MARKUP_ITEM;
                case 'Subtotal':
                    return record.Type.SUBTOTAL_ITEM;
                case 'Description':
                    return record.Type.DESCRIPTION_ITEM;
                case 'Payment':
                    return record.Type.PAYMENT_ITEM;
                case 'TaxGroup':
                    return record.Type.TAX_GROUP;
                case 'ShipItem':
                    return record.Type.SHIP_ITEM;
                case 'TaxItem':
                    return record.Type.SALES_TAX_ITEM;
                // case 'Group':
                //     return record.Type.ITEM_GROUP;
                // case 'SubscriPlan':
                //     return record.Type.SUBSCRIPTION_PLAN;
                default:
                    throw `Unsupported item type: ${objItemType.name}`;
            }
        };

        const getTodayByTimezone = (timezone = "") => {
            if(!timezone) {
                timezone = getCurrentTimeZone();
            }

            let todayDateTime = format.format({
                value: new Date(),
                type: format.Type.DATETIME,
                timezone: timezone
            });

            return todayDateTime.split(" ")[0];
        }

        const getCurrentTimeZone = () => {
            let configRecObj = config.load({type: config.Type.USER_PREFERENCES});
			let timezone = configRecObj.getValue('TIMEZONE');

            return timezone;
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

        const buildImageName = (value, newImageName) => {
            const match = value.match(/\.(jpg|png|svg)$/i);
            const ext = match ? match[0] : ".jpg";
            return newImageName + ext;
        }

        const getDataReqBodyESMediaRename = (curRec) => {
            let app_status = curRec.getValue("custrecord_scv_ima_app_status");
            let rel_item = curRec.getValue("custrecord_scv_ima_rel_item");
            let img_file_name = curRec.getValue("custrecord_scv_ima_image_file_name");

            if((app_status == constApprStatus.Records.Approved.ID) && !!rel_item && !!img_file_name) {
                let itemLKF = search.lookupFields({
                    type: lbf.getItemRecordType(rel_item),
                    id: rel_item,
                    columns: ["itemid"]
                });
                
                if(!img_file_name.includes(itemLKF.itemid)) {
                    return { 
                        isValid: true, 
                        data: {
                            itemId: itemLKF.itemid,
                            currentImageName: img_file_name
                        }
                    };
                }
            }

            return { isValid: false };
        }

        const getDataItemType = (itemTypeId) =>{
            let resultQuery = query.runSuiteQL({
                query: `SELECT *
                    FROM itemtype
                    WHERE internalid = ${itemTypeId}`
            }).asMappedResults();

            return resultQuery[0] || {};
        }

        const updateIMAPurchasePrice = (purPriceId, objValues) => {
            let purPriceRec = record.load({
                type: "customrecord_scv_ima_pur_price",
                id: purPriceId,
            });

            for(let property in objValues) {
                purPriceRec.setValue(property, objValues[property]);
            }

            purPriceRec.save({ enableSourcing: false, ignoreMandatoryFields: true });
        }

        const updateIMASalesPrice = (salesPriceId, objValues) => {
            let salesPriceRec = record.load({
                type: "customrecord_scv_ima_sa_price",
                id: salesPriceId,
            });

            for(let property in objValues) {
                salesPriceRec.setValue(property, objValues[property]);
            }

            salesPriceRec.save({ enableSourcing: false, ignoreMandatoryFields: true });
        }

        // // TODO: update PLU BarCode
        // const updatePLUBarCode = ({imaRec, itemId}) => {
        //     let arrPLUBarCode = constPLUBarCode.queryDataPLUBarCodeByIMA(imaRec.id);

        //     for(let obj of arrPLUBarCode) {
        //         const submitItemBarCode = record.submitFields.promise({
        //             type: "customrecord_scv_plu_barcode_no",
        //             id: obj.id,
        //             values: {
        //                 custrecord_scv_plu_barcode_item: itemId,
        //                 custrecord_scv_plu_unit: imaRec.getValue("custrecord_scv_ima_saleunit")
        //             }
        //         });
        //     }
        // }

        // const updateItemGISM = ({imaRec, itemId}) => {
        //     const data = constItemGISM.queryDataItemGISMByIMA(imaRec.id);

        //     for(let obj of data) {
        //         const submitItemGISM = record.submitFields.promise({
        //             type: "customrecord_scv_ite_glo_ins_sys_mtn",
        //             id: obj.id,
        //             values: {
        //                 custrecord_scv_ima_ite_item_rel: itemId,
        //             }
        //         });
        //     }
        // }

        // TODO: create item location config and sync data to IL system
        const createAndSyncItemLocation = (rectype, fields) => {
            let objIlIntMap = constIlIntMap.getDataIlIntMapByRecType(rectype);

            const ilcRec = record.create.promise({
                type: rectype,
                isDynamic: true
            });

            ilcRec.then(function(objRecord) {
                try {
                    objRecord.setValue("item", fields.item);
                    objRecord.setValue("subsidiary", fields.subsidiary);
                    objRecord.setValue("location", fields.location);

                    let ilcId = objRecord.save();
                    return ilcId;
                } catch (err) {
                    log.error("ERROR-Create ILC Recrod: ", { msg: err.message, itemId, subsidiary: data.subsidiary, location: data.id });
                    return null;
                }
            }).then(ilcId => {
                // if(!!ilcId && !!objIlIntMap?.id) {
                //     try {
                //         let sqlQuery = objIlIntMap.custrecord_scv_il_intmap_sqlquery;
                    
                //         let objRecData = commonItgEco.queryDataSourceByRecId(sqlQuery, ilcId);
                //         if(!!objRecData?.id) {
                //             let auditId = commonItgEco.syncDataToILByRecType({ objIlIntMap, objRecData });
                //         }
                //     } catch(err) {
                //         log.error("ERROR-Sync Data ILC to IL System: ", err);
                //     }
                // }
            });
        }

        const getDataDefLocationConfig = (isCreateILC) => {
            if(isCreateILC === false) return [];

            let resultQuery = query.runSuiteQL({
                query: `SELECT id, custrecord_scv_location_code, name, 
                    fullname, subsidiary
                FROM location
                WHERE custrecord_scv_def_loc_conf = 'T' AND isinactive = 'F'`
            });
        
            return resultQuery.asMappedResults();
        }

        return {
            createItemRecord,
            updateItemSalesPrice,
            createAndSyncItemLocation,
            getDataDefLocationConfig,

            updateIMAPurchasePrice, // save record: call api to il system
            updateIMASalesPrice, // save record: call api to il system
            // updatePLUBarCode, // save record: call api to il system
            // updateItemGISM, // save record: call api to il system
            
            updateItemMA,
            afterSubmit_CreateItemGISM,

            getDataUpdItemPurchasePrice,
            getDataUpdItemSalesPrice,

            approvalItemFromIMA,
            rejectApprovalItem,

            getDataItemType,
            getItemRecordType,
            getTodayByTimezone,

            getDataReqBodyESMediaRename,
            buildImageName,
        };
    });
    