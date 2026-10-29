/**
 * @NApiVersion 2.1
 * @NScriptType Portlet
 */
define(['N/file'],
    
    (file) => {
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
        const render = (params) => {
            let portlet = params.portlet;
            portlet.title = ('Bulk Processing');
            let inlineHTML_field = portlet.addField({
                id: "custpage_inline_html",
                type: "inlinehtml",
                label: "HTML"
            });
            let htmlFile = file.load('../html/scv_html_pl_mass_approval.html');
            inlineHTML_field.defaultValue = htmlFile.getContents();
        }
        
        return {render}
        
    });
