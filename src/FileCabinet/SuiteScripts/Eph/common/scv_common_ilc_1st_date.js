/**
 *  Viết tắt: ILC -> Item Location Configuration
 *  Nội dung: Update 1st date (Item Receipt, Sales Order, Purchase Order) for Item Location
 *  =======================================================================================
 *  Date                Author                  Description
 *  28 May 2026         Phu Pham			    Init, create file
 */
define([
    'N/query'
],
    function(
        query
    ) {
        // ILC filters
        const getDataILC_NullReceiDate = (isAllResult = false) => {
            let sqlQuery = `SELECT 
                id,
                item, 
                location,
                custrecord_scv_1st_receved_date
            FROM itemlocationconfiguration
            WHERE custrecord_scv_1st_receved_date IS NULL`;

            if(isAllResult === true) {
                return getAllSuiteQLResults(sqlQuery);
            }

            const resultQuery = query.runSuiteQL({
                query: sqlQuery
            });

            return resultQuery.asMappedResults();
        }

        const getDataILC_NullSalesDate = (isAllResult = false) => {
            let sqlQuery = `SELECT 
                id,
                item, 
                location,
                custrecord_scv_1st_sales_date
            FROM itemlocationconfiguration
            WHERE custrecord_scv_1st_sales_date IS NULL`;

            if(isAllResult === true) {
                return getAllSuiteQLResults(sqlQuery);
            }

            const resultQuery = query.runSuiteQL({
                query: sqlQuery
            });

            return resultQuery.asMappedResults();
        }

        const getDataILC_NullPurchaseDate = (isAllResult = false) => {
            let sqlQuery = `SELECT 
                id,
                item, 
                location,
                custrecord_scv_1st_purchase_date
            FROM itemlocationconfiguration
            WHERE custrecord_scv_1st_purchase_date IS NULL`;

            if(isAllResult === true) {
                return getAllSuiteQLResults(sqlQuery);
            }

            const resultQuery = query.runSuiteQL({
                query: sqlQuery
            });

            return resultQuery.asMappedResults();
        }

        // ILC Update 1st date
        const getDataILC_UpdateReceiDate = (isAllResult = false) => {
            // bỏ điều kiện này vì ILC ko có item type này
            // TransactionLine.itemtype != 'ShipItem'
            const sqlQuery = `SELECT
                ilc.id,
                ilc.item,
                ilc.location,
                ilc.custrecord_scv_1st_receved_date,
                MIN(Transaction.trandate) AS first_received_date
            FROM
                itemlocationconfiguration ilc
            INNER JOIN
                TransactionLine ON TransactionLine.item = ilc.item
                    AND TransactionLine.location = ilc.location
            INNER JOIN
                Transaction ON Transaction.id = TransactionLine.transaction
            WHERE
                ilc.custrecord_scv_1st_receved_date IS NULL
                AND Transaction.type = 'ItemRcpt'
                AND TransactionLine.mainline = 'F'
                AND TransactionLine.iscogs = 'F'
                AND TransactionLine.taxline = 'F'
                AND TransactionLine.kitmemberof IS NULL
            GROUP BY
                ilc.id,
                ilc.item,
                ilc.location,
                ilc.custrecord_scv_1st_receved_date
            ORDER BY ilc.id ASC`;

            if(isAllResult === true) {
                return getAllSuiteQLResults(sqlQuery);
            }

            const resultQuery = query.runSuiteQL({
                query: sqlQuery
            });

            return resultQuery.asMappedResults();
        }

        const getDataILC_UpdatePurchDate = (isAllResult = false) => {
            const sqlQuery = `SELECT
                ilc.id,
                ilc.item,
                ilc.location,
                ilc.custrecord_scv_1st_purchase_date,
                MIN(Transaction.trandate) AS first_purchase_date
            FROM
                itemlocationconfiguration ilc
            INNER JOIN
                TransactionLine ON TransactionLine.item = ilc.item
                    AND TransactionLine.location = ilc.location
            INNER JOIN
                Transaction ON Transaction.id = TransactionLine.transaction
            WHERE
                ilc.custrecord_scv_1st_purchase_date IS NULL
                AND Transaction.type = 'PurchOrd'
                AND TransactionLine.mainline = 'F'
                AND TransactionLine.iscogs = 'F'
                AND TransactionLine.taxline = 'F'
                AND TransactionLine.kitmemberof IS NULL
            GROUP BY
                ilc.id,
                ilc.item,
                ilc.location,
                ilc.custrecord_scv_1st_purchase_date
            ORDER BY ilc.id ASC`;

            if(isAllResult === true) {
                return getAllSuiteQLResults(sqlQuery);
            }

            // lay 5000 line dau tien
            const resultQuery = query.runSuiteQL({
                query: sqlQuery
            });

            return resultQuery.asMappedResults();
        }

        const getDataILC_UpdateSalesDate = (isAllResult = false) => {
            const sqlQuery = `SELECT
                ilc.id,
                ilc.item,
                ilc.location,
                ilc.custrecord_scv_1st_sales_date,
                MIN(t.trandate) AS first_sales_date
            FROM
                itemlocationconfiguration ilc
            INNER JOIN
                TransactionLine tl
                    ON tl.item = ilc.item
                AND tl.location = ilc.location
            INNER JOIN
                Transaction t
                    ON t.id = tl.transaction
                AND t.type IN ('ItemShip', 'CashSale', 'CustInvc')
            WHERE
                ilc.custrecord_scv_1st_sales_date IS NULL
                AND tl.mainline = 'F'
                AND tl.iscogs = 'F'
                AND tl.taxline = 'F'
                AND tl.kitmemberof IS NULL
                AND (
                    tl.createdfrom IS NULL
                    OR EXISTS (
                        SELECT 1
                        FROM Transaction source
                        WHERE source.id = tl.createdfrom
                        AND source.type IN ('SalesOrd', 'RtnAuth')
                    )
                )
            GROUP BY
                ilc.id,
                ilc.item,
                ilc.location,
                ilc.custrecord_scv_1st_sales_date`;

            if(isAllResult === true) {
                return getAllSuiteQLResults(sqlQuery);
            }

            // lay 5000 line dau tien
            const resultQuery = query.runSuiteQL({
                query: sqlQuery
            });

            return resultQuery.asMappedResults();
        }

        // saved search convert suiteql
        const getDataMinReceiveDate = () => {
            const resultQuery = query.runSuiteQL({
                query: `SELECT
                    TransactionLine.location,
                    TransactionLine.item,
                    MIN(Transaction.trandate) AS trandate
                FROM
                    Transaction
                INNER JOIN
                    TransactionLine ON Transaction.id = TransactionLine.transaction
                WHERE
                    Transaction.type = 'ItemRcpt'
                    AND TransactionLine.mainline = 'F'
                    AND TransactionLine.iscogs = 'F'
                    AND TransactionLine.taxline = 'F'
                    AND TransactionLine.itemtype != 'ShipItem'
                    AND TransactionLine.kitmemberof IS NULL
                GROUP BY
                    TransactionLine.location,
                    TransactionLine.item`
            });
    
            return resultQuery.asMappedResults();
        }

        const getDataMinPurchaseDate = () => {
            const resultQuery = query.runSuiteQL({
                query: `SELECT
                    TransactionLine.location,
                    TransactionLine.item,
                    MIN(Transaction.trandate) AS trandate
                FROM
                    Transaction
                INNER JOIN
                    TransactionLine ON Transaction.id = TransactionLine.transaction
                WHERE
                    Transaction.type = 'PurchOrd'
                    AND TransactionLine.mainline = 'F'
                    AND TransactionLine.iscogs = 'F'
                    AND TransactionLine.taxline = 'F'
                    AND TransactionLine.kitmemberof IS NULL
                GROUP BY
                    TransactionLine.location,
                    TransactionLine.item`
            });
    
            return resultQuery.asMappedResults();
        }

        const getDataMinSalesDate = () => {
            const resultQuery = query.runSuiteQL({
                query: `SELECT
                    tl.location,
                    tl.item,
                    MIN(t.trandate) AS trandate
                FROM
                    TransactionLine tl
                INNER JOIN
                    Transaction t ON t.id = tl.transaction
                        AND t.type IN ('ItemShip', 'CashSale')
                WHERE
                    tl.mainline = 'F'
                    AND tl.iscogs = 'F'
                    AND tl.taxline = 'F'
                    AND tl.kitmemberof IS NULL
                    AND (
                        tl.createdfrom IS NULL
                        OR EXISTS (
                            SELECT 1
                            FROM Transaction source
                            WHERE source.id = tl.createdfrom
                            AND source.type = 'SalesOrd'
                        )
                    )
                GROUP BY
                    tl.location,
                    tl.item`
            });
    
            return resultQuery.asMappedResults();
        }

        // all results suiteql
        const getAllSuiteQLResults = (sqlQuery, queryParams = []) => {
            const records = [];
            let paginatedRowBegin = 1;
            let paginatedRowEnd = 5000;
            let moreRecords = true;

            do {
                const paginatedSQL = `SELECT * FROM (
                        SELECT ROWNUM AS ROWNUMBER, * FROM (${sqlQuery})
                    )
                    WHERE ROWNUMBER BETWEEN ${paginatedRowBegin} AND ${paginatedRowEnd}`;

                const queryResults = query.runSuiteQL({ 
                    query: paginatedSQL, 
                    params: queryParams 
                }).asMappedResults();

                records.push(...queryResults);

                if (queryResults.length < 5000) {
                    moreRecords = false;
                } else {
                    paginatedRowBegin += 5000;
                    paginatedRowEnd += 5000;
                }

            } while (moreRecords);

            return records;
        };

        return {
            getDataILC_NullReceiDate,
            getDataILC_NullSalesDate,
            getDataILC_NullPurchaseDate,

            getDataILC_UpdateReceiDate,
            getDataILC_UpdatePurchDate,
            getDataILC_UpdateSalesDate,

            getDataMinReceiveDate,
            getDataMinPurchaseDate,
            getDataMinSalesDate,

            getAllSuiteQLResults,
        }; 
    });
    