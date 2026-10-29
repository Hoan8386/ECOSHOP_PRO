/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  16 Jan 2026         Phu Pham			    Init, create file
 */
define([
    'N/query',
],
    function(
        query
    ) {

        const Type = "customrecord_scv_il_transactionstatus";

        const Fields = {
            ID: "id", INACTIVE: "isinactive", NAME: "name"
        };

        const Sublist = {
            
        };

        // table status cua il system
        const ILStatus = {
            Pending: { ID: "1", NAME: "Pending", },
            Approved: { ID: "2", NAME: "Approved", },
            PFS: { ID: "3", NAME: "Partially Fulfilled & Shipped", },
            FFS: { ID: "4", NAME: "Fully Fulfilled & Shipped", },
            Canceled: { ID: "5", NAME: "Canceled", },
            Closed: { ID: "6", NAME: "Closed", },
            Rejected: { ID: "7", NAME: "Rejected", },
        };

        const Records = {

        };

        const getILTranStatusByOrderStatus = (rectype, orderstatus) => {
            if(!rectype || !orderstatus) return "";

            const resultSQL = query.runSuiteQL({
                query: `SELECT id, custrecord_scv_il_tsm_ilstatus
                FROM customrecord_scv_il_transactionstatus
                WHERE custrecord_scv_il_tsm_rectype = '${rectype}'
                AND custrecord_scv_il_tsm_orderstatus = '${orderstatus}'
                ORDER BY id ASC`
            }).asMappedResults();

            return resultSQL?.[0]?.custrecord_scv_il_tsm_ilstatus || "";
        }
 
        return {
            Type, 
            Fields,
            Sublist,
            Records,
            ILStatus,

            getILTranStatusByOrderStatus,
        };
    });
    