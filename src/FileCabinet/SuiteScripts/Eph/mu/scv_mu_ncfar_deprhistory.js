/**
 * Nội dung:
 * ============================================================================================================
 * 	Date			Author				Description
 *  11 Mar 2026		Huy Pham			Init. move from MMA, from ms.Thắm(chat)
 **/
/**
 * @NApiVersion 2.1
 * @NScriptType MassUpdateScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', '../lib/scv_lib_function.js'],
function(record, search, lfunc) {
    function each(params) {
		let rec = record.load({type: params.type, id: params.id});

		let deprhistjournal = rec.getValue('custrecord_deprhistjournal');
		let isUpdate = false;
		if(lfunc.isContainValue(deprhistjournal) == false) {
			let deprhisttype = rec.getValue('custrecord_deprhisttype');
			if(deprhisttype == 1) {
				let deprhistasset = rec.getValue('custrecord_deprhistasset');
				if(lfunc.isContainValue(deprhistasset)) {
					let recAsset = record.load({type: 'customrecord_ncfar_asset', id: deprhistasset});
					deprhistjournal = recAsset.getValue('custrecord_assetsourcetrn');
				}
				isUpdate = true;
			} else if(deprhisttype == 2) {
				let name = rec.getValue('name');
				if(lfunc.isContainValue(name)) {
					let s = search.create({
						type: 'customrecord_bg_summaryrecord',
						filters: [['name', 'is', name]],
						columns: ['internalid', 'custrecord_summary_histjournal']
					});
					let r = s.run().getRange({start:0, end: 10});    			
					if(r.length > 0) {    				
						deprhistjournal = r[0].getValue('custrecord_summary_histjournal');
					}     			
				}
				isUpdate = true;
			}    		
		} else {
			isUpdate = true;
		}		
		if(isUpdate) {
			lfunc.setValueData(rec, ['custrecord_scv_dep_jn'], [deprhistjournal]);
			rec.save({enableSourcing: false, ignoreMandatoryFields : true});
		}
    }

    return {
        each: each
    };
    
});
