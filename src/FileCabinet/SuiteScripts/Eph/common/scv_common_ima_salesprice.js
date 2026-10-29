/**
 *  Date                Author                  Description
 *  18 Mar 2026         Phu Pham			    Init, create file
 */
define([
    'N/search',
    '../lib/scv_lib_function.js',
    '../cons/scv_cons_format.js',
    '../cons/scv_cons_currency.js',
],
    function(
        search,
        lbf,
        constFormat,
        constCurrency,
    ) {

        const beforeSubmit_CalcPriceBefTax = (curRec) => {
            let currency = curRec.getValue("currency");
            let price_af_tax = curRec.getValue("custrecord_scv_price_af_tax");
            let relatedIma = curRec.getValue("custrecord_scv_ima_sa_price_rel_ima");
            let relatedItem = curRec.getValue("custrecord_scv_ima_sa_price_item");
            if(!relatedIma && !relatedItem) return;

            let tax_rate = 0;
            if(!!relatedIma) {
                let imaLKF = search.lookupFields({
                    type: "customrecord_scv_item_ma",
                    id: relatedIma,
                    columns: ["custrecord_scv_ima_tax_rate"]
                });

                tax_rate = Number(imaLKF?.custrecord_scv_ima_tax_rate || 0);
            } else if(!!relatedItem) {
                let itemLKF = search.lookupFields({
                    type: lbf.getItemRecordType(relatedItem),
                    id: relatedItem,
                    columns: ["custitem_scv_item_tax_rate"]
                });
                
                tax_rate = Number(itemLKF?.custitem_scv_item_tax_rate || 0);
            }

            let price_bf_tax = calcPriceBeforeTaxSalesPrice({
                currency, price_af_tax, tax_rate
            });
            curRec.setValue("custrecord_scv_ima_sa_price_bf_tax", price_bf_tax);
        }

        const calcPriceBeforeTaxSalesPrice = ({
            currency, 
            price_af_tax, 
            tax_rate
        }) => {
            let precision = currency == constCurrency.RECORDS.VND.ID ? 0 : 2;
            let price_bf_tax = price_af_tax / (1 + Number(tax_rate / 100));
            return constFormat.roundNumber(price_bf_tax, precision);
        }

        return {
            beforeSubmit_CalcPriceBefTax,
            calcPriceBeforeTaxSalesPrice,
        }
    });
    