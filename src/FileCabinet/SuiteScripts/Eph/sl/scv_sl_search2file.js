/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  21 Oct 2025         Huy Pham                Init & create file, Upload Saved Search to Folder, from mr.Đại(https://app.clickup.com/t/86d0j4gyz)
 *  18 Nov 2025         Huy Pham                Bỏ validate theo history, đổi cách convert column header saved search, from mr.Đại(https://app.clickup.com/t/86d0j4gyz?comment=90160146980833)
 */
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
    'N/runtime', 'N/record', 'N/search', 'N/query', 'N/file',
    '../common/scv_common_search2file.js',
    '../cons/scv_cons_form.js',
    '../cons/scv_cons_search.js',
    '../cons/scv_cons_format.js',
],
    (
        runtime, record, search, query, file,
        commonSearch2File,
        constForm,
        constSearch,
        constFormat,
    ) => {
        const CurrentScript = {
            ID: "customscript_scv_sl_search2file",
            DEPLOYID_UI: "customdeploy_scv_sl_search2file",
            DEPLOYID_DATA: "customdeploy_scv_sl_search2file_svc"
        }

        const onRequest = (context) => {
            constForm.setContext(context);
            constForm.setServiceScript(CurrentScript.ID, CurrentScript.DEPLOYID_DATA);

            let request = context.request;
            let params = request.parameters;

            let curScript = runtime.getCurrentScript();

            if(curScript.deploymentId == CurrentScript.DEPLOYID_DATA){
                let objResponse = {data: []};
                
				switch(params.action){
                    case "getDataFileCreated":
                        objResponse.data = getDataFileCreated(params);
                        break;
                    case "getContentsOfFile":
                        objResponse.data = getContentsOfFile(params);
                        break;
                    case "getColumnOfSearch":
                        objResponse.data = getColumnOfSearch(params);
                        break;
					case "getDataSource":
						objResponse.data = getDataSource(params);
						break;
                    case "submitResult":
                        objResponse.data = submitResult(params);
                    break;
				}

				constForm.write(objResponse);
            }else{
                if(context.request.method == "GET"){
                    onCreateFormUI(params);

                    constForm.writePage();
                }
            }
        }

        const onCreateFormUI = (_params) =>{
            constForm.createForm("Create File From Saved Search", "../cs/scv_cs_sl_search2file.js");

            constForm.addPageLink([
                {
                    id: "customdeploy_scv_mr_search2file", name: "Job Execute Manually"
                },
                {
                    id: "customdeploy_scv_mr_search2file_sch", name: "Job Execute Schedule"
                }
            ], true);

            constForm.addButton({id: "custpage_btn_submit", label: "Submit", functionName: "submitResult()"},{
                styleSubmit: true
            });
            constForm.addButton({id: "custpage_btn_search", label: "Search", functionName: "searchResult()"});

            let mainGrp = constForm.addFieldGroup({id: "fieldgrp_main", label: "Main"});

            constForm.addField({
                id: 'custpage_configupload', label: 'Data Config Upload', container: mainGrp.id,
                type: "select", source: "customrecord_scv_sftp_conf_upload",
            }, true, {
                defaultValue: _params.custpage_configupload
            });
            constForm.addField({
                id: 'custpage_date', label: 'Date', container: mainGrp.id,
                type: "date", 
            }, true, {
                layoutType: "startrow",
                defaultValue: constFormat.parseDate(new Date())
            });

            let resultSearchGrp = constForm.addTab({id: "tab_resultsearch", label: "Result Search"});
            let resultFileGrp = constForm.addTab({id: "tab_resultfile", label: "List File Created"});

            constForm.addGridDx({
                id: "custpage_sl_result",
                type: "grid",
                label: "Result Of Saved Search",
                tab: resultSearchGrp.id,
                columns: []
            });

            constForm.addGridDx({
                id: "custpage_sl_file",
                type: "treegrid",
                label: "Result File Create",
                tab: resultFileGrp.id,
                columns: [
                    {dataField: "folder_display", caption: "Folder", dataType: "string", width: 180},
                    {dataField: "name", caption: "File Name", dataType: "string", minWidth: 250},
                    {dataField: "documentsize", caption: "Size (KB)", dataType: "number", width: 120},
                    {dataField: "description", caption: "Description", dataType: "string", width: 250},
                    {dataField: "created", caption: "Date Created", dataType: "string", width: 150},
                    {dataField: "modified", caption: "Last Modified", dataType: "string", width: 150},
                ]
            });

            constForm.addGridDx({
                id: "custpage_sl_file_content",
                type: "grid",
                label: "Contents Of File",
                tab: resultFileGrp.id,
                columns: []
            });

            constForm.addSplitterDx({
                id: "file_splitter", 
                tab: resultFileGrp.id,
                optionsDx: {
                    items: [
                        {resizable: true, collapsible: true, size: "100%"},
                        {resizable: true, collapsible: true, size: "0%"},
                    ]
                }
            });
        }

        const getContentsOfFile = (_params) =>{
            let response = {
                success: true,
                msg: "",
                results: "",
            };

            try{
                let arrFolder = getDataFolder(_params);

                let objResFile = file.load({id: _params.fileId});

                let idxFolder = arrFolder.findIndex(e => e.custrecord_scv_sftp_to_folder == objResFile.folder);
                if(idxFolder == -1){
                    response.success = false;
                    response.msg = "File is not in correct folder";
                    return response;
                }

                response.results = objResFile.getContents();
            }
            catch(err){
                response.success = false;
                response.msg = err.message || err;
            }

            return response;
        }

        const getDataFileCreated = (_params) =>{
            let arrFolder = getDataFolder(_params);
            let arrFolderId = arrFolder.map(folder => folder.custrecord_scv_sftp_to_folder);

            let filters = [];
            if(arrFolderId.length > 0){
                filters.push(search.createFilter({
                    name: "folder", 
                    operator: "anyof", 
                    values: arrFolderId
                }));
            }
            else{
                return {arrResult: [], info: {page: 0, ttlPage: 0, rangePageFetch: 1}};
            }

            let resultSearch = constSearch.createSearchWithFilter({
                type: "file",
                filters: [],
                columns:
                [
                    "internalid", "name",
                    "folder", "documentsize",
                    "url", "created",
                    "modified", "filetype",
                    "description"
                ]
            }, filters);

            resultSearch = resultSearch.runPaged({pageSize: 1000});

            let objRes = constSearch.fetchResultSearchPage(resultSearch, _params, function(_objSearch, _column){
                return constSearch.getObjResultFromSearchByKey(_objSearch, _column,[
                    "internalid", "name",
                    "folder", "documentsize",
                    "url", "created",
                    "modified", "filetype",
                    "description"
                ]);
            })

            return objRes;
        }

        const getDataFolder = (_params) =>{
            let arrResult = query.runSuiteQL({
                query: `SELECT DISTINCT custrecord_scv_sftp_to_folder
                    FROM customrecord_scv_sftp_conf_upload
                    WHERE isinactive = 'F'
                        AND custrecord_scv_sftp_to_folder IS NOT NULL`
            }).asMappedResults();

            return arrResult;
        }

        const getColumnOfSearch = (_params) =>{
            let configUploadRec = record.load({type: "customrecord_scv_sftp_conf_upload", id: _params.custpage_configupload});
            let savedSearchId = configUploadRec.getValue("custrecord_scv_sftp_saved_search");

            let resultSearch = commonSearch2File.loadSavedSearch(savedSearchId);
            
            let arrResult = [];
            
            let columns = resultSearch.columns;

            columns.forEach(col => {
                arrResult.push({dataField: col.label});
            });
            
            return arrResult;
        };

        const getDataSource = (_params) =>{
            let configUploadRec = record.load({type: "customrecord_scv_sftp_conf_upload", id: _params.custpage_configupload});
            
            let daysBefore = configUploadRec.getValue("custrecord_scv_sftp_day_bef_today") || 1;
            let objResFromToDate = commonSearch2File.getFromToDateOfConfig(_params.custpage_date, daysBefore);

            let arrResult = commonSearch2File.getDataSourceOfConfig(configUploadRec, objResFromToDate.fromdate, objResFromToDate.todate);

            return arrResult;
        }

        const submitResult = (_params) =>{
            let objResponse = {
                success: true,
                msg: "Success",
                results: [],
            }
            try{
                commonSearch2File.processSearch2File(_params.custpage_configupload, _params.custpage_date);
            }
            catch(err){
                objResponse.success = false;
                objResponse.msg = err.message;
                log.error("Error: Try-Catch-submitResult", err);
            }
            

            return objResponse;
        }

        return {onRequest}

    });
