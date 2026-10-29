/**
 *  Date                Author                  Description
 *  25 Aug 2025         Phu Pham			    Init, create file
 */
define(['N/runtime'],
    function(runtime) {

        const Employee = {
            System: {
                ID: -4,
                NAME: "System"
            },
            ScvSupport: {
                ID: 14,
                NAME: "SCV Support"
            }
        };

        const getCurrentUser = () => {
            let objUser = runtime.getCurrentUser();
            
            let userId = objUser.id * 1;
            return userId == Employee.System.ID ? Employee.ScvSupport.ID : userId;
        }

        const setCurrentUserEdit = (curRec) => {
            let userId = getCurrentUser();
            // log.error("res", userId);
            curRec.setValue("custbody_scv_current_user_edit", userId);
        }

        const setCurrentUserToField = (curRec, fieldId) => {
            let userId = getCurrentUser();
            curRec.setValue(fieldId, userId);
        }

        return {
            getCurrentUser,
            setCurrentUserEdit,
            setCurrentUserToField
        }; 
    });
    