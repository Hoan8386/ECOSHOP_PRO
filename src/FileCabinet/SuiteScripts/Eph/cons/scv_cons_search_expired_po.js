/**
 * Nội dung: 
 * Key:
 * =======================================================================================
 *  Date                Author                  Description
 *  04 June 2025        Khanh Tran			    Init, create file.
 */
define([
	'../cons/scv_cons_search.js',
],
function(
	constSearch
) {
	const ID = "customsearch_scv_check_expired_po";
	const TYPE = "purchaseorder";

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
		let objRes = constSearch.getObjResultFromSearchByKey(_objSearch, _myColumns, [
			"document_number", "verify_close", "closed_flag", "source_ext_id"
		]);

		objRes.internalid = _objSearch.id;
		return objRes;
	}
    return {
		ID,
		TYPE,
		RECORDS,
		getDataSource
    };
    
});
