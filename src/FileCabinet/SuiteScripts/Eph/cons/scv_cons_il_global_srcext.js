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

        const createILGlobalSrcExt = (data) => {
            const ilGlobalSrcRec = record.create({
                type: "customrecord_scv_il_global_src_ext",
            });

            for(let property in data) {
                ilGlobalSrcRec.setValue(property, data[property]);
            }

            let recordId = ilGlobalSrcRec.save();
            return recordId;
        }

        const updateILGlobalSrcExt = (_recid, _objNewUom) => {
            if(!_recid || !_objNewUom) return;
            
            record.submitFields({
                type: "customrecord_scv_il_global_src_ext", id: _recid,
                values: {
                    custrecord_scv_ilglobal_srcext_id: _objNewUom.sourceexternalid.toString(),
                },
                options: {
                    enableSourcing: false, ignoreMandatoryFields: true
                }
            });
        }

        const getDataExistILGlobalSrcExt = (_rectype, _recid) => {
            if (!_rectype || !_recid) return {};

            const queryStr = `
                SELECT 
                    id,
                    custrecord_scv_ilglobal_srcext_rectype,
                    custrecord_scv_ilglobal_srcext_recid,
                    custrecord_scv_ilglobal_srcext_id
                FROM customrecord_scv_il_global_src_ext
                WHERE custrecord_scv_ilglobal_srcext_rectype = ?
                    AND custrecord_scv_ilglobal_srcext_recid = ?
                    AND isinactive = 'F'
            `;

            const resultQuery = query.runSuiteQL({
                query: queryStr,
                params: [_rectype, _recid]
            }).asMappedResults();

            return resultQuery[0] || {};
        }

        const getDataILGlobalSrcExtByParent = (_recid, _parentField) => {
            if (!_recid || !_parentField) return [];

            const queryStr = `
                SELECT 
                    custrecord_scv_ilglobal_srcext_unittype,
                    custrecord_scv_ilglobal_srcext_rectype,
                    custrecord_scv_ilglobal_srcext_recid,
                    custrecord_scv_ilglobal_srcext_id
                FROM customrecord_scv_il_global_src_ext
                WHERE ${_parentField} = ?
                AND isinactive = 'F'
            `;

            const resultQuery = query.runSuiteQL({
                query: queryStr,
                params: [_recid]
            }).asMappedResults();

            return resultQuery;
        };

        const getSourceExtByMappingIL = (_rectype, _recid) => {
            if (!_rectype || !_recid) return "";

            const queryStr = `
                SELECT 
                    custrecord_scv_ilglobal_srcext_rectype,
                    custrecord_scv_ilglobal_srcext_recid,
                    custrecord_scv_ilglobal_srcext_id
                FROM customrecord_scv_il_global_src_ext
                WHERE custrecord_scv_ilglobal_srcext_rectype = ?
                    AND custrecord_scv_ilglobal_srcext_recid = ?
                    AND isinactive = 'F'
            `;

            const resultQuery = query.runSuiteQL({
                query: queryStr,
                params: [_rectype, _recid]
            }).asMappedResults();

            return resultQuery?.[0]?.custrecord_scv_ilglobal_srcext_id || "";
        }

        return {
            Type: "customrecord_scv_il_global_src_ext",
            Records,

            getDataExistILGlobalSrcExt,
            createILGlobalSrcExt,
            updateILGlobalSrcExt,
            
            getDataILGlobalSrcExtByParent,
            getSourceExtByMappingIL,
        };
        
    });
    