/**
 *  Date                Author                  Description
 *  18 Mar 2026         Phu Pham			    Init, create file
 */
define([
    'N/runtime', 'N/search', 'N/format', 'N/query',
    'N/https', 'N/record', 'N/query',
    '../cons/scv_cons_eco_config.js',
    '../cons/scv_cons_crypto.js',
    '../cons/scv_cons_query.js',
    '../cons/scv_cons_eco_audit.js',
    '../cons/scv_cons_il_intmap.js',
    '../cons/scv_cons_il_external_map.js',
    '../cons/scv_cons_il_intaction.js',
    '../cons/scv_cons_il_integration_queue.js',
    '../cons/scv_cons_search.js',

    './scv_common_eco_service.js',
],
    function(
        runtime, search, format, query,
        https, record, query,
        constEcoCfg,
        constCrypto,
        constQuery,
        constEcoAudit,
        constIlIntMap,
        constILExternalMap,
        constIlIntAction,
        constIlIntQueue,
        constSearch,

        commonEcoService,
    ) {

        const PAGE_SIZE = 1000;
        const ThrowMessage = {
            RECORD_TYPE_REQUIRED: "Record Type is required. Please check it again.",
            SQL_QUERY_REQUIRED: "The SQL query string is null or empty. Please check it again.",
            SAVED_SEARCH_REQUIRED: "Saved search is null or empty. Please check it again.",
            REQ_BODY_REQUIRED: "Request body must not be empty.",
            RECORD_NOT_ELIGIBLE_FOR_UPDATE: "This record is not eligible for API update to the IL system.",
            RECORD_CLOSE_VALIDATION_FAILED: "This record failed close validation.",
            FUNCTION_INACTIVE: "This function is currently inactive."
        };

        const getkeySecretSalt = () => {
            return constEcoCfg.Records.KEY_SECRET_SALT;
        }

        const autoSyncCurRecordToIL = (recType, recId) => {
            let objIlIntMap = constIlIntMap.getDataIlIntMapByRecType(recType);
            if(!objIlIntMap?.id) return;
            let sqlQuery = objIlIntMap.custrecord_scv_il_intmap_sqlquery;
            
            let objRecData = queryDataSourceByRecId(sqlQuery, recId);
            if(!!objRecData?.id) {
                let auditId = syncDataToILByRecType({ objIlIntMap, objRecData });
                // log.error("auditId", auditId);
            }
        }

        const syncDataToILByRecType = ({ objIlIntMap, objRecData }) => {
            let recid = objRecData.id;
            let issync = toBoolean(objRecData.issync);
            if(issync === true && objIlIntMap?.custrecord_scv_il_intmap_action == constIlIntAction.Records.Create.ID) {
                throw new Error(ThrowMessage.RECORD_NOT_ELIGIBLE_FOR_UPDATE);
            }

            let rectype = objIlIntMap?.custrecord_scv_il_intmap_rectype || "";
            if(!rectype) throw new Error(ThrowMessage.RECORD_TYPE_REQUIRED);

            const objReqBody = getDataObjRecordSyncToIL({rectype, recid, issync, objRecData});
            let objCfgEconnect = getInfoEconnectConfig();

            // TODO: get setup call api
            let endpoint = objIlIntMap.custrecord_scv_il_intmap_endpoint;
            let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
            let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
            let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}` + endpoint;

            // TODO: call API
            // call API
            let objResponseBody = {};
            let isCreateRec = false;
            try {
                if(issync === false) {// create record
                    isCreateRec = true;
                    objResponseBody = callPostHttps(urlCallAPI, access_token, objReqBody);
                } else { // update record
                    objResponseBody = callPutHttps(urlCallAPI, access_token, objReqBody);
                }
            } catch (err) {
                objResponseBody = err;
            }

            // create audit
            let auditId = null;
            try {
                let isSuccess = objResponseBody?.success || false;

                let objCurIntQueue = constIlIntQueue.getCurrentExistsIntQueue(rectype, recid);
                let ilIntQueueId = objCurIntQueue.id;

                if(!objCurIntQueue.id && isSuccess === false) {
                    ilIntQueueId = constIlIntQueue.createRecord({
                        custrecord_scv_il_intqueue_rectype: rectype,
                        custrecord_scv_il_intqueue_recid: recid,
                    });
                } else if(!!objCurIntQueue.id) {
                    constIlIntQueue.updateRecord(objCurIntQueue, isSuccess);
                }

                let auditName = objReqBody.documentNo || objReqBody.name || objReqBody.supplierCode || objReqBody.itemCode || objReqBody.externalId || "";
                auditId = constEcoAudit.createEconnectAudit({
                    name: (!isCreateRec ? "Update" : "Create") + " " + objIlIntMap.name + ": " + auditName,
                    custrecord_scv_eco_audit_url: urlCallAPI, 
                    custrecord_scv_eco_audit_issuccess: isSuccess,
                    custrecord_scv_eco_audit_intqueue: ilIntQueueId,
                    custrecord_scv_eco_audit_recordtype: rectype, 
                    custrecord_scv_eco_audit_recordid: recid,
                    custrecord_scv_eco_audit_reqbody: objReqBody, 
                    custrecord_scv_eco_audit_response: objResponseBody,
                });
            } catch (err) {
                log.error("ERR: Create Eco Audit: ", err);
            }

            // save source externalid on ns
            if(!!objResponseBody?.data?.internalId && isCreateRec === true) {
                saveSourceExtOnNS({
                    rectype, recid,
                    objIlIntMap,
                    auditId,
                    externalId: objResponseBody.data.internalId
                });
            }

            return auditId;
        }

        const saveSourceExtOnNS = ({
            rectype, recid, auditId, externalId,
            objIlIntMap,
        }) => {
            try {
                // lưu trực tiếp trên record
                if(!!objIlIntMap.custrecord_scv_il_intmap_extsource_field) {
                    submitFieldExternalId({
                        rectype, recid,
                        fieldId: objIlIntMap.custrecord_scv_il_intmap_extsource_field,
                        externalId
                    });
                } 
                // lưu vào custom record (customlist, system record, ...)
                else {
                    constILExternalMap.createILExternalMap({
                        custrecord_scv_ilextmap_rectype: rectype,
                        custrecord_scv_ilextmap_recid: recid,
                        custrecord_scv_ilextmap_id: externalId
                    });
                }
            } catch (err) {
                log.error("ERROR Save External Id: ", err);
                constEcoAudit.updateAuditSaveExtErr(auditId, err);
            }
        };

        const submitFieldExternalId = ({
            rectype, recid,
            fieldId, externalId
        }) => {
            if(rectype === "itemlocationconfiguration") {
                const ilcRec = record.load({ type: rectype, id: recid });
                ilcRec.setValue(fieldId, externalId?.toString());
				let ilcId = ilcRec.save({enableSourcing: false, ignoreMandatoryFields: true});
            } else {
                let objValues = { [fieldId]: externalId?.toString() };

                record.submitFields({
                    type: rectype, 
                    id: recid, 
                    values: objValues
                });
            }
        }

        const closeValidationTransaction = ({
            type, tranid, externalId
        }) => {
            if(!["purchaseorder", "transferorder", "intercompanytransferorder"].includes(type)) {
                throw new Error(ThrowMessage.RECORD_CLOSE_VALIDATION_FAILED);
            }

            let objIlIntMap = constIlIntMap.getDataIlIntMapCloseValidationByType(type);
            if(objIlIntMap.isinactive === "T") {
                throw new Error(ThrowMessage.FUNCTION_INACTIVE);
            }

            let objCfgEconnect = getInfoEconnectConfig();
            const objReqBody = {
                externalId: externalId
            };

            // TODO: get setup call api
            let endpoint = objIlIntMap.custrecord_scv_il_intmap_endpoint;
            let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
            let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
            let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}` + endpoint;

            // TODO: call API
            let objResponseBody = {};
            try {
                objResponseBody = callPostHttps(urlCallAPI, access_token, objReqBody);
            } catch (err) {
                objResponseBody = err;
            }

            // create audit
            let auditId = null;
            let isSuccess = objResponseBody?.success || false;
            let auditName = objIlIntMap.name + ": " + tranid;

            try {
                auditId = constEcoAudit.createEconnectAudit({
                    name: auditName,
                    custrecord_scv_eco_audit_url: urlCallAPI, 
                    custrecord_scv_eco_audit_issuccess: isSuccess,
                    custrecord_scv_eco_audit_recordtype: type, 
                    custrecord_scv_eco_audit_recordid: externalId,
                    custrecord_scv_eco_audit_reqbody: objReqBody, 
                    custrecord_scv_eco_audit_response: objResponseBody,
                });
            } catch (err) {
                log.error("ERR: Create Eco Audit: ", err);
            }

            try {
                record.submitFields({
                    type: type, id: externalId, 
                    values: { 
                        custbody_scv_closed_verify_mess: objResponseBody?.message || "",
                        custbody_scv_verify_close: isSuccess,
                    },
                });
            } catch (err) {
                log.error("ERROR Save External Id: ", err);
                constEcoAudit.updateAuditSaveExtErr(auditId, err);
            }

            if(isSuccess === true && ["transferorder", "intercompanytransferorder"].includes(type)) {
				createWarehouseTOClose({type, tranid, externalId});
			}

            return auditId;
        }

        const getDataObjRecordSyncToIL = ({
            rectype = '', // string
            recid = '', // string
            issync, // boolean
            objRecData = {}, // object
        }) => {
            
            let objRes = {};

            let objSubMap = commonEcoService.getDataRecordSubsidiaryMap(rectype);
            if(rectype.slice(0, 10) === 'customlist') {
                objRes = commonEcoService.getDataReqBodyByCustomList(objRecData);
            } 
            else if(objSubMap.isSubMap === true) {
                objRes = commonEcoService.getDataReqBodyByRecSubMap(objRecData, objSubMap.fields);
            }
            else if(["costingmethodtype", "consolidatedratetype"].includes(rectype)) {
                objRes = commonEcoService.getDataReqBodyBySystemListItem(objRecData);
            }
            else if(["supplyreplenishmenttype", "locationtype"].includes(rectype)) {
                objRes = commonEcoService.getDataReqBodyBasicRecord(objRecData);
            }
            else {
                const handler = commonEcoService.getHandler(rectype);
                objRes = handler(objRecData, rectype);
            }

            // TODO: kiểm tra data request body trước khi submit
            if(Object.keys(objRes).length === 0) {
                throw new Error(ThrowMessage.REQ_BODY_REQUIRED);
            }
            return objRes;
        }

        const getDataSourceBySavedSearch = (_params, _searchId) => {
            if(!_searchId) throw new Error(ThrowMessage.SAVED_SEARCH_REQUIRED);

            let resultSearch = constSearch.loadSearchWithFilter({id: _searchId});
            resultSearch = resultSearch.runPaged({pageSize: 1000});

            let page = Number(_params.custpage_page || 1) - 1;
            let params = {page};

            let objRes = constSearch.getDataSourceFetchPage(_searchId, [], params);
            return {
                info: objRes.info,
                arrResult: objRes.arrResult.map(e => ({
                    ...e, isinactive: e.isinactive === true ? "T" : "F"
                }))
            };
        }

        const queryDataSourceByRecType = (_params, _sqlQuery) => {
            if(!_sqlQuery) throw new Error(ThrowMessage.SQL_QUERY_REQUIRED);

            let resultSearchFullPage = query.runSuiteQLPaged({
                query: _sqlQuery,
                pageSize: PAGE_SIZE
            });

            let page = Number(_params.custpage_page || 1) - 1;
            return constQuery.fetchResultSearchPage(resultSearchFullPage, {page});
        }

        const queryDataSourceByRecId = (_sqlQuery, _recid) => {
            if(!_sqlQuery) throw new Error(ThrowMessage.SQL_QUERY_REQUIRED);
            
            let newSqlQuery = removeOrderBy(_sqlQuery);
            
            if(!hasJoin(newSqlQuery)) {
                newSqlQuery = appendIdCondition(newSqlQuery, _recid);
            } else {
                newSqlQuery = `SELECT * FROM (\n
                    ${newSqlQuery})\n
                    WHERE id = ${_recid};`
            }

            // log.error("newSqlQuery", newSqlQuery);
            const resultQuery = query.runSuiteQL({
                query: newSqlQuery
            }).asMappedResults();
            
            return resultQuery[0] || {};
        }

        const createAccessToken = () => {
            let objCfgEco = getInfoEconnectConfig(false);
            let version = objCfgEco.custrecord_scv_itg_eco_cfg_version;

            let response = https.post({
                url: objCfgEco.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/auth/token`,
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "*/*"
                },
                body: JSON.stringify({
                    "username": objCfgEco.custrecord_scv_itg_eco_cfg_user,
                    "password": constCrypto.handlePasswordsSafely(objCfgEco.custrecord_scv_itg_eco_cfg_password, true, getkeySecretSalt())
                })
            });
            return getResponseBody(response);
        }

        const createWarehouseTOClose = ({type, tranid, externalId}) => {
            let resultSearch = constSearch.createSearchWithFilter({
                type: "transferorder",
                filters: [
                    ["type", "anyof", "TrnfrOrd"],
                    "AND",
                    ["mainline","is","T"],
                    "AND",
                    ["internalid", "anyof", externalId]
                ],
                columns: [
                    search.createColumn({
                        name: "custrecord_scv_location_code",
                        join: "location",
                        label: "location code",
                    }),
                    search.createColumn({
                        name: "custbody_scv_current_user_edit",
                        label: "user edit",
                    }),
                    search.createColumn({
                        name: "tranid",
                        label: "tranid",
                    }),
                ]
            });
        
            resultSearch = resultSearch.run().getRange(0, 1);
            if(resultSearch.length === 0) return;

            const objReqBody = {
                "warehouse": resultSearch[0].getValue({ name: "custrecord_scv_location_code", join: "location" }) || "",
                "document_number": resultSearch[0].getValue("tranid") || "",
                "close_by": resultSearch[0].getText("custbody_scv_current_user_edit") || "",
            };
            let objCfgEconnect = getInfoEconnectConfig();

            // TODO: get setup call api
            let access_token = objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token;
            let version = objCfgEconnect.custrecord_scv_itg_eco_cfg_version;
            let urlCallAPI = objCfgEconnect.custrecord_scv_itg_eco_cfg_url_api + `/api/${version}/transaction/warehouseTransferOrderClose`;

            // TODO: call API
            let objResponseBody = {};
            try {
                objResponseBody = callPostHttps(urlCallAPI, access_token, objReqBody);
            } catch (err) {
                objResponseBody = err;
            }

            let isSuccess = objResponseBody?.success || false;

            try {
                constEcoAudit.createEconnectAudit({
                    name: `Create Warehouse Transfer Order (TO) Close: ` + tranid,
                    custrecord_scv_eco_audit_url: urlCallAPI, 
                    custrecord_scv_eco_audit_issuccess: isSuccess,
                    custrecord_scv_eco_audit_recordtype: type, 
                    custrecord_scv_eco_audit_recordid: externalId,
                    custrecord_scv_eco_audit_reqbody: objReqBody, 
                    custrecord_scv_eco_audit_response: objResponseBody,
                });
            } catch (err) {
                log.error("ERR: Create Eco Audit: ", err);
            }
        }

        const callPutHttps = (urlCallAPI, access_token, body) => {
            let response = https.put({
                url: urlCallAPI,
                headers: getHeaderAPI(access_token),
                body: JSON.stringify(body)
            });
            return getResponseBody(response);
        }

        const callPostHttps = (urlCallAPI, access_token, body) => {
            let response = https.post({
                url: urlCallAPI,
                headers: getHeaderAPI(access_token),
                body: JSON.stringify(body)
            });
            return getResponseBody(response);
        }

        const getHeaderAPI = (access_token) =>  {
            let header = {};
            header['Content-Type'] = 'application/json';
            header['Accept'] = "*/*";
            header['Authorization']= `Bearer ${access_token}`;

            return header;
        }

        const getResponseBody = (_res) => {
            if(_res.code == 200) {
                let body = JSON.parse(_res.body);
                return body;
            }
            log.error("ECO-ERR-INFO", _res.body);

            if(_res.body) {
                return JSON.parse(_res.body);
            } else {
                return _res;
            }
        }

        function appendIdCondition(sqlQuery, recordId) {
            const hasWhere = /\bwhere\b/i.test(sqlQuery);

            return hasWhere
                ? `${sqlQuery} AND id = ${recordId}`
                : `${sqlQuery} WHERE id = ${recordId}`;
        }

        function hasJoin(sqlQuery) {
            if (!sqlQuery) return false;

            return /\b(inner|left)\s+join\b/i.test(sqlQuery);
        }

        function removeOrderBy(sqlQuery) {
            return sqlQuery
                .replace(/\border\s+by\b[\s\S]*$/i, '')
                .trim();
        }

        function toBoolean(value) {
            if (typeof value === 'boolean') return value;

            if(value === "T") return true;
            return false;
        }

        const getInfoEconnectConfig = (_syncToken = true) => {
            let siteAccount = runtime.accountId;

            let resultSearch = search.create({
                type: "customrecord_scv_itg_econnect_cfg",
                filters:
                [
                    ["isinactive","is","F"],
                    "AND",
                    ["custrecord_scv_itg_eco_cfg_siteaccount", "is", siteAccount]
                ],
                columns:
                [
                    "internalid", "name", "custrecord_scv_itg_eco_cfg_url_api", "custrecord_scv_itg_eco_cfg_user", "custrecord_scv_itg_eco_cfg_password", 
                    "custrecord_scv_itg_eco_cfg_access_token", "custrecord_scv_itg_eco_cfg_expired", "custrecord_scv_itg_eco_cfg_siteaccount",
                    "custrecord_scv_itg_eco_cfg_version"
                ]
            });
            let myColumns = resultSearch.columns;
            resultSearch = resultSearch.run().getRange(0, 1);

            if(resultSearch.length == 0) return;

            let objCfgEconnect = {
                id: resultSearch[0].getValue(myColumns[0]),
                name: resultSearch[0].getValue(myColumns[1]),
                custrecord_scv_itg_eco_cfg_url_api: resultSearch[0].getValue(myColumns[2]),
                custrecord_scv_itg_eco_cfg_user: resultSearch[0].getValue(myColumns[3]),
                custrecord_scv_itg_eco_cfg_password: resultSearch[0].getValue(myColumns[4]),
                custrecord_scv_itg_eco_cfg_access_token: resultSearch[0].getValue(myColumns[5]),
                custrecord_scv_itg_eco_cfg_expired: resultSearch[0].getValue(myColumns[6]),
                custrecord_scv_itg_eco_cfg_siteaccount: resultSearch[0].getValue(myColumns[7]),
                custrecord_scv_itg_eco_cfg_version: resultSearch[0].getValue(myColumns[8])
            };

            if(!_syncToken) return objCfgEconnect;

            let today = new Date();
            let expdt = new Date();
            if(!!objCfgEconnect.custrecord_scv_itg_eco_cfg_expired){
                expdt = format.parse({value: objCfgEconnect.custrecord_scv_itg_eco_cfg_expired, type: "datetime"});
            }
            
            if (expdt.getTime() > today.getTime())  return objCfgEconnect;

            let objAccessToken = createAccessToken(objCfgEconnect.id);
            if(!objAccessToken.token) return objCfgEconnect;


            let expiry = new Date(objAccessToken.expiry);
            record.submitFields({
                type: "customrecord_scv_itg_econnect_cfg",
                id: objCfgEconnect.id,
                values: {
                    custrecord_scv_itg_eco_cfg_access_token: objAccessToken.token,
                    custrecord_scv_itg_eco_cfg_expired: expiry
                }
            });

            objCfgEconnect.custrecord_scv_itg_eco_cfg_access_token = objAccessToken.token;
            objCfgEconnect.custrecord_scv_itg_eco_cfg_expired = expiry;
            return objCfgEconnect;
        }

        const getRandomNumber = () => {
            let random = Math.floor(Math.random() * 9999) + 1;
            random = random.toString().padStart(4, '0');
            return random;
        }

        return {            
            getkeySecretSalt,
            getRandomNumber,

            getInfoEconnectConfig,
            createAccessToken,
            
            getDataSourceBySavedSearch,
            queryDataSourceByRecType,
            queryDataSourceByRecId,

            autoSyncCurRecordToIL,
            syncDataToILByRecType,
            closeValidationTransaction,
        };
    });
    