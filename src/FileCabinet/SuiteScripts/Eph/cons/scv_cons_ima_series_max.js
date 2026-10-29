/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  22 Dec 2025         Phu Pham			    Init, create file
 */
define([
    'N/search', 'N/record',
    '../cons/scv_cons_search.js',
],
    function(
        search, record,
        constSearch,
    ) {

        const TYPE = "customrecord_scv_ima_series_max";
        const FIELD = {
            ID: "id",
            INACTIVE: "isinactive",
            NAME: "name"
        };

        const getDataSource = (_filters) => {
            let resultSearch =  constSearch.createSearchWithFilter({
                type: TYPE,
                filters:
                [
                    ["isinactive","is","F"]
                ],
                columns:
                [
                    "internalid", "name", "custrecord_scv_ima_ser_num_fr",
                    "custrecord_scv_ima_ser_num_to", "custrecord_scv_ima_ser_last_ser_num",
                    "custrecord_scv_ima_ser_trad"
                ]
            }, _filters);
            
            let arrResult = constSearch.fetchResultSearchRunEach(resultSearch, function(_objTmpl, _column){
                let objResTmpl = constSearch.getObjResultFromSearchWithLabel_V2(_objTmpl, _column);

                return objResTmpl;
            });
            
            return arrResult;
        }

        const getDataSourceWithFilters = ({
            custrecord_scv_ima_ser_trad = "",
        }) =>{
            let filters = [];

            if(!!custrecord_scv_ima_ser_trad){
                filters.push(search.createFilter({
                    name: 'custrecord_scv_ima_ser_trad', 
                    operator: "anyof", 
                    values: custrecord_scv_ima_ser_trad
                }))
            }

            if(filters.length == 0) return [];

            return getDataSource(filters);
        }

        // Record duoc setup truoc khi tao Item vi vay chi can update field custrecord_scv_ima_ser_last_ser_num

        const updateCurrentLastSerNum = (_internalId, _curNumber) =>{
            record.submitFields({
                type: TYPE,
                id: _internalId,
                values: {
                    custrecord_scv_ima_ser_last_ser_num: _curNumber
                },
                options: {
                    enableSourcing: false, ignoreMandatoryFields: true
                }
            });
        }

        return {
            TYPE,
            FIELD,
            getDataSource,
            getDataSourceWithFilters,
            updateCurrentLastSerNum
        };
    });
    