/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
    'N/ui/message', 'N/url',
    '../cons/scv_cons_form.js',
],
    (
        message, url,
        constForm
    ) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */

        const onRequest = (scriptContext) => {
            constForm.setContext(scriptContext);
            constForm.createForm("Econnect Data - Bulk Service");

            let slurl = url.resolveScript({
                scriptId: 'customscript_scv_sl_econnect_service_v2',
                deploymentId: 'customdeploy_scv_sl_econnect_service_v2',
                returnExternalUrl: false,
            });
            let htmlMessage = `
                <span>
                    We’ve upgraded this feature to Version 2 with enhanced functionality. 
                    Click ${createTagLink(slurl, "Access")} to switch to the new Suitelet screen.
                </span>
            `;

            constForm.addPageInitMessage({
                type: message.Type.INFORMATION, message: htmlMessage, duration: -1
            });
            constForm.addButton({id: "custpage_btn_access", label: "Access", functionName: `window.location.replace('${slurl}')`});
            constForm.writePage();
        }

        const createTagLink = (urlLink, name) => {
            return `<a href="${urlLink}" style="color: #1e88e5; font-weight: bold;">${name}</a>`;
        }

        return {onRequest}

    });
