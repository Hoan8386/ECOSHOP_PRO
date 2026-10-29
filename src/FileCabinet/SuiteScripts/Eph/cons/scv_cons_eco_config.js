/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  18 March 2026         Phu Pham			    Init, create file
 */
define([
    'N/url',
    '../cons/scv_cons_crypto.js',
],
    function(
        url,
        constCrypto,
    ) {

        const Records = {
            KEY_SECRET_SALT: 'SCV@ECONNECT'
        };

        const Fields = {
            ID: "id",
            INACTIVE: "isinactive",
            NAME: "name",
        };

        const beforeSubmit_HandlePassWord = (scriptContext) => {
            let trigger_type = scriptContext.type;
			let newRec = scriptContext.newRecord;

            let isEncodePass = false;
            let password_base = newRec.getValue("custrecord_scv_itg_eco_cfg_password");
            if(trigger_type == "create") {
                isEncodePass = true;
            } else if(trigger_type === "edit") {
                let oldRec = scriptContext.oldRecord;
                let old_password = oldRec.getValue("custrecord_scv_itg_eco_cfg_password");
                
                if(password_base != old_password) {
                    isEncodePass = true;
                }
            }

            if(isEncodePass === true) {
                let password_encode = constCrypto.handlePasswordsSafely(password_base, false, Records.KEY_SECRET_SALT);
                newRec.setValue("custrecord_scv_itg_eco_cfg_password", password_encode);
            }
        }

        const addBtnGetAccessToken = (form, curRec) => {
			let accessTokenURL = url.resolveScript({
                scriptId: 'customscript_scv_sl_econnect_token',
                deploymentId: 'customdeploy_scv_sl_econnect_token'
            });
            accessTokenURL += '&recid=' + curRec.id + '&rectype=' + curRec.type;

            form.addButton({
                id: "custpage_btn_ec_accesstoken",
                label: "Get Access Token",
                functionName: "window.location.replace('" + accessTokenURL + "');"
            });
		}

        const addInlineHtmlHiddenPassword = (form, isView) => {
            let custpage_scv_hidden_password = form.addField({
                id : "custpage_scv_hidden_password",
                type : "inlinehtml",
                label : "Hidden Password"
            });

            if(isView === true) {
                custpage_scv_hidden_password.defaultValue = `<script>
                    let attempts = 0;

                    function addHiddenUserPassword() {
                        const wrapperPassword = document.querySelector('div[data-walkthrough="Field:custrecord_scv_itg_eco_cfg_password"]');
                        if(!wrapperPassword && attempts < 3) {
                            attempts++;
                            setTimeout(() => addHiddenUserPassword(), 100);
                        } else {
                            wrapperPassword.setAttribute('style', 'display: none;');
                        }

                        const wrapperAccessToken = document.querySelector('div[data-walkthrough="Field:custrecord_scv_itg_eco_cfg_access_token"]');
                        wrapperAccessToken.setAttribute('style', 'word-break: break-all;');
                    }

                    addHiddenUserPassword();
                </script>`;
            } else {
                custpage_scv_hidden_password.defaultValue = `<script>
                    let attempts = 0;

                    function addHiddenUserPassword() {
                        const iptPassword = document.querySelector('input[id="custrecord_scv_itg_eco_cfg_password"]');
                        if(!iptPassword && attempts < 3) {
                            attempts++;
                            setTimeout(() => addHiddenUserPassword(), 100);
                        } else {
                            iptPassword.type = 'password';
                        }
                    }

                    addHiddenUserPassword();
                </script>`;
            }
        }

        return {
            Type: "customrecord_scv_itg_econnect_cfg",
            Fields,
            Records,

            beforeSubmit_HandlePassWord,
            addBtnGetAccessToken,
            addInlineHtmlHiddenPassword
        };
    });
    