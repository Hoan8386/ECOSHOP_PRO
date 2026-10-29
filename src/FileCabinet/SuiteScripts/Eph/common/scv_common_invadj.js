/**
 * Nội dung:
 * Key:
 * =======================================================================================
 *  Date                Author                  Description
 *  10 Apr 2026         Khanh Tran              Init, create file.
 *  10 Apr 2026         Khanh Tran              Chức năng tự động tạo Invoice và Journal Có Nguồn từ Inventory Adjustment, from mr.Đại(https://app.clickup.com/t/86d2cz2g2)
 */
define(["N/record", "N/url", "N/search", "N/ui/message",
    "../lib/scv_lib_function.js",

    "../cons/scv_cons_list_einvoice_linetype.js",
    "../cons/scv_cons_approvalstatus.js",
], function (record, url, search, message,
    lbf,

    constListEinvoiceLineType,
    constApprovalStatus,
) {
    const _export = {
        SuiteletInvAdj2Trans: {
            ID: "customscript_scv_sl_ina2trans",
            DEPLOYID_UI: "customdeploy_scv_sl_ina2trans",
            DEPLOYID_DATA: "customdeploy_scv_sl_ina2trans_svc",
        }
    };

    _export.addBtnCreateInvoice = function (scriptContext) {
        if(scriptContext.type != "view") return false;
        
        let newRec = scriptContext.newRecord;
        if (newRec.type != "inventoryadjustment") return false;

        let isCreateInvoice = _export.isCreateInvoice(newRec);
        if (!isCreateInvoice) return;

        let urlSl = url.resolveScript({
            scriptId: _export.SuiteletInvAdj2Trans.ID,
            deploymentId: _export.SuiteletInvAdj2Trans.DEPLOYID_DATA,
            returnExternalUrl: false,
            params: {
                action: 'ina2inv',
                recid: newRec.id,
                rectype: newRec.type,
            }
        });

        scriptContext.form.addButton({
            id: 'custpage_btn_createinvoice',
            label: 'Create Invoice',
            functionName: "window.location.replace('" + urlSl + "');"
        });
    }

    _export.isCreateInvoice = function (newRec) {
        let custbody_scv_related_trans = newRec.getValue('custbody_scv_related_trans') || [];
        if (custbody_scv_related_trans.length) return false;

        let custbody_atlas_inv_adj_reason = newRec.getValue('custbody_atlas_inv_adj_reason');
        if (!custbody_atlas_inv_adj_reason) return false;

        let lkAdjReason = search.lookupFields({
            type: 'customrecord_atlas_inv_adj_reasn', id: custbody_atlas_inv_adj_reason, columns: ['custrecord_scv_auto_cre_inv']
        });
        if (lkAdjReason.custrecord_scv_auto_cre_inv === false) return false;

        return true;

    }

    _export.showResultINA2INV = function (scriptContext) {
        if (scriptContext.type !== "view") return;

        let request = scriptContext.request;
        if (!request) return;

        let params = request.parameters;
        if (!params) return;

        if (!params.msg) return;

        if (params.action == "ina2inv") {
            let msg = decodeURIComponent(params.msg);

            scriptContext.form.addPageInitMessage({
                type: params.success === 'true' ? message.Type.CONFIRMATION : message.Type.ERROR,
                message: msg,
                duration: 60000
            });
        }
    }

    _export.createInvoice = function (inaId) {
        let inaRec = record.load({
            type: 'inventoryadjustment', id: inaId, isDynamic: true
        });

        let isCreateInvoice = _export.isCreateInvoice(inaRec);
        if (!isCreateInvoice) return;

        let entity = '';
        let location = inaRec.getValue('adjlocation');
        if (location) {
            let lkLocation = search.lookupFields({
                type: 'location', id: location, columns: ['custrecord_scv_iu_cus']
            });
            entity = lkLocation.custrecord_scv_iu_cus?.[0]?.value;
        }

        let invRec = record.create({
            type: 'invoice', isDynamic: true, defaultValues: {
                entity: entity
            }
        });

        let account = '', item = '', custbody_scv_einvoice_code = '';
        let subsidiary = inaRec.getValue('subsidiary');
        if (subsidiary) {
            let lkSubsidiary = search.lookupFields({
                type: 'subsidiary', id: subsidiary, columns: ['custrecord_scv_acc_ina2inv', 'custrecord_scv_item_ina2inv', 'custrecord_scv_einvoice_form']
            });
            account = lkSubsidiary.custrecord_scv_acc_ina2inv?.[0]?.value;
            item = lkSubsidiary.custrecord_scv_item_ina2inv?.[0]?.value;
            custbody_scv_einvoice_code = lkSubsidiary.custrecord_scv_einvoice_form?.[0]?.value;
        }

        let custbody_atlas_inv_adj_reason = inaRec.getValue('custbody_atlas_inv_adj_reason');
        let inv_adj_reasn_description = '';
        let isReg = false;
        if (custbody_atlas_inv_adj_reason) {
            let lkAdjReason = search.lookupFields({
                type: 'customrecord_atlas_inv_adj_reasn', id: custbody_atlas_inv_adj_reason, columns: ['custrecord_scv_iar_e_inv_description', 'custrecord_scv_inv_adj_is_reg']
            });

            inv_adj_reasn_description = lkAdjReason.custrecord_scv_iar_e_inv_description;
            isReg = lkAdjReason.custrecord_scv_inv_adj_is_reg;
        }

        let memo = inaRec.getValue('memo');
        let saleseffectivedate = inaRec.getValue('saleseffectivedate');
        let cseg_scv_channel = inaRec.getValue('cseg_scv_channel');
        let department = inaRec.getValue('department');
        let cseg_scv_sg_proj = inaRec.getValue('cseg_scv_sg_proj');

        let slInventory = 'inventory';
        let lcInventory = inaRec.getLineCount("inventory");
        let arrInventory = [];
        for (let i = 0; i < lcInventory; i++) {
            let objInventory = {};

            objInventory.item = inaRec.getSublistValue({
                sublistId: slInventory, fieldId: 'item', line: i
            })
            
            objInventory.location = inaRec.getSublistValue({
                sublistId: slInventory, fieldId: 'location', line: i
            })
            
            objInventory.adjustqtyby = inaRec.getSublistValue({
                sublistId: slInventory, fieldId: 'adjustqtyby', line: i
            })
            
            objInventory.unitcost = inaRec.getSublistValue({
                sublistId: slInventory, fieldId: 'unitcost', line: i
            }) 
            
            objInventory.custcol_scv_sumtrans_line_taxrate = inaRec.getSublistValue({
                sublistId: slInventory, fieldId: 'custcol_scv_sumtrans_line_taxrate', line: i
            });
            
            objInventory.custcol_scv_base_price = inaRec.getSublistValue({
                sublistId: slInventory, fieldId: 'custcol_scv_base_price', line: i
            });

            if (objInventory.item) {
                let lkItem = search.lookupFields({
                    type: 'item', id: objInventory.item, columns: ['custitem_scv_einvoice_unit', 'upccode', 'custitem_boc_pricelabel_desc']
                });
                objInventory.item_custitem_scv_einvoice_unit = lkItem.custitem_scv_einvoice_unit?.[0]?.value;
                objInventory.item_upccode = lkItem.upccode;
                objInventory.item_description = lkItem.custitem_boc_pricelabel_desc || '';
            }

            arrInventory.push(objInventory);
        }

        lbf.setValueData(invRec,  [
            "memo",
            "account", "saleseffectivedate",
            "subsidiary", "location",
            "cseg_scv_channel", "custbody_scv_related_ia",
            "department", "cseg_scv_sg_proj",
            "custbody_scv_auto_issue_e_inv", "custbody_scv_einvoice_code"
        ], [
            memo,
            account, saleseffectivedate,
            subsidiary, location,
            cseg_scv_channel, inaId,
            department, cseg_scv_sg_proj,
            true, custbody_scv_einvoice_code
        ]);

        let slItem = 'item';
        for (let objInventory of arrInventory) {
            invRec.selectNewLine({ sublistId: slItem });

            //set item từ INA để lấy taxcode của nó.
            invRec.setCurrentSublistValue({
                sublistId: slItem, fieldId: 'item', value: objInventory.item
            });
            
            let taxcode = invRec.getCurrentSublistValue({
                sublistId: slItem, fieldId: 'taxcode'
            });

            let taxrate1 = invRec.getCurrentSublistValue({
                sublistId: slItem, fieldId: 'taxrate1'
            });
            taxrate1 = taxrate1 ? taxrate1/100 : 0;

            let custcol_scv_einvoice_linetype = constListEinvoiceLineType.Records.HangHoa.ID;
            let quantity = Math.abs(objInventory.adjustqtyby);
            let finalTaxrate1 = taxrate1;
            let tax1amt = isReg ? 0 : quantity * Math.round(finalTaxrate1 * objInventory.custcol_scv_base_price);
            let grossamt = 0;
            let custcol_scv_einv_taxamount = isReg  ? 0 : Math.round(finalTaxrate1 * objInventory.custcol_scv_base_price) * quantity;
            let custcol_scv_einv_rate = isReg ? 0 : objInventory.custcol_scv_base_price;
            let custcol_scv_einv_grossamount = isReg ? 0 : Math.round(objInventory.custcol_scv_base_price * (1 + finalTaxrate1)) * quantity;
            let custcol_scv_einv_net_amount = isReg ? 0 : objInventory.custcol_scv_base_price * quantity;
            let rate = 0;
            let amount = 0;

            lbf.setCurrentSublistValueData(invRec, slItem, [
                'item', 'taxcode',
                'taxrate1', 'description',
                'location', 'quantity',
                'rate', 'amount',
                'grossamt', 'tax1amt',
                'custcol_scv_einvoice_item_unit', 'custcol_scv_einvoice_linetype',
                'custcol_scv_einv_item_code', 'custcol_scv_einv_taxamount',
                'custcol_scv_einv_rate', 'custcol_scv_einv_grossamount',
                'custcol_scv_einv_net_amount',
            ], [
                item, taxcode,
                finalTaxrate1 * 100, objInventory.item_description,
                objInventory.location, quantity,
                rate, amount,
                grossamt, tax1amt,
                objInventory.item_custitem_scv_einvoice_unit, custcol_scv_einvoice_linetype,
                objInventory.item_upccode, custcol_scv_einv_taxamount,
                custcol_scv_einv_rate, custcol_scv_einv_grossamount,
                custcol_scv_einv_net_amount
            ]);

            invRec.commitLine({ sublistId: slItem });
        }

        //add line mô tả lý do ra hóa đơn
        invRec.selectNewLine({ sublistId: slItem });

        lbf.setCurrentSublistValueData(invRec, slItem, [
            'item', 'description'
        ], [
            -3, inv_adj_reasn_description
        ]);

        invRec.commitLine({ sublistId: slItem });

        let invId = invRec.save({ enableSourcing: false, ignoreMandatoryFields: true });log.error("create createInvoice", invId);

        inaRec.setValue('custbody_scv_related_trans', invId);

        inaRec.save({ enableSourcing: false, ignoreMandatoryFields: true });

        return invId;
    }

    _export.addBtnCreateJournal = function (scriptContext) {
        if(scriptContext.type != "view") return false;
        
        let newRec = scriptContext.newRecord;
        if (newRec.type != "invoice") return false;

        let isCreateJournal = _export.isCreateJournal(newRec);
        if (!isCreateJournal) return;

        let urlSl = url.resolveScript({
            scriptId: _export.SuiteletInvAdj2Trans.ID,
            deploymentId: _export.SuiteletInvAdj2Trans.DEPLOYID_DATA,
            returnExternalUrl: false,
            params: {
                action: 'inv2jrl',
                recid: newRec.id,
                rectype: newRec.type,
            }
        });

        scriptContext.form.addButton({
            id: 'custpage_btn_createjournal',
            label: 'Create Journal',
            functionName: "window.location.replace('" + urlSl + "');"
        });

    }

    _export.isCreateJournal = function (newRec) {
        let custbody_scv_related_trans = newRec.getValue('custbody_scv_related_trans');
        let custbody_scv_related_ia = newRec.getValue('custbody_scv_related_ia');
        let custrecord_scv_inv_adj_is_reg = false;

        if (custbody_scv_related_ia) {
            let lkIA = search.lookupFields({
                type: 'inventoryadjustment', id: custbody_scv_related_ia, columns: ['custbody_atlas_inv_adj_reason.custrecord_scv_inv_adj_is_reg']
            });
            custrecord_scv_inv_adj_is_reg = lkIA["custbody_atlas_inv_adj_reason.custrecord_scv_inv_adj_is_reg"];
        }

        if (custbody_scv_related_trans.length == 0 && custbody_scv_related_ia && custrecord_scv_inv_adj_is_reg === false) return true;

        return false; 
    }

    _export.showResultINV2JRL = function (scriptContext) {
        if (scriptContext.type !== "view") return;

        let request = scriptContext.request;
        if (!request) return;

        let params = request.parameters;
        if (!params) return;

        if (!params.msg) return;

        if (params.action == "inv2jrl") {
            let msg = decodeURIComponent(params.msg);

            scriptContext.form.addPageInitMessage({
                type: params.success === 'true' ? message.Type.CONFIRMATION : message.Type.ERROR,
                message: msg,
                duration: 60000
            });
        }
    }

    _export.createJournal = function (invId) {
        let invRec = record.load({
            type: 'invoice', id: invId, isDynamic: true
        });
        
        let isCreateJournal = _export.isCreateJournal(invRec);
        if (!isCreateJournal) return;

        let jrlRec = record.create({
            type: 'journalentry', isDynamic: true
        });

        let subsidiary = invRec.getValue('subsidiary');
        let currency = invRec.getValue('currency');
        let memo = invRec.getValue('memo');
        let exchangerate = invRec.getValue('exchangerate');
        let account = invRec.getValue('account');
        let entity = invRec.getValue('entity');
        let location = invRec.getValue('location');
        let amountremaining = invRec.getValue('amountremaining');
        let custbody_scv_related_ia = invRec.getValue('custbody_scv_related_ia');

        let related_ia_account = "";
        if (custbody_scv_related_ia) {
            let lkIA = search.lookupFields({
                type: 'inventoryadjustment', id: custbody_scv_related_ia, columns: ['custbody_atlas_inv_adj_reason.custrecord_scv_inv_adj_reason_gl_acc']
            });
            related_ia_account = lkIA["custbody_atlas_inv_adj_reason.custrecord_scv_inv_adj_reason_gl_acc"]?.[0]?.value || "";
        }

        lbf.setValueData(jrlRec,  [
            "subsidiary", "currency",
            "memo", "exchangerate",
            "custbody_scv_source_transaction", "approvalstatus"
        ], [
            subsidiary, currency,
            memo, exchangerate,
            invRec.id, constApprovalStatus.RECORDS.APPROVED.ID
        ]);

        let arrLine = [
            {
                account: account,
                debit: 0,
                credit: amountremaining,
                entity: entity,
                location: location,
            }
        ];
        let slItem = 'item';
        let lcItem = invRec.getLineCount(slItem);
        //Bỏ line cuối ở INV
        for (let i = 0; i < lcItem - 1; i++) {
            let objLine = {
                account: related_ia_account,
                debit: 0,
                credit: 0,
                entity: entity,
                location: location,
            };
            
            objLine.debit = invRec.getSublistValue({
                sublistId: slItem, fieldId: 'custcol_scv_einv_taxamount', line: i
            })

            arrLine.push(objLine);
        }

        let slLine = 'line';
        for (let objLine of arrLine) {
            jrlRec.selectNewLine(slLine);

            for(let property in objLine) {
                jrlRec.setCurrentSublistValue(slLine, property, objLine[property]);
            }

            jrlRec.commitLine(slLine);
        }

        let jrlId = jrlRec.save({ enableSourcing: false, ignoreMandatoryFields: true });log.error("create createJournal", jrlId);

        invRec.setValue('custbody_scv_related_trans', jrlId);

        invRec.save({ enableSourcing: false, ignoreMandatoryFields: true });

        return jrlId;
    }

    _export.createCustomerpayment = (invId) => {
        let cuspayRec = record.transform({
            fromType: 'invoice',
            fromId: invId,
            toType: 'customerpayment',
            isDynamic: true
        });
        
        let slApply = 'apply';
        let lcApply = cuspayRec.getLineCount(slApply);
        for (let i = 0; i < lcApply; i++) {
            cuspayRec.selectLine(slApply, i);

            cuspayRec.setCurrentSublistValue(slApply, 'apply', true);

            cuspayRec.commitLine(slApply);
        }

        let slCredit = 'credit';
        let lcCredit = cuspayRec.getLineCount(slCredit);
        for (let i = 0; i < lcCredit; i++) {
            cuspayRec.selectLine(slCredit, i);

            cuspayRec.setCurrentSublistValue(slCredit, 'apply', true);

            cuspayRec.commitLine(slCredit);
        }

        let cuspayId = cuspayRec.save({ enableSourcing: false, ignoreMandatoryFields: true });log.error('createCustomerpayment', cuspayId)

        return cuspayId;
    }

    _export.inv2jrl = function (invId) {
        let jrlId = _export.createJournal(invId);
        if (jrlId) {
            _export.createCustomerpayment(invId);
        }
    }

    return _export;
});
