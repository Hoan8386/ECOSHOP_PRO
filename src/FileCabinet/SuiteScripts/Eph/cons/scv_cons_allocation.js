/**
 * Nội dung: 
 * Key:
 * =======================================================================================
 *  Date                Author                  Description
 *  17 Jun 2024         Huy Pham			    Init, create file
 */
define([],
    function() {
        const TYPE = "customlist_scv_allocation";
        const FIELD = {
            ID: "id",
            INACTIVE: "isinactive",
            NAME: "name"
        }
    
        const SUBLIST = {
            
        }
    
        const RECORDS = {
            UNIT_PRICE: {
                ID: 1,
                NAME: "Unit Price"
            },
            QUANTITY: {
                ID: 2,
                NAME: "Quantity"
            }
        }
        return {
            TYPE,
            FIELD,
            SUBLIST,
            RECORDS
        };
        
    });
    