/**
 * Nội dung: Lấy dữ liệu cho mẫu in 'Print PO' (scv_print_po.xml)
 * =======================================================================================
 *  Date                Author                  Description
 *  27 Oct 2026         Thanh Hoan              Thêm button Print PO trên màng hình Purchase Order from mrs.Ngoc(https://app.clickup.com/t/3773072/14yhnhmh4cd)
 */
define([
    'N/render', 'N/record', 'N/query', 'N/file',
    '../lib/scv_lib_pdf.js', '../lib/scv_lib_function.js'
],
function(
    render, record, query, file,
    libPdf, lbf
) {
    const SUBLIST_ID = "item";

    const addDataSource = (rec, renderer, subsidiaryRec) => {
        addRecordEntityLocation(rec, renderer);

        let objLine = getDataLine(rec);
        let imgFooterUrl = file.load("../assets/scv_footer_pdf_eco.png").url;
        // log.error("imgFooterUrl", imgFooterUrl);
        renderer.addCustomDataSource({
            format: render.DataSource.OBJECT,
            alias: "jsonData",
            data: {
                logo: subsidiaryRec ? libPdf.createImageBySubsidiaryV2(subsidiaryRec, 150) : "",
                imgFooterUrl: imgFooterUrl,
                objBody: getDataBody(rec, objLine),
                arrLine: objLine.arrLine
            }
        });
    }

    const addRecordEntityLocation = (rec, renderer) => {
        let vendorId = rec.getValue("entity");
        if(!!vendorId){
            let vendorRec = record.load({ type: lbf.getEntityType(vendorId), id: vendorId });
            renderer.addRecord('entity', vendorRec);
        }
        let locationId = rec.getValue("location");
        if(!!locationId){
            let locationRec = record.load({ type: "location", id: locationId });
            renderer.addRecord('location', locationRec);
        }
    }

    const getDataLine = (rec) => {
        let lineCount = rec.getLineCount(SUBLIST_ID);
        let objItem = {};
        query.runSuiteQL({
            query: `SELECT item.id, item.itemid, item.custitem_scv_item_supplier_barcode, item.purchasedescription,
                    item.custitem_scv_packing_uom_con_rate,
                    BUILTIN.DF(item.custitem_scv_packing_uom_carton) AS uom_carton
                FROM transactionline tl
                JOIN item ON item.id = tl.item
                WHERE tl.transaction = ${rec.id}`
        }).asMappedResults().forEach(e => objItem[e.id] = e);

        let arrLine = [], totalAmt = 0, totalTax = 0, totalGross = 0;
        for(let i = 0; i < lineCount; i++){
            let item = objItem[rec.getSublistValue(SUBLIST_ID, "item", i)] || {};
            let quantity = rec.getSublistValue(SUBLIST_ID, "quantity", i) * 1 || 0;
            let rate = rec.getSublistValue(SUBLIST_ID, "rate", i) * 1 || 0;
            let amount = rec.getSublistValue(SUBLIST_ID, "amount", i) * 1 || 0;
            let taxamount = (rec.getSublistValue(SUBLIST_ID, "tax1amt", i) ) * 1 || 0;
            let grossamount = rec.getSublistValue(SUBLIST_ID, "grossamt", i) * 1 || 0;
            let packSize = item.custitem_scv_packing_uom_con_rate * 1 || 0;

            totalAmt += amount;
            totalTax += taxamount;
            totalGross += grossamount;

            arrLine.push(libPdf.formatDataXMLWithObject({
                stt: i + 1,
                itemid: item.itemid,
                supplier_barcode: item.custitem_scv_item_supplier_barcode,
                description: item.purchasedescription,
                quantity: libPdf.formatNumberV2(quantity),
                pack_size: libPdf.formatNumberV2(packSize),
                uom_carton: item.uom_carton,
                total_qty: libPdf.formatNumberV2(libPdf.roundNumber(quantity * packSize, 2)),
                rate: formatAmount(rate),
                amount: formatAmount(amount),
                taxamount: formatAmount(taxamount),
                grossamount: formatAmount(grossamount),
            }));
        }

        return { arrLine, totalAmt, totalTax, totalGross };
    }

    const getDataBody = (rec, objLine) => {
        let expectRecpDate = rec.getText("custbody_scv_expect_recp_date");
        let objBody = libPdf.formatDataXMLWithObject({
            tranid: rec.getValue("tranid"),
            trandate: rec.getText("trandate"),
            delivery_date: expectRecpDate,
            expired_date: expectRecpDate,
            memo: (rec.getValue("memo") || "").replace(/\r\n|\r|\n/g, "<br/>"),
            totalAmt: formatAmount(objLine.totalAmt),
            totalTax: formatAmount(objLine.totalTax),
            totalGross: formatAmount(objLine.totalGross),
        });
        // escape từng dòng trước rồi mới bọc <p>, tránh formatDataXMLWithObject escape luôn thẻ <p>
        let purchaseNote = rec.getValue("custbody_scv_purchase_note");
        objBody.purchase_note = purchaseNote
            ? purchaseNote.split(/\r\n|\r|\n/).map(line => `<p>${libPdf.unReTextXML(line)}</p>`).join("")
            : "";
        return objBody;
    }

    const formatAmount = (num) => {
        return libPdf.formatNumberV2((num * 1 || 0).toFixed(2));
    }

    return {
        addDataSource: addDataSource
    };
});
