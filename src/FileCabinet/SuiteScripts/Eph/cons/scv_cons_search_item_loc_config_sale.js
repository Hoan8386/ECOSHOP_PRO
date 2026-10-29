/**
 * Nội dung:
 * =======================================================================================
 *  Date                	Author                  Description
 *  19 Jun 2025		    	Khanh Tran 				Init. Create file
 */
define([
    '../cons/scv_cons_search.js',
	
],
function(
    constSearch,
) {
	const ID = "customsearch_scv_item_loc_config_sale";
    const TYPE = "itemlocationconfiguration";

    const getDataSource = (_filters) =>{
		let resultSearch = constSearch.loadSearchWithFilter({id: ID, type: TYPE}, _filters);
		
		resultSearch = resultSearch.runPaged({pageSize: 1000});

		let arrResult = constSearch.fetchResultSearchAllPage(resultSearch, function(_obj, _column){
			return getObjResultFromSearch(_obj, _column);
		});

		return arrResult;
	}

    const getObjResultFromSearch = (_objSearch, _myColumns) =>{
		let objRes = constSearch.getObjResultFromSearchByKey(_objSearch, _myColumns, [
			"location",
			"item",
			"first_received_date",
			"first_sales_date",
		])

		return objRes;
	}

    return {
		ID: ID,
		TYPE: TYPE,
		getDataSource: getDataSource,
    };
    
});
