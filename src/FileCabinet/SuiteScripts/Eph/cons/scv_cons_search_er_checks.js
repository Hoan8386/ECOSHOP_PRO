/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  06 Oct 2026         Phu Pham                Init & create file
 */
define([
	'../cons/scv_cons_search.js'
],
function(
	constSearch
) {
	const ID = "customsearch_scv_er_checks";
	const TYPE = "expensereport";

	const Records = {};

	const getDataSource = (_filters) =>{
		let resultSearch = constSearch.loadSearchWithFilter(ID, _filters);
		
		resultSearch = resultSearch.runPaged({pageSize: 1000});

		let arrResult = constSearch.fetchResultSearchAllPage(resultSearch, function(_obj, _column){
			return getObjResultFromSearch(_obj, _column);
		});

		return arrResult;
	}

	const getObjResultFromSearch = (_objSearch, _myColumns) =>{
		let objRes = constSearch.getObjResultFromSearchByKey(_objSearch, _myColumns,[
			"internalid", "tranid", "related_trans", "related_trans_no"
		]);
		return objRes;
	}
    return {
		ID,
		TYPE,
		Records,
		getDataSource,
    };
    
});
