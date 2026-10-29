/**
 *  Date                Author                  Description
 *  28 Apr 2026         Phu Pham			    Init, create file
 */
define([
    'N/record',
    '../cons/scv_cons_queue_job.js',
    '../cons/scv_cons_il_global_srcext.js',
    './scv_common_unitstype.js',
], 
    (
        record,
        constQueueJob,
        constIlGlobalSrcExt,
        commonUnitsType,
    ) => {

        const ErrorCode = {
            Success: {
                CODE: "000",
                MSG: "Success."
            },
            SystemStandard: {
                CODE: "999",
                MSG: "Error System."
            },
            ApiActionNotExist: {
                CODE: "001",
                MSG: "API.action doesn't exist."
            },
            ApiTypeNotExist: {
                CODE: "002",
                MSG: "API.type doesn't exist."
            },
            ApiFieldsMandatory: {
                CODE: "003",
                MSG: "Required fields."
            },
            ApiFieldsNotExist: {
                CODE: "004",
                MSG: "API.fields doesn't exist."
            },
            InvalidUOMData: {
                CODE: "005",
                MSG: "Invalid UOM data. The following fields are required: pluralname, unitname, abbreviation, pluralabbreviation, conversionrate, baseunit."
            },
        };

        const GlobalAction = {
            CREATE: "create",
            UPDATE: "update"
        };

        // TODO: API Units Type

        const apiAddUnitsType = (reqBody) => {
            let objStatus = createObjSuccessAPI();

            try {
                let objFields = reqBody.fields;
                let arrUOM = objFields.uom;
                arrUOM = arrUOM.map(e => ({...e, action: GlobalAction.CREATE}));

                let objFieldsMandatory = validateFieldsMandatory(objFields, ["name"]);
                if(!objFieldsMandatory.isValidate) {
                    let message = ErrorCode.ApiFieldsMandatory.MSG + ": " + objFieldsMandatory.arrFieldsInvalid.join(", ");
                    let objError = createObjErrorAPI(ErrorCode.ApiFieldsMandatory, message);
                    return objError;
                }

                if(!isValidUOMData(arrUOM)) {
                    return createObjErrorAPI(ErrorCode.InvalidUOMData);
                }
                
            	// create record
            	let unitsTypeRec = record.create({type: reqBody.type, isDynamic: true});
            	// set body fields
            	let bodyFields = [
            		"isinactive", "name", "externalid"
            	];
            	for(let fieldId of bodyFields) {
            		unitsTypeRec.setValue(fieldId, objFields[fieldId]);
            	}

            	// insert line uom
            	let uomFields = [
					"abbreviation", "pluralabbreviation", "unitname", "pluralname", 
					"conversionrate", "baseunit"
				];

                for(let i = 0; i < arrUOM.length; i++) {
					let objUOM = arrUOM[i];

                    unitsTypeRec.selectNewLine({sublistId: "uom"});
                    setCurrentSublistValueData(unitsTypeRec, "uom", objUOM, uomFields);
                    unitsTypeRec.commitLine({sublistId: "uom"});
				}
                
            	let unitsTypeId = unitsTypeRec.save({enableSourcing: false, ignoreMandatoryFields: true});

                excuteJobWithGlobalSourceExt(reqBody.type, unitsTypeId, arrUOM);

            	objStatus.data = {
            		internalid: unitsTypeId
            	};
            } catch(err) {
                objStatus = createObjErrorAPI(ErrorCode.SystemStandard, err.message);
                log.error("ERROR: TRY-CATCH", err);
            }

            return objStatus;
        }

        const apiUpdateUnitsType = (reqBody) => {
            let objStatus = createObjSuccessAPI();

            let objFieldsMandatory = validateFieldsMandatory(reqBody, ["internalid"]);
            if(!objFieldsMandatory.isValidate) {
                let message = ErrorCode.ApiFieldsMandatory.MSG + ": " + objFieldsMandatory.arrFieldsInvalid.join(", ");
                let objError = createObjErrorAPI(ErrorCode.ApiFieldsMandatory, message);
                return objError;
            }

            try{
                const objFields = reqBody.fields;
                let arrNewUOM = objFields.uom;

                if(!isValidUOMData(arrNewUOM)) {
                    return createObjErrorAPI(ErrorCode.InvalidUOMData);
                }
                let unitsTypeRec = record.load({type: reqBody.type, id: reqBody.internalid, isDynamic: true});

                // set body fields
            	let bodyFields = [
            		"isinactive", "name", "externalid"
            	];
            	for(let fieldId of bodyFields) {
                    if(!!objFields[fieldId]) {
                        unitsTypeRec.setValue(fieldId, objFields[fieldId]);
                    }
            	}

            	let uomFields = [
					"abbreviation", "pluralabbreviation", "unitname", "pluralname", 
					"conversionrate", "baseunit"
				];

                let arrCurUOM = commonUnitsType.getDataSublistUOM(unitsTypeRec);
                const arrUOM = handleDataUpdateUOM(arrNewUOM, arrCurUOM);
                
                if(arrUOM.length > 0) {
                    const uomFields = [
                        "abbreviation", "pluralabbreviation", "unitname", "pluralname", 
                        "conversionrate", "baseunit"
                    ];

                    for(let i = 0; i < arrUOM.length; i++) {
                        let objUOM = arrUOM[i];

                        if(objUOM.action === "update") {
                            unitsTypeRec.selectLine({sublistId: "uom", line: objUOM.lineIndex});
                            setCurrentSublistValueData(unitsTypeRec, "uom", objUOM, uomFields);
                            unitsTypeRec.commitLine({sublistId: "uom"});
                        } else {
                            unitsTypeRec.selectNewLine({sublistId: "uom"});
                            setCurrentSublistValueData(unitsTypeRec, "uom", objUOM, uomFields);
                            unitsTypeRec.commitLine({sublistId: "uom"});
                        }
                    }
                }

                let internalid = unitsTypeRec.save({enableSourcing: false, ignoreMandatoryFields : true});

                excuteJobWithGlobalSourceExt(reqBody.type, reqBody.internalid, arrUOM);
                objStatus.data = {
                    internalid: reqBody.internalid
                }
            } 
            catch(err) {
                objStatus = createObjErrorAPI(ErrorCode.SystemStandard, err.message);
                log.error("ERROR: TRY-CATCH", err);
            }
            
            return objStatus;
        }

        const excuteJobWithGlobalSourceExt = (rectype, recid, arrNewUOM) => {
            const data = { 
                fromScript: "RESTLET",
                arrNewUOM,
                rectype, 
                recid,
            };

            let objSS = commonUnitsType.getScheduledScriptByUnitTypeId(recid);
            let queueJobId = constQueueJob.createQueueJob("SCHEDULED_SCRIPT", objSS.id, objSS.deploymentId, objSS.inputParam, JSON.stringify(data));
            let processingQueueJobId = constQueueJob.processQueueJob(objSS.id, objSS.deploymentId);
        }

        const handleDataUpdateUOM = (arrNewUOM, arrCurUOM) => {
            const arrResult = [];
            for(let data of arrNewUOM) {
                let objFindILExtMap = arrCurUOM.find(e => (e.uom_globalsource == data.sourceexternalid || e.internalid == data.internalid));
                if(!!objFindILExtMap?.internalid) {
                    arrResult.push({
                        ...data,
                        action: GlobalAction.UPDATE,
                        internalid: objFindILExtMap.internalid,
                        lineIndex: objFindILExtMap.lineIndex
                    });
                } else {
                    arrResult.push({
                        ...data,
                        action: GlobalAction.CREATE
                    });
                }
            }
            return arrResult;
        }

        const apiGetUnitsType = (reqBody) => {
            let objStatus = createObjSuccessAPI();

            let objFieldsMandatory = validateFieldsMandatory(reqBody, ["internalid"]);
            if(!objFieldsMandatory.isValidate) {
                let message = ErrorCode.ApiFieldsMandatory.MSG + ": " + objFieldsMandatory.arrFieldsInvalid.join(", ");
                let objError = createObjErrorAPI(ErrorCode.ApiFieldsMandatory, message);
                return objError;
            }

            try{
                let unitsTypeRec = record.load({type: reqBody.type, id: reqBody.internalid, isDynamic: true});
                let arrCurUOM = commonUnitsType.getDataSublistUOM(unitsTypeRec);
                const arrResult = [];
                
                for(let objCurUOM of arrCurUOM) {
                    let { lineIndex, uom_extsourceid, uom_globalsource, ...restUOM } = objCurUOM;
                    arrResult.push({
                        ...restUOM,
                        extsourceid: uom_extsourceid,
                        sourceexternalid: uom_globalsource
                    });
                }

                objStatus.data = {
                    internalid: reqBody.internalid,
                    uom: arrResult
                };
            } 
            catch(err) {
                objStatus = createObjErrorAPI(ErrorCode.SystemStandard, err.message);
                log.error("ERROR: TRY-CATCH", err);
            }
            
            return objStatus;
        }

        const setCurrentSublistValueData = (rec, sl, objFields, arrField) => {
            let isUpdated = false;

            for(let fieldId of arrField) {
                if(objFields[fieldId] !== undefined) {
                    rec.setCurrentSublistValue({sublistId: sl, fieldId: fieldId, value: objFields[fieldId]});
                    isUpdated = true;
                }
            }

            return isUpdated;
        }

        const isValidUOMData = (arrUOM) => {
            if (!Array.isArray(arrUOM)) return false;

            return arrUOM.every(item => {
                return (
                    item.pluralname &&
                    item.unitname &&
                    item.abbreviation &&
                    item.pluralabbreviation &&
                    item.conversionrate != null &&
                    typeof item.baseunit === 'boolean'
                );
            });
        };

        function validateFieldsMandatory(objFields, arrFieldsMandatory){
            let isValidate = true;
            let arrFieldsInvalid = [];
            arrFieldsMandatory.forEach(eleFieldMan => {
                if(!(objFields[eleFieldMan])){
                    arrFieldsInvalid.push(eleFieldMan);
                    isValidate = false;
                }
            })
            return {isValidate: isValidate, arrFieldsInvalid: arrFieldsInvalid};
        }
        
        function createObjSuccessAPI() {
            return {
                success: true, 
                code: ErrorCode.Success.CODE,
                message: ErrorCode.Success.MSG,
            }
        }

        function createObjErrorAPI(TypeError, message) {
            return {
                success: false,
                code: TypeError.CODE,
                message: message || TypeError.MSG
            }
        }
        
        return {
            ErrorCode,

            createObjSuccessAPI,
            createObjErrorAPI,

            apiAddUnitsType,
            apiUpdateUnitsType,
            apiGetUnitsType,
        };
    });
    