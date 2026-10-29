/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([
    'N/url', 'N/currentRecord',
    '../cons/scv_cons_appr_status.js'
],
function(
    url, currentRecord,
    constApprStatus,
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

    const RecType = {
        IMA: {
            ID: "customrecord_scv_item_ma",
            NAME: "Item Master Application"
        },
        IMA_PurPrice: {
            ID: "customrecord_scv_ima_pur_price",
            NAME: "IMA Purchase Price",
        },
        IMA_SalesPrice: {
            ID: "customrecord_scv_ima_sa_price",
            NAME: "IMA Sales Price",
        },
    };

    function pageInit(scriptContext) {

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

        onChangeRecType(curRec, fieldId);
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

    const onApproval = () => {
        window.onbeforeunload = null;
        const grid = _scvDx.getInstanceDx("custpage_sl_result");
        const arrResult = grid.getSelectedRowsData();
        if(arrResult.length === 0) {
            return alert("Please select at least one line to submit data!");
        }

        let params = _scvForm.getParameter();
        _scvForm.showLoadingDialog(true);

        _scvForm.ajax.postAsync(_scvForm.currentScript.url, {
            ...params,
            custpage_approval_status: constApprStatus.Records.Approved.ID,
            arrResult: JSON.stringify(arrResult),
            action: "onSubmit",
        }, function (_res){
            onSearchResult(false);
            _scvForm.showLoadingDialog(false);
        }, function (err) {
            _scvForm.showLoadingDialog(false);
        });
    }

    const onReject = () => {
        window.onbeforeunload = null;
        const grid = _scvDx.getInstanceDx("custpage_sl_result");
        const arrResult = grid.getSelectedRowsData();
        if(arrResult.length === 0) {
            return alert("Please select at least one line to submit data!");
        }

        let params = _scvForm.getParameter();
        _scvForm.showLoadingDialog(true);

        _scvForm.ajax.postAsync(_scvForm.currentScript.url, {
            ...params,
            custpage_approval_status: constApprStatus.Records.Rejected.ID,
            arrResult: JSON.stringify(arrResult),
            action: "onSubmit",
        }, function (_res){
            onSearchResult(false);
            _scvForm.showLoadingDialog(false);
        }, function (err) {
            _scvForm.showLoadingDialog(false);
        });
    }

    const onChangeRecType = async (curRec, fieldId) => {
        if(fieldId === "custpage_rectype") {
            _scvForm.showLoadingDialog(true);
            await _scvForm.delay(200);
            onSearchResult();
        }
    }

    const onSearchResult = (_isSearch = true) => {
        let params = _scvForm.getParameter();
        window.onbeforeunload = null;
        let urlSearch = url.resolveScript({
            scriptId: `customscript_scv_sl_mass_approval_ima`,
            deploymentId: `customdeploy_scv_sl_mass_approval_ima`,
            returnExternalUrl: false
        });

        let urlDC = urlSearch + `&custpage_rectype=${params.custpage_rectype}&custpage_page=${params.custpage_page || 1}`;
        if(!!params.custpage_rectype && _isSearch === true) {
            urlDC += `&isrun=T`;
        }

        window.location.replace(urlDC);
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        // saveRecord: saveRecord,
        onApproval: onApproval,
        onReject: onReject,
        onRefresh: onSearchResult
    };
});
