/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['../lib/scv_lib_einvoice'],

(libEinvVt) => {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    const beforeSubmit = (scriptContext) => {
    	let tgType = scriptContext.type;
    	if(tgType === 'create' || tgType === 'edit' || tgType === 'copy') {
    		let newRecord = scriptContext.newRecord;
            let domain = newRecord.getValue('custrecord_scv_ec_domain');
            let userpass = newRecord.getValue('custrecord_scv_ec_userpass');
            let taxCode = newRecord.getValue('custrecord_scv_ec_taxcode');
            if(domain) {
                let resultAccessToken = libEinvVt.getAccessToken(domain, userpass, taxCode);
                newRecord.setValue('custrecord_scv_ec_beartoken', resultAccessToken.accessToken);
                newRecord.setValue('custrecord_scv_ec_expires_in', resultAccessToken.expiresIn);
                newRecord.setValue('custrecord_scv_ec_longtime', new Date().getTime());
            }
    	}
    }
    
    return {
        beforeSubmit
    };
    
});
