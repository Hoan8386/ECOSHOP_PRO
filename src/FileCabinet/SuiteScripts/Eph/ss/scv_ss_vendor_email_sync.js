/**
 * Nội dung: 
 * Key word:
 * =======================================================================================
 *  Date                Author                  Description
 *  09 May 2025		    Khanh Tran              Init & create file, from from ms.Thắm(https://app.clickup.com/t/86cy2tfde)
 */
/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/record', 'N/search', 'N/format',
    '../lib/scv_lib_function.js', 
    '../cons/scv_cons_search_merge_vendor_contact.js',
    '../cons/scv_cons_search_contact_update.js',
],
    /**
 * @param{record} record
 */
    (record, search, format,
        lbf,
        cSearchMergeVendContact,
        cSearchContact,
    ) => {

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {
            let curDate = lbf.getDateGMT(new Date().getTime(), 7);
            curDate = format.format({value: curDate, type: format.Type.DATE});
            let arrSSMergeVendContact = cSearchMergeVendContact.getDataSource([
                search.createFilter({name: 'date', join: 'systemNotes', operator: 'on', values: curDate})
            ]);log.error('arrSSMergeVendContact', arrSSMergeVendContact)

            if(arrSSMergeVendContact.length == 0) return;
            let vendorIds = [];
            for(let obj of arrSSMergeVendContact){
                if(!vendorIds.includes(obj.vendor_id)) vendorIds.push(obj.vendor_id)
            };

            let arrContact = cSearchContact.getDataSource([
                search.createFilter({name: 'company', operator: 'anyof', values: vendorIds})
            ]);


            for(let obj of arrSSMergeVendContact){
                let objContact = arrContact.find(e => e.company == obj.vendor_id);
                if(!objContact) break;

                let contacIds = objContact.contact_id.split("|");
                if(contacIds.length){
                    try {
                        record.submitFields({
                            type: 'vendor',
                            id: obj.vendor_id,
                            values: {
                                custentity_scv_contact: contacIds,
                                // custentity_scv_dup_check_cont: true
                            },
                            options: {enableSourcing: true, ignoreMandatoryFields: true}
                        })
                    } catch (error) {
                        log.error('submitFields-error', error )
                        log.error('custentity_scv_contact', contacIds )
                    }
                }
            }
        }

        return {execute}

    });
