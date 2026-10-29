/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  07 Jan 2025         Phu Pham			    Move code from Aeon Delight
 */
define(["N/https", "../lib/scv_lib_cs.js", './scv_cons_color.js'],
    function(https, libCS, constColor) {

        const URL_API = {
            TTDN: 'https://thongtindoanhnghiep.co/api/company/',
            VIET_QR: 'https://api.vietqr.io/v2/business/'
        };

        const searchInfoTaxNumber = (scriptContext, isUpperCase) => {
            let curRec = scriptContext.currentRecord;
            let sublistId = scriptContext.sublistId;
            let fieldId = scriptContext.fieldId;

            if(!sublistId && fieldId == 'custentity_scv_tax_number') {
                let tax_number = curRec.getValue(fieldId);
                if(!tax_number) return {};

                libCS.showLoadingDialog(true);
                libCS.delay(200)
                    .then(() => {
                        let response = getDataApiSearchInfoMST(tax_number);
                        setValueData(curRec, response, isUpperCase);
                    })
                    .catch((err) => console.error(err))
                    .finally(() => libCS.showLoadingDialog(false))
            }
        }

        const setValueData = (curRec, response, isUpperCase) => {
            let companyname = transformTextToUpper(response.companyname, isUpperCase);
            let companyname_eng = transformTextToUpper(response.companyname_eng, isUpperCase);

            curRec.setValue('companyname', companyname);
            curRec.setValue('custentity_scv_legal_name', companyname);
            curRec.setValue('custentity_scv_eng_name', companyname_eng);
            curRec.setValue('phone', response.phone);
            curRec.setValue('custentity_scv_phone_no', response.phone);

            let sl = "addressbook";
            // remove all line
            clear_splits(sl);
            addElementMsgError(response);

            try {
                if(!!response.address) {
                    // curRec.setCurrentSublistValue(sl, "label", response.address);
                    try {
                        curRec.selectNewLine({ sublistId: sl });
                        curRec.setCurrentSublistValue(sl, "defaultbilling", true);
                        curRec.setCurrentSublistValue(sl, "defaultshipping", true);
                        let childRec = curRec.getCurrentSublistSubrecord({ sublistId: sl, fieldId: "addressbookaddress"});
                        childRec.setValue('addrtext', response.address);
                        childRec.setValue('override', true);
                        curRec.commitLine({ sublistId: sl });
                    } catch (err) {
                        let childRec = curRec.getSubrecord({fieldId: "addressbookaddress"});
                        childRec.setValue('addrtext', response.address);
                        childRec.setValue('override', true);

                        curRec.setValue("defaultbilling", true);
                        curRec.setValue("defaultshipping", true);
                        curRec.setValue("addressbookaddress_text", response.address);
                    }
                } else {
                    curRec.setValue('defaultaddress', null);
                }
            } catch(err) {
                console.error(err.message);
            }
        }

        const updateFieldsToUpper = () => {
            const companyName = document.getElementById("companyname");
            const engName = document.getElementById("custentity_scv_eng_name");
            const legalName = document.getElementById("custentity_scv_legal_name");
            const elements = [companyName, engName, legalName];

            elements.forEach(ele => {
                ele.addEventListener('input', debounce(handleInputTextToUpper, 500));
            });
        }

        const handleInputTextToUpper = (e) => {
            let targetValue = e.target.value;
            if(targetValue.length >= 3) {
                e.target.value = transformTextToUpper(targetValue, true);
            }
        }

        function debounce(func, wait) {
            let timeout;
            return function(...args) {
                const context = this;
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(context, args), wait);
            };
        }

        const transformTextToUpper = (text, isUpperCase) => {
            if(!!text && isUpperCase === true) {
                return text.toUpperCase();
            }
            return text;
        }

        const addElementMsgError = (response) => {
            let fieldId = 'custentity_scv_tax_number_fs';
            let eleError = document.querySelector('span[scv-show-msg-error="T"]');

            if(!response.companyname && !response.address) {
                if(!eleError) {
                    let spanElement = document.getElementById(fieldId);
                    let parentElement = spanElement.closest('div');

                    let newNode = document.createElement("span");
                    newNode.innerHTML = 'Không tìm thấy thông tin doanh nghiệp!';
                    newNode.setAttribute('style', `font-size: 14px; color: ${constColor.RED[700]};`);
                    newNode.setAttribute('scv-show-msg-error', 'T');
                    newNode.classList.add('smallgraytextnolink', 'uir-label');
                    parentElement.appendChild(newNode);   
                }
            } else {
                eleError?.remove();
            }
        }

        const getDataApiSearchInfoMST = (tax_number) => {
            let objBody = getDataApiTTDN(tax_number);
            if(objBody.isSuccess === false) {
                objBody = getDataApiVietQR(tax_number);
            }
            return objBody;
        }
    
        const getDataApiTTDN = (tax_number) => {
            let baseUrl = URL_API.TTDN + tax_number;
            let response = callApiGet(baseUrl);
            let objBody = getResponseBody(response);
            
            let objRes = {
                isSuccess: false,
                companyname: '', address: '',
                phone: '', companyname_eng: ''
            };
            if(!!objBody && objBody?.ID != 0) {
                objRes.isSuccess = true;
                objRes.companyname = objBody.Title;
                objRes.address = objBody.DiaChiCongTy;
                objRes.phone = objBody.NoiDangKyQuanLy_DienThoai;
                objRes.companyname_eng = objBody.TitleEn;
            }
            return objRes;
        }
    
        const getDataApiVietQR = (tax_number) => {
            let baseUrl = URL_API.VIET_QR + tax_number;
            let response = callApiGet(baseUrl);
            let objBody = getResponseBody(response);
            
            let objRes = {
                isSuccess: false,
                companyname: '', address: '', 
                phone: '', companyname_eng: ''
            };
    
            if(!!objBody) {
                objRes.isSuccess = true;
                objRes.companyname = objBody?.data?.name || '';
                objRes.address = objBody?.data?.address || '';
                objRes.companyname_eng = objBody?.data?.internationalName || '';
            }
            return objRes;
        }
    
        function callApiGet(baseUrl) {
            let headers = {'Accept': '*/*'};
            let response = https.get({
                url: baseUrl,
                headers: headers
            });
            return response;
        }
    
        function getResponseBody(res){
            if(res.code == 200) {
                let body = JSON.parse(res.body);
                return body;
            }
            return null;
        }
        return {
            URL_API: URL_API,
            searchInfoTaxNumber: searchInfoTaxNumber,
            updateFieldsToUpper: updateFieldsToUpper,
            getDataApiSearchInfoMST: getDataApiSearchInfoMST,
            getDataApiVietQR: getDataApiVietQR,
            getDataApiTTDN: getDataApiTTDN
        };
        
    });
    