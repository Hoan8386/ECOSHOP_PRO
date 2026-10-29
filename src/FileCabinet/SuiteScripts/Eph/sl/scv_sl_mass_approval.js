/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/cache', 'N/record', 'N/redirect', 'N/runtime', 'N/search', 'N/ui/message', 'N/ui/serverWidget', 'N/task', 'N/url'],
    
    (cache, record, redirect, runtime, search, message, serverWidget, task, url) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            let request = scriptContext.request;
            let params = request.parameters;
            let myCache = cache.getCache({
                name: 'cUpdateStt',
                scope: cache.Scope.PRIVATE
            });
            if (request.method === "GET") {
                let deploymentId = runtime.getCurrentScript().deploymentId;
                if (deploymentId === "customdeploy_scv_sl_mass_app_count_ss") {
                    let objRes = onCreateAPIs(params);
                    scriptContext.response.setHeader({
                        name: 'Content-Type',
                        value: 'application/json'
                    });
                    scriptContext.response.write(JSON.stringify(objRes));
                } else {
                    if (!params.whasetupid) throw "Vui lòng chọn Record Setup!!!";
                    let objSetup = getRecordSetupPheDuyet(params.whasetupid);
                    let MainForm = onCreateFormUI(params, myCache, objSetup);
                    let objData = runFilterSS(MainForm.form, objSetup, params);
                    onRenderData(objData.sublist, objData.searchResult, objSetup.recordtype);
                    scriptContext.response.writePage(MainForm.form);
                }
            } else if (request.method === "POST") {
                let objSetup = getRecordSetupPheDuyet(params.custpage_wha_setup);
                let arrSublist = getDataSublist(request, objSetup, params.custpage_action);
                let mrTask = task.create({
                    taskType: task.TaskType.MAP_REDUCE,
                    scriptId: 'customscript_scv_mr_mass_approval',
                    deploymentId: 'customdeploy_scv_mr_mass_approval'
                });
                mrTask.params = {
                    custscript_scv_mr_data_mass_approval: JSON.stringify(arrSublist),
                };
                let mrTaskId = mrTask.submit();
                myCache.put({
                    key: 'mrTaskId',
                    value: mrTaskId
                });
                redirect.toSuitelet({
                    scriptId: 'customscript_scv_sl_mass_approval',
                    deploymentId: 'customdeploy_scv_sl_mass_approval',
                    parameters: {
                        whasetupid: params.custpage_wha_setup,
                        custpage_action: params.custpage_action
                    }
                });
            }
        }
        
        const onCreateAPIs = (params) => {
            let objRes = {
                success: true
            };
            switch (params.action) {
                case "all":
                    objRes.data = getDataSetupPheDuyetHL();
                    break;
            }
            if (!!params.saved_search) {
                let searchDetail = search.load(params.saved_search);
                let count = searchDetail.runPaged().count;
                objRes.data = {saved_search: params.saved_search, count: count};
            }
            return objRes;
        }
        
        const onCreateFormUI = (_params, _myCache, _objSetup) => {
            let mainForm = serverWidget.createForm({title:  _objSetup.name});
            mainForm.clientScriptModulePath = '../cs/scv_cs_sl_mass_approval.js';
            // add field
            let custpage_wha_setup = mainForm.addField({
                id: 'custpage_wha_setup',
                type: serverWidget.FieldType.SELECT,
                label: 'What Setup phê duyệt',
                source: "customrecord_scv_wha_setup",
            });
            custpage_wha_setup.defaultValue = _params.whasetupid;
            custpage_wha_setup.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });

            let custpage_action = mainForm.addField({
                id: 'custpage_action',
                type: serverWidget.FieldType.SELECT,
                label: 'Action'
            });
            [
                { id: 'approve', name: 'Approve' },
                { id: 'reject', name: 'Reject'}
            ].forEach(obj => {
                custpage_action.addSelectOption({
                    value: obj.id,
                    text: obj.name,
                });
            })

            // add button
            mainForm.addButton({
                id: "custpage_btn_search",
                label: "Search",
                functionName: "onSearchResult()"
            });

            if (_objSetup.show_reject_button) {
                mainForm.addButton({
                    id: "custpage_btn_reject",
                    label: "Reject",
                    functionName: "onSearchResult()"
                });
            }

            mainForm.addButton({
                id: "custpage_btn_refresh",
                label: "Refresh",
                functionName: "onRefresh()"
            });
            
            let mrTaskId = _params.mrTaskId;
            if (!mrTaskId) {
                mrTaskId = _myCache.get({
                    key: 'mrTaskId',
                    loader: 'loader'
                });
            }
            if (mrTaskId) {
                let taskStatus = task.checkStatus(mrTaskId);
                let messageInfo = 'Task is: ' + taskStatus.status;
                mainForm.addPageInitMessage({
                    type: message.Type.INFORMATION,
                    message: messageInfo,
                    duration: -1
                });
                if (taskStatus.status === 'COMPLETE') {
                    _myCache.remove({
                        key: 'mrTaskId'
                    });
                }
            } else {
                mainForm.addSubmitButton("Submit");
            }
            return {form: mainForm};
        }
        
        const onRenderData = (_sublist, _result, _rectype) => {
            if (_result.length === 0) return;
            let lc = _result.length;
            let columns = Object.keys(_result[0]);
            for (let i = 0; i < lc; i++) {
                let data = [];
                for (let key in _result[i]) {
                    if (key === "custpage_col_document_number") {
                        let urlRec = url.resolveRecord({
                            recordType: _rectype,
                            recordId: _result[i].custpage_record_id
                        });
                        let tranid = `<a target="_blank" href="${urlRec}">${_result[i][key]}</a>`;
                        data.push(tranid);
                    } else {
                        let value = _result[i][key];
                        if (value === true) value = "Yes";
                        if (value === false) value = "No";
                        data.push(value);
                    }
                }
                setRowDataSublist(_sublist, i, columns, data);
            }
        }
        
        const getDataSublist = (_request, _objSetup, _action) => {
            let sl = "custpage_sl_result";
            let lc = _request.getLineCount(sl);
            let arrResult = [];
            for (let i = 0; i < lc; i++) {
                let chk = _request.getSublistValue(sl, "custpage_col_chk", i);
                if (chk === true || chk === "T") {
                    let record_id = _request.getSublistValue(sl, "custpage_record_id", i);
                    let objData = {
                        custpage_action: _action,
                        custpage_record_type: _objSetup.recordtype,
                        custpage_record_id: record_id,
                        custpage_col_status_field: _objSetup.status_field,
                        custpage_col_id_status: _objSetup.status_id,
                        custpage_col_std_status_field: _objSetup.std_status_field,
                        custpage_col_std_status_id: _objSetup.std_status_id,
                        custpage_col_reject_id: _objSetup.reject_id,
                        custpage_col_reject_field: _objSetup.reject_field,
                    };
                    arrResult.push(objData);
                }
            }
            return arrResult;
        }
        
        const getDataSetupPheDuyetHL = () => {
            let lkEmp = search.lookupFields({
                type: search.Type.EMPLOYEE,
                id: runtime.getCurrentUser().id,
                columns: ['custentity_scv_primary_role']
            });
            let su_role = lkEmp?.custentity_scv_primary_role[0]?.value;
            let result = [];
            let resultSearch = search.create({
                type: "customrecord_scv_wha_setup",
                filters: [
                    ["isinactive", "is", "F"], 'and', ['custrecord_scv_su_role', 'anyof', su_role || '@NONE@']
                ],
                columns: ["name", "custrecord_scv_su_manid", "custrecord_scv_su_id_doi", "custrecord_scv_su_ss", "custrecord_scv_su_stt"],
            });
            let myColumns = resultSearch.columns;
            resultSearch = resultSearch.run().getRange({start: 0, end: 20});
            for (let i = 0; i < resultSearch.length; i++) {
                let saved_search = resultSearch[i].getValue(myColumns[3]);
                let searchDetail = search.load(saved_search);
                let count = searchDetail.runPaged().count;
                result.push({
                    wha_setup_id: resultSearch[i].id,
                    name: resultSearch[i].getValue(myColumns[0]),
                    saved_search: saved_search,
                    count: count
                });
            }
            return result;
        }
        
        const runFilterSS = (mainForm, objSetup, params) => {
            let objData = getDataSSFromRecordSetup(objSetup, params);
            let arrColumn = objData.arrColumn;
            // add field search
            addFieldSearch(mainForm, arrColumn, params, objSetup);
            // add sublist
            let rsSL = mainForm.addSublist({
                id: "custpage_sl_result",
                type: serverWidget.SublistType.LIST,
                label: 'Result'
            });
            rsSL.addMarkAllButtons();
            onCreateSublistColumn(rsSL, arrColumn, params.showid);
            return {searchResult: objData.arrResult, sublist: rsSL};
        }
        
        const getRecordSetupPheDuyet = (_internalid) => {
            let columns = [
                "name", "custrecord_scv_su_manid", "custrecord_scv_su_id_doi", "custrecord_scv_su_ss", 
                "custrecord_scv_su_stt", 'custrecord_scv_su_type', 'custrecord_scv_su_role',
                "custrecord_scv_standard_status", "custrecord_scv_change_std_status",
                "custrecord_scv_status_reject", "custrecord_scv_status_change_reject"
            ];
            let lkFieldsSetup = search.lookupFields({
                type: "customrecord_scv_wha_setup",
                id: _internalid,
                columns: columns
            });
            return {
                name: lkFieldsSetup.name,
                recordtype: lkFieldsSetup.custrecord_scv_su_manid,
                status_id: lkFieldsSetup.custrecord_scv_su_id_doi?.[0]?.value,
                saved_search: lkFieldsSetup.custrecord_scv_su_ss,
                status_field: lkFieldsSetup.custrecord_scv_su_stt,
                su_type: lkFieldsSetup.custrecord_scv_su_type,
                su_role: lkFieldsSetup.custrecord_scv_su_role?.[0]?.value,
                std_status_id: lkFieldsSetup.custrecord_scv_change_std_status?.[0]?.value,
                std_status_field: lkFieldsSetup.custrecord_scv_standard_status,
                reject_id: lkFieldsSetup.custrecord_scv_status_change_reject?.[0]?.value,
                reject_field: lkFieldsSetup.custrecord_scv_status_reject,
            };
        }
        
        const getDataSSFromRecordSetup = (objSetup, params) => {
            let arrResult = [];
            let arrColumn = [];
            let resultSearch = search.load(objSetup.saved_search);
            let myColumns = resultSearch.columns;
            let myFilter = resultSearch.filters;
            if (arrColumn.length === 0) {
                for (let c = 0; c < myColumns.length; c++) {
                    let col_id = configLabelToKeyObj(myColumns[c].label);
                    // push filters saved search
                    if (col_id.includes("subsidiary") && params.custpage_subsidiary) {
                        addFilterSS(myFilter, myColumns[c].name, '', search.Operator.ANYOF, params.custpage_subsidiary.split(","));
                    }
                    if (col_id.includes("requestor") && params.custpage_requestor) {
                        addFilterSS(myFilter, myColumns[c].name, myColumns[c].join, search.Operator.ANYOF, params.custpage_requestor);
                    }
                    if (col_id.includes("department") && params.custpage_department) {
                        addFilterSS(myFilter, myColumns[c].name, myColumns[c].join, search.Operator.ANYOF, params.custpage_department);
                    }
                    if (col_id.includes("duedate") || col_id.includes("due_date")) {
                        if (params.custpage_fromduedate) {
                            addFilterSS(myFilter, myColumns[c].name, myColumns[c].join, search.Operator.ONORAFTER, params.custpage_fromduedate);
                        }
                        if (params.custpage_toduedate) {
                            addFilterSS(myFilter, myColumns[c].name, myColumns[c].join, search.Operator.ONORBEFORE, params.custpage_toduedate);
                        }
                    } else if (col_id.includes("date")) {
                        if (params.custpage_fromdt) {
                            addFilterSS(myFilter, myColumns[c].name, myColumns[c].join, search.Operator.ONORAFTER, params.custpage_fromdt);
                        }
                        if (params.custpage_todt) {
                            addFilterSS(myFilter, myColumns[c].name, myColumns[c].join, search.Operator.ONORBEFORE, params.custpage_todt);
                        }
                    }
                    if (col_id.includes("type") && params.custpage_type) {
                        addFilterSS(myFilter, myColumns[c].name, myColumns[c].join, search.Operator.ANYOF, params.custpage_type);
                    }
                    if (col_id.includes("document_number") && params.custpage_document_number) {
                        addFilterSS(myFilter, myColumns[c].name, '', search.Operator.CONTAINS, params.custpage_document_number);
                    }
                    if (col_id.includes("memo") && params.custpage_memo) {
                        addFilterSS(myFilter, myColumns[c].name, '', search.Operator.CONTAINS, params.custpage_memo);
                    }
                    if (col_id.includes("amount") && params.custpage_amount) {
                        addFilterSS(myFilter, myColumns[c].name, '', search.Operator.LESSTHANOREQUALTO, params.custpage_amount);
                    }
                    if (col_id.includes("location") && params.custpage_location) {
                        addFilterSS(myFilter, myColumns[c].name, '', search.Operator.ANYOF, params.custpage_location);
                    }
                    if (col_id.includes("vendor") && params.custpage_vendor) {
                        addFilterSS(myFilter, myColumns[c].name, '', search.Operator.ANYOF, params.custpage_vendor);
                    }
                    if (col_id.includes("approval_status") && params.custpage_approval_status) {
                        addFilterSS(myFilter, myColumns[c].name, '', search.Operator.ANYOF, params.custpage_approval_status);
                    }
                    // add columns
                    arrColumn.push({
                        id: col_id,
                        label: myColumns[c].label,
                        type: "textarea"
                    });
                }
            }
            resultSearch = resultSearch.runPaged({pageSize: 1000});
            for (let i = 0; i < resultSearch.pageRanges.length; i++) {
                let currentPage = resultSearch.fetch({index: i}).data;
                for (let idx = 0; idx < currentPage.length; idx++) {
                    let obj = {};
                    for (let j = 0; j < arrColumn.length; j++) {
                        obj[arrColumn[j].id] = currentPage[idx].getText(myColumns[j]) || currentPage[idx].getValue(myColumns[j]);
                        if (!isNaN(obj[arrColumn[j].id]) && obj[arrColumn[j].id] !== "" && obj[arrColumn[j].id] !== true) {
                            obj[arrColumn[j].id] = changeCurrency(Math.round(obj[arrColumn[j].id] * 100) / 100);
                        }
                    }
                    let index_id = arrColumn.findIndex(e => e.id === "custpage_col_internal_id");
                    obj.custpage_record_id = currentPage[idx].id;
                    if (!obj.custpage_record_id && index_id !== -1) {
                        obj.custpage_record_id = currentPage[idx].getValue(myColumns[index_id]);
                    }
                    arrResult.push(obj);
                }
            }
            return {arrResult, arrColumn};
        }
        
        const addFilterSS = (myFilter, name, join, operator, value) => {
            if (!!join) {
                myFilter.push(search.createFilter({
                    name: name,
                    join: join,
                    operator: operator,
                    values: value
                }));
            } else {
                myFilter.push(search.createFilter({
                    name: name,
                    operator: operator,
                    values: value
                }));
            }
        }
        
        const addFieldSearch = (mainForm, arrColumn, params, objSetup) => {
            let mainId = "fieldgrp_main";
            let mainGrp = addFieldGroup(mainForm, mainId, "Filter");
            let isCreateDuedate = true, isCreateDate = true;
            for (let i = 0; i < arrColumn.length; i++) {
                if (isCreateDuedate && (arrColumn[i].id.includes("duedate") || arrColumn[i].id.includes("due_date"))) {
                    let fieldFromDuedate = mainForm.addField({
                        id: 'custpage_fromduedate',
                        type: serverWidget.FieldType.DATE,
                        label: 'From Due Date',
                        container: mainGrp.id
                    }).updateLayoutType({layoutType: serverWidget.FieldLayoutType.STARTROW});
                    fieldFromDuedate.defaultValue = getFromDate(params.custpage_fromduedate);
                    fieldFromDuedate.setHelpText({
                        help: 'From Due Date'
                    });
                    
                    let fieldToDuedate = mainForm.addField({
                        id: 'custpage_toduedate',
                        type: serverWidget.FieldType.DATE,
                        label: 'To Due Date',
                        container: mainGrp.id
                    }).updateLayoutType({layoutType: serverWidget.FieldLayoutType.ENDROW});
                    fieldToDuedate.defaultValue = getToDate(params.custpage_toduedate);
                    fieldToDuedate.setHelpText({
                        help: 'To Due Date'
                    });
                    isCreateDuedate = false;
                } else if (isCreateDate && arrColumn[i].id.includes("date")) {
                    let fieldFromdt = mainForm.addField({
                        id: 'custpage_fromdt',
                        type: serverWidget.FieldType.DATE,
                        label: 'From Date',
                        container: mainGrp.id
                    }).updateLayoutType({layoutType: serverWidget.FieldLayoutType.STARTROW});
                    fieldFromdt.defaultValue = getFromDate(params.custpage_fromdt);
                    fieldFromdt.setHelpText({
                        help: 'From Date'
                    });
                    
                    let fieldTodt = mainForm.addField({
                        id: 'custpage_todt',
                        type: serverWidget.FieldType.DATE,
                        label: 'To Date',
                        container: mainGrp.id
                    }).updateLayoutType({layoutType: serverWidget.FieldLayoutType.ENDROW});
                    fieldTodt.defaultValue = getToDate(params.custpage_todt);
                    fieldTodt.setHelpText({
                        help: 'To Date'
                    });
                    isCreateDate = false;
                } else if (arrColumn[i].id.includes("requestor")) {
                    let id = arrColumn[i].id.replace("custpage_col", "custpage");
                    let field = mainForm.addField({
                        id: id,
                        type: serverWidget.FieldType.SELECT,
                        label: arrColumn[i].label,
                        source: 'employee',
                        container: mainGrp.id
                    });
                    field.setHelpText({
                        help: arrColumn[i].label
                    });
                    if (!!params[id]) {
                        field.defaultValue = params[id];
                    }
                } else if (arrColumn[i].id.includes("type")) {
                    let id = arrColumn[i].id.replace("custpage_col", "custpage");
                    let field = mainForm.addField({
                        id: id,
                        type: serverWidget.FieldType.SELECT,
                        label: arrColumn[i].label,
                        source: objSetup?.su_type,
                        container: mainGrp.id
                    });
                    field.setHelpText({
                        help: arrColumn[i].label
                    });
                    if (!!params[id]) {
                        field.defaultValue = params[id];
                    }
                }
                else if (arrColumn[i].id.includes("document_number")|| arrColumn[i].id.includes("memo")) {
                    let id = arrColumn[i].id.replace("custpage_col", "custpage");
                    let field = mainForm.addField({
                        id: id,
                        type: serverWidget.FieldType.TEXT,
                        label: arrColumn[i].label,
                        container: mainGrp.id
                    });
                    field.setHelpText({
                        help: arrColumn[i].label
                    });
                    if (!!params[id]) {
                        field.defaultValue = params[id];
                    }
                }
                else if (arrColumn[i].id.includes("amount")) {
                    let id = arrColumn[i].id.replace("custpage_col", "custpage");
                    let field = mainForm.addField({
                        id: id,
                        type: serverWidget.FieldType.FLOAT,
                        label: arrColumn[i].label,
                        container: mainGrp.id
                    });
                    field.setHelpText({
                        help: arrColumn[i].label
                    });
                    if (!!params[id]) {
                        field.defaultValue = params[id];
                    }
                }
                else if (arrColumn[i].id.includes("location")) {
                    let id = arrColumn[i].id.replace("custpage_col", "custpage");
                    let field = mainForm.addField({
                        id: id,
                        type: serverWidget.FieldType.SELECT,
                        label: arrColumn[i].label,
                        source: 'location',
                        container: mainGrp.id
                    });
                    field.setHelpText({
                        help: arrColumn[i].label
                    });
                    if (!!params[id]) {
                        field.defaultValue = params[id];
                    }
                }
                else if (arrColumn[i].id.includes("approval_status")) {
                    let id = arrColumn[i].id.replace("custpage_col", "custpage");
                    let field = mainForm.addField({
                        id: id,
                        type: serverWidget.FieldType.SELECT,
                        label: arrColumn[i].label,
                        source: 'customrecord_scv_approval_status',
                        container: mainGrp.id
                    });
                    field.setHelpText({
                        help: arrColumn[i].label
                    });
                    if (!!params[id]) {
                        field.defaultValue = params[id];
                    }
                }
                else if (arrColumn[i].id.includes("vendor")) {
                    let id = arrColumn[i].id.replace("custpage_col", "custpage");
                    let field = mainForm.addField({
                        id: id,
                        type: serverWidget.FieldType.SELECT,
                        label: arrColumn[i].label,
                        source: 'vendor',
                        container: mainGrp.id
                    });
                    field.setHelpText({
                        help: arrColumn[i].label
                    });
                    if (!!params[id]) {
                        field.defaultValue = params[id];
                    }
                }
                else if (arrColumn[i].id.includes("subsidiary")) {
                    let id = arrColumn[i].id.replace("custpage_col", "custpage");
                    let field = mainForm.addField({
                        id: id,
                        type: serverWidget.FieldType.MULTISELECT,
                        label: arrColumn[i].label,
                        container: mainGrp.id
                    });
                    onLoadSubsidiaryRole(field);
                    field.setHelpText({
                        help: arrColumn[i].label
                    });
                    if (params[id]) {
                        field.defaultValue = params[id].split(",");
                    }
                }
            }
        }
        
        const configLabelToKeyObj = (_label) => {
            let labelString = _label.toLowerCase();
            labelString = removeVietnameseTones(labelString).trim();
            labelString = labelString.replaceAll(" ", "_");
            labelString = "custpage_col_" + labelString;
            return labelString;
        }
        
        const onLoadSubsidiaryRole = (_subsidiaryField) => {
            let crrUserRec = runtime.getCurrentUser();
            let roleRec = record.load({type: "role", id: crrUserRec.role});
            let subsidiary_op = roleRec.getValue("subsidiaryoption");
            let myFilter = [];
            switch (subsidiary_op) {
                case 'ALL':
                    myFilter = [];
                    break;
                case 'ALLACTIVE':
                    myFilter = [['isinactive', 'is', false]];
                    break;
                case 'OWN':
                    let empRec = record.load({type: record.Type.EMPLOYEE, id: crrUserRec.id});
                    myFilter = ['internalid', "anyOf", empRec.getValue("subsidiary")];
                    break;
                case 'SELECTED':
                    let arrSubSel = roleRec.getValue("subsidiaryrestriction");
                    myFilter = ['internalid', "anyOf", arrSubSel]
                    break;
            }
            let subSearch = search.create({
                type: "subsidiary",
                filters: myFilter,
                columns: ["name", "parent"]
            });
            subSearch = subSearch.run().getRange(0, 1000);
            for (let item in subSearch) {
                let name = subSearch[item].getValue('name');
                name = name.substring(name.lastIndexOf(":") + 1, name.length).trim();
                _subsidiaryField.addSelectOption({
                    value: subSearch[item].id,
                    text: name,
                });
            }
        }
        
        const removeVietnameseTones = (str) => {
            if (!str) return "";
            str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
            str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
            str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
            str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
            str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
            str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
            str = str.replace(/đ/g, "d");
            str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
            str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
            str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
            str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
            str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
            str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
            str = str.replace(/Đ/g, "D");
            // Some system encode vietnamese combining accent as individual utf-8 characters
            // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
            str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
            str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
            // Remove extra spaces
            // Bỏ các khoảng trắng liền nhau
            str = str.replace(/ + /g, " ");
            str = str.trim();
            return str;
        }
        
        const changeCurrency = (number) => {
            //return (new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(number));
            let parts = number.toString().split(".");
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            return parts.join(",");
            //return number.toLocaleString('de-DE');
        }
        
        const onCreateSublistColumn = (_sublist, _columns, _showid) => {
            let arrColumn = [{label: "Select", type: "checkbox", id: "custpage_col_chk", displayType: "entry"}];
            let arrColumnSS = _columns.filter(e => e.id !== "custpage_col_internal_id");
            arrColumn = [...arrColumn, ...arrColumnSS];
            arrColumn.push({
                label: "Record Id",
                type: "text",
                id: "custpage_record_id",
                displayType: _showid === "T" ? "inline" : "hidden"
            });
            for (let i = 0; i < arrColumn.length; i++) {
                _sublist.addField({
                    id: arrColumn[i].id,
                    type: arrColumn[i].type,
                    label: arrColumn[i].label,
                }).updateDisplayType({displayType: arrColumn[i].displayType || "inline"});
            }
        }
        
        const setRowDataSublist = (_sublist, _line, _field, _data) => {
            for (let i = 0; i < _field.length; i++) {
                addValueColField(_sublist, _field[i], _line, _data[i]);
            }
        }
        
        const addValueColField = (sublist, id, line, value) => {
            if (value || value === 0) {
                sublist.setSublistValue({
                    id: id,
                    line: line,
                    value: value
                });
            }
        }
        
        const getFromDate = (fromdt) => {
            if (fromdt) {
                return fromdt
            }
        }
        
        const getToDate = (_todt) => {
            if (_todt) {
                return _todt
            }
        }
        
        const addFieldGroup = (_form, _id, _label) => {
            let _obj = {id: _id, label: _label}
            _form.addFieldGroup(_obj);
            return _obj;
        }
        
        return {onRequest}
        
    });
