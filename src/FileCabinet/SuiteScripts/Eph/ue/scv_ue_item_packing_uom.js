/**
 * =======================================================================================
 *  Date                Author                  Description
 *  06 Aug 2025         Khanh Tran              Init & create file. Quản lý Packing UOM ở Item Master from mr. Quân (https://app.clickup.com/t/86czwh96m)
 */
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/error',
    '../common/scv_common_item_packing_uom.js',
],
    
    (error,
        commItemPackingUom
    ) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {

        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {
            let newRec = scriptContext.newRecord;
            let triggerType = scriptContext.type;
            
            if(["create", "edit"].includes(triggerType)){
                validateItemPackingUom(newRec);
            }
        }

        const validateItemPackingUom = (newRec) =>{
            if (newRec.type == 'itemlocationconfiguration') {
                commItemPackingUom.validatePackingUomFieldValue(newRec);
            }
            else if(['inventoryitem', 'assemblyitem', 'customrecord_scv_item_ma', 'noninventoryitem'].includes(newRec.type)) {
                if (['inventoryitem', 'assemblyitem', 'noninventoryitem'].includes(newRec.type)) {
                    commItemPackingUom.updatePackingUomConversionRatesItem(newRec);
                }
                else if (newRec.type == 'customrecord_scv_item_ma') {
                    commItemPackingUom.updatePackingUomConversionRatesIMA(newRec);
                }

                let msgValidateInnerVsCarton = commItemPackingUom.validateInnerVsCarton(newRec);
                if (msgValidateInnerVsCarton) {
                    throw error.create({
                        name: 'INVALID_PACKING_UOM_RATE',
                        message: msgValidateInnerVsCarton,
                        notifyOff: true
                    });
                }
            }
            else if (newRec.type == 'customrecord_scv_ima_pur_price') {
                commItemPackingUom.validatePackingUomFieldValue(newRec);
            }
            else if (newRec.type == 'customrecord_scv_plu_barcode_no') {
                commItemPackingUom.validatePackingUomFieldValue(newRec);
            }
        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {

        }

        return {
            // beforeLoad,
            beforeSubmit,
            // afterSubmit
        }

    });
