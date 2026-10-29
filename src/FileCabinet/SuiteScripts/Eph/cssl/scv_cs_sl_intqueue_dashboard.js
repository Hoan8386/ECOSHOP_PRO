/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([
    '../common/scv_common_intqueue_dash.js',
],

function(
    commonIntQueueDash,
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
        initOptionsGrid_ResIntQueue();
        onSearchResult();
    }

    const initOptionsGrid_ResIntQueue = () => {
        const gridId = "custpage_sl_result";

        _scvDx.setOption(gridId, "onCellPrepared", function(e) {
            if (e.rowType === "data") {
                if(e.data.level == 1) {
                    e.cellElement.css("font-weight", "bold");
                }
            }
        });
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
        const curRec = scriptContext.currentRecord;
        const fieldId = scriptContext.fieldId;

        fieldChanged_DateRange(curRec, fieldId);
        fieldChanged_CustomDate(curRec, fieldId);
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

    }

    const fieldChanged_DateRange = (curRec, fieldId) => {
        if(fieldId === "custpage_date_range") {
            let dateRangeId = curRec.getValue(fieldId);
            if(!dateRangeId) return;

            const fFromDate = curRec.getField("custpage_fromdt");
            const fToDate = curRec.getField("custpage_todt");
            if(dateRangeId != commonIntQueueDash.DateRange.Custom.ID) {
                let objDateRange = commonIntQueueDash.getDataRangeById(dateRangeId);

                fFromDate.isDisabled = true;
                fToDate.isDisabled = true;
                curRec.setValue("custpage_fromdt", objDateRange.fromDate);
                curRec.setValue("custpage_todt", objDateRange.toDate);
                
                onSearchResult();
            } else {
                fFromDate.isDisabled = false;
                fToDate.isDisabled = false;
                curRec.setValue("custpage_fromdt", null);
                curRec.setValue("custpage_todt", null);
            }
        }
    }

    const fieldChanged_CustomDate = (curRec, fieldId) => {
        if(["custpage_fromdt", "custpage_todt"].includes(fieldId)) {
            let dateRangeId = curRec.getValue("custpage_date_range");
            if(dateRangeId != commonIntQueueDash.DateRange.Custom.ID) return;

            let fromDate = curRec.getValue("custpage_fromdt");
            let toDate = curRec.getValue("custpage_todt");
            if(!fromDate || !toDate) return;

            onSearchResult();
        }
    }

    const onSearchResult = async (_isExport) => {
        let params = _scvForm.getParameter();
        _scvForm.showLoadingDialog(true);
        // console.log(params);

        _scvForm.ajax.postAsync(_scvForm.serviceScript.url, {
            ...params,
            action: "getDataCountIntQueueByStatus",
        }, function (_res) {
            _scvDx.setDataSource("custpage_sl_result", _res.data);
            _scvForm.showLoadingDialog(false);
        });
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        // saveRecord: saveRecord
    };
    
});
