/**
 *  Date                Author                  Description
 *  06 Oct 2026         Phu Pham			    Init, create file
 */
define([
    'N/search', 'N/record',
    '../cons/scv_cons_transactionstatus.js',
    '../cons/scv_cons_search_er_checks.js',
],
    function(
        search, record,
        constTranStatus,
        constSearchErChecks,
    ) {

        const updateRelatedTransERCheck = (curRec) => {
            // let objErStatus = constTranStatus.getDataRecordByRecType(curRec.type);
            // let origstatus = curRec.getValue("origstatus");

            let er_update_checks = curRec.getValue("custbody_scv_er_update_checks");
            let accountingapproval = curRec.getValue("accountingapproval");
            let emp_advanced_er = curRec.getValue("custbody_scv_employee_advanced_er") || [];

            // const isAccountingApproved = [
            //     objErStatus.ApprovedByAccounting.ID,
            //     objErStatus.ApprovedOverriddenByAccounting.ID
            // ].includes(origstatus);

            if(accountingapproval && !er_update_checks && emp_advanced_er.length > 0) {
                let data = constSearchErChecks.getDataSource(search.createFilter({
                    name: 'internalid', 
                    operator: "anyof", 
                    values: curRec.id
                }));

                // TODO: không cần sử dụng scheduled script vì 1 ER chỉ liên kết một vài phiếu check. thường thì liên kết 1 - 1.
                processChecksByER(curRec, data);
            }
        }

        const processChecksByER = (curRec, data) => {
            for(let obj of data) {
                let objCheck = search.lookupFields({
                    type: "check", // ss đã lọc transaction type = 'Check'
                    id: obj.related_trans,
                    columns: ["custbody_scv_employeeadvanced_checks"]
                });

                let arrEmpAdvanCheck = objCheck?.custbody_scv_employeeadvanced_checks || [];
                arrEmpAdvanCheck = arrEmpAdvanCheck.map(e => e.value);
                arrEmpAdvanCheck.push(curRec.id.toString());

                let objValues = {
                    custbody_scv_employeeadvanced_checks: arrEmpAdvanCheck
                };
                
                submitRecord("check", obj.related_trans, objValues);
            }

            submitRecord(curRec.type, curRec.id, {
                custbody_scv_er_update_checks: true,
            });
        }

        const submitRecord = (rectype, recid, values) => {
            record.submitFields({
                type: rectype, id: recid,
                values: values,
                options: {enableSourcing: false, ignoreMandatoryFields: true}
            });
        }

        return {
            updateRelatedTransERCheck
        };
    });
    