/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  18 Mar 2026         Phu Pham			    Init, create file
 */
define([
    'N/query', 'N/record',
    '../cons/scv_cons_il_intaction.js'
],
    function(
        query, record,
        constIlIntAction,
    ) {

        const Records = {

        };

        const Fields = {
            ID: "id",
            INACTIVE: "isinactive",
            NAME: "name",
        };

        const getDataRecordShowInSL = () => {
            // SELECT 
            //         id, name, custrecord_scv_il_intmap_recname, custrecord_scv_il_intmap_rectype,
            //     FROM customrecord_scv_il_intmap
            //     WHERE isinactive = 'F' AND custrecord_scv_il_intmap_showinsl = 'T'
            //     ORDER BY custrecord_scv_il_intmap_priority ASC, id ASC
            const resultSQL = query.runSuiteQL({
                query: `SELECT 
                    id, name, custrecord_scv_il_intmap_recname, custrecord_scv_il_intmap_rectype,
                FROM customrecord_scv_il_intmap
                WHERE isinactive = 'F' AND custrecord_scv_il_intmap_showinsl = 'T' 
                ORDER BY custrecord_scv_il_intmap_priority ASC, id ASC`
            });
            return resultSQL.asMappedResults();
        }

        const getDataIlIntMapById = (_ilIntId) => {
            if(!_ilIntId) return {};
            
            const resultSQL = query.runSuiteQL({
                query: `SELECT 
                    id, name, custrecord_scv_il_intmap_recname, custrecord_scv_il_intmap_rectype,
                    custrecord_scv_il_intmap_endpoint, custrecord_scv_il_intmap_autosyncrec, 
                    custrecord_scv_il_intmap_showinsl, custrecord_scv_il_intmap_priority, 
                    custrecord_scv_il_intmap_searchid, custrecord_scv_il_intmap_extsource_field, 
                    custrecord_scv_il_intmap_sqlquery, custrecord_scv_il_intmap_action
                FROM customrecord_scv_il_intmap
                WHERE isinactive = 'F' AND id = ${_ilIntId}`
            }).asMappedResults();
            return resultSQL[0] || {};
        }

        const getDataIlIntMapByRecType = (_rectype) => {
            if(!_rectype) return {};
            
            const resultSQL = query.runSuiteQL({
                query: `SELECT
                    id, name, 
                    custrecord_scv_il_intmap_recname, 
                    custrecord_scv_il_intmap_rectype,
                    custrecord_scv_il_intmap_endpoint, 
                    custrecord_scv_il_intmap_autosyncrec, 
                    custrecord_scv_il_intmap_priority, 
                    custrecord_scv_il_intmap_searchid, 
                    custrecord_scv_il_intmap_extsource_field, 
                    custrecord_scv_il_intmap_sqlquery, 

                FROM customrecord_scv_il_intmap
                WHERE isinactive = 'F' 
                    AND custrecord_scv_il_intmap_rectype = '${_rectype}'
                    AND custrecord_scv_il_intmap_autosyncrec = 'T'
                    AND custrecord_scv_il_intmap_priority <> 999`
            }).asMappedResults();

            return resultSQL[0] || {};
        }

        const getDataIlIntMapCloseValidationByType = (_rectype) => {
            if(!_rectype) return {};
            
            const resultSQL = query.runSuiteQL({
                query: `SELECT 
                    id, name, isinactive, custrecord_scv_il_intmap_recname, 
                    custrecord_scv_il_intmap_rectype, custrecord_scv_il_intmap_endpoint, 
                    BUILTIN.DF(custrecord_scv_il_intmap_action) as action_display,
                FROM customrecord_scv_il_intmap
                WHERE custrecord_scv_il_intmap_priority = 999 AND custrecord_scv_il_intmap_action = ${constIlIntAction.Records.CloseValidation.ID}
                AND custrecord_scv_il_intmap_rectype = '${_rectype}'`
            }).asMappedResults();

            return resultSQL[0] || {};
        }

        const createRecord = (obj) => {
            let ilIntMapRec = record.create({
                type: "customrecord_scv_il_intmap", isDynamic: true
            });

            for(let property in obj) {
                ilIntMapRec.setValue(property, obj[property]);
            }

            ilIntMapRec.save({enableSourcing: false, ignoreMandatoryFields: true});
        }

        return {
            Type: "customrecord_scv_il_intmap",
            Fields,
            Records,

            getDataRecordShowInSL,
            getDataIlIntMapById,
            getDataIlIntMapByRecType,
            getDataIlIntMapCloseValidationByType,

            createRecord
        };
    });
    