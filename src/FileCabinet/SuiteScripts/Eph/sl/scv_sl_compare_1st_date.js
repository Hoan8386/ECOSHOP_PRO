/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
    'N/record', 'N/search',
    '../cons/scv_cons_form.js',
    '../cons/scv_cons_format.js',

    '../cons/scv_cons_search_recieve_date_it_lo.js',
    '../cons/scv_cons_search_sale_date_it_lo.js',
    '../cons/scv_cons_search_1st_purchase_date_it_lo.js',
],
    (
        record, search,
        constForm,
        constFormat,

        searchReceiveDate,
        searchSalesDate,
        searchPurchaseDate,
    ) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            constForm.setContext(scriptContext);

            let request = scriptContext.request;
            let params = request.parameters;
            // render ui
            if(request.method == "GET"){
                onCreateFormUI(params);
                constForm.writePage();
            }
        }

        const onCreateFormUI = (params) => {
            constForm.createForm({title: "Compare 1st Date"});
            const arrResult = [];

            // get data current record
            const ilcRec = record.load({type: params.rectype, id: params.recid});
            let objCur = getData1stDateCur(ilcRec);
            arrResult.push(objCur);
            // get data saved search 1st date
            let objMinDate = getDataSSTransMinDate(ilcRec);
            arrResult.push(objMinDate);

            // add sublist 
            const columns = getDataColumn1stDate();
            let sublistId = "custpage_sl_result";

            let sublist = constForm.addSublist({id: sublistId, type: "LIST", label: 'Result'});
            constForm.addFieldOfSublist(sublistId, columns);
            constForm.setDataOfSublist(sublistId, arrResult);
        }

        const getDataSSTransMinDate = (ilcRec) => {
            let item = ilcRec.getValue("item");
            let location = ilcRec.getValue("location");

            const filters = [
                search.createFilter({
                    name: "item", operator: "anyof", values: item
                }),
                search.createFilter({
                    name: "location", operator: "anyof", values: location
                }),
            ];

            let arrReceiveDate = searchReceiveDate.getDataSource(filters);
            let arrSalesDate = searchSalesDate.getDataSource(filters);
            let arrPurchaseDate = searchPurchaseDate.getDataSource(filters);

            return {
                description: "Min Date (Saved Search)",
                receive_date: arrReceiveDate?.[0]?.trandate || "",
                sales_date: arrSalesDate?.[0]?.trandate || "",
                purchase_date: arrPurchaseDate?.[0]?.trandate || "",
            };
        }

        const getDataColumn1stDate = () => {
            return [
                {id: "description", label: "Description", type: "text"},
                {id: "receive_date", label: "1st Received Date", type: "text"},
                {id: "sales_date", label: "1st Sales Date", type: "text"},
                {id: "purchase_date", label: "1st Purchase Date", type: "text"},
            ];
        }

        const getData1stDateCur = (ilcRec) => {
            let receiveDate = ilcRec.getValue("custrecord_scv_1st_receved_date");
            let salesDate = ilcRec.getValue("custrecord_scv_1st_sales_date");
            let purchaseDate = ilcRec.getValue("custrecord_scv_1st_purchase_date");

            return {
                description: "Current Record",
                receive_date: constFormat.formatDate(receiveDate),
                sales_date: constFormat.formatDate(salesDate),
                purchase_date: constFormat.formatDate(purchaseDate),
            };
        };

        return {onRequest}

    });
