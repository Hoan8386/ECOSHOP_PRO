/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  22 Apr 2024         Huy Pham                Init & create file, Phiếu nhập kho, from HFM, from ms.Thắm(https://app.clickup.com/t/86cv4236n)
 */
define(['N/search',
	'../cons/scv_cons_search.js',
],
function(search,
	constSearch
) {
	const ID = "customsearch_scv_itf_itr_cost";

	const RECORDS = {
		type: "transaction",
		title: "SCV ITF, ITR cost (Don't edit)",
		id: "customsearch_scv_itf_itr_cost",
		isPublic: true,
		//settings:[{"name":"consolidationtype","value":"ACCTTYPE"}],
		filters:
		[
			["item.type","anyof","Assembly","InvtPart"], 
			"AND", 
			["posting","is","T"], 
			"AND", 
			["formulanumeric: case when {location.id} = {item.inventorylocation.id} then 1 else 0 end","equalto","1"], 
			"AND", 
			["formulanumeric: case when ({quantity} !=0) then 1 else 0 end","equalto","1"], 
			"AND", 
			["type","anyof","Build","Unbuild","VendBill","VendCred","VendPymt","BinWksht","BinTrnfr","CuTrPrch107","CuTrPrch114","CuTrSale113","CashRfnd","CashSale","CardRfnd","Check","Custom111","CardChrg","CustCred","FxReval","CustDep","CustRfnd","Deposit","DepAppl","DeprCust","Estimate","ExpRept","Custom102","FinChrg","Custom104","Custom105","Custom106","Custom101","InbShip","InvAdjst","InvCount","InvDistr","InvTrnfr","InvWksht","CustInvc","ItemShip","ItemRcpt","Journal","Custom109","CuTrPrch110","Custom103","CuTrPrch115","Opprtnty","OwnTrnsf","CustPymt","CuTrPrch100","PurchOrd","RtnAuth","SalesOrd","TaxPymt","CustChrg","CuTrSale112","SysJrnl","Transfer","TrnfrOrd","VPrep","VPrepApp","VendAuth","WorkOrd","WOClose","WOCompl","WOIssue"], 
			"AND", 
			["mainline","is","F"], 
			"AND", 
			["taxline","is","F"], 
			"AND", 
			["formulanumeric: Case when ({type} = 'Inventory Adjustment' or {type} = 'Inventory Transfer' or {type} = 'Item Receipt' or {type} = 'Work Order Completion' or {type} = 'Assembly Build' or {type} = 'Assembly Unbuild' or ({type} = 'Bill' and {accounttype} like '%Asset')) and nvl({serialnumberquantity},{quantity}) >0 then 1 when ({type} = 'Inventory Adjustment' or {type} = 'Inventory Transfer' or ({type} = 'Item Fulfillment' and {status} IN ('Shipped','Shipping')) or {type} = 'Work Order Completion' or {type} = 'Work Order Issue' or {type} = 'Assembly Build' or {type} = 'Assembly Unbuild' or ({type} = 'Invoice' and {accounttype} like '%Asset')) and nvl({serialnumberquantity},{quantity}) <0 then 1 else 0 end","equalto","1"], 
			"AND", 
			["formulanumeric: case when {ACCOUNT.ID} is not null then 1 else 0 end","equalto","1"]
		],
		columns:
		[
			search.createColumn({name: "tranid", label: "Document Number"}),
			search.createColumn({name: "subsidiarynohierarchy", label: "Subsidiary"}),
			/* search.createColumn({
				name: "formulatext",
				formula: "''",
				label: "Subsidiary"
			}), */
			search.createColumn({name: "location", label: "Location"}),
			search.createColumn({
				name: "formulanumeric",
				formula: "(rownum)",
				label: "STT"
			}),
			search.createColumn({name: "trandate", label: "Ngày"}),
			search.createColumn({
				name: "formulatext",
				formula: "(Case when ({type} = 'Inventory Adjustment' or {type} = 'Inventory Transfer' or {type} = 'Item Receipt' or {type} = 'Work Order Completion' or {type} = 'Assembly Build' or {type} = 'Assembly Unbuild' or ({type} = 'Bill' and {accounttype} like '%Asset')) and nvl({serialnumberquantity},{quantity}) >0 then NVL({number},{custbody_scv_doc_number}) else '' end)",
				label: "Phiếu nhập"
			}),
			search.createColumn({
				name: "formulatext",
				formula: "(Case when ({type} = 'Inventory Adjustment' or {type} = 'Inventory Transfer' or ({type} = 'Item Fulfillment' and {status} IN ('Shipped','Shipping')) or {type} = 'Work Order Completion' or {type} = 'Work Order Issue' or {type} = 'Assembly Build' or {type} = 'Assembly Unbuild' or ({type} = 'Invoice' and {accounttype} like '%Asset')) and nvl({serialnumberquantity},{quantity}) <0 then NVL({number},{custbody_scv_doc_number}) else '' end)",
				label: "Phiếu xuất"
			}),
			search.createColumn({
				name: "upccode",
				join: "item",
				label: "Item : UPC Code"
			}),
			search.createColumn({name: "item", label: "Item"}),
			search.createColumn({
				name: "stockunit",
				join: "item",
				label: "ĐVT"
			}),
			search.createColumn({
				name: "formulanumeric",
				formula: "(Case when ({type} = 'Inventory Adjustment' or {type} = 'Inventory Transfer' or {type} = 'Item Receipt' or {type} = 'Work Order Completion' or {type} = 'Assembly Build' or {type} = 'Assembly Unbuild' or ({type} = 'Bill' and {accounttype} like '%Asset')) and nvl({serialnumberquantity},{quantity}) >0 then nvl({serialnumberquantity},{quantity}) end)",
				label: "Lượng nhập"
			}),
			search.createColumn({
				name: "formulanumeric",
				formula: "(Case when ({type} = 'Inventory Adjustment' or {type} = 'Inventory Transfer' or ({type} = 'Item Fulfillment' and {status} IN ('Shipped','Shipping')) or {type} = 'Work Order Completion' or {type} = 'Work Order Issue' or {type} = 'Assembly Build' or {type} = 'Assembly Unbuild' or ({type} = 'Invoice' and {accounttype} like '%Asset')) and nvl({serialnumberquantity},{quantity}) <0 then nvl({serialnumberquantity},{quantity}) else 0 end)",
				label: "Lượng xuất"
			}),
			search.createColumn({name: "type", label: "Type"}),
			search.createColumn({
				name: "formulatext",
				formula: "NVL({custbody_scv_memo2},{memomain})",
				label: "Diễn giải"
			}),
			search.createColumn({
				name: "formulanumeric",
				formula: "{rate}",
				label: "Đơn giá"
			}),
			search.createColumn({
				name: "formulanumeric",
				formula: "Case when ({type} = 'Inventory Adjustment' and {quantity} = 0 and {amount} = 0 and {costestimaterate} > 0) then {costestimaterate} when ({type} = 'Inventory Adjustment' or {type} = 'Inventory Transfer' or {type} = 'Item Receipt' or {type} = 'Work Order Completion' or {type} = 'Assembly Build' or {type} = 'Assembly Unbuild' or ({type} = 'Bill' and {accounttype} like '%Asset')) and {quantity} >0 then {amount} else 0 end",
				label: "Thành tiền nhập"
			}),
			search.createColumn({
				name: "formulanumeric",
				formula: "abs(Case when ({type} = 'Inventory Adjustment' and {quantity} = 0 and {amount} = 0 and {costestimaterate} < 0) then {costestimaterate}  when ({type} = 'Inventory Adjustment' or {type} = 'Inventory Transfer' or ({type} = 'Item Fulfillment' and {status} != 'Picked') or {type} = 'Work Order Completion' or {type} = 'Work Order Issue' or {type} = 'Assembly Build' or {type} = 'Assembly Unbuild' or ({type} = 'Invoice' and {accounttype} like '%Asset')) and {quantity} <=0 then nvl({amount},{costestimaterate}) else 0 end)",
				label: "Thành tiền xuất"
			}),
			search.createColumn({
				name: "formulacurrency",
				formula: "abs(nvl({amount},0))",
				label: "Thành tiền"
			}),
			search.createColumn({name: "custcol_scv_origin_line_num", label: "Original Line Id"}),
			/* search.createColumn({
				name: "formulatext",
				formula: "''",
				label: "Original Line Id"
			}), *///Meg not use custcol_scv_origin_line_num
			search.createColumn({
				name: "formulatext",
				formula: "{account.id}",
				label: "{account.id}"
			}),
			search.createColumn({
				name: "formulatext",
				formula: "{item.assetaccount.id}",
				label: "Formula (Text)"
			}),
			search.createColumn({name: "accountmain", label: "Account (Main)"}),
			search.createColumn({name: "account", label: "Account"}),
			search.createColumn({
				name: "assetaccount",
				join: "item",
				label: "Asset Account"
			}),
			search.createColumn({
				name: "number",
				join: "account",
				label: "Account Number"
			})
		]

	}

	const getDataSource = (_filters) =>{
		//let resultSearch = constSearch.loadSearchWithFilter(ID, _filters, RECORDS);
		let resultSearch = constSearch.loadSearchWithFilter(ID, _filters, RECORDS);(RECORDS, _filters);
		resultSearch = resultSearch.runPaged({pageSize: 1000});

		let arrResult = constSearch.fetchResultSearchAllPage(resultSearch, function(_obj, _column){
			return getObjResultFromSearch(_obj, _column);
		});

		return arrResult;
	}

	const getDataSourceFetchPage = (_filters, _params) =>{
		let resultSearch = constSearch.loadSearchWithFilter(ID, _filters, RECORDS);
		
		resultSearch = resultSearch.runPaged({pageSize: 1000});

		let objRes = constSearch.fetchResultSearchPage(resultSearch, _params, function(_obj, _column){
			return getObjResultFromSearch(_obj, _column);
		})

		return objRes;
	}

	const getObjResultFromSearch = (_objSearch, _myColumns) =>{
		let objRes = {};
		objRes.doc_no = _objSearch.getValue(_myColumns[0])
		objRes.item_id = _objSearch.getValue(_myColumns[8])
		objRes.item_nm = _objSearch.getText(_myColumns[8])
		objRes.rate = _objSearch.getValue(_myColumns[14]) * 1
		objRes.amount_in = _objSearch.getValue(_myColumns[15]) * 1
		objRes.amount_out = _objSearch.getValue(_myColumns[16]) * 1
		objRes.amount = _objSearch.getValue(_myColumns[17]) * 1
		objRes.ori_line_num = _objSearch.getValue(_myColumns[18])
		objRes.account_number = _objSearch.getValue(_myColumns[24])

		return objRes;
	}

    return {
		ID: ID,
		TYPE: "transaction",
		RECORDS: RECORDS,
		getDataSource: getDataSource,
		getDataSourceFetchPage: getDataSourceFetchPage
    };
    
});
