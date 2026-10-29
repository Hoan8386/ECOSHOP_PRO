/**
 * Nội dung: 
 * Version: 1.260223.3
 * =======================================================================================
 *  Date                Author                  Description
 *  16 Oct 2025		    Huy Pham			    Init, create file
 */
define(['N/query'],
function(query) {
	const RECORDS = {}

	/**
	 * 
	 * @param {String} _suiteQL : Tham số sẽ nằm trong 2 ngoặc nhọn: {{params_name}}
	 * @returns {Array} : Trả về mảng các tham số không trùng lặp
	 */
	const extractQueryParams = (_suiteQL) => {
		let matches = [..._suiteQL.matchAll(/(?<!\{)\{\{\s*([^{}]+?)\s*\}\}(?!\})/g)];
		return [...new Set(matches.map(m => m[1]))];
	}

	/**
	 * 
	 * @param {String} _suiteQL 
	 * @param {Object} _params 
	 * @returns {String} : Trả về câu truy vấn đã thay thế tham số
	 */
	const combineQueryParams = (_suiteQL, _params) => {
		let new_suiteQL = _suiteQL;

		let arrKeyParams = extractQueryParams(_suiteQL);

		arrKeyParams.forEach(key => {
            new_suiteQL = new_suiteQL.replaceAll(`{{${key}}}`, _params[key] ?? "");
        });

		return new_suiteQL;
	}

	const executeSuiteQL = (_suiteQL, _params) => {
		let strQuery = combineQueryParams(_suiteQL, _params);

		let resultSearch = query.runSuiteQL({query: strQuery});

		return resultSearch.asMappedResults();
	}

	const fetchResultSearchPage = (_resultSearchFullPage, _params) =>{
		_params.rangePageFetch = Number(_params.rangePageFetch||1);
		_params.page = Number(_params.page||0);

		let arrResult = [];
		
		let ttlPage = _resultSearchFullPage.pageRanges.length;
		let idxPageFetched = _params.page;
		let maxPageFetch = _params.page + _params.rangePageFetch;

		for(let i = _params.page; i < _resultSearchFullPage.pageRanges.length; i++){
			if(i >= maxPageFetch){
				break;
			}
			idxPageFetched = i;
			
			let arrResult_Temp = _resultSearchFullPage.fetch(i).data.asMappedResults();

			arrResult = arrResult.concat(arrResult_Temp);
		}

		return {arrResult: arrResult, info: {page: idxPageFetched, ttlPage: ttlPage, rangePageFetch: _params.rangePageFetch}};
	}

	const fetchResultSearchAllPage = (_resultSearchFullPage) =>{
		let arrResult = [];

		for(let idxPage = 0; idxPage < _resultSearchFullPage.pageRanges.length; idxPage++){
			let arrResult_Temp = _resultSearchFullPage.fetch(idxPage).data.asMappedResults();
			
			arrResult = arrResult.concat(arrResult_Temp);
		}

		return arrResult;
	}

	const getDataSource = (_queryEditor) =>{
		let resultSuiteQL = query.runSuiteQLPaged({
            query: _queryEditor,
            pageSize: 1000
        });

		return fetchResultSearchAllPage(resultSuiteQL);
	}

	const getDataSourceFetchPage = (_queryEditor, _params = {
		rangePageFetch: 1, page: 0,
	}) =>{

		let resultSuiteQLPage = query.runSuiteQLPaged({
            query: _queryEditor,
            pageSize: 1000
        });

		return fetchResultSearchPage(resultSuiteQLPage, _params);
	}

    return {
		RECORDS,
		extractQueryParams,
		combineQueryParams,
		executeSuiteQL,

		fetchResultSearchPage,
		fetchResultSearchAllPage,
		
		getDataSource,
		getDataSourceFetchPage,
    };
    
});
