/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
    'N/render', 'N/search', 'N/record', 'N/query', 'N/config', '../lib/scv_lib_pdf.js', 
    '../lib/scv_lib_function.js', '../lib/scv_lib_amount_in_word.js',
    '../olib/alasql/alasql.min@1.7.3.js',

    '../cons/scv_cons_subsidiary.js',
    '../cons/scv_cons_location.js',
    '../cons/scv_cons_currency.js',

    '../cons/scv_cons_search_po_print.js',
    '../cons/scv_cons_search_vra_print.js',
    '../cons/scv_cons_search_vas_itf_itr_cost.js'
],(
    render, search, record, query, config, libPdf, 
    lbf, libAmt,
    alasql,

    constSubsidiary,
    constLocation,
    constCurrency,

    constSearchPOPrint, 
    searchVRAPrint,
    constSearchItfItrCost
) => {
    /**
     * Defines the Suitelet script trigger point.
     * @param {Object} scriptContext
     * @param {ServerRequest} scriptContext.request - Incoming request
     * @param {ServerResponse} scriptContext.response - Suitelet response
     * @since 2015.2
     */
    const renderRecordToPdfWithTemplate = (id, type, printfile) => {
        if(!printfile) throw "Chưa có setup file xml!";
        
        let renderer = libPdf.renderTemplateWithXml(printfile);
        let rec = addDefaultRecordRender(renderer, type, id);
        let objDefSub = addDefaultSubsidiary(rec, renderer);
        switch (printfile) {
            case "scv_po_print":
                printPoPrint(rec, renderer, objDefSub.record);
                break;
            case "scv_vra_print":
                printVRAPrint(rec, renderer);
                break;
            case "scv_phieu_nhap_kho":
                printVasPhieuNhapKho(rec, renderer);
                break;
        }
        
        let pdfFile = renderer.renderAsPdf();
        return pdfFile;
    }

    const getDataLocationById = (id, cols, isFormat) => {
        cols = cols || ['id'];
        let sql = `SELECT ${cols.join(",")}
            FROM location
            WHERE id = ${id}`;
        let resultSearch = query.runSuiteQL({
            query: sql
        });

        resultSearch = resultSearch.asMappedResults()[0] || {};
        return isFormat ? libPdf.formatDataXMLWithObject(resultSearch) : resultSearch;
    }

    const printVRAPrint = (rec, renderer) => {
        let objFilters = search.createFilter({ name: 'internalid', operator: 'anyof', values: rec.id });
        let arrVRA = searchVRAPrint.getDataSource(objFilters);

        let arrResult = arrVRA.map(e => {
            let {rate, quantity, amount, ...rest} =  e;
            
            let obj = {
                ...rest,
                quantity: libPdf.formatNumberV2(e.quantity)
            };
            return obj;
        });

        renderer.addCustomDataSource({
            format: render.DataSource.OBJECT,
            alias: "jsonData",
            data: {
                objBody: arrVRA[0] || {},
                arrVRA: arrResult
            }
        });
    }

    const printPoPrint = (rec, renderer, subsidiaryRec) => {
        let arrSSPoPrint = getDataSSPoPrint(rec.id);
        let objBody = {};
        if(arrSSPoPrint.length > 0){
            arrSSPoPrint.forEach((obj, i) => {
                obj = libPdf.formatDataXMLWithObject(obj);
                obj.stt = i + 1;
                obj.rate = libPdf.formatNumberV2(obj.rate);
                obj.qty = libPdf.formatNumberV2(obj.qty);
                obj.amt = libPdf.formatNumberV2(obj.amt);
                obj.tax_rate = obj.tax_rate ? obj.tax_rate.split('%')[0] * 1 + '%' : '';
            })
           
            objBody = arrSSPoPrint[0];
            objBody.total = libPdf.formatNumberV2(objBody.total);
            objBody.tax = libPdf.formatNumberV2(objBody.tax);
            objBody.grandTotal = libPdf.formatNumberV2(objBody.grandTotal);
        };

        renderer.addCustomDataSource({
            format: render.DataSource.OBJECT,
            alias: "jsonData",
            data: {
                logo: libPdf.createImageBySubsidiaryV2(subsidiaryRec, 150),
                objBody: objBody,
                arrSSPoPrint
            }
        });
    }

    const getDataSSPoPrint = (poId) => {
        let result = [];
        let myFilters = [];
        myFilters.push(search.createFilter({
            name: 'internalid',
            operator: 'anyof',
            values: poId
        }));

        result = constSearchPOPrint.getDataSource(myFilters);
        return result;
    }

    const printVasPhieuNhapKho = (_curRec, renderer) => {
        let arrResult = [], totalAmount = 0, totalQuantity = 0,arrCreated = [];
        let exchangerate = _curRec.getValue("exchangerate");
        let entityid = _curRec.getValue("entity");
        if(!!entityid){
            let entity = record.load({
                type: lbf.getEntityType(entityid),
                id: entityid
            });
            renderer.addRecord('entityRec', entity);
        }
        let createdid = _curRec.getValue("createdfrom");
        if(!!createdid){
            let createdRec = record.load({
                type: lbf.getTranRecordType(createdid),
                id: createdid
            });
            let createdSublistId = "item";
            if(createdRec.type == "inventoryadjustment"){
                createdSublistId = "inventory";
            }
            let lineCreated = createdRec.getLineCount(createdSublistId);
            for(let line=0; line < lineCreated; line++){
                arrCreated.push({
                    itemid: createdRec.getSublistValue(createdSublistId, "item", line),
                    rate: createdRec.getSublistValue(createdSublistId, "rate", line),
                });
            }
        }
        let arIRCost = getDataSSITFCost(_curRec.id);
        //to-do
        let sublistId = "item";
        if(_curRec.type == "inventoryadjustment"){
            sublistId = "inventory";
        }
        let lineCount = _curRec.getLineCount(sublistId);
        for(let i=0; i < lineCount; i++){
            let itemid = _curRec.getSublistValue(sublistId, "item", i);
            let upccode = "", account = "", salesdes = "";
            let description = _curRec.getSublistValue(sublistId,'description',i);
            let item_code = _curRec.getSublistValue(sublistId, 'custcol_scv_tc_item_code', i);
            let units = _curRec.getSublistValue(sublistId,'unitsdisplay',i);
            let quantity = _curRec.getSublistValue(sublistId,'quantity',i);
            let ori_line_num = _curRec.getSublistValue(sublistId, 'custcol_scv_origin_line_num', i);
            let itemname = _curRec.getSublistText(sublistId, 'itemname', i);
            
            let inventory_number = "";
            if(constLocation.isLotNumberInventory()){
                
                let inventorydetailid = _curRec.getSublistValue(sublistId, 'inventorydetail', i);
                if(inventorydetailid){
                    let inventorydetail = _curRec.getSublistSubrecord(sublistId, 'inventorydetail', i);
                    let lcInvDetail = inventorydetail.getLineCount('inventoryassignment');
                    for (let j = 0; j < lcInvDetail; j++) {
                        inventory_number = inventorydetail.getSublistValue('inventoryassignment', "receiptinventorynumber", j) || "";
                    }
                }
            }

            let rate = 0, amount = 0;
            rate = rate * exchangerate;
            //TO-DO: PQH-MegSB: không sử dụng Original Line Numer
            //TO-DO: PQH-Mla: không sử dụng Original Line Numer
            let objIRCost_find = arIRCost.find(e => e.item_id == itemid/*  && e.ori_line_num == ori_line_num */);
            if (!!objIRCost_find ) {
                rate = Math.abs( libPdf.roundNumber(objIRCost_find.rate, 2) );
                amount = objIRCost_find.amount;
                account = objIRCost_find.account_number.substring(0, 4);;
            }
            totalQuantity += quantity;

            amount = Number(quantity * rate);
            totalAmount += amount;
            arrResult.push({
                stt: i + 1,
                account: account,
                salesdes: salesdes,
                description: description,
                item_code: item_code,
                units: units,
                quantity: libPdf.formatNumber(quantity),
                upccode: upccode,
                inventory_number:inventory_number,
                rate: libPdf.formatNumber(rate, 0),
                amount: libPdf.formatNumber(amount, 0),
                itemname: itemname,
            });

        }

        let account_debit = alasql(`SELECT DISTINCT account FROM ? `, [arrResult]).map(e => e.account).join(", ");
        renderer.addCustomDataSource({
            format: render.DataSource.OBJECT,
            alias: "jsonData",
            data: {
                bodyData: arrResult,
                account_debit: account_debit,
                amountInWord: libAmt.DocTienBangChu(totalAmount, constCurrency.RECORDS.VND.NAME),
                totalAmount: libPdf.formatNumber(totalAmount, 0),
                totalQuantity: libPdf.formatNumber(totalQuantity, 0),
            }
        });
    }

    const getDataSSITFCost = (_internalId) => {
        let myFilter = [];
        myFilter.push(search.createFilter({
            name: 'internalid',
            operator: search.Operator.ANYOF,
            values: _internalId
        }));

        let arrResult = constSearchItfItrCost.getDataSource(myFilter);
        return arrResult;
    }

    const addDefaultSubsidiary = (rec, renderer) => {
        let subsidiary_id = rec.getValue("subsidiary");
        if(!subsidiary_id) return {};

        let subRec = record.load({ type: "subsidiary", id: subsidiary_id });
        renderer.addRecord('subsidiary', subRec);

        let addressRec = subRec.getSubrecord({
            fieldId: 'mainaddress'
        });
        let objAddress = {
            addr1: addressRec.getValue("addr1"),
            addressee: addressRec.getValue("addressee"),
            country: addressRec.getValue("country"),
            addrphone: addressRec.getValue("addrphone"),
        };
        
        return {
            record: subRec,
            objAddress: objAddress
        };
    }

    const addDefaultRecordRender = (renderer, type, id) => {
        let rec = record.load({
            type: type,
            id: id,
            isDynamic: false
        });
        renderer.addRecord('record', rec);
        return rec;
    }

    const onRequest = (scriptContext) => {
        let request = scriptContext.request;
        let response = scriptContext.response;
        let params = request.parameters;
        let pdfFile = renderRecordToPdfWithTemplate(params.id, params.type, params.printfile);
        response.writeFile(pdfFile, true);
    }

    return {onRequest}
});
