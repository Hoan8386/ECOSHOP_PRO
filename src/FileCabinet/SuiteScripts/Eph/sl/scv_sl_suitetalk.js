/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
    'N/ui/serverWidget', 'N/runtime', 'N/ui/message', 'N/url',
    '../cons/scv_cons_swagger.js', 
],
    (
        serverWidget, runtime, message, url,
        constSwagger,
    ) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */

        const CurScript = {
            ID: "customscript_scv_sl_suitetalk",
            DEPLOYID_UI: "customdeploy_scv_sl_suitetalk",
        };

        const onRequest = (scriptContext) => {
            let request = scriptContext.request;
            let params = request.parameters;
            let response = scriptContext.response;
            
            if(request.method == "GET"){
                const form = onCreateFormUI(params);
                if(params.isrun === "T") {
                    onRenderSwaggerUI(form, params);
                }
                response.writePage(form);
            }
        }

        const onCreateFormUI = (params) => {
            let mainForm = serverWidget.createForm({title: "Suitetalk API Documents"});
            mainForm.clientScriptModulePath = '../cssl/scv_cs_sl_suitetalk.js';

            mainForm.addButton({ id: "custpage_btn_search", label: "Search", functionName: "onSearchResult()" });
            mainForm.addButton({ id: "custpage_btn_documents", label: "Documents", functionName: "onViewDocuments()" });
            if(!params["ns-at"]) {
                mainForm.addButton({ id: "custpage_btn_extaccessurl", label: "Access URL (without NetSuite login)", functionName: "onExtAccessUrl()" });
            }

            // get url
            let extUrlScript = url.resolveScript({ scriptId: CurScript.ID, deploymentId: CurScript.DEPLOYID_UI, returnExternalUrl: true });
            let curUrlScript = url.resolveScript({ scriptId: CurScript.ID, deploymentId: CurScript.DEPLOYID_UI, returnExternalUrl: false });

            // add fields
            let mainGrp = addFieldGroup(mainForm, "fieldgrp_main","Main");
            let custpage_rectype = mainForm.addField({
                id: 'custpage_rectype', label: 'Record Type', container: mainGrp.id,
                type: "text"
            });

            let custpage_exturl = mainForm.addField({
                id: 'custpage_exturl', label: 'External Url', container: mainGrp.id,
                type: "text"
            });

            let custpage_cururl = mainForm.addField({
                id: 'custpage_cururl', label: 'Current Url', container: mainGrp.id,
                type: "text"
            });

            custpage_cururl.updateDisplayType({displayType: "hidden"});
            custpage_exturl.updateDisplayType({displayType: "hidden"});
            custpage_rectype.isMandatory = true;
            custpage_cururl.defaultValue = curUrlScript;
            custpage_exturl.defaultValue = extUrlScript;
            custpage_rectype.defaultValue = params?.custpage_rectype || "";
            
            return mainForm;
        }

        const onRenderSwaggerUI = (mainForm, params) => {
            let response = constSwagger.callApiSwaggerMetadata(params.custpage_rectype);

            if(response.code === 200) {
                const objBody = constSwagger.remapSwaggerIdToInternalId(response.body);
                let swaggerGrp = addFieldGroup(mainForm, "fieldgrp_swagger","Swagger UI");
                let objTemplate = constSwagger.getTemplateSwaggerUI(objBody, swaggerGrp.id);

                let custpage_scv_swagger_ui = mainForm.addField({
                    id: 'custpage_scv_swagger_ui', label: 'Swagger UI', 
                    type: "inlinehtml",
                    container: swaggerGrp.id,
                });
                custpage_scv_swagger_ui.updateBreakType({breakType: "startrow"});

                custpage_scv_swagger_ui.defaultValue = `
                    ${objTemplate.html}
                    ${objTemplate.libaryLink}
                    <script>window.onload = () => {${objTemplate.scriptInit}};</script>`;
            } else {
                mainForm.addPageInitMessage({
                    type: message.Type.ERROR,
                    title: response.body.status + " - " + response.body.title,
                    message: JSON.stringify(response.body["o:errorDetails"]),
                });
            }
        }

        function addFieldGroup(_form, _id,_label){
            let _obj = {id: _id, label: _label}
            _form.addFieldGroup(_obj);
            return _obj;
        }

        return {onRequest}
    });
