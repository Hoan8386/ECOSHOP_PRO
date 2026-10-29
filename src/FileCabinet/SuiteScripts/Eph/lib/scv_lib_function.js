 define(['N/search', 'N/url', 'N/query', 'N/https'],

(search, url, query, https) => {
	const setValue = (newRecord, readRecord, newFields, readFields) => {
    	let lFields = newFields.length;
    	for(let i = 0; i < lFields; i++) {
    		if(newRecord.getValue(newFields[i]) !== undefined) {
    			let value = readRecord.getValue(readFields[i]);
    			value = reValue(value);
    			newRecord.setValue(newFields[i], value);
    		}
    	}
    }
	
	const setValueData = (newRecord, newFields, data) => {
    	let lFields = newFields.length;
    	let value;
    	for(let i = 0; i < lFields; i++) {
    		if(newRecord.getValue(newFields[i]) !== undefined) {
    			value = data[i];
    			value = reValue(value);
    			newRecord.setValue(newFields[i], value);
    		}
    	}
    }
	
	const setSublistValue = (newRecord, readRecord, newSublist, readSublist, newSublistFields, readSublistFields, line) => {
    	let lFields = newSublistFields.length;
    	let value;
    	for(let i = 0; i < lFields; i++) {
    		value = newRecord.getSublistValue({sublistId: newSublist, fieldId: newSublistFields[i], line: line});
    		if(value !== undefined) {
	    		value = readRecord.getSublistValue({sublistId: readSublist, fieldId: readSublistFields[i], line: line})
	    		value = reValue(value);
	    		newRecord.setSublistValue({sublistId: newSublist, fieldId: newSublistFields[i], line: line, value: value});
    		}
    	}
    }
	
	const setSublistValueDiff = (newRecord, readRecord, newSublist, readSublist, newSublistFields, readSublistFields, line, lineRead) => {
    	let lFields = newSublistFields.length;
    	let value;
    	for(let i = 0; i < lFields; i++) {
    		value = newRecord.getSublistValue({sublistId: newSublist, fieldId: newSublistFields[i], line: line});
    		if(value !== undefined) {
	    		value = readRecord.getSublistValue({sublistId: readSublist, fieldId: readSublistFields[i], line: lineRead})
	    		value = reValue(value);
	    		newRecord.setSublistValue({sublistId: newSublist, fieldId: newSublistFields[i], line: line, value: value});
    		}
    	}
    }
	
	const setSublistValueData = (newRecord, newSublist, newSublistFields, line, data) => {
    	let lFields = newSublistFields.length;
    	let value;
    	for(let i = 0; i < lFields; i++) {
    		value = newRecord.getSublistValue({sublistId: newSublist, fieldId: newSublistFields[i], line: line});
    		if(value !== undefined) {
    			value = data[i];
    			value = reValue(value);
	    		newRecord.setSublistValue({sublistId: newSublist, fieldId: newSublistFields[i], line: line, value: value});
    		}
    	}
    }
	
	const setSublistTextData = (newRecord, newSublist, newSublistFields, line, data) => {
    	let lFields = newSublistFields.length;
    	let value;
    	for(let i = 0; i < lFields; i++) {
    		value = newRecord.getSublistValue({sublistId: newSublist, fieldId: newSublistFields[i], line: line});
    		if(value !== undefined) {
    			value = data[i];
    			value = reValue(value);
	    		newRecord.setSublistText({sublistId: newSublist, fieldId: newSublistFields[i], line: line, text: value});
    		}
    	}
    }
	
	const setCurrentSublistValue = (newRecord, readRecord, newSublist, readSublist, newSublistFields, readSublistFields, line) => {
    	let lFields = newSublistFields.length;
    	let value;
    	for(let i = 0; i < lFields; i++) {
    		value = newRecord.getCurrentSublistValue({sublistId: newSublist, fieldId: newSublistFields[i]});
    		if(value !== undefined) {
	    		value = readRecord.getSublistValue({sublistId: readSublist, fieldId: readSublistFields[i], line: line})
	    		value = reValue(value);
	    		newRecord.setCurrentSublistValue({sublistId: newSublist, fieldId: newSublistFields[i], value: value});
    		}
    	}
    }
	
	const setCurrentSublistValueData = (newRecord, newSublist, newSublistFields, data) => {
    	let lFields = newSublistFields.length;
    	let value;
    	for(let i = 0; i < lFields; i++) {
    		value = newRecord.getCurrentSublistValue({sublistId: newSublist, fieldId: newSublistFields[i]});
    		if(value !== undefined) {
    			value = data[i];
    			value = reValue(value);
    			newRecord.setCurrentSublistValue({sublistId: newSublist, fieldId: newSublistFields[i], value: reValue(value)});
    		}
    	}
    }
	
	const getObjFromArr = (arr, id) => {
		let lArr = arr.length;
		let obj = {};
		for(let ai = 0; ai < lArr; ai++) {
			if(arr[ai].id === id) {
				obj = arr[ai];
				break;
			}
		}
		return obj;
	}
	
	const getTranRecordType = (idRelated) => {
    	let recordType = null;
    	if(isContainValue(idRelated)) {
	    	let lkF = search.lookupFields({
	            type: search.Type.TRANSACTION, id: idRelated, columns: ['type', 'recordtype']
	        });
	    	recordType = lkF.recordtype;
    	}
		return recordType;
    }
	
	const getItemRecordType = (id) => {
    	let recordType = null;
    	if(isContainValue(id)) {
	    	let lkF = search.lookupFields({
	            type: search.Type.ITEM, id: id, columns: ['type', 'recordtype']
	        });
	    	recordType = lkF.recordtype;
    	}
		return recordType;
    }
	
	const getEntityType = (entity) => {
	     let lkE = search.lookupFields({type: 'entity', id: entity, columns: ['recordtype']});
	     return lkE.recordtype;
	 }
	
	const lookFields = (sType, id, columns) => {
		let lkF;
		if(isContainValue(id)) {
			lkF = search.lookupFields({type: sType, id: id, columns: columns});
		} else {
			lkF = {};
		}
		return lkF;
	}
	
	const makePrefix = (inStr, lOutStr, cAdd) => {
		let endS = inStr.toString();
		let lInStr = endS.length;
		for(let i = lInStr; i < lOutStr; i++) {
			endS = cAdd + '' + endS;
        }
        return endS;
    }
	
	const getTextOption = (options, value) => {
    	let text = '';
    	let lOp = options.length;
    	for(let i = 0; i < lOp; i++) {
    		if(options[i].value === value) {
    			text = options[i].text;
    			break;
    		}
    	}
    	return text;
    }
	
	const getFirstOption = (options) => {
		let fValue = '';
		let temp;
		if(isContainValue(options)) {
			let lOp = options.length;
			for(let i = 0; i < lOp; i++) {
				temp = options[i].value
				if(isContainValue(temp) && temp !== -1) {
					fValue = temp;
					break;
				}

			}
		}
		return fValue;
	}
	
	const isContainValue = (value) => {
		let isContain = false;
		if(value !== undefined && value != null && value !== '') {
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
	
	const reValue = (value) => {
		let r = value;
		if(r === undefined || r === null) {
			r = '';
		}
		return r;
	}
	
	const createSearch = (arr, type, columns, filters) => {
    	let s = search.create({type: type, columns: columns});
    	if(isContainValue(filters)) {
    		s.filters = filters;
    	}
    	return s;
    }
	
	const pushArrSearch = (arr, s, type, pageSize, columns) => {
    	let r = s.runPaged({pageSize: pageSize});
		let numPage = r.pageRanges.length;
		let searchPage;
		let tempData;
		let numTemp;
		let lCol = columns.length;
		let arrTemp;
		for(let np = 0; np < numPage; np++) {
			searchPage = r.fetch({index : np });
    		tempData = searchPage.data;
    		if(tempData) {
    			numTemp = tempData.length;
    			for(let i = 0; i < numTemp; i++) {
    				arrTemp = [];
    				for(let j = 0; j < lCol; j++) {
    					arrTemp.push(tempData[i].getValue(columns[j]));
    				}
    				arr.push(arrTemp);
	        	}
    		}
		}
    }
	
	const setDisableFields = (form, fields) => {
		let lF = fields.length;
		let field;
		for(let i = 0; i < lF; i++) {
			field = form.getField(fields[i]);
			if(isContainValue(field)) {
				field.updateDisplayType({displayType : 'DISABLED'});
			}
		}
	}
	
	const setDisableSublistField = (form, sl, fields) => {
		let lF = fields.length;
		let sublist = form.getSublist({id : sl});
		let field;
		for(let i = 0; i < lF; i++) {
			field = sublist.getField({id : fields[i]});
			if(isContainValue(field)) {
				field.updateDisplayType({displayType : 'DISABLED'});
			}
		}
    }
	
	const addButtonBack = (form, id, type) => {
        let viewUrl = url.resolveRecord({
        	recordType: type,
        	recordId: id,
        	isEditMode: false
        });
        form.addButton({id: 'custpage_bt_back', label: 'Back', functionName: "window.location.replace('" + viewUrl + "');"});
    }
	
	const isExists = (arr, id) => {
		let isExists = false;
		let lArr = arr.length;
		for(let i = 0; i < lArr; i++) {
			if(arr[i] === id) {
				isExists = true;
				break;
			}
		}
		return isExists;
	}
	
	const isExistsObj = (arr, id) => {
		let isExists = false;
		let lArr = arr.length;
		for(let i = 0; i < lArr; i++) {
			if(arr[i].id === id) {
				isExists = true;
				break;
			}
		}
		return isExists;
	}
	
	const pushArr = (arr, id) => {
		if(isExists(arr, id) === false) {
			arr.push(id);
		}
	}
	
	const makeStringWithComma = (value, comma, plus) => {
    	let cL = '';
    	if(isContainValue(value)) {
	    	let spS = value.split(comma);
	    	let lC = spS.length;
	    	for(let i = 0; i < lC; i++) {
				if(i >  0) {
					cL = cL + plus + spS[i];
				} else {
					cL = spS[i];
				}
			}
    	}
    	return cL;
    }
	
	const setValueDataS1 = (newRecord, newFields, data) => {
    	let lFields = newFields.length;
    	for(let i = 0; i < lFields; i++) {
    		if(newRecord.getFieldValue(newFields[i]) !== undefined) {
    			newRecord.setFieldValue(newFields[i], reValue(data[i]));
    		}
    	}
    }
	
	const setValueDataIfNull = (newRecord, newFields, data) => {
    	let lFields = newFields.length;
    	for(let i = 0; i < lFields; i++) {
    		if(isContainValue(newRecord.getValue(newFields[i])) === false) {
    			newRecord.setValue(newFields[i], reValue(data[i]));
    		}
    	}
    }
	
	const setRecordValues = (record, dataDict) => {
		Object.keys(dataDict).forEach(function(key) {
			record.setValue(key, dataDict[key]);
		});
	}
	
	const reText = (text) => {
    	let cus_name = text
    	if(isContainValue(text)) {
	        cus_name = cus_name.replace(/&/gi, '&amp;');
	        cus_name = cus_name.replace(/>/gi, "&gt;");
			cus_name = cus_name.replace(/</gi, "&lt;");
	        cus_name = cus_name.replace(/'/g, "&apos;");
			cus_name = cus_name.replace(/"/g, "&quot;");
			cus_name = cus_name.replace(//g, "");
    	}
		return cus_name;
    }
	
	const convertDateStringExcel = (dInput) => {
		let dOutput = '';
		if(isContainValue(dInput)) {
			dOutput = dInput.getFullYear() + '-' + makePrefix(dInput.getMonth() + 1, 2, '0') + '-' + makePrefix(dInput.getDate(), 2, '0');
		}
		return dOutput;
	}
	
	const goToPreviewPrint = (internalId, type, templateid, reasion) => {
		let createPdfUrl = url.resolveScript({
	        scriptId: 'customscript_scv_sl_draft_einvoice',
	        deploymentId: 'customdeploy_scv_sl_draft_einvoice',
	        returnExternalUrl: false
    	});
		createPdfUrl += '&id=' + internalId + '&type=' + type + '&templateid=' + templateid + '&reasion=' + reasion;
		window.open(createPdfUrl);
	}
	
	const getDateNow = () => {
    	let now = new Date();
    	let sdate = now.toString();
    	let p1 = sdate.substring(28,29);
    	let p2 = sdate.substring(29,31);
    	let tcurr = 0;
    	if(p1 === '-') {
    		tcurr = tcurr + 1 * p2;
    	} else {
    		tcurr = tcurr - 1 * p2;
    	}
		return new Date(now.getTime() + (tcurr * 3600000));
    }
	
	const setSublistValueDataDiff = (newRecord, newSublist, newSublistFields, line, data) => {
    	let lFields = newSublistFields.length;
    	let value;
    	for(let i = 0; i < lFields; i++) {
    		value = newRecord.getSublistValue({sublistId: newSublist, fieldId: newSublistFields[i], line: line});
    		if(value !== undefined) {
    			value = data[i];
    			value = reValue(value);
	    		newRecord.setSublistValue({sublistId: newSublist, fieldId: newSublistFields[i], line: line, value: value});
    		}
    	}
    }
	
	const isObject = (obj) => {
	  let type = typeof obj;
	  return type === 'function' || type === 'object' && !!obj;
	}
	
	const iterationCopy = (src) => {
		let target = {};
		for (let prop in src) {
			if (src.hasOwnProperty(prop)) {
				if (isObject(src[prop])) {
					target[prop] = iterationCopy(src[prop]);
				} else {
					target[prop] = src[prop];
				}
			}
		}
		return target;
	}
	
	const getDateGMT = (time, gmt) => {
		let now = new Date(time);
    	let sdate = now.toString();
    	let p1 = sdate.substring(28,29);
    	let p2 = sdate.substring(29,31);
    	let tcurr = gmt;
    	if(p1 === '-') {
    		tcurr = tcurr + 1 * p2;
    	} else {
    		tcurr = tcurr - 1 * p2;
    	}
		return new Date(now.getTime() + (tcurr * 3600000));
	}
	
	const getDateGMTWithDate = (date, gmt) => {
		let sdate = date.toString();
    	let p1 = sdate.substring(28,29);
    	let p2 = sdate.substring(29,31);
    	let tcurr = gmt;
    	if(p1 === '-') {
    		tcurr = tcurr + 1 * p2;
    	} else {
    		tcurr = tcurr - 1 * p2;
    	}
		return new Date(date.getTime() + (tcurr * 3600000));
	}
	
	const getTimeFromDate = (date, gmt) => {
		let sdate = date.toString();
    	let p1 = sdate.substring(28,29);
    	let p2 = sdate.substring(29,31);
    	let tcurr = gmt;
    	if(p1 === '-') {
    		tcurr = tcurr + 1 * p2;
    	} else {
    		tcurr = tcurr - 1 * p2;
    	}
		return date.getTime() - tcurr * 3600000;
	}
	
	const getTimeFromDateAndTime = (date, hourminutes, gmt) => {
		let sdate = date.toString();
    	let p1 = sdate.substring(28,29);
    	let p2 = sdate.substring(29,31);
    	let tcurr = gmt;
    	if(p1 === '-') {
    		tcurr = tcurr + 1 * p2;
    	} else {
    		tcurr = tcurr - 1 * p2;
    	}
    	let time = date.getTime() - tcurr * 3600000;
    	if(isContainValue(hourminutes)) {
    		time = time + (hourminutes.getHours() * 60 + hourminutes.getMinutes()) * 60000;
    	}
    	return time;
	}
	
	const newDate = (tempdate) => {
		tempdate = tempdate.split('-');
		if(tempdate.length === 3) {
			tempdate = new Date(tempdate[0], (tempdate[1] * 1 - 1), tempdate[2]);
		} else {
			tempdate = '';
		}
		return tempdate;
	}
	
	const newTime = (tempdate) => {
		let hm = tempdate.split(':');
		if(hm.length === 2) {
			tempdate = new Date();
			tempdate.setHours(hm[0]);
			tempdate.setMinutes(hm[1]);
		} else {
			tempdate = '';
		}
		return tempdate;
	}
	
	const sortArayOfObject = (arrayOfObjects, field) => {
    	arrayOfObjects.sort(function(a,b) {
    	    let x = a[field];
    	    let y = b[field];
    	    if(isContainValue(x)) {
    	    	x = x.toLowerCase();
    	    }
    	    if(isContainValue(y)) {
    	    	y = y.toLowerCase();
    	    }
    	    return !y && !!x ? -1 : x < y ? -1 : x > y ? 1 : 0;
    	});
    }
	
	const sortArayOfObjectFlowFields = (arrayOfObjects, fields) => {
    	arrayOfObjects.sort(function(a,b) {
    		let x;
    	    let y;
    		let lF = fields.length;
    		let vl = 0;
    		for(let i = 0; i < lF; i++) {
    			if(vl === 0) {
	    			x = a[fields[i]].toLowerCase();
	        	    y = b[fields[i]].toLowerCase();
	        	    if(x < y) {
	        	    	vl = -1;
	        	    } else if(x > y) {
	        	    	vl = 1;
	        	    }
    			}
    		}
    	    return vl;
    	});
    }
	
	const countWeekendDays = (d0, d1) => {
		  let ndays = 1 + Math.round((d1.getTime() - d0.getTime()) / (24*3600*1000));
		  let nsaturdays = Math.floor((d0.getDay()+ndays) / 7 );
		  return 2 * nsaturdays + (d0.getDay() === 0) - (d1.getDay() === 6);
		}
	
	const getDuedatePlusWendkend = (invoice_date, daysuntilnetdue) => {
    	if(daysuntilnetdue > 0) {
    		let countW = Math.floor(daysuntilnetdue/5);
			let dayMod = (daysuntilnetdue % 5);
			invoice_date.setDate(invoice_date.getDate() + 7 * countW);
			daysuntilnetdue = dayMod ;
	    	let daydate = invoice_date.getDate();
	    	let orgdate = new Date(invoice_date);
	    	invoice_date.setDate(daydate + daysuntilnetdue);
			let countWD = countWeekendDays(orgdate, invoice_date);
			if(countWD > 0) {
				let day = invoice_date.getDay();
				daydate = invoice_date.getDate();
				if(day === 0) {
					invoice_date.setDate(daydate + 1);
					countWD = countWD - 1;
				} else if(day === 6){
					invoice_date.setDate(daydate + 2);
					countWD = countWD - 2;
				}
				if(countWD > 0) {
					invoice_date = getDuedatePlusWendkend(invoice_date, countWD);
				}
			}
    	}
		return invoice_date;
    }
	
	const pushFilter = (f, field, operator, value) => {
		if(isContainValue(value)) {
			f.push('and');
			f.push([field, field, value]);
		}
	}
	
	const pushFilterNone = (f, field, operator, value) => {
		if(!value) {
			value = '@NONE@';
		}
		f.push('and');
		f.push([field, field, value]);
	}
	
	const iter = (rec, listName, cb) =>{
	    let lim = rec.getLineCount({sublistId:listName});
	    let i = 0;
	    let getV = function (fld){
	        return rec.getSublistValue({sublistId:listName, fieldId:fld, line:i});
	    };
	    let setV = function(fld, val) {
	    	let isDynamic = rec.isDynamic;
	    	if (isDynamic) {
	    		rec.selectLine({sublistId: listName, line: i});
	    		rec.setCurrentSublistValue({sublistId: listName, fieldId: fld, value: val});
	    		rec.commitLine({sublistId: listName});
	    	} else {
	    		rec.setSublistValue({sublistId:listName, fieldId:fld, line:i, value:val});
	    	}

	    };
	    for(; i< lim; i++){
	        cb(i, getV, setV);
	    }
	}
	
	const onShowLoading = (value) =>{
		if(value === true){
			jQuery('#pageContainer').append('<div id="loadingIndicator" style="position: fixed; top: 0; left: 0; height: 100%; width: 100%; z-index: 9999; background-color:rgba(255, 255, 255, 0.85);"><img class="global-loading-indicator" src="/core/media/media.nl?id=39680&c=5794421&h=HPUCR7tfpmBBT0wnL3JnfYcVZN1uzd4dVwhk6Ro7WIUuZKiW&fcts=20201130184234&whence=" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%)"></div>');
		} else{
			jQuery("#loadingIndicator").remove();
		}
	}
	
	const isNumber = (value) => {
		return /^-?[\d.]+(?:e-?\d+)?$/.test(value);
	}
	
	const getObjFromArrField = (arr, field, value) => {
		let lArr = arr.length;
		let obj = {}, isGet;
		let lField = field.length;
		for(let ai = 0; ai < lArr; ai++) {
			isGet = true;
			for(let aj = 0; aj < lField; aj++) {
				if(arr[ai][field[aj]] !== value[aj]) {
					isGet = false;
					break;
				}
			}
			if(isGet) {
				obj = arr[ai];
				break;
			}
		}
		return obj;
	}
	
	const findListFromArrField = (arr, field, value) => {
		let lArr = arr.length;
		let listObj = [], isGet;
		let lField = field.length;
		for(let ai = 0; ai < lArr; ai++) {
			isGet = true;
			for(let aj = 0; aj < lField; aj++) {
				if(arr[ai][field[aj]] !== value[aj]) {
					isGet = false;
				}
			}
			if(isGet) {
				listObj.push(arr[ai]);
			}
		}
		return listObj;
	}
	
	
	const onGroupByArray = (_arrObj, _grp) =>{
		let arrRS = [];
		for(let i = 0; i < _arrObj.length; i++){
			let obj = {};
			for(let j = 0; j < _grp.length; j++){
				obj[_grp[j]] = _arrObj[i][_grp[j]];
			}
			if(!isDuplicate(arrRS,obj)){
				arrRS.push(obj);
			}
		}
		return arrRS;
	}
	
	const isDuplicate = (_arrObj, _obj) => {
		if(_arrObj.length === 0) return false;
		let cntElementSame = 0;
		let propName = Object.keys(_obj);
		for (let i = 0; i < _arrObj.length; i++) {
			cntElementSame=0;
			for (let j = 0; j < propName.length; j++) {
				if (_arrObj[i][propName[j]] === _obj[propName[j]]) {
					cntElementSame++;
				}
			}
			if(cntElementSame === propName.length){
				break;
			}
		}
		return (cntElementSame === propName.length);
	}
	
	const newDateTime = (date_time) => {
		date_time = date_time.split(' ');
		let spl = '-';
		let tempdate = date_time[0];
		let times = date_time[1];
		tempdate = tempdate.split(spl);
		if(tempdate.length < 3) {
			tempdate = tempdate.split('/');
		}
		if(tempdate.length === 3) {
			let hh = 0, mm = 0, ss = 0;
			if(isContainValue(times)) {
				times = times.split(':');
				if(times.length === 3) {
					hh = times[0]; mm = times[1]; ss = times[2];
				}
			}

			tempdate = new Date(tempdate[0], (tempdate[1] * 1 - 1), tempdate[2], hh, mm, ss);
		} else {
			tempdate = '';
		}
		return tempdate;
	}
	
	const getFirstListObj = (listObj, obj) => {
    	let res = null, isget = true;
    	for(let i in listObj) {
    		isget = true;
	    	for(let key in obj) {
	    		if(obj[key] !== listObj[i][key]) {
	    			isget = false;
	    		}
	    	}
	    	if(isget) {
	    		res = listObj[i];break;
	    	}
    	}
    	return res;
    }
	
	const multiple = (a, b) => {
		let x1 = a.toString().split('\.');
		let x2 = b.toString().split('\.');
		let y1 = x1[1], y2 = x2[1];
		let l1 = 1, l2 = 1;
		if(isContainValue(y1)) {
			l1 = Math.pow(10, y1.length);
		}
		if(isContainValue(y2)) {
			l2 = Math.pow(10, y2.length);
		}
		return (a * l1) * (b * l2) / (l1 * l2);
	}
	
	const isLeapYear = (year) => {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

	/*
	* @param {Form} scriptContext.form - Current form
	 */
	const pinHeaderSublist = (_form) => {
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
			'"z-index": 1,' + // See Note #1 below
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
	
	const convertObjArrayToArray = (_arrMain, _eleObj) => {
		let arrResult = [];
		let arrMain_grp = onGroupByArray(_arrMain, [_eleObj]);
		for(let i = 0; i < arrMain_grp.length; i++){
			let ele = arrMain_grp[i][_eleObj];
			if(isContainValue(ele)) {
				ele = isNaN(ele) ? ele : Number(ele);
				arrResult.push(ele);
			}
		}
		return arrResult;
	}
	
	const addFieldGroup = (_form, _id, _label) => {
		let _obj = {id: _id, label: _label}

		_form.addFieldGroup(_obj);

		return _obj;
	}
	
	const uuidv4 = () => {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}
	
	const calcTotalResult = (_objTotal, _objDetail, _arrKey) => {
		for(let i = 0; i < _arrKey.length; i++){
			let keyId = _arrKey[i];

			_objTotal[keyId] = (_objTotal[keyId]||0) + (_objDetail[keyId]||0);
		}

		return _objTotal;
	}
	
	const callQuery = (queryString, params) => {
		let paramsDf = params || [];
		let result = {response: null, error: null, isSuccess: false};
		let arrResults = [];
		try {
			let queryResults = query.runSuiteQLPaged({query: queryString, params : paramsDf,pageSize: 1000}).iterator();
			queryResults.each(function (page) {
				let objPage = page.value.data.iterator();
				objPage.each(function (row) {
					arrResults.push(row.value.asMap());
					return true;
				});
				return true;
			});
			if (arrResults.length > 0) {
				result.response = arrResults;
				result.isSuccess = true;
			} else {
				result.error = 'error calling query';
			}
		} catch (err) {
			result.error = err;
		}
		return result;
	}
	
	const addSavedSearchToForm = (form, arrDataSavedSearch, alias) => {
		let _alias = alias || { id: 'id', 'title': 'title' };
		const len = arrDataSavedSearch.length;
		for (let i = 0; i < len; i++) {
			const savedSearchId = arrDataSavedSearch[i][_alias.id];
			form.addPageLink({
				type: 'CROSSLINK',
				url: `/app/common/search/searchresults.nl?searchid=${savedSearchId}&whence=`,
				title: arrDataSavedSearch[i][_alias.title] || 'Source Data From SavedSearch :'.concat(savedSearchId)
			});
		}
	}
	
	const generateUniqueIdForHeader = (curRec, fieldStore) => {
		const uniqueId = curRec.getValue(fieldStore);
		if (!uniqueId) curRec.setValue(fieldStore, generateUniqueId());
	}
	
	const generateUniqueIdForMultiLines = (curRec, sublistId, fieldStore) => {
		const lc = curRec.getLineCount(sublistId);
		for (let i = 0; i < lc; i++) {
			const uniqueIdLine = curRec.getSublistValue({sublistId: sublistId, fieldId: fieldStore, line: i});
			if (!uniqueIdLine) {
				const uniqueId = generateUniqueId() + '_' + i;
				curRec.setSublistValue({sublistId: sublistId, fieldId: fieldStore, line: i, value: uniqueId});
			}
		}
	}
	
	const generateUniqueId = () => {
		const unixTimestamp = Date.now();
		const randomNumber = Math.floor(Math.random() * 100000).toString().padStart(5, '0'); // Generate a random number between 0 and 99999
		return unixTimestamp + "-" + randomNumber;
	}

	const groupArrayData = (arrayData, arrList, delimiter = "||") => {
		const _arrList = Array.isArray(arrList) ? arrList : [arrList];
		return arrayData.reduce((acc, curr) => {
			const key = _arrList.map(o => curr[o]).join(delimiter);
			if (!acc.hasOwnProperty(key)) {
				acc[key] = [];
			}
			acc[key].push(curr);
			return acc;
		}, {});
	};

	const requestInternalRestlet =  (flag, body, suffix = '') => {
		try {
			const ojHeader = {'Content-Type': 'application/json'};
			const objBody = {flag : flag, body : body};
			const objResponse = https.requestRestlet({
				scriptId: 'customscript_scv_rl_be_internal',
				deploymentId: 'customdeploy_scv_rl_be_internal' + suffix,
				headers: ojHeader,
				method: https.Method.POST,
				body: JSON.stringify(objBody),
			});
			return JSON.parse(objResponse.body);
		} catch (e) {
			return null;
			log.error('requestInternalRestlet :', JSON.stringify(e));
		}
	};
	
	const getPostingPeriod = (datetext) => {
		let searchPeriod = search.create({
			type: search.Type.ACCOUNTING_PERIOD,
			filters: [['isquarter', 'is', false], 'and', ['isyear', 'is', false], 'and', ['isadjust', 'is', false]
				, 'and', ['closed', 'is', false], 'and', ['startdate', 'onorbefore', datetext], 'and',
				['enddate', 'onorafter', datetext]],
			columns :['internalid', 'periodname', 'enddate']
		});
		
		let resultsPeriod = searchPeriod.run().getRange({start:0,end:1000});
		let period = '';
		if(resultsPeriod.length > 0) {
			period = resultsPeriod[0].getValue('internalid');
		}
		return period;
	}
	
    return {
    	setValue,
    	setValueData,
    	setSublistValue,
    	setSublistValueDiff,
    	setSublistValueData,
		setSublistTextData,
		setCurrentSublistValue,
		setCurrentSublistValueData,
		setSublistValueDataDiff,
		getObjFromArr,
		getTranRecordType,
		getItemRecordType,
		getEntityType,
		lookFields,
		makePrefix,
		getTextOption,
		getFirstOption,
		isContainValue,
		reValue,
		createSearch,
		pushArrSearch,
		setDisableFields,
		setDisableSublistField,
		addButtonBack,
		isExists,
		isExistsObj,
		pushArr,
		makeStringWithComma,
		setValueDataS1,
		setValueDataIfNull,
		reText,
		convertDateStringExcel,
		goToPreviewPrint,
		getDateNow,
		iterationCopy,
		getDateGMT,
		getDateGMTWithDate,
		getTimeFromDate,
		getTimeFromDateAndTime,
		sortArayOfObject,
		sortArayOfObjectFlowFields,
		countWeekendDays,
		getDuedatePlusWendkend,
		pushFilter,
		pushFilterNone,
		newDate,
		newTime,
		setRecordValues,
		iter,
		onShowLoading,
		isNumber,
		getObjFromArrField,
		findListFromArrField,
		onGroupByArray,
		isDuplicate,
		newDateTime,
		getFirstListObj,
		multiple,
		isLeapYear,
		pinHeaderSublist,
		convertObjArrayToArray,
		addFieldGroup,
		uuidv4,
		calcTotalResult,
		callQuery,
		addSavedSearchToForm,
		generateUniqueIdForMultiLines,
		generateUniqueIdForHeader,
		groupArrayData,
		requestInternalRestlet,
		getPostingPeriod
    };

});
