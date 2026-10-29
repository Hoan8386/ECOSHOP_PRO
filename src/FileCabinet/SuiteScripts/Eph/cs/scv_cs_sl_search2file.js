/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  21 Oct 2025         Huy Pham                Init & create file, Upload Saved Search to Folder, from mr.Đại(https://app.clickup.com/t/86d0j4gyz)
 */
/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([
],

    function(
        ) {
        function pageInit(scriptContext) {
            initFileGrid();
        }

        const initFileGrid = async () =>{
            let currentToolbarOfFileGrid = _scvDx.getOption("custpage_sl_file",  "toolbar") || { items: [] };

            currentToolbarOfFileGrid.items.push({
                location: "before",
                widget: "dxButton",
                options: {
                    text: "Refresh",
                    onClick: async () => {
                        refreshDataFileCreated();
                    }
                }
            });
            _scvDx.setOption("custpage_sl_file",  "toolbar", currentToolbarOfFileGrid);

            let colNameOfFileGrid = _scvDx.getColumns("custpage_sl_file").find(e => e.dataField == "name");
            colNameOfFileGrid.cellTemplate = (container, options) => {
                if(!options.data.name) return;

                container.append(`
                    <i class="dx-icon-file scv-icon-style mx-2" onclick="window._openFileContents('${options.data.url}')"></i>
                    <i class="dx-icon-search scv-icon-style mx-2" onclick="window._loadDataFileContents('${options.data.internalid}')"></i>
                    <span>${options.data.name||""}</span>
                `);
            };

            _scvDx.getInstanceDx("custpage_sl_file").refresh();

            refreshDataFileCreated();

            window._openFileContents = openFileContents;
            window._loadDataFileContents = loadDataFileContents;
        }

        const searchResult = async () => {
            let isValid = _scvForm.validateFieldMandatory([
                "custpage_configupload", "custpage_date"
            ]);
            if(!isValid) return;
            
            let params = _scvForm.getParameter();

            _scvForm.showLoadingDialog(true);
            
            _scvForm.ajax.postAsyncMulti(_scvForm.serviceScript.url, [
                {action: "getColumnOfSearch", params: {...params}},
                {action: "getDataSource", params: {...params}}
            ], function (_res){
                _scvForm.showLoadingDialog(false);
                
                let arrResColumn = _scvForm.getResultActionPage(_res, "getColumnOfSearch");
                let arrResult = _scvForm.getResultActionPage(_res, "getDataSource");

                _scvDx.setColumns("custpage_sl_result", arrResColumn);
                _scvDx.setDataSource("custpage_sl_result", arrResult);
                _scvDx.getInstanceDx("custpage_sl_result").refresh();
            });
        }

        const submitResult = async () => {
            let isValid = _scvForm.validateFieldMandatory([
                "custpage_configupload", "custpage_date"
            ]);
            if(!isValid) return;
            
            let params = _scvForm.getParameter();

            _scvForm.showLoadingDialog(true);
            
            _scvForm.ajax.postAsync(_scvForm.serviceScript.url, {
                ...params,
                action: "submitResult"
            }, function (_res){
                _scvForm.showLoadingDialog(false);
                
                let objRes = _res.data;
                if(!objRes.success){
                    _scvForm.showMsgError(objRes.msg)
                }
                else{
                    alert("Submit success.");
                    refreshDataFileCreated();
                }
            });
        }

        const refreshDataFileCreated = async () =>{
            let params = _scvForm.getParameter();
            
            _scvForm.ajax.postAsyncMultiFetchSSPage(_scvForm.serviceScript.url, [
                {action: "getDataFileCreated", params: {...params}}
            ], function (_res){
                let arrResRaw = _scvForm.getResultActionPage(_res, "getDataFileCreated");
                let arrResult = handleDataFileCreated(arrResRaw);

                _scvDx.setDataSource("custpage_sl_file", [...arrResult]);
            });
        }

        const handleDataFileCreated = (_arrResRaw) =>{
            let arrResult = [];
            
            let arrFolder = alasql(`SELECT DISTINCT folder, folder_display FROM ?`, [_arrResRaw]);

            for(let i = 0; i < arrFolder.length; i++){
                let objFolder = arrFolder[i];

                let objResFolder = {
                    idxRow: _scvForm.uuidv4(),
                    idxRowParent: -1,
                    folder: objFolder.folder,
                    folder_display: objFolder.folder_display,
                    rowPreparedData: {
                        style: {
                            fontWeight: "bold",
                            backgroundColor: "#B8CCE4"
                        }
                    }
                };

                arrResult.push(objResFolder);

                let arrFileInFolder = _arrResRaw.filter(e => e.folder == objFolder.folder);
                for(let j = 0; j < arrFileInFolder.length; j++){
                    let objFile = arrFileInFolder[j];

                    let objResFile = {
                        ...objFile,
                        idxRow: _scvForm.uuidv4(),
                        idxRowParent: objResFolder.idxRow,
                    }

                    arrResult.push(objResFile);
                }
            }

            return arrResult;
        }

        const openFileContents = async (_fileUrl) =>{
            window.open(_fileUrl);
        }

        const loadDataFileContents = async (_fileId) =>{
            _scvForm.ajax.postAsync(_scvForm.serviceScript.url, {
                fileId: _fileId,
                action: "getContentsOfFile"
            }, function(_response, _paramsCallback){
                let objResData = _response.data;

                if(!objResData.success){
                    _scvForm.showMsgError(objResData.msg);
                    return;
                }

                let arrResultCSV = objResData.results.split("\n");
                let arrResult = [];//JSON.parse(objResData.results);

                if(arrResultCSV.length > 0){
                    let arrResHeader = arrResultCSV[0].split("|");

                    for(let i = 1; i < arrResultCSV.length; i++){
                        let arrResRow = arrResultCSV[i].split("|");

                        let objRow = {};

                        arrResHeader.forEach((colName, idxCol) => {
                            objRow[colName] = arrResRow[idxCol];
                        });
                        
                        arrResult.push(objRow);
                    }
                }

                let arrColumns = [];
                if(arrResult.length > 0){
                    arrColumns = Object.keys(arrResult[0]).map(keyId => ({
                        dataField: keyId
                    }));
                }
                
                _scvDx.setColumns("custpage_sl_file_content", arrColumns);
                _scvDx.setDataSource("custpage_sl_file_content", arrResult);
                _scvDx.getInstanceDx("custpage_sl_file_content").refresh();
            });
        }

        return {
            pageInit,
            searchResult,
            submitResult
        };

    });
