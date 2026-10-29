/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  18 Jun 2025         Phu Pham			    Init, create file
 */
define(["N/query"],
    function(query) {

        const throwErrorOnDupItems = (objDupItems) => {
            if(objDupItems.isDuplicate === true) {
                throw objDupItems.notification;
            }
        }

        const getDataDuplicateItems = (curRec, isClient) => {
            let objResult = {
                isDuplicate: false,
                notification: ""
            };

            let sl = "item";
            let totalLine = curRec.getLineCount(sl);
            let arrSublist = [];
            for(let i = 0; i < totalLine; i++) {
                arrSublist.push({
                    item: curRec.getSublistValue(sl, "item", i),
                    item_display: curRec.getSublistValue(sl, "item_display", i),
                });
            }

            let arrItemId = groupDataByFieldId(arrSublist, "item");
            let arrItem = [];
            if(isClient === false) {
                arrItem = getDataItem(arrItemId);
            }

            if(arrItemId.length !== arrSublist.length) {
                objResult.isDuplicate = true;

                let arrNotification = [];
                for(let itemId of arrItemId) {
                    let arr_filter_sublist = arrSublist.filter(e => e.item == itemId);
                    if(arr_filter_sublist.length > 1) {
                        let objItem = arrItem.find(e => e.id == itemId);
                        let itemid = isClient === true ? arr_filter_sublist[0].item_display : objItem.itemid;
                        arrNotification.push(itemid);
                    }
                }

                objResult.notification = `Duplicate item: ${arrNotification.join(", ")}. Please recheck it!`;
            }
            return objResult;
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

        const getDataItem = (arrItemId) => {
            if(arrItemId.length === 0) return [];

            let resultSQL = query.runSuiteQL({
                query: `SELECT 
                    id, upccode, itemid
                FROM item
                WHERE id IN (${arrItemId.join(", ")})`
            }).asMappedResults();
            return resultSQL;
        }

        return {
            getDataDuplicateItems,
            throwErrorOnDupItems
            // checkDuplicateItems
        };
        
    });
    