/**
 * @NApiVersion 2.1
 * @NScriptType customglplugin
 */
define(['N/search', 'N/log'],
	(search, log) => {

		const SEGMENT_IDS = ['cseg_scv_seg_sc', 'cseg_scv_sg_proj', 'cseg_scv_sg_brand', 'cseg_scv_sg_pro_sta'];
		const ACCOUNT_521 = 1456;//473;  //getAccountFlNumber('52120001');

		const customizeGlImpact = (context) => {
			const transactionRecord = context.transactionRecord;
			const standardLines = context.standardLines;
			const customLines = context.customLines;
			const count = standardLines.count;

			const createdfrom = transactionRecord.getValue({fieldId: 'createdfrom'});
			if (!isContain(createdfrom)) {
				return;
			}
			const rec = search.lookupFields({type: 'transaction', id: createdfrom, columns: ['recordtype']});
			if (getLookupValue(rec.recordtype) !== 'returnauthorization') {
				return;
			}

			const arrAccount = {};
			let cntUnit = 0;
			for (let i = 0; i < count; i++) {
				const strLine = standardLines.getLine({index: i});
				const accountId = strLine.accountId;
				if (!isContain(accountId)) {
					continue;
				}
				cntUnit++;

				let objAccount = arrAccount[accountId + ''];
				if (!objAccount) {
					const accnum = search.lookupFields({type: 'account', id: accountId, columns: ['number', 'type']});
					objAccount = {id: accountId, number: accnum.number || ''};
					log.debug(cntUnit, accountId);
					arrAccount[accountId + ''] = objAccount;
				}

				const prefix = objAccount.number.substring(0, 3);
				if (prefix === '511') {
					const debit = strLine.debitAmount;
					const credit = strLine.creditAmount;
					if (Number(debit) > 0 || Number(credit) > 0) {
						addLineReverse(strLine, customLines, debit, credit, Number(accountId), ACCOUNT_521);
					}
				}
			}
		};

		const isContain = (value) => value !== undefined && value !== null && value !== '';

		const setLine = (strLine, newLine, accountId) => {
			newLine.accountId = accountId;
			if (strLine.memo) newLine.memo = strLine.memo;
			if (strLine.departmentId) newLine.departmentId = strLine.departmentId;
			if (strLine.classId) newLine.classId = strLine.classId;
			if (strLine.locationId) newLine.locationId = strLine.locationId;
			if (strLine.entityId) newLine.entityId = strLine.entityId;
			for (const segmentId of SEGMENT_IDS) {
				const segmentValueId = strLine.getSegmentValueId({segmentId});
				if (segmentValueId !== undefined && segmentValueId !== null) {
					newLine.setSegmentValueId({segmentId, segmentValueId});
				}
			}
		};

		const addLineReverse = (strLine, customLines, debit, credit, accountId, orderaccount) => {
			let newLine = customLines.addNewLine();
			if (Number(debit) > 0) {
				newLine.creditAmount = String(debit);
			}
			if (Number(credit) > 0) {
				newLine.debitAmount = String(credit);
			}
			setLine(strLine, newLine, accountId);

			newLine = customLines.addNewLine();
			if (Number(debit) > 0) {
				newLine.debitAmount = String(debit);
			}
			if (Number(credit) > 0) {
				newLine.creditAmount = String(credit);
			}
			setLine(strLine, newLine, Number(orderaccount));
		};

		// search.lookupFields tra ve [{value, text}] voi field select, khac nlapiLookupField (tra ve id)
		const getLookupValue = (value) => {
			if (Array.isArray(value)) {
				return value.length ? value[0].value : '';
			}
			return value || '';
		};

		return {
			customizeGlImpact
		};
	});
