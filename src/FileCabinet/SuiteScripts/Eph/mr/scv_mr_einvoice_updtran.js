/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/runtime', 'N/search', '../lib/scv_lib_report', '../lib/scv_lib_einvoice'],

(record, runtime, search, libRep, libEinv) => {
   
    /**
     * Marks the beginning of the Map/Reduce process and generates input data.
     *
     * @typedef {Object} ObjectRef
     * @property {number} id - Internal ID of the record instance
     * @property {string} type - Record type id
     *
     * @return {Array|Object|Search|RecordRef} inputSummary
     * @since 2015.1
     */
	const getInputData = () => {
    	let currScript = runtime.getCurrentScript();
    	let smtTranId = currScript.getParameter({name: 'custscript_scv_smt_tran_id'});
		let listUp = [];
		if(smtTranId) {
			pushListToUpdate(listUp, smtTranId);
		} else {
			let sqlSummaryTransactionToUpdate = "select etu.id, etu.custrecord_scv_etu_transaction from customrecord_scv_einvoice_summary_toupd etu where etu.isinactive = 'F'";
			let listSummaryTransactionToUpdate = [];
			libRep.doSearchSqlAll(listSummaryTransactionToUpdate, sqlSummaryTransactionToUpdate, []);
			let numberCanHandle = listSummaryTransactionToUpdate.length > 600 ? 600 : listSummaryTransactionToUpdate.length;
			for(let i = 0; i < numberCanHandle; i++) {
				if(listSummaryTransactionToUpdate[i].custrecord_scv_etu_transaction) {
					pushListToUpdate(listUp, listSummaryTransactionToUpdate[i].custrecord_scv_etu_transaction);
				}
				record.submitFields({type: 'customrecord_scv_einvoice_summary_toupd', id: listSummaryTransactionToUpdate[i].id, values: {isinactive: true}});
			}
		}
		return listUp;
    }
	
	const pushListToUpdate = (listUp, smtTranId) => {
		let recSumTransaction = record.load({type: 'customsale_scv_sum_transaction', id: smtTranId});
		let sl = 'item';
		let originno_first = recSumTransaction.getSublistValue({sublistId: sl, fieldId: 'custcol_scv_sumtrans_line_originno', line: 0});
		let recordtype = getRecordTypeTran(originno_first);
		
		let lc = recSumTransaction.getLineCount(sl);
		let objOrg = {}, originno;
		let einvoice_status = recSumTransaction.getValue('custbody_scv_einvoice_action');
		for(let i = 0; i < lc; i++) {
			originno = recSumTransaction.getSublistValue({sublistId: sl, fieldId: 'custcol_scv_sumtrans_line_originno', line: i});
			if(originno && !objOrg[originno]) {
				objOrg[originno] = originno;
			}
		}
		let listOrg = Object.keys(objOrg);
		let lOrg = listOrg.length;
		if(lOrg > 0) {
			let objTemp;
			if(einvoice_status === libEinv.EinvoiceStatus.HOA_DON_XOA_BO) {
				objTemp = {custbody_scv_einvoice_action: libEinv.EinvoiceStatus.HOA_DON_XOA_BO};
			} else {
				objTemp = {
					custbody_scv_einvoice_code: recSumTransaction.getValue('custbody_scv_einvoice_code'),
					custbody_scv_invoice_serial: recSumTransaction.getValue('custbody_scv_invoice_serial'),
					custbody_scv_invoice_number: recSumTransaction.getValue('custbody_scv_invoice_number'),
					custbody_scv_invoice_date: recSumTransaction.getText('custbody_scv_invoice_date'),
					custbody_scv_einvoice_action: recSumTransaction.getValue('custbody_scv_einvoice_action'),
					custbody_scv_invoice_adjust_type: recSumTransaction.getValue('custbody_scv_invoice_adjust_type'),
					custbody_scv_invoice_pattern: recSumTransaction.getValue('custbody_scv_invoice_pattern'),
					custbody_scv_summary_transaction: smtTranId,
					custbody_scv_einvoice_seri: recSumTransaction.getValue('custbody_scv_einvoice_seri'),
					custbody_scv_cqt_status: recSumTransaction.getValue('custbody_scv_cqt_status'),
					custbody_scv_cqt_code: recSumTransaction.getValue('custbody_scv_cqt_code'),
					custbody_scv_cqt_error: recSumTransaction.getValue('custbody_scv_cqt_error')
				};
			}
			
			for(let i = 0; i < lOrg; i++) {
				listUp.push({type: recordtype, id: listOrg[i], values: objTemp});
			}
		}
	}
	
	const getRecordTypeTran = (originno) => {
    	let recordtype = '';
    	if(originno) {
	    	let lkT = search.lookupFields({type: 'transaction', id: originno, columns: ['recordtype']});
	    	recordtype = lkT.recordtype;
    	}
    	return recordtype;
    }
    
    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
	const map = (context) => {
    	let valueS = context.value; log.debug('valueS', valueS);
    	try {
    		let objVl = JSON.parse(valueS);
    		let lkT = search.lookupFields({type: objVl.type, id: objVl.id, columns: ['custbody_scv_einvoice_action', 'custbody_scv_invoice_number']});
			let einvoice_action = lkT.custbody_scv_einvoice_action[0]?.value;
			let invoice_number = lkT.custbody_scv_invoice_number;
			if(einvoice_action !== objVl.values.custbody_scv_einvoice_action || invoice_number !== objVl.values.custbody_scv_invoice_number) {
				record.submitFields(objVl);
			}
		} catch (e) {
			// TODO: handle exception
			log.debug('exception', e);
		}
    }

    /**
     * Executes when the reduce entry point is triggered and applies to each group.
     *
     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
     * @since 2015.1
     */
	const reduce = (context) => {

    }


    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
	const summarize = (summary) => {

    }

    return {
        getInputData,
        map,
        reduce,
        summarize
    };
});
