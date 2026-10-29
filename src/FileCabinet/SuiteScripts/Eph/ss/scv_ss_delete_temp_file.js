/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define([
    'N/file', 'N/query',
    '../cons/scv_cons_datastore.js',
],
    (
        file, query,
        constDataStore,
    ) => {

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {
            let folderId = constDataStore.getFolderIdByName(constDataStore.RECORDS.Folder.IMA.NAME);
            const arrResult = getDataTempFileByFolder([folderId]);
            log.error("total temp files delete", arrResult.length);

            for(let obj of arrResult) {
                try {
                    file.delete({ id: obj.id });
                } catch (err) {
                    log.error("DELETE FILE ERROR: ", obj.id);
                }
            }
        }

        const getDataTempFileByFolder = (arrFolder) => {
            if(arrFolder.length === 0) return [];

            const resultQuery = query.runSuiteQL({
                query: `SELECT 
                    id, name, createddate, isinactive
                FROM file
                WHERE folder IN (${arrFolder.join(", ")})
                    AND isinactive = 'F'
                    AND (createddate <= TRUNC(CURRENT_DATE) - 7)`
            }).asMappedResults();

            return resultQuery;
        }

        return {execute}

    });
