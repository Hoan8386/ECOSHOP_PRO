/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/format', 'N/cache', 'N/redirect', 'N/runtime', 'N/search', 'N/ui/message', 'N/ui/serverWidget', 'N/task',
        '../lib/scv_lib_function.js', '../lib/scv_lib_report.js', '../lib/scv_lib_common_info.js'],
    
    (format, cache, redirect, runtime, search, message, serverWidget, task, libFunc, libRep, libCommonInfo) => {
        
        const Sublist = {
            RESULT: 'custpage_sl_result'
        }
        
        const Field = {
            SELECT: 'custpage_select'
        }
        
        const ActionType = {
            PHAT_HANH_HD: '1',
            DIEU_CHINH_HD: '2',
        };
        
        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} context
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
         * @Since 2015.2
         */
        const onRequest = (context) => {
            let request = context.request;
            let response = context.response;
            let parameters = request.parameters;
            let subsidiary = parameters.custpage_subsidiary;
            let action = parameters.action;
            if(action === 'getUrlTemplate') {
                response.setHeader({ name: 'Content-Type', value: 'application/json' });
                let objDataHeader = libCommonInfo.getInforReport({ subsidiary: subsidiary});
                response.write(JSON.stringify({urlTemplate: libCommonInfo.getUrlFileTemplate('EXCEL', 'scv_xlsx_phhdhl.xlsx'), objDataHeader}));
                return;
            }
            
            let isRun = true;
            if (!subsidiary) {
                let userObj = runtime.getCurrentUser();
                subsidiary = userObj.subsidiary;
                parameters.custpage_subsidiary = subsidiary;
                isRun = false;
            }
            
            let myCache = cache.getCache({
                name: 'crunInvList',
                scope: cache.Scope.PUBLIC
            });
            let {messageInfo, iscomplete} = getMessage(parameters, myCache);
            
            let {sublistId, mapReduceDeployment, savedSearchId, columns} = getMasterData(parameters);
            if (request.method === 'GET') {
                let form = createForm(parameters, messageInfo);
                let sublist = createSublist(form, sublistId);
                
                if (isRun && iscomplete) {
                    libRep.addFieldSublistColId(sublist, columns);
                    let listData = [], filter = [];
                    if (parameters.isSearch === 'T') {
                        pushFilter(parameters, filter);
                        pushFilterAddtion(filter);
                        libRep.doSearchSSRangeLabelId(savedSearchId, 1000, listData, filter);
                    }
                    setSublistValueLine(sublist, columns, listData);
                }
                response.writePage(form);
            } else {
                let listDataSelect = getDataSelect(request, sublistId, Field.SELECT);
                let mrTaskId = '';
                try {
                    let mrTask = task.create({
                        taskType: task.TaskType.MAP_REDUCE,
                        scriptId: mapReduceDeployment.scriptId,
                        deploymentId: mapReduceDeployment.deploymentId
                    });
                    mrTask.params = {[mapReduceDeployment.paramListValue]: JSON.stringify(listDataSelect)};
                    mrTaskId = mrTask.submit();
                    myCache.put({key: 'mrTaskId', value: mrTaskId});
                } catch (e) {
                    log.error('exception', e);
                }
                
                redirect.toSuitelet({
                    scriptId: 'customscript_scv_sl_einvoice_issue_batch',
                    deploymentId: 'customdeploy_scv_sl_einvoice_issue_batch',
                    parameters: copyParameters(parameters)
                });
            }
        }
        
        const setSublistValueLine = (sublist, columns, listData) => {
            let line = 0;
            for (let objData of listData) {
                for (let objCol of columns) {
                    let tempValue = objData[objCol.id];
                    if (tempValue) {
                        if (typeof tempValue === 'string') {
                            tempValue = tempValue.substring(0, 300);
                        }
                        sublist.setSublistValue({id: objCol.id, line: line, value: tempValue});
                    }
                }
                line++;
            }
        }
        
        const getDataSelect = (request, sublistId, fieldSelect) => {
            let lc = request.getLineCount({group: sublistId});
            let listDataSelect = [];
            for (let i = 0; i < lc; i++) {
                let vCheck = request.getSublistValue({group: sublistId, name: fieldSelect, line: i});
                if (vCheck === 'T') {
                    listDataSelect.push({
                        id: request.getSublistValue({group: sublistId, name: 'internalid', line: i}),
                        type: request.getSublistValue({group: sublistId, name: 'recordtype', line: i}),
                        //adjust_for: request.getSublistValue({group: sublistId, name: 'adjustfor', line: i}),
                        //adjust_type: request.getSublistValue({group: sublistId, name: 'einvoiceadjusttype', line: i}),
                        einvoiceform: request.getSublistValue({group: sublistId, name: 'einvoiceform', line: i}),
                        subsidiary: request.getSublistValue({group: sublistId, name: 'subsidiary', line: i}),
                    });
                }
            }
            return listDataSelect;
        }
        
        let copyParameters = (parameters, mrTaskId) => {
            return {
                custpage_subsidiary: parameters.custpage_subsidiary,
                custpage_location: parameters.custpage_location,
                custpage_customer: parameters.custpage_customer,
                custpage_date_dauky: parameters.custpage_date_dauky,
                custpage_date_cuoiky: parameters.custpage_date_cuoiky,
                custpage_createdby: parameters.custpage_createdby,
                mrTaskId
            }
        }
        
        const getMessage = (parameters, myCache) => {
            let mrTaskId = parameters.mrTaskId;
            if (!mrTaskId) {
                mrTaskId = myCache.get({key: 'mrTaskId', loader: 'loader'});
            }
            let messageInfo = '', iscomplete = true;
            if (mrTaskId) {
                let taskStatus = task.checkStatus(mrTaskId);
                messageInfo = 'TaskId: ' + mrTaskId + ', Phát hành hóa đơn hàng loạt: ' + taskStatus.status;
                if (taskStatus.status === 'COMPLETE' || taskStatus.status === 'FAILED' || taskStatus.status === 'CANCELED') {
                    myCache.remove({key: 'mrTaskId'});
                } else {
                    iscomplete = false;
                }
            }
            return {messageInfo, iscomplete};
        }
        
        const createForm = (parameters, messageInfo) => {
            let form = serverWidget.createForm({
                title: 'Phát hành hóa đơn hàng loạt'
            });
            if (!!messageInfo) {
                form.addPageInitMessage({type: message.Type.INFORMATION, message: messageInfo, duration: -1});
            }
            form.clientScriptModulePath = '../cssl/scv_cs_sl_einvoice_issue_batch.js';
            form.addButton({id: 'custpage_bt_search', label: 'Tìm kiếm', functionName: 'searchInitEinvoice()'});
            form.addButton({id: 'custpage_bt_recal', label: 'Recal Header', functionName: 'recalTotal()'});
            form.addButton({id: 'custpage_bt_export', label: 'Export', functionName: 'exportResult()'});
            
            addFieldSearch(form, parameters);
            addFieldTotal(form);
            form.addSubmitButton({
                label: 'Phát hành hóa đơn'
            });
            
            return form;
        }
        
        const createSublist = (form, sublistId) => {
            let sublist = form.addSublist({
                id: sublistId,
                type: serverWidget.SublistType.LIST,
                label: 'KẾT QUẢ'
            });
            sublist.addButton({id: 'custpage_bt_mark100', label: 'Mark (100)', functionName: 'mark100()'});
            sublist.addMarkAllButtons();
            
            return sublist;
        }
        
        const addSelectRecordType = (fRep, type) => {
            let listReport = [{value: ActionType.PHAT_HANH_HD, label: 'Phát hành'}];//, {value: ActionType.DIEU_CHINH_HD, label: 'Điều chỉnh'}
            libRep.addSelecttionFrList(fRep, type, listReport);
        }
        
        const addFieldSearch = (form, parameters) => {
            let fieldGroupId = 'fieldgroup_main';
            form.addFieldGroup({
                id: fieldGroupId,
                label: 'Filter'
            });
            
            let fieldType = form.addField({
                id: 'custpage_type', type: serverWidget.FieldType.SELECT,
                label: 'Type', container: fieldGroupId
            });
            addSelectRecordType(fieldType, parameters.custpage_type || ActionType.PHAT_HANH_HD);
            fieldType.isMandatory = true;
            
            let fieldSubsidiary = form.addField({
                id: 'custpage_subsidiary', type: serverWidget.FieldType.SELECT,
                label: 'Subsidiary', container: fieldGroupId
            });
            libRep.addSelectSubsidiary(fieldSubsidiary, parameters.custpage_subsidiary);
            fieldSubsidiary.isMandatory = true;
            
            let fieldLocation = form.addField({
                id: 'custpage_location', type: serverWidget.FieldType.SELECT,
                label: 'Location', container: fieldGroupId //, source: 'location'
            });
            let fl = [['subsidiary', 'anyOf', parameters.custpage_subsidiary], 'and', ['isinactive', 'is', false]];
            libRep.addSelection(fieldLocation, 'location', ['internalid', 'namenohierarchy'], fl, true, parameters.custpage_location);
            
            let fieldCustomer = form.addField({
                id: 'custpage_customer', type: serverWidget.FieldType.SELECT,
                label: 'Khách hàng', container: fieldGroupId, source: 'customer'
            });
            fieldCustomer.defaultValue = parameters.custpage_customer;
            
            let fieldDateDauky = form.addField({
                id: 'custpage_date_dauky', type: serverWidget.FieldType.DATE,
                label: 'Từ ngày', container: fieldGroupId
            }).updateLayoutType({layoutType: serverWidget.FieldLayoutType.STARTROW});
            fieldDateDauky.defaultValue = parameters.custpage_date_dauky || format.format({
                type: format.Type.DATE,
                value: libFunc.getDateNow()
            });
            fieldDateDauky.isMandatory = true;
            
            let fieldDateCuoiky = form.addField({
                id: 'custpage_date_cuoiky', type: serverWidget.FieldType.DATE,
                label: 'Đến ngày', container: fieldGroupId
            }).updateLayoutType({layoutType: serverWidget.FieldLayoutType.ENDROW});
            fieldDateCuoiky.defaultValue = parameters.custpage_date_cuoiky || format.format({
                type: format.Type.DATE,
                value: libFunc.getDateNow()
            });
            fieldDateCuoiky.isMandatory = true;
            
            let custpage_createdby = form.addField({
                id: 'custpage_createdby', type: serverWidget.FieldType.SELECT,
                label: 'Người tạo', container: fieldGroupId, source: 'employee'
            });
            custpage_createdby.defaultValue = parameters.custpage_createdby;
        }
        
        const addFieldTotal = (form) => {
            form.addFieldGroup({
                id: 'fieldgroup_dc_default',
                label: 'Total'
            });
            
            let fieldTotalamount = form.addField({
                id: 'custpage_totalamount', type: serverWidget.FieldType.FLOAT,
                label: 'Total Amount', container: 'fieldgroup_dc_default'
            });
            fieldTotalamount.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
            });
            
            let fieldTotaltax = form.addField({
                id: 'custpage_totaltax', type: serverWidget.FieldType.FLOAT,
                label: 'Total Tax', container: 'fieldgroup_dc_default'
            });
            fieldTotaltax.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
            });
            
            let fieldTotalgross = form.addField({
                id: 'custpage_totalgross', type: serverWidget.FieldType.FLOAT,
                label: 'Total Gross', container: 'fieldgroup_dc_default'
            });
            fieldTotalgross.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
            });
        }
        
        const pushFilterAddtion = (filter) => {
            let sqlBackLog = `select bl.id, bl.custrecord_scv_einvoice_bl_data data from customrecord_scv_einvoice_backlog bl where bl.isinactive = 'F'`;
            let listBackLog = [];
            libRep.doSearchSqlAll(listBackLog, sqlBackLog, []);
            let listDatas = [];
            listBackLog.forEach(objBacklog => {
                let listData = JSON.parse(objBacklog.data);
                listDatas.push(...listData);
            });
            let listIds = Array.from(new Set(listDatas.map(o => o.id)));
            if (listIds.length > 0) {
                filter.push({name: 'internalid', operator: search.Operator.NONEOF, values: listIds});
            }
        }
        
        const pushFilter = (parameters, filter) => {
            filter.push({name: 'subsidiary', operator: search.Operator.ANYOF, values: parameters.custpage_subsidiary});
            filter.push(search.createFilter({name: 'custbody_scv_auto_issue_e_inv', operator: search.Operator.IS, values: 'F'}));
            if (parameters.custpage_location) {
                filter.push({name: 'location', operator: search.Operator.ANYOF, values: parameters.custpage_location});
            }
            if (parameters.custpage_customer) {
                filter.push({name: 'entity', operator: search.Operator.ANYOF, values: parameters.custpage_customer});
            }
            filter.push({
                name: 'trandate',
                operator: search.Operator.WITHIN,
                values: [parameters.custpage_date_dauky, parameters.custpage_date_cuoiky]
            });
            if (parameters.custpage_createdby) {
                filter.push({
                    name: 'createdby',
                    operator: search.Operator.ANYOF,
                    values: parameters.custpage_createdby
                });
            }
        }
        
        const getMasterData = () => {
            let sublistId = Sublist.RESULT, savedSearchId = 'customsearch_scv_einvoice_phhl';
            let mapReduceDeployment = {
                scriptId: 'customscript_scv_mr_einvoice_issue_batch',
                deploymentId: 'customdeploy_scv_mr_einvoice_issue_batch',
                paramListValue: 'custscript_scv_mr_einvoice_batch'
            }
            let columns = [
                {id: Field.SELECT, label: 'Chọn', type: serverWidget.FieldType.CHECKBOX},
                {id: 'internalid', label: 'internalid', type: 'text', display: 'hidden'},
                {id: 'recordtype', label: 'recordtype', type: 'text', display: 'hidden'},
                {id: 'subsidiary', label: 'subsidiary', type: 'text', display: 'hidden'},
                {id: 'docno', label: 'Doc No', type: 'text', display: 'disabled'},
                {id: 'trandate', label: 'Date', type: 'text', display: 'disabled'},
                {id: 'customercode', label: 'Customer Code', type: 'text', display: 'disabled'},
                {id: 'customer', label: 'Customer', type: 'text', display: 'disabled'},
                {id: 'taxid', label: 'Tax ID', type: 'text', display: 'disabled'},
                {id: 'address', label: 'Address', type: 'text', display: 'disabled'},
                {id: 'amount', label: 'Amount', type: 'float', display: 'disabled'},
                {id: 'taxamount', label: 'Tax Amount', type: 'float', display: 'disabled'},
                {id: 'grossamount', label: 'Gross Amount', type: 'float', display: 'disabled'},
                {id: 'einvoiceform', label: 'E Invoice Form', type: 'text', display: 'hidden'},
                {id: 'einvoiceform_display', label: 'E Invoice Form', type: 'text', display: 'disabled'}
            ];
            return {sublistId, mapReduceDeployment, savedSearchId, columns};
        }
        
        return {
            onRequest
        };
        
    });
