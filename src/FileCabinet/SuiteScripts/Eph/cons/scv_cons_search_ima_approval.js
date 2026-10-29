/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  22 Dec 2025         Phu Pham                Init & create file
 */
define([
	'../cons/scv_cons_search.js'
],
function(
	constSearch
) {
	const ID = "customsearch_scv_ima_approval";
	const TYPE = "customrecord_scv_item_ma";

	const RECORDS = {}

	const getDataSource = (_filters) =>{
		let resultSearch = constSearch.loadSearchWithFilter(ID, _filters);
		
		resultSearch = resultSearch.runPaged({pageSize: 1000});

		let arrResult = constSearch.fetchResultSearchAllPage(resultSearch, function(_obj, _column){
			return getObjResultFromSearch(_obj, _column);
		});

		return arrResult;
	}

	const getDataSourceFetchPage = (_filters, _params) =>{
		let resultSearch = constSearch.loadSearchWithFilter(ID, _filters);
		
		resultSearch = resultSearch.runPaged({pageSize: 1000});

		let objRes = constSearch.fetchResultSearchPage(resultSearch, _params, function(_obj, _column){
			return getObjResultFromSearch(_obj, _column);
		})

		return objRes;
	}

	const getObjResultFromSearch = (_objSearch, _myColumns) =>{
		let objRes = constSearch.getObjResultFromSearchByKey(_objSearch, _myColumns,[
			"name", "related_item", "unit_type", "vendor", "allocation_type", "classification", 
			"country_origin", "date_control", "boc_grpcode_item", "in_child", 
			"item_type", "packing_uom_carton", "packing_uom_con_rate", 
			"shelf_life_days", "subsidiary", "tax_schedule", "boc_trade_type",
			"min_days_receive", "min_days_ship", "max_days_receive",
		]);
		
		objRes.internalid = _objSearch.id;
		return objRes;
	}
    return {
		ID,
		TYPE,
		RECORDS,
		getDataSource,
		getDataSourceFetchPage
    };
    
});
