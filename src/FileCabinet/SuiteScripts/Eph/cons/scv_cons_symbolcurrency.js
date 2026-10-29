/**
 * Nội dung: 
 * Key:
 * =======================================================================================
 *  Date                Author                  Description
 *  26 Jun 2024         Huy Pham			    Init, create file
 */
define([
	'../cons/scv_cons_search.js',
],
function(
	constSearch
) {

	const TYPE = "customrecord_scv_symbol_currency";

	const FIELD = {
		ID: "id",
		INACTIVE: "isinactive",
		NAME: "name"
	}

	const SUBLIST = {
		
	}

	const RECORDS = {}

	const getDataSource = (_filters) => {
		let resultSearch =  constSearch.createSearchWithFilter({
			type: "customrecord_scv_symbol_currency",
			filters:
			[
				["isinactive","is","F"]
			],
			columns:
			[
				"internalid", "name",
				"custrecord_scv_sym_currency", "custrecord_scv_sym_symbol"
			]
		}, _filters);

		resultSearch = resultSearch.runPaged({pageSize: 1000});
		
		let arrResult = constSearch.fetchResultSearchAllPage(resultSearch, function(_obj, _column){
			let objRes = constSearch.getObjResultFromSearchByKey(_obj, _column, [
				"internalid", "name",
				"custrecord_scv_sym_currency", "custrecord_scv_sym_symbol"
			]);
			objRes.id = objRes.internalid;

			return objRes;
		});
		
		return arrResult;
	}

    return {
		TYPE,
		FIELD,
		SUBLIST,
		RECORDS,
		getDataSource
    };
    
});
