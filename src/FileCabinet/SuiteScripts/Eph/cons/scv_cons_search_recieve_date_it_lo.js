/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  04 Jun 2025         Phu Pham                Init, create file
 */
define([
	'N/search',
],
function(
	search 
) {
	const ID = "customsearch_scv_1st_recieve_date_it_lo";

	const RECORDS = {}

    const getDataSource = (_filters) =>{
		let resultSearch = search.load(ID);
		let myFilters = resultSearch.filters;
		let myColumns = resultSearch.columns;

		if(util.isArray(_filters)){
			_filters.forEach(_objFilter => myFilters.push(_objFilter));
		}
		else if(util.isObject(_filters) || typeof(_filters) == "object"){
			myFilters.push(_filters)
		}
		
		resultSearch = resultSearch.runPaged({pageSize: 1000});
		let arrResult = [];
        for(let i = 0; i < resultSearch.pageRanges.length; i++){
            let currentPageData = resultSearch.fetch({index : i});
            let currentPage = currentPageData.data;

            for(let idx = 0; idx < currentPage.length; idx++){
                let objRes = {};
                let objSearch = currentPage[idx];
                
                objRes.location_id = objSearch.getValue(myColumns[0]);
                objRes.location_nm = objSearch.getText(myColumns[0]);
                objRes.item_id = objSearch.getValue(myColumns[1]);
                objRes.item_nm = objSearch.getText(myColumns[1]);
                objRes.trandate = objSearch.getValue(myColumns[2]);

                arrResult.push(objRes);
            }
        }
		return arrResult;
	}

    return {
		ID: ID,
		TYPE: "purchaseorder",
		RECORDS: RECORDS,
		getDataSource: getDataSource
    };
    
});
