/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  09 May 2026         Phu Pham			    Init, create file
 */
define([
	'N/query',
],
function (
	query,
) {

	const Records = {

	};

	const getInternalIdByItemType = (_itemType) => {
		if(!_itemType) return "";

		const resultSQL = query.runSuiteQL({
			query: `SELECT id, name, internalid, sequence FROM itemtype
				WHERE id = '${_itemType}'`
		}).asMappedResults();

		return resultSQL?.[0]?.internalid || "";
	}

    return {
		TYPE: "account",
		Records,

		getInternalIdByItemType
    };
    
});
