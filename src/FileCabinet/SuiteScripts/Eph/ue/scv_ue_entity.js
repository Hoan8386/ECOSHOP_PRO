/**
 * Nội dung: 
 * Key word:
 * =======================================================================================
 *  Date                Author                  Description
 *  04 Apr 2025		    Phu Pham                Move chức năng Check trùng MST từ Aeon sang Eco
 */
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', '../lib/scv_lib_function.js'],
	/**
	 * @param {record} record
	 * @param {search} search
	 */
	function(record, search, lbf) {

		/**
		 * Function definition to be triggered before record is loaded.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.newRecord - New record
		 * @param {string} scriptContext.type - Trigger type
		 * @param {Form} scriptContext.form - Current form
		 * @Since 2015.2
		 */
		function beforeLoad(scriptContext) {
			
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
		function beforeSubmit(scriptContext) {
			var tgType = scriptContext.type;
			if(tgType == 'create' || tgType == 'edit' || tgType == 'copy' || tgType == 'convert') {
				var newRecord = scriptContext.newRecord;
				var isinactive = newRecord.getValue("isinactive");
				if(isinactive == true || isinactive == "T") return;
				var recType = newRecord.type;
				var tax_number = newRecord.getValue("custentity_scv_tax_number");
				if(recType == 'customer' || recType == 'lead' || recType == 'prospect') {
					if(isExistsTaxNumber(newRecord.id, tax_number, recType)){
						throw "This "+ recType +" is duplicate Tax Number with a others.";
					}
				} else if(recType === 'vendor') {
					if(isExistsTaxNumberVendor(newRecord.id, tax_number, recType)){
						throw "This "+ recType +" is duplicate Tax Number with a others.";
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

		}

		function isExistsTaxNumberVendor(_internalid, _taxnumber, _recType) {
			if(!lbf.isContainValue(_taxnumber)) return false;

			var vendorSearch = search.create({
				type: "vendor",
				filters:
					[
						["isinactive","is","F"],
						"AND",
						["custentity_scv_tax_number","is",_taxnumber]
					],
				columns:
					[
						search.createColumn({
							name: "entityid",
							sort: search.Sort.ASC,
							label: "Name"
						}),
						search.createColumn({name: "custentity_scv_tax_number", label: "TAX ID"})
					]
			});
			var myFilter = vendorSearch.filters;
			if(lbf.isContainValue(_internalid)){
				myFilter.push(search.createFilter({
					name: "internalidnumber",
					operator: "notequalto",
					values: _internalid
				}))
			}
			return vendorSearch.runPaged().count > 0 ? true : false;
		}

		function isExistsTaxNumber(_internalid, _taxnumber, _recType){
			if(!lbf.isContainValue(_taxnumber)) return false;

			var custSearch = search.create({
				type: "customer",
				filters:
					[
						["isinactive","is","F"],
						"AND",
						["custentity_scv_tax_number","is",_taxnumber]
					],
				columns:
					[
						search.createColumn({
							name: "entityid",
							sort: search.Sort.ASC,
							label: "Name"
						}),
						search.createColumn({name: "custentity_scv_tax_number", label: "TAX ID"})
					]
			});
			var myFilter = custSearch.filters;
			if(lbf.isContainValue(_internalid)){
				myFilter.push(search.createFilter({
					name: "internalidnumber",
					operator: "notequalto",
					values: _internalid
				}))
			}
			return custSearch.runPaged().count > 0 ? true : false;
		}

		return {
			beforeLoad: beforeLoad,
			beforeSubmit: beforeSubmit,
		};

	});
