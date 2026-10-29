/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  01 Apr 2026         Phu Pham                Init & create file
 */
define([
    'N/query',
    '../cons/scv_cons_file.js'
],
function(
    query,
    constFile
) {

     const loadScriptLibrary = (form) => {
        const folder = constFile.getCurrentAppFolder();

        const arrFileScript = query.runSuiteQL({
            query: `SELECT DISTINCT a.name, a.url, a.filetype, b.name as folder_name
            FROM file a,
                (SELECT id, name, appfolder
                    FROM MediaItemFolder
                    START WITH appfolder = '${folder}'
                    CONNECT BY PRIOR id = parent) b
            WHERE a.folder = b.id
                AND a.isinactive = 'F'
                AND a.name IN ('scv_form.js', 'scv_form.css')`
        }).asMappedResults();


        let objStyleSheet = arrFileScript.find(e => e.filetype == "STYLESHEET");
        let objJavaScript = arrFileScript.find(e => e.filetype == "JAVASCRIPT");

        let contentsScript = `
            <link rel="stylesheet" href="${objStyleSheet.url}">
            <script type="text/javascript" src="${objJavaScript.url}"></script>
        `;
        
        form.addField({
            id: "custpage_scv_html_" + Date.now(),
            type: "inlinehtml",
            label: "Form Script"
        }).defaultValue = contentsScript;
    }

    const injectCustomScripts = (form, arrScript) => {
        if(arrScript.length === 0) return;

        const folder = constFile.getCurrentAppFolder();
        const arrFileScript = query.runSuiteQL({
            query: `SELECT DISTINCT a.name, a.url, a.filetype, b.name as folder_name
            FROM file a,
                (SELECT id, name, appfolder
                    FROM MediaItemFolder
                    START WITH appfolder = '${folder}'
                    CONNECT BY PRIOR id = parent) b
            WHERE a.folder = b.id
                AND a.isinactive = 'F'
                AND a.name IN ('${arrScript.join("', '")}')`
        }).asMappedResults();

        arrFileScript.sort((a, b) => (b.filetype === "STYLESHEET") - (a.filetype === "STYLESHEET"));
        
        let contentsScript = ``;
        for(let objScript of arrFileScript) {
            if(objScript.filetype === "STYLESHEET") {
                contentsScript += `<link rel="stylesheet" href="${objScript.url}">`;
            } else if(objScript.filetype === "JAVASCRIPT") {
                contentsScript += `<script type="text/javascript" src="${objScript.url}"></script>`;
            }
        }
        
        form.addField({
            id: "custpage_scv_html_" + Date.now(),
            type: "inlinehtml",
            label: "Form Script"
        }).defaultValue = contentsScript;
    }

    return {
        loadScriptLibrary,
        injectCustomScripts
    };
    
});
