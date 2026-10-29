/**
 * Note:
 * =======================================================================================
 *  Date                Author                  Description
 * 	07 Jan 2025         Huy Pham                Move code from Adv, Chức năng Original Line ID, from ms.Thắm (https://app.clickup.com/t/86cxjygw0)
 */
define([],
function() {
	const SUBLIST_ITEM = {
		ID: "item",
		RECORD_TYPE: ["salesorder", "purchaseorder", "returnauthorization", "workorder"]
	}
	const SUBLIST_LINE = {
		ID: "line",
		RECORD_TYPE: ["journalentry"]
	}
	const SUBLIST_INVENTORY = {
		ID: "inventory",
		RECORD_TYPE: ["inventoryadjustment"]
	}

	const resetOriLineNumTrans = (scriptContext) => {
		let newRec = scriptContext.newRecord;
		let sublistId = SUBLIST_ITEM.ID;

		if(SUBLIST_LINE.RECORD_TYPE.includes(newRec.type)){
			sublistId = SUBLIST_LINE.ID;
		}
		else if(SUBLIST_INVENTORY.RECORD_TYPE.includes(newRec.type)){
			sublistId = SUBLIST_INVENTORY.ID;
		}

		resetOriLineNum(scriptContext, sublistId, "custcol_scv_origin_line_num")
	}

	const setOriLineNumTrans = (scriptContext) => {
		let newRec = scriptContext.newRecord;
		let sublistId = SUBLIST_ITEM.ID;

		if(SUBLIST_LINE.RECORD_TYPE.includes(newRec.type)){
			sublistId = SUBLIST_LINE.ID;
		}
		else if(SUBLIST_INVENTORY.RECORD_TYPE.includes(newRec.type)){
			sublistId = SUBLIST_INVENTORY.ID;
		}

		setOriLineNum(scriptContext, sublistId, "custcol_scv_origin_line_num")
	}

	const resetOriLineNum = (scriptContext, sublistId, fieldId) => {
		let triggerType = scriptContext.type;

		if(!["copy"].includes(triggerType)) return;

		let newRecord = scriptContext.newRecord;
		let lc = newRecord.getLineCount(sublistId);
		for(let i = 0; i < lc; i++){
			newRecord.setSublistValue({sublistId: sublistId, fieldId: fieldId, value: genCodeOriLineNum(i), line: i});
		}
	}

	const setOriLineNum = (scriptContext, sublistId, fieldId) => {
		let triggerType = scriptContext.type;
		let newRecord = scriptContext.newRecord;
		if(["xedit", "delete"].includes(triggerType)) return;

		let lc = newRecord.getLineCount(sublistId);
		for(let i = 0; i < lc; i++){
			let ori_line_num = newRecord.getSublistValue({sublistId: sublistId, fieldId: fieldId, line: i});
			if(!ori_line_num){
				newRecord.setSublistValue({sublistId: sublistId, fieldId: fieldId, value: genCodeOriLineNum(i), line: i});
			}
		}
	}

	const genCodeOriLineNum = (_seq = 0) => {
		return Math.round((new Date()).getTime()) + "_" + getRandomNumber() + (_seq||0);
	}

	const getRandomNumber = () => {
		let random = Math.floor(Math.random() * 9999) + 1;
		random = random.toString().padStart(4, '0');
		return random;
	}

	const hideColumnLineNo = (scriptContext) =>{
		if(scriptContext.type == "view") return;

		let newRec = scriptContext.newRecord;
		let sublistId = SUBLIST_ITEM.ID;

		if(SUBLIST_LINE.RECORD_TYPE.includes(newRec.type)){
			sublistId = SUBLIST_LINE.ID;
		}
		else if(SUBLIST_INVENTORY.RECORD_TYPE.includes(newRec.type)){
			sublistId = SUBLIST_INVENTORY.ID;
		}

		let form = scriptContext.form;

		let sublist = form.getSublist(sublistId);
		if(!sublist) return;

		let lineNoField = sublist.getField("custcol_scv_line_no");
		if(!lineNoField) return;

		lineNoField.updateDisplayType({displayType: "hidden"});

		form.addField({
			id : "custpage_scv_html_showrowno",
			type : "inlinehtml",
			label : "Show Row Number"
		}).defaultValue = `
		<script>
		debugger
			scvShowRowNumberSublist();

			function scvShowRowNumberSublist(){
				if(window.loadcomplete){
					Object.keys(window.machines).forEach(_machineId => {
						window.machines[_machineId].showRowNumbers = true;
						window.machines[_machineId].refresheditmachine();
					});
				}
				else{
					setTimeout(() => scvShowRowNumberSublist(), 200);
				}
			}
		</script>
		`;
	}

    return {
		resetOriLineNumTrans,
		setOriLineNumTrans,
		resetOriLineNum,
		setOriLineNum,
		genCodeOriLineNum,
		hideColumnLineNo
    };
    
});
