/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  15 Sep 2026         Phu Pham			    Init, create file
 */
define([
    'N/query',
],
    function(
        query
    ) {

        const Records = {
            WorkOrder: {
                Planned: {
                    ID: "A",
                    NAME: "Planned"
                },
                Released: {
                    ID: "B",
                    NAME: "Released"
                },
            },
            ExpenseReport: {
                ApprovedByAccounting: {
                    ID: "F",
                    NAME: "Approved by Accounting"
                },
                ApprovedOverriddenByAccounting: {
                    ID: "G",
                    NAME: "Approved (Overridden) by Accounting"
                }
            },
        };

        const getDataRecordByRecType = (_rectype) => {
            let objRes = {};

            for(let key in Records) {
                if(key.toLowerCase() === _rectype.toLowerCase()) {
                    objRes = Records[key];
                    break;
                }
            }

            return objRes;
        }

        const getTranStatusByTranType = (trantype, trancustomtype = -1) => {
            if(!trantype) return [];

            const resultQuery = query.runSuiteQL({
                query: `SELECT * FROM transactionstatus
                WHERE trantype = '${trantype}' AND trancustomtype = ${trancustomtype}`
            });

            return resultQuery.asMappedResults();		
        }

        return {
            TYPE: "transactionstatus",
            Records,

            getDataRecordByRecType,
            getTranStatusByTranType,
        };
    });
    