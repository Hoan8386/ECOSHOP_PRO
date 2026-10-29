/**
 * @NApiVersion 2.1
 * @NScriptType customglplugin
 */
define(['N/record'],
	(record) => {
		const EXCLUDED_TYPES = ['purchaseorder', 'salesorder', 'vendorreturnauthorization', 'returnauthorization', 'opportunity'];

		const customizeGlImpact = (context) => {
			const transactionRecord = context.transactionRecord;
			const transactionId = transactionRecord.id;
			//log.debug('transactionId', transactionId);
			if (!!transactionId) {
				const tranid = transactionRecord.getValue({fieldId: 'tranid'});
				const type = transactionRecord.type;
				if (!EXCLUDED_TYPES.includes(type)) {
					const recCtc = record.create({type: 'customrecord_scv_contra_trans_change'});
					recCtc.setValue({fieldId: 'name', value: String(tranid || transactionId)});
					recCtc.setValue({fieldId: 'custrecord_scv_ctc_transid', value: transactionId});
					recCtc.setValue({fieldId: 'custrecord_scv_ctc_transtype', value: type});
					recCtc.save();
				}
			}
		};

		return {customizeGlImpact};
	});
