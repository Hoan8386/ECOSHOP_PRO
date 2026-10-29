
const reqBodyEle = document.querySelector('[data-field-name="custrecord_scv_eco_audit_reqbody"]');
const responseEle = document.querySelector('[data-field-name="custrecord_scv_eco_audit_response"]');
const saveExtErrEle = document.querySelector('[data-field-name="custrecord_scv_eco_audit_saveexterr"]');

const listNode = [reqBodyEle, responseEle, saveExtErrEle];
listNode.forEach((element) => {
    let inputElement = element.querySelector('[data-nsps-type="field_input"]');
    inputElement.style.setProperty("display", "none");

    let fieldId = element.getAttribute("data-field-name");

    let baseUrl = getUrlSuitelet("customscript_scv_sl_econnect_audit", "customdeploy_scv_sl_econnect_audit");
    baseUrl += `&fieldid=${fieldId}&rectype=${rectype}&recid=${recid}`;
    // add span
    const newSpanElement = document.createElement('span');
    newSpanElement.innerHTML = `<span class="uir-field-input">
        <a style="font-size: 13px;" href="${baseUrl + "&action=preview"}" class="smalltext" target="_blank">Preview</a>
        <span style="margin-left: 8px; font-size: 13px; cursor: pointer; text-decoration: underline;" onclick="window.location.replace('${baseUrl + "&action=download"}')" class="smalltext">Download</span>
    </span>`;
    element.appendChild(newSpanElement);
});

function getUrlSuitelet(scriptId, deploymentId) {
    return nlapiResolveURL('SUITELET', scriptId, deploymentId, false);
}