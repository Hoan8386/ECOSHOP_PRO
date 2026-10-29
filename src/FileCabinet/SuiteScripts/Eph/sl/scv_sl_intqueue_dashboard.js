/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
    'N/runtime', 'N/search', 'N/format',
    '../cons/scv_cons_form.js',
    '../cons/scv_cons_search_count_intqueue_bystatus.js',
    '../common/scv_common_intqueue_dash.js',
],
    (
        runtime, search, format,
        constForm,
        searchCountIntQueueStt,
        commonIntQueueDash,
    ) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */

        const Suitelet = {
            ID: "customscript_scv_sl_intqueue_dashboard",
            DEPLOYID_UI: "customdeploy_scv_sl_intqueue_dashboard",
            DEPLOYID_DATA: "customdeploy_scv_sl_intqueue_dash_svc",
        };

        const onRequest = (scriptContext) => {
            constForm.setContext(scriptContext);
            constForm.setServiceScript(Suitelet.ID, Suitelet.DEPLOYID_DATA);

            let request = scriptContext.request;
            let params = request.parameters;
            let curScript = runtime.getCurrentScript();

            if(request.method === 'POST' && curScript.deploymentId == Suitelet.DEPLOYID_DATA) {
                let objResponse = {data: []};

                switch(params.action) {
                    case "getDataCountIntQueueByStatus":
                        objResponse.data = getDataCountIntQueueByStatus(params);
                        break;
				}

                constForm.write(objResponse);
            } else {
                if(request.method == "GET"){
                    onCreateFormUI(params);
                    constForm.writePage();
                }
            }
        }

        const onCreateFormUI = (params) => {
            constForm.createForm({title: "Integration Queue Dashboard"}, "../cssl/scv_cs_sl_intqueue_dashboard.js");
            // constForm.addButton({id: "custpage_btn_export", label: "Export", functionName: "onSearchResult('T')"});
            constForm.addPageLink([searchCountIntQueueStt.ID]);

            // filters
            let mainGrp = constForm.addFieldGroup({id: "fieldgrp_main", label: "Filters"});
            let arrDateRange = commonIntQueueDash.getDataDateRange();
            let dateRangeId = params.custpage_date_range || commonIntQueueDash.DateRange.ThisMonth.ID;
            let displayType = !(params.custpage_date_range == commonIntQueueDash.DateRange.Custom.ID) ? "disabled" : "normal";
            let objDateRange = commonIntQueueDash.getDataRangeById(dateRangeId);

            if(!params.custpage_fromdt) {
                params.custpage_fromdt = objDateRange.fromDate;
            }

            if(!params.custpage_todt) {
                params.custpage_todt = objDateRange.toDate;
            }

            // add fields
            constForm.addField({
                id: 'custpage_date_range', label: 'Date Range', type: "select", 
                container: mainGrp.id
            }, true, {
                defaultValue: dateRangeId,
                lookup: {
                    data: arrDateRange,
                }
            });

            constForm.addField({
                id: 'custpage_fromdt', label: 'FROM DATE', type: "date", container: mainGrp.id
            }, true, {
                layoutType: "startrow",
                defaultValue: params.custpage_fromdt,
                displayType: displayType
            });

            constForm.addField({
                id: 'custpage_todt', label: 'TO DATE', type: "date", container: mainGrp.id
            }, true, {
                layoutType: "endrow",
                defaultValue: params.custpage_todt,
                displayType: displayType
            });

            constForm.addGridDx({
                id: "custpage_sl_result",
                type: "grid",
                label: "Result",
                columns: commonIntQueueDash.getDataColumnResIntQueue()
            });

            // const arrResult = getDataCountIntQueueByStatus(params);
            // constForm.setDataDx("custpage_sl_result", arrResult);
        }

        const getDataCountIntQueueByStatus = (params) => {
            let arrResult = [];
            let objTotal = {
                level: 1,
                retry_status_display: "Total",
                count: 0,
            };

            if(!!params.custpage_fromdt && !!params.custpage_todt) {
                const objCreated = search.createFilter({
                    name: 'created', 
                    operator: "within", 
                    values: [params.custpage_fromdt, params.custpage_todt]
                });

                arrResult = searchCountIntQueueStt.getDataSource(objCreated);

                objTotal.count = arrResult.reduce((a, b) => a + Number(b.count), 0);
                objTotal.status_percent = arrResult.length === 0 ? "" : "100.00%";
            }

            arrResult = arrResult.map(e => {
                let percent = (e.count / objTotal.count) * 100;
                return { 
                    level: 2,
                    ...e, 
                    status_percent: percent.toFixed(2) + "%"
                };
            });

            arrResult.unshift(objTotal);
            return arrResult;
        }

        return {onRequest}

    });
