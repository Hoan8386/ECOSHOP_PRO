/**
 * @NApiVersion 2.1
 * @NScriptType Portlet
 */
define([
    'N/query', 'N/runtime',
    'N/url',
    '../cons/scv_cons_appr_status.js',
],
    function (
        query, runtime,
        url,
        constApprStatus,
    ) {
        /**
         * Defines the Portlet script trigger point.
         * @param {Object} params - The params parameter is a JavaScript object. It is automatically passed to the script entry
         *     point by NetSuite. The values for params are read-only.
         * @param {Portlet} params.portlet - The portlet object used for rendering
         * @param {string} params.column - Column index forthe portlet on the dashboard; left column (1), center column (2) or
         *     right column (3)
         * @param {string} params.entity - (For custom portlets only) references the customer ID for the selected customer
         * @since 2015.2
         */

        const Script = {
            ID: "customscript_scv_sl_mass_approval_ima",
            DEPLOYID: "customdeploy_scv_sl_mass_approval_ima"
        };

        const render = (params) => {
            let portlet = params.portlet;
            portlet.title = "Mass Approval (IMA)";

            addColumnList({portlet});
            addRowList({portlet});
        }

        const addColumnList = ({portlet}) => {
            portlet.addColumn({
                id: 'custpage_col_type', type: 'text',
                label: 'Type', align: 'LEFT'
            });

            portlet.addColumn({
                id: 'custpage_col_count', type: 'integer',
                label: 'count', align: 'RIGHT'
            });

            portlet.addColumn({
                id: 'custpage_col_script', type: 'text',
                label: 'Script', align: 'LEFT'
            });
        }

        const addRowList = ({portlet}) => {
            let urlScript = url.resolveScript({
                scriptId: Script.ID,
                deploymentId: Script.DEPLOYID
            });

            let count = getDataCountApprovalIMA();
            let type = `<a href="${urlScript}" target="_blank">Item Master Application</a>`;
            let scriptUrl = `<a href="${urlScript}" target="_blank">View Detail</a>`;
            
            portlet.addRow({
                row: {
                    custpage_col_script: scriptUrl,
                    custpage_col_type: type,
                    custpage_col_count: count
                }
            });
        }

        const getDataCountApprovalIMA = () => {
            let objUser = runtime.getCurrentUser();

            let resultQuery = query.runSuiteQL({
                query: `SELECT 
                    COUNT(Ima.id)  as count,
                FROM customrecord_scv_item_ma Ima
                LEFT JOIN employee Emp ON Emp.id = Ima.custrecord_scv_ima_approver
                WHERE Ima.isinactive = 'F'
                    AND custrecord_scv_ima_app_status = ${constApprStatus.Records.PendingSupervisorApproval.ID}
                    AND (
                        Ima.custrecord_scv_ima_approver = ${objUser.id}
                        OR
                        Emp.custentity_scv_delegate_to = ${objUser.id}
                    )`
            }).asMappedResults();
        
            return resultQuery[0]?.count || 0;
        }

        return {render}

    });
