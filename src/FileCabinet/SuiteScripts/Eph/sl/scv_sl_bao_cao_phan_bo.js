
/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  18 Jun 2025         Huy Pham			    Init, create file, Báo cáo phân bổ chi phí trả trước và TSCĐ, from ms.Thắm (https://app.clickup.com/t/86cza5kjw)
 */
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
    'N/record', 'N/search', 'N/ui/serverWidget', 'N/runtime',
    '../lib/scv_lib_function.js',
    'N/format', 'N/file',
    '../olib/moment.js'
],
    (
        record, search, serverWidget, runtime,
        lbf, format, file,
        moment
    ) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const SAVED_SEARCH = {
            CPTT_BEGIN_2421: "customsearch_scv_depr_2421_begin",
            CPTT_LUY_KE_2421: "customsearch_scv_depr_2421_lk",
            CPTT_MONTH_2421: "customsearch_scv_depr_2421_month",
            CPTT_BEGIN_2423: "customsearch_scv_depr_2423_begin",
            CPTT_LUY_KE_2423: "customsearch_scv_depr_2423_lk",
            CPTT_MONTH_2423: "customsearch_scv_depr_2423_month",
            DEPR_FAM_BEGIN: "customsearch_scv_depr_fam_begin",
            DEPR_FAM_LUY_KE: "customsearch_scv_depr_fam_lk",
            DEPR_FAM_MONTH: "customsearch_scv_depr_fam_month",
        };
        const COL_CPTT_BEGIN_2421 = {
            SCHEDULE: 0,
            MEMO: 1,
            DOC_NO: 2,
            QUANTITY: 3,
            NGUYEN_GIA: 4,
            NGAY_MUA: 5,
            NGAY_SU_DUNG: 6,
            THOI_HAN: 7,
            SOURCE_ACC: 8,
            EXPENSE_ACC: 9,
            SUBSIDIARY: 10,
            CATEGORY: 11,
            DEPARTMENT: 12
        };
        const COL_CPTT_LUYKE_2421 = {
            SCHEDULE: 0,
            AMOUNT: 1,
            SUBSIDIARY: 2
        };
        const COL_CPTT_MONTH_2421 = {
            SCHEDULE: 0,
            EXPENSE_AMOUNT: 1,
            AMOUNT: 2,
            MONTH: 3,
            SUBSIDIARY: 4
        };
        const COL_CPTT_BEGIN_2423 = {
            ASSET: 0,
            MEMO: 1,
            DOC_NO: 2,
            QUANTITY: 3,
            AMOUNT: 4,
            NGAY_MUA: 5,
            NGAY_SU_DUNG: 6,
            THOI_HAN: 7,
            SOURCE_ACC: 8,
            DEST_ACC: 9,
            NGUYEN_GIA: 10,
            CATEGORY: 11,
            DEPARTMENT: 12
        };
        const COL_CPTT_LUYKE_2423 = {
            ASSET: 0,
            AMOUNT: 1,
            SUBSIDIARY: 2
        };
        const COL_CPTT_MONTH_2423 = {
            ASSET: 0,
            MONTH: 1,
            AMOUNT: 2,
            SUBSIDIARY: 3
        };
        const COL_FAM_BEGIN = {
            ASSET: 0,
            MEMO: 1,
            DOC_NO: 2,
            QUANTITY: 3,
            AMOUNT: 4,
            NGAY_MUA: 5,
            NGAY_SU_DUNG: 6,
            THOI_HAN: 7,
            SOURCE_ACC: 8,
            DEST_ACC: 9,
            NGUYEN_GIA: 10,
            CATEGORY: 11,
            DEPARTMENT: 12
        };
        const COL_FAM_LUYKE = {
            ASSET: 0,
            AMOUNT: 1,
            SUBSIDIARY: 2
        };
        const COL_FAM_MONTH = {
            ASSET: 0,
            MONTH: 1,
            AMOUNT: 2,
            SUBSIDIARY: 3
        };
        const onRequest = (scriptContext) => {
            let request = scriptContext.request;
            let params = request.parameters;
            if(params.isexport == "T"){
                onExport(scriptContext);
                return;
            }
            let MainForm = onCreateFormUI(params);
            if(params.isrun == "T"){
                let searchResult = [];
                switch (params.custpage_rpt_type) {
                    case "CPTT":
                        searchResult = runFilterSS(params);
                        onRenderData(MainForm.sublist, searchResult, params);
                        break;
                    case "TSCD":
                        searchResult = runFilterTSCD(params);
                        onRenderData(MainForm.sublist, searchResult, params);
                        break;
                    default:
                }
            }
            scriptContext.response.writePage(MainForm.form);
        }
        const onExport = (context) => {
            let request = context.request;
            let response = context.response;
            let params = request.parameters;
            /*===========================*/
            let pLegalname = "", pMainAddress = "", pMaSoThue = "", pTitleReport = "";
            /*===========================*/
            let arrPeriod = getDataPeriod(params.custpage_fromdt, params.custpage_todt);
            let searchResult = [];
            if(params.custpage_rpt_type == "CPTT"){
                searchResult = runFilterSS(params);
                pTitleReport = "BẢNG PHÂN BỔ -  CHI PHÍ TRẢ TRƯỚC";
            } else if(params.custpage_rpt_type == "TSCD"){
                searchResult = runFilterTSCD(params);
                pTitleReport = "BẢNG KHẤU HAO -  TÀI SẢN CỐ ĐỊNH";
            }
            let subsidiaryid = params.custpage_subsidiary;
            if(subsidiaryid){
                let subRec = record.load({
                    type: record.Type.SUBSIDIARY,
                    id: subsidiaryid
                });
                pLegalname = subRec.getValue("legalname");
                pMainAddress = subRec.getValue("mainaddress_text");
                pMaSoThue = subRec.getValue("federalidnumber");
            }
            let fromdt = format.parse({value: params.custpage_fromdt, type: "date"});
            let pFromdt_KT = fromdt;
            pFromdt_KT.setDate(pFromdt_KT.getDate() - 1);
            pFromdt_KT = format.format({value: pFromdt_KT, type: "date"});
            let pHeaderTable = getContentRowHeader(arrPeriod, params.custpage_fromdt, params.custpage_todt, pFromdt_KT);
            let pRowContent = getDataRowContent(searchResult, arrPeriod);
            let templatePath = '../xml/scv_bang_phan_bo.xml';
            let namefile = pTitleReport + '.xls';

            let fileObject = file.load({
                id: templatePath
            });
            let content = fileObject.getContents();
            content = content.replace(/{pLegalname}/gi, pLegalname);
            content = content.replace(/{pMainAddress}/gi, pMainAddress);
            content = content.replace(/{pMaSoThue}/gi, pMaSoThue);
            content = content.replace(/{pFromDate}/gi, params.custpage_fromdt);
            content = content.replace(/{pToDate}/gi, params.custpage_todt);
            content = content.replace(/{pExpandedColumnCount}/gi, 50 + arrPeriod.length);
            content = content.replace(/{pHeaderTable}/gi, pHeaderTable);
            content = content.replace(/{pTitleReport}/gi, pTitleReport);
            content = content.replace(/{pRowContent}/gi, pRowContent);
            content = content.replace(/{pExpandedRowCount}/gi, 50 + searchResult.length);
            let f = file.create({
                name: namefile,
                fileType: file.Type.XMLDOC,
                contents: content,
                encoding: file.Encoding.UTF8,
            });
            response.writeFile(f, false);
        }
        const getContentRowHeader = (arrPeriod, fromdt, todt, pFromdt_KT) => {
            let pheader = "";
            pheader += ' <Row ss:AutoFitHeight="0">\n' +
                '                <Cell ss:MergeDown="1" ss:StyleID="m340014636"><Data ss:Type="String">STT</Data></Cell>\n' +
                '            <Cell ss:MergeDown="1" ss:StyleID="m340014656"><Data ss:Type="String">Mã </Data></Cell>\n' +
                '            <Cell ss:MergeDown="1" ss:StyleID="m340014676"><Data ss:Type="String">Nội dung</Data></Cell>\n' +
                '            <Cell ss:MergeDown="1" ss:StyleID="m340014696"><Data ss:Type="String">Số hóa đơn</Data></Cell>\n' +
                '            <Cell ss:MergeDown="1" ss:StyleID="m340014716"><Data ss:Type="String">Số Lượng</Data></Cell>\n' +
                '            <Cell ss:MergeDown="1" ss:StyleID="m342955640"><Data ss:Type="String">Phòng ban</Data></Cell>\n' +
                '            <Cell ss:MergeDown="1" ss:StyleID="m340014736"><Data ss:Type="String">Nguyên gía&#10;TS</Data></Cell>\n' +
                '            <Cell ss:MergeDown="1" ss:StyleID="m340014756"><Data ss:Type="String">Giá trị hiện tại</Data></Cell>\n' +
                '            <Cell ss:MergeDown="1" ss:StyleID="m340014776"><Data ss:Type="String">Ngày Mua</Data></Cell>\n' +
                '            <Cell ss:MergeDown="1" ss:StyleID="m340014796"><Data ss:Type="String">Ngày đựa &#10;vào sử dụng </Data></Cell>\n' +
                '            <Cell ss:MergeAcross="1" ss:StyleID="m340013368"><Data ss:Type="String">Giá trị phân bổ</Data></Cell>\n' +
                '            <Cell ss:MergeAcross="1" ss:StyleID="m340013388"><Data ss:Type="String">TK NỢ/ CÓ</Data></Cell>\n' +
                '            <Cell ss:MergeAcross="'+ (arrPeriod.length - 1) +'" ss:StyleID="m340013408"><Data ss:Type="String">Tháng phân bổ</Data></Cell>\n' +
                '            <Cell ss:MergeAcross="2" ss:StyleID="m340013428"><Data ss:Type="String">Giá trị lũy kế</Data></Cell>\n' +
                '            <Cell ss:MergeDown="1" ss:StyleID="m340013448"><Data ss:Type="String">Giá trị&#10; còn lại kỳ này</Data></Cell>\n' +
                '            <Cell ss:MergeDown="1" ss:StyleID="m340013468"><Data ss:Type="String">Giá trị&#10; còn lại '+ pFromdt_KT +'</Data></Cell>\n' +
                '            </Row>\n';
            pheader += ' <Row ss:AutoFitHeight="0" ss:Height="42">\n' +
                '            <Cell ss:Index="11" ss:StyleID="s84"><Data ss:Type="String">Thời gian&#10;sử dụng&#10;</Data></Cell>\n' +
                '            <Cell ss:StyleID="s84"><Data ss:Type="String">Mức phân bổ tháng</Data></Cell>\n' +
                '            <Cell ss:StyleID="s84"><Data ss:Type="String">TK NỢ</Data></Cell>\n' +
                '            <Cell ss:StyleID="s84"><Data ss:Type="String">TK CÓ</Data></Cell>\n';
            for(let i = 0; i < arrPeriod.length; i++){
                pheader += '            <Cell ss:StyleID="s101"><Data ss:Type="String">Tháng '+ arrPeriod[i].month +'</Data></Cell>\n';
            }
            pheader += '            <Cell ss:StyleID="s103"><Data ss:Type="String">Lũy kế kỳ báo cáo</Data></Cell>\n' +
                '            <Cell ss:StyleID="s84"><Data ss:Type="String">Lũy kế đến '+ pFromdt_KT +'</Data></Cell>\n' +
                '            <Cell ss:StyleID="s84"><Data ss:Type="String">Tổng lũy kế</Data></Cell>\n' +
                '        </Row>\n';
            return pheader;
        }
        const getDataRowContent = (searchResult, arrPeriod) => {
            let pcontent = '';
            for(let i = 0; i < searchResult.length; i++){
                if(searchResult[i].level == "1"){
                    pcontent += '   <Row ss:AutoFitHeight="0">\n' +
                        '               <Cell ss:StyleID="s104"/>\n' +
                        '               <Cell ss:StyleID="s105"/>\n' +
                        '               <Cell ss:StyleID="s106"><Data ss:Type="String">'+ searchResult[i].tranid +'</Data></Cell>\n' +
                        '               <Cell ss:StyleID="s107"/>\n' +
                        '               <Cell ss:StyleID="s108"/>\n' +
                        '               <Cell ss:StyleID="s108"/>\n' +
                        '               <Cell ss:StyleID="s109"><Data ss:Type="Number">'+ searchResult[i].nguyen_gia +'</Data></Cell>\n' +
                        '               <Cell ss:StyleID="s109"><Data ss:Type="Number">'+ searchResult[i].current_amt +'</Data></Cell>\n' +
                        '               <Cell ss:StyleID="s110"/>\n' +
                        '               <Cell ss:StyleID="s110"/>\n' +
                        '               <Cell ss:StyleID="s111"/>\n' +
                        '               <Cell ss:StyleID="s111"/>\n' +
                        '               <Cell ss:StyleID="s111"/>\n' +
                        '               <Cell ss:StyleID="s111"/>\n';
                    for(let j = 0; j < arrPeriod.length; j++){
                        let monthyear = arrPeriod[j].month + arrPeriod[j].year;
                        pcontent += '               <Cell ss:StyleID="s109"><Data ss:Type="Number">'+ searchResult[i]["amount_" + monthyear] +'</Data></Cell>\n';
                    }
                    pcontent += '               <Cell ss:StyleID="s109"><Data ss:Type="Number">'+ searchResult[i].total_month +'</Data></Cell>\n' +
                        '               <Cell ss:StyleID="s109"><Data ss:Type="Number">'+ searchResult[i].luyke +'</Data></Cell>\n' +
                        '               <Cell ss:StyleID="s109"><Data ss:Type="Number">'+ searchResult[i].tong_luyke +'</Data></Cell>\n' +
                        '               <Cell ss:StyleID="s109"><Data ss:Type="Number">'+ searchResult[i].period_amt +'</Data></Cell>\n' +
                        '               <Cell ss:StyleID="s109"><Data ss:Type="Number">'+ searchResult[i].period_luyke +'</Data></Cell>\n' +
                        '           </Row>\n';
                } else if(searchResult[i].level == "total"){
                    pcontent += '<Row ss:AutoFitHeight="0">\n' +
                        '             <Cell ss:StyleID="s112"><Data ss:Type="String"></Data></Cell>\n' +
                        '             <Cell ss:StyleID="s125"/>\n' +
                        '             <Cell ss:StyleID="s124"><Data ss:Type="String">Cộng</Data></Cell>\n' +
                        '             <Cell ss:StyleID="s126"/>\n' +
                        '             <Cell ss:StyleID="s127"/>\n' +
                        '             <Cell ss:StyleID="s127"/>\n' +
                        '             <Cell ss:StyleID="s128"><Data ss:Type="Number">'+ searchResult[i].nguyen_gia +'</Data></Cell>\n' +
                        '             <Cell ss:StyleID="s128"><Data ss:Type="Number">'+ searchResult[i].current_amt +'</Data></Cell>\n' +
                        '             <Cell ss:StyleID="s129"/>\n' +
                        '             <Cell ss:StyleID="s129"/>\n' +
                        '             <Cell ss:StyleID="s130"/>\n' +
                        '             <Cell ss:StyleID="s128"><Data ss:Type="Number">'+ searchResult[i].phanbo_month +'</Data></Cell>\n' +
                        '             <Cell ss:StyleID="s130"/>\n' +
                        '             <Cell ss:StyleID="s130"/>\n';
                    for(let j = 0; j < arrPeriod.length; j++){
                        let monthyear = arrPeriod[j].month + arrPeriod[j].year;
                        pcontent += '             <Cell ss:StyleID="s128"><Data ss:Type="Number">'+ searchResult[i]["amount_" + monthyear] +'</Data></Cell>\n';
                    }
                    pcontent += '             <Cell ss:StyleID="s128"><Data ss:Type="Number">'+ searchResult[i].total_month +'</Data></Cell>\n' +
                        '             <Cell ss:StyleID="s128"><Data ss:Type="Number">'+ searchResult[i].luyke +'</Data></Cell>\n' +
                        '             <Cell ss:StyleID="s128"><Data ss:Type="Number">'+ searchResult[i].tong_luyke +'</Data></Cell>\n' +
                        '             <Cell ss:StyleID="s128"><Data ss:Type="Number">'+ searchResult[i].period_amt +'</Data></Cell>\n' +
                        '             <Cell ss:StyleID="s128"><Data ss:Type="Number">'+ searchResult[i].period_luyke +'</Data></Cell>\n' +
                        '        </Row>\n';
                } else {
                    pcontent += ' <Row ss:AutoFitHeight="0" ss:Height="42.75">\n' +
                        '              <Cell ss:StyleID="s112"><Data ss:Type="Number">'+ searchResult[i].stt +'</Data></Cell>\n' +
                        '              <Cell ss:StyleID="s114"><Data ss:Type="String">'+ searchResult[i].tranid +'</Data></Cell>\n' +
                        '              <Cell ss:StyleID="s114"><Data ss:Type="String">'+ searchResult[i].memo +'</Data></Cell>\n' +
                        '              <Cell ss:StyleID="s115"><Data ss:Type="String">'+ searchResult[i].doc_no +'</Data></Cell>\n' +
                        '              <Cell ss:StyleID="s116"><Data ss:Type="Number">'+ searchResult[i].quantity +'</Data></Cell>\n' +
                        '              <Cell ss:StyleID="s116"><Data ss:Type="String">'+ searchResult[i].department +'</Data></Cell>\n' +
                        '              <Cell ss:StyleID="s118"><Data ss:Type="Number">'+ searchResult[i].nguyen_gia +'</Data></Cell>\n' +
                        '              <Cell ss:StyleID="s118"><Data ss:Type="Number">'+ searchResult[i].current_amt +'</Data></Cell>\n' +
                        '              <Cell ss:StyleID="s119"><Data ss:Type="String">'+ searchResult[i].ngay_mua +'</Data></Cell>\n' +
                        '              <Cell ss:StyleID="s119"><Data ss:Type="String">'+ searchResult[i].ngay_su_dung +'</Data></Cell>\n' +
                        '              <Cell ss:StyleID="s120"><Data ss:Type="String">'+ searchResult[i].thoi_han +'</Data></Cell>\n' +
                        '              <Cell ss:StyleID="s118"><Data ss:Type="Number">'+ searchResult[i].phanbo_month +'</Data></Cell>\n' +
                        '              <Cell ss:StyleID="s121"><Data ss:Type="String">'+ searchResult[i].debit_account +'</Data></Cell>\n' +
                        '              <Cell ss:StyleID="s121"><Data ss:Type="String">'+ searchResult[i].credit_account +'</Data></Cell>\n';
                    for(let j = 0; j < arrPeriod.length; j++){
                        let monthyear = arrPeriod[j].month + arrPeriod[j].year;
                        pcontent += '                        <Cell ss:StyleID="s118"><Data ss:Type="Number">'+ searchResult[i]["amount_" + monthyear] +'</Data></Cell>\n';
                    }
                    pcontent +='                        <Cell ss:StyleID="s123"><Data ss:Type="Number">'+ searchResult[i].total_month +'</Data></Cell>\n' +
                        '                        <Cell ss:StyleID="s123"><Data ss:Type="Number">'+ searchResult[i].luyke +'</Data></Cell>\n' +
                        '                        <Cell ss:StyleID="s123"><Data ss:Type="Number">'+ searchResult[i].tong_luyke +'</Data></Cell>\n' +
                        '                        <Cell ss:StyleID="s123"><Data ss:Type="Number">'+ searchResult[i].period_amt +'</Data></Cell>\n' +
                        '                        <Cell ss:StyleID="s123"><Data ss:Type="Number">'+ searchResult[i].period_luyke +'</Data></Cell>\n' +
                        '                        </Row>\n';
                }
            }
            return pcontent;
        }
        const onRenderData = (_sublist, _data, _params) => {
            let arrPeriod = getDataPeriod(_params.custpage_fromdt, _params.custpage_todt);
            for (let i = 0; i < _data.length; i++) {
                setRowDataSublist(_sublist, i, [
                    "custpage_col_1", "custpage_col_2", "custpage_col_3", "custpage_col_4",
                    "custpage_col_5", "custpage_col_6", "custpage_col_7", "custpage_col_8",
                    "custpage_col_9", "custpage_col_10", "custpage_col_11", "custpage_col_12",
                    "custpage_col_13", "custpage_col_14", "custpage_col_15", "custpage_col_16",
                    "custpage_col_17", "custpage_col_18", "custpage_col_19", "custpage_col_level"
                ], [
                    _data[i].stt || "", _data[i].tranid, _data[i].memo, _data[i].doc_no, _data[i].quantity,
                    _data[i].department, roundNumber(_data[i].nguyen_gia), roundNumber(_data[i].current_amt), _data[i].ngay_mua, _data[i].ngay_su_dung,
                    _data[i].thoi_han, roundNumber(_data[i].phanbo_month), _data[i].debit_account, _data[i].credit_account, roundNumber(_data[i].total_month),
                    roundNumber(_data[i].luyke), roundNumber(_data[i].tong_luyke), roundNumber(_data[i].period_amt), roundNumber(_data[i].period_luyke), _data[i].level
                ]);
                for(let j = 0; j < arrPeriod.length; j++){
                    let monthyear = arrPeriod[j].month + arrPeriod[j].year;
                    setRowDataSublist(_sublist, i, [
                        ("custpage_col_" + monthyear)
                    ], [
                        roundNumber(_data[i]["amount_" + monthyear])
                    ]);
                }
            }

        }
        const roundNumber = (num) => {
            if(!!num) {
                return num.toFixed(0);
            } else {
                return num;
            }
        }
        const onCreateFormUI = (_params) => {
            let mainForm = serverWidget.createForm({title: "Báo cáo Phân bổ CPTT, TSCĐ"});
            mainForm.clientScriptModulePath = '../cssl/scv_cs_sl_bao_cao_phan_bo.js';
            let mainGrp = addFieldGroup(mainForm, "fieldgrp_main","Main");
            mainForm.addButton({
                id: "custpage_btn_search",
                label: "Search",
                functionName: "onSearchResult()"
            });
            mainForm.addButton({
                id: "custpage_btn_export",
                label: "Export",
                functionName: "onExport()"
            });
            /**/
            let custpage_rpt_type = mainForm.addField({
                id: "custpage_rpt_type",
                type: serverWidget.FieldType.SELECT,
                label: "Report Type",
                container: mainGrp.id
            });
            custpage_rpt_type.addSelectOption({
                value: "CPTT",
                text: "Bảng phân bổ CP trả trước"
            });
            custpage_rpt_type.addSelectOption({
                value: "TSCD",
                text: "Bảng phân bổ TSCĐ"
            });
            let custpage_subsidiary = mainForm.addField({
                id: "custpage_subsidiary",
                type: serverWidget.FieldType.SELECT,
                label: "Subsidiary",
                container: mainGrp.id
            });
            custpage_subsidiary.isMandatory = true;
            let custpage_fromdt = mainForm.addField({
                id: 'custpage_fromdt',
                type: serverWidget.FieldType.DATE,
                label: 'From Date',
                container: mainGrp.id
            }).updateLayoutType({layoutType: serverWidget.FieldLayoutType.STARTROW});
            let custpage_todt = mainForm.addField({
                id: 'custpage_todt',
                type: serverWidget.FieldType.DATE,
                label: 'To Date',
                container: mainGrp.id
            }).updateLayoutType({layoutType: serverWidget.FieldLayoutType.ENDROW});
            let custpage_show_zero = mainForm.addField({
                id: "custpage_show_zero",
                type: serverWidget.FieldType.CHECKBOX,
                label: "Show Zero",
                container: mainGrp.id
            });
            /**/
            onLoadSubsidiaryRole(custpage_subsidiary);
            custpage_fromdt.defaultValue = getFromDate(_params.custpage_fromdt);
            custpage_todt.defaultValue = getToDate(_params.custpage_todt);
            if(lbf.isContainValue(_params.custpage_subsidiary)){
                custpage_subsidiary.defaultValue = _params.custpage_subsidiary;
            }
            if(lbf.isContainValue(_params.custpage_show_zero)){
                custpage_show_zero.defaultValue = _params.custpage_show_zero;
            }
            if(lbf.isContainValue(_params.custpage_rpt_type)){
                custpage_rpt_type.defaultValue = _params.custpage_rpt_type;
            }
            let rsSL = mainForm.addSublist({
                id : "custpage_sl_result",
                type : serverWidget.SublistType.LIST,
                label : 'Result'
            });
            onCreateSublistColumn(rsSL, custpage_fromdt.defaultValue, custpage_todt.defaultValue);
            return {form: mainForm, sublist: rsSL};
        }
        const runFilterTSCD = (_params) => {
            let arrResult = [];
            let arrPeriod = getDataPeriod(_params.custpage_fromdt, _params.custpage_todt);
            let arrFamBegin = getDataSSFamBegin(_params);
            let arrFamLuyke = getDataSSFamLuyke(_params);
            let arrFamMonth = getDataSSFamMonth(_params);
            let arrFam = runDataSS2423(arrFamBegin, arrFamLuyke, arrFamMonth, arrPeriod);

            let from_date = null;
            if(!!_params.custpage_fromdt) {
                from_date = format.parse({ value: _params.custpage_fromdt, type: "date" });
            }

            let arr_grp_data = lbf.onGroupByArray(arrFam, ["category"]);
            let count = 0;
            let objTotalGrp = {
                level: "total",
                phanbo_month: 0,
                tranid: "Cộng",
                quantity: 0, nguyen_gia: 0, current_amt: 0,
                total_month: 0, luyke: 0, tong_luyke: 0,
                period_amt: 0, period_luyke: 0
            }
            for(let idx = 0; idx < arrPeriod.length; idx++){
                let monthyear = arrPeriod[idx].month + arrPeriod[idx].year;
                objTotalGrp["amount_" + monthyear] = 0;
            }
            for(let i = 0; i < arr_grp_data.length; i++){
                let objTotal = {
                    level: "1",
                    tranid: arr_grp_data[i].category,
                    phanbo_month: 0,
                    quantity: 0, nguyen_gia: 0, current_amt: 0,
                    total_month: 0, luyke: 0, tong_luyke: 0,
                    period_amt: 0, period_luyke: 0
                };
                for(let idx = 0; idx < arrPeriod.length; idx++){
                    let monthyear = arrPeriod[idx].month + arrPeriod[idx].year;
                    objTotal["amount_" + monthyear] = 0;
                }
                let arr_filter_category = arrFam.filter(e => e.category == arr_grp_data[i].category);
                for(let j = 0; j < arr_filter_category.length; j++){
                    count++;
                    let obj = arr_filter_category[j];

                    if(from_date) {
                        if(!!obj.ngay_mua) {
                            let ngay_mua = format.parse({ value: obj.ngay_mua, type: "date" });
                            let isBefore = isBeforeBetweenDate(ngay_mua, from_date);
                            if(isBefore === false) {
                                obj.period_luyke = 0;
                            }
                        }
                    }

                    obj.stt = j + 1;
                    arrResult.push(obj);
                    objTotal.quantity += obj.quantity;
                    objTotal.nguyen_gia += obj.nguyen_gia;
                    objTotal.current_amt += obj.current_amt;
                    for(let k = 0; k < arrPeriod.length; k++){
                        let monthyear = arrPeriod[k].month + arrPeriod[k].year;
                        objTotal["amount_" + monthyear] += obj["amount_" + monthyear];
                        objTotalGrp["amount_" + monthyear] += obj["amount_" + monthyear];
                    }
                    objTotal.phanbo_month += obj.phanbo_month;
                    objTotal.total_month += obj.total_month;
                    objTotal.luyke += obj.luyke;
                    objTotal.tong_luyke += obj.tong_luyke;
                    objTotal.period_amt += obj.period_amt;
                    objTotal.period_luyke += obj.period_luyke;
                    // tổng total grp
                    objTotalGrp.quantity += obj.quantity;
                    objTotalGrp.nguyen_gia += obj.nguyen_gia;
                    objTotalGrp.current_amt += obj.current_amt;
                    objTotalGrp.phanbo_month += obj.phanbo_month;
                    objTotalGrp.total_month += obj.total_month;
                    objTotalGrp.luyke += obj.luyke;
                    objTotalGrp.tong_luyke += obj.tong_luyke;
                    objTotalGrp.period_amt += obj.period_amt;
                    objTotalGrp.period_luyke += obj.period_luyke;
                }
                count++;
                let spliceCnt = 0;
                if(i != 0){
                    spliceCnt = count - arr_filter_category.length - 1;
                }
                arrResult.splice(spliceCnt, 0, objTotal);
            }
            arrResult.push(objTotalGrp);
            return arrResult;
        }
        const runFilterSS = (_params) => {
            let arrFinal = [];
            let arrPeriod = getDataPeriod(_params.custpage_fromdt, _params.custpage_todt);
            let arrBegin2421 = getDataSSBegin2421(_params);
            let arrLuyke2421 = getDataSSLuyke2421(_params);
            let arrMonth2421 = getDataSSMonth2421(_params);
            let arrBegin2423 = getDataSSBegin2423(_params);
            let arrLuyke2423 = getDataSSLuyke2423(_params);
            let arrMonth2423 = getDataSSMonth2423(_params);
            let arrData2421 = runDataSS2421(arrBegin2421, arrLuyke2421, arrMonth2421, arrPeriod);
            let arrData2423 = runDataSS2423(arrBegin2423, arrLuyke2423, arrMonth2423, arrPeriod);
            let arrData = [...arrData2421, ...arrData2423];
            if(_params.custpage_show_zero == "F"){
                arrData = arrData.filter(e => e.period_amt != 0);
            }
            
            let from_date = null;
            if(!!_params.custpage_fromdt) {
                from_date = format.parse({ value: _params.custpage_fromdt, type: "date" });
            }

            let arr_grp_data = lbf.onGroupByArray(arrData, ["category"]);
            let count = 0;
            let objTotalGrp = {
                level: "total",
                phanbo_month: 0,
                tranid: "Cộng",
                quantity: 0, nguyen_gia: 0, current_amt: 0,
                total_month: 0, luyke: 0, tong_luyke: 0,
                period_amt: 0, period_luyke: 0
            }
            for(let idx = 0; idx < arrPeriod.length; idx++){
                let monthyear = arrPeriod[idx].month + arrPeriod[idx].year;
                objTotalGrp["amount_" + monthyear] = 0;
            }
            for(let i = 0; i < arr_grp_data.length; i++){
                let objTotal = {
                    level: "1",
                    phanbo_month: 0,
                    tranid: arr_grp_data[i].category,
                    quantity: 0, nguyen_gia: 0, current_amt: 0,
                    total_month: 0, luyke: 0, tong_luyke: 0,
                    period_amt: 0, period_luyke: 0
                };
                for(let idx = 0; idx < arrPeriod.length; idx++){
                    let monthyear = arrPeriod[idx].month + arrPeriod[idx].year;
                    objTotal["amount_" + monthyear] = 0;
                }
                let arr_filter_category = arrData.filter(e => e.category == arr_grp_data[i].category);
                for(let j = 0; j < arr_filter_category.length; j++){                    
                    count++;
                    let obj = arr_filter_category[j];

                    if(from_date) {
                        if(!!obj.ngay_mua) {
                            let ngay_mua = format.parse({ value: obj.ngay_mua, type: "date" });
                            let isBefore = isBeforeBetweenDate(ngay_mua, from_date);
                            if(isBefore === false) {
                                obj.period_luyke = 0;
                            }
                        }
                    }

                    obj.stt = j + 1;
                    arrFinal.push(obj);
                    objTotal.quantity += obj.quantity;
                    objTotal.nguyen_gia += obj.nguyen_gia;
                    objTotal.current_amt += obj.current_amt;
                    for(let k = 0; k < arrPeriod.length; k++){
                        let monthyear = arrPeriod[k].month + arrPeriod[k].year;
                        objTotal["amount_" + monthyear] += obj["amount_" + monthyear];
                        objTotalGrp["amount_" + monthyear] += obj["amount_" + monthyear];
                    }
                    objTotal.phanbo_month += obj.phanbo_month;
                    objTotal.total_month += obj.total_month;
                    objTotal.luyke += obj.luyke;
                    objTotal.tong_luyke += obj.tong_luyke;
                    objTotal.period_amt += obj.period_amt;
                    objTotal.period_luyke += obj.period_luyke;
                    // total group
                    objTotalGrp.quantity += obj.quantity;
                    objTotalGrp.nguyen_gia += obj.nguyen_gia;
                    objTotalGrp.current_amt += obj.current_amt;
                    objTotalGrp.phanbo_month += obj.phanbo_month;
                    objTotalGrp.total_month += obj.total_month;
                    objTotalGrp.luyke += obj.luyke;
                    objTotalGrp.tong_luyke += obj.tong_luyke;
                    objTotalGrp.period_amt += obj.period_amt;
                    objTotalGrp.period_luyke += obj.period_luyke;
                }
                count++;
                let spliceCnt = 0;
                if(i != 0){
                    spliceCnt = count - arr_filter_category.length - 1;
                }
                arrFinal.splice(spliceCnt, 0, objTotal);
            }
            arrFinal.push(objTotalGrp);
            return arrFinal;
        }
        const isBeforeBetweenDate = (ngay_mua, from_date) => {
            const momentNgayMua = moment(ngay_mua).startOf('day');
            const momentFrom = moment(from_date).startOf('day');

            return momentNgayMua.isBefore(momentFrom);
        }

        const runDataSS2421 = (_arrBegin, _arrLuyke, _arrMonth, _arrPeriod) => {
            // log.error("for 2421", {
            //     _arrBegin: _arrBegin[0],
            //     _arrLuyke: _arrLuyke[0]
            // })
            let arrResult = [];
            for(let i = 0; i < _arrBegin.length; i++){
                let obj = {
                    tranid: _arrBegin[i].name,
                    memo: _arrBegin[i].memo,
                    doc_no: _arrBegin[i].doc_no,
                    quantity: _arrBegin[i].quantity * 1,
                    nguyen_gia: _arrBegin[i].nguyen_gia * 1,
                    current_amt: _arrBegin[i].nguyen_gia * 1,
                    ngay_mua: _arrBegin[i].ngay_mua,
                    department: _arrBegin[i].department,
                    ngay_su_dung: _arrBegin[i].ngay_su_dung,
                    thoi_han: _arrBegin[i].thoi_han,
                    debit_account: _arrBegin[i].source_acc,
                    credit_account: _arrBegin[i].expense_acc,
                    category: _arrBegin[i].category,
                    phanbo_month: 0,
                    total_month: 0,
                    luyke: 0,
                    tong_luyke: 0,
                    period_amt: 0,
                    period_luyke: 0
                }
                if(obj.thoi_han != 0){
                    obj.phanbo_month = Math.round(obj.nguyen_gia / obj.thoi_han);
                }
                let arr_filter_month = _arrMonth.filter(e => e.name == obj.tranid);
                for(let j = 0; j < _arrPeriod.length; j++){
                    let monthyear = _arrPeriod[j].month + _arrPeriod[j].year;
                    let obj_find_month = arr_filter_month.find(e => e.name == obj.tranid && e.month == _arrPeriod[j].periodid);
                    if(!!obj_find_month){
                        obj["amount_" + monthyear] = obj_find_month.amount * 1;
                    } else {
                        obj["amount_" + monthyear] = 0;
                    }
                    obj.total_month += obj["amount_" + monthyear];
                }
                let obj_find_luyke = _arrLuyke.find(e => e.name == obj.tranid);
                if(!!obj_find_luyke){
                    obj.luyke = obj_find_luyke.amount;
                }
                obj.tong_luyke = obj.total_month + obj.luyke;
                obj.period_amt = obj.current_amt - obj.tong_luyke;
                obj.period_luyke = obj.current_amt - obj.luyke;
                arrResult.push(obj);
            }
            return arrResult;
        }
        const runDataSS2423 = (_arrBegin, _arrLuyke, _arrMonth, _arrPeriod) => {
            let arrResult = [];
            for(let i = 0; i < _arrBegin.length; i++){
                let obj = {
                    tranid: _arrBegin[i].name,
                    memo: _arrBegin[i].memo,
                    doc_no: _arrBegin[i].doc_no,
                    quantity: _arrBegin[i].quantity * 1,
                    nguyen_gia: _arrBegin[i].nguyen_gia * 1,
                    current_amt: _arrBegin[i].amount * 1,
                    ngay_mua: _arrBegin[i].ngay_mua,
                    department: _arrBegin[i].department,
                    ngay_su_dung: _arrBegin[i].ngay_su_dung,
                    thoi_han: _arrBegin[i].thoi_han,
                    debit_account: _arrBegin[i].source_acc,
                    credit_account: _arrBegin[i].dest_acc,
                    category: _arrBegin[i].category,
                    phanbo_month: 0,
                    total_month: 0,
                    luyke: 0,
                    tong_luyke: 0,
                    period_amt: 0,
                    period_luyke: 0
                }
                if(obj.thoi_han != 0){
                    obj.phanbo_month = Math.round(obj.nguyen_gia / obj.thoi_han);
                }
                let arr_filter_month = _arrMonth.filter(e => e.name == obj.tranid);
                for(let j = 0; j < _arrPeriod.length; j++){
                    let monthyear = _arrPeriod[j].month + _arrPeriod[j].year;
                    let obj_find_month = arr_filter_month.find(e => e.name == obj.tranid && e.month == _arrPeriod[j].periodid);
                    if(!!obj_find_month){
                        obj["amount_" + monthyear] = obj_find_month.amount * 1;
                    } else {
                        obj["amount_" + monthyear] = 0;
                    }
                    obj.total_month += obj["amount_" + monthyear];
                }
                let obj_find_luyke = _arrLuyke.find(e => e.asset_id == _arrBegin[i].internalid);
                if(!!obj_find_luyke){
                    obj.luyke = obj_find_luyke.amount;
                }
                obj.tong_luyke = obj.total_month + obj.luyke;
                obj.period_amt = obj.current_amt - obj.tong_luyke;
                obj.period_luyke = obj.current_amt - obj.luyke;
                arrResult.push(obj);
            }
            return arrResult;
        }
        const getDataSSBegin2421 = (_params) => {
            let resultSearch = search.load(SAVED_SEARCH.CPTT_BEGIN_2421);
            let mycolumns = resultSearch.columns;
            let myFilter = resultSearch.filters;
            if(lbf.isContainValue(_params.custpage_subsidiary)){
                myFilter.push(search.createFilter({
                    name: 'subsidiary',
                    join: 'transaction',
                    operator: "anyof",
                    values: _params.custpage_subsidiary}));
            }
            if(lbf.isContainValue(_params.custpage_fromdt) && _params.custpage_show_zero != 'T'){
                myFilter.push(search.createFilter({
                    name: 'scheddate',
                    operator: search.Operator.ONORAFTER,
                    values: _params.custpage_fromdt}));
            }
            if(lbf.isContainValue(_params.custpage_todt) && _params.custpage_show_zero != 'T'){
                myFilter.push(search.createFilter({
                    name: 'scheddate',
                    operator: search.Operator.ONORBEFORE,
                    values: _params.custpage_todt}));
            }
            resultSearch = resultSearch.runPaged({pageSize:1000});
            let arrResult = [];
            for(let i = 0; i < resultSearch.pageRanges.length; i++){
                let currentPage = resultSearch.fetch({index : i}).data;
                for(let idx = 0; idx < currentPage.length; idx++){
                    let obj = {};
                    obj.name = currentPage[idx].getValue(mycolumns[COL_CPTT_BEGIN_2421.SCHEDULE]);
                    obj.memo = currentPage[idx].getValue(mycolumns[COL_CPTT_BEGIN_2421.MEMO]);
                    obj.doc_no = currentPage[idx].getValue(mycolumns[COL_CPTT_BEGIN_2421.DOC_NO]);
                    obj.quantity = currentPage[idx].getValue(mycolumns[COL_CPTT_BEGIN_2421.QUANTITY]) * 1;
                    obj.nguyen_gia = currentPage[idx].getValue(mycolumns[COL_CPTT_BEGIN_2421.NGUYEN_GIA]) * 1;
                    obj.ngay_mua = currentPage[idx].getValue(mycolumns[COL_CPTT_BEGIN_2421.NGAY_MUA]);
                    obj.ngay_su_dung = currentPage[idx].getValue(mycolumns[COL_CPTT_BEGIN_2421.NGAY_SU_DUNG]);
                    obj.thoi_han = currentPage[idx].getValue(mycolumns[COL_CPTT_BEGIN_2421.THOI_HAN]);
                    obj.source_acc = currentPage[idx].getValue(mycolumns[COL_CPTT_BEGIN_2421.SOURCE_ACC]);
                    obj.expense_acc = currentPage[idx].getValue(mycolumns[COL_CPTT_BEGIN_2421.EXPENSE_ACC]);
                    obj.subsidiary = currentPage[idx].getValue(mycolumns[COL_CPTT_BEGIN_2421.SUBSIDIARY]);
                    obj.category = currentPage[idx].getValue(mycolumns[COL_CPTT_BEGIN_2421.CATEGORY]);
                    obj.department = currentPage[idx].getText(mycolumns[COL_CPTT_BEGIN_2421.DEPARTMENT]);
                    arrResult.push(obj);
                }
            }
            return arrResult;
        }
        const getDataSSLuyke2421 = (_params) => {
            let resultSearch = search.load(SAVED_SEARCH.CPTT_LUY_KE_2421);
            let mycolumns = resultSearch.columns;
            let myFilter = resultSearch.filters;
            if(lbf.isContainValue(_params.custpage_subsidiary)){
                myFilter.push(search.createFilter({
                    name: 'subsidiary',
                    join: 'transaction',
                    operator: "anyof",
                    values: _params.custpage_subsidiary}));
            }
            if(lbf.isContainValue(_params.custpage_fromdt)){
                myFilter.push(search.createFilter({
                    name: 'trandate',
                    join: 'journal',
                    operator: search.Operator.BEFORE,
                    values: _params.custpage_fromdt}));
            }
            resultSearch = resultSearch.runPaged({pageSize:1000});
            let arrResult = [];
            for(let i = 0; i < resultSearch.pageRanges.length; i++){
                let currentPage = resultSearch.fetch({index : i}).data;
                for(let idx = 0; idx < currentPage.length; idx++){
                    let obj = {};
                    obj.name = currentPage[idx].getValue(mycolumns[COL_CPTT_LUYKE_2421.SCHEDULE]);
                    obj.amount = currentPage[idx].getValue(mycolumns[COL_CPTT_LUYKE_2421.AMOUNT]) * 1;
                    obj.subsidiary = currentPage[idx].getValue(mycolumns[COL_CPTT_LUYKE_2421.SUBSIDIARY]);
                    arrResult.push(obj);
                }
            }
            return arrResult;
        }
        const getDataSSMonth2421 = (_params) => {
            let resultSearch = search.load(SAVED_SEARCH.CPTT_MONTH_2421);
            let mycolumns = resultSearch.columns;
            let myFilter = resultSearch.filters;
            if(lbf.isContainValue(_params.custpage_subsidiary)){
                myFilter.push(search.createFilter({
                    name: 'subsidiary',
                    join: 'transaction',
                    operator: "anyof",
                    values: _params.custpage_subsidiary}));
            }
            if(lbf.isContainValue(_params.custpage_fromdt)){
                myFilter.push(search.createFilter({
                    name: 'trandate',
                    join: 'journal',
                    operator: search.Operator.ONORAFTER,
                    values: _params.custpage_fromdt}));
            }
            if(lbf.isContainValue(_params.custpage_todt)){
                myFilter.push(search.createFilter({
                    name: 'trandate',
                    join: 'journal',
                    operator: search.Operator.ONORBEFORE,
                    values: _params.custpage_todt}));
            }
            resultSearch = resultSearch.runPaged({pageSize:1000});
            let arrResult = [];
            for(let i = 0; i < resultSearch.pageRanges.length; i++){
                let currentPage = resultSearch.fetch({index : i}).data;
                for(let idx = 0; idx < currentPage.length; idx++){
                    let obj = {};
                    obj.name = currentPage[idx].getValue(mycolumns[COL_CPTT_MONTH_2421.SCHEDULE]);
                    obj.expense_amt = currentPage[idx].getValue(mycolumns[COL_CPTT_MONTH_2421.EXPENSE_AMOUNT]) * 1;
                    obj.amount = currentPage[idx].getValue(mycolumns[COL_CPTT_MONTH_2421.AMOUNT]) * 1;
                    obj.month = currentPage[idx].getValue(mycolumns[COL_CPTT_MONTH_2421.MONTH]);
                    obj.subsidiary = currentPage[idx].getValue(mycolumns[COL_CPTT_MONTH_2421.SUBSIDIARY]);
                    arrResult.push(obj);
                }
            }
            return arrResult;
        }
        const getDataSSBegin2423 = (_params) => {
            let resultSearch = search.load(SAVED_SEARCH.CPTT_BEGIN_2423);
            let mycolumns = resultSearch.columns;
            let myFilter = resultSearch.filters;
            if(lbf.isContainValue(_params.custpage_subsidiary)){
                myFilter.push(search.createFilter({
                    name: 'custrecord_assetsubsidiary',
                    operator: "anyof",
                    values: _params.custpage_subsidiary}));
            }
            // if(lbf.isContainValue(_params.custpage_fromdt)){
            //     myFilter.push(search.createFilter({
            //         name: 'custrecord_assetdeprstartdate',
            //         operator: search.Operator.ONORAFTER,
            //         values: _params.custpage_fromdt}));
            // }
            if(lbf.isContainValue(_params.custpage_todt) && _params.custpage_show_zero != 'T'){
                myFilter.push(search.createFilter({
                    name: 'custrecord_assetdeprstartdate',
                    operator: search.Operator.ONORBEFORE,
                    values: _params.custpage_todt}));
            }
            resultSearch = resultSearch.runPaged({pageSize:1000});
            let arrResult = [];
            for(let i = 0; i < resultSearch.pageRanges.length; i++){
                let currentPage = resultSearch.fetch({index : i}).data;
                for(let idx = 0; idx < currentPage.length; idx++){
                    let obj = {};
                    obj.internalid = currentPage[idx].id;
                    obj.name = currentPage[idx].getValue(mycolumns[COL_CPTT_BEGIN_2423.ASSET]);
                    obj.memo = currentPage[idx].getValue(mycolumns[COL_CPTT_BEGIN_2423.MEMO]);
                    obj.doc_no = currentPage[idx].getValue(mycolumns[COL_CPTT_BEGIN_2423.DOC_NO]);
                    obj.quantity = currentPage[idx].getValue(mycolumns[COL_CPTT_BEGIN_2423.QUANTITY]) * 1;
                    obj.amount = currentPage[idx].getValue(mycolumns[COL_CPTT_BEGIN_2423.AMOUNT]) * 1;
                    obj.ngay_mua = currentPage[idx].getValue(mycolumns[COL_CPTT_BEGIN_2423.NGAY_MUA]);
                    obj.ngay_su_dung = currentPage[idx].getValue(mycolumns[COL_CPTT_BEGIN_2423.NGAY_SU_DUNG]);
                    obj.thoi_han = currentPage[idx].getValue(mycolumns[COL_CPTT_BEGIN_2423.THOI_HAN]);
                    obj.source_acc = currentPage[idx].getValue(mycolumns[COL_CPTT_BEGIN_2423.SOURCE_ACC]);
                    obj.dest_acc = currentPage[idx].getValue(mycolumns[COL_CPTT_BEGIN_2423.DEST_ACC]);
                    obj.nguyen_gia = currentPage[idx].getValue(mycolumns[COL_CPTT_BEGIN_2423.NGUYEN_GIA]) * 1;
                    obj.category = currentPage[idx].getValue(mycolumns[COL_CPTT_BEGIN_2423.CATEGORY]);
                    obj.department = currentPage[idx].getText(mycolumns[COL_CPTT_BEGIN_2423.DEPARTMENT]);
                    arrResult.push(obj);
                }
            }
            return arrResult;
        }
        const getDataSSLuyke2423 = (_params) => {
            let resultSearch = search.load(SAVED_SEARCH.CPTT_LUY_KE_2423);
            let mycolumns = resultSearch.columns;
            let myFilter = resultSearch.filters;
            if(lbf.isContainValue(_params.custpage_subsidiary)){
                myFilter.push(search.createFilter({
                    name: 'custrecord_deprhistsubsidiary',
                    operator: "anyof",
                    values: _params.custpage_subsidiary}));
            }
            if(lbf.isContainValue(_params.custpage_fromdt)){
                myFilter.push(search.createFilter({
                    name: 'custrecord_deprhistdate',
                    operator: search.Operator.BEFORE,
                    values: _params.custpage_fromdt}));
            }
            resultSearch = resultSearch.runPaged({pageSize:1000});
            let arrResult = [];
            for(let i = 0; i < resultSearch.pageRanges.length; i++){
                let currentPage = resultSearch.fetch({index : i}).data;
                for(let idx = 0; idx < currentPage.length; idx++){
                    let obj = {};
                    obj.asset_id = currentPage[idx].getValue(mycolumns[COL_CPTT_LUYKE_2423.ASSET]);
                    obj.asset_nm = currentPage[idx].getText(mycolumns[COL_CPTT_LUYKE_2423.ASSET]);
                    obj.name = currentPage[idx].getValue(mycolumns[COL_CPTT_LUYKE_2423.ASSET]);
                    obj.amount = currentPage[idx].getValue(mycolumns[COL_CPTT_LUYKE_2423.AMOUNT]) * 1;
                    obj.subsidiary = currentPage[idx].getValue(mycolumns[COL_CPTT_LUYKE_2423.SUBSIDIARY]);
                    arrResult.push(obj);
                }
            }
            return arrResult;
        }
        const getDataSSMonth2423 = (_params) => {
            let resultSearch = search.load(SAVED_SEARCH.CPTT_MONTH_2423);
            let mycolumns = resultSearch.columns;
            let myFilter = resultSearch.filters;
            if(lbf.isContainValue(_params.custpage_subsidiary)){
                myFilter.push(search.createFilter({
                    name: 'custrecord_deprhistsubsidiary',
                    operator: "anyof",
                    values: _params.custpage_subsidiary}));
            }
            if(lbf.isContainValue(_params.custpage_fromdt)){
                myFilter.push(search.createFilter({
                    name: 'custrecord_deprhistdate',
                    operator: search.Operator.ONORAFTER,
                    values: _params.custpage_fromdt}));
            }
            if(lbf.isContainValue(_params.custpage_todt)){
                myFilter.push(search.createFilter({
                    name: 'custrecord_deprhistdate',
                    operator: search.Operator.ONORBEFORE,
                    values: _params.custpage_todt}));
            }
            resultSearch = resultSearch.runPaged({pageSize:1000});
            let arrResult = [];
            for(let i = 0; i < resultSearch.pageRanges.length; i++){
                let currentPage = resultSearch.fetch({index : i}).data;
                for(let idx = 0; idx < currentPage.length; idx++){
                    let obj = {};
                    obj.name = currentPage[idx].getText(mycolumns[COL_CPTT_MONTH_2423.ASSET]);
                    obj.month = currentPage[idx].getValue(mycolumns[COL_CPTT_MONTH_2423.MONTH]);
                    obj.amount = currentPage[idx].getValue(mycolumns[COL_CPTT_MONTH_2423.AMOUNT]) * 1;
                    obj.subsidiary = currentPage[idx].getValue(mycolumns[COL_CPTT_MONTH_2423.SUBSIDIARY]);
                    arrResult.push(obj);
                }
            }
            return arrResult;
        }
        const getDataSSFamBegin = (_params) => {
            let resultSearch = search.load(SAVED_SEARCH.DEPR_FAM_BEGIN);
            let mycolumns = resultSearch.columns;
            let myFilter = resultSearch.filters;
            if(lbf.isContainValue(_params.custpage_subsidiary)){
                myFilter.push(search.createFilter({
                    name: 'custrecord_assetsubsidiary',
                    operator: "anyof",
                    values: _params.custpage_subsidiary}));
            }
            // if(lbf.isContainValue(_params.custpage_fromdt)){
            //     myFilter.push(search.createFilter({
            //         name: 'custrecord_assetdeprstartdate',
            //         operator: search.Operator.ONORAFTER,
            //         values: _params.custpage_fromdt}));
            // }
            if(lbf.isContainValue(_params.custpage_todt) && _params.custpage_show_zero != 'T'){
                myFilter.push(search.createFilter({
                    name: 'custrecord_assetdeprstartdate',
                    operator: search.Operator.ONORBEFORE,
                    values: _params.custpage_todt}));
            }
            resultSearch = resultSearch.runPaged({pageSize:1000});
            let arrResult = [];
            for(let i = 0; i < resultSearch.pageRanges.length; i++){
                let currentPage = resultSearch.fetch({index : i}).data;
                for(let idx = 0; idx < currentPage.length; idx++){
                    let obj = {};
                    obj.internalid = currentPage[idx].id;
                    obj.name = currentPage[idx].getValue(mycolumns[COL_FAM_BEGIN.ASSET]);
                    obj.memo = currentPage[idx].getValue(mycolumns[COL_FAM_BEGIN.MEMO]);
                    obj.doc_no = currentPage[idx].getValue(mycolumns[COL_FAM_BEGIN.DOC_NO]);
                    obj.quantity = currentPage[idx].getValue(mycolumns[COL_FAM_BEGIN.QUANTITY]) * 1;
                    obj.amount = currentPage[idx].getValue(mycolumns[COL_FAM_BEGIN.AMOUNT]) * 1;
                    obj.ngay_mua = currentPage[idx].getValue(mycolumns[COL_FAM_BEGIN.NGAY_MUA]);
                    obj.ngay_su_dung = currentPage[idx].getValue(mycolumns[COL_FAM_BEGIN.NGAY_SU_DUNG]);
                    obj.thoi_han = currentPage[idx].getValue(mycolumns[COL_FAM_BEGIN.THOI_HAN]);
                    obj.source_acc = currentPage[idx].getValue(mycolumns[COL_FAM_BEGIN.SOURCE_ACC]);
                    obj.dest_acc = currentPage[idx].getValue(mycolumns[COL_FAM_BEGIN.DEST_ACC]);
                    obj.nguyen_gia = currentPage[idx].getValue(mycolumns[COL_FAM_BEGIN.NGUYEN_GIA]) * 1;
                    obj.category = currentPage[idx].getValue(mycolumns[COL_FAM_BEGIN.CATEGORY]);
                    obj.department = currentPage[idx].getText(mycolumns[COL_FAM_BEGIN.DEPARTMENT]);
                    arrResult.push(obj);
                }
            }
            return arrResult;
        }
        const getDataSSFamLuyke = (_params) => {
            let resultSearch = search.load(SAVED_SEARCH.DEPR_FAM_LUY_KE);
            let mycolumns = resultSearch.columns;
            let myFilter = resultSearch.filters;
            if(lbf.isContainValue(_params.custpage_subsidiary)){
                myFilter.push(search.createFilter({
                    name: 'custrecord_deprhistsubsidiary',
                    operator: "anyof",
                    values: _params.custpage_subsidiary}));
            }
            if(lbf.isContainValue(_params.custpage_fromdt)){
                myFilter.push(search.createFilter({
                    name: 'custrecord_deprhistdate',
                    operator: search.Operator.BEFORE,
                    values: _params.custpage_fromdt}));
            }
            resultSearch = resultSearch.runPaged({pageSize:1000});
            let arrResult = [];
            for(let i = 0; i < resultSearch.pageRanges.length; i++){
                let currentPage = resultSearch.fetch({index : i}).data;
                for(let idx = 0; idx < currentPage.length; idx++){
                    let obj = {};
                    obj.asset_id = currentPage[idx].getValue(mycolumns[COL_FAM_LUYKE.ASSET]);
                    obj.asset_nm = currentPage[idx].getText(mycolumns[COL_FAM_LUYKE.ASSET]);
                    obj.name = currentPage[idx].getValue(mycolumns[COL_FAM_LUYKE.ASSET]);
                    obj.amount = currentPage[idx].getValue(mycolumns[COL_FAM_LUYKE.AMOUNT]) * 1;
                    obj.subsidiary = currentPage[idx].getValue(mycolumns[COL_FAM_LUYKE.SUBSIDIARY]);
                    arrResult.push(obj);
                }
            }
            return arrResult;
        }
        const getDataSSFamMonth = (_params) => {
            let resultSearch = search.load(SAVED_SEARCH.DEPR_FAM_MONTH);
            let mycolumns = resultSearch.columns;
            let myFilter = resultSearch.filters;
            if(lbf.isContainValue(_params.custpage_subsidiary)){
                myFilter.push(search.createFilter({
                    name: 'custrecord_deprhistsubsidiary',
                    operator: "anyof",
                    values: _params.custpage_subsidiary}));
            }
            if(lbf.isContainValue(_params.custpage_fromdt)){
                myFilter.push(search.createFilter({
                    name: 'custrecord_deprhistdate',
                    operator: search.Operator.ONORAFTER,
                    values: _params.custpage_fromdt}));
            }
            if(lbf.isContainValue(_params.custpage_todt)){
                myFilter.push(search.createFilter({
                    name: 'custrecord_deprhistdate',
                    operator: search.Operator.ONORBEFORE,
                    values: _params.custpage_todt}));
            }
            resultSearch = resultSearch.runPaged({pageSize:1000});
            let arrResult = [];
            for(let i = 0; i < resultSearch.pageRanges.length; i++){
                let currentPage = resultSearch.fetch({index : i}).data;
                for(let idx = 0; idx < currentPage.length; idx++){
                    let obj = {};
                    obj.name = currentPage[idx].getText(mycolumns[COL_FAM_MONTH.ASSET]);
                    obj.month = currentPage[idx].getValue(mycolumns[COL_FAM_MONTH.MONTH]);
                    obj.amount = currentPage[idx].getValue(mycolumns[COL_FAM_MONTH.AMOUNT]) * 1;
                    obj.subsidiary = currentPage[idx].getValue(mycolumns[COL_FAM_MONTH.SUBSIDIARY]);
                    arrResult.push(obj);
                }
            }
            return arrResult;
        }
        function onCreateSublistColumn(_sublist, _fromdt, _todt){
            let arrColumn = [
                { label: "STT", type: "float" },
                { label: "Mã", type: "text" },
                { label: "Nội dung", type: "text" },
                { label: "Số hóa đơn", type: "text" },
                { label: "Số Lượng", type: "float" },
                { label: "Phòng ban sử dụng", type: "text" },
                { label: "Nguyên gíá TS", type: "float" },
                { label: "Giá trị hiện tại", type: "float" },
                { label: "Ngày Mua", type: "text" },
                { label: "Ngày đựa vào sử dụng", type: "text" },
                { label: "Thời gian sử dụng", type: "text" },
                { label: "Mức phân bổ tháng", type: "float" },
                { label: "TK NỢ", type: "text" },
                { label: "TK CÓ", type: "text" },
            ];
            let fromdt = format.parse({value: _fromdt, type: "date"});
            let todt = format.parse({value: _todt, type: "date"});
            let arrPeriod = getDataPeriod(_fromdt, _todt);
            log.error("arrPeriod", arrPeriod);
            for(let idx = 0; idx < arrPeriod.length; idx++){
                arrColumn.push({
                    id: "custpage_col_" + arrPeriod[idx].month + arrPeriod[idx].year,
                    label: "Tháng " + arrPeriod[idx].monthyear,
                    type: "float"
                });
            }
            let fromdt_luyke = fromdt;
            fromdt_luyke.setDate(fromdt_luyke.getDate() - 1);
            fromdt_luyke = format.format({value: fromdt_luyke, type: "date"});
            let arrColumn2 = [
                { label: "Lũy kế kỳ báo cáo", type: "float" },
                { label: `Lũy kế đến ${fromdt_luyke}`, type: "float" },
                { label: "Tổng luỹ kế", type: "float" },
                { label: "Giá trị còn lại kỳ này", type: "float" },
                { label: `Giá trị còn lại ${fromdt_luyke}`, type: "float" },
                { label: "Level", type: "text", displayType: "hidden", id: "custpage_col_level" },
            ];
            arrColumn = [...arrColumn, ...arrColumn2];
            //
            let index = 0;

            log.error("arrColumn", arrColumn);

            for(let i = 0; i< arrColumn.length; i++){
                if(!arrColumn[i].id){
                    index++;
                }
                _sublist.addField({
                    id : arrColumn[i].id || ("custpage_col_"+ index),
                    type : arrColumn[i].type,
                    label : arrColumn[i].label
                }).updateDisplayType({ displayType: arrColumn[i].displayType || "inline"});
            }
        }
        const getDataPeriod = (_fromdt, _todt) => {
            let arrResult = [];
            if(_fromdt && _todt){
                // TODO: 20260414: group data ACCOUNTING_PERIOD do bi duplicate lam trung id cột động
                let resultSearch = search.create({
                    type: search.Type.ACCOUNTING_PERIOD,
                    filters: [
                        // ["fiscalcalendar","anyof","2"],
                        // "AND",
                        ["isyear","is","F"],
                        "AND",
                        ["isquarter","is","F"],
                        "AND",
                        ["isadjust","is","F"],
                        "AND",
                        ["startdate","onorafter", _fromdt],
                        "AND",
                        ["startdate","onorbefore", _todt],
                    ],
                    columns: [
                        search.createColumn({
                            name: "periodname",
                            label: "Period name",
                            summary: "GROUP",
                        }),
                        search.createColumn({
                            name: "internalid",
                            label: "Period id",
                            summary: "GROUP",
                        }),
                        search.createColumn({
                            name: "startdate",
                            sort: search.Sort.ASC,
                            label: "Start Date",
                            summary: "MAX",
                        }),
                        search.createColumn({name: "enddate", label: "End Date", summary: "MAX"}),
                        search.createColumn({
                            name: "formulatext",
                            formula: "TO_CHAR({startdate},'MM')",
                            label: "Month",
                            summary: "GROUP",
                        }),
                        search.createColumn({
                            name: "formulatext",
                            formula: "TO_CHAR({startdate},'YYYY')",
                            label: "Year",
                            summary: "GROUP",
                        }),
                    ]
                });
                let myColumns = resultSearch.columns;
                resultSearch = resultSearch.run().getRange({start: 0, end: 1000});
                for(let i = 0; i < resultSearch.length; i++){
                    let obj = {};
                    obj.periodname = resultSearch[i].getValue(myColumns[0]);
                    obj.periodid = resultSearch[i].getValue(myColumns[1]);
                    obj.month = resultSearch[i].getValue(myColumns[4]);
                    obj.year = resultSearch[i].getValue(myColumns[5]);
                    obj.monthyear = obj.month + "/" + obj.year;
                    arrResult.push(obj);
                }
            }
            return arrResult;
        }
        function setRowDataSublist(_sublist, _line, _field, _data){
            for(let i = 0; i<_field.length; i++){
                addValueColField(_sublist, _field[i], _line, _data[i]);
            }
        }
        function addValueColField(sublist, id, line, value) {

            if(lbf.isContainValue(value)){
                sublist.setSublistValue({
                    id: id,
                    line: line,
                    value: value
                });
            }
        }
        const onLoadSubsidiaryRole = (_subsidiaryField) => {
            let crrUserRec = runtime.getCurrentUser();
            let roleRec = record.load({type: "role", id: crrUserRec.role});
            let subsidiary_op = roleRec.getValue("subsidiaryoption");
            let myFilter = [];
            switch (subsidiary_op){
                case 'ALL':
                    myFilter = [];
                    break;
                case 'ALLACTIVE':
                    myFilter = [['isinactive', 'is', false]];
                    break;
                case 'OWN':
                    let empRec = record.load({type: record.Type.EMPLOYEE, id: crrUserRec.id});

                    myFilter = ['internalid', "anyOf", empRec.getValue("subsidiary")];
                    break;
                case 'SELECTED':
                    let arrSubSel = roleRec.getValue("subsidiaryrestriction");
                    myFilter = ['internalid', "anyOf", arrSubSel]
                    break;
            }
            let subSearch = search.create({
                type: "subsidiary",
                filters: myFilter,
                columns: ["name","parent"]
            });
            subSearch = subSearch.run().getRange(0, 1000);
            for(let item in subSearch){
                let name = subSearch[item].getValue('name');
                name  = name.substring(name.lastIndexOf(":")+1,name.length).trim();
                _subsidiaryField.addSelectOption({
                    value : subSearch[item].id,
                    text : name,
                    isSelected: crrUserRec.subsidiary == subSearch[item].id ? true : false
                });
            }
        }
        function addFieldGroup(_form, _id,_label){
            let _obj = {id: _id, label: _label}
            _form.addFieldGroup(_obj);
            return _obj;
        }
        function getFromDate(fromdt){
            if(lbf.isContainValue(fromdt)){
                return fromdt
            }
            let d = new Date();
            return new Date(d.getFullYear(), 0, 1);
        }
        function getToDate(todt){
            if(lbf.isContainValue(todt)){
                return todt
            }
            let d = new Date();
            return new Date(d.getFullYear(), 12, 0);
        }

        return {onRequest}

    });
