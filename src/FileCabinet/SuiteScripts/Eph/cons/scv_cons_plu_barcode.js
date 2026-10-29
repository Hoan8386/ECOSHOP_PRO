/**
 * =======================================================================================
 *  Date                Author                  Description
 *  29 Apr 2025         Khanh Tran              Init & create file. Kiểm tra không tạo record khi trùng name from mr.Quân(https://app.clickup.com/t/86cyr4tc8)
 */
define([
	'N/query',
],
function(
	query
) {
	const TYPE = 'customrecord_scv_plu_barcode_no';

    const MESSAGE_DUPLICATE = 'Duplicate name, please enter a different name.';

    const updateInactiveName = (newRec) => {
        let name = newRec.getValue('name');
        if (!name) {
            return;
        }

        let isinactive = newRec.getValue('isinactive');
        if (isinactive && !name.endsWith('_Inactive')) {
            newRec.setValue({fieldId: 'name', value: `${name}_Inactive`});
            return;
        }

        if (!isinactive && name.includes('_Inactive')) {
            newRec.setValue({fieldId: 'name', value: name.replace(/_Inactive/g, '')});
        }
    };

    const isDuplicate = (newRec) => {
        let isinactive = newRec.getValue('isinactive');
        if (isinactive) {
            return false;
        }
        
        let name = newRec.getValue('name');
        if (!name) {
            return false;
        }

        let params = [name, newRec.id || 0];
        let queryStr =  `
            SELECT id
            FROM customrecord_scv_plu_barcode_no
            WHERE name = ?
            AND id <> ?
            AND isinactive = 'F'
            AND ROWNUM = 1
        `;
        let resultSQL = query.runSuiteQL({
            query: queryStr,
            params: params
        }).asMappedResults();

        return resultSQL.length > 0;
    };

    const queryDataPLUBarCodeByIMA = (imaId) => {
        if(!imaId) return [];

        let resultSQL = query.runSuiteQL({
            query: `SELECT id, name,
                custrecord_scv_plu_barcode_ima
            FROM customrecord_scv_plu_barcode_no
            WHERE custrecord_scv_plu_barcode_item IS NULL
                AND custrecord_scv_plu_barcode_ima = ?
                AND isinactive = 'F'`,
            params: [imaId]
        }).asMappedResults();

        return resultSQL;
    }

    return {
		TYPE,
        MESSAGE_DUPLICATE,

        updateInactiveName,
		isDuplicate,
        queryDataPLUBarCodeByIMA,
    };
    
});
