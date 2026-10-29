/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  18 Apr 2026         Phu Pham			    Init, create file
 */
define([
    'N/query',
],
    function(
        query
    ) {

        const Type = "customrecord_scv_il_itemtype";

        const Fields = {
            ID: "id", INACTIVE: "isinactive", NAME: "name"
        };

        const Records = {

        };

        const getILItemTypeByTypeId = (_typeId) => {
            if(!_typeId) return "";

            const resultSQL = query.runSuiteQL({
                query: `SELECT 
                    id, name,
                    custrecord_scv_il_ns_itemtype_id,
                    custrecord_scv_il_itemtype_map
                FROM customrecord_scv_il_itemtype
                WHERE custrecord_scv_il_ns_itemtype_id = '${_typeId}' AND isinactive = 'F'`
            }).asMappedResults();

            return resultSQL?.[0]?.custrecord_scv_il_itemtype_map || "";
        }
 
        return {
            Type, 
            Fields,
            Records,

            getILItemTypeByTypeId,
        };
    });
    