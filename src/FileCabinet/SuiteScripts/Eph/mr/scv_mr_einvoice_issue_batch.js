/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/format', 'N/record', 'N/runtime', 'N/search',
        '../lib/scv_lib_function.js', '../lib/scv_lib_report.js', '../lib/scv_lib_einvoice.js'],

    (format, record, runtime, search, libFunc, libRep, libEinv) => {
        /**
         * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
         * @param {Object} inputContext
         * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Object} inputContext.ObjectRef - Object that references the input data
         * @typedef {Object} ObjectRef
         * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
         * @property {string} ObjectRef.type - Type of the record instance that contains the input data
         * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
         * @since 2015.2
         */

        const getInputData = (inputContext) => {
            let currScript = runtime.getCurrentScript();
            let isSch = JSON.parse(currScript.getParameter({name: 'custscript_scv_mr_einvoice_batch_issch'}));
            let einvoice_batch = currScript.getParameter({name: 'custscript_scv_mr_einvoice_batch'});
            let einvoiceBatchs;
            if (isSch === true || !einvoice_batch) {
                let listData = [], filter = [];
                pushFilterAddtion(filter);
                libRep.doSearchSSRangeLabelId('customsearch_scv_einvoice_phhl_sch', 1000, listData, filter);
                einvoiceBatchs = listData.map(o => {
                    return {
                        id: o.internalid,
                        type: o.recordtype,
                        einvoiceform: o.einvoiceform,
                        subsidiary: o.subsidiary,
                    }
                });
            } else if(einvoice_batch) {
                einvoiceBatchs = JSON.parse(einvoice_batch);
            }
            let listEinvoiceForm = Array.from(new Set(einvoiceBatchs.map(o => `${o.einvoiceform};${o.subsidiary};${o.adjust_for || ''};${o.replace_for || ''}`)));
            let listBatchEinvoice = [];
            listEinvoiceForm.forEach((einvoiceFormAndSub) => {
                let listBatchEinvoiceChild = einvoiceBatchs.filter(o => `${o.einvoiceform};${o.subsidiary};${o.adjust_for || ''};${o.replace_for || ''}` === einvoiceFormAndSub);
                pushListBach(listBatchEinvoice, listBatchEinvoiceChild);
            });

            return listBatchEinvoice;
        }

        const pushListBach = (listBatch, iputBatchs) => {
            if (iputBatchs.length > 10) {
                listBatch.push(iputBatchs.splice(0, 10));
                pushListBach(listBatch, iputBatchs);
            } else if (iputBatchs.length > 0) {
                listBatch.push(iputBatchs);
            }
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

        /**
         * Defines the function that is executed when the map entry point is triggered. This entry point is triggered automatically
         * when the associated getInputData stage is complete. This function is applied to each key-value pair in the provided
         * context.
         * @param {Object} mapContext - Data collection containing the key-value pairs to process in the map stage. This parameter
         *     is provided automatically based on the results of the getInputData stage.
         * @param {Iterator} mapContext.errors - Serialized errors that were thrown during previous attempts to execute the map
         *     function on the current key-value pair
         * @param {number} mapContext.executionNo - Number of times the map function has been executed on the current key-value
         *     pair
         * @param {boolean} mapContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} mapContext.key - Key to be processed during the map stage
         * @param {string} mapContext.value - Value to be processed during the map stage
         * @since 2015.2
         */

        const map = (mapContext) => {
            mapContext.write({key: mapContext.key, value: JSON.parse(mapContext.value)});
        }

        /**
         * Defines the function that is executed when the reduce entry point is triggered. This entry point is triggered
         * automatically when the associated map stage is complete. This function is applied to each group in the provided context.
         * @param {Object} reduceContext - Data collection containing the groups to process in the reduce stage. This parameter is
         *     provided automatically based on the results of the map stage.
         * @param {Iterator} reduceContext.errors - Serialized errors that were thrown during previous attempts to execute the
         *     reduce function on the current group
         * @param {number} reduceContext.executionNo - Number of times the reduce function has been executed on the current group
         * @param {boolean} reduceContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} reduceContext.key - Key to be processed during the reduce stage
         * @param {List<String>} reduceContext.values - All values associated with a unique key that was passed to the reduce stage
         *     for processing
         * @since 2015.2
         */
        const reduce = (reduceContext) => {
            log.debug('reduceContext.values', reduceContext.values);
            try {
                let listBatch = JSON.parse(reduceContext.values[0]);
                let einvoice_code = listBatch[0].einvoiceform;
                let subsidiary = listBatch[0].subsidiary;
                let {lkEIC, eic_econfig, lkEconfig} = libEinv.getInfoConfig(einvoice_code, subsidiary);
                let ec_taxcode = lkEconfig.custrecord_scv_ec_taxcode;
                let accessToken = lkEconfig.custrecord_scv_ec_beartoken;
                let headers = libEinv.makeHeaderBearer(accessToken);
                let urlPost = lkEconfig.custrecord_scv_ec_domain + libEinv.ApiPathEinvoice.TAO_MOI_HOA_DON;
                let einvoice_status = libEinv.EinvoiceStatus.HOA_DON_GOC, history_name = 'Create EInvoice',
                    history_memo = 'Create EInvoice', lkOrg = null, original_invoice_date = null;
                if (listBatch[0].replace_for || listBatch[0].adjust_for) {
                    lkOrg = search.lookupFields({
                        type: search.Type.TRANSACTION,
                        id: listBatch[0].replace_for || listBatch[0].adjust_for,
                        columns: ['custbody_scv_e_transaction_uuid', 'custbody_scv_invoice_date', 'custbody_scv_invoice_serial', 'custbody_scv_invoice_number', 'custbody_scv_einvoice_code.custrecord_scv_eic_type']
                    });
                    if (listBatch[0].replace_for) {
                        einvoice_status = libEinv.EinvoiceStatus.HOA_DON_THAY_THE;
                        history_name = 'Replace EInvoice';
                        history_memo = 'Replace EInvoice';
                        urlPost = lkEconfig.custrecord_scv_ec_domain + libEinv.ApiPathEinvoice.THAY_THE_HOA_DON;
                    } else {
                        einvoice_status = libEinv.EinvoiceStatus.HOA_DON_DIEU_CHINH;
                        history_name = 'Adjust EInvoice';
                        history_memo = 'Adjust EInvoice';
                        urlPost = lkEconfig.custrecord_scv_ec_domain + libEinv.ApiPathEinvoice.DIEU_CHINH_HOA_DON;
                    }
                    let original_invoice_date_text = lkOrg.custbody_scv_invoice_date;
                    original_invoice_date = format.parse({type: format.Type.DATE, value: original_invoice_date_text});
                }

                let nameAudit = history_name;
                let date_now = libEinv.getDateNow(7);
                let listSearchTranUuid = [], listSubmitFields = [], listDataEIH = [], resCall, resultBody;
                for (let objBatch of listBatch) {
                    let newRecord = record.load({type: objBatch.type, id: objBatch.id});
                    let transactionUuid = libEinv.getTransactionUuidCreate(newRecord);
                    let invoice_date = newRecord.getValue('custbody_scv_invoice_date') || date_now;
                    let old_transaction_uuid = newRecord.getValue('custbody_scv_e_transaction_uuid');

                    if (transactionUuid === old_transaction_uuid) {
                        ({
                            resCall,
                            accessToken,
                            resultBody
                        } = libEinv.getInvoiceInfo(lkEconfig, eic_econfig, headers, ec_taxcode, transactionUuid));
                    }
                    if (transactionUuid !== old_transaction_uuid || !resCall || resCall.code !== 200) {
                        if (!invoice_date) {
                            invoice_date = libEinv.getDateNow(7);
                        }
                        let invoiceCreatedDate = libEinv.convertDateToString(invoice_date);
                        let sign_quantity = 1, sign_price = 1;
                        let adjust_type = newRecord.getValue('custbody_scv_invoice_adjust_type');
                        if (adjust_type === libEinv.AdjustType.DIEU_CHINH_GIAM) {
                            sign_quantity = -1;
                        } else if (adjust_type === libEinv.AdjustType.DIEU_CHINH_GIAM_GIA) {
                            sign_price = -1;
                        }

                        let body = libEinv.getBody(newRecord, lkEconfig, lkEIC, {
                            transactionUuid,
                            sign_quantity,
                            sign_price,
                            invoiceCreatedDate
                        });
                        if(lkOrg) {
                            body.invoice.refRequestId = lkOrg.custbody_scv_e_transaction_uuid;
                            body.invoice.relatedInvoiceCreatedDate = libEinv.convertDateToString(original_invoice_date);
                            if(!lkOrg.custbody_scv_e_transaction_uuid) {
                                body.invoice.relatedInvoiceSymbol = lkOrg.custbody_scv_invoice_serial;
                                body.invoice.relatedInvoiceNumber = lkOrg.custbody_scv_invoice_number;
                                body.invoice.relatedInvoiceType = Number(lkOrg['custbody_scv_einvoice_code.custrecord_scv_eic_type']);
                                for(let objProduct of body.invoice.products) {
                                    objProduct.isAdjustment = 0;
                                }
                            }
                            body.invoice.invoiceNote = null;
                        }

                        let strBody = JSON.stringify(body);
                        try {
                            headers = libEinv.makeHeaderBearer(accessToken);
                            ({
                                resCall,
                                accessToken
                            } = libEinv.callApiPost(urlPost, headers, strBody, lkEconfig, eic_econfig));
                            libEinv.saveAudit(nameAudit, strBody, resCall, newRecord.id);
                        } catch (e) {
                            if (e.name === 'SSS_REQUEST_TIME_EXCEEDED') {
                                record.submitFields({
                                    type: type,
                                    id: id,
                                    values: {custbody_scv_e_transaction_uuid: transactionUuid}
                                });
                            }
                            libEinv.saveAudit(nameAudit, strBody, e, newRecord.id);
                            log.error('exception call api', e);
                            continue;
                        }

                        resultBody = JSON.parse(resCall.body);
                        if (libEinv.CodeResponse.DA_TON_TAI === resultBody.code) {
                            headers = libEinv.makeHeaderBearer(accessToken);
                            ({
                                resCall,
                                resultBody
                            } = libEinv.getInvoiceInfo(lkEconfig, eic_econfig, headers, ec_taxcode, transactionUuid));
                            if (resCall.code !== 200) continue;
                        } else if (resCall.code !== 200) continue;
                    }

                    let data = resultBody.data;
                    let lookupCode = data.lookupCode;
                    let cqt_code = data.taxAuthorityCode;
                    let serial = data.invoiceSymbol;
                    let invoice_number = data.invoiceNumber;
                    if (data.invoiceCreatedDate) {
                        invoice_date = libEinv.convertToDate(data.invoiceCreatedDate);
                    }

                    let date_text = format.format({value: invoice_date, type: format.Type.DATE});
                    let objEinvoiceTran = {
                        custbody_scv_invoice_serial: serial,
                        custbody_scv_invoice_number: invoice_number,
                        custbody_scv_einvoice_reservation_code: lookupCode,
                        custbody_scv_invoice_date: date_text,
                        custbody_scv_einvoice_action: libEinv.EinvoiceStatus.HOA_DON_GOC,
                        custbody_scv_e_transaction_uuid: transactionUuid,
                        custbody_scv_cqt_status: '',
                        custbody_scv_cqt_code: cqt_code,
                        custbody_scv_cqt_error: '',
                        custbody_scv_einvoice_replace_times: newRecord.getValue('custbody_scv_einvoice_replace_times'),
                        custbody_scv_einvoice_seri: (newRecord.getText('custbody_scv_invoice_pattern') || '') + serial + invoice_number
                    }
                    if (invoice_number) {
                        listSubmitFields.push({
                            id: objBatch.id,
                            type: objBatch.type,
                            values: objEinvoiceTran
                        });
                        let dataEIH = [einvoice_code, serial, invoice_number, invoice_date, einvoice_code, serial, invoice_number, invoice_date,
                            einvoice_status, history_memo, lookupCode, newRecord.id, history_name, transactionUuid,
                            newRecord.getValue('subsidiary')];
                        listDataEIH.push(dataEIH);
                    } else {
                        listSearchTranUuid.push({
                            id: objBatch.id,
                            type: objBatch.type,
                            einvoiceform: einvoice_code,
                            subsidiary,
                            replace_times: newRecord.getValue('custbody_scv_einvoice_replace_times'),
                            invoice_pattern: newRecord.getText('custbody_scv_invoice_pattern'),
                            invoice_date_text: date_text,
                            transactionUuid: transactionUuid
                        });
                    }
                }

                createBackLog(listSubmitFields);
                createListEinvoiceHistory(listDataEIH);
                if (listSearchTranUuid.length > 0) {
                    createSearchTranUuid(listSearchTranUuid);
                }
            } catch (e) {
                log.error('Error in reduce', e);
            }
        }

        const createSearchTranUuid = (listSearchTranUuid) => {
            let recSearchTranUuid = record.create({type: 'customrecord_scv_einvoice_searchtranuuid'});
            recSearchTranUuid.setValue('custrecord_scv_einvoice_stu_data', JSON.stringify(listSearchTranUuid));
            recSearchTranUuid.save();
        }

        const createBackLog = (listSubmitFields) => {
            let recBackLog = record.create({type: 'customrecord_scv_einvoice_backlog'});
            recBackLog.setValue('custrecord_scv_einvoice_bl_data', JSON.stringify(listSubmitFields));
            recBackLog.save();
        }

        const createListEinvoiceHistory = (listDataEIH) => {
            listDataEIH.forEach((dataEIH) => {
                createEinvoiceHistory(dataEIH);
            });
        }

        const createEinvoiceHistory = (dataEIH) => {
            let recEIH = record.create({type: 'customrecord_scv_einvoice_history'});
            let fieldEIH = ['custrecord_scv_eih_original_form', 'custrecord_scv_eih_original_serial', 'custrecord_scv_eih_original_number'
                , 'custrecord_scv_eih_original_date', 'custrecord_scv_eih_einvoice_form', 'custrecord_scv_eih_einvoice_serial'
                , 'custrecord_scv_eih_einvoice_number', 'custrecord_scv_eih_einvoice_date', 'custrecord_scv_eih_einvoice_action'
                , 'custrecord_scv_eih_einvoice_memo', 'custrecord_scv_eih_reservation_code'
                , 'custrecord_scv_eih_einvoice_reltran', 'name', 'custrecord_scv_eih_transaction_uuid'
                , 'custrecord_scv_eih_sub'];
            libFunc.setValueData(recEIH, fieldEIH, dataEIH);
            recEIH.save();
        }

        /**
         * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
         * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
         * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
         * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
         *     script
         * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
         * @param {boolean} summaryContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Iterator} summaryContext.output - Serialized keys and values that were saved as output during the reduce stage
         * @param {number} summaryContext.seconds - Total seconds elapsed when running the map/reduce script
         * @param {number} summaryContext.usage - Total number of governance usage units consumed when running the map/reduce
         *     script
         * @param {number} summaryContext.yields - Total number of yields when running the map/reduce script
         * @param {Object} summaryContext.inputSummary - Statistics about the input stage
         * @param {Object} summaryContext.mapSummary - Statistics about the map stage
         * @param {Object} summaryContext.reduceSummary - Statistics about the reduce stage
         * @since 2015.2
         */
        const summarize = (summaryContext) => {

        }

        return {getInputData, map, reduce, summarize}

    });
