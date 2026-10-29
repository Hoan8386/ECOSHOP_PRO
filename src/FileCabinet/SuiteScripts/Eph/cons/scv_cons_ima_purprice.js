/**
 * =======================================================================================
 *  Date                Author                  Description
 *  19 Jan 2026         Phu Pham			    Init, create file
 */
define([
    'N/query',
    './scv_cons_search.js',
    './scv_cons_appr_status.js',
],
    function(
        query,
        constSearch,
        constApprStatus,
    ) {

        const Type = "customrecord_scv_ima_pur_price";

        const Fields = {
            ID: "id", INACTIVE: "isinactive", NAME: "name"
        };

        const Sublist = {
            
        };

        const Records = {

        };

        const createSearchWithFilter = (_filters) =>{
            let resultSearch = constSearch.createSearchWithFilter({
                type: Type,
                filters: [
                    ["isinactive","is","F"], 
                ],
                columns: [
                    "internalid", "custrecord_scv_pur_price_rel_ima", "custrecord_scv_ima_pur_price_item", "custrecord_scv_ima_pur_price",
                    "custrecord_scv_ima_pur_price_eff_date", "custrecord_scv_ima_pur_price_loc", "custrecord_scv_ima_pur_price_app_price",
                    "custrecord_scv_ima_pur_price_status", { name: "custrecord_scv_ima_rel_item", join: "custrecord_scv_pur_price_rel_ima" }
                ]
            }, _filters);

            resultSearch = resultSearch.runPaged({pageSize: 1000});

            let arrResult = constSearch.fetchResultSearchAllPage(resultSearch, function(_objSearch, _column){
                let objRes = constSearch.getObjResultFromSearchByKey(_objSearch, _column, [
                    "internalid", "custrecord_scv_pur_price_rel_ima", "custrecord_scv_ima_pur_price_item", "custrecord_scv_ima_pur_price",
                    "custrecord_scv_ima_pur_price_eff_date", "custrecord_scv_ima_pur_price_loc", "custrecord_scv_ima_pur_price_app_price",
                    "custrecord_scv_ima_pur_price_status", "item"
                ]);

                return objRes;
            });

            return arrResult;
        }

        const getDataCurApplyPrice = (_params) => {
            // TODO: mandatory fields:
            // custrecord_scv_ima_pur_price_loc
            // custrecord_scv_pur_price_vendor
            // custrecord_scv_ima_pur_currency
            // custrecord_scv_ima_pur_price_item
            
            let sqlQuery = `SELECT
                id, custrecord_scv_pur_price_rel_ima, 
                custrecord_scv_ima_pur_price_eff_date, 
                custrecord_scv_ima_pur_price_item,
                custrecord_scv_pur_price_unit,
                custrecord_scv_ima_pur_price_loc,
                custrecord_scv_pur_price_vendor,
                custrecord_scv_ima_pur_currency,
                custrecord_scv_ima_pur_price
            FROM customrecord_scv_ima_pur_price
            WHERE isinactive = 'F' 
                AND (custrecord_scv_ima_pur_price_eff_date < TRUNC(CURRENT_DATE) + 1)
                AND custrecord_scv_ima_pur_price_app_price = 'T'
                AND custrecord_scv_ima_pur_price_status = ${constApprStatus.Records.Approved.ID}
                AND custrecord_scv_ima_pur_price_loc = ${_params.location}
                AND custrecord_scv_pur_price_vendor = ${_params.vendor}
                AND custrecord_scv_ima_pur_currency = ${_params.currency}
                AND custrecord_scv_ima_pur_price_item IN (${_params.item})`;

            if(!!_params.unit) {
                sqlQuery += ` \n AND custrecord_scv_pur_price_unit IN (${_params.unit})`
            }

            let resultQuery = query.runSuiteQL({
                query: sqlQuery
            }).asMappedResults();

            return resultQuery;
        }

        return {
            Type,
            Fields,
            Sublist,
            Records,

            createSearchWithFilter,
            getDataCurApplyPrice,
        };
    });
    