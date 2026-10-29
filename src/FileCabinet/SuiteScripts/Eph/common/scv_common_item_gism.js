/**
 * Nội dung: 
 * Key word: 
 * =======================================================================================
 *  Date                Author                  Description
 *  10 Aug 2026         Phu Pham                Init, create file.
 */
/**
 * @NApiVersion 2.1
 */
define([
    'N/query',
],
    (
        query,
    ) => {

        const Warning = {
            DUPLICATE_RECORD: `Duplicate "Item Global Instance Sync Maintenance". Please select different "Item" and "Destination Origins".`
        };

        const beforeSubmit_WarnDuplicateRecord = (curRec) => {
            let item_related = curRec.getValue("custrecord_scv_ima_ite_item_rel");
            let des_origins = curRec.getValue("custrecord_scv_ite_des_origins");
            if(!item_related || !des_origins) return;
            
            const isExist = checkItemGismRecordExists(item_related, des_origins, curRec.id);
            if(isExist) {
                throw Warning.DUPLICATE_RECORD;
            } 
        }

        const checkItemGismRecordExists = (item_related, des_origins, item_gism_id) => {
            let strSqlQuery = `SELECT id
                FROM customrecord_scv_ite_glo_ins_sys_mtn
                WHERE isinactive = 'F' 
                    AND custrecord_scv_ima_ite_item_rel = ${item_related}
                    AND custrecord_scv_ite_des_origins = ${des_origins}\n`;
            
            if(!!item_gism_id) {
                strSqlQuery += ` AND id NOT IN (${item_gism_id})`;
            }
            // log.error("strSqlQuery", strSqlQuery);

            let resultSQL = query.runSuiteQL({
                query: strSqlQuery,
            }).asMappedResults();

            return resultSQL.length > 0;
        }

        return {
            beforeSubmit_WarnDuplicateRecord,
        }
    });
