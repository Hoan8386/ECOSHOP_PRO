/**
 * =======================================================================================
 *  Date                Author                  Description
 *  15 Jan 2026         Phu Pham			    Init, create file
 */
define([
    'N/query', 'N/search'
],
    function(query, search) {

        const Type = "customrecord_scv_item_ma";

        const Fields = {
            ID: "id",
            INACTIVE: "isinactive",
            NAME: "name"
        };

        const Sublist = {
            
        };

        const Records = {

        };

        const getInfoItemMAById = (_itemMAId) => {
            if(!_itemMAId) return [];

            const resultSQL = query.runSuiteQL({
                query: `SELECT id, name, custrecord_scv_boc_trade_type, custrecord_scv_ima_sup_barcode,
                    custrecord_scv_ima_unit_type, custrecord_scv_ima_app_status, custrecord_scv_ima_rel_item,
                    custrecord_scv_ima_sub, custrecord_scv_ima_tax_rate
                FROM ${Type}
                WHERE id IN (${_itemMAId.split(",").join(',')})
                ORDER BY id ASC`
            });
            return resultSQL.asMappedResults();
        }

        return {
            Type,
            Fields,
            Sublist,
            Records,
            getInfoItemMAById
        };
    });
    