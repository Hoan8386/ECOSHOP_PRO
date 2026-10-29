/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['../lib/scv_lib_function.js'],
	
	(libFunc) => {

		/**
		 * Function definition to be triggered before record is loaded.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.newRecord - New record
		 * @param {string} scriptContext.type - Trigger type
		 * @param {Form} scriptContext.form - Current form
		 * @Since 2015.2
		 */
		const beforeLoad = (scriptContext) => {
			let form = scriptContext.form;
			updateHidenField(form, 'subtotal');
			updateHidenField(form, 'discounttotal');
			updateHidenField(form, 'total');
		}
		
		const updateHidenField = (form, fieldId) => {
			let field = form.getField({id : fieldId});
			field.updateDisplayType({displayType : 'HIDDEN'});
		}

		/**
		 * Function definition to be triggered before record is loaded.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.newRecord - New record
		 * @param {Record} scriptContext.oldRecord - Old record
		 * @param {string} scriptContext.type - Trigger type
		 * @Since 2015.2
		 */
		const beforeSubmit = (scriptContext) => {
			let tgType = scriptContext.type;
			if(tgType === 'create' || tgType === 'edit' || tgType === 'copy') {
				let newRecord = scriptContext.newRecord;
				let sublistId = 'item';
				let lc = newRecord.getLineCount(sublistId);
				let totalgross = 0, totalamount = 0, totaltax = 0, taxcode;
				let aggregate = newRecord.getValue('custbody_scv_sumtrans_aggregate');
				let arrTX = [], lineFields = ['amount'];
				let temp;
				for(let i = 0; i < lc; i++) {
					temp = newRecord.getSublistValue({sublistId: sublistId, fieldId: 'custcol_scv_sumtrans_line_amount', line: i});
					if(libFunc.isContainValue(temp) === false) {
						temp = 0;
					} else {
						temp = temp * 1;
					}
					libFunc.setSublistValueData(newRecord, sublistId, lineFields, i, [temp]);
					totalamount = totalamount + temp;
					temp = newRecord.getSublistValue({sublistId: sublistId, fieldId: 'custcol_scv_sumtrans_line_taxamt', line: i});
					if(libFunc.isContainValue(temp) === false) {
						temp = 0;
					} else {
						temp = temp * 1;
					}
					totaltax = totaltax + temp;
					temp = newRecord.getSublistValue({sublistId: sublistId, fieldId: 'custcol_scv_sumtrans_line_grossamt', line: i});
					if(libFunc.isContainValue(temp) === false) {
						temp = 0;
					} else {
						temp = temp * 1;
					}
					totalgross = totalgross + temp;
					taxcode = newRecord.getSublistValue({sublistId: sublistId, fieldId: 'custcol_scv_sumtrans_line_taxcode', line: i});
					libFunc.pushArr(arrTX, taxcode);
				}
				newRecord.setValue('custbody_scv_sum_trans_amount', totalamount);
				newRecord.setValue('custbody_scv_sum_trans_taxtotal', totaltax);
				newRecord.setValue('custbody_scv_sum_trans_grossamount', totalgross);
				if((aggregate === true || aggregate === 'T') && arrTX.length > 1)  {
					throw ('Hóa đơn gộp chỉ áp dụng cho 1 loại thuế!');
				}
			}
		}

		return {
			beforeLoad,
			beforeSubmit
		};

	});
