define(['N/config', 'N/encode', 'N/http', 'N/https', 'N/record', 'N/runtime', 'N/search'],
    
    (config, encode, http, https, record, runtime, search) => {
        
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
        
        const TvanStatus = {
            '1': 'Chưa gửi Cơ quan thuế',
            '2': 'Chờ Cơ quan thuế phản hồi',
            '3': 'Gửi TVAN lỗi',
            '4': 'Cơ quan thuế không tiếp nhận',
            '5': 'Cơ quan thuế chấp nhận',
            '6': 'Cơ quan thuế từ chối',
            '7': 'Cơ quan thuế tiếp nhận',
            '8': 'Cơ quan thuế trả kết quả'
        }
        
        const ApiPathEinvoice = {
            TOKEN: '/user/client/token',
            TAO_MOI_HOA_DON: '/api/v6/vat/original',
            DIEU_CHINH_HOA_DON: '/api/v6/vat/adjustment',
            THAY_THE_HOA_DON: '/api/v6/vat/replacement',
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
            if (value !== undefined && value !== null && value !== '') {
                if (util.isArray(value)) {
                    if (value.length > 0) {
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
            if (r === undefined || r === null) {
                r = '';
            }
            return r;
        }
        
        const getDateNow = (gmt = 0) => {
            let now = new Date();
            let sdate = now.toString();
            let p1 = sdate.substring(28, 29);
            let p2 = sdate.substring(29, 31);
            let tcurr = gmt;
            if (p1 === '-') {
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
            header['Accept'] = '*/*';
            header['Authorization'] = bearerAuth;
            return header;
        }
        
        const sortArayOfObject = (arrayOfObjects, field) => {
            arrayOfObjects.sort(function (a, b) {
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
            let replace_times = newRecord.getValue('custbody_scv_einvoice_replace_times');
            replace_times = isContainValue(replace_times) ? replace_times * 1 + 1 : 1;
            let transactionUuid = `NS_${newRecord.id}_${replace_times}`;
            if (newRecord.getValue('custbody_scv_einvoice_replace_times') !== undefined) {
                newRecord.setValue('custbody_scv_einvoice_replace_times', replace_times);
            }
            return transactionUuid;
        };
        
        const getItemFromFreegift = (newRecord, slPromotion) => {
            let lcP = newRecord.getLineCount(slPromotion), slProIt = 'items', slProDc = 'discounteditems',
                applicabilitystatus;
            let listItPro = [], promotiontype, promocode, recPro, lcPIt;
            for (let i = 0; i < lcP; i++) {
                applicabilitystatus = newRecord.getSublistValue({
                    sublistId: slPromotion,
                    fieldId: 'applicabilitystatus',
                    line: i
                });
                if (applicabilitystatus === 'APPLIED') {
                    promotiontype = newRecord.getSublistValue({
                        sublistId: slPromotion,
                        fieldId: 'promotiontype',
                        line: i
                    });
                    if (promotiontype === 'FREEGIFT') {
                        promocode = newRecord.getSublistValue({sublistId: slPromotion, fieldId: 'promocode', line: i});
                        recPro = record.load({type: 'promotioncode', id: promocode});
                        lcPIt = recPro.getLineCount(slProIt);
                        let lcPDc = recPro.getLineCount(slProDc);
                        let items = [];
                        for (let j = 0; j < lcPIt; j++) {
                            items.push(recPro.getSublistValue({sublistId: slProIt, fieldId: 'item', line: j}));
                        }
                        let discounteditems = [];
                        for (let j = 0; j < lcPDc; j++) {
                            discounteditems.push(recPro.getSublistValue({
                                sublistId: slProDc,
                                fieldId: 'discounteditem',
                                line: j
                            }));
                        }
                        listItPro.push({items: items, discounteditems: discounteditems});
                    }
                }
            }
            return listItPro;
        }
        
        const getName = (itemInfo, listItPro, item) => {
            let litpro = listItPro.length;
            let litinfo = itemInfo.length, ititdc, lititdc, itdc, litdc;
            let itemName = '';
            for (let q = 0; q < litpro; q++) {
                ititdc = listItPro[q].discounteditems;
                lititdc = ititdc.length;
                itdc = listItPro[q].items;
                litdc = itdc.length;
                for (let w = 0; w < lititdc; w++) {
                    if (item === ititdc[w]) {
                        for (let e = 0; e < litdc; e++) {
                            for (let r = 0; r < litinfo; r++) {
                                if (itemInfo[r].scv_isfreegift === false && itemInfo[r].scv_item === itdc[e]) {
                                    itemName = itemInfo[r].itemName;
                                }
                            }
                        }
                    }
                }
            }
            if (itemName === '') {
                itemName = 'Z';
            }
            return itemName;
        }
        
        const pushListTax = (listTax, taxrate1, amount, tax1amt) => {
            let objtaxline = listTax.find(o => o.tax === taxrate1);
            if (!objtaxline) {
                objtaxline = {tax: taxrate1};
                listTax.push(objtaxline);
            }
            objtaxline.amount = (objtaxline.amount || 0) + amount;
            objtaxline.taxAmount = (objtaxline.taxAmount || 0) + tax1amt;
            return objtaxline;
        }
        
        const getBody = (newRecord, lkEconfig, lkEIC, options) => {
            let sign_quantity = options.sign_quantity || 1;
            let sign_price = options.sign_price || 1;
            let sign_total = sign_quantity * sign_price;
            let currencyCode = newRecord.getText('currency');
            let fractionDigits = currencyCode === 'VND' ? 0 : 2;
            
            let entity = newRecord.getValue('custbody_scv_invoice_entity') || newRecord.getValue('entity');
            let lkEntity = search.lookupFields({type: search.Type.ENTITY, id: entity, columns: ['recordtype']});
            let recTypeEntity = lkEntity.recordtype;
            let columnEntity = ['custentity_scv_legal_name', 'billaddress', 'custentity_scv_tax_number', 'email', 'isperson', 'custentity_scv_phone_no'];
            lkEntity = search.lookupFields({type: recTypeEntity, id: entity, columns: columnEntity});
            let buyerTaxCode = newRecord.getValue('custbody_scv_invoice_entity_taxid') || lkEntity.custentity_scv_tax_number;
            const DictLkItem = {};
            
            let isperson = lkEntity.isperson;
            let buyerName;
            let buyerFullName = '';
            if (isperson === 'T' || isperson === true) {
                buyerName = lkEntity.custentity_scv_legal_name;
            } else {
                buyerName = newRecord.getValue('custbody_scv_nguoi_mua_hang');
                buyerFullName = newRecord.getValue('custbody_scv_invoice_entity_legalname') || lkEntity.custentity_scv_legal_name || newRecord.getText('entity');
            }
            let paymentMethodName = newRecord.getText('custbody_scv_pay_method');
            let buyerAddress = newRecord.getValue('custbody_scv_invoice_entity_address') || newRecord.getValue('billaddress') || lkEntity.billaddress.replace(/\n/g, ", ");
            
            let buyerPhoneNumber = '';//lkEntity.custentity_scv_phone_no;
            let buyerEmail = lkEntity.email;
            let individualEinvoice = newRecord.getValue('custbody_scv_individual_einvoice');
            if (individualEinvoice === true) {
                buyerFullName = '';
                buyerTaxCode = '';
            }
            
            let itemPromotionTitle = ' (Hàng KM không thanh toán)';
            let slItem = 'item';
            let products = [], taxTypes = [], iNo = 1;
            let totalAmountWithoutDiscount = 0, totalDiscountAmount = 0, totalAmount = 0, totalTaxAmount = 0,
                totalFeeAmount = 0, totalAmountAfterTax = 0;
            
            let aggregate = false;
            if (newRecord.type === 'customsale_scv_sum_transaction') {
                aggregate = newRecord.getValue('custbody_scv_sumtrans_aggregate');
                if (aggregate === 'T' || aggregate === true) {
                    aggregate = true;
                }
                totalTaxAmount = newRecord.getValue('custbody_scv_sum_trans_taxtotal');
            }
            if (aggregate) {
                totalAmountWithoutDiscount = newRecord.getValue('custbody_scv_sum_trans_amount');
                totalAmount = newRecord.getValue('custbody_scv_sum_trans_amount');
                totalTaxAmount = newRecord.getValue('custbody_scv_sum_trans_taxtotal');
                totalAmountAfterTax = newRecord.getValue('custbody_scv_sum_trans_grossamount');
                
                let taxcode = newRecord.getSublistText({
                    sublistId: slItem,
                    fieldId: 'custcol_scv_sumtrans_line_taxcode',
                    line: 0
                });
                let taxrate1 = newRecord.getSublistValue({
                    sublistId: slItem,
                    fieldId: 'custcol_scv_sumtrans_line_taxrate',
                    line: 0
                });
                let objTaxLine = makeValueForTax(taxcode, taxTypes, totalAmount, totalTaxAmount, taxrate1);
                let objTemp = {
                    "ordinalNumber": 1,
                    "code": "",
                    "name": newRecord.getValue('memo'),
                    "property": Number(LineType.HANG_HOA),
                    "unit": "",
                    "quantity": null,
                    "price": null,
                    "discountRate": 0,
                    "discountAmount": 0,
                    "amountWithoutDiscount": totalAmountWithoutDiscount * sign_total,
                    "amount": totalAmount * sign_total,
                    "taxAmount": totalTaxAmount * sign_total,
                    "amountAfterTax": totalAmountAfterTax * sign_total,
                    "tax": objTaxLine.tax
                }
                products.push(objTemp);
            } else {
                let lcItem = newRecord.getLineCount(slItem);
                for (let i = 0; i < lcItem; i++) {
                    let taxcode = newRecord.getSublistText({sublistId: slItem, fieldId: 'taxcode', line: i});
                    let amountWithoutDiscount = newRecord.getSublistValue({
                        sublistId: slItem,
                        fieldId: 'custcol_scv_einv_net_amount',
                        line: i
                    }) || newRecord.getSublistValue({sublistId: slItem, fieldId: 'amount', line: i});
                    let tax1amt = newRecord.getSublistValue({
                        sublistId: slItem,
                        fieldId: 'custcol_scv_einv_taxamount',
                        line: i
                    }) || newRecord.getSublistValue({sublistId: slItem, fieldId: 'tax1amt', line: i});
                    let grossamt = newRecord.getSublistValue({
                        sublistId: slItem,
                        fieldId: 'custcol_scv_einv_grossamount',
                        line: i
                    }) || newRecord.getSublistValue({sublistId: slItem, fieldId: 'grossamt', line: i});
                    let unitPrice = newRecord.getSublistValue({
                        sublistId: slItem,
                        fieldId: 'custcol_scv_einv_rate',
                        line: i
                    }) || newRecord.getSublistValue({sublistId: slItem, fieldId: 'rate', line: i});
                    let unitName = newRecord.getSublistText({
                        sublistId: slItem,
                        fieldId: 'custcol_scv_einvoice_item_unit',
                        line: i
                    }) || newRecord.getSublistText({sublistId: slItem, fieldId: 'units', line: i});
                    let linetype = newRecord.getSublistValue({
                        sublistId: slItem,
                        fieldId: 'custcol_scv_einvoice_linetype',
                        line: i
                    });
                    let itemtype = newRecord.getSublistValue({sublistId: slItem, fieldId: 'itemtype', line: i});
                    let freegiftpromotion = newRecord.getSublistValue({
                        sublistId: slItem,
                        fieldId: 'freegiftpromotion',
                        line: i
                    });
                    let quantity = newRecord.getSublistValue({sublistId: slItem, fieldId: 'quantity', line: i});
                    let taxrate1 = newRecord.getSublistValue({sublistId: slItem, fieldId: 'taxrate1', line: i});
                    let description = newRecord.getSublistValue({
                        sublistId: slItem,
                        fieldId: 'description',
                        line: i
                    }) || newRecord.getSublistText({sublistId: slItem, fieldId: 'item', line: i});
                    let item = newRecord.getSublistValue({sublistId: slItem, fieldId: 'item', line: i});
                    let lkItem = DictLkItem[item];
                    if (!lkItem) {
                        lkItem = search.lookupFields({type: 'item', id: item, columns: ['upccode']});
                        DictLkItem[item] = lkItem;
                    }
                    let einv_item_code = newRecord.getSublistValue({
                        sublistId: slItem,
                        fieldId: 'custcol_scv_einv_item_code',
                        line: i
                    });
                    
                    if (newRecord.type === 'customsale_scv_sum_transaction') {
                        amountWithoutDiscount = newRecord.getSublistValue({
                            sublistId: slItem,
                            fieldId: 'custcol_scv_sumtrans_line_amount',
                            line: i
                        }) * 1;
                        tax1amt = newRecord.getSublistValue({
                            sublistId: slItem,
                            fieldId: 'custcol_scv_sumtrans_line_taxamt',
                            line: i
                        }) * 1;
                        grossamt = newRecord.getSublistValue({
                            sublistId: slItem,
                            fieldId: 'custcol_scv_sumtrans_line_grossamt',
                            line: i
                        }) * 1;
                        taxcode = newRecord.getSublistText({
                            sublistId: slItem,
                            fieldId: 'custcol_scv_sumtrans_line_taxcode',
                            line: i
                        });
                        taxrate1 = newRecord.getSublistValue({
                            sublistId: slItem,
                            fieldId: 'custcol_scv_sumtrans_line_taxrate',
                            line: i
                        }) || 0;
                        quantity = newRecord.getSublistValue({
                            sublistId: slItem,
                            fieldId: 'custcol_scv_sumtrans_line_quantity',
                            line: i
                        });
                        freegiftpromotion = newRecord.getSublistValue({
                            sublistId: slItem,
                            fieldId: 'custcol_scv_sum_trans_freegift',
                            line: i
                        });
                    }
                    
                    let discountAmount = 0, discountRate = 0, discount_tax = 0, discount_grossamt = 0, discount = null;
                    let isclosed = newRecord.getSublistValue({sublistId: slItem, fieldId: 'isclosed', line: i});
                    if (itemtype !== 'Discount' && itemtype !== 'Description' && !(isclosed === true || isclosed === 'T') && linetype !== LineType.GHI_CHU) {
                        if (i + 1 < lcItem) {
                            if (newRecord.getSublistValue({
                                sublistId: slItem,
                                fieldId: 'itemtype',
                                line: i + 1
                            }) === 'Discount') {
                                if (amountWithoutDiscount > 0) {
                                    discountAmount = Math.abs(newRecord.getSublistValue({
                                        sublistId: slItem,
                                        fieldId: 'amount',
                                        line: i + 1
                                    }));
                                    discount = Math.abs(newRecord.getSublistValue({
                                        sublistId: slItem,
                                        fieldId: 'rate',
                                        line: i + 1
                                    }));
                                    discountRate = discount / 100;
                                    discount_tax = Math.abs(newRecord.getSublistValue({
                                        sublistId: slItem,
                                        fieldId: 'tax1amt',
                                        line: i + 1
                                    }));
                                    discount_grossamt = Math.abs(newRecord.getSublistValue({
                                        sublistId: slItem,
                                        fieldId: 'grossamt',
                                        line: i + 1
                                    }));
                                    discountAmount = Math.abs(newRecord.getSublistValue({
                                        sublistId: slItem,
                                        fieldId: 'amount',
                                        line: i + 1
                                    }));
                                }
                                if (newRecord.type === 'customsale_scv_sum_transaction') {
                                    discountAmount = Math.abs(newRecord.getSublistValue({
                                        sublistId: slItem,
                                        fieldId: 'custcol_scv_sumtrans_line_amount',
                                        line: i + 1
                                    }));
                                    discount_tax = Math.abs(newRecord.getSublistValue({
                                        sublistId: slItem,
                                        fieldId: 'custcol_scv_sumtrans_line_taxamt',
                                        line: i + 1
                                    }));
                                    discount_grossamt = Math.abs(newRecord.getSublistValue({
                                        sublistId: slItem,
                                        fieldId: 'custcol_scv_sumtrans_line_grossamt',
                                        line: i + 1
                                    }));
                                    discountRate = (discountAmount / amountWithoutDiscount).toFixed(2) * 1;
                                    discount = discountRate * 100;
                                }
                            }
                        }
                        
                        if (!freegiftpromotion) {
                            tax1amt = Number((tax1amt - discount_tax).toFixed(fractionDigits));
                            grossamt = Number((grossamt - discount_grossamt).toFixed(fractionDigits));
                            let amountLine = Number((amountWithoutDiscount - discountAmount).toFixed(fractionDigits));
                            
                            totalAmountWithoutDiscount = totalAmountWithoutDiscount + amountWithoutDiscount;
                            totalDiscountAmount = totalDiscountAmount + discountAmount;
                            totalAmount = totalAmount + amountWithoutDiscount - discountAmount;
                            totalTaxAmount = totalTaxAmount + tax1amt;
                            totalAmountAfterTax = totalAmountAfterTax + grossamt;
                            
                            let objTaxLine = makeValueForTax(taxcode, taxTypes, amountLine, tax1amt, taxrate1);
                            let objTemp = {
                                "ordinalNumber": iNo++,
                                "code": lkItem.upccode || einv_item_code,
                                "name": description,
                                "property": Number(linetype || LineType.HANG_HOA),
                                "unit": unitName,
                                "quantity": quantity * sign_quantity,
                                "price": unitPrice * sign_price,
                                "discountRate": discountRate,
                                "discountAmount": discountAmount,
                                "amountWithoutDiscount": amountWithoutDiscount * sign_total,
                                "amount": amountLine * sign_total,
                                "taxAmount": tax1amt * sign_total,
                                "amountAfterTax": grossamt * sign_total,
                                "tax": objTaxLine.tax
                            }
                            products.push(objTemp);
                        } else {
                            let objTaxLine = makeValueForTax(taxcode, taxTypes, 0, 0, taxrate1);
                            let objTemp = {
                                "ordinalNumber": iNo++,
                                "code": lkItem.upccode || einv_item_code,
                                "name": description + itemPromotionTitle,
                                "property": Number(LineType.HANG_HOA),
                                "unit": unitName,
                                "quantity": quantity * sign_quantity,
                                "price": 0,
                                "discountRate": 0,
                                "discountAmount": 0,
                                "amountWithoutDiscount": 0,
                                "amount": 0,
                                "taxAmount": 0,
                                "amountAfterTax": 0,
                                "tax": objTaxLine.tax
                            }
                            products.push(objTemp);
                        }
                    } else if (itemtype === 'Description' || linetype === LineType.GHI_CHU) {
                        let objTemp = {
                            "ordinalNumber": iNo++,
                            "code": lkItem.upccode || einv_item_code,
                            "name": description,
                            "property": Number(LineType.GHI_CHU),
                            "unit": "",
                            "quantity": null,
                            "price": null,
                            "discountRate": null,
                            "discountAmount": null,
                            "amountWithoutDiscount": null,
                            "amount": null,
                            "taxAmount": null,
                            "amountAfterTax": null,
                            "tax": null
                        }
                        products.push(objTemp);
                    }
                }
                
                if (newRecord.type === 'customsale_scv_sum_transaction' && products.length > 1) {
                    let fieldCompare = ['name', 'unit', 'price'];
                    let fieldSum = ['quantity', 'discountAmount', 'amountWithoutDiscount', 'amount', 'taxAmount', 'amountAfterTax'];
                    compositeArr(products, fieldCompare, fieldSum, 0, fractionDigits);
                    for (let i = 0; i < products.length; i++) {
                        products[i].ordinalNumber = i + 1;
                        products[i].quantity = !!products[i].quantity ? Number(products[i].quantity.toFixed(8)) : products[i].quantity;
                    }
                }
            }
            for (let objtaxline of taxTypes) {
                objtaxline.amount = objtaxline.amount.toFixed(fractionDigits) * sign_total;
                objtaxline.taxAmount = objtaxline.taxAmount.toFixed(fractionDigits) * sign_total;
            }
            
            totalAmountWithoutDiscount = Number(totalAmountWithoutDiscount.toFixed(fractionDigits));
            totalDiscountAmount = Number(totalDiscountAmount.toFixed(fractionDigits));
            totalAmount = Number(totalAmount.toFixed(fractionDigits));
            totalTaxAmount = Number(totalTaxAmount.toFixed(fractionDigits));
            totalFeeAmount = Number(totalFeeAmount.toFixed(fractionDigits));
            totalAmountAfterTax = Number(totalAmountAfterTax.toFixed(fractionDigits));
            
            return {
                "taxCode": lkEconfig.custrecord_scv_ec_taxcode,
                "autoRelease": lkEconfig.custrecord_scv_ec_auto_realease,
                "autoSign": lkEconfig.custrecord_scv_ec_auto_sign,
                "autoSendCQT": lkEconfig.custrecord_scv_ec_auto_sendcqt,
                "invoice": {
                    "requestId": options.transactionUuid,
                    "invoiceCreatedDate": options.invoiceCreatedDate,
                    "invoiceSymbol": lkEIC.custrecord_scv_eic_invoice_serial,
                    "paymentMethod": paymentMethodName,
                    "currencyUnit": currencyCode,
                    "currencyExchangeRate": newRecord.getValue('exchangerate'),
                    "receipt": newRecord.getValue('tranid'),
                    "buyerCustomerCode": "",
                    "buyerTaxCode": buyerTaxCode,
                    "buyerName": buyerName,
                    "buyerAddress": buyerAddress,
                    "buyerFullName": buyerFullName,
                    "buyerPhoneNumber": buyerPhoneNumber,
                    "buyerEmail": buyerEmail,
                    "buyerBankName": "",
                    "buyerBankAccountNumber": "",
                    "discount": false,
                    "invoiceNote": "",
                    "internalNote": "",
                    "totalAmountWithoutDiscount": totalAmountWithoutDiscount * sign_total,
                    "totalDiscountAmount": totalDiscountAmount * sign_total,
                    "totalAmount": totalAmount * sign_total,
                    "totalTaxAmount": totalTaxAmount * sign_total,
                    "totalFeeAmount": totalFeeAmount * sign_total,
                    "totalAmountAfterTax": totalAmountAfterTax * sign_total,
                    "totalPaymentInWord": "",
                    "branchCode": "",
                    "isPetrolInvoice": false,
                    "warehouseAddress": "",
                    "isSendMail": true,
                    "createdBy": getUser().name,
                    "taxTypes": taxTypes,
                    "fees": [],
                    "products": products
                }
            };
        }
        
        const getUser = () => {
            let user = runtime.getCurrentUser();
            let email = user.email;
            let lkE = search.lookupFields({
                type: 'entity',
                id: user.id,
                columns: ['custentity_scv_legal_name', 'entityid']
            });
            let exchangeUser = lkE.custentity_scv_legal_name || lkE.entityid;
            return {username: email, name: exchangeUser}
        }
        
        const makeValueForTax = (taxcode, listTax, amount, tax1amt, taxrate1) => {
            let tax;
            if (taxcode.indexOf('VAT0') !== -1) {
                tax = '0%';
            } else if (taxcode.indexOf('VATE') !== -1 || taxcode.indexOf('KCT') !== -1) {
                tax = 'KCT';
            } else if (taxcode.indexOf('UNDEF') !== -1 || taxcode.indexOf('KKKNT') !== -1) {
                tax = 'KKKNT';
            } else {
                tax = taxrate1 + '%';
            }
            return pushListTax(listTax, tax, amount, tax1amt);
        }
        
        const compositeArr = (arrObj, fieldCompare, fieldSum, start, num_scale) => {
            let lAOR = arrObj.length;
            let lAO = lAOR - 1;
            let lFC = fieldCompare.length;
            let lFS = fieldSum.length;
            let isSplice = false, isFlag = false, count;
            let istart = start, temp1, temp2;
            for (let i = start; i < lAO; i++) {
                count = 0;
                for (let n = i + 1; n < lAOR; n++) {
                    isFlag = true;
                    for (let j = 0; j < lFC; j++) {
                        isFlag = true;
                        temp1 = arrObj[i][fieldCompare[j]];
                        temp2 = arrObj[n][fieldCompare[j]];
                        if (temp1 !== temp2) {
                            isFlag = false;
                            break;
                        }
                    }
                    if (isFlag) {
                        for (let j = 0; j < lFS; j++) {
                            arrObj[i][fieldSum[j]] = arrObj[i][fieldSum[j]] + arrObj[n][fieldSum[j]];
                            if (fieldSum[j] !== 'quantity') {
                                arrObj[i][fieldSum[j]] = (arrObj[i][fieldSum[j]] * 1).toFixed(num_scale) * 1;
                            }
                        }
                        arrObj.splice(n, 1);
                        count++;
                        lAOR = lAOR - 1;
                        lAO = lAO - 1;
                        //break;
                    }
                }
                istart = i;
                if (count > 0) {
                    isSplice = true;
                    break;
                }
            }
            if (isSplice) {
                compositeArr(arrObj, fieldCompare, fieldSum, istart, num_scale);
            }
        }
        
        const convertToDate = (invoiceCreatedDate) => {
            let splitDate = invoiceCreatedDate.split('-');
            return new Date(splitDate[0], splitDate[1] * 1 - 1, splitDate[2]);
        }
        
        const convertDateToString = (dInput) => {
            let dOutput = '';
            if (dInput) {
                dOutput = `${dInput.getFullYear()}-${String(dInput.getMonth() + 1).padStart(2, '0')}-${String(dInput.getDate()).padStart(2, '0')}`;
            }
            return dOutput;
        }
        
        const logAudit = (lfunc, name, body, response, transactionid) => {
            let recAudit = record.create({type: RecordType.EINVOCIE_AUDIT});
            let fields = ['name', 'custrecord_scv_aei_body', 'custrecord_scv_aei_response', 'custrecord_scv_aei_related_transaction'];
            lfunc.setValueData(recAudit, fields, [name, body, JSON.stringify(response), transactionid]);
            recAudit.save({enableSourcing: false, ignoreMandatoryFields: true});
        }
        
        const getGmtServer = () => {
            let now = new Date();
            let sdate = now.toString();
            let p1 = sdate.substring(28, 29);
            let p2 = sdate.substring(29, 31);
            let tcurr;
            if (p1 === '-') {
                tcurr = -1 * p2;
            } else {
                tcurr = 1 * p2;
            }
            return tcurr;
        }
        
        const getProtocol = (baseurl) => {
            let protocol = http;
            if (baseurl.substring(0, 5) === 'https') {
                protocol = https;
            }
            return protocol;
        }
        
        const callApiPost = (urlPost, headers, strBody, lkEconfig, eic_econfig, times = 0) => {
            let protocol = getProtocol(urlPost);
            let resCall = protocol.post({
                url: urlPost,
                headers: headers,
                body: strBody
            });
            let accessToken = lkEconfig?.custrecord_scv_ec_beartoken;
            if (resCall.code === 401 && lkEconfig && eic_econfig && times <= 2) {
                let resultAccessToken = getAccessToken(lkEconfig.custrecord_scv_ec_domain, lkEconfig.custrecord_scv_ec_userpass);
                accessToken = resultAccessToken.accessToken;
                headers = makeHeaderBearer(accessToken);
                submitFieldsEinvoiceConfigAccessToken(eic_econfig, resultAccessToken, 0);
                ({resCall, accessToken} = callApiPost(urlPost, headers, strBody, lkEconfig, eic_econfig, times + 1));
            }
            return {resCall, accessToken}
        }
        
        const submitFieldsEinvoiceConfigAccessToken = (eic_econfig, resultAccessToken, times = 0, longtime = 0) => {
            if (times <= 2) {
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
        
        const callApiGet = (urlGet, headers, lkEconfig, eic_econfig, times = 0) => {
            let protocol = getProtocol(urlGet);
            let resCall = protocol.get({
                url: urlGet,
                headers: headers
            });
            let accessToken = lkEconfig?.custrecord_scv_ec_beartoken;
            if (resCall.code === 401 && lkEconfig && eic_econfig && times <= 2) {
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
            headers['Content-Type'] = 'application/json';
            headers['Accept'] = '*/*';
            let urlPr = domain + '/user/client/token';
            let {resCall} = callApiPost(urlPr, headers, JSON.stringify({
                clientId: user,
                clientSecret: pass,
                taxCode: taxCode
            }));
            return JSON.parse(resCall.body).data;
        }
        
        const getInfoConfig = (einvoice_code, subsidiary) => {
            let lkEIC = search.lookupFields({
                type: RecordType.EINVOCIE_CODE, id: einvoice_code, columns: ['name',
                    'custrecord_scv_eic_invoice_pattern', 'custrecord_scv_eic_invoice_serial', 'custrecord_scv_eic_pattern', 'custrecord_scv_eic_econfig']
            });
            
            let eic_econfig = lkEIC.custrecord_scv_eic_econfig[0]?.value;
            if (!eic_econfig) {
                let lkFieldsSubsidiary = search.lookupFields({
                    type: search.Type.SUBSIDIARY,
                    id: subsidiary,
                    columns: ['custrecord_scv_seic_domain_userpass']
                });
                eic_econfig = lkFieldsSubsidiary.custrecord_scv_seic_domain_userpass[0].value;
            }
            if (!eic_econfig) throw 'Chưa cấu hình thông tin hệ thống xuất HĐ!';
            
            let columnsConfig = ['custrecord_scv_ec_taxcode', 'custrecord_scv_ec_auto_realease', 'custrecord_scv_ec_auto_sign', 'custrecord_scv_ec_auto_sendcqt',
                'custrecord_scv_ec_domain', 'custrecord_scv_ec_userpass', 'custrecord_scv_ec_beartoken', 'custrecord_scv_ec_expires_in', 'custrecord_scv_ec_longtime'];
            let lkEconfig = search.lookupFields({
                type: RecordType.EINVOCIE_CONFIG,
                id: eic_econfig,
                columns: columnsConfig
            });
            let longtime = new Date().getTime();
            if ((longtime - lkEconfig.custrecord_scv_ec_longtime) / 1000 >= lkEconfig.custrecord_scv_ec_expires_in) {
                let resultAccessToken = getAccessToken(lkEconfig.custrecord_scv_ec_domain, lkEconfig.custrecord_scv_ec_userpass);
                submitFieldsEinvoiceConfigAccessToken(eic_econfig, resultAccessToken, 0, longtime);
                lkEconfig = search.lookupFields({
                    type: RecordType.EINVOCIE_CONFIG,
                    id: eic_econfig,
                    columns: columnsConfig
                });
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
                id: id,
                type: 'text',
                label: label
            });
            fId.updateDisplayType({
                displayType: 'hidden'
            });
            fId.defaultValue = value;
        }
        
        const genUUIDv4 = () => {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
        
        return {
            CodeResponse,
            RecordType,
            EinvoiceStatus,
            VNPayInvoiceStatus,
            AdjustType,
            LineType,
            TvanStatus,
            ApiPathEinvoice,
            getApiPathInvoiceInfo,
            getApiPathGetFilePdf,
            isContainValue,
            reValue,
            getDateNow,
            makeHeaderBearer,
            sortArayOfObject,
            getTransactionUuid,
            getTransactionUuidCreate,
            getTransactionUuidReplace,
            getItemFromFreegift,
            getName,
            getBody,
            convertToDate,
            convertDateToString,
            logAudit,
            getGmtServer,
            getProtocol,
            callApiPost,
            callApiGet,
            getAccessToken,
            getInfoConfig,
            getInvoiceInfo,
            saveAudit,
            addFieldHiden,
            genUUIDv4
        };
        
    });
