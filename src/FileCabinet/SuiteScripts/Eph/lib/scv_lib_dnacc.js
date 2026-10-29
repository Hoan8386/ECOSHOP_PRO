/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  09 Jan 2025         Huy Pham			    Init, create file. Document Number - Sequence Number From Mil, from ms.Diệu(https://app.clickup.com/t/86cxkwy6q)
 */
define(['N/record', 'N/search',
	'../cons/scv_cons_symbolcurrency.js'
],
function(record, search,
	constSymbolCurrency
) {
	const SEQ_TYPE = {
		ACCOUNTINGVOUCHER: "ACCOUNTINGVOUCHER",
		REQUESTNUMBER: "REQUESTNUMBER"
	}
	function makeDocNumber(newRecord) {
		let recType = newRecord.type;

		let doc_number = "";
		let prefix = '';
		let accountnumber = '';
		let type = SEQ_TYPE.ACCOUNTINGVOUCHER;
		let doc_num_fieldid = "custbody_scv_doc_number";
		let bank_code = "";

		let trandate = newRecord.getValue('trandate');
		let approvalstatus = newRecord.getValue('approvalstatus');
		let account = newRecord.getValue('account');
		let currency_id = newRecord.getValue("currency");

		doc_number = newRecord.getValue(doc_num_fieldid);

		if(!trandate || !!doc_number) {
			return false;
		}
		
		let year_month = formatDatePrefix_YYYYMM(trandate);
		let year_yyyy = formatYearPrefix(trandate);
		
		if(!approvalstatus || approvalstatus == 2) {
			if(recType == "customrecord_scv_payment_request") {
				prefix = 'PR';
			}
			else if(['customerdeposit', 'customerpayment', 'deposit', 'cashrefund'].includes(recType)){
				prefix = "R";
				if(recType == "customerpayment" && newRecord.getValue('undepfunds') == 'T'){
					account = undefined;
				}
			}
			else if(['vendorprepayment', 'vendorpayment', 'customerrefund', 'check', 'cashsale'].includes(recType)){
				prefix = "P";
			}

			if(!!account){
				let lkAcc = search.lookupFields({type: "account", id: account, columns: ['custrecord_scv_account_bank_code']});

				bank_code = lkAcc.custrecord_scv_account_bank_code??"";
			}

			if(!!prefix) {
				let symbol_currency_code = getSymbolCurrencyCode(currency_id);
				
				let objDocNumber = searchDocNumber(type, accountnumber, prefix, year_yyyy, year_month, bank_code, symbol_currency_code);
				let next_seq = objDocNumber.nextnumber;
				
				if(type == SEQ_TYPE.REQUESTNUMBER){
					doc_number = year_month + (next_seq + '').padStart(6, '0');	
				}
				else{
					doc_number = bank_code + prefix + symbol_currency_code + year_month + "-" + (next_seq + '').padStart(3, '0');
				}
				
				//after submit
				let objValues = {};
				objValues[doc_num_fieldid] = doc_number;
				record.submitFields({
					type: newRecord.type, id: newRecord.id,
					values: objValues,
					options: {enableSourcing: false, ignoreMandatoryFields : true}
				});
			}
		}
	}
	
	function searchDocNumber(type, accountnumber, prefix, year_yyyy, year_month, bank_code, symbol_currency_code) {
		let nextnumber = 1;
		let filters = [];

		filters.push(search.createFilter({name: 'custrecord_scv_rcn_type', operator: !!type ? 'is' : "isempty", values: type||""}));
		filters.push(search.createFilter({name: 'custrecord_scv_rcn_accountnumber', operator: !!accountnumber ? 'is' : "isempty", values: accountnumber||""}));
		filters.push(search.createFilter({name: 'custrecord_scv_rcn_bank_code', operator: !!bank_code ? 'is' : "isempty", values: bank_code||""}));
		filters.push(search.createFilter({name: 'custrecord_scv_rcn_currency', operator: !!symbol_currency_code ? 'is' : "isempty", values: symbol_currency_code||""}));
		filters.push(search.createFilter({name: 'custrecord_scv_rcn_prefix', operator: !!prefix ? 'is' : "isempty", values: prefix||""}));

		if(type == SEQ_TYPE.REQUESTNUMBER){
			filters.push(search.createFilter({name: 'custrecord_scv_rcn_year', operator: !!year_yyyy ? 'is' : "isempty", values: year_yyyy||""}));
			filters.push(search.createFilter({name: 'custrecord_scv_rcn_yearmonth', operator: "isempty", values: ""}));
		}
		else{
			filters.push(search.createFilter({name: 'custrecord_scv_rcn_yearmonth', operator: !!year_month ? 'is' : "isempty", values: year_month||""}));
		}

		let searchVN = search.create({
			type: 'customrecord_scv_rcnumber',
			filters: filters,
			columns:['custrecord_scv_rcn_currentnumber']
		});
		
		let resultsVN = searchVN.run().getRange({start:0,end:1});
		
		let recDocNumId = "";

		if(resultsVN.length > 0) {
    		nextnumber = resultsVN[0].getValue('custrecord_scv_rcn_currentnumber') * 1 + 1;
			
			recDocNumId = resultsVN[0].id;

			record.submitFields({
				type: 'customrecord_scv_rcnumber', id: resultsVN[0].id,
				values: {
					custrecord_scv_rcn_currentnumber: nextnumber
				},
				options: {enableSourcing: false, ignoreMandatoryFields : true}
			});
		} else {
			recDocNumId = createDocNumber(type, accountnumber, prefix, year_yyyy, year_month, bank_code, symbol_currency_code);
		};
		return {nextnumber: nextnumber, internalid: recDocNumId};
    }
    
    function createDocNumber(type, accountnumber, prefix, year_yyyy, year_month, bank_code, symbol_currency_code) {
		let name = "";
		if(type == SEQ_TYPE.REQUESTNUMBER){
			name = type + prefix + year_yyyy;
			year_month = "";
			prefix = "";
		}else{
			name = type +  bank_code + prefix + symbol_currency_code + year_month;
		}

		let recDocNum = record.create({type: 'customrecord_scv_rcnumber'});
		recDocNum.setValue('name', name);    	
		recDocNum.setValue('custrecord_scv_rcn_type', type);
		recDocNum.setValue('custrecord_scv_rcn_accountnumber', accountnumber);
		recDocNum.setValue('custrecord_scv_rcn_prefix', prefix);
		recDocNum.setValue('custrecord_scv_rcn_year', year_yyyy);
		recDocNum.setValue('custrecord_scv_rcn_yearmonth', year_month);
		recDocNum.setValue('custrecord_scv_rcn_bank_code', bank_code);
		recDocNum.setValue('custrecord_scv_rcn_currency', symbol_currency_code);
		recDocNum.setValue('custrecord_scv_rcn_currentnumber', 1);
		let recDocNumId = recDocNum.save();

		return recDocNumId;
    }
	
	const getSymbolCurrencyCode = (_currencyId) =>{
		if(!_currencyId) return "";

		let arrSymbolCurrency = constSymbolCurrency.getDataSource(search.createFilter({
			name: 'custrecord_scv_sym_currency', 
			operator: "anyof", 
			values: _currencyId
		}));

		return arrSymbolCurrency.length == 0 ? "" : arrSymbolCurrency[0].custrecord_scv_sym_symbol;
	}

	const formatDatePrefix_YYYYMM = (_date) =>{
		return _date.getFullYear().toString() + ((_date.getMonth() + 1) + '').padStart(2,'0');
	}

	const formatYearPrefix = (_date) =>{
		return _date.getFullYear().toString();
	}

    return {
		makeDocNumber,
		searchDocNumber
    };
    
});
