/**
 *  Date                Author                  Description
 *  24 Dec 2025         Phu Pham			    Init, create file
 */
define([
    'N/https', 'N/runtime',
],
    function(
        https, runtime, 
    ) {
        const REST_API_BROWSER = "https://system.netsuite.com/help/helpcenter/en_US/APIs/REST_API_Browser/record/v1/2023.1/index.html";

        const RECORDS = {
            _N: {
                file: null
            },
            FILES_IMPORTED: [],
            CORE: [
                {
                    NAME: "swagger-ui.css",
                    URL: "https://unpkg.com/swagger-ui-dist/swagger-ui.css",
                    PATH: ""
                },
                {
                    NAME: "swagger-ui-bundle.js",
                    URL: "https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js",
                    PATH: ""
                },
                {
                    NAME: "swagger-ui-standalone-preset.js",
                    URL: "https://unpkg.com/swagger-ui-dist/swagger-ui-standalone-preset.js",
                    PATH: ""
                },
            ],
        }

        const getTemplateSwaggerUI = (objSpec, fieldGrpId) => {
            const swaggerId = "scv-swagger-ui";

            let scriptInit = `
                const row = document.getElementById("tr_fg_${fieldGrpId}");
                row.lastElementChild.style.setProperty("display", "none", "important")
                SwaggerUIBundle({
                    dom_id: "#${swaggerId}",
                    layout: "BaseLayout",
                    docExpansion: "list",
                    // defaultModelsExpandDepth: -1,
                    deepLinking: false,
                    spec: ${JSON.stringify(objSpec)}
                });
            `;

            return {
                html: `<div id="${swaggerId}"></div>`,
                libaryLink: getLibaryIncludes(),
                scriptInit: scriptInit
            };
        }

        const getLibaryIncludes = () => {
            let arrLinkStyle = [], arrScript = [];
            
            for(let i = 0; i < RECORDS.CORE.length; i++){
                let objRes = RECORDS.CORE[i];

                let idxImported = RECORDS.FILES_IMPORTED.findIndex(e => e.name == objRes.NAME);
                if(idxImported > -1) continue;

                if(!!objRes.URL){
                    if(objRes.URL.indexOf(".css") > -1){
                        arrLinkStyle.push(`<link rel="stylesheet" href="${objRes.URL}" type="text/css" />`);

                        RECORDS.FILES_IMPORTED.push({
                            name: objRes.NAME,
                            url: objRes.URL
                        });

                        continue;
                    }
                    else if(objRes.URL.indexOf(".js") > -1){
                        arrScript.push(`<script type="text/javascript" src="${objRes.URL}"></script>`);

                        RECORDS.FILES_IMPORTED.push({
                            name: objRes.NAME,
                            url: objRes.URL
                        });

                        continue;
                    }
                }
            }

            return arrLinkStyle.join("\n") + "\n" + arrScript.join("\n");
        }

        const callApiSwaggerMetadata = (recType) => {
            let accountId = runtime.accountId;
            let urlCallApi = getUrlApiBaseMetadata(accountId) + "/" + recType;

            // use GET method for metadata-catalog + endpoint url;
            const response = https.requestSuiteTalkRest({
                method: 'GET',
                url: urlCallApi,
                headers: {
                    'Accept': "application/swagger+json",
                }
            });

			let body = JSON.parse(response.body);
			let code = response.code;

            return {code, body};
        }

        const getUrlApiBaseMetadata = (accountId) => {
            let siteAccount = accountId;

            if(siteAccount.includes("_SB1")) {
                siteAccount = siteAccount.replace("_SB1", "-sb1");
            }
            return `https://${siteAccount}.suitetalk.api.netsuite.com/services/rest/record/v1/metadata-catalog`;
        }

        const remapSwaggerIdToInternalId = (resBody) => {
            const { paths, components, ...restBody } = resBody;
            const objBody = {
                ...restBody,
                paths: {},
                components
            };

            // key có chứa {id} sẽ được đổi thành {internalid} vì Netsuite đang convert {id} = "" khi render lên giao diện
            for(let property in paths) {
                let newPath = property.replace("{id}", "{internalid}");
                objBody.paths[newPath] = paths[property];
            }

            return objBody;
        }

        return {
            REST_API_BROWSER,
            RECORDS,

            getLibaryIncludes,
            getTemplateSwaggerUI,

            callApiSwaggerMetadata,
            remapSwaggerIdToInternalId,
        }; 
    });
    