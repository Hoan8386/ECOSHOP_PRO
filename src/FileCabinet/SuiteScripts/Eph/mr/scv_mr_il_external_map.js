/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define([
    'N/record', 'N/file', 'N/query',
],

    (
        record, file, query,
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
            const arrRecType = getDataRecTypeILIntMap();

            const arrILExternalMap = getDataILExternalMapByAudit(arrRecType);
            const arrUpdRec = getDataUpdExtSourceIdByAudit();

            return [
                ...arrILExternalMap,
                ...arrUpdRec
            ];
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
                let ecoAuditRec = record.load({
                    type: "customrecord_scv_itg_econnect_audit",
                    id: objData.id
                });

                let response = {};
                let fileResId = ecoAuditRec.getValue("custrecord_scv_eco_audit_file_response");
                if(!!fileResId) {
                    let fileContents = getContentsFile(fileResId);
                    response = JSON.parse(fileContents);
                } else {
                    response = JSON.parse(ecoAuditRec.getValue("custrecord_scv_eco_audit_response"));
                }

                if(!!response?.data?.internalId) {
                    if(objData.action === "updaterecord") {
                        record.submitFields({
                            type: objData.rectype,
                            id: objData.recid,
                            values: {
                                [objData.fieldid]: response.data.internalId.toString()
                            },
                            options: {
                                enableSourcing: false, ignoreMandatoryFields : true
                            }
                        });
                    } else {
                        let ilExtMapRec = record.create({
                            type: "customrecord_scv_il_external_map",
                            isDynamic: true,
                        });

                        ilExtMapRec.setValue("custrecord_scv_ilextmap_rectype", objData.rectype);
                        ilExtMapRec.setValue("custrecord_scv_ilextmap_recid", objData.recid);
                        ilExtMapRec.setValue("custrecord_scv_ilextmap_id", response.data.internalId.toString());
                        ilExtMapRec.save();
                    }
                }
            } catch (err) {
                log.error("ERR_Create-IL External Mapping", err);
            }
        }

        const getContentsFile = (_fileId) => {
            return file.load({id: _fileId}).getContents();
        }

        const getDataILExternalMapByAudit = (arrRecType) => {
            if(arrRecType.length === 0) return [];

            const resultQuery = query.runSuiteQL({
                query: `SELECT 
                    MAX(EcoAudit.id) AS id,
                    EcoAudit.custrecord_scv_eco_audit_recordid AS recid,
                    LOWER(EcoAudit.custrecord_scv_eco_audit_recordtype) AS rectype,
                    ILExternalMap.custrecord_scv_ilextmap_id AS externalid
                FROM customrecord_scv_itg_econnect_audit EcoAudit
                LEFT JOIN customrecord_scv_il_external_map  ILExternalMap ON ILExternalMap.custrecord_scv_ilextmap_recid = EcoAudit.custrecord_scv_eco_audit_recordid
                    AND ILExternalMap.custrecord_scv_ilextmap_rectype = LOWER(EcoAudit.custrecord_scv_eco_audit_recordtype)
                WHERE EcoAudit.isinactive = 'F'
                    AND EcoAudit.custrecord_scv_eco_audit_issuccess = 'T'
                    AND LOWER(EcoAudit.custrecord_scv_eco_audit_recordtype) IN ('${arrRecType.join("', '")}')
                    AND ILExternalMap.custrecord_scv_ilextmap_id IS NULL
                GROUP BY
                    EcoAudit.custrecord_scv_eco_audit_recordid,
                    EcoAudit.custrecord_scv_eco_audit_recordtype,
                    ILExternalMap.custrecord_scv_ilextmap_id
                ORDER BY rectype ASC`
            }).asMappedResults();

            return resultQuery;
        }

        const getDataUpdExtSourceIdByAudit = () => {
            const resultQuery = query.runSuiteQL({
                query: `SELECT 
                    MAX(EcoAudit.id) AS id,
                    EcoAudit.custrecord_scv_eco_audit_recordid AS recid,
                    LOWER(EcoAudit.custrecord_scv_eco_audit_recordtype) AS rectype,
                ILIntMap.custrecord_scv_il_intmap_extsource_field AS fieldid,
                FROM customrecord_scv_itg_econnect_audit EcoAudit
                LEFT JOIN customrecord_scv_il_intmap ILIntMap 
                    ON ILIntMap.custrecord_scv_il_intmap_rectype = LOWER(EcoAudit.custrecord_scv_eco_audit_recordtype)
                WHERE EcoAudit.isinactive = 'F'
                    AND EcoAudit.custrecord_scv_eco_audit_issuccess = 'T'
                    AND LOWER(EcoAudit.custrecord_scv_eco_audit_recordtype) IN (
                        'customrecord_boc_item_buyer_grp',
                        'customrecord_boc_brand',
                        'customrecord_boc_hscode',
                        'customrecord_boc_outletsize',
                        'customrecord_boc_outletsizecluster'
                    )
                GROUP BY
                    EcoAudit.custrecord_scv_eco_audit_recordid,
                    EcoAudit.custrecord_scv_eco_audit_recordtype,
                    ILIntMap.custrecord_scv_il_intmap_extsource_field
                ORDER BY rectype ASC`
            }).asMappedResults();

            let arrResult = resultQuery.map(e => ({
                ...e,
                action: "updaterecord"
            }));

            return arrResult;
        }

        const getDataRecTypeILIntMap = () => {
            const resultQuery = query.runSuiteQL({
                query: `SELECT id, custrecord_scv_il_intmap_rectype, custrecord_scv_il_intmap_extsource_field 
                    FROM customrecord_scv_il_intmap
                    WHERE custrecord_scv_il_intmap_extsource_field IS NULL AND custrecord_scv_il_intmap_showinsl = 'T' 
                        AND custrecord_scv_il_intmap_priority <> 999`
            }).asMappedResults();

            return resultQuery.map(e => e.custrecord_scv_il_intmap_rectype);
        }

        return {getInputData, map}

    });
