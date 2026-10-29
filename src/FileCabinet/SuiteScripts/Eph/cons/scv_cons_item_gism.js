/**
 * =======================================================================================
 *  Date                Author                  Description
 *  06 May 2026         Phu Pham                Init & create file
 */
define([
	'N/query',
],
function(
	query
) {
	const TYPE = 'customrecord_scv_ite_glo_ins_sys_mtn';
    const Records = {

    };

    const queryDataItemGISMByIMA = (imaId) => {
        if(!imaId) return [];

        let resultSQL = query.runSuiteQL({
            query: `SELECT id, custrecord_scv_ima_ite_ima_rel
            FROM customrecord_scv_ite_glo_ins_sys_mtn
            WHERE isinactive = 'F'
                AND custrecord_scv_ima_ite_ima_rel = ?`,
            params: [imaId]
        }).asMappedResults();

        return resultSQL;
    }

    return {
		TYPE,
        Records,

        queryDataItemGISMByIMA,
    };
    
});
