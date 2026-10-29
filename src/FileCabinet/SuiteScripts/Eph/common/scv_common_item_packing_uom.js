/**
 *  Nội dung:
 * =======================================================================================
 *  Date                Author                  Description
 *  06 Aug 2025         Khanh Tran              Init & create file. Quản lý Packing UOM ở Item Master from mr. Quân (https://app.clickup.com/t/86czwh96m)
 */
define([
	'N/query', 'N/search', 'N/error',
],
function(
	query, search, error
) {

    const validateInnerVsCarton = (curRec) => {
        let innerField = '';
        let cartonField = '';

        if (curRec.type === 'inventoryitem' || curRec.type === 'assemblyitem' || curRec.type === 'noninventoryitem') {
            innerField = 'custitem_scv_packing_uom_con_rate_iner';
            cartonField = 'custitem_scv_packing_uom_con_rate';
        }
        else if (curRec.type === 'customrecord_scv_item_ma') {
            innerField = 'custrecord_scv_ima_pack_uom_rate_iner';
            cartonField = 'custrecord_scv_ima_packing_uom_con_rate';
        }
        else {
            return null;
        }

        let inner = curRec.getValue(innerField) * 1;
        let carton = curRec.getValue(cartonField) * 1;

        if (inner >= carton) {
            return `Packing UOM Con. Rate (Inner) can't be greater than Packing UOM Con. Rate (Carton). Please check this again.`;
        }

        return null;
    }

    const queryUnitByUnitTypeId = (unitTypeId) => {
        let resultQuery = query.runSuiteQL({
            query: `select baseunit, unitname, internalid, conversionrate from unitsTypeUom where unitstype = ${unitTypeId} order by conversionrate`
        });
    
        return resultQuery.asMappedResults();
    }

    //UOM không thuộc Unit Type -> Chặn
    //User nhập  đúng NAME nhưng hệ thống set ID không thuộc unittype do trùng Name -> Chỉnh lại ID
    const validatePackingUomFieldValue = (curRec) => {
        let arrData = [];
        let { unitstype, arrPackingUomFieldId } = getPackingUomConfig(curRec);
    
        if (unitstype) {
            arrData = queryUnitByUnitTypeId(unitstype);
        }

        arrPackingUomFieldId.forEach(fieldId => {
            let value = curRec.getValue(fieldId);
            if (value) {
                let objData = arrData.find( e => e.internalid == value );

                if(!objData){
                    let field_display = getUomNameById(value);
                    
                    objData = arrData.find( e => e.unitname == field_display );

                    if(objData) curRec.setValue(fieldId, objData.internalid*1);
                }

                if(!objData) {
                    throwInvalidFieldValue(fieldId, value);
                }
            }
        })
    }
    
    const getUomNameById = (uomId) => {
        let resultQuery = query.runSuiteQL({
            query: `select unitname from unitsTypeUom where internalid = ${uomId}`
        });
    
        return resultQuery.asMappedResults()[0]?.unitname || ''
    }
    
    const getPackingUomConfig = (curRec) => {
        let unitstype = '';
        let arrPackingUomFieldId = [];

        if (curRec.type == 'itemlocationconfiguration') {
            let itemId = curRec.getValue('item');

            if (itemId) {
                let lkItem = search.lookupFields({
                    type: 'item',
                    id: itemId,
                    columns: ['unitstype']
                });

                unitstype = lkItem.unitstype?.[0]?.value;
            }

            arrPackingUomFieldId = ['custrecord_boc_distr_uom'];
        }
        else if (['inventoryitem', 'assemblyitem', 'noninventoryitem'].includes(curRec.type)) {
            unitstype = curRec.getValue('unitstype');
            arrPackingUomFieldId = ['custitem_scv_packing_uom_carton', 'custitem_scv_packing_uom_inner'];
        }
        else if (curRec.type == 'customrecord_scv_item_ma') {
            unitstype = curRec.getValue('custrecord_scv_ima_unit_type');
            arrPackingUomFieldId = [
                'custrecord_scv_ima_packing_uom_carton',
                'custrecord_scv_ima_packing_uom_inner',
                'custrecord_scv_ima_baseunit',
                'custrecord_scv_ima_stock_unit'
            ];
        }
        else if (curRec.type == 'customrecord_scv_ima_pur_price') {
            let imaId = curRec.getValue('custrecord_scv_pur_price_rel_ima');
            if (imaId) {
                let lkIMA = search.lookupFields({
                    type: 'customrecord_scv_item_ma',
                    id: imaId,
                    columns: ['custrecord_scv_ima_unit_type']
                });

                unitstype = lkIMA.custrecord_scv_ima_unit_type?.[0]?.value;
            }
            else {
                let itemId = curRec.getValue('custrecord_scv_ima_pur_price_item');
                if (itemId) {
                    let lkItem = search.lookupFields({
                        type: 'item',
                        id: itemId,
                        columns: ['unitstype']
                    });

                    unitstype = lkItem.unitstype?.[0]?.value;
                }
            }

            arrPackingUomFieldId = [
                'custrecord_scv_pur_price_unit',
            ];
        }
        else if (curRec.type == 'customrecord_scv_plu_barcode_no') {
            let itemId = curRec.getValue('custrecord_scv_plu_barcode_item');
            if (itemId) {
                let lkItem = search.lookupFields({
                    type: 'item',
                    id: itemId,
                    columns: ['unitstype']
                });

                unitstype = lkItem.unitstype?.[0]?.value;
            }
            else {
                let imaId = curRec.getValue('custrecord_scv_plu_barcode_ima');
                if (imaId) {
                    let lkIMA = search.lookupFields({
                        type: 'customrecord_scv_item_ma',
                        id: imaId,
                        columns: ['custrecord_scv_ima_unit_type']
                    });

                    unitstype = lkIMA.custrecord_scv_ima_unit_type?.[0]?.value;
                }
            }

            arrPackingUomFieldId = [
                'custrecord_scv_plu_unit',
            ];
        }

        return { unitstype, arrPackingUomFieldId };
    };

    const updatePackingUomConversionRatesItem = (curRec) => {
        let unitstype = curRec.getValue('unitstype');
        let arrUomRateMappings = [
            {
                uomField: 'custitem_scv_packing_uom_inner',
                rateField: 'custitem_scv_packing_uom_con_rate_iner'
            },
            {
                uomField: 'custitem_scv_packing_uom_carton',
                rateField: 'custitem_scv_packing_uom_con_rate'
            }
        ];

        return updatePackingUomConversionRates(curRec, unitstype, arrUomRateMappings);
    };

    const updatePackingUomConversionRatesIMA = (curRec) => {
        let unitstype = curRec.getValue('custrecord_scv_ima_unit_type');
        let arrUomRateMappings = [
            {
                uomField: 'custrecord_scv_ima_packing_uom_inner',
                rateField: 'custrecord_scv_ima_pack_uom_rate_iner'
            },
            {
                uomField: 'custrecord_scv_ima_packing_uom_carton',
                rateField: 'custrecord_scv_ima_packing_uom_con_rate'
            }
        ];
        
        return updatePackingUomConversionRates(curRec, unitstype, arrUomRateMappings);
    };

    // UOM không thuộc Unit Type -> Chặn
    // User nhập  đúng NAME nhưng hệ thống set ID không thuộc unittype do trùng Name -> Chỉnh lại ID
    // Mapping rate
    const updatePackingUomConversionRates = (curRec, unitstype, arrUomRateMappings) => {
        let arrData = [];
        if (unitstype) {
            arrData = queryUnitByUnitTypeId(unitstype);
        }

        arrUomRateMappings.forEach(mapping => {
            let value = curRec.getValue(mapping.uomField);
            let conversionRate = '';

            if (value) {
                let obj = arrData.find(e => e.internalid == value);

                if (!obj) {
                    let name = getUomNameById(value);
                    obj = arrData.find(e => e.unitname == name);

                    if (obj) curRec.setValue(mapping.uomField, obj.internalid * 1);
                }

                if (!obj) {
                    throwInvalidFieldValue(mapping.uomField, value);
                }

                conversionRate = obj.conversionrate * 1;
            }

            curRec.setValue(mapping.rateField, conversionRate);
        });
    };

    const throwInvalidFieldValue = (fieldId, value) => {
        throw error.create({
            name: 'INVALID_FIELD_VALUE',
            message: `You have entered an Invalid Field Value "${value}" for the following field: "${fieldId}"`,
            notifyOff: true
        });
    };
    
    return {
		validateInnerVsCarton,
        queryUnitByUnitTypeId,
        validatePackingUomFieldValue,
        getUomNameById,
        getPackingUomConfig,
        updatePackingUomConversionRatesItem,
        updatePackingUomConversionRatesIMA
    };
    
});
