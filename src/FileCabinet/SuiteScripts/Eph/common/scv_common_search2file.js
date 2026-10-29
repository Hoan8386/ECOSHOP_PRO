/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  21 Oct 2025         Huy Pham                Init & create file, Upload Saved Search to Folder, from mr.Đại(https://app.clickup.com/t/86d0j4gyz)
 *  18 Nov 2025         Huy Pham                Bỏ validate theo history, đổi cách convert column header saved search, from mr.Đại(https://app.clickup.com/t/86d0j4gyz?comment=90160146980833)
 *  02 Dec 2025         Huy Pham                Thêm validate thời gian chạy trong ngày, from mr.Đại(https://app.clickup.com/t/86d0j4gyz?comment=90160150060974)
 *  29 Jan 2026         Huy Pham                Thêm cấu hình giới hạn số dòng trên mỗi file, from mr.Đại(https://app.clickup.com/t/86d0j4gyz?comment=90160161124387)
 */
define([
	'N/record', 'N/search', 'N/file', 'N/query', 'N/task',
    '../cons/scv_cons_search.js',
    '../cons/scv_cons_format.js',
],
function(
	record, search, file, query, task,
    constSearch,
    constFormat,
) {
    const Stores = {
        SavedSearch: {}
    };
    
    const loadSavedSearch = (_searchId) =>{
        let resultSearch =  null;

        try{
            resultSearch = search.load(_searchId);
        }
        catch(err){
            let searchType = getTypeOfSavedSearch(_searchId);

            resultSearch = search.load({id: _searchId, type: searchType});
        }

        return resultSearch;
    }

    const getTypeOfSavedSearch = (_searchId) =>{
        let resultSearch = constSearch.createSearchWithFilter({
            type: "savedsearch",
            filters: [
                ["internalid","is", _searchId]
            ],
            columns: [
                "internalid", "id", "title",
                "recordtype", "access", "owner"
            ]
        });

        let arrResult = constSearch.fetchResultSearchRun(resultSearch, function(obj, column){
            return constSearch.getObjResultFromSearchWithLabel_V2(obj, column);
        });

        let searchType = arrResult.length > 0 ? arrResult[0].recordtype : "";

        searchType = searchType.replaceAll(" ", "").toLowerCase();

        return searchType;
    }

    const getFromToDateOfConfig = (_executeDate, _daysBefore = 1) =>{
        let objResult = {
            fromdate: null,
            todate: null
        };

        let executeDate = constFormat.parseDate(_executeDate || new Date());
        
        objResult.fromdate = new Date(executeDate.getFullYear(), executeDate.getMonth(), executeDate.getDate() - _daysBefore);
        objResult.todate = new Date(executeDate.getFullYear(), executeDate.getMonth(), executeDate.getDate() - 1, 23, 59, 59);
        
        return objResult;
    }

    const getDataSourceOfConfig = (configUploadRec, _fromDate, _toDate) =>{

        let savedSearchId = configUploadRec.getValue("custrecord_scv_sftp_saved_search");

        let subsidiaryFieldId = configUploadRec.getValue("custrecord_scv_sftp_field_filter_sub");
        let dateFieldId = configUploadRec.getValue("custrecord_scv_sftp_field_filter_date");

        let filters = [];

        if(!!subsidiaryFieldId){
            subsidiaryFieldId = subsidiaryFieldId.trim();

            let subsidiaryFieldJoinId = null;

            if(subsidiaryFieldId.indexOf(".") > -1){
                let arrField = subsidiaryFieldId.split(".");
                subsidiaryFieldJoinId = arrField[0];
                subsidiaryFieldId = arrField[1];
            }

            let subsidiaryId = configUploadRec.getValue("custrecord_scv_sftp_sub");

            if(!!subsidiaryId){
                filters.push(search.createFilter({
                    name: subsidiaryFieldId, 
                    join: subsidiaryFieldJoinId,
                    operator: "anyof", 
                    values: subsidiaryId.toString().split(",")
                }));
            }
        }

        if(!!dateFieldId){
            dateFieldId = dateFieldId.trim();

            let fromDate = constFormat.dateTimeToChar(_fromDate);
            let toDate = constFormat.dateTimeToChar(_toDate);

            filters.push(search.createFilter({
                name: "formulatext",
                formula: `CASE WHEN TO_CHAR({${dateFieldId}},'YYYYMMDDHH24MISS') BETWEEN '${fromDate}' AND '${toDate}' THEN 'T' ELSE 'F' END`,
                operator: "is", 
                values: 'T'
            }));
        }

        let arrResult = [];
        let arrKey = [];

        let columns = null;
        try{
            let resSearch = search.load({id: savedSearchId});
            columns = resSearch.columns;

            columns.forEach(col => {
                arrKey.push(col.label)
            });

            arrResult = constSearch.getDataSource({id: savedSearchId}, filters, arrKey);
        }
        catch(err){
            arrKey = [];

            let searchType = getTypeOfSavedSearch(savedSearchId);

            let resSearch = search.load({id: savedSearchId, type: searchType});
            columns = resSearch.columns;

            columns.forEach(col => {
                arrKey.push(col.label)
            });

            arrResult = constSearch.getDataSource({id: savedSearchId, type: searchType}, filters, arrKey);
        }

        Stores.SavedSearch[savedSearchId] = {
            columns: columns,
            keyOfColumns: arrKey
        }
        
        return arrResult;
    }

    const getDataRecordConfigUpload = (_params)=>{
        let filters = [];

        if(!!_params.custpage_configupload){
            filters.push(search.createFilter({
                name: "internalid", 
                operator: "anyof", 
                values: _params.custpage_configupload.toString().split(",")
            }));
        }

		let resultSearch = constSearch.createSearchWithFilter({
			type: "customrecord_scv_sftp_conf_upload",
			filters:
			[
                ["isinactive","is","F"], 
                "AND", 
                ["custrecord_scv_sftp_saved_search","noneof","@NONE@"], 
                "AND", 
                ["custrecord_scv_sftp_to_folder","isnotempty",""], 
			],
			columns:
			[
                "internalid", "name",
                "custrecord_scv_sftp_saved_search", "custrecord_scv_sftp_day_bef_today",
                "custrecord_scv_sftp_to_folder", "custrecord_scv_sftp_sub",
                "custrecord_scv_sftp_field_filter_sub", "custrecord_scv_sftp_field_filter_date"
			]
		}, filters);
		
		resultSearch = resultSearch.runPaged({pageSize: 1000});

		let arrResult = constSearch.fetchResultSearchAllPage(resultSearch, function(_objSearch, _column){
			return constSearch.getObjResultFromSearchByKey(_objSearch, _column,[
				"internalid", "name",
                "custrecord_scv_sftp_saved_search", "custrecord_scv_sftp_day_bef_today",
                "custrecord_scv_sftp_to_folder", "custrecord_scv_sftp_sub",
                "custrecord_scv_sftp_field_filter_sub", "custrecord_scv_sftp_field_filter_date"
			]);
		});

		return arrResult;
    }

    const createFileExport = (configUploadRec, _arrResult) =>{
        let name = configUploadRec.getValue("name");
        let today = constFormat.dateToChar(new Date());

        let fileName = name + "_" + today;

        let folderId = configUploadRec.getValue("custrecord_scv_sftp_to_folder");

        let maxRowsPerFile = configUploadRec.getValue("custrecord_scv_sftp_file_split_limit") * 1;
        maxRowsPerFile = maxRowsPerFile > 0 ? maxRowsPerFile : 80000;

        let fileDescription = `File created from config {internalid} = ${configUploadRec.id}`;

        let savedSearchId = configUploadRec.getValue("custrecord_scv_sftp_saved_search");

        let countFile = 1;

        let arrResFileCreated = [];
        
        if(_arrResult.length == 0){
            _arrResult.push({});
        }

        while(_arrResult.length > 0){
            let arrResultChunk = _arrResult.splice(0, maxRowsPerFile);

            let contentsCSV = "";

            let arrHeaderKey = Object.keys(arrResultChunk[0]);

            if(arrHeaderKey.length > 0){
                contentsCSV += arrHeaderKey.join("|") + "\n";
                for(let i = 0; i < arrResultChunk.length; i++){
                    let objResChunk = arrResultChunk[i];
                    
                    let arrValues = [];

                    arrHeaderKey.forEach(keyId =>{
                        arrValues.push(objResChunk[keyId]);
                    });

                    contentsCSV += arrValues.join("|") + "\n";
                }
            }
            else{
                contentsCSV += Stores.SavedSearch[savedSearchId].keyOfColumns.join("|") + "\n";
            }

            let fileData = file.create({
                name: fileName + "_" + countFile + ".csv",
                fileType: "CSV",
                contents: contentsCSV,
                description: fileDescription,
                folder: folderId
            });
            let fileDataId = fileData.save();

            countFile++;

            arrResFileCreated.push({
                id: fileDataId,
                name: fileData.name,
            });
        }

        return arrResFileCreated;
    }

    const getDataHistoryUpload = (_configUploadIds = []) =>{
        if(_configUploadIds.length == 0) return [];

		let resultSearch = constSearch.createSearchWithFilter({
			type: "customrecord_scv_sftp_up_his",
			filters:
			[
                ["isinactive","is","F"], 
                "AND", 
                ["custrecord_scv_sftp_his_conf_up","anyof",_configUploadIds]
			],
			columns:
			[
                "internalid", 
                "custrecord_scv_sftp_his_conf_up", "custrecord_scv_sftp_his_fr_date",
                "custrecord_scv_sftp_his_to_date"
			]
		});
		
		resultSearch = resultSearch.runPaged({pageSize: 1000});

		let arrResult = constSearch.fetchResultSearchAllPage(resultSearch, function(_objSearch, _column){
			return constSearch.getObjResultFromSearchByKey(_objSearch, _column,[
				"internalid",
                "custrecord_scv_sftp_his_conf_up", "custrecord_scv_sftp_his_fr_date",
                "custrecord_scv_sftp_his_to_date"
			]);
		});

		return arrResult;
    }

    const updateUploadHistory = (_internalid,{
        custrecord_scv_sftp_his_conf_up = "",
        custrecord_scv_sftp_his_fr_date = "",
        custrecord_scv_sftp_his_to_date = "",
        custrecord_scv_sftp_his_taskid = "",
    }) =>{
        let uploadHistoryRec = null;
        if(!!_internalid){
            uploadHistoryRec = record.load({type: "customrecord_scv_sftp_up_his", id: _internalid, isDynamic: true});
        }
        else{
            uploadHistoryRec = record.create({type: "customrecord_scv_sftp_up_his", isDynamic: true});

            uploadHistoryRec.setValue("custrecord_scv_sftp_his_conf_up", custrecord_scv_sftp_his_conf_up)
        }

        uploadHistoryRec.setValue("custrecord_scv_sftp_his_fr_date", custrecord_scv_sftp_his_fr_date)
        uploadHistoryRec.setValue("custrecord_scv_sftp_his_to_date", custrecord_scv_sftp_his_to_date)
        uploadHistoryRec.setValue("custrecord_scv_sftp_his_taskid", custrecord_scv_sftp_his_taskid)

        uploadHistoryRec.save({enableSourcing: false, ignoreMandatoryFields: true});
    }

    const processSearch2File = (_configUploadId, _executeDate) =>{
        let configUploadRec = record.load({type: "customrecord_scv_sftp_conf_upload", id: _configUploadId});

        let startTime = configUploadRec.getValue("custrecord_scv_sftp_con_start_time");
        let endTime = configUploadRec.getValue("custrecord_scv_sftp_conf_end_time");
        let isValidTimeExecute = validateStartEndTime(startTime, endTime);
        if(!isValidTimeExecute){
            return;
        }

        let daysBefore = configUploadRec.getValue("custrecord_scv_sftp_day_bef_today") || 1;
        let objResFromToDate = getFromToDateOfConfig(_executeDate, daysBefore);

        let fromdate_yyyymmdd = constFormat.dateToChar(objResFromToDate.fromdate);
        let todate_yyyymmdd = constFormat.dateToChar(objResFromToDate.todate);

        let config_history_id = "";

        let arrResHistory = getDataHistoryUpload([]);//configUploadRec.id
        if(arrResHistory.length > 0){
            let objResConfigUploadHistory = arrResHistory[0];

            config_history_id = objResConfigUploadHistory.internalid;

            let his_fromdate_yyyymmdd = constFormat.dateToChar(objResConfigUploadHistory.custrecord_scv_sftp_his_fr_date);
            let his_todate_yyyymmdd = constFormat.dateToChar(objResConfigUploadHistory.custrecord_scv_sftp_his_to_date);
            if((fromdate_yyyymmdd >= his_fromdate_yyyymmdd && fromdate_yyyymmdd <= his_todate_yyyymmdd)
                || (todate_yyyymmdd >= his_fromdate_yyyymmdd && todate_yyyymmdd <= his_todate_yyyymmdd)
            ){
                return;
            }
        }

        let searchTaskId = "";
        let isUseTaskSearch = configUploadRec.getValue("custrecord_scv_sftp_file_chktask");

        if (isUseTaskSearch) {
            let name = configUploadRec.getValue("name");
            let today = constFormat.dateToChar(new Date());

            let fileName = name + "_" + today + "_1.csv";
            
            let folderId = configUploadRec.getValue("custrecord_scv_sftp_to_folder");
            let appfolder = query.runSuiteQL({
                query: `SELECT appfolder FROM MediaItemFolder WHERE id = ${folderId}`
            }).asMappedResults()[0].appfolder;
            let filePath = appfolder.split(" : ").join("/") + "/" + fileName;

            let searchTask = task.create({
                taskType: task.TaskType.SEARCH
            });
            searchTask.savedSearchId = configUploadRec.getValue("custrecord_scv_sftp_saved_search");
            searchTask.filePath = filePath;

            searchTaskId = searchTask.submit()

        } else {
            let arrResult = getDataSourceOfConfig(configUploadRec, objResFromToDate.fromdate, objResFromToDate.todate);
            
            createFileExport(configUploadRec, arrResult);
        }
        
        
        updateUploadHistory(config_history_id, {
            custrecord_scv_sftp_his_conf_up: configUploadRec.id,
            custrecord_scv_sftp_his_fr_date: objResFromToDate.fromdate,
            custrecord_scv_sftp_his_to_date: objResFromToDate.todate,
            custrecord_scv_sftp_his_taskid: searchTaskId
        });
    }

    const validateStartEndTime = (startTime, endTime) =>{
        let startTime_HH24MI = !!startTime ? constFormat.dateTimeToChar(startTime, "HH24MI") : "0000";
        let endTime_HH24MI = !!endTime ? constFormat.dateTimeToChar(endTime, "HH24MI") : "2359";

        let sysdate_hh24mi = query.runSuiteQL({
            query: `SELECT TO_CHAR((SYSDATE + 15/24), 'HH24MI') as sysdate_hh24mi
            FROM Dual`
        }).asMappedResults()[0].sysdate_hh24mi;
        log.error("huy-validateStartEndTime", {
            startTime_HH24MI,
            endTime_HH24MI,
            sysdate_hh24mi
        });
        if(startTime_HH24MI <= sysdate_hh24mi && sysdate_hh24mi <= endTime_HH24MI){
            return true;
        }

        return false;
    }
    
    return {
        loadSavedSearch,
        getDataSourceOfConfig,
        getDataRecordConfigUpload,
        createFileExport,
        getFromToDateOfConfig,
        getDataHistoryUpload,
        updateUploadHistory,
        processSearch2File,
        validateStartEndTime,
    };
    
});
