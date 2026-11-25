/**
 * Nội dung: Pretty Print JSON / Plain Text renderer (hỗ trợ Expand/Collapse Object & Array)
 * =======================================================================================
 *  Date                Author                  Description
 *  20 Nov 2026         Phu Pham                Init, create file
 */
window.ScvPrettyPrint = (() => {
    let currentPrettyJSON = "";
    let currentParsedObj = null;
    let isPlainMode = false;
    let isJsonMode = true;
    let isAllCollapsed = false;

    const escapeHtml = (str) => {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    };

    const renderPrimitive = (val) => {
        if (val === null) return `<span class="json-null">null</span>`;
        if (typeof val === "boolean") return `<span class="json-boolean">${val}</span>`;
        if (typeof val === "number") return `<span class="json-number">${val}</span>`;
        return `<span class="json-string">${escapeHtml(JSON.stringify(val))}</span>`;
    };

    const buildJsonTree = (val, keyName = null, isLast = true) => {
        const comma = isLast ? "" : `<span class="json-punct">,</span>`;
        const keyHtml = keyName !== null
            ? `<span class="json-key">${escapeHtml(JSON.stringify(keyName))}</span><span class="json-punct">: </span>`
            : "";

        if (val !== null && typeof val === "object") {
            const isArr = Array.isArray(val);
            const openBracket = isArr ? "[" : "{";
            const closeBracket = isArr ? "]" : "}";
            const entries = isArr ? val : Object.keys(val);
            const count = entries.length;

            if (count === 0) {
                return `<div class="pp-line">${keyHtml}<span class="json-punct">${openBracket}${closeBracket}</span>${comma}</div>`;
            }

            const summaryText = isArr
                ? `... ${count} item${count > 1 ? "s" : ""}`
                : `... ${count} key${count > 1 ? "s" : ""}`;

            let childrenHtml = "";
            if (isArr) {
                for (let i = 0; i < count; i++) {
                    childrenHtml += buildJsonTree(val[i], null, i === count - 1);
                }
            } else {
                for (let i = 0; i < count; i++) {
                    const k = entries[i];
                    childrenHtml += buildJsonTree(val[k], k, i === count - 1);
                }
            }

            return `<div class="pp-node">`
                + `<div class="pp-header">`
                + `<span class="pp-toggle" onclick="ScvPrettyPrint.toggleNode(this)" title="Expand / Collapse">&#9660;</span>`
                + `${keyHtml}<span class="json-punct">${openBracket}</span>`
                + `<span class="pp-summary" onclick="ScvPrettyPrint.toggleNode(this)">${summaryText}</span>`
                + `</div>`
                + `<div class="pp-children">${childrenHtml}</div>`
                + `<div class="pp-footer"><span class="json-punct">${closeBracket}</span>${comma}</div>`
                + `</div>`;
        }

        return `<div class="pp-line">${keyHtml}${renderPrimitive(val)}${comma}</div>`;
    };

    const setModeLabel = (mode) => {
        const label = document.getElementById("scvPpModeLabel");
        if (!label) return;
        label.textContent = mode;
        label.className = "mode-label " + (mode === "JSON" ? "json" : "text");
    };

    const updateTreeActionButtons = (showTreeActions) => {
        const toggleAllBtn = document.getElementById("scvPpToggleAllBtn");
        if (!toggleAllBtn) return;
        toggleAllBtn.style.display = showTreeActions ? "" : "none";
        toggleAllBtn.classList.toggle("active", isAllCollapsed);
        toggleAllBtn.textContent = isAllCollapsed ? "Expand All" : "Collapse All";
    };

    const applyOutputDisplay = () => {
        const outputEl = document.getElementById("scvPpOutput");
        if (!outputEl || !currentPrettyJSON) return;

        if (isPlainMode || !isJsonMode) {
            outputEl.textContent = currentPrettyJSON;
            updateTreeActionButtons(false);
        } else {
            isAllCollapsed = false;
            outputEl.innerHTML = buildJsonTree(currentParsedObj);
            updateTreeActionButtons(true);
        }
    };

    const render = (rawInput) => {
        const outputEl = document.getElementById("scvPpOutput");
        const plainBtn = document.getElementById("scvPpPlainBtn");

        if (rawInput === undefined || rawInput === null || String(rawInput).trim() === "") {
            currentPrettyJSON = "";
            currentParsedObj = null;
            if (outputEl) outputEl.innerHTML = "";
            updateTreeActionButtons(false);
            return;
        }

        const raw = typeof rawInput === "string" ? rawInput : JSON.stringify(rawInput);

        try {
            let obj = JSON.parse(raw);
            if (typeof obj === "string") {
                try {
                    obj = JSON.parse(obj);
                } catch (inner) {
                    // Keep as plain string if inner content is not JSON
                }
            }
            isJsonMode = true;
            currentParsedObj = obj;
            currentPrettyJSON = JSON.stringify(obj, null, 2);
            if (plainBtn) plainBtn.style.display = "";
            setModeLabel("JSON");
            applyOutputDisplay();
        } catch (e) {
            isJsonMode = false;
            currentParsedObj = null;
            currentPrettyJSON = raw;
            if (plainBtn) plainBtn.style.display = "none";
            setModeLabel("Plain text");
            applyOutputDisplay();
        }
    };

    const toggleNode = (el) => {
        const node = el.closest(".pp-node");
        if (!node) return;
        const isCollapsed = node.classList.toggle("collapsed");
        const toggleIcon = node.querySelector(":scope > .pp-header > .pp-toggle");
        if (toggleIcon) {
            toggleIcon.innerHTML = isCollapsed ? "&#9654;" : "&#9660;";
        }
    };

    const expandAll = () => {
        const nodes = document.querySelectorAll("#scvPpOutput .pp-node.collapsed");
        nodes.forEach((node) => {
            node.classList.remove("collapsed");
            const toggleIcon = node.querySelector(":scope > .pp-header > .pp-toggle");
            if (toggleIcon) toggleIcon.innerHTML = "&#9660;";
        });
    };

    const collapseAll = () => {
        const nodes = document.querySelectorAll("#scvPpOutput .pp-node");
        nodes.forEach((node, idx) => {
            // Keep root node expanded so top-level keys remain visible
            if (idx === 0) return;
            node.classList.add("collapsed");
            const toggleIcon = node.querySelector(":scope > .pp-header > .pp-toggle");
            if (toggleIcon) toggleIcon.innerHTML = "&#9654;";
        });
    };

    const toggleAll = () => {
        isAllCollapsed = !isAllCollapsed;
        if (isAllCollapsed) {
            collapseAll();
        } else {
            expandAll();
        }
        updateTreeActionButtons(true);
    };

    const togglePlain = () => {
        isPlainMode = !isPlainMode;
        const btn = document.getElementById("scvPpPlainBtn");
        if (btn) {
            btn.classList.toggle("active", isPlainMode);
            btn.textContent = isPlainMode ? "Highlighted" : "Plain text";
        }
        applyOutputDisplay();
    };

    const fallbackCopy = (text, onSuccess) => {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand("copy");
            onSuccess();
        } catch (e) {
            alert("Unable to copy automatically, please copy manually.");
        }
        document.body.removeChild(textarea);
    };

    const copyOutput = () => {
        if (!currentPrettyJSON) return;

        const btn = document.getElementById("scvPpCopyBtn");
        const showCopied = () => {
            if (!btn) return;
            const original = btn.textContent;
            btn.textContent = "Copied!";
            btn.classList.add("copied");
            setTimeout(() => {
                btn.textContent = original;
                btn.classList.remove("copied");
            }, 1500);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(currentPrettyJSON).then(showCopied).catch(() => {
                fallbackCopy(currentPrettyJSON, showCopied);
            });
        } else {
            fallbackCopy(currentPrettyJSON, showCopied);
        }
    };

    return {
        render,
        toggleNode,
        toggleAll,
        expandAll,
        collapseAll,
        togglePlain,
        copyOutput
    };
})();
