/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  13 May 2025         Phu Pham                Init, create file
 */
define([
	'N/search',
],
function(
	search 
) {
	const ID = "customsearch_scv_vendor_return_auth";

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
                
                objRes.subsidiary_nm = objSearch.getValue(myColumns[0]);
                objRes.subsidiary_cn = objSearch.getValue(myColumns[1]);
                objRes.subsidiary_tel = objSearch.getValue(myColumns[2]);
                objRes.subsidiary_fax = objSearch.getValue(myColumns[3]);
                objRes.vendor_name = objSearch.getValue(myColumns[4]);
                objRes.vendor_code = objSearch.getValue(myColumns[5]);
                objRes.vendor_address = objSearch.getValue(myColumns[6]);
                objRes.vendor_tel = objSearch.getValue(myColumns[7]);
                objRes.vendor_fax = objSearch.getValue(myColumns[8]);
                objRes.tranid = objSearch.getValue(myColumns[9]);
                objRes.trandate = objSearch.getValue(myColumns[10]);
                objRes.item_upccode = objSearch.getValue(myColumns[11]);
                objRes.memo = objSearch.getValue(myColumns[12]);
                objRes.quantity = objSearch.getValue(myColumns[13]) * 1;
                objRes.po_number = objSearch.getValue(myColumns[14]);

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
