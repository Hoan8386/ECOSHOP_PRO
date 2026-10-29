/**
 *  Date                Author                  Description
 *  20 Mar 2026         Phu Pham			    Init, create file
 */
define([
    'N/record', 'N/query', 'N/search', 'N/format',
    '../lib/scv_lib_function.js',
    '../cons/scv_cons_format.js',
    '../cons/scv_cons_search.js',
    '../cons/scv_cons_itemtype.js',
    '../cons/scv_cons_il_transactionstatus.js',
    '../cons/scv_cons_il_global_srcext.js',
],
    function(
        record, query, search, format,
        lbf,
        constFormat,
        constSearch,
        constItemType,
        constILTranstatus,
        constIlGlobalSrcExt,
    ) {
        const ECO_DATE_REQUIRED = "1900-01-01T00:00:00Z";

        const ApprStatusStandard = {
            Approved: { ID: "2", NAME: "Approved" },
        };

        const OrderStatus = {
            PendingApproval: { ID: "A", NAME: "Pending Approval" },
        };

        const LocationType = {
            Store: {ID: 1, NAME: "Store"},
            Warehouse: {ID: 2, NAME: "Warehouse"},
        };

        const TransactionLineType = {
            SHIPPING: "SHIPPING",
            RECEIVING: "RECEIVING",
            ITEM: "ITEM"
        };

        const FIELD_MAX_NUMBER = 1000000;

        const getDataRecordSubsidiaryMap = (rectype) => {
            if(rectype === "salestaxitemsubsidiarymap") {
                return { isSubMap: false, fields: []};
            }

            let keyMap = "subsidiarymap";
            let keyRel = "subsidiaryrelationship";

            if((rectype.indexOf(keyMap) !== -1) || (rectype.indexOf(keyRel) !== -1)) {
                let index = rectype.indexOf(keyMap);
                if(index === -1) {
                    index = rectype.indexOf(keyRel);
                }
                
                return {
                    isSubMap: true,
                    fields: [rectype.slice(0, index), "subsidiary"],
                };
            }

            return { isSubMap: false, fields: []};
        }

        const getDataReqBodyByCustomList = (objRecData) => {
            return {
                "externalId": objRecData.id.toString(),
                "name": objRecData.name,
                "isActive": !toBoolean(objRecData.isinactive)
            };
        };

        const getDataReqBodyByRecSubMap = (objRecData, fields) => {
            let data = {
                "externalId": objRecData.id.toString(),
            };

            for(let fieldId of fields) {
                data[fieldId] = {
                    "externalId": objRecData[fieldId].toString(),
                }
            }
            return data;
        }

        const getDataReqBodyBySystemListItem = (objRecData) => {
            return {
                "externalId": objRecData.id.toString(),
                "code": objRecData.id.toString(),
                "description": objRecData.name,
                "isActive": true
            };
        };

        const getDataReqBodyBasicRecord = (objRecData) => {
            return {
                "externalId": objRecData.id.toString(),
                "name": objRecData.name,
                "isActive": true
            };
        }

        const getDataReqBodyVendBusinessMap = (objRecData) => {
            return {
                "externalId": objRecData.id.toString(),
                "vendor": {
                    "externalId": objRecData.vendor?.toString() || ""
                },
                "businessCoverage": {
                    "externalId": objRecData.business_coverage?.toString() || ""
                }
            };
        }

        const getDataReqBodyLocDeliverySchedule = (objRecData) => {
            return {
                "externalId": objRecData.id.toString(),
                "location": {
                    "externalId": objRecData.location?.toString() || ""
                },
                "dayOfWeek": objRecData.dayofweek
            };
        }

        const getDataReqBodyVendorCate = (objRecData) => {
            return {
                "externalId": objRecData.id.toString(),
                "name": objRecData.name,
                "isActive": !toBoolean(objRecData.isinactive),
                "isTaxAgency": toBoolean(objRecData.istaxagency)
            };
        }

        const getDataReqBodyCurrency = (objRecData) => {
            return {
                "externalId": objRecData.id.toString(),
                "name": objRecData.name || "",
                "displaySymbol": objRecData.displaysymbol || "",
                "iso3Code": objRecData.symbol || "",
                "currencyPrecision": objRecData.currencyprecision * 1,
                "isBaseCurrency": toBoolean(objRecData.isbasecurrency),
                "isActive": !toBoolean(objRecData.isinactive)
            };
        }

        const getDataReqBodyIncoTerm = (objRecData) => {
            return {
                "externalId": objRecData.id.toString(),
                "code": objRecData.name,
                "description": objRecData.description,
                "isActive": !toBoolean(objRecData.isinactive)
            };
        }

        const getDataReqBodyAccountType = (objRecData) => {
            return {
                "externalId": objRecData.id.toString(),
                "code": objRecData.id.toString(),
                "description": objRecData.longname,
                "defaultGeneralFlowRateType": {
                    "externalId": objRecData.defaultgeneralratetype
                },
                "defaultCashFlowRateType": {
                    "externalId": objRecData.defaultcashflowratetype
                },
                "sequenceNumber": objRecData.seqnum,
                "eliminationAgo": objRecData.eliminationalgo || "",
                "isBalanceSheet": toBoolean(objRecData.balancesheet),
                "includeInRevalDefault": toBoolean(objRecData.includeinrevaldefault),
                "isLeft": toBoolean(objRecData.left),
                "isActive": true
            };
        }

        const getDataItemHierarchy = (objRecData) => {
            let objItemHierarchy = getDataNameItemHierarchy(objRecData.name);
            return {
                "externalId": objRecData.code_id,
                "parentItemHierarchy": {
                    "externalId": objRecData.parent
                },
                "code": objItemHierarchy.code,
                "description": objItemHierarchy.description,
                "sourceExternalId": objRecData.externalid,
                "isActive": !toBoolean(objRecData.isinactive)
            };
        }

        const getDataItemHierarchyRoot = (objRecData) => {
            let objItemHierarchy = getDataNameItemHierarchy(objRecData.name);
            return {
                "externalId": objRecData.code_id,
                "parentItemHierarchy": {
                    "externalId": objRecData.parent
                },
                "code": objItemHierarchy.code,
                "description": objItemHierarchy.description,
                "sourceExternalId": objRecData.externalid,
                "isActive": !toBoolean(objRecData.isinactive)
            };
        }

        const getDataNameItemHierarchy = (name) => {
            let index = name.indexOf("-");

            let code = name, description = "";
            if(index === -1) return { code, description };

            code = name.substring(0, index);
            description = name.substring(index + 1, name.length);
            return {
                code: code.trim(), 
                description: description.trim()
            };
        }

        const getDataReqBodyTaxType = (objRecData) => {
            return {
                "externalId": objRecData.id.toString(),
                "name": objRecData.name,
                "description": objRecData.description,
                "isActive": true
            };
        }

        const getDataReqBodyCountry = (objRecData) => {
            return {
                "externalId": objRecData.id.toString(),
                "name": objRecData.name,
                "nationality": (objRecData.nationality || ""),
                "timeZone": (objRecData.timezone || ""),
                "defaultLocale": (objRecData.deflocale || ""),
                "iso2Code": objRecData.id.toString(),
                "iso3Code": (objRecData.iso3code || "")
            };
        }

        const getDataReqBodyUnitsType = (objRecData) => {
            return {
                "externalId": objRecData.id.toString(),
                "name": objRecData.name,
                "isActive": !toBoolean(objRecData.isinactive),
                "sourceExternalId": objRecData.externalid
            };
        }

        const getDataReqBodyUnitsTypeUOM = (objRecData) => {
            let baseUOM = objRecData?.baseuom?.toString() || "";
            if(toBoolean(objRecData.baseunit) === true) {
                baseUOM = "";
            }

            return {
                "externalId": objRecData.id.toString(),
                "unitType": {
                    "externalId": objRecData.unitstype.toString()
                },
                "code": objRecData.unitname,
                "name": objRecData.unitname,
                "abbreviation": objRecData.abbreviation,
                "pluralAbbreviation": objRecData.pluralabbreviation,
                "conversionRate": (objRecData.conversionrate * 1),
                "baseUOM": {
                    "externalId": baseUOM
                },
                "sourceExternalId": objRecData.sourceexternalid || ""
            };
        }

        const getDataReqBodyTaxCodeSubMap = (objRecData) => {
            return {
                "externalId": objRecData.id.toString(),
                "taxCode": {
                    "externalId": objRecData.taxcode.toString()
                },
                "subsidiary": {
                    "externalId": objRecData.subsidiary.toString()
                }
            };
        }
        
        const getDataObjTaxSchedule = (objRecData, rectype) => {
            const taxScheduleRec = getCurrentRecord(rectype, objRecData.id);
            let purchasetaxcode = taxScheduleRec.getSublistValue("nexuses", "purchasetaxcode", 0) || "";
            let salestaxcode = taxScheduleRec.getSublistValue("nexuses", "salestaxcode", 0) || "";
            let country = taxScheduleRec.getSublistValue("nexuses", "nexuscountry", 0) || "";
            
            let data = {
                "externalId": taxScheduleRec.id.toString(),
                "name": taxScheduleRec.getValue("name"),
                "description": taxScheduleRec.getValue("description"),
                "country": {
                    "externalId": country
                },
                "purchaseTaxCode": {
                    "externalId": purchasetaxcode
                },
                "salesTaxCode": {
                    "externalId": salestaxcode
                },
                "isActive": true
            };

            return data;
        }

        const getDataObjBasicCustomRec = (objRecData, rectype) => {
            const rec = getCurrentRecord(rectype, objRecData.id);
            let isinactive = rec.getValue("isinactive");

            return {
                "externalId": objRecData.id.toString(),
                "name": rec.getValue("name"),
                "isActive": !isinactive
            };
        }

        const getDataObjItemCustomRec = (objRecData, rectype) => {
            const rec = getCurrentRecord(rectype, objRecData.id);
            let isinactive = rec.getValue("isinactive");

            return {
                "externalId": objRecData.id.toString(),
                "name": rec.getValue("name"),
                "isActive": !isinactive,
                "sourceExternalId": rec.getValue("externalid"),
            };
        }

        const getDataObjItemSupplyModel = (objRecData, rectype) => {
            const supplyModelRec = getCurrentRecord(rectype, objRecData.id);
            let isinactive = supplyModelRec.getValue("isinactive");

            return {
                "externalId": objRecData.id.toString(),
                "name": supplyModelRec.getValue("name"),
                "isActive": !isinactive
            };
        }

        const getDataObjItemBrand = (objRecData, rectype) => {
            const brandRec = getCurrentRecord(rectype, objRecData.id);
            let isinactive = brandRec.getValue("isinactive");

            return {
                "externalId": objRecData.id.toString(),
                "name": brandRec.getValue("name"),
                "fullName": brandRec.getValue("custrecord_scv_dis_method_full_name"),
                "isHouseBrand": brandRec.getValue("custrecord_boc_brand_homebrand"),
                "isActive": !isinactive,
                "sourceExternalId": brandRec.getValue("externalid"),
            };
        }

        const getDataObjDeliveryCondition = (objRecData, rectype) => {
            const delCondRec = getCurrentRecord(rectype, objRecData.id);
            let isinactive = delCondRec.getValue("isinactive");

            let created = delCondRec.getValue("created");
            let lastmodified = delCondRec.getValue("lastmodified");

            return {
                "externalId": objRecData.id.toString(),
                "name": delCondRec.getValue("name"),
                "isActive": !isinactive,
                "sourceExternalId": delCondRec.getValue("externalid"),
                "created": formatDateToEcoSystem(created),
                "lastModified": formatDateToEcoSystem(lastmodified),
            };
        }

        const getDataObjItemBuyerGroup = (objRecData, rectype) => {
            const buyerGrpRec = getCurrentRecord(rectype, objRecData.id);
            let isinactive = buyerGrpRec.getValue("isinactive");

            return {
                "externalId": objRecData.id.toString(),
                "name": buyerGrpRec.getValue("name"),
                "buyer": {
                    "externalId": buyerGrpRec.getValue("custrecord_boc_buyer_pic")
                },
                "isActive": !isinactive,
                "sourceExternalId": buyerGrpRec.getValue("externalid"),
            };
        }

        const getDataObjItemGlobalISM = (objRecData, rectype) => {
            const itemGISMRec = getCurrentRecord(rectype, objRecData.id);
            let isinactive = itemGISMRec.getValue("isinactive");

            let created = itemGISMRec.getValue("created");
            let owner = itemGISMRec.getText("owner");
            let lastmodified = itemGISMRec.getValue("lastmodified");
            let lastmodifiedby = itemGISMRec.getText("lastmodifiedby");

            return {
                "externalId": objRecData.id.toString(),
                "isActive": !isinactive,
                "isSync": itemGISMRec.getValue("custrecord_scv_ima_ite_is_sysc"),
                "isActive": !isinactive,
                // "reorder": itemGISMRec.getValue("custrecord_scv_ima_ite_is_reorder"),
                "systemCreatedAt": formatDateToEcoSystem(created),
                "systemCreatedBy": owner,
                "systemEditedAt": formatDateToEcoSystem(lastmodified),
                "systemEditedBy": lastmodifiedby,

                // "itemInternalId": itemGISMRec.getValue("custrecord_scv_ima_ite_item_rel"),
                // "destinationInstanceInternalId": itemGISMRec.getValue("custrecord_scv_ite_des_origins"),
                // "reorderReasonInternalId": itemGISMRec.getValue("custrecord_scv_ima_ite_reo_reason"),
                // "rqStatusInternalId": itemGISMRec.getValue("custrecord_scv_ima_ite_rq_status"),
                "item": {
                    "externalId": itemGISMRec.getValue("custrecord_scv_ima_ite_item_rel"),
                },
                "destinationInstance": {
                    "externalId": itemGISMRec.getValue("custrecord_scv_ite_des_origins"),
                },
                "itemReorderReason": {
                    "externalId": itemGISMRec.getValue("custrecord_scv_ima_ite_reo_reason"),
                },
                "rqStatus": {
                    "externalId": itemGISMRec.getValue("custrecord_scv_ima_ite_rq_status"),
                },
                "hsCode": {
                    "externalId": itemGISMRec.getValue("custrecord_scv_ima_ite_hs_code"),
                },
                "subLabel": itemGISMRec.getValue("custrecord_scv_ima_ite_sublabel"),
            };
        }

        const getDataObjCountryOfOrigin = (objRecData, rectype) => {
            const COORec = getCurrentRecord(rectype, objRecData.id);
            let isinactive = COORec.getValue("isinactive");

            return {
                "externalId": objRecData.id.toString(),
                "name": COORec.getValue("name"),
                "abbreviation": COORec.getValue("custrecord_scv_coo_abbreviation"),
                "isActive": !isinactive
            }
        }

        const getDataObjItemHSCode = (objRecData, rectype) => {
            const hsCodeRec = getCurrentRecord(rectype, objRecData.id);
            let isinactive = hsCodeRec.getValue("isinactive");

            return {
                "externalId": objRecData.id.toString(),
                "name": hsCodeRec.getValue("name"),
                "description": hsCodeRec.getValue("custrecord_boc_hscode_desc"),
                "sstRate": hsCodeRec.getValue("custrecord_boc_hscode_sstrate") * 1,
                "importDutyRate": hsCodeRec.getValue("custrecord_boc_hscode_importduty") * 1,
                "sourceExternalId": hsCodeRec.getValue("externalid"),
                "isActive": !isinactive
            };
        }

        const getDataObjTaxCode = (objRecData, rectype) => {
            const taxCodeRec = getCurrentRecord(rectype, objRecData.id);
            let isinactive = taxCodeRec.getValue("isinactive");
            let effectivefrom = taxCodeRec.getValue("effectivefrom");
            let validuntil = taxCodeRec.getValue("validuntil");

            let data = {
                "externalId": objRecData.id.toString(),
                "taxType": {
                    "externalId": taxCodeRec.getValue("taxtype")
                },
                "code": taxCodeRec.getValue("itemid"),
                "description": taxCodeRec.getValue("description"),
                "rate": taxCodeRec.getValue("rate"),
                "effectiveDate": formatDateToEcoSystem(effectivefrom),
                "validUntil": formatDateToEcoSystem(validuntil),
                "isChildSubsidiaryMappingIncluded": taxCodeRec.getValue("includechildren"),
                "isActive": !isinactive
            };

            return data;
        }

        const getDataObjAccount = (objRecData, rectype) => {
            const accountRec = getCurrentRecord(rectype, objRecData.id);
            let isinactive = accountRec.getValue("isinactive");

            let data = {
                "externalId": accountRec.id.toString(),
                "parentAccount": {
                    "externalId": null
                },
                "name": accountRec.getValue("acctname"),
                "description": accountRec.getValue("description"),
                "accountType": {
                    "externalId": accountRec.getValue("accttype")
                },
                "specialAccountType": {
                    "externalId": null
                },
                "generalRateType": {
                    "externalId": accountRec.getValue("generalrate")
                },
                "cashFlowRateType": {
                    "externalId": accountRec.getValue("cashflowrate")
                },
                "restrictToClass": {
                    "externalId": accountRec.getValue("class")
                },
                "restrictToDepartment": {
                    "externalId": accountRec.getValue("department")
                },
                "restrictToLocation": {
                    "externalId": accountRec.getValue("location")
                },
                "currency": {
                    "externalId": accountRec.getValue("currency")
                },
                "bankName": accountRec.getValue("sbankname") || "",
                "bankRouting": accountRec.getValue("sbankroutingnumber") || "",
                "isInventory": accountRec.getValue("inventory"),
                "isSummary": accountRec.getValue("issummary"),
                "isRevalueOpenBalanceForForeignCurrencyTransactions": accountRec.getValue("revalue"),
                "isUseMatchBankDataAndReconcileAccountStatementPages": accountRec.getValue("reconcilewithmatching"),
                "isChildSubsidiaryMappingIncluded": accountRec.getValue("includechildren"),
                "isActive": !isinactive
            }
            return data;
        }

        const getDataObjSubsidiary = (objRecData, rectype) => {
            const subRec = getCurrentRecord(rectype, objRecData.id);
            let isinactive = subRec.getValue("isinactive");
            let parent = subRec.getValue("parent");
            let federalidnumber = subRec.getValue("federalidnumber");

            let subAddressRec = subRec.getSubrecord({
                fieldId: 'mainaddress'
            });

            let data = {
                "externalId": subRec.id.toString(),
                "parentSubsidiary": {},
                "name": subRec.getValue("name"),
                "legalName": subRec.getValue("legalname"),
                "currency": {
                    "externalId": subRec.getValue("currency")
                },
                "website": subRec.getValue("url"),
                "email": subRec.getValue("email"),
                "faxNo": subRec.getValue("fax"),
                "documentNumberPrefix": subRec.getValue("tranprefix"),
                "transactionNumberPrefix": subRec.getValue("traninternalprefix"),
                "isActive": !isinactive,
                "phoneNo": "",
                "legacyCode": "",
                "taxIdentificationNumber": federalidnumber || "",
                "companyRegistrationNumber": federalidnumber || "",
                "country": {
                    "externalId": subAddressRec.getValue("country")
                },
                "addressLine1": subAddressRec.getValue("addr1"),
                "addressLine2": subAddressRec.getValue("addr2"),
                "addressLine3": subAddressRec.getValue("addr3"),
                "postalCode": subAddressRec.getValue("zip"),
                "city": subAddressRec.getValue("city"),
                "state": subAddressRec.getValue("state"),
            };
            if(parent) {
                data.parentSubsidiary.externalId = parent;
            } else {
                data.parentSubsidiary.externalId = null;
            }
            return data;
        }

        const getDataObjIMASalesPrice = (objRecData, rectype) => {
            const imaSPRec = getCurrentRecord(rectype, objRecData.id);
            // data
            let isinactive = imaSPRec.getValue("isinactive");
            let itemId = imaSPRec.getValue("custrecord_scv_ima_sa_price_item");
            let startDate = imaSPRec.getValue("custrecord_scv_ima_sa_eff_date");
            let endDate = imaSPRec.getValue("custrecord_scv_ima_sales_price_enddate");
            let createdDate = imaSPRec.getValue("custrecord_scv_ima_created_date");

            let data = {
                "externalId": imaSPRec.id.toString(),
                "priceLevel": {
                    "externalId": imaSPRec.getValue("custrecord_scv_price_list")
                },
                "currency": {
                    "externalId": imaSPRec.getValue("custrecord_scv_ima_sa_currency")
                },
                "unitOfMeasure": {
                    "externalId": imaSPRec.getValue("custrecord_scv_ima_sales_unit")
                },
                "price": imaSPRec.getValue("custrecord_scv_price_af_tax") * 1,
                "startDate": formatDateToEcoSystem(startDate),
                "endDate": formatDateToEcoSystem(endDate),
                "isActive": !isinactive,
                "recordCreationDate": formatDateToEcoSystem(createdDate),
            };

            if(!!itemId) {
                let objItem = getDataItemById(itemId);

                let itemData = {
                    "item": {
                        "externalId": itemId.toString()
                    },
                    "subsidiary": {
                        "externalId": objItem?.subsidiary?.toString() || ""
                    },
                };

                data = Object.assign(data, itemData);
            }

            return data;
        }

        const getDataObjIMAPurchasePrice = (objRecData, rectype) => {
            const imaPurRec = getCurrentRecord(rectype, objRecData.id);
            let isinactive = imaPurRec.getValue("isinactive");
            let itemId = imaPurRec.getValue("custrecord_scv_ima_pur_price_item");
            let startDate = imaPurRec.getValue("custrecord_scv_ima_pur_price_eff_date");
            let endDate = imaPurRec.getValue("custrecord_scv_ima_pur_end_date");
            let createdDate = imaPurRec.getValue("custrecord_scv_ima_pur_created_date");

            let data = {
                "externalId": imaPurRec.id.toString(),
                "vendor": {
                    "externalId": imaPurRec.getValue("custrecord_scv_pur_price_vendor")
                },
                "location": {
                    "externalId": imaPurRec.getValue("custrecord_scv_ima_pur_price_loc")
                },
                "currency": {
                    "externalId": imaPurRec.getValue("custrecord_scv_ima_pur_currency")
                },
                "unitOfMeasure": {
                    "externalId": imaPurRec.getValue("custrecord_scv_pur_price_unit")
                },
                "price": imaPurRec.getValue("custrecord_scv_ima_pur_price") * 1,
                "startDate": formatDateToEcoSystem(startDate),
                "endDate": formatDateToEcoSystem(endDate),
                "isActive": !isinactive,
                "recordCreationDate": formatDateToEcoSystem(createdDate, true),
            };

            if(!!itemId) {
                let objItem = getDataItemById(itemId);

                let itemData = {
                    "item": {
                        "externalId": itemId.toString()
                    },
                    "subsidiary": {
                        "externalId": objItem?.subsidiary?.toString() || ""
                    }
                };

                data = Object.assign(data, itemData);
            }

            return data;
        }

        const getDataItemById = (itemId) => {
            if(!itemId) return {};

            let resultSQL = query.runSuiteQL({
                query: `SELECT id, upccode, itemid, subsidiary, unitstype
                    FROM item
                    WHERE id = ${itemId}`
            }).asMappedResults();

            return resultSQL[0] || {};
        }

        const getDataObjInvAdjReason = (objRecData, rectype) => {
            const inaResonRec = getCurrentRecord(rectype, objRecData.id);
            let isinactive = inaResonRec.getValue("isinactive");

            let data = {
                "externalId": inaResonRec.id.toString(),
                "code": inaResonRec.getValue("custrecord_scv_inv_adj_reason_code"),
                "description": inaResonRec.getValue("custrecord_scv_inv_adj_reason_des"),
                "generalLedgerAccount": {
                    "externalId": inaResonRec.getValue("custrecord_atlas_glaccount")
                },
                "department": {
                    "externalId": inaResonRec.getValue("custrecord_atlas_dept")
                },
                "remark": inaResonRec.getValue("custrecord_scv_inv_adj_reason_remark"),
                "isActive": !isinactive
            };
            return data;
        }

        const getDataObjInvAdjReasonMap = (objRecData, rectype) => {
            const inaResonMapRec = getCurrentRecord(rectype, objRecData.id);
            let isinactive = inaResonMapRec.getValue("isinactive");

            let data = {
                "externalId": inaResonMapRec.id.toString(),
                "sourceAdjustmentReason": {
                    "externalId": inaResonMapRec.getValue("custrecord_scv_soucre_inv_adj_reason_map")
                },
                "mappedAdjustmentReasonCode": inaResonMapRec.getValue("custrecord_scv_inv_adj_reason_code_map"),
                "mappedAdjustmentReasonDescription": inaResonMapRec.getValue("custrecord_scv_inv_adj_reason_des_map"),
                "mappedSystem": inaResonMapRec.getValue("custrecord_scv_inv_adj_reason_map_system"),
                "remark": inaResonMapRec.getValue("custrecord_scv_inv_adj_reason_remark_map"),
                "isActive": !isinactive
            };
            return data;
        }

        const getDataPOTransactionCodeMap = (objRecData, rectype) => {
            const poCodeMapRec = getCurrentRecord(rectype, objRecData.id);
            let data = {
                "externalId": poCodeMapRec.id.toString(),
                "type": poCodeMapRec.getText("custrecord_scv_po_trans_code_type"),
                "companyCode": poCodeMapRec.getValue("custrecord_scv_po_trans_code_company"),
                "warehouseCode": poCodeMapRec.getValue("custrecord_scv_po_trans_code_warehouse"),
                "sourceTransactionCode": poCodeMapRec.getText("custrecord_scv_po_trans_code_source"),
                "mappedTransactionCode": poCodeMapRec.getValue("custrecord_scv_po_trans_code_map"),
            };
            return data;
        }

        const getDataTOTransactionCodeMap = (objRecData, rectype) => {
            const toCodeMapRec = getCurrentRecord(rectype, objRecData.id);
            let data = {
                "externalId": toCodeMapRec.id.toString(),
                "companyCode": toCodeMapRec.getValue("custrecord_scv_ito_trans_code_com"),
                "warehouseCode": toCodeMapRec.getValue("custrecord_scv_ito_trans_code_warehouse"),
                "sourceTransactionCode": toCodeMapRec.getText("custrecord_scv_ito_trans_code_source"),
                "mappedTransactionCode": toCodeMapRec.getValue("custrecord_scv_ito_trans_code_map"),
            };
            return data;
        }

        const getDataObjPLUBarcode = (objRecData, rectype) => {
            const pluBarcodeRec = getCurrentRecord(rectype, objRecData.id);
            let isinactive = pluBarcodeRec.getValue("isinactive");
            let data = {
                "externalId": pluBarcodeRec.id.toString(),
                "item": {
                    "externalId": pluBarcodeRec.getValue("custrecord_scv_plu_barcode_item")
                },
                "unitOfMeasure": {
                    "externalId": pluBarcodeRec.getValue("custrecord_scv_plu_unit")
                },
                "barcode": pluBarcodeRec.getValue("name"),
                "sourceExternalId": pluBarcodeRec.getValue("externalid"),
                "isActive": !isinactive
            };
            return data;
        }

        const getDataObjVendor = (objRecData, rectype) => {
            const vendorRec = getCurrentRecord(rectype, objRecData.id);
            let isinactive = vendorRec.getValue("isinactive");
            let objAddress = getDataAddressbookEntity(vendorRec);

            let data = {
                "externalId": vendorRec.id.toString(),
                "primarySubsidiary": {
                    "externalId": vendorRec.getValue("subsidiary")
                },
                "vendorCategory": {
                    "externalId": vendorRec.getValue("category")
                },
                "supplierType": {
                    "externalId": vendorRec.getValue("custentity_boc_vnd_suppliertype")
                },
                "bcBusinessPostingGroup": {
                    "externalId": ""
                },
                // "businessCoverage": {
                // 	"externalId": vendorRec.getValue("custentity_boc_business_coverage")
                // },
                "bcVendorCode": vendorRec.getValue("custentity_scv_entity_code"),
                "holdingCompany": "",
                "bcVendorPostingGroup": {
                    "externalId": ""
                },
                "dateOfIncorporationRegistration": ECO_DATE_REQUIRED,
                "gstRegistrationDate": ECO_DATE_REQUIRED,
                "businessRegistrationNo": "",
                "oldBusinessRegistrationNo": "",
                "gstRegistrationNo": "",
                "sstRegistrationNo": "",
                "qqNo": "",
                "fax": "",
                ...objAddress,
                "businessName": vendorRec.getValue("custentity_scv_eng_name"),
                "supplierCode": vendorRec.getValue("nameorig"),
                "taxIdentificationNo": vendorRec.getValue("custentity_scv_tax_number"),
                "primaryContactNo": vendorRec.getValue("custentity_scv_phone_no"),
                "companyEmail": vendorRec.getValue("email"),
                "purchaserName": vendorRec.getValue("custentity_boc_vnd_purchasername"),
                "vendorOverseasLocationCode": {
                    "externalId": null
                },
                "incoterm": {
                    "externalId": vendorRec.getValue("incoterm")
                },
                "terms": {
                    "externalId": vendorRec.getValue("terms")
                },
                "primaryCurrency": {
                    "externalId": vendorRec.getValue("currency")
                },
                "companyType": {
                    "externalId": ""
                },
                "paymentMethod": {
                    "externalId": ""
                },
                "deliveryLocation": {
                    "externalId": vendorRec.getValue("custentity_boc_delivery_location")
                },
                "deliveryLeadTimeDays": vendorRec.getValue("custentity_boc_lead_time_calculation") * 1,
                "isBackhaulSupplier": vendorRec.getValue("custentity_boc_is_backhaul"),
                "isAutoPo": vendorRec.getValue("custentity_boc_auto_po"),
                "isCrossdock": vendorRec.getValue("custentity_boc_is_crossdock"),
                "emailForB2b": "",
                "hasB2bSubscription": false,
                "b2bSubscriptionEffectiveDate": ECO_DATE_REQUIRED,
                "b2bSubscriptionTerminationDate": ECO_DATE_REQUIRED,
                "hasCmsSubscription": false,
                "cmsSubscriptionEffectiveDate": ECO_DATE_REQUIRED,
                "isTaxRegisteredCompany": false,
                "equityStructureAccumulatedCapital": "",
                "equityStructureAuthorizedCapital": "",
                "equityStructurePaidUpCapital": "",
                "shareholderStructureBumiputera": "",
                "shareholderStructureNonBumiputera": "",
                "shareholderStructureForeigner": "",
                "bankBranch": "",
                "financialFacilities": "",
                "legalName": vendorRec.getValue("custentity_scv_legal_name"),
                "bankName": vendorRec.getValue("custentity_boc_bank_name"),
                "preferredBankAccountCode": vendorRec.getValue("custentity_boc_preferred_bank_code"),
                "swiftCode": vendorRec.getValue("custentity_boc_swift_code"),
                "creditLimit": 0,
                "creditPaymentDiscount": 0,
                "bankGuaranteeAmount": 0,
                "bankGuaranteeEntitledForCreditLimitRatio": 0,
                "bcDimensionPurpose": {
                    "externalId": ""
                },
                "bcDimensionLocation": {
                    "externalId": ""
                },
                "bcDimensionTenancyAndDepartment": {
                    "externalId": ""
                },
                "isSelfBill": false,
                "eInvoiceStartDate": ECO_DATE_REQUIRED,
                "eInvoiceMalaysiaStandardIndustrialClassification": {
                    "externalId": ""
                },
                "eInvoiceIdentificationType": {
                    "externalId": ""
                },
                "nric": "",
                "passport": "",
                "army": "",
                "emailForEinvoice": "",
                "vendorBlockStatus": {
                    "externalId": ""
                },
                "blockStatusNextApprover": "",
                "isChildSubsidiaryMappingIncluded": true,
                "isInactiveReactivate": false,
                "isActive": !isinactive
            };
            return data;
        }

        const getDataObjCustomer = (objRecData, rectype) => {
            const customerRec = getCurrentRecord(rectype, objRecData.id);
            let isinactive = customerRec.getValue("isinactive");
            let startdate = customerRec.getValue("startdate");
            let enddate = customerRec.getValue("enddate");
            let objAddress = getDataAddressbookEntity(customerRec);

            let data = {
                "externalId": customerRec.id.toString(),
                "primarySubsidiary": {
                    "externalId": customerRec.getValue("subsidiary")
                },
                "customerId": customerRec.getValue("nameorig"),
                "bcCustomerCode": "",
                "companyName": customerRec.getValue("companyname"),
                "legalName": customerRec.getValue("custentity_scv_legal_name"),
                "customerCategory": {
                    "externalId": customerRec.getValue("category")
                },
                "vendorMapping": { 
                    "externalId": customerRec.getValue("custentity_boc_vendor_code_map")
                },
                "bcCustomerPostingGroup": { "externalId": "" },
                "bcBusinessPostingGroup": { "externalId": "" },
                "companyRegistrationNumber": customerRec.getValue("custentity_scv_tax_number"),
                "gstRegistrationNo": "",
                "sstRegistrationNo": "",
                "taxIdentificationNo": "",
                "email": customerRec.getValue("email"),
                "phone": customerRec.getValue("custentity_scv_phone_no"),
                "alternatePhone": customerRec.getValue("phone"),
                "companyContactPhone": "",
                "fax": customerRec.getValue("fax"),
                ...objAddress,
                "region": {"externalId": ""},
                "outletAccountNo": "",
                "bcDimensionPurpose": {"externalId": ""},
                "bcDimensionLocation": {"externalId": ""},
                "bcDimensionTenancyAndDepartment": {"externalId": ""},
                "isPerson": false,
                "isOversea": false,
                "isXilnexSalesOperator": false,
                "salesRepresentative": {
                    "externalId": customerRec.getValue("salesrep"),
                },
                "accountNo": customerRec.getText("receivablesaccount"),
                "contractStartDate": formatDateToEcoSystem(startdate),
                "contractEndDate": formatDateToEcoSystem(enddate),
                "contractRenewalReminderDays": customerRec.getValue("reminderdays") * 1,
                "priceLevel": {
                    "externalId": customerRec.getValue("pricelevel")
                },
                "primaryCurrency": {
                    "externalId": customerRec.getValue("currency")
                },
                "terms": {
                    "externalId": customerRec.getValue("terms")
                },
                "creditLimit": 0,
                "einvoiceStartDate": ECO_DATE_REQUIRED,
                "eInvoiceMalaysiaStandardIndustrialClassification": { "externalId": "" },
                "eInvoiceIdentidicationType": { "externalId": "" },
                "nric": "",
                "passport": "",
                "army": "",
                "personalName": "",
                "emailForEinvoice": "",
                "hasTaxIdentificationNoValidated": false,
                "alcoholRecipientType": "",
                "comments": customerRec.getValue("comments"),
                "status": customerRec.getText("entitystatus"),
                "isChildSubsidiaryMappingIncluded": true,
                "isActive": !isinactive
            };
            return data;
        }

        const getDataAddressbookEntity = (curRec) => {
            let objResult = {
                "billingAddressLine1": "",
                "billingAddressLine2": "",
                "billingAddressLine3": "",
                "billingAddressPostalCode": "",
                "billingAddressCity": "",
                "billingAddressState": "",
                "billingAddressCountry": { "externalId": "" },
                "shippingAddressLine1": "",
                "shippingAddressLine2": "",
                "shippingAddressLine3": "",
                "shippingAddressPostalCode": "",
                "shippingAddressCity": "",
                "shippingAddressState": "",
                "shippingAddressCountry": { "externalId": "" },
            };

            let sl = "addressbook";
            let totalLine = curRec.getLineCount(sl);
            for(let i = 0; i < totalLine; i++) {
                let defaultshipping = curRec.getSublistValue(sl, "defaultshipping", i);
                let defaultbilling = curRec.getSublistValue(sl, "defaultbilling", i);
                
                let addressSubRec = curRec.getSublistSubrecord({ sublistId: sl, fieldId: "addressbookaddress", line: i});
                if(defaultshipping === true) {
                    objResult["shippingAddressLine1"] = addressSubRec.getValue("addr1") || addressSubRec.getValue("addressee");
                    objResult["shippingAddressLine2"] = addressSubRec.getValue("addr2");
                    objResult["shippingAddressLine3"] = addressSubRec.getValue("addr3");
                    objResult["shippingAddressPostalCode"] = addressSubRec.getValue("zip");
                    objResult["shippingAddressCity"] = addressSubRec.getValue("city");
                    objResult["shippingAddressState"] = addressSubRec.getValue("state");
                    objResult["shippingAddressCountry"] = { 
                        "externalId": addressSubRec.getValue("country")
                    };
                }
                if(defaultbilling === true) {
                    objResult["billingAddressLine1"] = addressSubRec.getValue("addr1") || addressSubRec.getValue("addressee");
                    objResult["billingAddressLine2"] = addressSubRec.getValue("addr2");
                    objResult["billingAddressLine3"] = addressSubRec.getValue("addr3");
                    objResult["billingAddressPostalCode"] = addressSubRec.getValue("zip");
                    objResult["billingAddressCity"] = addressSubRec.getValue("city");
                    objResult["billingAddressState"] = addressSubRec.getValue("state");
                    objResult["billingAddressCountry"] = { 
                        "externalId": addressSubRec.getValue("country")
                    };
                }
            }
            return objResult;
        }

        const getDataObjItemLocationConfig = (objRecData, rectype) => {
            const ilcRec = getCurrentRecord(rectype, objRecData.id);
            let objWeek = getDataWeekItemLocationConfig(ilcRec);

            let data = {
                "externalId": ilcRec.id.toString(),
                "subsidiary": {
                    "externalId": ilcRec.getValue("subsidiary")
                },
                "vendor": {
                    "externalId": ilcRec.getValue("custrecord_boc_locn_vendor")
                },
                "item": {
                    "externalId": ilcRec.getValue("item")
                },
                "location": {
                    "externalId": ilcRec.getValue("location")
                },
                "name": ilcRec.getValue("name"),
                "memo": ilcRec.getValue("memo"),
                "primarySourcingWarehouse": {
                    "externalId": ""
                },
                "purchaseLeadTime": ilcRec.getValue("leadtime") * 1,
                "reorderPoint": ilcRec.getValue("reorderpoint") * 1,
                "reorderPointLevelDays": ilcRec.getValue("custrecord_boc_reorder_days") * 1,
                "preferredStockLevel": ilcRec.getValue("preferredstocklevel") * 1,
                "preferredStockLevelDays": ilcRec.getValue("custrecord_boc_preferred_days") * 1,
                "distributionUom": {
                    "externalId": ilcRec.getValue("custrecord_boc_distr_uom"),
                },
                "distributionReorderMultiple": ilcRec.getValue("custrecord_boc_distr_reorder_multiple") * 1,
                "adjustmentQuantity": ilcRec.getValue("custrecord_boc_adj_quantity") * 1,
                "backwardConsumptionDays": 0,
                "bufferStock": ilcRec.getValue("custrecord_boc_buffer_stock") * 1,
                "inventoryClassification": 0,
                "countInterval": 0,
                "defaultReturnCost": ilcRec.getValue("defaultreturncost") * 1,
                "demandAverage": ilcRec.getValue("custrecord_boc_demand_average") * 1,
                "demandSource": {
                    "externalId": ""
                },
                "demandTimeFence": 0,
                "firmReleaseAdvanceWarningThreshold": 0,
                "fixedLotMultiple": 0,
                "fixedLotSize": 0,
                "forwardConsumptionDays": 0,
                "highImpactLateDemandThreshold": 0,
                "latePeriodDays": 0,
                "leadTimeOffset": 0,
                "itemListInOut": {
                    "externalId": ilcRec.getValue("custrecord_boc_list_inout"),
                },
                "itemListInOutReasonCode": {
                    "externalId": ilcRec.getValue("custrecord_boc_list_inout_reason"),
                },
                "lotSizingMethod": {
                    "externalId": ""
                },
                "minimumOrderQuantity": 0,
                "minimumReorderQuantity": 0,
                "minimumRescheduleDays": 0,
                "pastDueForecastDays": 0,
                "periodsOfSupplyIncrement": 0,
                "periodsOfSupplyType": {
                    "externalId": ""
                },
                "planningTimeFence": 0,
                "poReceiptCost": 0,
                "projectedDemandByLeadTime": ilcRec.getValue("custrecord_boc_demand_by_leadtime") * 1,
                "promoUpliftModifer": 0,
                "rescheduleHorizon": 0,
                "rescheduleInDays": 0,
                "rescheduleOutDays": 0,
                "safetyStockLevel": ilcRec.getValue("safetystocklevel") * 1,
                "supplyType": {
                    "externalId": ""
                },
                "isInspectionHoldItem": ilcRec.getValue("custrecord_boc_inspection_hold_item"),
                ...objWeek
            };
            return data;
        }

        const getDataWeekItemLocationConfig = (ilcRec) => {
            let objRes = {};
            for(let i = 1; i <= 52; i++) {
                objRes["week" + i] = ilcRec.getValue("custrecord_boc_week" + i) || 0;
            }
            return objRes;
        }

        const getDataObjTransferOrder = (objRecData, rectype) => {
            const toRec = getCurrentRecord(rectype, objRecData.id);

            let icto = toRec.getValue("icto");
            let orderstatus = toRec.getValue("orderstatus");
            let currency = toRec.getValue("currencyname");
            let exchangerate = toRec.getValue("exchangerate");
            let trandate = toRec.getValue("trandate");

            let location = toRec.getValue("location");
		    let transferlocation = toRec.getValue("transferlocation");
            let department = toRec.getValue("department");
            let oversea_ship_date = toRec.getValue("custbody_scv_oversea_ship_date");
            let total = toRec.getValue("total") * 1;

            let createddate = toRec.getValue("createddate");
            let lastmodifieddate = toRec.getValue("lastmodifieddate");
            let recordcreatedby = toRec.getValue("recordcreatedby");
            let currentuseredit = toRec.getValue("custbody_scv_current_user_edit");

            let arrLocation = queryDataLocOnTransaction([location, transferlocation]);
            let arrEmployee = queryDataEmployee([recordcreatedby, currentuseredit]);

            let objCreatedBy = arrEmployee.find(e => e.id == recordcreatedby) || {};
            let objCurUserEdit = arrEmployee.find(e => e.id == currentuseredit) || {};
            let objFromLocation = arrLocation.find(e => e.id == location) || {};
            let objToLocation = arrLocation.find(e => e.id == transferlocation) || {};

            // get data sublist
            let sl = "item";
            let totalLine = toRec.getLineCount(sl);
            let arrItem = getDataItemOnTransaction(toRec, sl, totalLine);
            let arrTransLine = getAllDataTransactionLineTO(toRec.id);

            let arrSublist = [];
            let totalOrderedWeightInKg = 0, totalOrderedM3 = 0;
            for(let i = 0; i < totalLine; i++) {
                let item_id = toRec.getSublistValue(sl, "item", i);
                let originalLineNum = toRec.getSublistValue(sl, "custcol_scv_origin_line_num", i) || "";
                let rate = toRec.getSublistValue(sl, "rate", i) * 1;
                let amount = toRec.getSublistValue(sl, "amount", i) * 1;
                let unitconversionrate = toRec.getSublistValue(sl, "unitconversionrate", i) * 1;
                let quantity = toRec.getSublistValue(sl, "quantity", i) * 1;
                let isclosed = toRec.getSublistValue(sl, "isclosed", i);

                let objShipping = arrTransLine.find(e => e.item == item_id && e.custcol_scv_origin_line_num == originalLineNum && e.transactionlinetype === TransactionLineType.SHIPPING) || {};
                let objReceiving = arrTransLine.find(e => e.item == item_id && e.custcol_scv_origin_line_num == originalLineNum && e.transactionlinetype === TransactionLineType.RECEIVING) || {};
                let objSublist = {
                    "lineNumber": toRec.getSublistValue(sl, "line", i) * 1,
                    "itemReceiptLineNumber": (objReceiving.line * 1) || 0,
                    "itemFulFillmentLineNumber": (objShipping.line * 1) || 0,
                    "originalDocumentLineNumber": originalLineNum,
                    "itemBarcode": "",
                    "legacyItemCode": "",
                    "itemCode": toRec.getSublistValue(sl, "item_display", i),
                    "itemDescription": toRec.getSublistValue(sl, "description", i),
                    "orderedUom": toRec.getSublistValue(sl, "units_display", i),
                    "orderedQty": quantity,
                    "qtyPerOrderedUom": unitconversionrate,
                    "baseQty": (unitconversionrate * quantity),
                    "currencyCode": currency,
                    "currencyRate": exchangerate,
                    "unitCostExcludingTax": rate,
                    "unitCostExcludingTaxInLcy": (rate * exchangerate),
                    "unitCostIncludingTax": rate,
                    "unitCostIncludingTaxInLcy": (rate * exchangerate),
                    "unitDiscount": 0,
                    "discountRate": 0,
                    "proratedDiscount": 0,
                    "discountAmount": 0,
                    "discountAmountInLcy": 0,
                    "taxType": "",
                    "taxRate": 0,
                    "taxAmount": 0,
                    "taxAmountInLcy": 0,
                    "amountExcludingTax": amount,
                    "amountExcludingTaxInLcy": (amount * exchangerate),
                    "amountIncludingTax": amount,
                    "amountIncludingTaxInLcy": (amount * exchangerate),
                    "baseUom": "",
                    "hsCode": "",
                    "unitWeightInKg": 0,
                    "orderedWeightInKg": 0,
                    "unitVolumeInM3": 0,
                    "orderedVolumeInM3": 0,
                    "baseWeightInKg": 0,
                    "baseVolumeInM3": 0,
                    "systemCreatedBy": objCreatedBy.entityid,
                    "systemCreatedAt": formatDateToEcoSystem(createddate),
                    "systemEditedAt": formatDateToEcoSystem(lastmodifieddate),
                    "systemEditedBy": objCurUserEdit.entityid,
                    "status": {
                        "externalId": isclosed === true ? "CLD" : "APV"
                    }
                };

                let obj_find_item = arrItem.find(e => e.id == item_id);
                if(!!obj_find_item) {
                    let weight = obj_find_item.weight * 1;
                    let item_measure = obj_find_item.custitem_boc_item_measure * 1;

                    objSublist.hsCode = obj_find_item.custitem_boc_hscode?.toString() || "";
                    objSublist.baseUom = obj_find_item.baseunit_name || "";

                    objSublist.unitWeightInKg = (weight * unitconversionrate) / 1000;
                    objSublist.unitVolumeInM3 = (item_measure * unitconversionrate);
                    objSublist.baseWeightInKg = (weight / 1000);
                    objSublist.baseVolumeInM3 = item_measure;

                    if(objSublist.orderedUom == objSublist.baseUom) {
                        objSublist.orderedWeightInKg = (quantity * weight) / 1000;
                        objSublist.orderedVolumeInM3 = (quantity * item_measure);
                    } else {
                        objSublist.orderedWeightInKg = (quantity * (unitconversionrate * weight)) / 1000;
                        objSublist.orderedVolumeInM3 = (quantity * (unitconversionrate * item_measure));
                    }

                    totalOrderedWeightInKg += objSublist.orderedWeightInKg;
                    totalOrderedM3 += objSublist.orderedVolumeInM3;
                }
                roundDecimalNumberInObj(objSublist, [
                    "orderedQty", "qtyPerOrderedUom", "baseQty", "currencyRate", "unitCostExcludingTax", "unitCostExcludingTaxInLcy", 
                    "unitCostIncludingTax", "unitCostIncludingTaxInLcy", "unitDiscount", "discountRate", "proratedDiscount", "discountAmount", 
                    "discountAmountInLcy", "taxRate", "taxAmount", "taxAmountInLcy", "amountExcludingTax", "amountExcludingTaxInLcy", "amountIncludingTax", 
                    "amountIncludingTaxInLcy", "unitWeightInKg","orderedWeightInKg","unitVolumeInM3","orderedVolumeInM3","baseWeightInKg",
                    "baseVolumeInM3"
                ]);
                // push data object
                arrSublist.push(objSublist);
            }

            let data = {
                "externalId": toRec.id.toString(),
                "transferOrderType": {
                    "externalId": ""
                },
                "documentNo": toRec.getValue("tranid"),
                "sourceTransactionCode": toRec.getText("custbody_scv_transfer_type"),
                "documentDate": formatDateToEcoSystem(trandate),
                "expectedDeliveryDate": formatDateToEcoSystem(oversea_ship_date),
                "department": {
                    "externalId": department
                },
                "project": toRec.getValue("cseg_scv_sg_proj"),
                "saleChannel": toRec.getValue("cseg_scv_channel"),
                "fromSubsidiary": {
                    "externalId": toRec.getValue("subsidiary"),
                },
                "fromLocationCode": objFromLocation.custrecord_scv_location_code || "",
                "fromLegacyLocationCode": "",
                "fromLocationName": objFromLocation.name || "",
                "fromLocationDescription": "",
                "fromLocationType": objFromLocation.locationtype?.toString() || "",
                "fromLocationAddressLine1": objFromLocation.addr1 || objFromLocation.addressee || "",
                "fromLocationAddressLine2": objFromLocation.addr2 || "",
                "fromLocationAddressLine3": objFromLocation.addr3 || "",
                "fromLocationPostalCode": objFromLocation.zip || "",
                "fromLocationState": objFromLocation.state || "",
                "fromLocationCountry": objFromLocation.country || "",
                "fromLocationPhoneNo": "",
                "fromLocationFaxNo": "",
                "fromLocationEmail": objFromLocation.custrecord_scv_location_mail || "",
                "toSubsidiary": {
                    "externalId": toRec.getValue("tosubsidiary"),
                },
                "toLocationCode": objToLocation.custrecord_scv_location_code || "",
                "toLegacyLocationCode": "",
                "toLocationDescription": "",
                "toLocationName": objToLocation.name || "",
                "toLocationType": objToLocation.locationtype?.toString() || "",
                "toLocationAddressLine1": objToLocation.addr1 || objToLocation.addressee || "",
                "toLocationAddressLine2": objToLocation.addr2 || "",
                "toLocationAddressLine3": objToLocation.addr3 || "",
                "toLocationPostalCode": objToLocation.zip || "",
                "toLocationState": objToLocation.state || "",
                "toLocationCountry": objToLocation.country || "",
                "toLocationPhoneNo": "",
                "toLocationFaxNo": "",
                "toLocationEmail": objToLocation.custrecord_scv_location_mail || "",
                "incoterm": {
                    "externalId": toRec.getValue("incoterm")
                },
                "shipmentCarrierCode": toRec.getValue("shipcarrier") || "",
                "shipmentCarrierName": toRec.getText("shipcarrier") || "",
                "shippingMethod": toRec.getValue("shipmethod"),
                "taxType": "",
                "taxRate": 0,
                "totalDiscount": 0,
                "totalDiscountInLcy": 0,
                "totalTaxAmount": 0,
                "totalTaxAmountInLcy": 0,
                "totalAmountExcludingDiscount": total,
                "totalAmountExcludingDiscountInLcy": (total * exchangerate),
                "totalAmountExcludingTax": total,
                "totalAmountExcludingTaxInLcy": (total * exchangerate),
                "totalAmountIncludingTax": total,
                "totalAmountIncludingTaxInLcy": (total * exchangerate),
                "totalLine": totalLine,
                "totalOrderedQty": toRec.getValue("custbody_scv_ito_order_qty") * 1,
                "totalOrderedWeightInKg": totalOrderedWeightInKg,
                "totalOrderedM3": totalOrderedM3,
                "remarks": toRec.getValue("memo"),
                "memo": toRec.getValue("memo"),
                "referenceNo1": toRec.getValue("custbody_scv_container_no"),
                "referenceNo2": "",
                "status": {
                    "externalId": orderstatus == "H" ? "CLD" : "APV"
                },
                "reasonForCancellationOrClosure": toRec.getValue("custbody_scv_reason_close"),
                "systemCreatedBy": objCreatedBy.entityid,
                "systemCreatedAt": formatDateToEcoSystem(createddate),
                "systemEditedAt": formatDateToEcoSystem(lastmodifieddate),
                "systemEditedBy": objCurUserEdit.entityid,
                "employee": {
                    "externalId": toRec.getValue("employee")
                },
                "transferOrderType": {
                    "externalId": getTransferOrderType(objFromLocation, icto),
                },
                "crossDockNo": toRec.getText("custbody_boc_cd_code"),
                "details": arrSublist
            };

            // TODO: 2025-06-11: đồng bộ thêm record transfer order và thêm điều icto = F thì ko truyền to subsidiary
            if(icto === "F" || icto === false) {
                delete data["toSubsidiary"];
            }

            roundDecimalNumberInObj(data, [
                "taxRate", "totalDiscount", "totalDiscountInLcy", "totalTaxAmount", "totalTaxAmountInLcy", "totalAmountExcludingDiscount", 
                "totalAmountExcludingDiscountInLcy", "totalAmountExcludingTaxInLcy", "totalAmountIncludingTax", 
                "totalAmountIncludingTaxInLcy", "totalOrderedQty", "totalOrderedWeightInKg", "totalOrderedM3"
            ]);
            return data;
        }

        const getTransferOrderType = (objFromLocation, icto) => {
            let type = "";
            // to
            if(icto === "F" || icto === false) {
                type = (objFromLocation.custrecord_boc_location_wh == LocationType.Warehouse.ID) ? "1" : "3";
            } 
            // ito
            else {
                type = (objFromLocation.custrecord_boc_location_wh == LocationType.Warehouse.ID) ? "2" : "4";
            }
            return type;
        }

        const getDataObjPurchaseOrder = (objRecData, rectype) => {
            const poRec = getCurrentRecord(rectype, objRecData.id);

            let orderstatus = poRec.getValue("orderstatus");
            let subsidiary = poRec.getValue("subsidiary");
            let department = poRec.getValue("department");
            let entity = poRec.getValue("entity");
            let trandate = poRec.getValue("trandate");
            let location = poRec.getValue("location");
            let receipt_date_po = poRec.getValue("custbody_scv_expect_recp_date_po");
            let oversea_ship_date = poRec.getValue("custbody_scv_oversea_ship_date");
            let expired_date = poRec.getValue("custbody_scv_expired_date");
            let currency = poRec.getValue("currencyname");
            let exchangerate = poRec.getValue("exchangerate");
            let taxtotal = poRec.getValue("taxtotal") * 1;
            let total = poRec.getValue("total") * 1;
            let subtotal = poRec.getValue("subtotal") * 1;

            let createddate = poRec.getValue("createddate");
            let lastmodifieddate = poRec.getValue("lastmodifieddate");
            let recordcreatedby = poRec.getValue("recordcreatedby");
            let currentuseredit = poRec.getValue("custbody_scv_current_user_edit");

            let arrLocation = queryDataLocOnTransaction([location]);
            let arrEmployee = queryDataEmployee([recordcreatedby, currentuseredit]);
            
            let objCreatedBy = arrEmployee.find(e => e.id == recordcreatedby) || {};
            let objCurUserEdit = arrEmployee.find(e => e.id == currentuseredit) || {};
            let objLocation = arrLocation.find(e => e.id == location) || {};
            let objDepartment = getDataDepOnTransaction(department);
            let objVendor = getDataVendorOnTransaction(entity);
            let objSubsidiary = getDataObjSubsidiary({id: subsidiary}, "subsidiary");
            // get data sublist
            let sl = "item";
            let totalLine = poRec.getLineCount(sl);
            let arrItem = getDataItemOnTransaction(poRec, sl, totalLine);

            let arrSublist = [];
            let totalQty = 0, totalOrderedWeightInKg = 0, totalOrderedM3 = 0;
            for(let i = 0; i < totalLine; i++) {
                let item_id = poRec.getSublistValue(sl, "item", i);
                let rate = poRec.getSublistValue(sl, "rate", i) * 1;
                let tax1amt = poRec.getSublistValue(sl, "tax1amt", i) * 1;
                let amount = poRec.getSublistValue(sl, "amount", i) * 1;
                let grossamt = poRec.getSublistValue(sl, "grossamt", i) * 1;
                let unitconversionrate = poRec.getSublistValue(sl, "unitconversionrate", i) * 1;
                let quantity = poRec.getSublistValue(sl, "quantity", i) * 1;
                let isclosed = poRec.getSublistValue(sl, "isclosed", i);
                let rate_taxinlcy = rate * exchangerate;
                let unitcost_taxincly = (rate + tax1amt) * exchangerate;
                // total
                totalQty += quantity;

                let objSublist = {
                    "lineNumber": poRec.getSublistValue(sl, "line", i) * 1,
                    "itemBarcode": "",
                    "itemCode": poRec.getSublistValue(sl, "item_display", i),
                    "legacyItemCode": "",
                    "itemDescription": poRec.getSublistValue(sl, "description", i),
                    "supplierItemCode": poRec.getSublistValue(sl, "custcol_scv_po_sup_barcode", i),
                    "orderedUom": poRec.getSublistValue(sl, "units_display", i),
                    "orderedQty": quantity,
                    "qtyPerOrderedUom": unitconversionrate,
                    "baseQty": (unitconversionrate * quantity),
                    "unitCostExcludingTax": rate,
                    "unitCostExcludingTaxInLcy": rate_taxinlcy,
                    "unitCostIncludingTax": (rate + tax1amt),
                    "unitCostIncludingTaxInLcy": unitcost_taxincly,
                    "currencyCode": currency,
                    "currencyRate": exchangerate,
                    "unitDiscount": 0,
                    "discountRate": 0,
                    "proratedDiscount": 0,
                    "discountAmount": 0,
                    "discountAmountInLcy": 0,
                    "taxType": poRec.getSublistValue(sl, "taxcode_display", i),
                    "taxRate": poRec.getSublistValue(sl, "taxrate1", i) * 1,
                    "taxAmount": tax1amt,
                    "taxAmountInLcy": (tax1amt * exchangerate),
                    "amountExcludingTax": amount,
                    "amountExcludingTaxInLcy": (amount * exchangerate),
                    "amountIncludingTax": grossamt,
                    "amountIncludingTaxInLcy": (grossamt * exchangerate),
                    "systemCreatedBy": objCreatedBy.entityid || "",
                    "originalDocumentLineNumber": poRec.getSublistValue(sl, "custcol_scv_origin_line_num", i) || "",
                    "baseUom": "",
                    "orderedWeightInKg": 0,
                    "orderedVolumeInM3": 0,
                    "unitWeightInKg": 0,
                    "unitVolumeInM3": 0,
                    "baseWeightInKg": 0,
                    "baseVolumeInM3": 0,
                    "hsCode": "",
                    "systemCreatedAt": formatDateToEcoSystem(createddate),
                    "systemEditedAt": formatDateToEcoSystem(lastmodifieddate),
                    "systemEditedBy": objCurUserEdit.entityid || "",
                    "status": {
                        "externalId": isclosed === true ? "CLD" : "APV"
                    }
                };

                let obj_find_item = arrItem.find(e => e.id == item_id);
                if(!!obj_find_item) {
                    let weight = obj_find_item.weight * 1;
                    let item_measure = obj_find_item.custitem_boc_item_measure * 1;

                    objSublist.hsCode = obj_find_item.custitem_boc_hscode?.toString() || "";
                    objSublist.baseUom = obj_find_item.baseunit_name || "";
                    objSublist.baseWeightInKg = (weight / 1000);
                    objSublist.baseVolumeInM3 = item_measure;
                    objSublist.unitWeightInKg = (weight * unitconversionrate) / 1000;
                    objSublist.unitVolumeInM3 = (item_measure * unitconversionrate);

                    if(objSublist.orderedUom == objSublist.baseUom) {
                        objSublist.orderedWeightInKg = (quantity * weight) / 1000;
                        objSublist.orderedVolumeInM3 = (quantity * item_measure);
                    } else {
                        objSublist.orderedWeightInKg = (quantity * (unitconversionrate * weight)) / 1000;
                        objSublist.orderedVolumeInM3 = (quantity * (unitconversionrate * item_measure));
                    }
                    // total
                    totalOrderedWeightInKg += objSublist.orderedWeightInKg;
                    totalOrderedM3 += objSublist.orderedVolumeInM3;
                }
                roundDecimalNumberInObj(objSublist, [
                    "orderedQty", "qtyPerOrderedUom", "baseQty", "currencyRate", "unitCostExcludingTax", "unitCostExcludingTaxInLcy", 
                    "unitCostIncludingTax", "unitCostIncludingTaxInLcy", "unitDiscount", "discountRate", "proratedDiscount", "discountAmount", 
                    "discountAmountInLcy", "taxRate", "taxAmount", "taxAmountInLcy", "amountExcludingTax", "amountExcludingTaxInLcy", "amountIncludingTax", 
                    "amountIncludingTaxInLcy", "unitWeightInKg", "orderedWeightInKg", "unitVolumeInM3", "orderedVolumeInM3", "baseWeightInKg", "baseVolumeInM3"
                ]);
                // push data object
                arrSublist.push(objSublist);
            }

            let data = {
                "externalId": poRec.id.toString(),
                "subsidiary": {
                    "externalId": subsidiary
                },
                "documentNo": poRec.getValue("tranid"),
                "sourceTransactionCode": poRec.getText("custbody_scv_po_type"),
                "documentDate": formatDateToEcoSystem(trandate),
                "expectedReceiptDate": formatDateToEcoSystem(receipt_date_po),
                "billOfLadingDate": formatDateToEcoSystem(oversea_ship_date),
                "expiryDate": formatDateToEcoSystem(expired_date),
                "actualCloseDocumentDate": formatDateToEcoSystem(expired_date),
                "department": {
                    "externalId": department
                },
                "buyerCode": poRec.getText("subsidiary"),
                "buyerName": poRec.getText("subsidiary"),
                "buyerCompanyRegistrationNo": "",
                "buyerTaxIdentificationNo": "",
                "buyerGstRegistrationNo": "",
                "buyerAddressLine1": objSubsidiary.addressLine1,
                "buyerAddressLine2": objSubsidiary.addressLine2,
                "buyerAddressLine3": objSubsidiary.addressLine3,
                "buyerPostalCode": objSubsidiary.postalCode,
                "buyerState": objSubsidiary.state,
                "buyerCountry": objSubsidiary.country.externalId,
                "buyerPhoneNo": objSubsidiary.phoneNo,
                "buyerFaxNo": objSubsidiary.faxNo,
                "buyerEmail": objSubsidiary.email,
                "buyerDepartmentCode": department,
                "buyerDepartmentDescription": objDepartment.custrecord_scv_memo_dept,
                "vendorCode": objVendor.entityid,
                "legacyVendorCode": "",
                "vendorName": poRec.getText("entity"),
                "vendorTaxIdentificationNo": "",
                "vendorGstRegistrationNo": "",
                "vendorCompanyRegistrationNo": objVendor.custentity_scv_tax_number || "",
                "vendorAddressLine1": objVendor.addr1 || "",
                "vendorAddressLine2": objVendor.addr2 || "",
                "vendorAddressLine3": objVendor.addr3 || "",
                "vendorPostalCode": objVendor.zip || "",
                "vendorState": objVendor.state || "",
                "vendorCountry": objVendor.country || "",
                "vendorContactName": objVendor.contact || "",
                "vendorPhoneNo": objVendor.custentity_scv_phone_no || "",
                "vendorFaxNo": objVendor.fax || "",
                "vendorEmail": objVendor.email || "",
                "location": {
                    "externalId": location
                },
                "locationCode": objLocation.custrecord_scv_location_code || "",
                "legacyLocationCode": "",
                "locationFaxNo": "",
                "locationPhoneNo": "",
                "locationDescription": "",
                "locationName": objLocation.name || "",
                "locationType": objLocation.locationtype?.toString() || "",
                "locationAddressLine1": objLocation.addr1 || objLocation.addressee || "",
                "locationAddressLine2": objLocation.addr2 || "",
                "locationAddressLine3": objLocation.addr3 || "",
                "locationPostalCode": objLocation.zip || "",
                "locationState": objLocation.state || "",
                "locationCountry": objLocation.country || "",
                "locationEmail": objLocation.custrecord_scv_location_mail || "",
                "totalDiscount": 0,
                "totalDiscountInLcy": 0,
                "totalTaxAmount": taxtotal,
                "totalTaxAmountInLcy": (taxtotal * exchangerate),
                "totalAmountExcludingDiscount": total,
                "totalAmountExcludingDiscountInLcy": (total * exchangerate),
                "totalAmountExcludingTax": subtotal,
                "totalAmountExcludingTaxInLcy": (subtotal * exchangerate),
                "totalAmountIncludingTax": total,
                "totalAmountIncludingTaxInLcy": (total * exchangerate),
                "termsCode": poRec.getText("terms"),
                "termsDescription": poRec.getText("terms"),
                "currencyCode": currency,
                "currencyRate": exchangerate,
                "taxType": "",
                "taxRate": 0,
                "totalLine": totalLine,
                "totalOrderedQty": totalQty,
                "totalOrderedWeightInKg": totalOrderedWeightInKg,
                "totalOrderedM3": totalOrderedM3,
                "remarks": poRec.getValue("custbody_scv_purchase_note"),
                "memo": poRec.getValue("memo"),
                "referenceNo1": poRec.getValue("custbody_scv_container_no"),
                "referenceNo2": "",
                "reasonForCancellationOrClosure": poRec.getValue("custbody_scv_reason_close"),
                "isExcludedForServiceLevelAgreementReport": false,
                "systemCreatedAt": formatDateToEcoSystem(createddate),
                "systemCreatedBy": objCreatedBy.entityid || "",
                "systemEditedAt": formatDateToEcoSystem(lastmodifieddate),
                "systemEditedBy": objCurUserEdit.entityid || "",
                "employee": {
                    "externalId": poRec.getValue("employee")
                },
                "status": {
                    "externalId": orderstatus == "H" ? "CLD" : "APV"
                },
                "purchaseOrderType": {
                    "externalId": "1"
                },
                "isVanSales": poRec.getValue("custbody_boc_is_van_sale"),
                "referenceDocumentNumber": poRec.getValue("custbody_boc_ref_doc_number"),
                "details": arrSublist,
            };
            roundDecimalNumberInObj(data, [
                "currencyRate", "taxRate", "totalDiscount", "totalDiscountInLcy", "totalTaxAmount", "totalTaxAmountInLcy", "totalAmountExcludingDiscount", 
                "totalAmountExcludingDiscountInLcy", "totalAmountExcludingTax", "totalAmountExcludingTaxInLcy", "totalAmountIncludingTax", "totalAmountIncludingTaxInLcy", 
                "totalOrderedQty", "totalOrderedWeightInKg", "totalOrderedM3"
            ]);

            return data;
        }

        const getDataObjItemFulfillment = (objRecData, rectype) => {
            const itfRec = getCurrentRecord(rectype, objRecData.id);
            // header
            let trandate = itfRec.getValue("trandate");
            let createdfrom = itfRec.getValue("createdfrom");

            let currency = itfRec.getValue("currencycode");
            let createddate = itfRec.getValue("createddate");
            let lastmodifieddate = itfRec.getValue("lastmodifieddate");
            let recordcreatedby = itfRec.getValue("recordcreatedby");
            let currentuseredit = itfRec.getValue("custbody_scv_current_user_edit");

            let arrEmployee = queryDataEmployee([recordcreatedby, currentuseredit]);
            let objCreatedBy = arrEmployee.find(e => e.id == recordcreatedby) || {};
            let objCurUserEdit = arrEmployee.find(e => e.id == currentuseredit) || {};

            let createdfromtype = lbf.getTranRecordType(createdfrom);
            let objTranRec = getDataCreatedFromIF(itfRec, createdfromtype, createdfrom);
            // sublist
            let arrSublist = [];
            let sl = "item";
            let totalLine = itfRec.getLineCount(sl);

            let arrItem = getDataItemOnTransaction(itfRec, sl, totalLine);
            let total = 0, totalOrderedWeightInKg = 0, totalOrderedM3 = 0;
            let arrSlTranRec = objTranRec.sublist;

            for(let i = 0; i < totalLine; i++) {
                let item = itfRec.getSublistValue(sl, "item", i);
                let originalLineNum = itfRec.getSublistValue(sl, "custcol_scv_origin_line_num", i) || "";
                let quantity = itfRec.getSublistValue(sl, "quantity", i) * 1;
                let unitconversionrate = itfRec.getSublistValue(sl, "unitconversion", i) * 1;

                let obj_find_tranrec = arrSlTranRec.find(e => e.item == item && e.origin_line_num == originalLineNum) || {};
                let rate = obj_find_tranrec?.rate || 0;
                let amount = quantity * rate;
                let isclosed = obj_find_tranrec?.isclosed || false;
                
                let objSublist = {
                    "lineNumber": itfRec.getSublistValue(sl, "line", i) * 1,
                    "originalDocumentLineNumber": originalLineNum,
                    "itemBarcode": "",
                    "legacyItemCode": "",
                    "itemCode": itfRec.getSublistValue(sl, "itemname", i),
                    "itemDescription": itfRec.getSublistValue(sl, "description", i),
                    "orderedUom": itfRec.getSublistValue(sl, "unitsdisplay", i),
                    "orderedQty": quantity,
                    "qtyPerOrderedUom": unitconversionrate,
                    "baseQty": (unitconversionrate * quantity),
                    "currencyCode": currency,
                    "currencyRate": objTranRec.exchangerate,
                    "unitCostExcludingTax": rate,
                    "unitCostExcludingTaxInLcy": (rate * objTranRec.exchangerate),
                    "unitCostIncludingTax": rate,
                    "unitCostIncludingTaxInLcy": (rate * objTranRec.exchangerate),
                    "unitDiscount": 0,
                    "discountRate": 0,
                    "proratedDiscount": 0,
                    "discountAmount": 0,
                    "discountAmountInLcy": 0,
                    "taxType": "",
                    "taxRate": 0,
                    "taxAmount": 0,
                    "taxAmountInLcy": 0,
                    "amountExcludingTax": amount,
                    "amountExcludingTaxInLcy": (amount * objTranRec.exchangerate),
                    "amountIncludingTax": amount,
                    "amountIncludingTaxInLcy": (amount * objTranRec.exchangerate),
                    "unitWeightInKg": 0,
                    "orderedWeightInKg": 0,
                    "unitVolumeInM3": 0,
                    "orderedVolumeInM3": 0,
                    "baseWeightInKg": 0,
                    "baseVolumeInM3": 0,
                    "hsCode": "",
                    "baseUom": "",
                    "systemCreatedBy": objCreatedBy.entityid,
                    "systemCreatedAt": formatDateToEcoSystem(createddate),
                    "systemEditedAt": formatDateToEcoSystem(lastmodifieddate),
                    "systemEditedBy": objCurUserEdit.entityid,
                    "status": {
                        "internalId": isclosed === true ? constILTranstatus.ILStatus.Closed.ID : constILTranstatus.ILStatus.Approved.ID
                    }
                };

                let obj_find_item = arrItem.find(e => e.id == item);
                if(!!obj_find_item) {
                    let weight = obj_find_item.weight * 1;
                    let item_measure = obj_find_item.custitem_boc_item_measure * 1;

                    objSublist.hsCode = obj_find_item.custitem_boc_hscode?.toString() || "";
                    objSublist.baseUom = obj_find_item.baseunit_name || "";

                    objSublist.unitWeightInKg = (weight * unitconversionrate) / 1000;
                    objSublist.unitVolumeInM3 = (item_measure * unitconversionrate);
                    objSublist.baseWeightInKg = (weight / 1000);
                    objSublist.baseVolumeInM3 = item_measure;

                    if(objSublist.orderedUom == objSublist.baseUom) {
                        objSublist.orderedWeightInKg = (quantity * weight) / 1000;
                        objSublist.orderedVolumeInM3 = (quantity * item_measure);
                    } else {
                        objSublist.orderedWeightInKg = (quantity * (unitconversionrate * weight)) / 1000;
                        objSublist.orderedVolumeInM3 = (quantity * (unitconversionrate * item_measure));
                    }

                    totalOrderedWeightInKg += objSublist.orderedWeightInKg;
                    totalOrderedM3 += objSublist.orderedVolumeInM3;
                }

                roundDecimalNumberInObj(objSublist, [
                    "orderedQty", "qtyPerOrderedUom", "baseQty", "currencyRate", "unitCostExcludingTax", "unitCostExcludingTaxInLcy", 
                    "unitCostIncludingTax", "unitCostIncludingTaxInLcy", "unitDiscount", "discountRate", "proratedDiscount", "discountAmount", 
                    "discountAmountInLcy", "taxRate", "taxAmount", "taxAmountInLcy", "amountExcludingTax", "amountExcludingTaxInLcy", "amountIncludingTax", 
                    "amountIncludingTaxInLcy", "unitWeightInKg","orderedWeightInKg","unitVolumeInM3","orderedVolumeInM3","baseWeightInKg",
                    "baseVolumeInM3"
                ]);

                convertEmptyValueToNull(objSublist, [
                    "systemCreatedAt", "systemCreatedBy", "systemEditedAt", "systemEditedBy"
                ]);

                // push data object
                arrSublist.push(objSublist);
            }

            // request data
            let data = {
                "externalId": itfRec.id.toString(),
                "documentNo": itfRec.getValue("tranid"),
                "sourceTransactionCode": itfRec.getText("custbody_scv_transfer_type"),
                "documentDate": formatDateToEcoSystem(trandate),
                "expectedDeliveryDate": formatDateToEcoSystem(objTranRec.custbody_scv_oversea_ship_date),
                "project": itfRec.getValue("cseg_scv_sg_proj"),
                "saleChannel": itfRec.getValue("cseg_scv_channel"),
                "fromSubsidiary": {
                    "externalId": objTranRec.subsidiary
                },
                "department": {
                    "externalId": objTranRec.department
                },
                // "department": objTranRec.department,
                "fromLocationCode": objTranRec.location.custrecord_scv_location_code || "",
                "fromLegacyLocationCode": "",
                "fromLocationName": objTranRec.location.name || "",
                "fromLocationDescription": "",
                "fromLocationType": objTranRec.location.locationtype?.toString() || "",
                "fromLocationAddressLine1": objTranRec.location.addr1 || objTranRec.location.addressee || "",
                "fromLocationAddressLine2": objTranRec.location.addr2 || "",
                "fromLocationAddressLine3": objTranRec.location.addr3 || "",
                "fromLocationPostalCode": objTranRec.location.zip || "",
                "fromLocationState": objTranRec.location.state || "",
                "fromLocationCountry": objTranRec.location.country || "",
                "fromLocationPhoneNo": "",
                "fromLocationFaxNo": "",
                "fromLocationEmail": objTranRec.location.custrecord_scv_location_mail || "",
                "toSubsidiary": {
                    "externalId": objTranRec.tosubsidiary
                },
                "toLocationCode": objTranRec.transferlocation.custrecord_scv_location_code || "",
                "toLegacyLocationCode": "",
                "toLocationDescription": "",
                "toLocationName": objTranRec.transferlocation.name || "",
                "toLocationType": objTranRec.transferlocation.locationtype?.toString() || "",
                "toLocationAddressLine1": objTranRec.transferlocation.addr1 || objTranRec.transferlocation.addressee || "",
                "toLocationAddressLine2": objTranRec.transferlocation.addr2 || "",
                "toLocationAddressLine3": objTranRec.transferlocation.addr3 || "",
                "toLocationPostalCode": objTranRec.transferlocation.zip || "",
                "toLocationState": objTranRec.transferlocation.state || "",
                "toLocationCountry": objTranRec.transferlocation.country || "",
                "toLocationPhoneNo": "",
                "toLocationFaxNo": "",
                "toLocationEmail": objTranRec.transferlocation.custrecord_scv_location_mail || "",
                "incoterm": {
                    "externalId": itfRec.getValue("incoterm")
                },
                "shipmentCarrierCode": itfRec.getValue("shipcarrier") || "",
                "shipmentCarrierName": itfRec.getText("shipcarrier") || "",
                "shippingMethod": itfRec.getValue("shipmethod"),
                "taxType": "",
                "taxRate": 0,
                "totalDiscount": 0,
                "totalDiscountInLcy": 0,
                "totalTaxAmount": 0,
                "totalTaxAmountInLcy": 0,
                "totalAmountExcludingDiscount": total,
                "totalAmountExcludingDiscountInLcy": (total * objTranRec.exchangerate),
                "totalAmountExcludingTax": total,
                "totalAmountExcludingTaxInLcy": (total * objTranRec.exchangerate),
                "totalAmountIncludingTax": total,
                "totalAmountIncludingTaxInLcy": (total * objTranRec.exchangerate),
                "totalLine": totalLine,
                "totalOrderedQty": objTranRec.custbody_scv_ito_order_qty * 1,
                "totalOrderedWeightInKg": totalOrderedWeightInKg,
                "totalOrderedM3": totalOrderedM3,
                "remarks": itfRec.getValue("memo"),
                "memo": itfRec.getValue("memo"),
                "referenceNo1": objTranRec.tranid,
                "referenceNo2": objTranRec.referenceNo2 || "",
                "status": {
                    "internalId": constILTranstatus.getILTranStatusByOrderStatus(createdfromtype, objTranRec.orderstatus),
                },
                "reasonForCancellationOrClosure": objTranRec.custbody_scv_reason_close,
                "systemCreatedAt": formatDateToEcoSystem(createddate),
                "systemCreatedBy": objCreatedBy.entityid,
                "systemEditedAt": formatDateToEcoSystem(lastmodifieddate),
                "systemEditedBy": objCurUserEdit.entityid,
                "employee": {
                    "externalId": objTranRec.employee,
                },
                "referenceNo3": itfRec.getValue("custbody_boc_load_number"),
                "details": arrSublist
            };

            if(objTranRec.icto === "F" || objTranRec.icto === false) {
                delete data["toSubsidiary"];
            }

            roundDecimalNumberInObj(data, [
                "taxRate", "totalDiscount", "totalDiscountInLcy", "totalTaxAmount", "totalTaxAmountInLcy", "totalAmountExcludingTax", 
                "totalAmountExcludingTaxInLcy", "totalAmountIncludingTax", "totalAmountIncludingTaxInLcy", "totalAmountExcludingDiscount",
                "totalAmountExcludingDiscountInLcy", "totalLine", "totalOrderedQty", "totalOrderedWeightInKg", "totalOrderedM3"
            ]);
            convertEmptyValueToNull(data, [
                "department", "systemCreatedAt", "systemCreatedBy", 
                "systemEditedAt", "systemEditedBy",
            ]);

            return data;
        }

        const getDataCreatedFromIF = (itfRec, createdfromtype, createdfrom) => {
            let objRes = {
                sublist: []
            };
            if(!!createdfrom) {
                const tranRec = record.load({
                    type: createdfromtype,
                    id: createdfrom
                });

                objRes.icto = tranRec.getValue("icto");
                objRes.exchangerate = tranRec.getValue("exchangerate") || 1; 
                objRes.custbody_scv_oversea_ship_date = tranRec.getValue("custbody_scv_oversea_ship_date");
                objRes.department = tranRec.getValue("department");
                objRes.subsidiary = tranRec.getValue("subsidiary");
                objRes.tosubsidiary = tranRec.getValue("tosubsidiary");
                objRes.tranid = tranRec.getValue("tranid");
                objRes.statusRef = tranRec.getValue("statusRef");
                objRes.orderstatus = tranRec.getValue("orderstatus");
                objRes.custbody_scv_reason_close = tranRec.getValue("custbody_scv_reason_close");
                objRes.employee = tranRec.getValue("employee");
                objRes.custbody_scv_ito_order_qty = tranRec.getValue("custbody_scv_ito_order_qty");

                let memo = itfRec.getValue("memo");
                let location = tranRec.getValue("location");
                let transferlocation = tranRec.getValue("transferlocation");

                let arrLocation = queryDataLocOnTransaction([location, transferlocation]);
                let objFromLocation = arrLocation.find(e => e.id == location) || {};
                let objToLocation = arrLocation.find(e => e.id == transferlocation) || {};

                objRes.location = objFromLocation;
                objRes.transferlocation = objToLocation;

                if(objRes.location.custrecord_scv_location_code == "V65WTN") {
                    objRes.referenceNo2 = memo.replace("V65WTN-", "");
                } else {
                    objRes.referenceNo2 = memo;
                }

                // ! sublist
                let sl = "item";
                let lc = tranRec.getLineCount(sl);
                for(let i = 0; i < lc; i++) {
                    let objSublist = {
                        item: tranRec.getSublistValue(sl, "item", i),
                        origin_line_num: tranRec.getSublistValue(sl, "custcol_scv_origin_line_num", i),
                        rate: tranRec.getSublistValue(sl, "rate", i),
                        isclosed: tranRec.getSublistValue(sl, "isclosed", i),
                    };
                    objRes.sublist.push(objSublist);
                }
            }
            return objRes;
        }

        const getDataItemOnTransaction = (curRec, sl, totalLine) => {
            let objItemId = {};
            for (let i = 0; i < totalLine; i++) {
                let item_id = curRec.getSublistValue(sl, "item", i);
                if (objItemId[item_id] === undefined) {
                    objItemId[item_id] = item_id;
                }
            }
            let arrItemId = Object.values(objItemId);

            let resultSQL = query.runSuiteQL({
                query: `SELECT 
                    i.id, 
                    i.itemid, 
                    i.weight, 
                    i.custitem_boc_item_measure, 
                    i.custitem_boc_hscode, 
                    uom.unitname AS baseunit_name,
                    uom.internalid AS baseunit_id
                FROM 
                    item i
                LEFT JOIN 
                    unitstype ut ON i.unitstype = ut.id
                LEFT JOIN 
                    unitstypeUOM uom ON uom.unitstype = ut.id AND uom.baseunit = 'T'
                WHERE i.id IN ('${arrItemId.join("', '")}')`,
            });
            resultSQL = resultSQL.asMappedResults();
            return resultSQL;
        }

        const getDataObjEmployee = (objRecData, rectype) => {
            const empRec = getCurrentRecord(rectype, objRecData.id);
            let isinactive = empRec.getValue("isinactive");
            let objAddress = getDataAddressbookEmployee(empRec);

            let data = {
                "externalId": empRec.id.toString(),
                "subsidiary": {
                    "externalId": empRec.getValue("subsidiary")
                },
                "department": {
                    "externalId": empRec.getValue("department")
                },
                "class": {
                    "externalId": empRec.getValue("class")
                },
                "location": {
                    "externalId": empRec.getValue("location")
                },
                "employeeId": empRec.getValue("nameorig"),
                "salutation": empRec.getValue("salutation"),
                "firstName": empRec.getValue("firstname"),
                "middleName": empRec.getValue("middlename"),
                "lastName": empRec.getValue("lastname"),
                "fullName": empRec.getValue("custentity_scv_legal_name"),
                "initials": empRec.getValue("initials"),
                "jobTitle": empRec.getValue("title"),
                "supervisor": {
                    "externalId": empRec.getValue("supervisor"),
                },
                "currency": {
                    "externalId": empRec.getValue("currency"),
                },
                "email": empRec.getValue("email"),
                "phoneNo": empRec.getValue("custentity_scv_phone_no"),
                "officePhoneNo": empRec.getValue("officephone"),
                "mobilePhoneNo": empRec.getValue("mobilephone"),
                "homePhoneNo": empRec.getValue("homephone"),
                "faxNo": empRec.getValue("fax"),
                ...objAddress,
                "accountNumber": empRec.getValue("accountnumber"),
                "expenseApprover": {
                    "externalId": empRec.getValue("approver"),
                },
                "purchaseApprover": {
                    "externalId": empRec.getValue("purchaseorderapprover"),
                },
                "vendorMasterApprover": {
                    "externalId": null
                },
                "itemMasterApprover": {
                    "externalId": null
                },
                "vendorPricingApprover": {
                    "externalId": null
                },
                "salesPricingApprover": {
                    "externalId": null
                },
                "delegateApprover": {
                    "externalId": null
                },
                "einvoiceStartDate": ECO_DATE_REQUIRED,
                "notes": empRec.getValue("comments"),
                "isSalesRepresentative": empRec.getValue("issalesrep"),
                "isGiveAccess": empRec.getValue("giveaccess"),
                "isActive": !isinactive
            };
            return data;
        }
        const getDataAddressbookEmployee = (curRec) => {
            let objResult = {
                "addressLine1": "",
                "addressLine2": "",
                "addressLine3": "",
                "postalCode": "",
                "city": "",
                "state": "",
                "country": { "externalId": "" },
            };

            let sl = "addressbook";
            let totalLine = curRec.getLineCount(sl);
            for(let i = 0; i < totalLine; i++) {
                let defaultshipping = curRec.getSublistValue(sl, "defaultshipping", i);
                let defaultbilling = curRec.getSublistValue(sl, "defaultbilling", i);
                
                let addressSubRec = curRec.getSublistSubrecord({ sublistId: sl, fieldId: "addressbookaddress", line: i});
                if(defaultshipping === true || defaultbilling === true) {
                    objResult["addressLine1"] = addressSubRec.getValue("addr1") || addressSubRec.getValue("addressee");
                    objResult["addressLine2"] = addressSubRec.getValue("addr2");
                    objResult["addressLine3"] = addressSubRec.getValue("addr3");
                    objResult["postalCode"] = addressSubRec.getValue("zip");
                    objResult["city"] = addressSubRec.getValue("city");
                    objResult["state"] = addressSubRec.getValue("state");
                    objResult["country"] = { 
                        "externalId": addressSubRec.getValue("country")
                    };
                    break;
                }
            }
            return objResult;
        }

        const getDataVietNamUnit = (objRecData, rectype) => {
            const eInvUnitRec = getCurrentRecord(rectype, objRecData.id);
            let data = {
                "externalId": eInvUnitRec.id.toString(),
                "name": eInvUnitRec.getValue("name"),
            };
            return data;
        }

        const getDataContact = (objRecData, rectype) => {
            const contactRec = getCurrentRecord(rectype, objRecData.id);
            let objAddress = getDataAddressbookEntity(contactRec);

            let company = contactRec.getValue("company");
            let entityType = lbf.getEntityType(company);

            let data = {
                "externalId": contactRec.id.toString(),
                [entityType]: {
                    "externalId": company
                },
                "personName": contactRec.getValue("entityid"),
                "firstName": contactRec.getValue("firstname"),
                "middleName": contactRec.getValue("middlename"),
                "lastName": contactRec.getValue("lastname"),
                "jobTitle": contactRec.getValue("title"),
                "role": contactRec.getValue("contactrole"),
                "email": contactRec.getValue("email"),
                "mainPhone": contactRec.getValue("phone"),
                "phoneNo": contactRec.getValue("custentity_scv_phone_no"),
                "fax": contactRec.getValue("fax"),
                ...objAddress
            };
            
            return data;
        }

        const getDataObjLocation = (objRecData, rectype) => {
            const locRec = getCurrentRecord(rectype, objRecData.id);
            let isinactive = locRec.getValue("isinactive");
            let parent = locRec.getValue("parent");
            let subsidiary = locRec.getValue("subsidiary");
            let name = locRec.getValue("name");
            let opening_date = locRec.getValue("custrecord_scv_location_opendate");
            let closing_date = locRec.getValue("custrecord_scv_location_closedate");

            let loc_extension_id = locRec.getValue("custrecord_scv_loc_exten");
            let locAddressRec = locRec.getSubrecord({ fieldId: 'mainaddress' });
            let objLocExtension = getDataObjLocExtension(loc_extension_id);
            
            let data = {
                "externalId": locRec.id.toString(),
                "subsidiary": {
                    "externalId": subsidiary
                },
                "parentLocation": {},
                "displayName": name,
                "name": name,
                "locationCode": locRec.getValue("custrecord_scv_location_code"),
                "legacyLocationCode": "",
                "locationType": {
                    "externalId": locRec.getValue("locationtype")
                },
                "locationBanner": {
                    "externalId": null
                },
                "locationGroup": {
                    "externalId": null
                },
                "customer": {
                    "externalId": locRec.getValue("custrecord_boc_loc_cust_code") || ""
                },
                "primaryWarehouse": {
                    "externalId": ""
                },
                "outletEmail": locRec.getValue("custrecord_scv_location_mail"),
                "addressLine1": locAddressRec.getValue("addr1") || locAddressRec.getValue("addressee"),
                "addressLine2": locAddressRec.getValue("addr2"),
                "addressLine3": locAddressRec.getValue("addr3"),
                "postalCode": "",
                "city": locAddressRec.getValue("city"),
                "state": locAddressRec.getValue("state"),
                "country": {
                    "externalId": locAddressRec.getValue("country")
                },
                "documentNumberPrefix": locRec.getValue("tranprefix"),
                "transactionNumberPrefix": locRec.getValue("traninternalprefix"),
                "latitude": locRec.getValue("latitude") * 1,
                "longitude": locRec.getValue("longitude") * 1,
                "isActive": !isinactive,
                "defaultAllocationPriority": locRec.getValue("defaultallocationpriority") * 1,
                "isFirstLorry": false,
                "hasTrolley": false,
                "isInventoryAvailable": locRec.getValue("makeinventoryavailable"),
                "isSupplyPlanningIncluded": false,
                "isPostBySalesInvoice": true,
                "openDate": formatDateToEcoSystem(opening_date),
                "closeDate": formatDateToEcoSystem(closing_date),
                "leafioLicenseStartDate": ECO_DATE_REQUIRED,
                "leafioLicenseEndDate": ECO_DATE_REQUIRED,
                "outletCapacityEcoShop": 0,
                "outletCapacityEcoPlus": 0,
                "outletReference": {
                    "externalId": ""
                },
                "usedSystem": {
                    "externalId": locRec.getValue("custrecord_boc_loc_system"),
                },
                "storeReplenishmentDayOfWeek": "",
                ...objLocExtension
            };

            if(parent) {
                data.parentLocation.externalId = parent;
            } else {
                data.parentLocation.externalId = null;
            }
            return data;
        }

        const getDataObjLocExtension = (loc_extension_id) => {
            let objResult = {
                "storePriority": 0,
                "OperationGeneralManagerInternalId": "",
                "operationManager": {
                    "externalId": ""
                },
                "assistantAreaManager": {
                    "externalId": ""
                },
                "zoneManager": {
                    "externalId": ""
                },
                "operationGeneralManager": {
                    "externalId": ""
                },
                "areaCode": {
                    "externalId": ""
                },
                "outletSizeCluster": {
                    "externalId": ""
                },
                "outletSize": {
                    "externalId": ""
                },
                "floorSpaceInM2": 0,
                "lorryMaxTon": 0,
                "outletBayCount": 0,
                "outletStoreArea": 0,
                "outletDisplayArea": 0,
                "outletTotalArea": 0,
            };
            if(!!loc_extension_id) {
                const locExtenRec = record.load({ type: "customrecord_scv_location_extension", id: loc_extension_id });
                objResult = {
                    "storePriority": locExtenRec.getValue("custrecord_boc_loc_storepriority") * 1,
                    "OperationGeneralManagerInternalId": locExtenRec.getValue("custrecord_boc_location_pic5"),
                    "operationManager": {
                        "externalId": locExtenRec.getValue("custrecord_boc_location_pic1"),
                    },
                    "assistantAreaManager": {
                        "externalId": locExtenRec.getValue("custrecord_boc_location_pic2"),
                    },
                    "zoneManager": {
                        "externalId": locExtenRec.getValue("custrecord_boc_location_pic3"),
                    },
                    "operationGeneralManager": {
                        "externalId": locExtenRec.getValue("custrecord_boc_location_pic4"),
                    },
                    "areaCode": {
                        "externalId": locExtenRec.getValue("custrecord_boc_location_areacode") || "",
                    },
                    "outletSizeCluster": {
                        "externalId": locExtenRec.getValue("custrecord_boc_loc_outletsizecluster") || "",
                    },
                    "outletSize": {
                        "externalId": locExtenRec.getValue("custrecord_boc_loc_outletsize") || "",
                    },
                    "floorSpaceInM2": locExtenRec.getValue("custrecord_boc_loc_floorspace_m2") * 1,
                    "lorryMaxTon": locExtenRec.getValue("custrecord_boc_loc_lorrymaxm3") * 1,
                    "outletBayCount": locExtenRec.getValue("custrecord_boc_loc_outletbaycount") * 1,
                    "outletStoreArea": locExtenRec.getValue("custrecord_boc_loc_storearea") * 1,
                    "outletDisplayArea": locExtenRec.getValue("custrecord_boc_loc_outletdisplayarea") * 1,
                    "outletTotalArea": locExtenRec.getValue("custrecord_boc_loc_outlettotalarea") * 1,
                };
            }

            return objResult;
        }

        const getDataObjItem = (objRecData, rectype) => {
            const itemRec = getCurrentRecord(rectype, objRecData.id);
            let isinactive = itemRec.getValue("isinactive");
            let parent = itemRec.getValue("parent");
            let item_hierarchy = itemRec.getValue("custitem_boc_subclass2_item");
            let min_days_ship = (itemRec.getValue("custitem_boc_min_days_ship") || 0) * 1;
            let min_days_receive = (itemRec.getValue("custitem_boc_min_days_receive") || 0) * 1;
            let max_days_receive = (itemRec.getValue("custitem_boc_max_days_receive") || 0) * 1;
            let shelf_life_days = (itemRec.getValue("custitem_boc_shelf_life_days") || 0) * 1;
            let itemtype = itemRec.getValue("itemtype");
            if(!!itemtype) {
                itemtype = constItemType.getInternalIdByItemType(itemtype);
                // itemtype = constILItemTypeMap.getILItemTypeByTypeId(itemtype);
            }

            if(!!item_hierarchy) {
                let itemHierarchyLKF = search.lookupFields({
                    type: "customrecord_boc_subclass2_item_list",
                    id: item_hierarchy,
                    columns: ["custrecord_boc_code_itm"]
                });
                
                item_hierarchy = itemHierarchyLKF.custrecord_boc_code_itm;
            }

            let data = {
                "externalId": itemRec.id.toString(),
                "parentItem": {
                    "externalId": parent?.toString() || null
                },
                "tradeType": {
                    "externalId": itemRec.getValue("custitem_boc_trade_type")
                },
                "itemCode": itemRec.getValue("itemid"),
                "bcItemCode": "",
                "displayName": itemRec.getValue("displayname"),
                "vendorItemNameCode": itemRec.getValue("vendorname"),
                "stockDescription": itemRec.getValue("stockdescription"),
                "overseasPackagingDescription": itemRec.getValue("custitem_boc_oversea_pkgdesc"),
                "purchaseDescription": itemRec.getValue("purchasedescription"),
                "priceLabelDescription": itemRec.getValue("custitem_boc_pricelabel_desc"),
                "originType": {
                    "externalId": itemRec.getValue("custitem_boc_local_oversea")
                },
                "productEntity": {
                    "externalId": null
                },
                "itemBrand": {
                    "externalId": itemRec.getValue("custitem_boc_home_brand")
                },
                "primaryVendor": {
                    "externalId": itemRec.getValue("custitem_boc_primary_vendor")
                },
                "isConsignment": false,
                "isReorder": itemRec.getValue("custitem_boc_reorder"),
                "reorderReason": itemRec.getValue("custitem_boc_reorder_reason"),
                "rqStatus": {
                    "externalId": itemRec.getValue("custitem_boc_rq_status")
                },
                "productSeasonalType": itemRec.getValue("custitem_boc_product_seasonal_type"),
                "isReturnable": itemRec.getValue("custitem_eco_item_return_supplier"),
                "isOpenPriceFlag": itemRec.getValue("custitem_boc_open_price"),
                "primaryUnitsType": {
                    "externalId": itemRec.getValue("unitstype"),
                },
                "primaryBaseUnit": {
                    "externalId": itemRec.getValue("baseunit"),
                },
                "primaryStockUnit": {
                    "externalId": itemRec.getValue("stockunit"),
                },
                "primaryPurchaseUnit": {
                    "externalId": itemRec.getValue("purchaseunit"),
                },
                "primarySaleUnit": {
                    "externalId": itemRec.getValue("saleunit"),
                },
                "primaryConsumptionUnit": {
                    "externalId": itemRec.getValue("consumptionunit"),
                },
                // "einvoiceUnit": {
                // 	"externalId": itemRec.getValue("custitem_scv_einvoice_unit"),
                // },
                "subEinvoiceUnit": {
                    "externalId": itemRec.getValue("custitem_scv_einvoice_unit"),
                },
                "itemImageName": "",
                "itemHierarchy": {
                    "externalId": item_hierarchy,
                    // "externalId": itemRec.getValue("custitem_boc_subclass2_item"),
                },
                "displayMethod": {
                    "externalId": itemRec.getValue("custitem_boc_display_method"),
                },
                "bcItemCategoryCode": "",
                "itemBuyerGroup": {
                    "externalId": itemRec.getValue("custitem_boc_item_buyer_grp"),
                },
                "cartonHeightCm": itemRec.getValue("custitem_boc_ctn_height") * 1,
                "cartonLengthInCm": itemRec.getValue("custitem_boc_ctn_length") * 1,
                "cartonWidthInCm": itemRec.getValue("custitem_boc_ctn_width") * 1,
                "cartonVolumeInM3": itemRec.getValue("custitem_boc_volume") * 1,
                "eachesHeightInCm": itemRec.getValue("custitem_boc_ea_height") * 1,
                "eachesLengthInCm": itemRec.getValue("custitem_boc_ea_length") * 1,
                "eachesWidthInCm": itemRec.getValue("custitem_boc_ea_width") * 1,
                "eachesVolumeInM3": itemRec.getValue("custitem_boc_item_measure") * 1,
                "eachesWeightInGram": itemRec.getValue("weight") * 1,
                "innerFraction": itemRec.getValue("custitem_scv_packing_uom_con_rate_iner") * 1,
                "cartonFraction": itemRec.getValue("custitem_scv_packing_uom_con_rate") * 1,
                "department": {
                    "externalId": itemRec.getValue("department"),
                },
                "class": {
                    "externalId": itemRec.getValue("class"),
                },
                "location": {
                    "externalId": itemRec.getValue("location"),
                },
                "costingMethod": {
                    "externalId": itemRec.getValue("costingmethod"),
                },
                "isMatchBillToReceipt": true,
                "manufacturer": itemRec.getValue("manufacturer"),
                "manufacturerPartNumber": itemRec.getValue("mpn"),
                "countryOfManufacturer": {
                    "externalId": itemRec.getValue("countryofmanufacture"),
                },
                "warehouseGroup": {
                    "externalId": null
                },
                "productCluster": {
                    "externalId": itemRec.getValue("custitem_boc_product_cluster"),
                },
                "packCode": {
                    "externalId": itemRec.getValue("custitem_boc_pack_code"),
                },
                "orderMultiplePurchase": 0,
                "minimumOrderQuantityPurchase": itemRec.getValue("custitem_boc_po_moq") * 1,
                "dateControl": {
                    "externalId": itemRec.getValue("custitem_boc_date_ctrl"),
                },
                "allocationType": {
                    "externalId": itemRec.getValue("custitem_boc_allocation_type"),
                },
                "isFastExpiration": itemRec.getValue("custitem_boc_fast_exp"),
                "minDaysToShip": min_days_ship?.toString(),
                "minDaysToReceive": min_days_receive?.toString(),
                "maxDaysToReceive": max_days_receive?.toString(),
                "shelfLifeDays": shelf_life_days?.toString(),
                "isEcoFriendly": itemRec.getValue("custitem_boc_eco_friendly"),
                "packagingType": {
                    "externalId": null
                },
                "top250ControlMonthStock": 0,
                "isLicenseProduct": false,
                "isApplicableToEastMalaysia": false,
                "generalProductPostingGroup": {
                    "externalId": null
                },
                "banner": {
                    "externalId": null
                },
                "stockType": {
                    "externalId": null
                },
                "hsCode": {
                    "externalId": itemRec.getValue("custitem_boc_hscode")
                },
                "specialHandlingIndicator": {
                    "externalId": itemRec.getValue("custitem_boc_spec_handling")
                },
                "itemStatus": {
                    "externalId": itemRec.getValue("custitem_boc_item_status")
                },
                "replenishmentMethod": {
                    "externalId": null
                },
                "alternateSourceItem": {
                    "externalId": null
                },
                "isAutoPurchaseLeadTime": itemRec.getValue("autoleadtime"),
                "isAutoPo": itemRec.getValue("custitem_boc_autopo"),
                "ownTransportRebateType": {
                    "externalId": null
                },
                "ownTransportRebatePrice": 0,
                "palletFraction": itemRec.getValue("custitem_boc_pallet_fraction") * 1,
                "qtyRestrictionGrouping": {
                    "externalId": null
                },
                "itemStorageCondition": {
                    "externalId": null
                },
                "vatProductPostingGroup": {
                    "externalId": null
                },
                "cogsAccount": {
                    "externalId": itemRec.getValue("cogsaccount")
                },
                "assetAccount": {
                    "externalId": itemRec.getValue("assetaccount")
                },
                "incomeAccount": {
                    "externalId": itemRec.getValue("incomeaccount")
                },
                "vendorReturnVarianceAccount": {
                    "externalId": itemRec.getValue("vendreturnvarianceaccount")
                },
                "customerReturnVarianceAccount": {
                    "externalId": itemRec.getValue("custreturnvarianceaccount")
                },
                "exchangeRateVarianceAccount": {
                    "externalId": itemRec.getValue("billexchratevarianceacct")
                },
                "quantityVarianceAccount": {
                    "externalId": itemRec.getValue("billqtyvarianceacct")
                },
                "priceVarianceAccount": {
                    "externalId": itemRec.getValue("billpricevarianceacct")
                },
                "gainLossAccount": {
                    "externalId": itemRec.getValue("gainlossaccount")
                },
                "purchaseOrderQuantityTolerance": 0,
                "purchaseOrderAmountTolerance": 0,
                "purchaseOrderQuantityDifference": 0,
                "itemReceiptQuantityTolerance": 0,
                "itemReceiptAmountTolerance": 0,
                "itemReceiptQuantityDifference": 0,
                "taxSchedule": {
                    "externalId": itemRec.getValue("taxschedule")
                },
                "isSeasonalDemand": itemRec.getValue("seasonaldemand"),
                "isTrackLandedCost": itemRec.getValue("tracklandedcost"),
                "isChildSubsidiaryMappingIncluded": itemRec.getValue("includechildren"),
                "itemType": {
                    "externalId": itemtype?.toString(),
                },
                // "itemType": {
                // 	"externalId": convertTypeOfItemToEcoValue(itemRec),
                // },
                "salesQtyCombo": {
                    "externalId": itemRec.getValue("custitem_dm_item_sales_qty_combo"),
                },
                "isLoosePick": itemRec.getValue("custitem_boc_is_loose_pick_item"),
                "isActive": !isinactive
            };
            return data;
        }

        const getDataObjDepartment = (objRecData) => {
            let departmentId = objRecData.id;
            let resultSQL = query.runSuiteQL({
                query: `SELECT id, name, custrecord_scv_dept_code, custrecord_scv_memo_dept, 
                    parent, fullname, isinactive, includechildren
                    FROM department WHERE id = ${departmentId}`
            }).asMappedResults();

            let objDepartment = resultSQL[0];

            let data = {
                "externalId": objDepartment.id.toString(),
                "parentDepartment": {
                    "externalId": objDepartment?.parent?.toString() || null
                },
                "code": objDepartment.custrecord_scv_dept_code || "",
                "name": objDepartment.name || "",
                "fullName": objDepartment.fullname || "",
                "memo": objDepartment.custrecord_scv_memo_dept || "",
                "isChildSubsidiaryMappingIncluded": toBoolean(objDepartment.includechildren),
                "isActive": !toBoolean(objDepartment.isinactive)
            };
            
            return data;
        }

        const getDataObjClassification = (objRecData) => {
            let classId = objRecData.id;
            let resultSQL = query.runSuiteQL({
                query: `SELECT id, name, isinactive, custrecord_scv_class_code, 
                    custrecord_scv_class_description, parent, fullname, includechildren
                    FROM classification WHERE id = ${classId}`
            }).asMappedResults();
            let objClass = resultSQL[0];

            let data = {
                "externalId": objClass.id.toString(),
                "parentClass": {
                    "externalId": objClass?.parent?.toString() || null
                },
                "code": objClass.custrecord_scv_class_code || "",
                "name": objClass.name || "",
                "fullName": objClass.fullname || "",
                "description": objClass.custrecord_scv_class_description || "",
                "isChildSubsidiaryMappingIncluded": toBoolean(objClass.includechildren),
                "isActive": !toBoolean(objClass.isinactive)
            }
            return data;
        }

        const getCurrentRecord = (rectype, recid) => {
            const curRec = record.load({ type: rectype, id: recid });
            return curRec;
        }

        const getAllDataTransactionLineTO = (internalId) => {
            let arrTransLineType = [TransactionLineType.ITEM, TransactionLineType.SHIPPING, TransactionLineType.RECEIVING];
            let myFilters = [
                ["type", "anyof", "TrnfrOrd"], 
                "AND", 
                ["mainline", "is", "F"], 
                "AND", 
                ["taxline", "is", "F"], 
                "AND", 
                ["internalid", "anyof", internalId], 
                "AND", 
                ["transactionlinetype", "anyof", arrTransLineType]
            ];
            
            let myColumns = [
                "internalid", "item", "custcol_scv_origin_line_num", "line",
                "linesequencenumber", "transactionlinetype"
            ];

            let arrResult = getAllDataCreateSavedSearch("transaction", myFilters, myColumns);
            return arrResult;
        }

        function getAllDataCreateSavedSearch(_type, _filters, _columns) {
            let resultSearch = search.create({
                type: _type,
                filters: _filters,
                columns: [..._columns]
            });
            resultSearch = resultSearch.runPaged({pageSize: 1000});

            let arrResult = [];
            for(let i = 0; i < resultSearch.pageRanges.length; i++){
                let currentPage = resultSearch.fetch({index : i}).data;
                for(let idx = 0; idx < currentPage.length; idx++){
                    let obj = {};
                    _columns.forEach(eleColumn => {
                        let eleColumnId = eleColumn;
                        if(typeof eleColumn == 'object'){
                            eleColumnId = eleColumn.label;
                        }
                        obj[eleColumnId] = currentPage[idx].getValue(eleColumn);

                        let temp_display = currentPage[idx].getText(eleColumn);
                        if(lbf.isContainValue(temp_display)){
                            obj[eleColumnId + "_display"] = temp_display;
                        }
                    });
                    arrResult.push(obj);
                }
            }
            return arrResult;
        }

        const queryDataLocOnTransaction = (arrLocation) => {
            arrLocation = arrLocation.filter(e => !!e);
            if(arrLocation.length === 0) return [];

            let resultSQL = query.runSuiteQL({
                query: `SELECT
                    Location.id,
                    Location.custrecord_boc_location_wh,
                    Location.Name,
                    BUILTIN.DF(Location.LocationType) as LocationType,
                    Location.custrecord_scv_location_mail,
                    Location.custrecord_scv_location_code,
                    Address.Zip,
                    Address.State,
                    Address.Addressee,
                    Address.Addr1,
                    Address.Addr2,
                    Address.Addr3,
                    Address.Country
                FROM
                    Location
                LEFT OUTER JOIN LocationMainAddress AS Address ON
                    (Address.Nkey = Location.MainAddress)
                WHERE Location.id IN ('${arrLocation.join("', '")}')`
            });
            let data = resultSQL.asMappedResults();
            return data;
        }

        const getDataVendorOnTransaction = (vendorId) => {
            if(!vendorId) return {};

            let resultSQL = query.runSuiteQL({
                query: `SELECT
                    v.id, v.entityid, v.email, v.fax, v.contact,
                    v.custentity_scv_phone_no, v.custentity_scv_tax_number,
                    address.addr1, address.addr2, address.addr3,
                    address.country, address.state, address.zip
                    FROM Vendor v
                    LEFT JOIN EntityAddress address
                    ON (v.DefaultShippingAddress = address.nKey)
                    WHERE v.id = ${vendorId}`
            });
            resultSQL = resultSQL.asMappedResults();
            return resultSQL.length > 0 ? resultSQL[0] : {};
        }

        const getDataDepOnTransaction = (department) => {
            let objRes = {
                "custrecord_scv_memo_dept": ""
            };
            if(!!department) {
                let departmentLKF = search.lookupFields({
                    type: "department",
                    id: department,
                    columns: ["custrecord_scv_memo_dept"]
                });
                objRes.custrecord_scv_memo_dept = departmentLKF.custrecord_scv_memo_dept || "";
            }
            return objRes;
        }

        const queryDataEmployee = (arrEntityId) => {
            arrEntityId = arrEntityId.filter(e => !!e);
            if(arrEntityId.length === 0) return [];

            let resultSQL = query.runSuiteQL({
                query: `SELECT
                    id, entityid
                FROM
                    employee
                WHERE id IN ('${arrEntityId.join("', '")}')`
            });
            let data = resultSQL.asMappedResults();
            return data;
        }

        function toBoolean(value) {
            if (value === true || value === false) {
                return value;
            }

            if (typeof value === 'string') {
                return value.toUpperCase() === 'T';
            }

            return false;
        }

        const roundDecimalNumberInObj = (objData, fields) => {
            for(let fieldId of fields) {
                objData[fieldId] = constFormat.roundNumber(objData[fieldId], 8);
            }
        }

        const convertEmptyValueToNull = (objData, fields) => {
            for(let fieldId of fields) {
                if(!objData[fieldId]) {
                    objData[fieldId] = null;
                }
            }
        }

        const formatDateToEcoSystem = (date) => {
            if(!!date) {
                return date.toISOString();
            } else {
                return ECO_DATE_REQUIRED;
            }
        }

        const mapFuncReqBody = {
            // ? by data
            "vendorbusinesscoveragemap": getDataReqBodyVendBusinessMap,
            "locationdeliveryschedule": getDataReqBodyLocDeliverySchedule,
            "customercategory": getDataReqBodyByCustomList,
            "pricelevel": getDataReqBodyByCustomList,
            "paymentmethod": getDataReqBodyByCustomList,
            "term": getDataReqBodyByCustomList,
            "vendorcategory": getDataReqBodyVendorCate,
            "currency": getDataReqBodyCurrency,
            "incoterm": getDataReqBodyIncoTerm,
            "taxtype": getDataReqBodyTaxType,
            "country": getDataReqBodyCountry,
            "unitstype": getDataReqBodyUnitsType,
            "unitstypeuom": getDataReqBodyUnitsTypeUOM,
            "salestaxitemsubsidiarymap": getDataReqBodyTaxCodeSubMap,
            "accounttype": getDataReqBodyAccountType,
            "customrecord_boc_grpcode_item_list": getDataItemHierarchy,
            "customrecord_boc_divcode_item_list": getDataItemHierarchy,
            "customrecord_boc_deptcode_item_list": getDataItemHierarchy,
            "customrecord_boc_catcode_item_list": getDataItemHierarchy,
            "customrecord_boc_subcatcode_itm_list": getDataItemHierarchy,
            "customrecord_boc_subclass_list": getDataItemHierarchy,
            "customrecord_boc_subclass2_item_list": getDataItemHierarchyRoot,

            // ?record.load
            "taxschedule": getDataObjTaxSchedule,
            "customrecord_boc_outletsize": getDataObjBasicCustomRec,
            "customrecord_boc_outletsizecluster": getDataObjBasicCustomRec,
            "customrecord_boc_hscode": getDataObjItemHSCode,
            "salestaxitem": getDataObjTaxCode,
            "account": getDataObjAccount,
            "subsidiary": getDataObjSubsidiary,
            "customrecord_scv_ima_sa_price": getDataObjIMASalesPrice,
            "customrecord_scv_ima_pur_price": getDataObjIMAPurchasePrice,
            "customrecord_atlas_inv_adj_reasn": getDataObjInvAdjReason,
            "customrecordscv_inv_adj_reason_map": getDataObjInvAdjReasonMap,
            "customrecord_scv_po_trans_code_map": getDataPOTransactionCodeMap,
            "customrecord_scv_ito_trans_code_map": getDataTOTransactionCodeMap,

            "assemblyitem": getDataObjItem,
            "inventoryitem": getDataObjItem,
            "customrecord_scv_plu_barcode_no": getDataObjPLUBarcode,
            "vendor": getDataObjVendor,
            "customer": getDataObjCustomer,
            "purchaseorder": getDataObjPurchaseOrder,
            "transferorder": getDataObjTransferOrder,
            "intercompanytransferorder": getDataObjTransferOrder,
            "itemfulfillment": getDataObjItemFulfillment,
            "itemlocationconfiguration": getDataObjItemLocationConfig,
            "location": getDataObjLocation,
            "employee": getDataObjEmployee,
            "customrecord_scv_vietnam_unit": getDataVietNamUnit,
            "contact": getDataContact,

            // TODO: new record integration
            "customrecord_boc_display_method": getDataObjItemCustomRec,
            "customrecord_boc_brand": getDataObjItemBrand,
            "customrecord_boc_delivery_condition": getDataObjDeliveryCondition,
            "customrecord_boc_item_storage_cond": getDataObjItemCustomRec,
            "customrecord_boc_rq_status": getDataObjItemCustomRec,
            "customrecord_boc_spec_handling": getDataObjItemCustomRec,
            "customrecord_scv_reorder_reason": getDataObjItemCustomRec,
            "customrecord_boc_item_status": getDataObjItemCustomRec,
            "customrecord_boc_local_oversea": getDataObjItemCustomRec,
            "customrecord_boc_trade_type": getDataObjItemCustomRec,
            "customrecord_boc_item_buyer_grp": getDataObjItemBuyerGroup,
            "customrecord_boc_allocation_type": getDataObjItemCustomRec,
            "customrecord_boc_date_ctrl": getDataObjItemCustomRec,
            "customrecord_scv_ite_glo_ins_sys_mtn": getDataObjItemGlobalISM,
            "customrecord_scv_country_of_ori": getDataObjCountryOfOrigin,
            "customrecord_scv_item_supply_model": getDataObjItemSupplyModel,
            "customrecord_boc_qty_restrict_grp": getDataObjItemCustomRec,
            "customrecord_boc_product_cluster": getDataObjItemCustomRec,

            // ?others
            "department": getDataObjDepartment,
            "classification": getDataObjClassification,
        };

        return {
            getDataRecordSubsidiaryMap,
            // TODO: get data request body
            getDataReqBodyByCustomList,
            getDataReqBodyByRecSubMap,
            getDataReqBodyBasicRecord,
            getDataReqBodyBySystemListItem,

            getHandler: function (rectype) {
                return mapFuncReqBody[rectype];
            }
        };
    });
    