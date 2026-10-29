define(['N/config', 'N/encode', 'N/http', 'N/https',  'N/query', 'N/record', 'N/runtime', 'N/search'],
	
	(config, encode, http, https, query, record, runtime, search) => {
	
		const CodeResponse = {
			DA_TON_TAI: '99'
		}
	
		const RecordType = {
			EINVOICE_HISTORY: 'customrecord_scv_einvoice_history',
			EINVOCIE_AUDIT: 'customrecord_scv_audit_einvoice',
			EINVOCIE_CODE: 'customrecord_scv_einvoice_code',
			EINVOCIE_CONFIG: 'customrecord_scv_einvoice_config',
			SUM_TRANSACTION: 'customsale_scv_sum_transaction'
		}
		
		const EinvoiceStatus = {
			HOA_DON_GOC: '1',
			HOA_DON_THAY_THE: '2',
			HOA_DON_DIEU_CHINH: '3',
			HOA_DON_XOA_BO: '4',
			BI_DIEU_CHINH: '5',
			CHUYEN_DOI: '6'
		}
		
		const VNPayInvoiceStatus = {
			'origin': '1',
			'replacement': '2',
			'replaced': '',
			'adjustment': '3',
			'adjusted': '5',
			'cancel': '4'
		}
		
		const AdjustType = {
			DIEU_CHINH_TANG: '1',
			DIEU_CHINH_THONG_TIN: '2',
			DIEU_CHINH_GIAM: '3',
			DIEU_CHINH_GIAM_GIA: '4'
		}
		
		const LineType = {
			HANG_HOA: '1',
			KHUYEN_MAI: '2',
			CHIET_KHAU: '3',
			GHI_CHU: '4'
		}
		
		const ApiPathEinvoice = {
			TOKEN: '/user/client/token',
			TAO_MOI_HOA_DON: '/api/v6/warehouse-export/internal-shipping/original',
			DIEU_CHINH_HOA_DON: '/api/v6/warehouse-export/internal-shipping/adjustment',
			THAY_THE_HOA_DON: '/api/v6/warehouse-export/internal-shipping/replacement',
			HUY_HOA_DON: '/api/v6/invoices/cancel',
			XOA_HOA_DON: '/api/v6/invoices/delete'
		}
		
		const getApiPathInvoiceInfo = (taxCode, requestId) => {
			return `/api/v6/invoices/${taxCode}/${requestId}`;
		}
		
		const getApiPathGetFilePdf = (taxCode, requestId, invoiceDate) => {
			return `/api/v6/invoices/pdf?taxCode=${taxCode}&requestId=${requestId}&invoiceDate=${invoiceDate}`;
		}
		
		const isContainValue = (value) => {
			let isContain = false;
			if(value !== undefined && value !== null && value !== '') {
				if(util.isArray(value)) {
					if(value.length > 0) {
						isContain = true;
					}
				} else {
					isContain = true;
				}
			}
			return isContain;
		}
		
		const reValue = (value) => {
			let r = value;
			if(r === undefined || r === null) {
				r = '';
			}
			return r;
		}
		
		const getDateNow = (gmt = 0) => {
			let now = new Date();
			let sdate = now.toString();
			let p1 = sdate.substring(28,29);
			let p2 = sdate.substring(29,31);
			let tcurr = gmt;
			if(p1 === '-') {
				tcurr = tcurr + 1 * p2;
			} else {
				tcurr = tcurr - 1 * p2;
			}
			return new Date(now.getTime() + (tcurr * 3600000));
		}
		
		const makeHeaderBearer = (beartoken) => {
			let header = {};
			let bearerAuth = 'Bearer ' + beartoken;
			header['Content-Type'] = 'application/json;charset=utf-8';
			header['Accept']= '*/*';
			header['Authorization']= bearerAuth;
			return header;
		}
		
		const sortArayOfObject = (arrayOfObjects, field) => {
			arrayOfObjects.sort(function(a, b) {
				let x = a[field].toLowerCase();
				let y = b[field].toLowerCase();
				return x < y ? -1 : x > y ? 1 : 0;
			});
		}
		
		const getTransactionUuid = (newRecord) => {
			return `NS_${newRecord.id}`;
		};
		
		const getTransactionUuidCreate = (newRecord) => {
			return `NS_${newRecord.id}`;
		};
		
		const getTransactionUuidReplace = (newRecord) => {
			let replace_times = newRecord.getValue('custbody_scv_epxk_replace_times');
			replace_times = isContainValue(replace_times) ? replace_times * 1 + 1 : 1;
			let transactionUuid = `NS_${newRecord.id}_${replace_times}`;
			if (newRecord.getValue('custbody_scv_epxk_replace_times') !== undefined) {
				newRecord.setValue('custbody_scv_epxk_replace_times', replace_times);
			}
			return transactionUuid;
		};
		
		const getBody = (newRecord, lkEconfig, lkEIC, options) => {
			let sign_quantity = options.sign_quantity || 1;
			let sign_price = options.sign_price || 1;
			let sign_total = sign_quantity * sign_price;
			let currencyCode = newRecord.getText('currency') || newRecord.getValue('currencycode');
			let fractionDigits = currencyCode === 'VND' ? 0 : 2;
			const DictLkItem = {};
			
			let itemPromotionTitle = ' (Hàng KM không thanh toán)';
			let slItem = 'item';
			let products = [], iNo = 1;
			let totalAmountWithoutDiscount = 0, totalAmount = 0, totalAmountAfterTax = 0;
			
			let lcItem = newRecord.getLineCount(slItem);
			for(let i = 0; i < lcItem; i++) {
				let unitPrice = newRecord.getSublistValue({sublistId: slItem, fieldId: 'custcol_scv_cost_avg_ban_le', line: i});
				let unitName = newRecord.getSublistText({sublistId: slItem, fieldId: 'custcol_scv_einvoice_item_unit', line: i}) || newRecord.getSublistValue({sublistId: slItem, fieldId: 'unitsdisplay', line: i});
				let linetype = newRecord.getSublistValue({sublistId: slItem, fieldId: 'custcol_scv_einvoice_linetype', line: i});
				let itemtype = newRecord.getSublistValue({sublistId: slItem, fieldId: 'itemtype', line: i});
				let freegiftpromotion = newRecord.getSublistValue({sublistId: slItem, fieldId: 'freegiftpromotion', line: i});
				let quantity = newRecord.getSublistValue({sublistId: slItem, fieldId: 'quantity', line: i});
				let amountWithoutDiscount = Math.round(unitPrice || 0) * (quantity || 0);
				let description = newRecord.getSublistValue({sublistId: slItem, fieldId: 'description', line: i}) || newRecord.getSublistText({sublistId: slItem, fieldId: 'item', line: i});
				let item = newRecord.getSublistValue({sublistId: slItem, fieldId: 'item', line: i});
				let lkItem = DictLkItem[item];
				if(!lkItem) {
					lkItem = search.lookupFields({type: 'item', id: item, columns: ['upccode']});
					DictLkItem[item] = lkItem;
				}
				
				let isclosed = newRecord.getSublistValue({sublistId: slItem, fieldId: 'isclosed', line: i});
				if(itemtype !== 'Discount' && itemtype !== 'Description' && !(isclosed === true || isclosed === 'T') && linetype !== LineType.GHI_CHU) {
					if(newRecord.type === record.Type.ITEM_FULFILLMENT && !newRecord.getSublistValue({sublistId: slItem, fieldId: 'itemreceive', line: i})) continue;
					
					if(!freegiftpromotion) {
						totalAmountWithoutDiscount = totalAmountWithoutDiscount + amountWithoutDiscount;
						totalAmount = totalAmount + amountWithoutDiscount;
						totalAmountAfterTax = totalAmountAfterTax + amountWithoutDiscount;
						
						let objTemp = {
							"ordinalNumber": iNo++,
							"code": lkItem.upccode,
							"name": description,
							"property": Number(linetype || LineType.HANG_HOA),
							"unit": unitName,
							"quantity": quantity * sign_quantity,
							"importedQuantity": quantity * sign_quantity,
							"price": unitPrice * sign_price,
							"amountWithoutDiscount": amountWithoutDiscount * sign_total,
							"amount": amountWithoutDiscount * sign_total,
							"amountAfterTax": amountWithoutDiscount * sign_total
						}
						products.push(objTemp);
					} else {
						let objTemp = {
							"ordinalNumber": iNo++,
							"code": lkItem.upccode,
							"name": description + itemPromotionTitle,
							"property": Number(LineType.HANG_HOA),
							"unit": unitName,
							"quantity": quantity * sign_quantity,
							"importedQuantity": quantity * sign_quantity,
							"price": 0,
							"amountWithoutDiscount": 0,
							"amount": 0,
							"amountAfterTax": 0
						}
						products.push(objTemp);
					}
				} else if(itemtype === 'Description' || linetype === LineType.GHI_CHU) {
					let objTemp = {
						"ordinalNumber": iNo++,
						"code": lkItem.upccode,
						"name": description,
						"property": Number(LineType.GHI_CHU),
						"unit": "",
						"quantity": null,
						"importedQuantity": null,
						"price": null,
						"amountWithoutDiscount": null,
						"amount": null,
						"amountAfterTax": null
					}
					products.push(objTemp);
				}
			}
			
			totalAmountWithoutDiscount = Number(totalAmountWithoutDiscount.toFixed(fractionDigits));
			totalAmount = Number(totalAmount.toFixed(fractionDigits));
			totalAmountAfterTax = Number(totalAmountAfterTax.toFixed(fractionDigits));
			
			let exportAddress = '', listLocation = [];
			let locationId = newRecord.getSublistValue({sublistId: slItem, fieldId: 'location', line: 0});
			if(locationId) {
				let lkFieldsLocation = search.lookupFields({type: search.Type.LOCATION, id: locationId, columns: ['address.address']});
				exportAddress = lkFieldsLocation['address.address'].replace(/\n/g, ", ").replace(/\r/g, ", ");
				listLocation.push(locationId);
			}
			let transferlocation = newRecord.getValue('transferlocation');
			let receiveAddress = null;
			if(transferlocation) {
				let lkFieldsTfLocation = search.lookupFields({type: search.Type.LOCATION, id: transferlocation, columns: ['address.address']});
				receiveAddress = lkFieldsTfLocation['address.address'].replace(/\n/g, ", ").replace(/\r/g, ", ");
				listLocation.push(transferlocation);
			}
			let lkTransaction = search.lookupFields({type: newRecord.type, id: newRecord.id, columns: ['createdfrom.tranid', 'subsidiary.legalname']});
			let listLocationInfo = getQueryLocation(listLocation);
			let objTfLocation = listLocationInfo.find(o => String(o.id) === transferlocation);
			//let objLocation = listLocationInfo.find(o => String(o.id) === locationId);
			
			return {
				"taxCode": lkEconfig.custrecord_scv_ec_taxcode,
				"autoRelease": lkEconfig.custrecord_scv_ec_auto_realease,
				"autoSign": lkEconfig.custrecord_scv_ec_auto_sign,
				"autoSendCQT": lkEconfig.custrecord_scv_ec_auto_sendcqt,
				"invoice": {
					"requestId": options.transactionUuid,
					"invoiceCreatedDate": options.invoiceCreatedDate,
					"invoiceSymbol": lkEIC.custrecord_scv_eic_invoice_serial,
					"currencyUnit": currencyCode,
					"currencyExchangeRate": newRecord.getValue('exchangerate'),
					"exportAddress": exportAddress,
					"sellerInternalDispatchCommand": lkTransaction['createdfrom.tranid'],
					"sellerConsigneeName": lkTransaction['subsidiary.legalname'],
					"sellerContractNo": newRecord.getValue('custbody_scv_shipping_contract_no'),
					"sellerContractDay": convertDateToString(newRecord.getValue('custbody_scv_shipping_contract_date')),
					"sellerTransportation": newRecord.getValue('custbody_scv_shipping_method'),
					"sellerTransformerName": newRecord.getValue('custbody_scv_contact_to_receive'),
					"buyerCustomerCode": objTfLocation?.tranprefix,
					"buyerTaxCode": objTfLocation?.federalidnumber,
					"buyerName": newRecord.getValue('custbody_scv_receiver'),
					"receiveAddress": receiveAddress,
					"buyerFullName": objTfLocation?.legalname,
					"buyerEmail": newRecord.getValue('custbody_scv_receiver_email'),
					"invoiceNote": newRecord.getValue('custbody_scv_inter_to_note'),
					"internalNote": newRecord.getValue('memo'),
					"totalAmountWithoutDiscount": totalAmountWithoutDiscount * sign_total,
					"totalAmount": totalAmount * sign_total,
					"totalAmountAfterTax": totalAmountAfterTax * sign_total,
					"totalPaymentInWord": "",
					"branchCode": "",
					"createdBy": getUser().name,
					"products": products
				}
			};
		}
		
		const getQueryLocation = (arrLocationId) => {
			let strWhere = '';
			if(arrLocationId && (arrLocationId + '')) {
				strWhere = `where l.id in(${arrLocationId})`;
			}
			let sqlLocation = `
				select lc.*, s.tranprefix, s.legalname, s.federalidnumber from (select l.id, l.subsidiary from location l ${strWhere}) lc
				join subsidiary s on  lc.subsidiary = s.id
			`;
			return query.runSuiteQL({query: sqlLocation, params: []}).asMappedResults();
		}
		
		const getUser = () => {
			let user = runtime.getCurrentUser();
			let email = user.email;
			let lkE = search.lookupFields({type: 'entity', id: user.id, columns: ['custentity_scv_legal_name', 'entityid']});
			let exchangeUser = lkE.custentity_scv_legal_name || lkE.entityid;
			return {username: email, name: exchangeUser}
		}
		
		const convertToDate = (invoiceCreatedDate) => {
			let splitDate = invoiceCreatedDate.split('-');
			return new Date(splitDate[0], splitDate[1] * 1 - 1, splitDate[2]);
		}
		
		const convertDateToString = (dInput) => {
			let dOutput = '';
			if(dInput) {
				dOutput = `${dInput.getFullYear()}-${String(dInput.getMonth() + 1).padStart(2, '0')}-${String(dInput.getDate()).padStart(2, '0')}`;
			}
			return dOutput;
		}
		
		const logAudit = (lfunc, name, body, response, transactionid) => {
			let recAudit = record.create({type: RecordType.EINVOCIE_AUDIT});
			let fields = ['name', 'custrecord_scv_aei_body', 'custrecord_scv_aei_response', 'custrecord_scv_aei_related_transaction'];
			lfunc.setValueData(recAudit, fields, [name, body, JSON.stringify(response), transactionid]);
			recAudit.save({enableSourcing: false, ignoreMandatoryFields : true});
		}
		
		const getGmtServer = () => {
			let now = new Date();
			let sdate = now.toString();
			let p1 = sdate.substring(28,29);
			let p2 = sdate.substring(29,31);
			let tcurr;
			if(p1 === '-') {
				tcurr = -1 * p2;
			} else {
				tcurr = 1 * p2;
			}
			return tcurr;
		}
		
		const getProtocol = (baseurl) => {
			let protocol = http;
			if(baseurl.substring(0,5) === 'https') {
				protocol = https;
			}
			return protocol;
		}
		
		const callApiPost = (urlPost, headers, strBody, lkEconfig, eic_econfig, times = 0)  => {
			let protocol = getProtocol(urlPost);
			let resCall = protocol.post({
				url: urlPost,
				headers: headers,
				body: strBody
			});
			let accessToken = lkEconfig?.custrecord_scv_ec_beartoken;
			if(resCall.code === 401 && lkEconfig && eic_econfig && times <= 2) {
				let resultAccessToken = getAccessToken(lkEconfig.custrecord_scv_ec_domain, lkEconfig.custrecord_scv_ec_userpass);
				accessToken = resultAccessToken.accessToken;
				headers = makeHeaderBearer(accessToken);
				submitFieldsEinvoiceConfigAccessToken(eic_econfig, resultAccessToken, 0);
				({resCall, accessToken} = callApiPost(urlPost, headers, strBody, lkEconfig, eic_econfig, times + 1));
			}
			return {resCall, accessToken}
		}
		
		const submitFieldsEinvoiceConfigAccessToken = (eic_econfig, resultAccessToken, times  = 0, longtime = 0) => {
			if(times <= 2) {
				longtime = longtime || new Date().getTime();
				try {
					record.submitFields({
						type: RecordType.EINVOCIE_CONFIG, id: eic_econfig, values: {
							custrecord_scv_ec_beartoken: resultAccessToken.accessToken,
							custrecord_scv_ec_expires_in: resultAccessToken.expiresIn,
							custrecord_scv_ec_longtime: longtime
						}
					});
				} catch (e) {
					log.error('exception submitFieldsEinvoiceConfigAccessToken', e);
					submitFieldsEinvoiceConfigAccessToken(eic_econfig, resultAccessToken, times + 1, longtime);
				}
			}
		}
		
		const callApiGet = (urlGet, headers, lkEconfig, eic_econfig, times = 0)  => {
			let protocol = getProtocol(urlGet);
			let resCall = protocol.get({
				url: urlGet,
				headers: headers
			});
			let accessToken = lkEconfig?.custrecord_scv_ec_beartoken;
			if(resCall.code === 401 && lkEconfig && eic_econfig && times <= 2) {
				let resultAccessToken = getAccessToken(lkEconfig.custrecord_scv_ec_domain, lkEconfig.custrecord_scv_ec_userpass);
				accessToken = resultAccessToken.accessToken;
				headers = makeHeaderBearer(accessToken);
				submitFieldsEinvoiceConfigAccessToken(eic_econfig, resultAccessToken, 0);
				({resCall, accessToken} = callApiGet(urlGet, headers, lkEconfig, eic_econfig, times + 1));
			}
			return {resCall, accessToken}
		}
		
		const getAccessToken = (domain, userpass, taxCode) => {
			let idxOf = userpass.indexOf(':');
			idxOf = idxOf < 0 ? userpass.length : idxOf;
			let user = userpass.substring(0, idxOf);
			let pass = userpass.substring(idxOf + 1);
			let headers = {};
			headers['Content-Type']= 'application/json';
			headers['Accept']= '*/*';
			let urlPr = domain + '/user/client/token';
			let {resCall} = callApiPost(urlPr, headers, JSON.stringify({clientId: user, clientSecret: pass, taxCode: taxCode}));
			return JSON.parse(resCall.body).data;
		}
		
		const getInfoConfig = (einvoice_code, subsidiary) => {
			let lkEIC = search.lookupFields({type: RecordType.EINVOCIE_CODE, id: einvoice_code, columns: ['name',
					'custrecord_scv_eic_invoice_pattern', 'custrecord_scv_eic_invoice_serial', 'custrecord_scv_eic_pattern', 'custrecord_scv_eic_econfig']});
			
			let eic_econfig = lkEIC.custrecord_scv_eic_econfig[0]?.value;
			if(!eic_econfig) {
				let lkFieldsSubsidiary = search.lookupFields({type: search.Type.SUBSIDIARY, id: subsidiary, columns: ['custrecord_scv_seic_domain_userpass']});
				eic_econfig = lkFieldsSubsidiary.custrecord_scv_seic_domain_userpass[0].value;
			}
			if(!eic_econfig) throw 'Chưa cấu hình thông tin hệ thống xuất HĐ!';
			
			let columnsConfig = ['custrecord_scv_ec_taxcode', 'custrecord_scv_ec_taxcode', 'custrecord_scv_ec_auto_realease', 'custrecord_scv_ec_auto_sign', 'custrecord_scv_ec_auto_sendcqt',
				'custrecord_scv_ec_domain', 'custrecord_scv_ec_userpass', 'custrecord_scv_ec_beartoken', 'custrecord_scv_ec_expires_in', 'custrecord_scv_ec_longtime'];
			let lkEconfig = search.lookupFields({type: RecordType.EINVOCIE_CONFIG, id: eic_econfig, columns: columnsConfig});
			let longtime = new Date().getTime();
			if((longtime - lkEconfig.custrecord_scv_ec_longtime)/1000 >= lkEconfig.custrecord_scv_ec_expires_in) {
				let resultAccessToken = getAccessToken(lkEconfig.custrecord_scv_ec_domain, lkEconfig.custrecord_scv_ec_userpass);
				submitFieldsEinvoiceConfigAccessToken(eic_econfig, resultAccessToken, 0, longtime);
				lkEconfig = search.lookupFields({type: RecordType.EINVOCIE_CONFIG, id: eic_econfig, columns: columnsConfig});
			}
			return {lkEIC, eic_econfig, lkEconfig}
		}
		
		const getInvoiceInfo = (lkEconfig, eic_econfig, headers, ec_taxcode, transactionUuid) => {
			let urlGet = lkEconfig.custrecord_scv_ec_domain + getApiPathInvoiceInfo(ec_taxcode, transactionUuid);
			let {resCall, accessToken} = callApiGet(urlGet, headers, lkEconfig, eic_econfig, 0);
			let resultBody = JSON.parse(resCall.body);
			return {resCall, accessToken, resultBody};
		}
		
		const saveAudit = (name, strBody, resCall, internalid) => {
			let recAudit = record.create({type: RecordType.EINVOCIE_AUDIT});
			recAudit.setValue('name', name);
			recAudit.setValue('custrecord_scv_aei_body', strBody);
			recAudit.setValue('custrecord_scv_aei_response', JSON.stringify(resCall));
			recAudit.setValue('custrecord_scv_aei_related_transaction', internalid);
			recAudit.save();
		}
		
		const addFieldHiden = (form, id, label, value) => {
			let fId = form.addField({
				id : id,
				type : 'text',
				label : label
			});
			fId.updateDisplayType({
				displayType : 'hidden'
			});
			fId.defaultValue = value;
		}
		
		const genUUIDv4 = () => {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});
		}
		
		return {
			CodeResponse, RecordType, EinvoiceStatus, VNPayInvoiceStatus, AdjustType, LineType, ApiPathEinvoice,
			getApiPathInvoiceInfo, getApiPathGetFilePdf, isContainValue, reValue, getDateNow, makeHeaderBearer,
			sortArayOfObject, getTransactionUuid, getTransactionUuidCreate, getTransactionUuidReplace,
			getBody, convertToDate, convertDateToString, logAudit,
			getGmtServer, getProtocol, callApiPost, callApiGet, getAccessToken, getInfoConfig, getInvoiceInfo,
			saveAudit, addFieldHiden, genUUIDv4
		};
		
	});
