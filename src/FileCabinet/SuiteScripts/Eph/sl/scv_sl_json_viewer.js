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

            let curRec = record.load({ type: params.rectype, id: params.recid });
            let jsonString = curRec.getValue(params.fieldid);

            if(!jsonString) {
                response.setHeader({
                    name: 'Content-Type',
                    value: 'application/json'
                });
                response.write(JSON.stringify({message: "No data."}));
                return;
            }

            let isJson = true;
            let content = "";

            try {
                content = JSON.stringify(JSON.parse(jsonString), null, 4);
            } catch (e) {
                isJson = false;
                content = jsonString;
            }
            
            if(params.action === "preview") {
                response.setHeader({
                    name: "Content-Type",
                    value: isJson ? "application/json" : "text/plain"
                });
                response.write(content);
            } else {
                const objField = curRec.getField(params.fieldid);
                let fieldLabel = objField?.label?.toLowerCase() || "";
                fieldLabel = fieldLabel.replaceAll(" ", "-");

                let extension = isJson ? "json" : "txt";
                let fileType = isJson ? file.Type.JSON : file.Type.PLAINTEXT;
                let name = curRec.getValue("name") || curRec.getValue("custrecord_scv_bank_audit_reqid");
                if(!name) {
                    name = Date.now().toString();
                }

                const f = file.create({
                    name: `${name}_${fieldLabel}.${extension}`,
                    fileType: fileType,
                    contents: content,
                    encoding: file.Encoding.UTF8
                });

                response.writeFile(f, false);
            }
        }

        return {onRequest}

    });
