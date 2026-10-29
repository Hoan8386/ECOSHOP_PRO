/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  29 Jun 2026         Phu Pham                Init & create file
 */
define([
	'N/search',
	'../cons/scv_cons_search.js',
],
function(
	search,
	constSearch,
) {
	const ID = "customsearch_scv_count_intqueue_bystatus";
	const RECORDS = {};

	const getDataSource = (_filters) => {
        return constSearch.getDataSource_Mixed({
            id: ID,
        }, _filters, [], RECORDS);
	}

	const getDataSourceFetchPage = (_params, _filters) =>{
		return constSearch.getDataSourceFetchPage_Mixed(ID, _filters, _params, [], RECORDS);
	}

    return {
		ID,
		TYPE: "customrecord_scv_il_integration_queue",
		RECORDS,
		getDataSource,
		getDataSourceFetchPage
    };
    
});
