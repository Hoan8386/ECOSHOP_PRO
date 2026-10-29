/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  08 Jun 2026		    Phu Pham			    Init, create file
 */
define([],
    function(
    ) {
    
        const Records = {
            Pending: {
                ID: 1,
                NAME: "Pending"
            },
            Processing: {
                ID: 2,
                NAME: "Processing"
            },
            Success: {
                ID: 3,
                NAME: "Success"
            },
            PermanentFailed: {
                ID: 4,
                NAME: "Permanent Failed"
            },
        };

        return {
            Type: "customlist_scv_il_retry_status",
            Records,
        };
        
    });
    