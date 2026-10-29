/**
 * Nội dung:
 * Key word:
 * =======================================================================================
 *  Date                Author                  Description
 *  18 Mar 2026         Phu Pham                Init, create file
 */
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
    'N/runtime', 'N/redirect', 'N/url', 'N/ui/message', 'N/file',
    'N/search', 'N/cache', 'N/task',
    '../lib/scv_lib_function.js',
    '../cons/scv_cons_form.js',
    '../cons/scv_cons_datastore.js',
    '../cons/scv_cons_il_intmap.js',
    '../cons/scv_cons_il_intaction.js',
    '../cons/scv_cons_il_external_map.js',
    '../cons/scv_cons_search.js',
    '../common/scv_common_itg_econnect.js',
],
    (
        runtime, redirect, url, message, file,
        search, cache, task,
        lbf,
        constForm,
        constDataStore,
        constIlIntMap,
        constIlIntAction,
        constIlExternalMap,
        constSearch,
        commonItgEco,
    ) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */

        const Suitelet = {
            ID: "customscript_scv_sl_econnect_service_v2",
            DEPLOYID_UI: "customdeploy_scv_sl_econnect_service_v2",
            DEPLOYID_RES_AUDIT: "customdeploy_scv_sl_ecoservice_resaudit2",
        };

        const MapReduce = {
            ID: "customscript_scv_mr_econnect_service_v2",
            DEPLOYMENT: "customdeploy_scv_mr_econnect_service_v2",
            INPUT_PARAM: "custscript_scv_inpt_eco_service_v2"
        };

        const onRequest = (scriptContext) => {
            constForm.setContext(scriptContext);
            // constForm.setServiceScript(Suitelet.ID, Suitelet.DEPLOYID_SUBMIT);

            let curScript = runtime.getCurrentScript();
            let request = scriptContext.request;
            let params = request.parameters;

            let myCache = cache.getCache({ name: 'cUpdateStt', scope: cache.Scope.PRIVATE });
            
            if(curScript.deploymentId == Suitelet.DEPLOYID_RES_AUDIT) {
                onRedirectSearchAudit(params);
                return;
            }
            // TODO: deployment for ui
            else {
                if(request.method == "GET"){
                    onCreateFormUI(params, myCache);
                    constForm.writePage();
                } else {
                    let arrAuditId = [];

                    let objIlIntMap = constIlIntMap.getDataIlIntMapById(params.custpage_rectype);
                    let arrSublist = getDataReqSublistResult(request);
                    if(arrSublist.length > 5) {
                        // TODO: run map/reduce
                        let mrTask = task.create({
                            taskType: task.TaskType.MAP_REDUCE,
                            scriptId: MapReduce.ID,
                            deploymentId: MapReduce.DEPLOYMENT
                        });

                        delete objIlIntMap.custrecord_scv_il_intmap_sqlquery;
                        mrTask.params = {
                            [MapReduce.INPUT_PARAM]: JSON.stringify({
                                objIlIntMap,
                                arrSublist, 
                            }),
                        };
                        let mrTaskId = mrTask.submit();
                        myCache.put({ key: 'mrTaskId', value: mrTaskId });
                    } else {
                        for(let obj of arrSublist) {
                            let auditId = commonItgEco.syncDataToILByRecType({ objIlIntMap, objRecData: obj.jsondata });
                            arrAuditId.push(auditId);
                        }
                    }

                    redirect.toSuitelet({
                        scriptId: Suitelet.ID,
                        deploymentId: Suitelet.DEPLOYID_UI,
                        parameters: {
                            custpage_rectype: params.custpage_rectype,
                            custpage_page: params.custpage_page,
                            isrun: "T",
                            audit: arrAuditId.join(",")
                        }
                    });
                }
            }
        }

        const getDataReqSublistResult = (request) => {
            let sl = "custpage_sl_result";
            let lc = request.getLineCount(sl);

            let arrResult = [];
            for(let i = 0; i < lc; i++) {
                let isSelect = request.getSublistValue(sl, "select", i);
                if(isSelect === true || isSelect === "T") {
                    let issync = request.getSublistValue(sl, "issync", i);
                    let id = request.getSublistValue(sl, "id", i);
                    let jsondata = request.getSublistValue(sl, "jsondata", i);

                    arrResult.push({
                        id, issync, 
                        jsondata: JSON.parse(jsondata)
                    });
                }
            }

            return arrResult;
        }

        const onCreateFormUI = (params, myCache) => {
            constForm.createForm("Econnect Data Service - V2", "../cssl/scv_cs_sl_econnect_service_v2.js");

            constForm.addSubmitButton("Submit");
            // constForm.addButton({id: "custpage_btn_submit", label: "Submit", functionName: "onSubmit('F')"}, {styleSubmit: true});
            // constForm.addButton({id: "custpage_btn_submitall", label: "Submit All Data", functionName: "onSubmit('T')"}, {styleSubmit: true});
            let mainGrp = constForm.addFieldGroup({id: "fieldgrp_main", label: "Filter"});

            // data
            let arrIlIntMap = constIlIntMap.getDataRecordShowInSL();

            // update status
            let mrTaskId = params.mrTaskId;
            if (lbf.isContainValue(mrTaskId) == false) {
                mrTaskId = myCache.get({
                    key: 'mrTaskId',
                    loader: 'loader'
                });
            }

            if (lbf.isContainValue(mrTaskId)) {
                let taskStatus = task.checkStatus(mrTaskId);
                let messageInfo = 'Status of Update Approve Status is: ' + taskStatus.status;

                constForm.addPageInitMessage({ type: message.Type.INFORMATION, message: messageInfo, duration: -1 });
                if(taskStatus.status == 'COMPLETE') {
                    myCache.remove({ key: 'mrTaskId' });
                }
            }

            // add fields
            constForm.addField({
                id: 'custpage_rectype', label: 'Record Type', container: mainGrp.id,
                type: "select"
            }, true, {
                defaultValue: params.custpage_rectype,
                lookup: {
                    data: arrIlIntMap,
                    displayExpr: "custrecord_scv_il_intmap_recname"
                }
            });

            if(!!params.audit) {
                let urlRedirect = url.resolveScript({
                    scriptId: Suitelet.ID, deploymentId: Suitelet.DEPLOYID_RES_AUDIT,
                    params: { 
                        audit: params.audit, 
                    }
                });

                let htmlMessage = `<div>View the (Econnect Audit) record just created.
                    <span><a href="${urlRedirect}" style="color: #0288d1;" target="_blank">Link</a></span>
                </div>`;

                constForm.addPageInitMessage({
                    type: message.Type.INFORMATION, message: htmlMessage, duration: -1
                });
            }

            if(params.isrun === "T") {
                let objIlIntMap = constIlIntMap.getDataIlIntMapById(params.custpage_rectype);
                
                let objRes = {};

                if(objIlIntMap.custrecord_scv_il_intmap_rectype === "salestaxitemsubsidiarymap") {
                    objRes = getDataTaxCodeSubMapping(objIlIntMap.custrecord_scv_il_intmap_rectype);
                }
                else if(!!objIlIntMap.custrecord_scv_il_intmap_searchid) {
                    objRes = commonItgEco.getDataSourceBySavedSearch(params, objIlIntMap.custrecord_scv_il_intmap_searchid);
                } else {
                    objRes = commonItgEco.queryDataSourceByRecType(params, objIlIntMap.custrecord_scv_il_intmap_sqlquery);
                    if(objIlIntMap.custrecord_scv_il_intmap_rectype === "country") {
                        objRes.arrResult = mapCountriesToISO3Code(objRes.arrResult);
                    }
                }
                let info = objRes.info;

                let arrResult = objRes.arrResult;
                arrResult = arrResult.map(e => {
                    let objRes = {...e};
                    objRes.jsondata = JSON.stringify(e);

                    return objRes;
                });

                onCreateFormHtmlNote(objIlIntMap, mainGrp);
                onCreateFormQueryResult(arrResult, info, params, mainGrp);

                if(arrResult.length === 0) return;

                let sublistId = "custpage_sl_result";
                let objSublist = constForm.addSublist({ id: sublistId, type: "LIST", label: 'Result' });
                objSublist.addMarkAllButtons();

                const arrSublist = createFieldOfSublist(arrResult, objIlIntMap.custrecord_scv_il_intmap_rectype);

                constForm.addFieldOfSublist(sublistId, arrSublist);
                constForm.setDataOfSublist(sublistId, arrResult);
            }
        }

        const mapCountriesToISO3Code = (arrCountries) => {
            const arrCountryId = ["VN"];
            const response = constDataStore.loadDataStoreFile({
                folderName: constDataStore.RECORDS.Folder.IL_System.NAME,
                fileName: 'countries.json',
                N_file: file
            });

            const arrResult = [];

            for(let objCountries of arrCountries) {
                let objFindISO3Code = response.find(e => e.cca2 == objCountries.id);
                let iso3code = objFindISO3Code?.cca3 || "";
                let currencycode = "";

                let currencies = objFindISO3Code?.currencies;
                if(typeof currencies === "object") {
                    currencycode = Object.keys(currencies)[0] || "";
                }

                if(!objCountries?.deflocale && arrCountryId.includes(objCountries.id)) {
                    let languages = objFindISO3Code?.languages;
                    languagecode = Object.keys(languages)[0] || "";

                    objCountries.deflocale = `${languagecode.slice(0, 2)}_${objCountries.id}`;
                }

                if(!!iso3code && !!currencycode && objCountries?.deflocale) {
                    arrResult.push({
                        ...objCountries,
                        iso3code,
                        currencycode
                    });
                }
            }

            return arrResult;
        }

        const createFieldOfSublist = (arrResult, rectype) => {
            let arrColumnKey = Object.keys(arrResult[0]);
            arrColumnKey = arrColumnKey.filter(key => {
                if (key.endsWith('_display')) return true;

                if(key === "issync") return false;
                return !arrColumnKey.includes(`${key}_display`);
            });

            let arrSublist = [
                {id: 'select', label: 'Select', type: 'checkbox', displayType: "entry"},
                {id: 'issync', label: 'Is Sync?', type: 'checkbox', displayType: "entry", isDisabled: true},
            ];

            for(let key of arrColumnKey) {
                let label = key.replace("_display", "");
                let objSublist = {id: key, label: label, type: 'textarea'};
                if(key === "jsondata") {
                    objSublist.displayType = 'hidden';
                }

                arrSublist.push(objSublist);
            }

            return arrSublist;
        }

        const onCreateFormQueryResult = (arrResult, info, params, mainGrp) => {
            let arrFetchPage = createDataFetchPage(info.ttlPage);
            constForm.addField({
                id: 'custpage_page', label: 'Fetch Page',
                type: "select", container: mainGrp.id,
            }, false, {
                defaultValue: params.custpage_page || "",
                lookup: {
                    data: arrFetchPage,
                }
            });
            
            constForm.addField({
                id: 'custpage_restotal', label: 'Total Record',
                type: "float", container: mainGrp.id,
            }, false, {
                defaultValue: arrResult.length,
                displayType: "disabled"
            });

        }

        const createDataFetchPage = (totalPage) => {
            let arrResult = [];
            for(let i = 1; i <= totalPage; i++) {
                arrResult.push({
                    id: i.toString(),
                    name: `Page ${i}`
                })
            }
            return arrResult;
        }

        const onCreateFormHtmlNote = (objIlIntMap, mainGrp) => {
            constForm.addField({
                id: 'custpage_endpoint', label: 'End Point', container: mainGrp.id,
                type: "text"
            }, false, {
                defaultValue: objIlIntMap.custrecord_scv_il_intmap_endpoint,
                displayType: "disabled"
            });

            if(objIlIntMap.custrecord_scv_il_intmap_action == constIlIntAction.Records.Create.ID) {
                constForm.addField({
                    id: 'custpage_lbl_disupdsync', label: '* Note: This record does not call the API to update records in the IL system.',
                    type: "label"
                });
                constForm.addField({
                    id: 'custpage_inlinehtml_note', label: 'Inline Html',
                    type: "inlinehtml"
                }, false, {
                    defaultValue: `<script>
                        let scvLabelNotUpdated = document.querySelector("#custpage_lbl_disupdsync_fs_lbl a");
                        scvLabelNotUpdated.style.setProperty("color", "red", "important");
                        scvLabelNotUpdated.style.setProperty("font-weight", "600", "important");
                    </script>`
                });
            }
        }

        const onRedirectSearchAudit = (params) => {
            let arrAudit = params.audit.split(",");

            let objInfo = {
                id: "customsearch_show_itg_econnect_audit" + commonItgEco.getRandomNumber(),
                type: "customrecord_scv_itg_econnect_audit",
                title: "Show Search ITG Econnect Audit",
            };

            let ourNewSearch = search.create({
                ...objInfo,
                columns: [
                    "name", "created", "custrecord_scv_eco_audit_url", "custrecord_scv_eco_audit_issuccess",
                    "custrecord_scv_eco_audit_recordtype", "custrecord_scv_eco_audit_recordid"
                ],
                filters: [
                    ["internalid", "anyof", arrAudit]
                ],
            });

            redirect.toSearchResult({
                search: ourNewSearch,
            });
        }

        // others data
        const getDataTaxCodeSubMapping = (recType) => {
            // search tax code
            let resultSearch = constSearch.createSearchWithFilter({
                type: "salestaxitem",
                filters: [
                    ["isinactive","is","F"]
                ],
                columns: [
                    search.createColumn({name: "internalid", label: "Internal ID", sort: search.Sort.ASC}),
                    search.createColumn({name: "description", label: "Description"}),
                    search.createColumn({name: "itemid", label: "Item ID"}),
                    search.createColumn({name: "subsidiary", label: "Subsidiary"}),
                    search.createColumn({name: "isinactive", label: "Isinactive"}),
                ]
            });
            resultSearch = resultSearch.run().getRange(0, 500);

            let data = [];
            for(let objSearch of resultSearch) {
                let subsidiary = objSearch.getValue("subsidiary");
                let obj = {
                    id: objSearch.id + subsidiary,
                    taxcode: objSearch.id,
                    subsidiary: subsidiary,
                    subsidiary_display: objSearch.getText("subsidiary"),
                    taxcode_display: objSearch.getValue("itemid"),
                    description: objSearch.getValue("description"),
                    isinactive: objSearch.getValue("isinactive") ? "T" : "F",
                };
                data.push(obj);
            }

            let arrExternalMap = constIlExternalMap.getDataILExternalByRectype(recType);
            let arrResult = [];
            for(let i = 0; i < data.length; i++) {
                let objRes = {...data[i]};

                let index = arrExternalMap.findIndex(e => e.custrecord_scv_ilextmap_recid == objRes.id);
                objRes.issync = index !== -1 ? "T" : "F";

                arrResult.push(objRes);
            }

            arrResult.sort((a,  b) => a.issync.localeCompare(b.issync));
            return {arrResult: arrResult, info: {page: 1, ttlPage: 1, rangePageFetch: 1, count: arrResult.length}};
        }

        return {onRequest}
    });
