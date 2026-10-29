/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/url', '../lib/scv_lib_cs.js', '../lib/scv_lib_cs_xls.js'],
    
    function (ccr, url, libCs, libCsXLS) {
        
        const Sublist = {
            RESULT: 'custpage_sl_result'
        }
        
        const Field = {
            SELECT: 'custpage_select'
        }
        
        const refresh = () => {
            window.location.reload();
        }
        
        const searchInitEinvoice = () => {
            window.onbeforeunload = null;
            let currentRecord = ccr.get();
            let urlDC = url.resolveScript({
                scriptId: 'customscript_scv_sl_einvoice_issue_batch',
                deploymentId: 'customdeploy_scv_sl_einvoice_issue_batch',
                returnExternalUrl: false,
                params: getParams(currentRecord)
            });
            window.location.replace(urlDC);
        }
        
        const mark50 = () => {
            markLine(50);
        }
        
        const mark100 = () => {
            markLine(100);
        }
        
        const markLine = (numLine) => {
            let currentRecord = ccr.get();
            let sl = Sublist.RESULT;
            let lc = currentRecord.getLineCount(sl);
            if (lc > numLine) {
                lc = numLine;
            }
            for (let i = 0; i < lc; i++) {
                currentRecord.selectLine({sublistId: sl, line: i});
                currentRecord.setCurrentSublistValue({sublistId: sl, fieldId: Field.SELECT, value: true});
                currentRecord.commitLine(sl);
            }
        }
        
        const getParams = (currentRecord) => {
            return {
                custpage_type: currentRecord.getValue('custpage_type'),
                custpage_subsidiary: currentRecord.getValue('custpage_subsidiary'),
                custpage_location: currentRecord.getValue('custpage_location'),
                custpage_customer: currentRecord.getValue('custpage_customer'),
                custpage_date_dauky: currentRecord.getText('custpage_date_dauky'),
                custpage_date_cuoiky: currentRecord.getText('custpage_date_cuoiky'),
                custpage_createdby: currentRecord.getValue('custpage_createdby'),
                isSearch: 'T'
            };
        }
        
        const recalTotal = () => {
            let currentRecord = ccr.get();
            let sublistId = Sublist.RESULT;
            let objTotal = getTotalAmountPayment(currentRecord, sublistId);
            currentRecord.setValue('custpage_totalamount', objTotal.totalamount);
            currentRecord.setValue('custpage_totaltax', objTotal.totaltax);
            currentRecord.setValue('custpage_totalgross', objTotal.totalgross);
        }
        
        const getTotalAmountPayment = (currentRecord, sublistId) => {
            let lc = currentRecord.getLineCount({sublistId: sublistId});
            let totalgross = 0, totalamount = 0, totaltax = 0;
            for (let i = 0; i < lc; i++) {
                let vCheck = currentRecord.getSublistValue({sublistId: sublistId, fieldId: Field.SELECT, line: i});
                if (vCheck === true) {
                    let amt_check = currentRecord.getSublistValue({sublistId: sublistId, fieldId: 'amount', line: i});
                    let taxamt_check = currentRecord.getSublistValue({
                        sublistId: sublistId,
                        fieldId: 'taxamount',
                        line: i
                    });
                    let grossamt_check = currentRecord.getSublistValue({
                        sublistId: sublistId,
                        fieldId: 'grossamount',
                        line: i
                    });
                    totalamount += Number(amt_check);
                    totaltax += Number(taxamt_check);
                    totalgross += Number(grossamt_check);
                }
            }
            
            return {totalamount: totalamount, totaltax: totaltax, totalgross: totalgross};
        }
        
        const URL_RQ = '/app/site/hosting/scriptlet.nl?script=customscript_scv_sl_einvoice_issue_batch&deploy=customdeploy_scv_sl_einvoice_issue_batch';
        const exportResult = () => {
            let currentRecord = ccr.get();
            let listDataResult = getListDataResult(currentRecord);
            let objDataConfig = JSON.parse(nlapiRequestURL(URL_RQ, {
                action: 'getUrlTemplate', custpage_subsidiary: currentRecord.getValue('custpage_subsidiary')
            }).getBody());
            try {
                exportExcel(getParams(currentRecord), currentRecord, objDataConfig, listDataResult);
            } catch (error) {
                console.log("error", error)
                libCs.showLoadingDialog(false);
            }
        }
        
        const exportExcel = async (params, currentRecord, objDataConfig, listDataResult) => {
            const reportName = 'Phát hành hóa đơn hàng loạt';
            const objDataHeader = objDataConfig.objDataHeader;
            let workbook = await libCsXLS.loadWorkbookFromUrl(objDataConfig.urlTemplate);
            let currentSheetFirst = workbook.worksheets[0];
            
            initDataHeaderSheet(currentSheetFirst, objDataHeader);
            updateValueParam(currentSheetFirst, params);
            updateDataToSheet(currentSheetFirst, listDataResult);
            
            // Save File
            await libCsXLS.saveWorkbook(workbook, reportName + ".xlsx");
        }
        
        const updateDataToSheet = (currentSheet, listData) => {
            let lengData = listData.length;
            
            let columnNamesFull = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
            let fieldIdFull = ['docno', 'trandate', 'customercode', 'customer', 'taxid', 'address', 'amount', 'taxamount', 'grossamount', 'einvoiceform_display'];
            
            let rowMau = 10;
            
            let objStype = {};
            for (let column of columnNamesFull) {
                objStype[column + rowMau] = currentSheet.getCell(column + rowMau).style;
            }
            
            let rowStart = 10;
            currentSheet.spliceRows(rowStart, 1);
            let totalAmount = 0, toalTaxAmount = 0, totalGrossAmount = 0;
            for (let i = 0; i < lengData; i++) {
                let objDataLine = listData[i];
                let rowInsert = rowStart + i;
                
                currentSheet.insertRow(rowInsert);
                for (let column of columnNamesFull) {
                    currentSheet.getCell(column + rowInsert).style = objStype[column + rowMau];
                }
                totalAmount += Number(objDataLine.amount || 0);
                toalTaxAmount += Number(objDataLine.taxamount || 0);
                totalGrossAmount += Number(objDataLine.grossamount || 0);
                setCellValue(currentSheet, columnNamesFull, fieldIdFull, rowInsert, objDataLine);
            }
            
            let rowNumberTotal = (rowStart + lengData);
            let objDataTotal = {
                'amount': totalAmount,
                'taxamount': toalTaxAmount,
                'grossamount': totalGrossAmount
            };
            setCellValue(currentSheet, ['G', 'H', 'I'], ['amount', 'taxamount', 'grossamount'], rowNumberTotal, objDataTotal);
            currentSheet.mergeCells(rowNumberTotal, 1, rowNumberTotal, 6);
        }
        
        const setCellValue = (currentSheet, columnNamesFull, fieldIdFull, rowNumber, objDataLine) => {
            for (let j in columnNamesFull) {
                let cellInfo = currentSheet.getCell(columnNamesFull[j] + rowNumber);
                let tempValue = objDataLine[fieldIdFull[j]] || null;
                tempValue = (['amount', 'taxamount', 'grossamount'].includes(fieldIdFull[j]) && tempValue ? Number(tempValue) : tempValue) || null;
                cellInfo.value = tempValue;
            }
        }
        
        const initDataHeaderSheet = (currentSheet, objDataHeader) => {
            libCsXLS.updMultiValueToCell(currentSheet, [
                {addressCell: 'A1', keys: '{pSubsName}', values: objDataHeader.strLegalNameSub},
                {addressCell: 'A2', keys: '{pSubAddress}', values: objDataHeader.strMainAddrSub}
            ]);
        }
        
        const updateValueParam = (currentSheet, params) => {
            libCsXLS.updMultiValueToCell(currentSheet, [
                {addressCell: 'A6', keys: '{pFromdate}', values: params.custpage_date_dauky},
                {addressCell: 'A6', keys: '{pTodate}', values: params.custpage_date_cuoiky}
            ]);
        }
        
        const getListDataResult = (currentRecord) => {
            let listDataResult = [];
            let sublistId = Sublist.RESULT;
            let lc = currentRecord.getLineCount({sublistId: sublistId});
            let fieldIdFull = ['docno', 'trandate', 'customercode', 'customer', 'taxid', 'address', 'amount', 'taxamount', 'grossamount', 'einvoiceform_display'];
            for (let i = 0; i < lc; i++) {
                let objDataLine = {};
                fieldIdFull.forEach((fieldId) => {
                    if (fieldId === 'trandate') {
                        objDataLine[fieldId] = currentRecord.getSublistText({
                            sublistId: sublistId,
                            fieldId: fieldId,
                            line: i
                        });
                    } else {
                        objDataLine[fieldId] = currentRecord.getSublistValue({
                            sublistId: sublistId,
                            fieldId: fieldId,
                            line: i
                        });
                    }
                });
                listDataResult.push(objDataLine);
            }
            return listDataResult;
        }
        
        function fieldChanged(scriptContext) {
            let fieldId = scriptContext.fieldId;
            let currentRecord = scriptContext.currentRecord;
            if (fieldId === 'custpage_subsidiary') {
                let subsidiary = currentRecord.getValue('custpage_subsidiary');
                
                let c = ['name', 'namenohierarchy'];
                let f = [];
                if (subsidiary) {
                    f = [['subsidiary', 'anyOf', subsidiary], 'and', ['isinactive', 'is', false]];
                }
                
                let locationfield = currentRecord.getField('custpage_location');
                if (locationfield != null) {
                    let locationvalue = currentRecord.getValue('custpage_location');
                    locationfield.removeSelectOption({value: null});
                    libCs.insertSelection([locationfield], 'location', c, f, true, locationvalue);
                }
            }
        }
        
        function postSourcing(scriptContext) {
        
        }
        
        function saveRecord(scriptContext) {
            let currentRecord = scriptContext.currentRecord;
            let isValid = true;
            let sl = Sublist.RESULT;
            let lc = currentRecord.getLineCount(sl);
            let vCheck, count = 0;
            for (let i = 0; i < lc; i++) {
                vCheck = currentRecord.getSublistValue({sublistId: sl, fieldId: Field.SELECT, line: i});
                if (vCheck === true) {
                    count++;
                }
            }
            if (count > 100) {
                alert('Bạn không được chọn quá 100 giao dịch!');
                isValid = false;
            } else if (count <= 0) {
                alert('Bạn phải chọn ít nhất 1 giao dịch!')
                isValid = false;
            } else {
                return confirm('Bạn có muốn phát hành hóa đơn không?')
            }
            return isValid;
        }
        
        return {
            refresh: refresh,
            searchInitEinvoice: searchInitEinvoice,
            mark50: mark50,
            mark100: mark100,
            recalTotal: recalTotal,
            exportResult: exportResult,
            fieldChanged: fieldChanged,
            postSourcing: postSourcing,
            saveRecord: saveRecord
        };
        
    });
