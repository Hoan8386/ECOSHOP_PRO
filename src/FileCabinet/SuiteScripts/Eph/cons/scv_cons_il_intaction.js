/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  14 Apr 2026		    Phu Pham			    Init, create file
 */
define([],
    function(
    ) {
    
        const Records = {
            Create: {
                ID: 1,
                NAME: "Create"
            },
            CreateAndUpdate: {
                ID: 2,
                NAME: "Create/Update"
            },
            CloseValidation: {
                ID: 3,
                NAME: "Close Validation"
            }
        };

        return {
            Type: "customlist_scv_il_intaction",
            Records,
        };
        
    });
    