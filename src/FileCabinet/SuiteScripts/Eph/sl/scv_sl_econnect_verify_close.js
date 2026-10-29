/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
    'N/redirect',
    '../common/scv_common_itg_econnect.js',
],
    (
        redirect,
        commonItgEco,
    ) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            let params = scriptContext.request.parameters;

            let data = {
                type: params.rectype,
                tranid: params.tranid,
                externalId: params.recid
            };

            // let auditId = commonItgEco.closeValidationTransaction(data);

            redirect.toRecord({
                type: params.rectype, id: params.recid,
                // parameters: { auditId: auditId }
            });
        }

        return {onRequest}

    });
