/**
 * Nội dung:
 * =======================================================================================
 *  TODO: Date                 Author                  Description
 *        07 Feb 2025          Phu Pham			       Init, create file, from mr. Bính (https://app.clickup.com/t/86cxxuy0y)
 */
/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define([
    '../lib/scv_lib_il.js',
    '../lib/scv_lib_function.js'
], (
    libIL, lbf
) => {

    /**
     * Defines the function that is executed when a POST request is sent to a RESTlet.
     * @param {string | Object} requestBody - The HTTP request body; request body is passed as a string when request
     *     Content-Type is 'text/plain' or parsed into an Object when request Content-Type is 'application/json' (in which case
     *     the body must be a valid JSON)
     * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
     *     Object when request Content-Type is 'application/json' or 'application/xml'
     * @since 2015.2
     */
    const post = (requestBody) => {
        // TODO: search, get, approve, reject, createtask, comment
        let response = {};
        switch(requestBody.action){
            case "add":
                response = callActionAdd(requestBody);
                break;
            case "update":
                response = callActionUpdate(requestBody);
                break;
            case "get":
                response = callActionGet(requestBody);
                break;
            case "search":
                response = callActionSearch(requestBody);
                break;
            default:
                response = libIL.createObjErrorAPI(libIL.ERROR_CODE_MSG.API_ACTION_KHONG_TON_TAI);
                break;
        }
        return response;
    }

    const callActionSearch = (reqBody) => {
        reqBody.filters = !!reqBody.filters ? reqBody.filters : {page: 1, pageSize: 1000};
        if(!reqBody.filters.page || reqBody.filters.page < 1){
            reqBody.filters.page = 1;
        }
        if(!reqBody.filters.pageSize && reqBody.filters.pageSize !== 0){
            reqBody.filters.pageSize = 1000;
        }
        else if(reqBody.filters.pageSize < 5){
            reqBody.filters.pageSize = 5;
        }
        else if(reqBody.filters.pageSize > 1000){
            reqBody.filters.pageSize = 1000;
        }
        let objRes = {};

        switch(reqBody.type){
            // record
            case "purchaseorder":
                objRes = libIL.apiSearchPurchaseOrder(reqBody);
                break;
            case "intercompanytransferorder":
                objRes = libIL.apiSearchInterCompTransferOrder(reqBody);
                break;
            // saved search
            case "customsearch_scv_itr_search_full_api":
                objRes = libIL.apiSearchITRFull(reqBody);
                break;
            case "customsearch_scv_po_dtl_search_full_api":
                objRes = libIL.apiSearchPoDtlFull(reqBody);
                break;
            case "customsearch_scv_inventory_adjust_api":
                objRes = libIL.apiSearchInventoryAdjustFull(reqBody);
                break;
            case "customsearch_scv_to_dtl_search_full_api":
                objRes = libIL.apiSearchToDtlFull(reqBody);
                break;
            case "customsearch_scv_cash_sales_report_api":
                objRes = libIL.apiSearchCashSalesReport(reqBody);
                break;
            case "customsearch_scv_tax_code_search":
                objRes = libIL.apiSearchTaxCode(reqBody);
                break;
            case "customsearch_scv_item_master_tax_schedul":
                objRes = libIL.apiSearchItemMasterTaxSchedule(reqBody);
                break;
            // customize
            case "customform":
                objRes = libIL.apiSearchCustomForm(reqBody);
                break;
            default:
                objRes = libIL.createObjErrorAPI(libIL.ERROR_CODE_MSG.API_TYPE_KHONG_TON_TAI);
                break;
        }
        return objRes;
    }

    const callActionGet = (reqBody) => {
        let objReqBodyMandatory = libIL.validateFieldsMandatory(reqBody, ["id"]);
        if(!objReqBodyMandatory.isValidate) {
            let message = libIL.ERROR_CODE_MSG.API_FIELDS_MANDATORY.MSG + ": " + objReqBodyMandatory.arrFieldsInvalid.join(", ");
            let objError = libIL.createObjErrorAPI(libIL.ERROR_CODE_MSG.API_FIELDS_MANDATORY, message);
            return objError;
        }
    
        let objRes = {};
        switch(reqBody.type){
            case "purchaseorder":
                objRes = libIL.apiGetPurchaseOrder(reqBody);
                break;
            case "intercompanytransferorder":
                objRes = libIL.apiGetInterCompTransferOrder(reqBody);
                break;
            case "itemfulfillment_from_to":
                objRes = libIL.apiGetItemFulfillmentFromTO(reqBody);
                break;
            case "itemreceipt_from_to":
                objRes = libIL.apiGetItemReceiptFromTO(reqBody);
                break;
            case "itemreceipt_from_po":
                objRes = libIL.apiGetItemReceiptFromPO(reqBody);
                break;
            case "cashsale":
                objRes = libIL.apiGetCashSale(reqBody);
                break;
            case "creditmemo":
                objRes = libIL.apiGetCreditMemo(reqBody);
                break;
            case "invoice":
                objRes = libIL.apiGetInvoice(reqBody);
                break;
            case "salesorder":
                objRes = libIL.apiGetSalesOrder(reqBody);
                break;
            default:
                objRes = libIL.createObjErrorAPI(libIL.ERROR_CODE_MSG.API_TYPE_KHONG_TON_TAI);
                break;
        }
        return objRes;
    }

    const callActionAdd = (requestBody) => {
        let objRes = {};
        if(!lbf.isContainValue(requestBody.fields)){
            objRes = libIL.createObjErrorAPI(libIL.ERROR_CODE_MSG.API_FIELDS_KHONG_TON_TAI);
            return objRes;
        }
        switch(requestBody.type){
            case "itemfulfillment_from_to":
                objRes = libIL.apiAddItemFulfillmentFromTO(requestBody);
                break;
            case "itemreceipt_from_to":
                objRes = libIL.apiAddItemReceiptFromTO(requestBody);
                break;
            case "itemreceipt_from_po":
                objRes = libIL.apiAddItemReceiptFromPO(requestBody);
                break;
            case "cashsale":
                objRes = libIL.apiAddCashSale(requestBody);
                break;
            case "creditmemo":
                objRes = libIL.apiAddCreditMemo(requestBody);
                break;
            case "invoice":
                objRes = libIL.apiAddInvoice(requestBody);
                break;
            case "salesorder":
                objRes = libIL.apiAddSalesOrder(requestBody);
                break;
            default:
                objRes = libIL.createObjErrorAPI(libIL.ERROR_CODE_MSG.API_TYPE_KHONG_TON_TAI);
                break;
        }
        return objRes;
    }

    const callActionUpdate = (requestBody) => {
        let objRes = {};
        if(!lbf.isContainValue(requestBody.fields)){
            objRes = libIL.createObjErrorAPI(libIL.ERROR_CODE_MSG.API_FIELDS_KHONG_TON_TAI);
            return objRes;
        }
        switch(requestBody.type){
            case "itemfulfillment_from_to":
                objRes = libIL.apiUpdateItemFulfillmentFromTO(requestBody);
                break;
            case "itemreceipt_from_to":
                objRes = libIL.apiUpdateItemReceiptFromTO(requestBody);
                break;
            case "cashsale":
                objRes = libIL.apiUpdateCashSale(requestBody);
                break;
            case "creditmemo":
                objRes = libIL.apiUpdateCreditMemo(requestBody);
                break;
            case "invoice":
                objRes = libIL.apiUpdateInvoice(requestBody);
                break;
            case "salesorder":
                objRes = libIL.apiUpdateSalesOrder(requestBody);
                break;
            case "itemlocationconfiguration":
                objRes = libIL.apiUpdateItemLocationConfiguration(requestBody);
                break;
            default:
                objRes = libIL.createObjErrorAPI(libIL.ERROR_CODE_MSG.API_TYPE_KHONG_TON_TAI);
                break;
        }
        return objRes;
    }

    return { post }
});
