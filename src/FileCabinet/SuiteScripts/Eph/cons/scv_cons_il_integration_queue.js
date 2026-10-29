/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  12 Jun 2026		    Phu Pham			    Init, create file
 */
define([
    'N/query', 'N/record',
    './scv_cons_il_retry_status.js',
],
    function(
        query, record,
        constIlRetryStatus,
    ) {

        const Records = {

        };

        const Fields = {
            ID: "id",
            INACTIVE: "isinactive",
            NAME: "name",
        };

        const NEXT_TIME_RETRY = (15 * 60 * 1000);

        const getDataRetryApiIntQueue = (_timestamp) => {
            const arrRetryStatus = [
                constIlRetryStatus.Records.Pending.ID,
                constIlRetryStatus.Records.Processing.ID,
            ];

            const resultQuery = query.runSuiteQL({
                query: `SELECT 
                    id, 
                    custrecord_scv_il_intqueue_recid,
                    custrecord_scv_il_intqueue_rectype,
                    custrecord_scv_il_intqueue_retrystatus,
                    custrecord_scv_il_intqueue_retrycount,
                    custrecord_scv_il_intqueue_timestamp,
                    custrecord_scv_il_intqueue_nexttime
                FROM customrecord_scv_il_integration_queue
                WHERE isinactive = 'F'
                    AND custrecord_scv_il_intqueue_retrystatus IN (${arrRetryStatus.join(", ")})
                    AND NVL(TO_NUMBER(custrecord_scv_il_intqueue_timestamp), 0) <= ${_timestamp}
                `
            }).asMappedResults();
            
            return resultQuery;
        }

        const getCurrentExistsIntQueue = (rectype, recid) => {
            const arrRetryStatus = [
                constIlRetryStatus.Records.Pending.ID,
                constIlRetryStatus.Records.Processing.ID,
            ];

            const resultQuery = query.runSuiteQL({
                query: `SELECT 
                    id, 
                    custrecord_scv_il_intqueue_recid,
                    custrecord_scv_il_intqueue_rectype,
                    custrecord_scv_il_intqueue_retrystatus,
                    custrecord_scv_il_intqueue_retrycount,
                    custrecord_scv_il_intqueue_timestamp,
                    custrecord_scv_il_intqueue_nexttime
                FROM customrecord_scv_il_integration_queue
                WHERE isinactive = 'F' 
                    AND custrecord_scv_il_intqueue_rectype = '${rectype}'    
                    AND custrecord_scv_il_intqueue_recid = '${recid}'
                    AND custrecord_scv_il_intqueue_retrystatus IN (${arrRetryStatus.join(", ")})
                `
            }).asMappedResults();
            
            return resultQuery[0] || {};
        }

        const createRecord = ({
            custrecord_scv_il_intqueue_rectype = "",
            custrecord_scv_il_intqueue_recid = "",
            custrecord_scv_il_intqueue_retrystatus = constIlRetryStatus.Records.Pending.ID,
            custrecord_scv_il_intqueue_retrycount = 0,
            nowDate = 0
        }) => {
            try {
                let ilIntQueueRec = record.create({
                    type: "customrecord_scv_il_integration_queue"
                });

                let nowDate = Date.now();
                let timestamp = nowDate + NEXT_TIME_RETRY;
                let nexttime = new Date(timestamp);

                ilIntQueueRec.setValue("custrecord_scv_il_intqueue_rectype", custrecord_scv_il_intqueue_rectype);
                ilIntQueueRec.setValue("custrecord_scv_il_intqueue_recid", custrecord_scv_il_intqueue_recid);
                ilIntQueueRec.setValue("custrecord_scv_il_intqueue_retrystatus", custrecord_scv_il_intqueue_retrystatus);
                ilIntQueueRec.setValue("custrecord_scv_il_intqueue_retrycount", custrecord_scv_il_intqueue_retrycount);
                ilIntQueueRec.setValue("custrecord_scv_il_intqueue_nexttime", nexttime);
                ilIntQueueRec.setValue("custrecord_scv_il_intqueue_timestamp", Math.floor(timestamp / 1000));

                let ilIntQueueId = ilIntQueueRec.save({enableSourcing: false, ignoreMandatoryFields: true});
                return ilIntQueueId;
            } catch(err) {
                log.error("ERROR Create Integration Queue", err);
                return null;
            }
        }

        const updateRecord = (objCurIntQueue, isSuccess) => {
            try {
                let retrystatus = constIlRetryStatus.Records.Processing.ID;
                let retrycount = (objCurIntQueue.custrecord_scv_il_intqueue_retrycount * 1) + 1;

                if(isSuccess === true) {
                    retrystatus = constIlRetryStatus.Records.Success.ID;
                } else if(isSuccess === false && retrycount === 3) {
                    retrystatus = constIlRetryStatus.Records.PermanentFailed.ID;
                }

                let objValues = {
                    custrecord_scv_il_intqueue_retrystatus: retrystatus,
                    custrecord_scv_il_intqueue_retrycount: retrycount,
                };

                if(isSuccess === false && retrycount < 3) {
                    let nowDate = Date.now();
                    let timestamp = nowDate + NEXT_TIME_RETRY;
                    let nexttime = new Date(timestamp);

                    objValues.custrecord_scv_il_intqueue_nexttime = nexttime;
                    objValues.custrecord_scv_il_intqueue_timestamp = Math.floor(timestamp / 1000);
                }

                record.submitFields({
                    type: "customrecord_scv_il_integration_queue", 
                    id: objCurIntQueue.id,
                    values: objValues,
                    options: {
                        enableSourcing: false, ignoreMandatoryFields: true
                    }
                });
            } catch (err) {
                log.error("ERROR Update Integration Queue", err);
            }
        }

        return {
            Type: "customrecord_scv_il_integration_queue",
            Records,
            Fields,

            getDataRetryApiIntQueue,
            getCurrentExistsIntQueue,
            createRecord,
            updateRecord,
        };
    });
    