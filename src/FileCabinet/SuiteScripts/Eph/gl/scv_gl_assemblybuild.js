/**
 * @NApiVersion 2.1
 * @NScriptType customglplugin
 */
define(['N/search'],
	(search) => {

		const SEGMENT_IDS = [];

		const customizeGlImpact = (context) => {
			const standardLines = context.standardLines;
			const customLines = context.customLines;
			const arrAccRe = {};
			const count = standardLines.count;

			for (let i = 0; i < count; i++) {
				const strLine = standardLines.getLine({index: i});
				const accountId = strLine.accountId;
				const amount = strLine.creditAmount;
				if (!!accountId && Number(amount) > 0) {
					let objAccount = arrAccRe[accountId + ''];
					if (!objAccount) {
						const lkAcc = search.lookupFields({
							type: 'account',
							id: accountId,
							columns: ['number', 'type', 'custrecord_scv_acc_drc', 'custrecord_scv_acc_wip']
						});
						objAccount = {
							id: accountId,
							type: getLookupValue(lkAcc.type),
							number: lkAcc.number || '',
							acc_drc: getLookupValue(lkAcc.custrecord_scv_acc_drc),
							acc_wip: getLookupValue(lkAcc.custrecord_scv_acc_wip)
						};
						arrAccRe[accountId + ''] = objAccount;
					}

					if (!!objAccount.acc_drc) {
						const memo = `${strLine.id}-${strLine.memo || ''}`;
						//Dao debit credit
						addLine(customLines, amount, 0, objAccount.acc_drc, strLine, memo);
						//Debit credit
						addLine(customLines, 0, amount, objAccount.acc_drc, strLine, memo);
					}
					if (!!objAccount.acc_wip) {
						const memo = `${strLine.id}-${strLine.memo || ''}`;
						//Dao debit credit
						addLine(customLines, amount, 0, objAccount.acc_wip, strLine, memo);
						//Debit credit
						addLine(customLines, 0, amount, objAccount.acc_wip, strLine, `0-${strLine.memo || ''}`);
					}
				}
			}
		};

		const addLine = (customLines, debit, credit, accOpp, strLine, memo) => {
			const newLine = customLines.addNewLine();
			if (Number(debit) > 0) {
				newLine.debitAmount = String(debit);
			}
			if (Number(credit) > 0) {
				newLine.creditAmount = String(credit);
			}
			newLine.accountId = Number(accOpp);
			newLine.memo = memo;
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
