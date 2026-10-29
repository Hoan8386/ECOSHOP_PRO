/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
    'N/record', 'N/file',
],
    (
        record, file, 
    ) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */

        const onRequest = (scriptContext) => {
            let params = scriptContext.request.parameters;
            let response = scriptContext.response;

            let auditRec = record.load({ type: params.rectype, id: params.recid });
            let jsonString = auditRec.getValue(params.fieldid);
            if(!jsonString) {
                response.setHeader({
                    name: 'Content-Type',
                    value: 'application/json'
                });
                response.write(JSON.stringify({message: "No data."}));
                return;
            }

            let objData = JSON.parse(jsonString);
            
            if(params.action === "preview") {
                response.setHeader({
                    name: 'Content-Type',
                    value: 'application/json'
                });
                response.write(JSON.stringify(objData));
            } else {
                let name = auditRec.getValue("name");

                let index = params.fieldid.lastIndexOf("audit");
                let type = params.fieldid.slice(index, params.fieldid.length);

                let f = file.create({
                    name: `${name} (${params.recid}_${type})` + ".json",
                    fileType: file.Type.JSON,
                    contents: JSON.stringify(objData),
                    encoding: file.Encoding.UTF8,
                });
                response.writeFile(f, false);
            }
        }

        return {onRequest}

    });
