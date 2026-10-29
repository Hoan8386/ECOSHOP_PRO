/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  29 Oct 2025         Phu Pham			    Init, create file
 */
define([
    'N/query', 'N/format', 'N/search', 'N/record',
    '../cons/scv_cons_search.js',
],
    (
        query, format, search, record,
        constSearch,
    ) => {

        const TYPE = "customrecord_scv_itg_econnect_audit";

        const FIELD = {
            ID: "id",
            INACTIVE: "isinactive",
            NAME: "name"
        };

        const OVERDUE_DAYS = 180;
        const OVERDUE_RECORD_TYPES = [
            'subsidiary', 'location', 'customer', 'contact', 'employee', 'vendor', 
            'taxschedule', 'salestaxitem', 'department', 'classification', 'account', 
            'assemblyitem', 'inventoryitem', 'purchaseorder', 'transferorder', 
            'intercompanytransferorder', 'customrecord_scv_plu_barcode_no',
            'itemlocationconfiguration', 'customrecord_atlas_inv_adj_reasn', 
            'customrecordscv_inv_adj_reason_map', 'customrecord_scv_purchase_price_detail', 
            'customrecord_scv_po_trans_code_map', 'customrecord_scv_ito_trans_code_map'
        ];

        const getDataEconnectAuditToDelete = () => {
            let overdue_date = getOverdueDate();
            if(!overdue_date) return {overdue_date: null, records: []};

            let sqlQuery = `SELECT 
                id, name, created, custrecord_scv_eco_audit_file_request, 
                custrecord_scv_eco_audit_file_response,
                custrecord_scv_eco_audit_recordid,
                custrecord_scv_eco_audit_recordtype
            FROM customrecord_scv_itg_econnect_audit
            WHERE 
                custrecord_scv_eco_audit_recordtype IN ('${OVERDUE_RECORD_TYPES.join("', '")}')
                AND created < TO_DATE('${overdue_date}', 'DD/MM/YYYY')
            ORDER BY id ASC`;

            const pagedData = query.runSuiteQLPaged({ query: sqlQuery, pageSize: 1000 });
            let records = [];

            pagedData.pageRanges.forEach(function(pageRange) {
                let page = pagedData.fetch({ index: pageRange.index });
                let pageResults = page.data.asMappedResults();
                records = records.concat(pageResults);
            });

            return {overdue_date, records};
        }

        const getOverdueDate = () => {
            let nowUtc = new Date();
            // 7 gio sang Viet Nam (+13 boi vi gio chay la luc 1 gio sang)
            let gmt7 = new Date(nowUtc.getTime() + 13 * 60 * 60 * 1000);
            gmt7.setDate(gmt7.getDate() - OVERDUE_DAYS);

            let overdue_date = format.format({ value: gmt7, type: "date" });
            return overdue_date;
        }

        const isAuditRecordSynced = (_recType, _recId) => {
            if(!_recType || !_recId) return [];

            let resultSearch = constSearch.createSearchWithFilter({
                type: "customrecord_scv_itg_econnect_audit",
                filters: [
                    ['custrecord_scv_eco_audit_issuccess', 'is', 'T'],
                    "AND",
                    ['custrecord_scv_eco_audit_recordtype', 'is', _recType],
                    "AND",
                    ['custrecord_scv_eco_audit_recordid', 'is', _recId],
                ],
                columns: [
                    search.createColumn({name: 'custrecord_scv_eco_audit_recordid', summary: search.Summary.GROUP}),
                    search.createColumn({name: 'internalid', summary: search.Summary.MAX}),
                    search.createColumn({name: 'custrecord_scv_eco_audit_recordtype', summary: search.Summary.GROUP}),
                ]
            });

            resultSearch = resultSearch.run().getRange(0, 1);
            return resultSearch.length > 0;
        }

        const getLatestSyncedAuditRecord = (_recType, _recId) => {
            if(!_recType || !_recId) return [];

            let sqlQuery = `SELECT 
                custrecord_scv_eco_audit_recordid,
                MAX(id) AS id,
                custrecord_scv_eco_audit_recordtype
            FROM customrecord_scv_itg_econnect_audit
            WHERE 
                custrecord_scv_eco_audit_issuccess = 'T'
                AND isinactive = 'F'
                AND custrecord_scv_eco_audit_recordtype = '${_recType}'
                AND custrecord_scv_eco_audit_recordid IN ('${_recId}')
            GROUP BY 
                custrecord_scv_eco_audit_recordid,
                custrecord_scv_eco_audit_recordtype`;
            
            let resultQuery = query.runSuiteQL({ query: sqlQuery });
            return resultQuery.asMappedResults();
        }

        const getDataSource = (_filters) => {
            let resultSearch =  constSearch.createSearchWithFilter({
                type: "customrecord_scv_itg_econnect_audit",
                filters:
                [
                    ["isinactive","is","F"]
                ],
                columns:
                [
                    "internalid", "name",
                    "custrecord_scv_eco_audit_url", "custrecord_scv_eco_audit_issuccess",
                    "custrecord_scv_eco_audit_recordtype", "custrecord_scv_eco_audit_recordid",
                    "custrecord_scv_eco_audit_reqbody", "custrecord_scv_eco_audit_response",
                    "custrecord_scv_eco_audit_saveexterr"
                ]
            }, _filters);
            
            resultSearch = resultSearch.runPaged({pageSize: 1000});

            let arrResult = constSearch.fetchResultSearchAllPage(resultSearch, function(_objTmpl, _column){
                return constSearch.getObjResultFromSearchByKey(_objTmpl, _column, [
                    "internalid", "name",
                    "custrecord_scv_eco_audit_url", "custrecord_scv_eco_audit_issuccess",
                    "custrecord_scv_eco_audit_recordtype", "custrecord_scv_eco_audit_recordid",
                    "custrecord_scv_eco_audit_reqbody", "custrecord_scv_eco_audit_response",
                    "custrecord_scv_eco_audit_saveexterr"
                ]);
            });
            
            return arrResult;
        }

        const createEconnectAudit = ({
            name = "",
            custrecord_scv_eco_audit_url = "", 
            custrecord_scv_eco_audit_issuccess = "",
            custrecord_scv_eco_audit_recordtype = "", 
            custrecord_scv_eco_audit_recordid = "",
            custrecord_scv_eco_audit_reqbody = "", 
            custrecord_scv_eco_audit_response = "",
        }) =>{
            let ecoAuditRec = record.create({
                type: "customrecord_scv_itg_econnect_audit", isDynamic: true
            });

            let reqBody = custrecord_scv_eco_audit_reqbody;
            let response = custrecord_scv_eco_audit_response;

            // if(!!reqBody.details) {
            //     reqBody.details = reqBody.details.slice(0, 1000);
            // }
            // if(!!response.details) {
            //     response.details = response.details.slice(0, 1000);
            // }

            ecoAuditRec.setValue("name", name);
            ecoAuditRec.setValue("custrecord_scv_eco_audit_url", custrecord_scv_eco_audit_url);
            ecoAuditRec.setValue("custrecord_scv_eco_audit_issuccess", custrecord_scv_eco_audit_issuccess);
            ecoAuditRec.setValue("custrecord_scv_eco_audit_recordtype", custrecord_scv_eco_audit_recordtype);
            ecoAuditRec.setValue("custrecord_scv_eco_audit_recordid", custrecord_scv_eco_audit_recordid);
            try {
                ecoAuditRec.setValue("custrecord_scv_eco_audit_reqbody", JSON.stringify(reqBody));
            } catch (err) {
                delete reqBody.details;
                ecoAuditRec.setValue("custrecord_scv_eco_audit_reqbody", JSON.stringify({
                    ...reqBody,
                    error_details: err
                }));
            }

            try {
                ecoAuditRec.setValue("custrecord_scv_eco_audit_response", JSON.stringify(response));
            } catch (err) {
                delete response.details;
                ecoAuditRec.setValue("custrecord_scv_eco_audit_response", JSON.stringify({
                    ...response,
                    error_details: err
                }));
            }

            let auditId = ecoAuditRec.save({enableSourcing: false, ignoreMandatoryFields: true});
            return auditId;
        }

        const updateAuditSaveExtErr = (auditId, error) => {
            if(typeof(error) == "object"){
                error = JSON.stringify(error);
            }
            
            record.submitFields({
                type: "customrecord_scv_itg_econnect_audit",
                id: auditId,
                values: {
                    custrecord_scv_eco_audit_saveexterr: error
                }
            });
        }

        return {
            TYPE,
            FIELD,

            isAuditRecordSynced,
            getLatestSyncedAuditRecord,
            getDataEconnectAuditToDelete,

            // TODO: 20260414
            getDataSource,
            createEconnectAudit,
            updateAuditSaveExtErr,
        };
    });
    