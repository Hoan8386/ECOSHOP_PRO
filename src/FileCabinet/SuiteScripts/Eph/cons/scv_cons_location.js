/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  22 Apr 2024         Huy Pham			    Init, create file
 */
define(['N/query', 'N/runtime',
	'../cons/scv_cons_record.js'
],
function(query, runtime,
	constRecord
	) {
	const FIELD = {
		ID: "id",
		INACTIVE: "isinactive",
		NAME: "name"
	}

	const SUBLIST = {
		
	}

	const RECORDS = {
		
	}

	const getInfoLocationById = (_locationsId) => {
		if(!_locationsId) return [];

		var resultSQL = query.runSuiteQL({
			query: `SELECT id, name, fullname, mainaddress, BUILTIN.DF(mainaddress) as mainaddress_display
			FROM location
			where id IN (${_locationsId.toString()})
			order by id asc`
		});
		return resultSQL.asMappedResults();
	}

	/*
	LOTNUMBEREDINVENTORY
	INVENTORY
	INVENTORYCOUNT
	INVENTORYSTATUS
	SERIALIZEDINVENTORY
	ADVBINSERIALLOTMGMT
	ADVINVENTORYMGMT
	BINMANAGEMENT
	*/
	const isInventory = () =>{
		let isValid = true;
		try{
			//in server
			isValid = runtime.isFeatureInEffect({feature:'INVENTORY'})
		}catch(err){
			//in Client
			isValid = _dynamicData.reflet.features.INVENTORY == 'INVENTORY' ? true : false;
		}

		return isValid;
	}

	const isLotNumberInventory = () =>{
		let isValid = true;
		try{
			//in server
			isValid = runtime.isFeatureInEffect({feature:'LOTNUMBEREDINVENTORY'})
		}catch(err){
			//in Client
			isValid = _dynamicData.reflet.features.LOTNUMBEREDINVENTORY == 'LOTNUMBEREDINVENTORY' ? true : false;
		}

		return isValid;
	}

	const isBinManagement = () =>{
		let isValid = true;
		try{
			//in server
			isValid = runtime.isFeatureInEffect({feature:'BINMANAGEMENT'})
		}catch(err){
			//in Client
			isValid = _dynamicData.reflet.features.BINMANAGEMENT == 'BINMANAGEMENT' ? true : false;
		}

		return isValid;
	}

	const getDataSourceByCriteriaQuery = (_objDataFilter) => {
		let query_where = `WHERE isinactive = 'F' `;

		if(!!_objDataFilter.cseg_scv_subsidiary?.toString()){
			query_where += ` AND cseg_scv_subsidiary IN (${_objDataFilter.cseg_scv_subsidiary.toString().split(",").join(",")}) `
		}else{
			return [];
		}

		if(!!_objDataFilter.cseg_scv_bu_center?.toString()){
			query_where += ` AND cseg_scv_bu_center IN (${_objDataFilter.cseg_scv_bu_center.toString().split(",").join(",")}) `
		}

		var resultQuery = query.runSuiteQL({
			query: `SELECT id, name
			FROM location
			${query_where}`
		});

		let arrResult = resultQuery.asMappedResults();
		
		return arrResult;
	}

	const initLoadFieldByCriteriaQuery = (_field, _objDataFilter, _hasNull = true) =>{
		let arrResult = getDataSourceByCriteriaQuery(_objDataFilter);

		constRecord.initLoadField(_field, {data: arrResult}, _hasNull);

		return arrResult;
	}

    return {
		TYPE: "location",
		FIELD: FIELD,
		SUBLIST: SUBLIST,
		RECORDS: RECORDS,
		getInfoLocationById,
		isInventory,
		isLotNumberInventory,
		isBinManagement,
		getDataSourceByCriteriaQuery,
		initLoadFieldByCriteriaQuery
    };
    
});
