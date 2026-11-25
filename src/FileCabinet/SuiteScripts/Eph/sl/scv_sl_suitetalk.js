/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
    'N/ui/serverWidget', 'N/runtime', 'N/ui/message', 'N/url',
    '../cons/scv_cons_swagger.js',
    '../cons/scv_cons_pretty_print.js',
    '../cons/scv_cons_scriptrecordtype.js',
    '../cons/scv_cons_record.js',
],
    (
        serverWidget, runtime, message, url,
        constSwagger,
        constPrettyPrint,
        constScriptRecType,
        constRecord,
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
                type: "select"
            });
            const arrRecTypes = constScriptRecType.queryAllDataSource().filter(rec => !!rec.skey);
            constRecord.initLoadFieldServer(custpage_rectype, {
                data: arrRecTypes,
                valueExpr: 'skey',
                displayExpr: 'name'
            }, true);

            let custpage_accept_type = mainForm.addField({
                id: 'custpage_accept_type', label: 'Type', container: mainGrp.id,
                type: "select"
            });
            constRecord.initLoadFieldServer(custpage_accept_type, {
                data: Object.values(constSwagger.AcceptType),
                valueExpr: 'ID',
                displayExpr: 'NAME'
            }, false);

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
            custpage_accept_type.isMandatory = true;
            custpage_cururl.defaultValue = curUrlScript;
            custpage_exturl.defaultValue = extUrlScript;
            custpage_rectype.defaultValue = params?.custpage_rectype || "";
            custpage_accept_type.defaultValue = params?.custpage_accept_type || constSwagger.AcceptType.Swagger.ID;
            
            return mainForm;
        }

        const onRenderSwaggerUI = (mainForm, params) => {
            const acceptType = params?.custpage_accept_type || constSwagger.AcceptType.Swagger.ID;
            let response = constSwagger.callApiSwaggerMetadata(params.custpage_rectype, acceptType);

            if(response.code === 200) {
                if (acceptType === constSwagger.AcceptType.Schema.ID) {
                    return onRenderSchemaJSON(mainForm, response.body);
                }

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
                    <script>window.addEventListener('load', () => {${objTemplate.scriptInit}});</script>`;
            } else {
                mainForm.addPageInitMessage({
                    type: message.Type.ERROR,
                    title: response.body.status + " - " + response.body.title,
                    message: JSON.stringify(response.body["o:errorDetails"]),
                });
            }
        }

        const onRenderSchemaJSON = (mainForm, resBody) => {
            let schemaGrp = addFieldGroup(mainForm, "fieldgrp_schema", "Schema JSON");
            let objTemplate = constPrettyPrint.getTemplatePrettyPrint(resBody, schemaGrp.id);
            let custpage_scv_schema_json = mainForm.addField({
                id: 'custpage_scv_schema_json', label: 'Schema JSON',
                type: "inlinehtml",
                container: schemaGrp.id,
            });
            custpage_scv_schema_json.updateBreakType({breakType: "startrow"});

            custpage_scv_schema_json.defaultValue = `
                ${objTemplate.html}
                ${objTemplate.libaryLink}
                <script>window.addEventListener('load', () => {${objTemplate.scriptInit}});</script>`;
        }

        function addFieldGroup(_form, _id,_label){
            let _obj = {id: _id, label: _label}
            _form.addFieldGroup(_obj);
            return _obj;
        }

        return {onRequest}
    });
