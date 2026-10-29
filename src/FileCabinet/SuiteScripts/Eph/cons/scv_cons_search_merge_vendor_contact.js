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
    constSearch
) {
	const id = "customsearch_scv_merge_vendor_contact";
    const type = "vendor";

    const getDataSource = (_filters) =>{
		let resultSearch = constSearch.loadSearchWithFilter({id: id, type: type}, _filters);
		
		resultSearch = resultSearch.runPaged({pageSize: 1000});

		let arrResult = constSearch.fetchResultSearchAllPage(resultSearch, function(_obj, _column){
			return getObjResultFromSearch(_obj, _column);
		});

		return arrResult;
	}

    const getObjResultFromSearch = (_objSearch, _myColumns) =>{
		let objRes = constSearch.getObjResultFromSearchByKey(_objSearch, _myColumns, [
			"vendor_id",
			"name",
			"merge_information", 
            "merge_time",
		])

		return objRes;
	}

    return {
		id: id,
		type: type,
		getDataSource: getDataSource,
    };
    
});
