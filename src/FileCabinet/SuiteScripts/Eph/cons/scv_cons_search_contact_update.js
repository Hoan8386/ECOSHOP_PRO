/**
 * Nội dung:
 * =======================================================================================
 *  Date                	Author                  Description
 *  09 May 2025		    	Khanh Tran 				Init. Create file
 */
define([
    '../cons/scv_cons_search.js',
	
],
function(
    constSearch,
) {
	const ID = "customsearch_scv_contact_update";
    const TYPE = "contact";

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
			"company",
			"contact_id",
		])

		return objRes;
	}

    return {
		ID: ID,
		TYPE: TYPE,
		getDataSource: getDataSource,
    };
    
});
