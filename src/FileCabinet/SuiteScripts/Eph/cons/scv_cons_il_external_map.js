/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  19 Mar 2026		    Phu Pham			    Init, create file
 */
define([
    'N/record', 'N/query',
],
    function(
        record, query,
    ) {
    
        const Records = {};

        const createILExternalMap = ({
            custrecord_scv_ilextmap_rectype = "",
            custrecord_scv_ilextmap_recid = "",
            custrecord_scv_ilextmap_id = ""
        }) =>{
            let ilExtMapRec = record.create({type: "customrecord_scv_il_external_map"});

            ilExtMapRec.setValue("custrecord_scv_ilextmap_rectype", custrecord_scv_ilextmap_rectype);
            ilExtMapRec.setValue("custrecord_scv_ilextmap_recid", custrecord_scv_ilextmap_recid);
            ilExtMapRec.setValue("custrecord_scv_ilextmap_id", custrecord_scv_ilextmap_id?.toString());

            let ilExtMapId = ilExtMapRec.save({enableSourcing: false, ignoreMandatoryFields: true});
            return ilExtMapId;
        }

        const getDataILExternalByRectype = (_rectype) => {
            if(!_rectype) return [];

            const resultQuery = query.runSuiteQL({
                query: `SELECT 
                    custrecord_scv_ilextmap_rectype,
                    custrecord_scv_ilextmap_recid,
                    custrecord_scv_ilextmap_id
                FROM customrecord_scv_il_external_map
                WHERE custrecord_scv_ilextmap_rectype = '${_rectype}' AND isinactive = 'F'`
            }).asMappedResults();
            
            return resultQuery;
        }

        const getDataObjILExternalMap = (_rectype, _extsourceid) => {
            if(!_rectype || !_extsourceid) return {};

            const resultQuery = query.runSuiteQL({
                query: `SELECT 
                    custrecord_scv_ilextmap_rectype,
                    custrecord_scv_ilextmap_recid,
                    custrecord_scv_ilextmap_id
                FROM customrecord_scv_il_external_map
                WHERE isinactive = 'F' AND custrecord_scv_ilextmap_rectype = '${_rectype}'
                    AND custrecord_scv_ilextmap_id = '${_extsourceid}'`
            }).asMappedResults();
            
            return resultQuery[0] || {};
        }

        return {
            Type: "customrecord_scv_il_external_map",
            Records,

            createILExternalMap,
            getDataILExternalByRectype,
            getDataObjILExternalMap,
        };
        
    });
    