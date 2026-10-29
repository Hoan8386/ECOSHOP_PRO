/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  07 May 2024	        Khanh Tran			    Init, create file
 */
define([],
    function() {
        const FIELD = {
            ID: "id",
            INACTIVE: "isinactive",
            NAME: "name"
        }
    
        const SUBLIST = {
            
        }
    
        const RECORDS = {
            PENDING_APPROVAL: {
                ID: 1,
                NAME: "Pending Approval"
            },
            APPROVED: {
                ID: 2,
                NAME: "Approved"
            },
            REJECTED: {
                ID: 3,
                NAME: "Rejected"
            }
        }
        return {
            TYPE: "ApprovalStatus",
            FIELD: FIELD,
            SUBLIST: SUBLIST,
            RECORDS: RECORDS
        };
        
    });
    