/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  22 Dec 2025         Phu Pham			    Init, create file
 */
define([
    'N/query'
],
    function(
        query,
    ) {

        const TYPE = "customrecord_scv_country_of_ori";
        const FIELD = {
            ID: "id",
            INACTIVE: "isinactive",
            NAME: "name"
        };

        const queryCountryOriginByIds = (_ids) => {
            let resultQuery = query.runSuiteQL({
                query: `SELECT id, name, custrecord_scv_coo_country_code
                    FROM customrecord_scv_country_of_ori
                    WHERE id IN (${_ids})`
            }).asMappedResults();
            
            return resultQuery;
        }

        const getDataNonPrimaryCOO = () => {
            let resultQuery = query.runSuiteQL({
                query: `SELECT id, name, custrecord_scv_coo_country_code, custrecord_scv_ido_code
                    FROM customrecord_scv_country_of_ori
                    WHERE custrecord_scv_coo_isprimary = 'F'`
            }).asMappedResults();
            
            return resultQuery;
        }

        return {
            TYPE,
            FIELD,
            queryCountryOriginByIds,
            getDataNonPrimaryCOO,
        };
    });
    