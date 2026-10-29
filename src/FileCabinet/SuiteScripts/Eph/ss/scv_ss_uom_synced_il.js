/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define([
    'N/runtime', 'N/record',
    '../cons/scv_cons_queue_job.js',
    '../cons/scv_cons_il_global_srcext.js',
    '../cons/scv_cons_il_intmap.js',
    
    '../common/scv_common_unitstype.js',
    '../common/scv_common_itg_econnect.js',
],
    (
        runtime, record,
        constQueueJob,
        constIlGlobalSrcExt,
        constIlIntMap,

        commonUnitsType,
        commonItgEco,
    ) => {

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */

        const GlobalAction = {
            CREATE: "create",
            UPDATE: "update"
        };

        const LIMIT_REMAIN_USAGE = 200;

        const execute = (scriptContext) => {
            let curScript = runtime.getCurrentScript();

            let paramsInput = curScript.getParameter({name : commonUnitsType.ScheduledScript.INPUT_PARAM});
            paramsInput = !!paramsInput ? JSON.parse(paramsInput) : {};

            if(paramsInput.fromScript === "USER_EVENT") {
                executeJobFromUserEvent(curScript, paramsInput);
            } else if(paramsInput.fromScript === "RESTLET") {
                executeJobRestlet(curScript, paramsInput);
            }
        }

        const executeJobRestlet = (curScript, paramsInput) => {
            let {arrNewUOM, rectype, recid, fromScript} = paramsInput;
            const unitsTypeRec = record.load({type: rectype, id: recid, isDynamic: true});
            
            let msg_note = "Start Date: " + (new Date()).toISOString();
            msg_note += "\nSynced Data Units Type and UOM To IL";
            constQueueJob.updateNoteQueueJob(curScript.id, curScript.deploymentId, msg_note);

            let objIlIntMap = {};
            let arrResUOM = [];
            try {
                let arrUOM = commonUnitsType.getDataSublistUOM(unitsTypeRec);
                syncUomGlobalSourceExternal(unitsTypeRec, arrNewUOM, arrUOM);
                // commonUnitsType.autoSyncUnitsTypeToIL(unitsTypeRec);

                // sync unit type uom
                objIlIntMap = constIlIntMap.getDataIlIntMapByRecType("unitstypeuom");
                if(!objIlIntMap?.id) return;

                let arrUOMILMap = commonUnitsType.getDataUOMILExternalMapByRecId(unitsTypeRec.id);
                let arrGlobalSource = constIlGlobalSrcExt.getDataILGlobalSrcExtByParent(recid, "custrecord_scv_ilglobal_srcext_unittype");

                let currentRemain = getRemainingUsage();

                for(let i = 0; i < arrUOM.length; i++) {
                    let objRecData = arrUOM[i];
                    let objUOMILMap = arrUOMILMap.find(e => e.internalid == objRecData.internalid);
                    let objGlobalSrc = arrGlobalSource.find(e => e.custrecord_scv_ilglobal_srcext_recid == objRecData.internalid);

                    objRecData.sourceexternalid = objGlobalSrc?.custrecord_scv_ilglobal_srcext_id || "";
                    if(!!objUOMILMap?.custrecord_scv_ilextmap_id) {
                        objRecData.issync = "T";
                        objRecData.custrecord_scv_ilextmap_id = objUOMILMap.custrecord_scv_ilextmap_id;
                    } else {
                        objRecData.issync = "F";
                        objRecData.custrecord_scv_ilextmap_id = "";
                    }

                    if(currentRemain > LIMIT_REMAIN_USAGE) {
                        // syncDataUOMToIL(objIlIntMap, objRecData);
                        currentRemain = getRemainingUsage();
                    } else {
                        arrResUOM.push(objRecData);
                    }
                }
            } catch(err) {
                log.error("ERROR: Sync Units Type and UOM to IL", err);
            }

            constQueueJob.completeQueueJob(curScript.id, curScript.deploymentId, "End Date: " + (new Date()).toISOString());

            // re-submit scheduled script
            reSubmitScheduledScript(curScript, arrResUOM, objIlIntMap);
        }

        const syncUomGlobalSourceExternal = (unitsTypeRec, arrNewUOM, arrUOM) => {
            for (let i = 0; i < arrUOM.length; i++) {
                let indexNewUOM = arrNewUOM.findIndex(e => {
                    return ((
                        e.action === GlobalAction.CREATE  && 
                        isMatchingUOM(e, arrUOM[i]) && 
                        !arrUOM[i].uom_globalsource
                    ) || (
                        e.action === GlobalAction.UPDATE && 
                        e.internalid == arrUOM[i].internalid
                    ));
                });

                if (indexNewUOM === -1) {
                    continue;
                }

                let objFindNewUOM = arrNewUOM[indexNewUOM];
                if (!objFindNewUOM?.sourceexternalid) {
                    continue;
                }

                if(objFindNewUOM.action === GlobalAction.CREATE) {
                    constIlGlobalSrcExt.createILGlobalSrcExt({
                        custrecord_scv_ilglobal_srcext_rectype: "unitstypeuom",
                        custrecord_scv_ilglobal_srcext_recid: arrUOM[i].internalid,
                        custrecord_scv_ilglobal_srcext_id: objFindNewUOM.sourceexternalid.toString(),
                        custrecord_scv_ilglobal_srcext_unittype: unitsTypeRec.id,
                    });
                } else if(objFindNewUOM.action === GlobalAction.UPDATE) {
                    let objExist = constIlGlobalSrcExt.getDataExistILGlobalSrcExt("unitstypeuom", arrUOM[i].internalid);
                    if(!!objExist.id) {
                        constIlGlobalSrcExt.updateILGlobalSrcExt(objExist.id, objFindNewUOM);
                    }
                }

                // Đã sử dụng rồi thì remove khỏi mảng để không bị match lại
                arrNewUOM.splice(indexNewUOM, 1);
            }
        };

        const isMatchingUOM = (a, b) => {
            return a.unitname === b.unitname &&
                a.pluralname === b.pluralname &&
                a.pluralabbreviation === b.pluralabbreviation &&
                a.abbreviation === b.abbreviation &&
                Number(a.conversionrate) === Number(b.conversionrate) &&
                (typeof a.baseunit !== 'boolean' || a.baseunit === b.baseunit);
        }

        const executeJobFromUserEvent = (curScript, paramsInput) => {
            const arrResult = paramsInput.arrResult;
            const objIlIntMap = paramsInput.objIlIntMap;

            let arrResUOM = [];
            try {
                let msg_note = "Start Date: " + (new Date()).toISOString();
                msg_note += "\nSynced Data UOM To IL: ";
                constQueueJob.updateNoteQueueJob(curScript.id, curScript.deploymentId, msg_note);

                let currentRemain = getRemainingUsage();

                for(let i = 0; i < arrResult.length; i++) {
                    let objRecData = arrResult[i];

                    if(currentRemain > LIMIT_REMAIN_USAGE) {
                        // syncDataUOMToIL(objIlIntMap, objRecData);
                        currentRemain = getRemainingUsage();
                    } else {
                        arrResUOM.push(objRecData);
                    }
                }
            } catch(err) {
                log.error("ERROR: Sync Units Type and UOM to IL", err);
            }

            constQueueJob.completeQueueJob(curScript.id, curScript.deploymentId, "End Date: " + (new Date()).toISOString());

            // re-submit scheduled script
            reSubmitScheduledScript(curScript, arrResUOM, objIlIntMap);
        }

        const getRemainingUsage = () => {
            let script = runtime.getCurrentScript();
            return script.getRemainingUsage();
        }

        const syncDataUOMToIL = (objIlIntMap, objRecData) => {
            try {
                commonItgEco.syncDataToILByRecType({ objIlIntMap, objRecData });
            } catch (err) {
                log.error("ERROR: Sync Data UOM to IL", err.toString());
            }
        }

        const reSubmitScheduledScript = (curScript, arrResUOM, objIlIntMap) => {
            if(arrResUOM.length > 0) {
                const data = { 
                    fromScript: "USER_EVENT",
                    arrResult: arrResUOM,
                    objIlIntMap: objIlIntMap
                };

                let queueJobId = constQueueJob.createQueueJob("SCHEDULED_SCRIPT", curScript.id, curScript.deploymentId, commonUnitsType.ScheduledScript.INPUT_PARAM, JSON.stringify(data));
                let processingQueueJobId = constQueueJob.processQueueJob(curScript.id, curScript.deploymentId);
            }
        }

        return {execute}

    });
