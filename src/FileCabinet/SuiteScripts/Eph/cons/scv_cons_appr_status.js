/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  19 Mar 2026	        Phu Pham			    Init, create file
 */
define([],
    function() {
        const Fields = {
            ID: "id",
            INACTIVE: "isinactive",
            NAME: "name"
        };
    
        const Sublist = {
            
        };
    
        const Records = {
            Open: {
                ID: 2,
                NAME: "Open",
            },
            PendingSupervisorApproval: {
                ID: 3,
                NAME: "Pending Supervisor Approval"
            },
            PendingManagerApproval: {
                ID: 4,
                NAME: "Pending Manager Approval"
            },
            Approved: {
                ID: 5,
                NAME: "Approved"
            },
            Rejected: {
                ID: 6,
                NAME: "Rejected"
            },
            Closed: {
                ID: 8,
                NAME: "Closed"
            },
            Cancelled: {
                ID: 9,
                NAME: "Cancelled"
            },
        }
        return {
            TYPE: "customrecord_scv_approval_status",
            Fields,
            Sublist,
            Records
        };
        
    });
    