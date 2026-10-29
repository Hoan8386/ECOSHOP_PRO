/**
 * Nội dung: 
 * Key word:
 * =======================================================================================
 *  Date                Author                  Description
 *  25 Mar 2025		    Phu Pham                Init, create file
 */
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
    'N/record', 'N/redirect', 
    '../common/scv_common_itg_econnect.js',
],
    (
        record, redirect, 
        commonItgEco,
    ) => {

        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (context) => {
            let request = context.request;
            let params = request.parameters;

            let objRes = commonItgEco.createAccessToken(params.recid);
            let expiry = new Date(objRes.expiry);

            record.submitFields({
                type: "customrecord_scv_itg_econnect_cfg",
                id: params.recid,
                values: {
                    custrecord_scv_itg_eco_cfg_access_token: objRes.token,
                    custrecord_scv_itg_eco_cfg_expired: expiry
                }
            });

            redirect.toRecord({
                type: params.rectype,
                id: params.recid
            });
        }

        return {onRequest}

    });
