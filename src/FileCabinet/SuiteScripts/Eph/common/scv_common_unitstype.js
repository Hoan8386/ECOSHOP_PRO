/**
 *  Date                Author                  Description
 *  18 Mar 2026         Phu Pham			    Init, create file
 */
define([
    'N/query',
    '../cons/scv_cons_il_intmap.js',
    '../cons/scv_cons_queue_job.js',
    '../cons/scv_cons_il_global_srcext.js',

    './scv_common_itg_econnect.js',
],
    function(
        query,
        constIlIntMap,
        constQueueJob,
        constIlGlobalSrcExt,

        commonItgEco,
    ) {
        const Sublists = {
            UOM: "uom"
        };

        const Fields = {
            EXT_SOURCE_ID: "custpage_scv_extsourceid",
            UOM_EXT_SOURCE_ID: "custpage_scv_uom_extsourceid",
            UOM_GLOBAL_SRCEXT: "custpage_scv_uom_globalsrcext"
        };

        const ScheduledScript = {
            ID: 'customscript_scv_ss_uom_synced_il',
            DEPLOYMENT: [
                'customdeploy_scv_ss_uom_synced_il1', 'customdeploy_scv_ss_uom_synced_il2', 'customdeploy_scv_ss_uom_synced_il3',
                'customdeploy_scv_ss_uom_synced_il4', 'customdeploy_scv_ss_uom_synced_il5'
            ],
            INPUT_PARAM: 'custscript_scv_inpt_uom_synced_il'
        };

        const addILExternalSourceFields = (form, curRec, tgType) => {
            let objUnitsType = getDataILExternalMapByRecId(curRec.id);

            let custpage_scv_extsourceid = form.addField({
                id: Fields.EXT_SOURCE_ID,
                type: 'TEXT',
                label: 'Ext Source ID'
            });

            custpage_scv_extsourceid.defaultValue = objUnitsType?.custrecord_scv_ilextmap_id || "";
            custpage_scv_extsourceid.updateDisplayType({
                displayType: 'disabled'
            });

            if(tgType === "edit") {
                let arrUOMILMap = getDataUOMILExternalMapByRecId(curRec.id);
                let arrGlobalSource = constIlGlobalSrcExt.getDataILGlobalSrcExtByParent(curRec.id, "custrecord_scv_ilglobal_srcext_unittype");
                // sublist
                const objSublist = form.getSublist({
                    id: Sublists.UOM
                });
                
                let custpage_scv_uom_extsourceid = objSublist.addField({
                    id: Fields.UOM_EXT_SOURCE_ID,
                    type: 'TEXT',
                    label: 'Ext Source ID'
                });

                custpage_scv_uom_extsourceid.updateDisplayType({
                    displayType: 'disabled'
                });

                let custpage_scv_uom_globalsrcext = objSublist.addField({
                    id: Fields.UOM_GLOBAL_SRCEXT,
                    type: 'TEXT',
                    label: 'Source External ID'
                });

                custpage_scv_uom_globalsrcext.updateDisplayType({
                    displayType: 'disabled'
                });

                // set uom ext source id
                let totalLine = curRec.getLineCount(Sublists.UOM);
                for(let i = 0; i < totalLine; i++) {
                    let internalid = curRec.getSublistValue(Sublists.UOM, "internalid", i);

                    let objIlExtMap = arrUOMILMap.find(e => e.internalid == internalid);
                    let objIlGlobalSrc = arrGlobalSource.find(e => e.custrecord_scv_ilglobal_srcext_recid == internalid);
                    
                    if(!!objIlExtMap) {
                        curRec.setSublistValue({
                            sublistId: Sublists.UOM,
                            fieldId: Fields.UOM_EXT_SOURCE_ID,
                            line: i,
                            value: objIlExtMap?.custrecord_scv_ilextmap_id || ""
                        });
                    }
                    if(!!objIlGlobalSrc) {
                        curRec.setSublistValue({
                            sublistId: Sublists.UOM,
                            fieldId: Fields.UOM_GLOBAL_SRCEXT,
                            line: i,
                            value: objIlGlobalSrc?.custrecord_scv_ilglobal_srcext_id || ""
                        });
                    }
                }
            }
        }

        const getDataILExternalMapByRecId = (_unitstypeId) => {
            if(!_unitstypeId) return {};
            
            const resultSQL = query.runSuiteQL({
                query: `SELECT
                    UT.id,
                    IlExternalMap.custrecord_scv_ilextmap_id,
                    UT.name,
                    UT.isinactive,
                FROM unitstype UT
                LEFT JOIN customrecord_scv_il_external_map IlExternalMap ON IlExternalMap.custrecord_scv_ilextmap_recid = UT.id
                    AND IlExternalMap.custrecord_scv_ilextmap_rectype = 'unitstype'
                WHERE UT.id = ${_unitstypeId}`
            }).asMappedResults();

            return resultSQL[0] || {};
        }

        const getDataSublistUOM = (curRec) => {
            let totalLine = curRec.getLineCount(Sublists.UOM);
            let arrResult = [];

            let baseuom = "";
            for(let i = 0; i < totalLine; i++) {
                let baseunit = curRec.getSublistValue(Sublists.UOM, "baseunit", i) || false;
                let internalid = curRec.getSublistValue(Sublists.UOM, "internalid", i);
                if(baseunit === true) {
                    baseuom = internalid;
                }

                arrResult.push({
                    id: internalid,
                    internalid: internalid,
                    unitstype: curRec.id,
                    baseunit: baseunit,
                    lineIndex: i,
                    abbreviation: curRec.getSublistValue(Sublists.UOM, "abbreviation", i),
                    conversionrate: curRec.getSublistValue(Sublists.UOM, "conversionrate", i),
                    pluralabbreviation: curRec.getSublistValue(Sublists.UOM, "pluralabbreviation", i),
                    pluralname: curRec.getSublistValue(Sublists.UOM, "pluralname", i),
                    unitname: curRec.getSublistValue(Sublists.UOM, "unitname", i),
                    uom_extsourceid: curRec.getSublistValue(Sublists.UOM, Fields.UOM_EXT_SOURCE_ID, i),
                    uom_globalsource: curRec.getSublistValue(Sublists.UOM, Fields.UOM_GLOBAL_SRCEXT, i),
                });
            }
            arrResult = arrResult.map(e => ({...e, baseuom: baseuom}));
            arrResult.sort((a, b) => {
                if (a.baseunit === b.baseunit) return 0;
                if (a.baseunit === true) return -1;
                return 1;
            });

            return arrResult;
        }

        const getDataUOMILExternalMapByRecId = (_unitstypeId) => {
            if(!_unitstypeId) return [];

            const resultSQL = query.runSuiteQL({
                query: `SELECT
                    UOM.internalid AS id,
                    UOM.internalid,
                    IlExternalMap.custrecord_scv_ilextmap_id,
                    UOM.unitname, 
                    UOM.unitstype, 
                    BUILTIN.DF(UOM.unitstype) as unitstype_display
                FROM unitstypeuom UOM
                LEFT JOIN customrecord_scv_il_external_map IlExternalMap ON IlExternalMap.custrecord_scv_ilextmap_recid = UOM.internalid
                    AND IlExternalMap.custrecord_scv_ilextmap_rectype = 'unitstypeuom'
                WHERE UOM.unitstype = ${_unitstypeId}`
            }).asMappedResults();

            return resultSQL;
        }

        // TODO: sync record

        const autoSyncUnitsTypeToIL = (curRec) => {
            // let objIlIntMap = constIlIntMap.getDataIlIntMapByRecType(curRec.type);
            // if(!objIlIntMap?.id) return;

            // let objUnitsType = getDataILExternalMapByRecId(curRec.id);

            // let objRecData = {
            //     issync: !!objUnitsType?.custrecord_scv_ilextmap_id ? "T" : "F",
            //     id: curRec.id,
            //     custrecord_scv_ilextmap_id: objUnitsType?.custrecord_scv_ilextmap_id,
            //     name: curRec.getValue("name"),
            //     isinactive: curRec.getValue("isinactive"),
            //     externalid: curRec.getValue("externalid")
            // }

            // if(!!objRecData?.id) {
            //     let auditId = commonItgEco.syncDataToILByRecType({ objIlIntMap, objRecData });
            // }
        }

        const autoSyncUnitsTypeUOMToIL = (curRec, tgType, oldRecord) => {
            // let objIlIntMap = constIlIntMap.getDataIlIntMapByRecType("unitstypeuom");
            // if(!objIlIntMap?.id) return;

            // let arrGlobalSource = constIlGlobalSrcExt.getDataILGlobalSrcExtByParent(curRec.id, "custrecord_scv_ilglobal_srcext_unittype");
            // let arrUOMILMap = getDataUOMILExternalMapByRecId(curRec.id);
            // let arrUOM = getDataSublistUOM(curRec);
            
            // let arrOldUOM = [];
            // if(tgType === "edit") {
            //     arrOldUOM = getDataSublistUOM(oldRecord);
            // }

            // const arrResult = hanleDataUOMSyncToIL(curRec, arrUOM, arrUOMILMap, arrOldUOM, arrGlobalSource);
            // // log.error("total uom changed and created: ", {
            // //     data: arrResult,
            // //     total: arrResult.length,
            // // });
            // if(arrResult.length > 5) {
            //     // TODO: run scheduled script
            //     const data = { 
            //         fromScript: "USER_EVENT",
            //         arrResult: arrResult,
            //         objIlIntMap: objIlIntMap
            //     };

            //     let objSS = getScheduledScriptByUnitTypeId(curRec.id);
            //     let queueJobId = constQueueJob.createQueueJob("SCHEDULED_SCRIPT", objSS.id, objSS.deploymentId, objSS.inputParam, JSON.stringify(data));
            //     let processingQueueJobId = constQueueJob.processQueueJob(objSS.id, objSS.deploymentId);
            // } else {
            //     for(let objRecData of arrResult) {
            //         let auditId = commonItgEco.syncDataToILByRecType({ objIlIntMap, objRecData });
            //     }
            // }
        }

        const hanleDataUOMSyncToIL = (curRec, arrUOM, arrUOMILMap, arrOldUOM, arrGlobalSource) => {
            let arrResult = [];
            
            for(let objUom of arrUOM) {
                let objGlobalSrc = arrGlobalSource.find(e => e.custrecord_scv_ilglobal_srcext_recid == objUom.internalid);
                let objRes = {
                    ...objUom,
                    sourceexternalid: objGlobalSrc?.custrecord_scv_ilglobal_srcext_id || "",
                };

                let objUOMILMap = arrUOMILMap.find(e => e.internalid == objUom.internalid);
                if(!!objUOMILMap?.custrecord_scv_ilextmap_id) {
                    let isChanged = isUomChanged(arrOldUOM, objUom);
                    if(isChanged === true) {
                        arrResult.push({
                            issync: "T",
                            custrecord_scv_ilextmap_id: objUOMILMap.custrecord_scv_ilextmap_id,
                            ...objRes
                        });
                    }
                } else {
                    arrResult.push({
                        issync: "F",
                        custrecord_scv_ilextmap_id: "",
                        ...objRes
                    });
                }
            }
            return arrResult;
        }

        function isUomChanged(arrOldUOM, objUom) {
            const old = arrOldUOM.find(e => e.internalid === objUom.internalid);
            if (!old) return false;

            return (
                old.unitname !== objUom.unitname ||
                old.pluralname !== objUom.pluralname ||
                old.pluralabbreviation !== objUom.pluralabbreviation ||
                old.abbreviation !== objUom.abbreviation ||
                old.conversionrate !== objUom.conversionrate ||
                old.baseunit !== objUom.baseunit
            );
        }

        const getScheduledScriptByUnitTypeId = (internalid) => {
            const idxDeployment = (Number(internalid) - 1) % ScheduledScript.DEPLOYMENT.length;
            const deploymentId = ScheduledScript.DEPLOYMENT[idxDeployment];

            return {
                id: ScheduledScript.ID,
                inputParam: ScheduledScript.INPUT_PARAM,
                deploymentId,
            };
        }

        return {
            ScheduledScript,
            addILExternalSourceFields,
            getDataSublistUOM,

            getDataILExternalMapByRecId,
            getDataUOMILExternalMapByRecId,

            // auto sync record
            getScheduledScriptByUnitTypeId,
            autoSyncUnitsTypeToIL,
            autoSyncUnitsTypeUOMToIL,
        };
    });
    