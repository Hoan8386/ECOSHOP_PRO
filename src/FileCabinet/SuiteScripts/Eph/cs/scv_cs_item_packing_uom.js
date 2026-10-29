/**
 * =======================================================================================
 *  Date                Author                  Description
 *  06 Aug 2025         Khanh Tran              Init & create file. Quản lý Packing UOM ở Item Master from mr. Quân (https://app.clickup.com/t/86czwh96m)
 */
/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([
    '../cons/scv_cons_datastore.js',
    '../cons/scv_cons_record.js',

    '../common/scv_common_item_packing_uom.js',
],

function(
    constDataStore,
    constRecord,

    commItemPackingUom,
) {
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {
        let curRec = scriptContext.currentRecord;

        initPackingUomFields(curRec);
    }
    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {
        let curRec = scriptContext.currentRecord;
        let fieldId = scriptContext.fieldId;

        if (curRec.type == 'itemlocationconfiguration') {
            if (fieldId == 'item') {
                initPackingUomFields(curRec);
                curRec.setValue('custrecord_boc_distr_uom', '')
            }
        }
        else if (['inventoryitem', 'assemblyitem', 'noninventoryitem'].includes(curRec.type)) {
            if (fieldId == 'unitstype') {
                initPackingUomFields(curRec);
                curRec.setValue('custitem_scv_packing_uom_carton', '')
                curRec.setValue('custitem_scv_packing_uom_inner', '')
                curRec.setValue('custitem_scv_packing_uom_con_rate', '')
                curRec.setValue('custitem_scv_packing_uom_con_rate_iner', '')
            }
            else if (fieldId == 'custitem_scv_packing_uom_carton') {
                setPackingConversionRate(curRec, fieldId, 'custitem_scv_packing_uom_con_rate');
            }
            else if (fieldId == 'custitem_scv_packing_uom_inner') {
                setPackingConversionRate(curRec, fieldId, 'custitem_scv_packing_uom_con_rate_iner');
            }
        }
        else if (curRec.type == 'customrecord_scv_item_ma') {
            if (fieldId == 'custrecord_scv_ima_unit_type') {
                initPackingUomFields(curRec);
                curRec.setValue('custrecord_scv_ima_packing_uom_carton', '')
                curRec.setValue('custrecord_scv_ima_packing_uom_inner', '')
                curRec.setValue('custrecord_scv_ima_baseunit', '')
                curRec.setValue('custrecord_scv_ima_stock_unit', '')
            }
            else if (fieldId == 'custrecord_scv_ima_packing_uom_carton') {
                setPackingConversionRate(curRec, fieldId, 'custrecord_scv_ima_packing_uom_con_rate');
            }
            else if (fieldId == 'custrecord_scv_ima_packing_uom_inner') {
                setPackingConversionRate(curRec, fieldId, 'custrecord_scv_ima_pack_uom_rate_iner');
            }
        }
        else if (curRec.type == 'customrecord_scv_ima_pur_price') {
            if (['custrecord_scv_pur_price_rel_ima', 'custrecord_scv_ima_pur_price_item'].includes(fieldId)) {
                initPackingUomFields(curRec);
                curRec.setValue('custrecord_scv_pur_price_unit', '')
            }
        }
        else if (curRec.type == 'customrecord_scv_plu_barcode_no') {
            if (['custrecord_scv_plu_barcode_item', 'custrecord_scv_plu_barcode_ima'].includes(fieldId)) {
                initPackingUomFields(curRec);
                curRec.setValue('custrecord_scv_plu_unit', '')
            }
        }
    }

    const setPackingConversionRate = (curRec, sourceFieldId, targetFieldId) => {
        let value = curRec.getValue(sourceFieldId);
        let conversionRate = '';

        if (value) {
            let arrData = constDataStore.getDataStore(sourceFieldId).data;
            let obj = arrData.find(e => e.internalid == value);
            if (obj) {
                conversionRate = obj.conversionrate * 1;
            }
        }

        curRec.setValue(targetFieldId, conversionRate);
    };

    const initPackingUomFields = (curRec) => {
        let arrData = [];
        let { unitstype, arrPackingUomFieldId } = commItemPackingUom.getPackingUomConfig(curRec);
        
        if(unitstype) {
            arrData = commItemPackingUom.queryUnitByUnitTypeId(unitstype)
            arrData.unshift({ internalid: '', unitname: '', conversionrate: 0 })
        }

        arrPackingUomFieldId.forEach(fieldId => {
            constRecord.initQuickFindFieldSelect(curRec, fieldId, {
                data: arrData,
                valueExpr: "internalid",
                displayExpr: "unitname",
                reInsertOption: false
            })

            let field_packing_uom = document.querySelector('div[data-field-name="'+fieldId+'"]');
            if (field_packing_uom) {
                let inputEl = field_packing_uom.querySelector('input');

                if (inputEl) {
                    inputEl.setAttribute('readonly', true);
                    inputEl.style.backgroundColor = '#ebebeb';
                }

                let popupIcon = field_packing_uom.querySelector('span.fwpopupsel.uir-field-popup-arrow-image');
                
                if (popupIcon) {
                    popupIcon.style.display = 'none';
                }
            }
        })
    }

    /**
     * Function to be executed when field is slaved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     *
     * @since 2015.2
     */
    function postSourcing(scriptContext) {

    }

    /**
     * Function to be executed after sublist is inserted, removed, or edited.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function sublistChanged(scriptContext) {

    }

    /**
     * Function to be executed after line is selected.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function lineInit(scriptContext) {

    }

    /**
     * Validation function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @returns {boolean} Return true if field is valid
     *
     * @since 2015.2
     */
    function validateField(scriptContext) {

    }

    /**
     * Validation function to be executed when sublist line is committed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateLine(scriptContext) {

    }

    /**
     * Validation function to be executed when sublist line is inserted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateInsert(scriptContext) {

    }

    /**
     * Validation function to be executed when record is deleted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateDelete(scriptContext) {

    }

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) {
        let isSave = true;
        let curRec = scriptContext.currentRecord;
        let msgValidateInnerVsCarton = commItemPackingUom.validateInnerVsCarton(curRec);

        if (msgValidateInnerVsCarton) {
            alert(msgValidateInnerVsCarton);
            isSave = false;
        }
        
        return isSave;
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        // postSourcing: postSourcing,
        // sublistChanged: sublistChanged,
        // lineInit: lineInit,
        // validateField: validateField,
        // validateLine: validateLine,
        // validateInsert: validateInsert,
        // validateDelete: validateDelete,
        saveRecord: saveRecord
    };
    
});
