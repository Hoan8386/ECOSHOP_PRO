/**
 * Nội dung: Helper render Pretty Print JSON / Plain Text cho Suitelet
 * =======================================================================================
 *  Date                Author                  Description
 *  20 Nov 2026         Phu Pham                Init, create file
 */
define([
    'N/query', 'N/file',
    './scv_cons_file.js',
],
    (
        query, file,
        constFile,
    ) => {

        const getTemplatePrettyPrint = (resBody, fieldGrpId = "") => {
            const folder = constFile.getCurrentAppFolder();
            const files = query.runSuiteQL({
                query: `SELECT DISTINCT a.id, a.name, a.url, a.filetype
                        FROM file a,
                            (SELECT id
                             FROM MediaItemFolder
                             START WITH appfolder = ?
                             CONNECT BY PRIOR id = parent) b
                        WHERE a.folder = b.id
                          AND a.isinactive = 'F'
                          AND a.name IN ('scv_pretty_print.css', 'scv_pretty_print.js')`,
                params: [folder]
            }).asMappedResults();

            const cssFile = files.find(f => f.name === 'scv_pretty_print.css');
            const jsFile = files.find(f => f.name === 'scv_pretty_print.js');

            let cssContent = '';
            let jsContent = '';
            try {
                if (cssFile?.id) cssContent = file.load({ id: cssFile.id }).getContents();
                if (jsFile?.id) jsContent = file.load({ id: jsFile.id }).getContents();
            } catch (e) {
                log.error('scv_cons_pretty_print.getTemplatePrettyPrint', e);
            }

            const hideGrpCol = fieldGrpId
                ? `const row = document.getElementById("tr_fg_${fieldGrpId}");
                   if (row && row.lastElementChild) row.lastElementChild.style.setProperty("display", "none", "important");`
                : '';

            const scriptInit = `
                ${hideGrpCol}
                if (window.ScvPrettyPrint) ScvPrettyPrint.render(${JSON.stringify(resBody)});
            `;

            const styleTag = cssContent
                ? `<style>${cssContent}</style>`
                : (cssFile?.url ? `<link rel="stylesheet" href="${cssFile.url}" type="text/css" />` : '');
            const scriptTag = jsContent
                ? `<script type="text/javascript">${jsContent}</script>`
                : (jsFile?.url ? `<script type="text/javascript" src="${jsFile.url}"></script>` : '');

            return {
                html: `
                    <div class="scv-pp-wrapper">
                        <div class="scv-pp-toolbar">
                            <span id="scvPpModeLabel" class="mode-label"></span>
                            <div class="scv-pp-actions">
                                <button type="button" class="copy-btn" id="scvPpToggleAllBtn" onclick="ScvPrettyPrint.toggleAll()">Collapse All</button>
                                <button type="button" class="copy-btn" id="scvPpPlainBtn" onclick="ScvPrettyPrint.togglePlain()">Plain text</button>
                                <button type="button" class="copy-btn" id="scvPpCopyBtn" onclick="ScvPrettyPrint.copyOutput()">Copy</button>
                            </div>
                        </div>
                        <pre><code id="scvPpOutput"></code></pre>
                    </div>`,
                libaryLink: `${styleTag}\n${scriptTag}`,
                scriptInit: scriptInit
            };
        }

        return {
            getTemplatePrettyPrint,
        };
    });
