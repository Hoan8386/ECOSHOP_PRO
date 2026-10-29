/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  25 Aug 2026         Phu Pham			    Init, create file
 */
define([
    'N/query'
],
    function(
        query,
    ) {

        const TYPE = "country";
        
        const Fields = {
            ID: "id",
            UNIQUEKEY: "uniquekey",
            NAME: "name"
        };

        const getInfoCountryByUniqueKey = (uniquekey) => {
            if(!uniquekey) return {};

            let resultQuery = query.runSuiteQL({
                query: `SELECT 
                    id, uniquekey, name,
                    nationality, timezone, edition, deflocale
                FROM country
                WHERE uniquekey = ?`,
                params: [uniquekey]
            }).asMappedResults();
            
            return resultQuery[0] || {};
        }

        return {
            TYPE,
            Fields,

            getInfoCountryByUniqueKey,
        };
    });
    