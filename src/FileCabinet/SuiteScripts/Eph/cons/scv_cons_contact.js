/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  28 Jun 2024         Huy Pham                Init & create file
 */
define(['N/record', 'N/search',
    '../lib/scv_lib_function.js'
],
    function(record, search,
        lbf,
    ) {
        const TYPE = "contact";
        const FIELD = {
            ID: "id",
            INACTIVE: "isinactive",
        }
    
        const SUBLIST = {
            
        }
    
        const RECORDS = {
            
        }

        const addContactEmailToVendor = (curRec) =>{
            let companyId = curRec.getValue('company');log.error('companyId', companyId)
            if(!companyId || lbf.getEntityType(companyId) != 'vendor') return;

            let lkVendor = search.lookupFields({
                type: 'vendor',
                id: companyId,
                columns: ['custentity_scv_contact']
            });log.error('lkVendor', lkVendor)

            let contactEmail = [];
            for(let obj of lkVendor.custentity_scv_contact){
                if(obj.value == curRec.id) return;

                contactEmail.push(obj.value * 1);
            }

            contactEmail.push(curRec.id);
            record.submitFields({
                type: 'vendor',
                id: companyId,
                values: {
                    custentity_scv_contact: contactEmail
                },
                options: {enableSourcing: true, ignoreMandatoryFields: true}
            })
        }

        return {
            TYPE,
            FIELD,
            SUBLIST,
            RECORDS,
            addContactEmailToVendor
            
        };
        
    });
    