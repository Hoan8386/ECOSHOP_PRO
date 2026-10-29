/**
 *  Date                Author                  Description
 *  18 Mar 2026         Phu Pham			    Init, create file
 */
define([
    'N/runtime', 'N/query',
    '../cons/scv_cons_format.js',
    '../cons/scv_cons_currency.js',
    '../cons/scv_cons_ima_purprice.js',
],
    function(
        runtime, query,
        constFormat,
        constCurrency,
        constImaPurPrice,
    ) {

        const DefaultValue = {
            RATE: 0
        };

        const Notification = {
            IMA_PURPRICE_NOT_FOUND: "No matching IMA Purchase Price was found for the following {items}."
        };

        const beforeSubmit_DefaultRateForFOC = (curRec) => {
            const arrContext = [runtime.ContextType.USER_INTERFACE, runtime.ContextType.CSV_IMPORT, runtime.ContextType.REST_WEBSERVICES];
            if(arrContext.includes(runtime.executionContext)) {
                let sl = "item";
                let totalLine = curRec.getLineCount(sl);

                for(let i = 0; i < totalLine; i++) {
                    let is_foc = curRec.getSublistValue(sl, "custcol_scv_is_foc", i);

                    if(is_foc === true || is_foc === "T") {
                        curRec.setSublistValue({
                            sublistId: sl, fieldId: "rate", value: DefaultValue.RATE, line: i
                        });
                        curRec.setSublistValue({
                            sublistId: sl, fieldId: "custcol_scv_ima_pur_price", value: "", line: i
                        });
                    }
                }
            }
        }

        const beforeSubmit_CalcRateImaPurPrice = (scriptContext) => {
            const arrContext = [runtime.ContextType.CSV_IMPORT, runtime.ContextType.REST_WEBSERVICES];
            if(!arrContext.includes(runtime.executionContext)) return;
            // if(runtime.executionContext != runtime.ContextType.CSV_IMPORT) return;

            let tgType = scriptContext.type;
            let curRec = scriptContext.newRecord;
            let oldRec = scriptContext.oldRecord;

            let objSearch = getDataObjSearchImaPurPrice({curRec});

            let arrOldLineItem = [];
            if(tgType === 'edit') {
                arrOldLineItem = getOldLineItemData(oldRec);
            }

            if(!objSearch.isValid) return;

            let arrImaPurPrice = getDataAppliedImaPurPriceByPO(objSearch);
            let sl = "item";
            let totalLine = curRec.getLineCount(sl);
            let arrItemMissing = [];

            for(let i = 0; i < totalLine; i++) {
                let is_foc = curRec.getSublistValue(sl, "custcol_scv_is_foc", i);
                if(is_foc === true || is_foc === "T") continue;

                let item = curRec.getSublistValue(sl, "item", i);
                let units = curRec.getSublistValue(sl, "units", i);
                let taxrate1 = curRec.getSublistValue(sl, "taxrate1", i);
                let lineuniquekey = curRec.getSublistValue(sl, "lineuniquekey", i);
                
                let oldLineIdx = arrOldLineItem.findIndex((e) => {
                    return e.item == item && 
                        e.units == units &&
                        e.lineuniquekey == lineuniquekey && 
                        e.location == objSearch.location &&
                        e.vendor == objSearch.vendor && 
                        e.currency == objSearch.currency
                });

                if(oldLineIdx !== -1) continue;

                let objApplyPrice = arrImaPurPrice.find(e => e.custrecord_scv_ima_pur_price_item == item && e.custrecord_scv_pur_price_unit == units);
                if(!!objApplyPrice?.id) {
                    let rate = calcRateFromAppliedImaPurPrice(objApplyPrice, objSearch.currency, taxrate1);

                    curRec.setSublistValue({
                        sublistId: sl, fieldId: "rate", value: rate, line: i
                    });
                    curRec.setSublistValue({
                        sublistId: sl, fieldId: "custcol_scv_ima_pur_price", value: objApplyPrice.id, line: i
                    });
                } else {
                    arrItemMissing.push(item);
                }
            }

            // log.error("new update 261002");

            if(arrItemMissing.length > 0) {
                let arrItem = getDataItemByIds(arrItemMissing);
                let notify = getNotifyIMAPurPriceNotFound(groupDataByFieldId(arrItem, "itemid"));
                throw notify;
            }
        }

        const getOldLineItemData = (oldRec) => {
            let objRes = {
                location: oldRec.getValue("location"),
                vendor: oldRec.getValue("entity"),
                currency: oldRec.getValue("currency"),
            };

            let arrSublist = getDataSublistItem(oldRec);
            return arrSublist.map(e => ({...e, ...objRes}));
        }

        const getDataItemByIds = (arrItemId) => {
            if(arrItemId.length === 0) return [];

            let resultSQL = query.runSuiteQL({
                query: `SELECT id, upccode, itemid
                    FROM item
                    WHERE id IN (${arrItemId.join(", ")})`
            }).asMappedResults();

            return resultSQL;
        }
        
        const calcRateFromAppliedImaPurPrice = (objApplyPrice, currency, taxrate1) => {
            let rate = objApplyPrice.custrecord_scv_ima_pur_price;
            //  / (1 + (Number(taxrate1) / 100)); // TODO: 260729 following by hin
            // let precision = currency == constCurrency.RECORDS.VND.ID ? 0 : 2;

            return constFormat.roundNumber(rate, 8);
        }

        const getDataAppliedImaPurPriceByPO = (objSearch) => {
            return constImaPurPrice.getDataCurApplyPrice(objSearch);
        }

        const getDataObjSearchImaPurPrice = ({
            curRec, 
            itemId = null,
            unitId = null
        }) => {
            let objRes = {
                location: curRec.getValue("location"),
                vendor: curRec.getValue("entity"),
                currency: curRec.getValue("currency"),
            };

            let arrSublist = getDataSublistItem(curRec);
            if(!!itemId) {
                objRes.item = itemId;
            } else {
                let arrItemId = groupDataByFieldId(arrSublist, "item");
                objRes.item = arrItemId.join(",");
            }

            if(!!unitId) {
                objRes.unit = unitId;
            } else {
                let arrUnits = groupDataByFieldId(arrSublist, "units");
                objRes.unit = arrUnits.join(",");
            }

            objRes.isValid = !!objRes.item && !!objRes.location && !!objRes.vendor && !!objRes.currency;
            return objRes;
        }

        const getDataSublistItem = (curRec) => {
            let sl = "item";
            let totalLine = curRec.getLineCount(sl);
            let arrSublist = [];

            for(let i = 0; i < totalLine; i++) {
                arrSublist.push({
                    item: curRec.getSublistValue(sl, "item", i),
                    units: curRec.getSublistValue(sl, "units", i),
                    item_display: curRec.getSublistValue(sl, "item_display", i),
                    lineuniquekey: curRec.getSublistValue(sl, "lineuniquekey", i),
                });
            }

            return arrSublist;
        }

        const getNotifyIMAPurPriceNotFound = (arrItemDisplay) => {
            let itemText = arrItemDisplay.length > 1 ? "items" : "item";
            const msgNotFound = Notification.IMA_PURPRICE_NOT_FOUND.replace(
                "{items}",
                itemText + ": " + arrItemDisplay.join(", ")
            );

            return msgNotFound;
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

        return {
            beforeSubmit_CalcRateImaPurPrice,
            beforeSubmit_DefaultRateForFOC,

            getDataObjSearchImaPurPrice,
            getDataAppliedImaPurPriceByPO,
            calcRateFromAppliedImaPurPrice,
            getNotifyIMAPurPriceNotFound,
        }
    });
    