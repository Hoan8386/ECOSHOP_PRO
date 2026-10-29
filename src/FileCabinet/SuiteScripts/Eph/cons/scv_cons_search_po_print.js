/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  25 Sep 2024         Khanh Tran              Init & create file
 */
define([
	'N/search',
],
function(
	search 
) {
	const ID = "customsearch_scv_po_print";

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
                objRes.tranid = objSearch.getValue(myColumns[1]);
                objRes.trandate = objSearch.getValue(myColumns[2]);
                objRes.seller_companyName = objSearch.getValue(myColumns[3]);
                objRes.seller_taxcode = objSearch.getValue(myColumns[4]);
                objRes.seller_add = objSearch.getValue(myColumns[5]);
                objRes.seller_tel = objSearch.getValue(myColumns[6]);
                objRes.seller_contact = objSearch.getValue(myColumns[7]);
                objRes.delivery_method = objSearch.getValue(myColumns[8]);
                objRes.delivery_time = objSearch.getValue(myColumns[9]);
                objRes.delivery_location_add = objSearch.getValue(myColumns[10]);
                objRes.note = objSearch.getValue(myColumns[11]);
                objRes.product = objSearch.getValue(myColumns[12]);
                objRes.unit = objSearch.getValue(myColumns[13]);
                objRes.rate = objSearch.getValue(myColumns[14]) * 1;
                objRes.qty = objSearch.getValue(myColumns[15]) * 1;
                objRes.amt = objSearch.getValue(myColumns[16]) * 1;
                objRes.total = objSearch.getValue(myColumns[17]) * 1;
                objRes.tax = objSearch.getValue(myColumns[18]) * 1;
                objRes.grandTotal = objSearch.getValue(myColumns[19]) * 1;
                objRes.seller_companyCode = objSearch.getValue(myColumns[20]);
                objRes.delivery_expDate = objSearch.getValue(myColumns[21]);
                objRes.delivery_paymenTerm = objSearch.getText(myColumns[22]);
                objRes.upccode = objSearch.getValue(myColumns[23]);
                objRes.supplier_barcode = objSearch.getValue(myColumns[24]);
                objRes.tax_rate = objSearch.getValue(myColumns[25]);
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
