/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  15 Jan 2025         Huy Pham			    Init, create file. Employee Prepayment - Check - Journal From LGI, from ms.Thắm(https://app.clickup.com/t/86cxnrqcd)
 *  11 Feb 2025			Huy Pham				Bổ sung field tạo Journal, from ms.Thắm(https://app.clickup.com/t/86cxnrqcd?comment=90160090609877)
 */
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search'],
/**
 * @param {record} record
 * @param {search} search
 */
function(record, search) {
    
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(scriptContext) {
		let triggerType = scriptContext.type;
		if(triggerType != scriptContext.UserEventType.CREATE) {
			let oldRecord = scriptContext.oldRecord;
			let recordType = oldRecord.type;
			if((triggerType == scriptContext.UserEventType.DELETE) && (recordType == record.Type.CHECK)) {
				let custbody_scv_chk_vendor_pre_pay = oldRecord.getValue('custbody_scv_chk_vendor_pre_pay');
				if(custbody_scv_chk_vendor_pre_pay == true) {
					let idVendorCredit = searchVendorCredit(search, record, oldRecord.id);
					if(idVendorCredit != null) {
						record.delete({type: record.Type.VENDOR_CREDIT, id: idVendorCredit});
					}
				}
				let custbody_scv_employee_prepayment = oldRecord.getValue('custbody_scv_employee_prepayment');
				if(custbody_scv_employee_prepayment == true) {
					let idJournalEntry = searchJournalEntry(search, record, oldRecord.id);
					if(idJournalEntry != null) {
						record.delete({type: record.Type.JOURNAL_ENTRY, id: idJournalEntry});
					}
				}
			}
		} 
		
		if((triggerType == scriptContext.UserEventType.CREATE) || (triggerType == scriptContext.UserEventType.EDIT)) {
			let newRecord = scriptContext.newRecord;
			let oldRecord = scriptContext.oldRecord;
			let triggerType = scriptContext.type;
			let recordType = newRecord.type;
			let newLineCountItem =  newRecord.getLineCount({sublistId: 'item'});
			let newLineCountExpense  =  newRecord.getLineCount({sublistId: 'expense'});
			
			if(recordType == record.Type.CHECK) {
				let recordCR = null;
				let entity = newRecord.getValue('entity');
				let typeValue = lookVendorType(search, entity);    		
				let isDelete = false;
				let idVendorCredit = null;
				
				if(typeValue == record.Type.VENDOR) {
					let custbody_scv_chk_vendor_pre_pay = newRecord.getValue('custbody_scv_chk_vendor_pre_pay');
					if(custbody_scv_chk_vendor_pre_pay == true) {
						if(triggerType == scriptContext.UserEventType.CREATE) {
							recordCR = record.create({
								type: record.Type.VENDOR_CREDIT, isDynamic: true
							});
							createOrUpdateBillCredit(record, recordCR, newRecord, newLineCountExpense, newLineCountItem, entity, false);
						} else if(triggerType == scriptContext.UserEventType.EDIT) {
							idVendorCredit = newRecord.getValue('custbody_scv_journal_prepayment');
							if((idVendorCredit == undefined) || (idVendorCredit == null) || (idVendorCredit == '')) {
								idVendorCredit = searchVendorCredit(search, record, newRecord.id);
							}
							if(idVendorCredit != null) {
        		        		//recordCR = record.load({type : record.Type.VENDOR_CREDIT, id: idVendorCredit,  isDynamic: true});
    		        			//createOrUpdateBillCredit(record, recordCR, newRecord, newLineCountExpense, newLineCountItem, entity, true);
							} else {
								recordCR = record.create({
									type: record.Type.VENDOR_CREDIT, isDynamic: true
								});
								createOrUpdateBillCredit(record, recordCR, newRecord, newLineCountExpense, newLineCountItem, entity, false);
							}
						} 
					} else {
						if(triggerType == scriptContext.UserEventType.EDIT) {
							custbody_scv_chk_vendor_pre_pay = oldRecord.getValue('custbody_scv_chk_vendor_pre_pay');
							if(custbody_scv_chk_vendor_pre_pay == true) {
								isDelete = true;
							}
						} 
					}
				} else {
					if((triggerType == scriptContext.UserEventType.EDIT) ) {
						custbody_scv_chk_vendor_pre_pay = oldRecord.getValue('custbody_scv_chk_vendor_pre_pay');
						if(custbody_scv_chk_vendor_pre_pay == true) {
							isDelete = true;
						}
					} 
				}
				if(isDelete) {
					idVendorCredit = searchVendorCredit(search, record, newRecord.id);
					if(idVendorCredit != null) {
						recordCR = record.delete({type: record.Type.VENDOR_CREDIT,id: idVendorCredit});
						newRecord.setValue("custbody_scv_journal_prepayment", null);
					}
				}
				
        		//For employee
				isDelete = false;
				let idJournalEntry = null;
				if(typeValue == record.Type.EMPLOYEE) {
					let custbody_scv_employee_prepayment = newRecord.getValue('custbody_scv_employee_prepayment');
					let empPrePaymentAccount = lookEmployeePrePaymentAccount(search, entity);
					if(custbody_scv_employee_prepayment == true) {
						if(triggerType == scriptContext.UserEventType.CREATE) {
							recordCR = record.create({
								type: record.Type.JOURNAL_ENTRY, isDynamic: true
							});
							createOrUpdateJournalEntry(record, recordCR, newRecord, newLineCountExpense, newLineCountItem, entity, empPrePaymentAccount, false);
						} else if(triggerType == scriptContext.UserEventType.EDIT) {
							idJournalEntry = newRecord.getValue('custbody_scv_journal_prepayment');
							if((idJournalEntry == undefined) || (idJournalEntry == null) || (idJournalEntry == '')) {
								idJournalEntry = searchJournalEntry(search, record, newRecord.id);
							}
							if(idJournalEntry != null) {
        		        		//recordCR = record.load({type : record.Type.JOURNAL_ENTRY, id: idJournalEntry,  isDynamic: true});
        		        		//createOrUpdateJournalEntry(record, recordCR, newRecord, newLineCountExpense, newLineCountItem, entity, empPrePaymentAccount, true);
							} else {
								recordCR = record.create({
									type: record.Type.JOURNAL_ENTRY, isDynamic: true
								});
								createOrUpdateJournalEntry(record, recordCR, newRecord, newLineCountExpense, newLineCountItem, entity, empPrePaymentAccount, false);
							}
						} 
					} else {
						if(triggerType == scriptContext.UserEventType.EDIT) {
							custbody_scv_employee_prepayment = oldRecord.getValue('custbody_scv_employee_prepayment');
							if(custbody_scv_employee_prepayment == true) {
								isDelete = true;
							}
						} 
					}
				} else {
					if((triggerType == scriptContext.UserEventType.EDIT) ) {
						custbody_scv_employee_prepayment = oldRecord.getValue('custbody_scv_employee_prepayment');
						if(custbody_scv_employee_prepayment == true) {
							isDelete = true;
						}
					}
				}
				if(isDelete) {
					idJournalEntry = searchJournalEntry(search, record, newRecord.id);
					if(idJournalEntry != null) {
						recordCR = record.delete({type: record.Type.JOURNAL_ENTRY, id: idJournalEntry});
						newRecord.setValue("custbody_scv_journal_prepayment", null);
					}
				}
			}
		}
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
    function afterSubmit(scriptContext) {
		let triggerType = scriptContext.type;
		if(triggerType == scriptContext.UserEventType.CREATE || triggerType == scriptContext.UserEventType.EDIT) {
			let newRecord = scriptContext.newRecord;
			let entity = newRecord.getValue('entity');
			let idRelated = newRecord.getValue('custbody_scv_journal_prepayment');
			if(!!idRelated) {
				let typeValue = lookVendorType(search, entity);
				
				let lkT = search.lookupFields({type: 'transaction', id: idRelated, columns: ['custbody_scv_chk_vendor_prepay', 'custbody_scv_chk_employee_prepay']});
				let vendor_prepayment = lkT.custbody_scv_chk_vendor_prepay;
				vendor_prepayment = !!vendor_prepayment && vendor_prepayment.length > 0 ? vendor_prepayment[0].value : '';
				let employee_prepayment = lkT.custbody_scv_chk_employee_prepay;
				employee_prepayment = !!employee_prepayment && employee_prepayment.length > 0 ? employee_prepayment[0].value : '';
				if(typeValue == record.Type.VENDOR && !vendor_prepayment) {
					record.submitFields({type: record.Type.VENDOR_CREDIT, id: idRelated, values: {custbody_scv_chk_vendor_prepay: newRecord.id}});
				} else if(typeValue == record.Type.EMPLOYEE && !employee_prepayment) {
					record.submitFields({type: record.Type.JOURNAL_ENTRY, id: idRelated, values: {custbody_scv_chk_employee_prepay: newRecord.id}});
				}
			}
		}
    }
    
    function lookVendorType(search, entity) {
		let lkEntity = search.lookupFields({
			type: search.Type.ENTITY,
			id: entity,
			columns: ['type'] 
		});
		let entityType = lkEntity.type;
		let typeValue = (entityType[0].value).toLowerCase();
		if(typeValue == 'custjob') {
			let idCus = searchCustomerRelateVendor(search, entity);
			if((idCus != null) && (idCus == entity)) {
				typeValue = search.Type.VENDOR;
			}
		}
		return typeValue;
    }
    
    function searchCustomerRelateVendor(search, idCus) {
		let sCus = search.create({
			type: search.Type.CUSTOMER,
			filters: [
				['internalid', search.Operator.IS, idCus]
				, 'and',
				['otherrelationships', search.Operator.IS, 'Vendor']
			],
			columns :['companyname']
		});
		let resSearch;
		let firtSearch = null;
		resSearch = sCus.run();
		firtSearch = resSearch.getRange({start : 0, end : 1});
		let lengthSearch = 0;
		if(firtSearch != null) {
			lengthSearch = firtSearch.length;
		}
		let idRes = null;
		if(lengthSearch == 1) {
			idRes = firtSearch[0].id;
		}
		return idRes;
    }
    
    function lookEmployeePrePaymentAccount(search, entity) {
		let lkEemployee = search.lookupFields({
			type: search.Type.EMPLOYEE,
			id: entity,
			columns: ['custentity_scv_emp_prepayment_account']
		});
		let empPrePaymentAccount = lkEemployee.custentity_scv_emp_prepayment_account;
		let accountid = null;
		if((empPrePaymentAccount != undefined) && (empPrePaymentAccount != null) && (empPrePaymentAccount.length > 0)) {
			accountid = empPrePaymentAccount[0].value;
		}
		return accountid;
    }
    
    function searchVendorCredit(search, record, idCheck) {
		let searchCheck = search.create({
			type: record.Type.VENDOR_CREDIT,
			filters: [
				['custbody_scv_chk_vendor_prepay', search.Operator.IS, idCheck]
			],
			columns :['tranid']
		});
		let resSearch;
		let firtSearch = null;
		resSearch = searchCheck.run();
		firtSearch = resSearch.getRange({start : 0, end : 1});
		let lengthSearch = 0;
		if(firtSearch != null) {
			lengthSearch = firtSearch.length;
		}
		let idVendorCredit = null;
		if(lengthSearch == 1) {
			idVendorCredit = firtSearch[0].id;
		}
		return idVendorCredit;
    }
    
    function searchJournalEntry(search, record, idCheck) {
		let searchCheck = search.create({
			type: record.Type.JOURNAL_ENTRY,
			filters: [
				['custbody_scv_chk_employee_prepay', search.Operator.IS, idCheck]
			],
			columns :['tranid']
		});
		let resSearch;
		let firtSearch = null;
		resSearch = searchCheck.run();
		firtSearch = resSearch.getRange({start : 0, end : 1});
		let lengthSearch = 0;
		if(firtSearch != null) {
			lengthSearch = firtSearch.length;
		}
		let idJournalEntry = null;
		if(lengthSearch == 1) {
			idJournalEntry = firtSearch[0].id;
		}
		return idJournalEntry;
    }
    
    function createOrUpdateBillCredit(record, recordCR, newRecord, lineCountSublistExpense, lineCountSublistItem, entity, isReomveThenAddItem) {
		let i = 0;
		let amount = 0;
		let slExpense = 'expense';
		let slItem = 'item';
		let account = null;
		let item = null;
		let quantity = null;
		let taxcode = null;
		let location = null;
		let description = null;
		let memo = null;
		if(isReomveThenAddItem) {
			
		} else {
			recordCR.setValue({fieldId: 'subsidiary',value: newRecord.getValue('subsidiary')});
		}
		recordCR.setValue({fieldId: 'entity',value: entity});
		recordCR.setValue({fieldId: 'currency',value: newRecord.getValue('currency')});
		recordCR.setValue({fieldId: 'location',value: newRecord.getValue('location')});
		recordCR.setValue({fieldId: 'trandate',value: newRecord.getValue('trandate')});
		recordCR.setValue({fieldId: 'postingperiod',value: newRecord.getValue('postingperiod')});
		recordCR.setValue({fieldId: 'custbody_scv_chk_vendor_prepay',value: newRecord.id});
		recordCR.setValue({fieldId: 'memo',value: newRecord.getValue('memo')});
		
		let lineCountEx = recordCR.getLineCount({sublistId: slExpense});
		let lineCountIt = recordCR.getLineCount({sublistId: slItem});
		
		for(i = 0; i < lineCountSublistExpense; i++) {
			account = newRecord.getSublistValue({
				sublistId: slExpense,
				fieldId: 'account',
				line: i
			});
			amount = newRecord.getSublistValue({
				sublistId: slExpense,
				fieldId: 'amount',
				line: i
			});
			taxcode = newRecord.getSublistValue({
				sublistId: slExpense,
				fieldId: 'taxcode',
				line: i
			});
			location = newRecord.getSublistValue({
				sublistId: slExpense,
				fieldId: 'location',
				line: i
			});
			
			department = newRecord.getSublistValue({
				sublistId: slExpense,
				fieldId: 'department',
				line: i
			});
			classv = newRecord.getSublistValue({
				sublistId: slExpense,
				fieldId: 'class',
				line: i
			});
			memo = newRecord.getSublistValue({
				sublistId: slExpense,
				fieldId: 'memo',
				line: i
			});

			cseg_scv_channel = newRecord.getSublistValue({
				sublistId: slExpense,
				fieldId: 'cseg_scv_channel',
				line: i
			});

			lineNum = recordCR.selectNewLine({sublistId: slExpense});
			recordCR.setCurrentSublistValue({
				sublistId: slExpense,
				fieldId: 'account',
				value: account
			});
			recordCR.setCurrentSublistValue({
				sublistId: slExpense,
				fieldId: 'amount',
				value: amount
			});
			recordCR.setCurrentSublistValue({
				sublistId: slExpense,
				fieldId: 'taxcode',
				value: taxcode
			});
			recordCR.setCurrentSublistValue({
				sublistId: slExpense,
				fieldId: 'location',
				value: location
			});
			recordCR.setCurrentSublistValue({
				sublistId: slExpense,
				fieldId: 'department',
				value: department
			});
			recordCR.setCurrentSublistValue({
				sublistId: slExpense,
				fieldId: 'class',
				value: classv
			});
			recordCR.setCurrentSublistValue({
				sublistId: slExpense,
				fieldId: 'memo',
				value: memo
			});
			recordCR.setCurrentSublistValue({
				sublistId: slExpense,
				fieldId: 'cseg_scv_channel',
				value: cseg_scv_channel
			});

			recordCR.commitLine(slExpense);
		}
		
		for(i = 0; i < lineCountSublistItem; i++) {
			item = newRecord.getSublistValue({
				sublistId: slItem,
				fieldId: 'item',
				line: i
			});
			quantity = newRecord.getSublistValue({
				sublistId: slItem,
				fieldId: 'quantity',
				line: i
			});
			amount = newRecord.getSublistValue({
				sublistId: slItem,
				fieldId: 'amount',
				line: i
			});
			taxcode = newRecord.getSublistValue({
				sublistId: slItem,
				fieldId: 'taxcode',
				line: i
			});
			location = newRecord.getSublistValue({
				sublistId: slItem,
				fieldId: 'location',
				line: i
			});
			department = newRecord.getSublistValue({
				sublistId: slItem,
				fieldId: 'department',
				line: i
			});
			classv = newRecord.getSublistValue({
				sublistId: slItem,
				fieldId: 'class',
				line: i
			});
			description = newRecord.getSublistValue({
				sublistId: slItem,
				fieldId: 'description',
				line: i
			});
			lineNum = recordCR.selectNewLine({sublistId: slItem});
			recordCR.setCurrentSublistValue({
				sublistId: slItem,
				fieldId: 'item',
				value: item
			});
			recordCR.setCurrentSublistValue({
				sublistId: slItem,
				fieldId: 'quantity',
				value: quantity
			});
			recordCR.setCurrentSublistValue({
				sublistId: slItem,
				fieldId: 'amount',
				value: amount
			});
			recordCR.setCurrentSublistValue({
				sublistId: slItem,
				fieldId: 'taxcode',
				value: taxcode
			});
			recordCR.setCurrentSublistValue({
				sublistId: slItem,
				fieldId: 'location',
				value: location
			});
			recordCR.setCurrentSublistValue({
				sublistId: slItem,
				fieldId: 'department',
				value: department
			});
			recordCR.setCurrentSublistValue({
				sublistId: slItem,
				fieldId: 'class',
				value: classv
			});
			
			recordCR.setCurrentSublistValue({
				sublistId: slItem,
				fieldId: 'description',
				value: description
			});
			
			recordCR.commitLine({
				sublistId : slItem
			});
			
		}
		if(isReomveThenAddItem) {
			for(i = 0; i < lineCountEx; i++) {				
				recordCR.removeLine({
					sublistId: slExpense,
					line: 0,
					ignoreRecalc: false
				});
				recordCR.commitLine({
					sublistId : slExpense
				});
				
			}
			for(i = 0; i < lineCountIt; i++) {
				recordCR.removeLine({
					sublistId: slItem,
					line: 0,
					ignoreRecalc: false
				});
				recordCR.commitLine({
					sublistId : slItem
				});
			}
		}
		//idRelatedTransaction = recordCR.save();
		recordCR.setValue({fieldId: 'exchangerate',value: newRecord.getValue('exchangerate')});
		newRecord.setValue("custbody_scv_journal_prepayment", recordCR.save());
    }
    
    function createOrUpdateJournalEntry(record, recordCR, newRecord, lineCountSublistExpense, lineCountSublistItem, entity, empPrePaymentAccount, isReomveThenAddItem) {
		let i = 0;
		let amount = 0;
		let slExpense = 'expense';
		let slLine = 'line';
		let account = null;
		
		if(isReomveThenAddItem == false) {
			recordCR.setValue({fieldId: 'subsidiary',value: newRecord.getValue('subsidiary')});
		}
		recordCR.setValue({fieldId: 'currency',value: newRecord.getValue('currency')});
		recordCR.setValue({fieldId: 'exchangerate',value: newRecord.getValue('exchangerate')});
		recordCR.setValue({fieldId: 'postingperiod',value: newRecord.getValue('postingperiod')});
		recordCR.setValue({fieldId: 'custbody_scv_chk_employee_prepay',value: newRecord.id});
		recordCR.setValue({fieldId: 'trandate',value: newRecord.getValue('trandate')});
		recordCR.setValue("approvalstatus", 2);//Approved

		let checkMemo = newRecord.getValue('memo');
		recordCR.setValue({fieldId: 'memo',value: checkMemo});
		
		let lineCountEx = recordCR.getLineCount({sublistId: slLine});
		let department = null;
		let location = null;
		let memo = null;
		for(i = 0; i < lineCountSublistExpense; i++) {
			account = newRecord.getSublistValue({
				sublistId: slExpense,
				fieldId: 'account',
				line: i
			});
			if(empPrePaymentAccount == null) {
				empPrePaymentAccount = account;
			}
			amount = newRecord.getSublistValue({
				sublistId: slExpense,
				fieldId: 'amount',
				line: i
			});
			department = newRecord.getSublistValue({
				sublistId: slExpense,
				fieldId: 'department',
				line: i
			});
			location = newRecord.getSublistValue({
				sublistId: slExpense,
				fieldId: 'location',
				line: i
			});
			classv = newRecord.getSublistValue({
				sublistId: slExpense,
				fieldId: 'class',
				line: i
			});

			cseg_scv_channel = newRecord.getSublistValue({
				sublistId: slExpense,
				fieldId: 'cseg_scv_channel',
				line: i
			});

			memo = newRecord.getSublistValue({
				sublistId: slExpense,
				fieldId: 'memo',
				line: i
			});
			if((memo == null) || (memo.length == 0) || (memo.trim().length == 0)) {
				memo = checkMemo; 
			}
			
			createLineJournalEntry(newRecord, recordCR, slLine, 'credit', account, amount, entity, department, location, classv, memo, cseg_scv_channel);
			//for debit
			createLineJournalEntry(newRecord, recordCR, slLine, 'debit', empPrePaymentAccount, amount, entity, department, location, classv, memo, cseg_scv_channel);
		}
		
		if(isReomveThenAddItem) {
			for(i = 0; i < lineCountEx; i++) {
				recordCR.removeLine({sublistId: slLine, line: 0, ignoreRecalc: false});
				recordCR.commitLine(slLine);
			}
		}
		newRecord.setValue("custbody_scv_journal_prepayment", recordCR.save());
    }
    
    function createLineJournalEntry(newRecord, recordCR, slLine, fieldCreditDebit, account, amount, entity, department, location, classv, memo, cseg_scv_channel) {
		recordCR.selectNewLine({sublistId: slLine});
		recordCR.setCurrentSublistValue({
			sublistId: slLine,
			fieldId: 'account',
			value: account
		});
		recordCR.setCurrentSublistValue({
			sublistId: slLine,
			fieldId: fieldCreditDebit,
			value: amount
		});
		recordCR.setCurrentSublistValue({
			sublistId: slLine,
			fieldId: 'entity',
			value: entity
		});
		recordCR.setCurrentSublistValue({
			sublistId: slLine,
			fieldId: 'location',
			value: location
		});
		recordCR.setCurrentSublistValue({
			sublistId: slLine,
			fieldId: 'department',
			value: department
		});
		recordCR.setCurrentSublistValue({
			sublistId: slLine,
			fieldId: 'class',
			value: classv
		});
		recordCR.setCurrentSublistValue({
			sublistId: slLine,
			fieldId: 'memo',
			value: memo
		});
		recordCR.setCurrentSublistValue({
			sublistId: slLine,
			fieldId: 'cseg_scv_channel',
			value: cseg_scv_channel
		});

		recordCR.commitLine(slLine);
    }
    
    return {
        beforeSubmit,
        afterSubmit
    };
    
});
