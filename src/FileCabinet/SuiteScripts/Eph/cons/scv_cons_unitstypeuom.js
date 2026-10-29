/**
 * Nội dung: 
 * Key:
 * =======================================================================================
 *  Date                Author                  Description
 *  26 Aug 2025         Huy Pham			    Init, create file
 */
define(['N/query',
],
    function(query,
    ) {
        const FIELD = {
            ID: "id",
            INACTIVE: "isinactive",
            NAME: "name"
        }
    
        const SUBLIST = {
            
        }
    
        const RECORDS = {
            stores: {},
        }

        const getDataSource = (_filters) => {
            let query_condition = "";
            if(!!_filters?.unitstype){
                query_condition += ` AND unitstype = ${_filters.unitstype}`  
            }
            
            var resultSQL = query.runSuiteQL({
                query: `SELECT internalid, unitname, baseunit, unitstype, inuse,
                pluralname, pluralabbreviation, abbreviation, conversionrate
                FROM unitsTypeUom
                WHERE inuse IN ('T', 'F') ${query_condition}`
            });
            return resultSQL.asMappedResults();
        }

        const getDataSublistUOM = (curRec) => {
            let sl = "uom";
            let totalLine = curRec.getLineCount({ sublistId: sl });

            let arrResult = [];
            for(let i = 0; i < totalLine; i++) {
                let objRes = {
                    internalid: curRec.getSublistValue(sl, "internalid", i),
                    abbreviation: curRec.getSublistValue(sl, "abbreviation", i),
                    baseunit: curRec.getSublistValue(sl, "baseunit", i),
                    conversionrate: curRec.getSublistValue(sl, "conversionrate", i),
                    pluralabbreviation: curRec.getSublistValue(sl, "pluralabbreviation", i),
                    pluralname: curRec.getSublistValue(sl, "pluralname", i),
                    unitname: curRec.getSublistValue(sl, "unitname", i),
                    unitstype: curRec.id,
                };

                arrResult.push(objRes);
            }
            return arrResult;
        }

        return {
            TYPE: "-221",//"unitsTypeUom",
            FIELD,
            SUBLIST,
            RECORDS,
            getDataSource,
            getDataSublistUOM
        };
        
    });
    