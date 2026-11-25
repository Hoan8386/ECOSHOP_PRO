/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  27 May 2026         Phu Pham                Init & create file
 */
define([
    'N/query'
],  (
        query
    ) => {

        const TYPE = "ScriptRecordType";

        const queryAllDataSource = () => {
            const resultQuery = query.runSuiteQL({
                query: `SELECT 
                    deploymentname, name, internalid,
                    LOWER(skey) AS skey
                    FROM ${TYPE}`
            }).asMappedResults();
            
            return resultQuery;
        }

        return {
            TYPE,
            queryAllDataSource
        };
        
    });
    