/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
    'N/record', 'N/redirect', 'N/query', 'N/runtime',
    '../common/scv_common_ima.js',
],
    (
        record, redirect, query, runtime,
        commonIMA
    ) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            let params = scriptContext.request.parameters;
            const imaRec = record.load({ type: params.rectype, id: params.recid, isDynamic: true });

            let isCreateILC = imaRec.getValue("custrecord_scv_ima_cre_item_conf");
            let objItemType = commonIMA.getDataItemType(imaRec.getValue("custrecord_scv_ima_item_type"));

            let objData = {
                item_type: commonIMA.getItemRecordType(objItemType),
                rel_ima: params.recid,
                effective_date: commonIMA.getTodayByTimezone()
            };

            // TODO: sales price
            let arrSalesPrice = [];
            if([record.Type.INVENTORY_ITEM, record.Type.ASSEMBLY_ITEM].includes(objData.item_type)) {
                arrSalesPrice = commonIMA.getDataUpdItemSalesPrice(objData);
            }

            // TODO: create item and update item master application
            let itemId = commonIMA.createItemRecord({ objData, imaRec, arrSalesPrice });
            commonIMA.createAndSyncItemLocation(isCreateILC, itemId);

            // TODO: update ima
            let arrPurPrice = [];
            if([record.Type.INVENTORY_ITEM].includes(objData.item_type)) {
                arrPurPrice = commonIMA.getDataUpdItemPurchasePrice(objData);
            }

            commonIMA.updateItemMA({ imaRec, itemId, arrSalesPrice, arrPurPrice });

            // TODO: update PLU Barcoce
            commonIMA.updatePLUBarCode({imaRec, itemId});
            commonIMA.updateItemGISM({imaRec, itemId});

            // TODO: call api IMA sales price, IMA purchase price, PLU BarCode

            // TODO: redirect to item
            getRemainingUsage(params.recid, itemId);
            redirect.toRecord({ type: objData.item_type, id: itemId });
        }

        const getRemainingUsage = (imaId, itemId) => {
            let script = runtime.getCurrentScript();
            log.error('remaining usage', {
                getRemainingUsage: script.getRemainingUsage(),
                imaId, itemId
            });
        }

        return {onRequest}

    });
