/**
 * =======================================================================================
 *  Date                Author                  Description
 *  15 Jan 2026         Phu Pham			    Init, create file
 */
define([
    'N/query', 'N/search',
    './scv_cons_appr_status.js',
    './scv_cons_item_ma.js',
    './scv_cons_search.js',
],
    function(
        query, search, 
        constApprStatus,
        constItemMA, 
        constSearch
    ) {

        const Type = "customrecord_scv_ima_sa_price";

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
                    "internalid", "custrecord_scv_price_list", "custrecord_scv_ima_sa_price_bf_tax",
                    "custrecord_scv_ima_sa_eff_date", "custrecord_scv_ima_sa_price_rel_ima", "custrecord_scv_ima_sa_price_item",
                    "custrecord_scv_ima_sa_currency", "custrecord_scv_ima_sa_applied", "custrecord_scv_ima_sale_price_status",
                    { name: "custrecord_scv_ima_rel_item", join: "custrecord_scv_ima_sa_price_rel_ima" }
                ]
            }, _filters);

            resultSearch = resultSearch.runPaged({pageSize: 1000});

            let arrResult = constSearch.fetchResultSearchAllPage(resultSearch, function(_objSearch, _column){
                let objRes = constSearch.getObjResultFromSearchByKey(_objSearch, _column, [
                    "internalid", "custrecord_scv_price_list", "custrecord_scv_ima_sa_price_bf_tax",
                    "custrecord_scv_ima_sa_eff_date", "custrecord_scv_ima_sa_price_rel_ima", "custrecord_scv_ima_sa_price_item",
                    "custrecord_scv_ima_sa_currency", "custrecord_scv_ima_sa_applied", "custrecord_scv_ima_sale_price_status",
                    "item"
                ]);

                return objRes;
            });

            return arrResult;
        }

        const getDataCurApplyPrice = (_item, _arrCurrency, _arrPriceLevel) => {
            // TODO: mandatory fields:
            // custrecord_scv_ima_sa_price_item
            // custrecord_scv_ima_sa_currency
            // custrecord_scv_price_list
            
            let sqlQuery = `SELECT 
                id, custrecord_scv_ima_sa_price_rel_ima,
                custrecord_scv_ima_sa_price_item,
                custrecord_scv_ima_sa_eff_date,
                custrecord_scv_ima_sale_price_status,
                custrecord_scv_ima_sa_applied,
                custrecord_scv_ima_sa_currency,
                custrecord_scv_price_list
            FROM customrecord_scv_ima_sa_price
            WHERE (custrecord_scv_ima_sa_eff_date < TRUNC(CURRENT_DATE) + 1)
                AND custrecord_scv_ima_sa_applied = 'T'
                AND custrecord_scv_ima_sale_price_status = ${constApprStatus.Records.Approved.ID}
                AND custrecord_scv_ima_sa_price_item = ${_item}
                AND custrecord_scv_ima_sa_currency IN (${_arrCurrency.join(", ")})
                AND custrecord_scv_price_list IN (${_arrPriceLevel.join(", ")})`;

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
            getDataCurApplyPrice
        };
    });
    