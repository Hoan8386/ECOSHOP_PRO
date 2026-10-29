define(['N/search', 'N/ui/dialog', 'N/ui/message', '../cons/scv_cons_css.js', '../cons/scv_cons_color.js'],

function(search, dialog, message, constCSS, constColor) {
	
	function pushArr(arr, id) {
		if(isExists(arr, id) === false) {
			arr.push(id);
		}
	}
	
	function isExists(arr, id) {
		var isExists = false;
		for(var i in arr) {
			if(arr[i] === id) {
				isExists = true;
				break;
			}
		}
		return isExists;
	}
	
	function isContainValue(value) {
		var isContain = false;
		if(value !== undefined && value !== null && value !== '') {
			if(util.isArray(value)) {
				if(value.length > 0) {
					isContain = true;
				}
			} else {
				isContain = true;
			}
		}
		return isContain;
	}
	
	function insertSelection(list_fields, t, c, f, isaddnull, valuedefault) {
		if (list_fields != null) {
			var numPage = 0, r;
			var custpage_field = null;
			if(isContainValue(t)) {
				var s = search.create({
		    		type: t,
		    		filters: f,
		    		columns: c
		    	});
				r = s.runPaged({pageSize : 1000});
		    	numPage = r.pageRanges.length;
			}
	    	var temp, text, isSelected = false, searchPage, numTemp, tempData;
	    	
    		for(var i in list_fields) {
    			custpage_field = list_fields[i];
    			if(custpage_field != null) {
	    			custpage_field.removeSelectOption({value : null});
	    			if(isaddnull) {
		    			custpage_field.insertSelectOption({ value : '', text : '-----'});
		    		}
	    			if(numPage > 0) {
		    			for(var np = 0; np < numPage; np++) {
		        			searchPage = r.fetch({index : np });
		        			tempData = searchPage.data;
		            		if(isContainValue(tempData)) {
		            			numTemp = tempData.length;
					    		for(var j = 0; j < numTemp; j++) {
					    			temp = tempData[j].getValue(c[0]);
					    			text = tempData[j].getValue(c[1]);
					    			isSelected = valuedefault && (temp === valuedefault);
					    			custpage_field.insertSelectOption({value : temp, text : text, isSelected: isSelected});
					    		}
		            		}
		    			}	
	    			}	
    			}
    		}	    	
		}
    }
	
	function addSelecttionFrList(fRep, value, listReport, isaddnull) {
    	var lR = listReport.length;
    	var isSelected = false;
    	fRep.removeSelectOption({value : null});
    	if(isaddnull) {
    		fRep.insertSelectOption({value : '', text : '---', isSelected: false});
		}
    	for(var i = 0; i < lR; i++) {
			isSelected = value === listReport[i].value;
			fRep.insertSelectOption({value : listReport[i].value, text : listReport[i].label || listReport[i].text, isSelected: isSelected});
		}
    }

	function validateFieldMandatory(curRec, lstFields){
		var isValid = true;
		for(var i = 0; i < lstFields.length; i++){
			var infoField = curRec.getField(lstFields[i]);
			if(!infoField) continue;
			
			if(infoField.isMandatory === true){
				var valueField = curRec.getValue(lstFields[i]);
				if(infoField.type === "multiselect"){
					if(valueField.length > 0 && !isContainValue(valueField[0])){
						isValid = false;
						alert("Please enter value(s) for: " + infoField.label);
						break;
					}
				}
				if(!isContainValue(valueField)){
					isValid = false;
					alert("Please enter value(s) for: " + infoField.label);
					break;
				}
			}
		}

		return isValid;
	}

	const showLoadingDialog = (isShow) => {
		let progessElement = "";
		if(isShow) {
			let container = document.getElementById("pageContainer") || document.getElementById("outerwrapper");
			if(!container) return console.error("Not found ElementId");

			loadStyleToHtmlPage(container);
			let mainLoader = document.createElement('div');
			mainLoader.classList.add("scvMainLoader");
			mainLoader.innerHTML = '<span class="scvLoader"></span><span id="idxProgessStatus" class="scvProgessStatus">Processing...</span>';
			
			container.appendChild(mainLoader);
			progessElement = document.querySelector(".scvProgessStatus");
		} else {
			let mainLoader = document.querySelector(".scvMainLoader");
			if(mainLoader) mainLoader.remove();
		}
		return progessElement;
	}

	const loadStyleToHtmlPage = (container) => {
		let addLoading = container.getAttribute("scv-add-loading");
		if(addLoading === "T") return;
		container.setAttribute("scv-add-loading", "T");

		let linkElement = document.createElement('style');
		let textNode = document.createTextNode(constCSS.LOADING);
		linkElement.appendChild(textNode);
		document.head.appendChild(linkElement);
	}

	function updateProgessStatus(_msg){
		jQuery("#idxProgessStatus").html(_msg);
	}
	
	function onGroupCollapseExpand(_groupId, _isDefaultShow = true){
		return;
		
		let groupId = "fg_" + _groupId;
		let collapseId = groupId + "_collapse";
		let expandId = groupId + "_expand";
		jQuery("#" + groupId + " .fgroup_title").prepend("<img id='" + collapseId + "' src='/uirefresh/img/da-collapse.png' />")
		jQuery("#" + groupId + " .fgroup_title").prepend("<img id='" + expandId + "' src='/uirefresh/img/da-expand.png' hidden/>")

		jQuery("#" + groupId + " .fgroup_title" ).on( "click", function() {
			jQuery("#" + expandId)[0].hidden = !jQuery("#" + expandId)[0].hidden;
			jQuery("#" + collapseId)[0].hidden = !jQuery("#" + collapseId)[0].hidden;

			jQuery("#tr_" + groupId)[0].hidden = jQuery("#" + collapseId)[0].hidden;
			
		});

		if(!_isDefaultShow){
			jQuery("#" + groupId + " .fgroup_title" ).trigger("click")
		}
	}
	function isSelectLine(curRec, sublist, fieldId) {
        let lc = curRec.getLineCount(sublist);
        for(let i = 0; i < lc; i++){
            let chk = curRec.getSublistValue(sublist, fieldId, i);
            if(chk === true || chk === "T") return true;
        }
        return false;
	}
	function showMessage(title, msg) {
		dialog.alert({
			title: title || "Thông báo!",
			message: msg
		});
	}

	const showMsgError = (_msg, _duration = 10000) =>{
		return message.create({
			title: "Error",
			message: _msg || "Error",
			type: message.Type.ERROR
		}).show({duration: _duration});
	}

	function delay(ms) {
		return new Promise(function (resolve) {
			setTimeout(resolve, ms);
		});
	}

	const getObjParamsUrl = (_curRec) =>{
		let objParams = {};
		let arrKeyValue = _curRec.getValue("entryformquerystring").split("&");
		arrKeyValue.forEach(key_value => objParams[key_value.split("=")[0]] = key_value.split("=")[1]);

		return objParams;
	}

	const focusFieldId = (elementId) => {
		let element = document.getElementById(elementId);
		if(!!element) {
			element.focus();
		}
	}

	const generateLinkTagInHtml = (urlRec, tranId, title) => {
        let html = `<span style="font-weight: bold;">${title}: </span>`;
        html += `<span><a href="${urlRec}" target="_blank" style="color: ${constColor.BLUE[600]}">${tranId}</a>`;
        html += `</span>`;
        return html;
    }

	const generateTextErrorInHtml = (title) => {
        return `<span style="font-weight: bold;">Error: </span><span style="color: ${constColor.RED[700]}">${title}!</span>`;
    }

    return {
		pushArr: pushArr,
		isContainValue: isContainValue,
		insertSelection: insertSelection,
		addSelecttionFrList: addSelecttionFrList,
		showLoadingDialog: showLoadingDialog,
		updateProgessStatus: updateProgessStatus,
		validateFieldMandatory: validateFieldMandatory,
		onGroupCollapseExpand: onGroupCollapseExpand,
		isSelectLine: isSelectLine,
		showMessage: showMessage,
		showMsgError: showMsgError,
		delay: delay,
		getObjParamsUrl: getObjParamsUrl,
		focusFieldId: focusFieldId,
		generateLinkTagInHtml,
		generateTextErrorInHtml
    };
    
});
