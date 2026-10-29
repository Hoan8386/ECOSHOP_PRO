/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define([
    '../common/scv_common_il_global_srcext.js',
],
    (
        commonIlGlobalSrc
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
            let response = {};
            log.error("trace-request-il-global", requestBody);
            switch(requestBody.action){
                case "get":
                    response = callActionGet(requestBody);
                    break;
                case "add":
                    response = callActionAdd(requestBody);
                    break;
                case "update":
                    response = callActionUpdate(requestBody);
                    break;
                default:
                    response = commonIlGlobalSrc.createObjErrorAPI(commonIlGlobalSrc.ErrorCode.ApiActionNotExist);
                    break;
            }
            return response;
        }

        const callActionGet = (requestBody) => {
            let objRes = {};
            switch(requestBody.type){
                case "unitstype":
                    objRes = commonIlGlobalSrc.apiGetUnitsType(requestBody);
                    break;
                default:
                    objRes = commonIlGlobalSrc.createObjErrorAPI(commonIlGlobalSrc.ErrorCode.ApiTypeNotExist);
                    break;
            }
            return objRes;
        }

        const callActionAdd = (requestBody) => {
            let objRes = {};
            if(requestBody.fields === undefined){
                objRes = commonIlGlobalSrc.createObjErrorAPI(commonIlGlobalSrc.ErrorCode.ApiFieldsNotExist);
                return objRes;
            }
            switch(requestBody.type){
                case "unitstype":
                    objRes = commonIlGlobalSrc.apiAddUnitsType(requestBody);
                    break;
                default:
                    objRes = commonIlGlobalSrc.createObjErrorAPI(commonIlGlobalSrc.ErrorCode.ApiTypeNotExist);
                    break;
            }
            return objRes;
        }

        const callActionUpdate = (requestBody) => {
            let objRes = {};
            if(requestBody.fields === undefined){
                objRes = commonIlGlobalSrc.createObjErrorAPI(commonIlGlobalSrc.ErrorCode.ApiFieldsNotExist);
                return objRes;
            }
            switch(requestBody.type){
                case "unitstype":
                    objRes = commonIlGlobalSrc.apiUpdateUnitsType(requestBody);
                    break;
                default:
                    objRes = commonIlGlobalSrc.createObjErrorAPI(commonIlGlobalSrc.ErrorCode.ApiTypeNotExist);
                    break;
            }
            return objRes;
        }

        return {post}

    });
