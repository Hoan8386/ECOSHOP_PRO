/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/format', 'N/query', 'N/record',
        '../lib/scv_lib_function.js', '../lib/scv_lib_einvoice.js'],

    (format, query, record, libFunc, libEinv) => {
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
            let sqlTranUuid = `select bl.id, bl.custrecord_scv_einvoice_stu_data data from customrecord_scv_einvoice_searchtranuuid bl where bl.isinactive = 'F'`;
            let listBackLog = query.runSuiteQL({query: sqlTranUuid}).asMappedResults();
            let listDatas = [];
            listBackLog.forEach(objBacklog => {
                let listData = JSON.parse(objBacklog.data);
                record.submitFields({
                        type: 'customrecord_scv_einvoice_searchtranuuid',
                        id: objBacklog.id,
                        values: {isinactive: true}
                    }
                );
                listDatas.push({id: objBacklog.id, listData});
            });
            return listDatas;
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
                let listBatch = JSON.parse(reduceContext.values[0]).listData;
                let resCall, resultBody;
                for (let objBatch of listBatch) {
                    let einvoice_code = objBatch.einvoiceform;
                    let subsidiary = objBatch.subsidiary;
                    let {eic_econfig, lkEconfig} = libEinv.getInfoConfig(einvoice_code, subsidiary);
                    let ec_taxcode = lkEconfig.custrecord_scv_ec_taxcode;
                    let accessToken = lkEconfig.custrecord_scv_ec_beartoken;
                    let headers = libEinv.makeHeaderBearer(accessToken);

                    ({
                        resCall,
                        resultBody, accessToken
                    } = libEinv.getInvoiceInfo(lkEconfig, eic_econfig, headers, ec_taxcode, objBatch.transactionUuid));
                    if (resCall.code !== 200) continue;

                    let einvoice_status = libEinv.EinvoiceStatus.HOA_DON_GOC, history_name = 'Create EInvoice',
                        history_memo = 'Create EInvoice';
                    if (objBatch.replace_for || objBatch.adjust_for) {
                        if (objBatch.replace_for) {
                            einvoice_status = libEinv.EinvoiceStatus.HOA_DON_THAY_THE;
                            history_name = 'Replace EInvoice';
                            history_memo = 'Replace EInvoice';
                        } else {
                            einvoice_status = libEinv.EinvoiceStatus.HOA_DON_DIEU_CHINH;
                            history_name = 'Adjust EInvoice';
                            history_memo = 'Adjust EInvoice';
                        }
                    }

                    let data = resultBody.data;
                    let lookupCode = data.lookupCode;
                    let cqt_code = data.taxAuthorityCode;
                    let serial = data.invoiceSymbol;
                    let invoice_number = data.invoiceNumber;
                    let invoice_date = format.parse({value: objBatch.invoice_date_text, type: format.Type.DATE});
                    if (data.invoiceCreatedDate) {
                        invoice_date = libEinv.convertToDate(data.invoiceCreatedDate);
                    }
                    if (invoice_number) {
                        let date_text = format.format({value: invoice_date, type: format.Type.DATE});
                        let objEinvoiceTran = {
                            custbody_scv_invoice_serial: serial,
                            custbody_scv_invoice_number: invoice_number,
                            custbody_scv_einvoice_reservation_code: lookupCode,
                            custbody_scv_invoice_date: date_text,
                            custbody_scv_einvoice_action: libEinv.EinvoiceStatus.HOA_DON_GOC,
                            custbody_scv_e_transaction_uuid: objBatch.transactionUuid,
                            custbody_scv_cqt_status: '',
                            custbody_scv_cqt_code: cqt_code,
                            custbody_scv_cqt_error: '',
                            custbody_scv_einvoice_replace_times: objBatch.replace_times,
                            custbody_scv_einvoice_seri: (objBatch.invoice_pattern || '') + serial + invoice_number
                        }

                        let dataEIH = [einvoice_code, serial, invoice_number, invoice_date, einvoice_code, serial, invoice_number, invoice_date,
                            einvoice_status, history_memo, lookupCode, objBatch.id, history_name, objBatch.transactionUuid,
                            subsidiary];
                        createEinvoiceHistory(dataEIH);
                        record.submitFields({
                            id: objBatch.id,
                            type: objBatch.type,
                            values: objEinvoiceTran
                        });
                    }
                }

            } catch (e) {
                log.error('Error in reduce', e);
            }
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
