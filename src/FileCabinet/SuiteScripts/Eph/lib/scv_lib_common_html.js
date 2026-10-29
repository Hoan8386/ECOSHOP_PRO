define(['N/record', 'N/search', 'N/file',
	'../cons/scv_cons_format.js'
],
	/**
	 * @param {record} record
	 * @param {search} search
	 */
	function(record, search, file,
		constFormat
	) {
		/*
		* @param {Form} scriptContext.form - Current form
		 */
		function pinHeaderSublist(_form){
			_form.addField({
				id: 'custpage_stickyheaders_script',
				label: 'Hidden',
				type: "inlinehtml"
			}).defaultValue = '<script>' +
				'(function($){' +
				'$(function($, undefined){' +
				'$(".uir-machine-table-container")' + // All NetSuite tables are wrapped in this CSS class
				'.css("max-height", "70vh")' +
				// Make header row sticky.
				'.bind("scroll", (event) => {' +
				'$(event.target).find(".uir-machine-headerrow > td,.uir-list-headerrow > td")' +
				'.css({' +
				'"transform": `translate(0, ${event.target.scrollTop}px)`,' +
				'"z-index": "1",' + // See Note #1 below
				'"position": "relative"' +
				'});' +
				'})' +
				// Make floating action bar in edit mode sticky.
				'.bind("scroll", (event) => {' +
				'$(".machineButtonRow > table")' +
				'.css("transform", `translate(${event.target.scrollLeft}px)`);' +
				'});' +
				'});' +
				'})(jQuery);' +
				'</script>';
		}

		function addIconButtonExport(form, arrButton, fieldId){
			if(arrButton.length == 0) return;
			var htmlField = form.addField({
				id: fieldId + onGenCodeRandom(),
				label: "html",
				type: "INLINEHTML",
			});
			htmlField.defaultValue = getScriptAddIcon(arrButton);
		}

		function addClassBtnSubmit(form, btnId) {
			var htmlField = form.addField({
				id: 'custpage_add_classlist_' + onGenCodeRandom(),
				label: "html",
				type: "INLINEHTML",
			});
			htmlField.defaultValue = `<script>
				const btnSubmit = document.getElementById("tr_${btnId}");
				btnSubmit.classList.add('pgBntB');

				let btnSecondId = 'tr_secondary' + '${btnId}';
				addClassSubmitBtn(btnSecondId);

				function addClassSubmitBtn(buttonId) {
					const btnSecond = document.getElementById(buttonId);
					if(!btnSecond) {
						setTimeout(() => addClassSubmitBtn(buttonId), 500);
					} else {
						btnSecond.classList.add('pgBntB');
					}
				}
			</script>`;
		}

		/*
		* @param {Form} form - Current form
		* @param {Object} mainBtn - element: id (string - default: custpage_btn_multi), label (string - default: List Button)
		* @param {Array Object} arrButton - Array of Object:
		* 		element of Object:
		* 			+ label (string),
		* 			+ description (string):
		* 			+ urlLink (string - link redirect): url redirect
		* 			+ type (string: pdf, xls, doc, link): show icon
		 */
		function onGenerateBtnHTML(form, mainBtn, arrButton){
			var mainBtnId = mainBtn.id||"custpage_btn_multi";
			var mainBtnLabel = mainBtn.label||"List Button";
			mainBtnLabel += "(Try it)";

			return;

			arrButton = arrButton.filter(function(e){
				return !!e.urlLink;
			})

			if(arrButton.length == 0) return;

			form.addButton({
				id: mainBtnId,
				label: mainBtnLabel
			});

			var htmlField = form.addField({
				id: "custpage_html",
				label: "html",
				type: "INLINEHTML",
			});

			var modalId = "modal"+mainBtnId;
			var gridId = "grid"+mainBtnId;
			var htmlLib = '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">\n' +
				'<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>\n' +
				'<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>\n' +
				'<script type="text/javascript" src="https://cdn3.devexpress.com/jslib/21.1.6/js/dx.all.js"></script>\n' +
				'<link rel="stylesheet" href="https://cdn3.devexpress.com/jslib/21.1.6/css/dx.light.css" />\n'
			var htmlModal = getModalHTML(modalId,gridId);
			var htmlScript = getScriptHTML(mainBtnId, modalId, gridId, arrButton);
			htmlField.defaultValue = htmlLib + htmlModal + htmlScript;
		}

		function getScriptHTML(mainBtnId, modalId, gridId, arrButton){
			return '<style>.uir-page-title-firstline .uir-record-type{margin: 0px !important}</style>' +
				'<script>\n' +//$(".uir-record-type").css("margin", 0);
				'var mainBtnId = "' + mainBtnId +'";' +
				'var modalId = "' + modalId +'";' +
				'var gridId = "' + gridId +'";' +
				'var arrTempDate = '+JSON.stringify(arrButton)+';' +
				'$(function(){\n' +
				'	init();\n' +
				'});\n' +
				'function init(){\n' +
				'	$(\'#\' + mainBtnId).attr(\'data-toggle\', \'modal\');\n' +
				'	$(\'#\' + mainBtnId).attr(\'data-target\', \'#\'+modalId);\n' +
				'	$(\'#\' + gridId).dxDataGrid({\n' +
				'		columns: [\n' +
				'			{dataField: "label", caption: "Name"},\n' +
				'			{dataField: "description", caption: "Description"},\n' +
				'			{\n' +
				'				type: "buttons",\n' +
				'		buttons: [' +
				'			{' +
				'				icon: "pdffile", hint: "Export PDF",\n' +
				'				visible(e) {\n' +
				'					return e.row.data.type == "pdf" ? true : false;\n' +
				'				},\n' +
				'				disabled(e) {\n' +
				'					return false;\n' +
				'				},\n' +
				'				onClick(e){\n' +
				'					window.open(e.row.data.urlLink);\n' +
				'				}\n' +
				'			},{' +
				'				icon: "xlsfile", hint: "Export Excel",\n' +
				'				visible(e) {\n' +
				'					return e.row.data.type == "xls" ? true : false;\n' +
				'				},\n' +
				'				disabled(e) {\n' +
				'					return false;\n' +
				'				},\n' +
				'				onClick(e){\n' +
				'					window.open(e.row.data.urlLink);\n' +
				'				}\n' +
				'			},{' +
				'				icon: "docfile", hint: "Export Word",\n' +
				'				visible(e) {\n' +
				'					return e.row.data.type == "doc" ? true : false;\n' +
				'				},\n' +
				'				disabled(e) {\n' +
				'					return false;\n' +
				'				},\n' +
				'				onClick(e){\n' +
				'					window.open(e.row.data.urlLink);\n' +
				'				}\n' +
				'			},{' +
				'				icon: "link", hint: "Process/link form", \n' +
				'				visible(e) {\n' +
				'					return e.row.data.type == "link" ? true : false;\n' +
				'				},\n' +
				'				disabled(e) {\n' +
				'					return false;\n' +
				'				},\n' +
				'				onClick(e){\n' +
				'					window.open(e.row.data.urlLink);\n' +
				'				}\n' +
				'			}]},\n' +
				'		],\n' +
				'		dataSource: arrTempDate,\n' +
				'		showColumnLines: false,\n' +
				'		showRowLines: true,\n' +
				'		showBorders: true,\n' +
				'		loadPanel: {enabled: true},\n' +
				'		searchPanel: {visible: true},\n' +
				'		selection: {mode: "single"},\t\n' +
				'		onRowDblClick(e){'+
				'			window.open(e.data.urlLink);\n'+
				'			e.component.close();\n'+
				'		},\n'+
				'	});\n' +
				'}\n' +
				'</script>';
		}

		function getModalHTML(modalId, gridId){
			return '' +
				'<div class="modal" id="'+modalId+'" role="dialog">\n' +
				'  <div class="modal-dialog">\n' +
				'    <div class="modal-content">\n' +
				'      <div class="modal-header">\n' +
				'        <button type="button" class="close" data-dismiss="modal">&times;</button>\n' +
				'        <h4 class="modal-title">List</h4>\n' +
				'      </div>\n' +
				'      <div class="modal-body" id="'+gridId+'"></div>\n' +
				'        <div class="modal-footer">\n' +
				'          <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\n' +
				'        </div>\n' +
				'      </div>\n' +
				'    </div>\n' +
				'</div>';
		}

		function onShowLoading(value){
			if(value==true){
				jQuery('#pageContainer').append('<div id="loadingIndicator" style="position: fixed; top: 0; left: 0; height: 100%; width: 100%; z-index: 9999; background-color:rgba(255, 255, 255, 0.85);"><img class="global-loading-indicator" src="/core/media/media.nl?id=27415&c=8339649&h=KzUo0OMWxpucSIGWwbgACiQ2eDMOX0xWqpqqA0rRWlsSjOTi&fcts=20230801194910&whence=" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%)"></div>');
			}else{
				jQuery("#loadingIndicator").remove();
			}
		}

		function renderDxGrid(_form, _optionGrid, _arrData, _tabId){
			var opGrid = _optionGrid||{};
			opGrid.columns = opGrid.columns || [];
			opGrid.summaryTotalItems = opGrid.summaryTotalItems || [];
			opGrid.summaryGroupItems = opGrid.summaryGroupItems || [];

			let localeId = constFormat.getLocaleByFormat();

			var htmlFile ="<script>" +
				"var opGrid = " + JSON.stringify(opGrid) + ";" +
				"var arrData = " + JSON.stringify(_arrData) + ";" +
				"var localeId ='" + localeId + "';" +
				"</script>";
			htmlFile += file.load({id: '../html/tmpl/scv_html_tmpl_grd00001.html'}).getContents();

			var fieldGroup_id = "fieldgrp_" + onGenCodeRandom();
			_form.addFieldGroup({id: fieldGroup_id, label: "Result"});
			var custpage_dxgrid = _form.addField({
				id: 'custpage_dxgrid',
				type: "inlinehtml",
				label: 'DxGrid',
				container: !!_tabId ? _tabId : fieldGroup_id
			});
			custpage_dxgrid.defaultValue = htmlFile;
		}

		function renderDxGridWithTab(_form, _arrtab, _arrData){
			var arrTab = _arrtab||{};
			for(var i = 0; i < arrTab.length; i++){
				arrTab[i].optionGrid.columns = arrTab[i].optionGrid.columns || [];
				arrTab[i].optionGrid.summaryTotalItems = arrTab[i].optionGrid.summaryTotalItems || [];
				arrTab[i].optionGrid.summaryGroupItems = arrTab[i].optionGrid.summaryGroupItems || [];
			}

			var htmlFile ="<script>" +
				"var arrTab = " + JSON.stringify(arrTab) + ";" +
				"</script>";
			htmlFile += file.load({id: '../html/tmpl/scv_html_tmpl_grd00002.html'}).getContents();

			var fieldGroup_id = "fieldgrp_" + onGenCodeRandom();
			_form.addFieldGroup({id: fieldGroup_id, label: "Result"});
			var custpage_dxgrid = _form.addField({
				id: 'custpage_dxgrid',
				type: "inlinehtml",
				label: 'DxGrid',
				container: fieldGroup_id
			});
			custpage_dxgrid.defaultValue = htmlFile;
		}

		function renderDxGridTreeList(_form, _optionGrid, _arrData){
			var opGrid = _optionGrid||{};
			opGrid.columns = opGrid.columns || [];
			opGrid.expandedRowKeys = opGrid.expandedRowKeys || [];
			opGrid.summaryTotalItems = opGrid.summaryTotalItems || [];
			opGrid.summaryGroupItems = opGrid.summaryGroupItems || [];
			
			let localeId = constFormat.getLocaleByFormat();

			var htmlFile ="<script>" +
				"var opGrid = " + JSON.stringify(opGrid) + ";" +
				"var arrData = " + JSON.stringify(_arrData) + ";" +
				"var localeId ='" + localeId + "';" +
				"</script>";
			htmlFile += file.load({id: '../html/tmpl/scv_html_tmpl_grd00003.html'}).getContents();

			var fieldGroup_id = "fieldgrp_" + onGenCodeRandom();
			_form.addFieldGroup({id: fieldGroup_id, label: "Result"});
			var custpage_dxgrid = _form.addField({
				id: 'custpage_dxgrid',
				type: "inlinehtml",
				label: 'DxGrid',
				container: fieldGroup_id
			});
			custpage_dxgrid.defaultValue = htmlFile;
		}

		function getScriptAddIcon(arrButton){
			// id, export_type
			let jsonData = JSON.stringify(arrButton);
			let render = '<script>\n';
			render += `
				const sprite_image_prt = '/images/sprite-list.png';
				const scvListButton_prt = JSON.parse('${jsonData}');

				scvListButton_prt.forEach(({ id, export_type }) => {
					const buttonElement = document.getElementById(id);
					if (buttonElement) {
					   customAddIconBtn(buttonElement, export_type);
					   processItemIcon(id, export_type);
					}
				});

				function customAddIconBtn(buttonElement, iconType) {
					const buttonValue = buttonElement.value;
					setButtonStyle(buttonElement);
					setIconStyle(buttonElement, iconType);
					buttonElement.value = buttonValue;
				}
				function setButtonStyle(buttonElement) {
					buttonElement.style.setProperty('padding-left', '23px', 'important');
					buttonElement.style.setProperty('background', 'url('+ sprite_image_prt +')', 'important');
					buttonElement.style.setProperty('background-repeat', 'no-repeat', 'important');
					buttonElement.style.setProperty('background-position-x', '-48px', 'important');
					buttonElement.style.setProperty('background-position-y', '-596px', 'important');
				}
				function setIconStyle(buttonElement, iconType) {
					switch (iconType) {
					  case 'PDF':
						buttonElement.style.setProperty('background-position-y', '-546px', 'important');
						break;
					  case 'EXCEL':
						buttonElement.style.setProperty('background-position-y', '-496px', 'important');
						break;
					  case 'WORD':
						buttonElement.style.setProperty('background-position-y', '-646px', 'important');
						break;
					  case 'SEARCH':
						buttonElement.style.setProperty('background-position-y', '-44px', 'important');
						buttonElement.style.setProperty('background-position-x', '-46px', 'important');
						break;
					}
				}
				function processItemIcon(buttonId, iconType) {
					const buttonElement = document.getElementById('secondary' + buttonId);
					if (!buttonElement) {
					  setTimeout(() => processItemIcon(buttonId, iconType), 500);
					} else {
					  customAddIconBtn(buttonElement, iconType);
					}
				}
			`;
			render += '</script>\n';
			return render;
		}

		function onGenCodeRandom(){
			return "" + Math.round(Math.random()*1000) + ("" +Date.now());
		}

		function renderDxGridTreeList_CreatePR(_form, _arrtab, _arrData){
			var arrTab = _arrtab||{};
			for(var i = 0; i < arrTab.length; i++){
				arrTab[i].optionGrid.columns = arrTab[i].optionGrid.columns || [];
				arrTab[i].optionGrid.expandedRowKeys = arrTab[i].optionGrid.expandedRowKeys || [];
				arrTab[i].optionGrid.summaryTotalItems = arrTab[i].optionGrid.summaryTotalItems || [];
				arrTab[i].optionGrid.summaryGroupItems = arrTab[i].optionGrid.summaryGroupItems || [];
			}

			var htmlFile ="<script>" +
				"var arrTab = " + JSON.stringify(arrTab) + ";" +
				"</script>";
			htmlFile += file.load({id: '../html/scv_html_crt_pr_v2.html'}).getContents();

			var fieldGroup_id = "fieldgrp_" + onGenCodeRandom();
			_form.addFieldGroup({id: fieldGroup_id, label: "Result"});
			var custpage_dxgrid = _form.addField({
				id: 'custpage_dxgrid',
				type: "inlinehtml",
				label: 'DxGrid',
				container: fieldGroup_id
			});
			custpage_dxgrid.defaultValue = htmlFile;
		}

		function addKeyboardScanBarcode(_form, _recid, _rectype) {
			var htmlField = _form.addField({
				id: "custpage_add_script",
				label: "html",
				type: "INLINEHTML",
			});
			var params = 'width=900,height=550,toolbar=0,menubar=0,location=0';
			var slurl = "/app/common/custom/custrecordentry.nl?rectype=111&recordtype=" + _rectype + "&recordid=" + _recid + "&btntype=scan_package&l=T";
			htmlField.defaultValue = '<script>' +
				'window.addEventListener("keydown", function (event) {if (event.shiftKey && event.keyCode == 13) {window.open("'+ slurl +'", "name", "'+ params +'");event.preventDefault();}});' +
				'</script>';
		}

		const includeLibaryExternalHtml = () =>{
            return `
                <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.5.0/font/bootstrap-icons.css">
                <link rel="stylesheet" href="https://cdn3.devexpress.com/jslib/21.1.6/css/dx.light.css" />
                <link rel="stylesheet" type="text/css" href="https://cdn3.devexpress.com/jslib/21.2.5/css/dx.common.css" />
                <script type="text/javascript" src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
                <script type="text/javascript" src="https://cdn3.devexpress.com/jslib/21.2.5/js/dx.all.js"></script>
                <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.2.1/exceljs.min.js"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
            `;
        }

        const includeTagStyleHtml = () =>{
            return `
            <style>
                .card {
                    min-height: 35rem;
                }
        
                .dx-header-row {
                    background-color: #E5E5E5 !important;
                    vertical-align: bottom;
                    color: #484848 !important;
                    font-size: 12px;
                    text-align: center!important;
                }
        
                td[role=columnheader] {
                    text-align: center!important
                }
        
				.dx-treelist-headers,
                .dx-datagrid-headers {
                    position: sticky;
                    top: 0px;
                    background-color: white;
                    z-index: 1000;
                }

				.dx-treelist-headers .dx-treelist-table .dx-row > td,
                .dx-datagrid-headers .dx-datagrid-table .dx-row > td{
                    border-bottom-width: 1px !important;
                    border-bottom-style: solid !important;
                    border-bottom-color: black !important;
        
                    border-left-width: 1px !important;
                    border-left-style: solid !important;
                    border-left-color: black !important;
        
                    border-right-width: 1px !important;
                    border-right-style: solid !important;
                    border-right-color: black !important;
        
                    border-top-width: 1px !important;
                    border-top-style: solid !important;
                    border-top-color: black !important;
        
                    border-width: 1px !important;
                    border-style: solid !important;
                    border-color: black !important;
                }
        
                .dx-data-row{
                    font-size: 13px
                }
            </style>
            `;
        }

		return {
			addIconButtonExport: addIconButtonExport,
			addClassBtnSubmit: addClassBtnSubmit,
			pinHeaderSublist: pinHeaderSublist,
			onGenerateBtnHTML: onGenerateBtnHTML,
			onShowLoading: onShowLoading,
			renderDxGrid: renderDxGrid,
			renderDxGridWithTab: renderDxGridWithTab,
			renderDxGridTreeList: renderDxGridTreeList,
			renderDxGridTreeList_CreatePR: renderDxGridTreeList_CreatePR,
			addKeyboardScanBarcode: addKeyboardScanBarcode,
			includeLibaryExternalHtml: includeLibaryExternalHtml,
			includeTagStyleHtml: includeTagStyleHtml
		};
	});
