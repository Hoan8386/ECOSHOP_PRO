/**
 * Nội dung: 
 * Key:
 * =======================================================================================
 *  Date                Author                  Description
 *  10 Jul 2024         Huy Pham			    Init, create file
 */
define([],
    function() {
        const TYPE = "custform";
        const FIELD = {
            ID: "id",
            INACTIVE: "isinactive",
            NAME: "name"
        }
    
        const SUBLIST = {
            
        }
    
        const RECORDS = {
            ADV_APPROVAL_FMS_SC: {
                ID: 177,
                NAME: "ADV Approval (FMS - SC) Form"
            },
            ADV_APPROVAL_FMS_GMS: {
                ID: 188,
                NAME: "ADV Approval (FMS - GMS) Form"
            },
            ADV_APPROVAL_SPOT: {
                ID: 164,
                NAME: "ADV Approval (Spot) Form"
            },
            ADV_APPROVAL_YEARLY: {
                ID: 176,
                NAME: "ADV Approval (Yearly) Form"
            },
        }
        return {
            TYPE,
            FIELD,
            SUBLIST,
            RECORDS
        };
        
    });
    