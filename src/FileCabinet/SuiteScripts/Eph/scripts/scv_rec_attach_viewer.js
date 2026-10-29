/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  03 Jul 2026         Phu Pham                Init & create file
 */

const scvAttachViewer = {
    scriptId: "customscript_scv_sl_json_viewer",
    deploymentId: "customdeploy_scv_sl_json_viewer",

    attachToRecord: function ({rectype = "", recid = "", fields = []}) {
        fields.forEach(fieldId => {
            const eleJsonField = document.querySelector(`[data-field-name="${fieldId}"]`);
            let inputElement = eleJsonField.querySelector('[data-nsps-type="field_input"]');
            inputElement.style.setProperty("display", "none");

            let baseUrl = this.getUrlSuitelet();
            baseUrl += `&fieldid=${fieldId}&rectype=${rectype}&recid=${recid}`;

            const newSpanElement = document.createElement('span');
            
            newSpanElement.innerHTML = `<span class="uir-field-input" style="display: flex; justify-content: flex-start; align-items: center;">
                <a style="font-size: 13px;" href="${baseUrl + "&action=preview"}" class="smalltext" target="_blank">Preview</a>
                <span style="margin-left: 8px; font-size: 13px; cursor: pointer; text-decoration: underline;" onclick="window.location.replace('${baseUrl + "&action=download"}')" class="smalltext">Download</span>
            </span>`;
            eleJsonField.appendChild(newSpanElement);

            // add
            // <span id="scvCopyJsonViewer" style="margin-left: 8px; font-size: 13px; cursor: pointer; text-decoration: underline;" class="smalltext">Copy</span>
            // ✅ ✓
        });
    },

    getUrlSuitelet: function() {
        return nlapiResolveURL('SUITELET', this.scriptId, this.deploymentId, false);
    }
};