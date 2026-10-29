/**
 * Nội dung:
 * https://app.clickup.com/t/86cxxuy0y
 * =======================================================================================
 *  Date                Author                  Description
 *  14 Apr 2026         Phu Pham                Bổ sung tích hợp IMA Sales Price, IMA Purchase Price, update Location khi save Location (Extension) from mr. Quân
 */
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define([
    'N/runtime', 'N/record', 'N/search',
    '../lib/scv_lib_function.js',
    '../cons/scv_cons_appr_status.js',
    '../cons/scv_cons_il_intmap.js',
    '../common/scv_common_itg_econnect.js',
],
    (
        runtime, record, search, 
        lbf,
        constApprStatus,
        constIlIntMap,
        commonItgEco,
    ) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const ShipStatus = {
            SHIPPED: "C"
        };

        const beforeLoad = (scriptContext) => {

        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {

        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {
            // let triggerType = scriptContext.type;
            // let newRecord = scriptContext.newRecord;
            // let recType = newRecord.type;
            // if(recType === 'unitstype') return; // TODO: using file scv_ue_unitstype

            // if(!!hasSyncedDataTOFromITF(triggerType, recType)) {
            //     afterSubmitItemShipSyncDataTO(newRecord);
            // }
            // afterSubmit_SyncDataToILSystem(triggerType, newRecord, recType);
        }

        const afterSubmit_SyncDataToILSystem = (triggerType, newRecord, recType) => {
            try {
                let isSyncData = hasSyncedDataToIL(triggerType, recType, newRecord);
                if(isSyncData === false) return;

                if(recType === "customrecord_scv_location_extension") {
                    afterSubmitSyncLocationByLocExten(newRecord);
                } else {
                    let objIlIntMap = constIlIntMap.getDataIlIntMapByRecType(recType);
                    if(!objIlIntMap?.id) return;
                    let sqlQuery = objIlIntMap.custrecord_scv_il_intmap_sqlquery;
                    
                    let objRecData = commonItgEco.queryDataSourceByRecId(sqlQuery, newRecord.id);
                    if(!!objRecData?.id) {
                        let auditId = commonItgEco.syncDataToILByRecType({ objIlIntMap, objRecData });
                        // log.error("auditId", auditId);
                    }
                }
            } catch (err) {
                log.error("ERROR Auto Sync Data to IL System: " + newRecord.id, err);
            }
        }

        const afterSubmitSyncLocationByLocExten = (newRecord) => {
            let objIlIntMap = constIlIntMap.getDataIlIntMapByRecType("location");
            if(!objIlIntMap?.id) return;

            let location = newRecord.getValue("custrecord_boc_location_ops_su");
            let sqlQuery = objIlIntMap.custrecord_scv_il_intmap_sqlquery;
                
            let objRecData = commonItgEco.queryDataSourceByRecId(sqlQuery, location);
            if(!!objRecData?.id) {
                let auditId = commonItgEco.syncDataToILByRecType({ objIlIntMap, objRecData });
                log.error("auditId", auditId);
            }
        }

        const afterSubmitItemShipSyncDataTO = (newRecord) => {
            try {
                let auditId = null;
                let shipstatus = newRecord.getValue("shipstatus");
                if(shipstatus === ShipStatus.SHIPPED) {
                    let createdfrom = newRecord.getValue("createdfrom");
                    let createdType = lbf.getTranRecordType(createdfrom);

                    if(createdType === "transferorder") {
                        let toRec = record.load({ type: createdType, id: createdfrom });

                        let objIlIntMap = constIlIntMap.getDataIlIntMapByRecType(createdType);
                        if(!objIlIntMap?.id) return;

                        let sqlQuery = objIlIntMap.custrecord_scv_il_intmap_sqlquery;
                
                        let objRecData = commonItgEco.queryDataSourceByRecId(sqlQuery, createdfrom);
                        if(!!objRecData?.id) {
                            let auditId = commonItgEco.syncDataToILByRecType({ objIlIntMap, objRecData });
                        }
                    }
                }
                return auditId;
            } catch (err) {
                log.error("ERROR: sync data to by itemship", err);
            }
        }

        const hasSyncedDataToIL = (triggerType, recType, newRecord) => {
            if(["intercompanytransferorder", "transferorder"].includes(recType)) {
                if(!['edit', 'create', 'approve'].includes(triggerType)) return false;
            } else {
                if(!['edit', 'create'].includes(triggerType)) return false;
            }

            if(recType === "itemlocationconfiguration") {
                let arrContextType = [
                    runtime.ContextType.MAP_REDUCE,
                    runtime.ContextType.SUITELET,
                ];

                if(arrContextType.includes(runtime.executionContext)) return false;
            } 
            else if(recType === "customrecord_scv_location_extension") {
                let location = newRecord.getValue("custrecord_boc_location_ops_su");
                if(!location) return false;

                let locLKF = search.lookupFields({
                    type: "location",
                    id: location,
                    columns: ["custrecord_scv_external_id_loc"]
                });

                if(!locLKF?.custrecord_scv_external_id_loc) return false;
            } 
            else if(recType === "customrecord_scv_ima_sa_price") {
                let itemId = newRecord.getValue("custrecord_scv_ima_sa_price_item");
                let priceStatus = newRecord.getValue("custrecord_scv_ima_sale_price_status");
                if(!itemId || (priceStatus != constApprStatus.Records.Approved.ID)) return false;
            }
            else if(recType === "customrecord_scv_ima_pur_price") {
                let itemId = newRecord.getValue("custrecord_scv_ima_pur_price_item");
                let vendorId = newRecord.getValue("custrecord_scv_pur_price_vendor");
                let locId = newRecord.getValue("custrecord_scv_ima_pur_price_loc");
                let priceStatus = newRecord.getValue("custrecord_scv_ima_pur_price_status");

                if(!itemId || !vendorId || !locId || (priceStatus != constApprStatus.Records.Approved.ID)) return false;
            }

            return true;
        }

        const hasSyncedDataTOFromITF = (triggerType, recType) => {
            if(recType === "itemfulfillment") {
                if(!['ship', 'create'].includes(triggerType)) return false;
            } 
            return true;
        }

        return {afterSubmit}

    });
