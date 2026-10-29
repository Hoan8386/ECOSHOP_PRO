/**
 * Nội dung: Advance PDF
 * KeyWord:
 * =======================================================================================
 *  Date                Author                  Description
 *  24 Nov 2023		    Huy Pham			    Init, move file from VLG
 */
define(['N/search','N/record', 'N/config', 'N/render', 'N/file', 'N/encode'],
function(search, record, config, render, file, encode) {

	const initTemplateRender = (_templateId) => {
		var tmplRender = render.create();

		if (isNaN(_templateId)) {
			tmplRender.setTemplateByScriptId(_templateId);
		} else {
			tmplRender.setTemplateById(_templateId);
		}

        tmplRender.addCustomDataSource({
			format: render.DataSource.OBJECT,
			alias: "libPdf",
			data: {
				font: {
					times: getUrlFile('../font/times/times_src.ttf'),
					times_bold: getUrlFile('../font/times/times_bold.ttf'),
					times_italic: getUrlFile('../font/times/times_italic.ttf'),
					times_bolditalic: getUrlFile('../font/times/times_italic_bold.ttf'),
				},
				css: getContentsFile('../css/scv_pdf_print.css'),
				rowcol100: getRowWithNumColumn(100),
				rowcol50: getRowWithNumColumn(50),
			}
		});

		return tmplRender;
	}
	const renderTemplateWithXml = (printfile) => {
		try {
			let xmlPdfPath = `../xml/print/${printfile}.xml`;
			let xmlString = getContentsFile(xmlPdfPath);

			let tmplRender = render.create();

			tmplRender.addCustomDataSource({
				format: render.DataSource.OBJECT,
				alias: "libPdf",
				data: {
					font: {
						times: getUrlFile('../font/times/times_src.ttf'),
						times_bold: getUrlFile('../font/times/times_bold.ttf'),
						times_italic: getUrlFile('../font/times/times_italic.ttf'),
						times_bolditalic: getUrlFile('../font/times/times_italic_bold.ttf'),
					},
					css: getContentsFile('../css/scv_pdf_print.css')
				}
			});
			tmplRender.templateContent = xmlString;

			return tmplRender;
		} catch (err) {
			throw err.message;
		}
	}
	const renderTemplateByContentXml = (_contentsXml) => {
		try {
			let tmplRender = render.create();

			tmplRender.addCustomDataSource({
				format: render.DataSource.OBJECT,
				alias: "libPdf",
				data: {
					font: {
						times: getUrlFile('../font/times/times_src.ttf'),
						times_bold: getUrlFile('../font/times/times_bold.ttf'),
						times_italic: getUrlFile('../font/times/times_italic.ttf'),
						times_bolditalic: getUrlFile('../font/times/times_italic_bold.ttf'),
					},
					css: getContentsFile('../css/scv_pdf_print.css')
				}
			});

			tmplRender.templateContent = _contentsXml;

			return tmplRender;
		} catch (err) {
			throw err.message;
		}
	}

	const createImage = (width) => {
		let companyInfo = config.load({type: config.Type.COMPANY_INFORMATION});
		let pagelogo = companyInfo.getValue("formlogo");
		let imgWidth = companyInfo.getValue("custrecord_scv_img_width") || 250;
		let imgHeight = companyInfo.getValue("custrecord_scv_img_height") || 74.31;

		let image = generateTagImageHtml(pagelogo, imgWidth, imgHeight, width);
		return image;
	}

	const createImageBySubsidiary = (_subsidiaryRec, _width) => {
		let logoId = _subsidiaryRec.getValue("logo");
		let imgWidth = _subsidiaryRec.getValue("custrecord_scv_img_width") || 100;
		let imgHeight = _subsidiaryRec.getValue("custrecord_scv_img_height") || 100;

		let tagImg = generateTagImageHtml(logoId, imgWidth, imgHeight, _width);
		return tagImg;
	}

	const generateTagImageHtml = (_logoId, _orgWidth, _orgHeight, _expectedWidth) =>{
		let srcLogo = getUrlFile(_logoId);
		let expectedHeight = _orgHeight;
		if(_expectedWidth) {
			let ratio = roundNumber(_expectedWidth / _orgWidth);
			_orgWidth = _expectedWidth;
			expectedHeight = roundNumber(_orgHeight * ratio);
		}

		let image = `<img src="${unReTextXML(srcLogo)}" alt="view" style="width: ${_expectedWidth}px; height: ${expectedHeight}px;" />`;
		return image;
	}

	const renderTableXML = (arrData, arrColumns, rowTotalCaption, cFontSize) => {
		let rowContent = getRowContentTable(arrData, arrColumns);
		let rowTotal = getRowTotalTable(arrData, arrColumns, rowTotalCaption);
		let xml = `<table class="border-table ${cFontSize}">`;
		xml += `<thead><tr>`;
		for(let column of arrColumns) {
			xml += `<td width="${column.width}"><p><b>${column.caption}</b></p></td>`;
		}
		xml += `</tr></thead>`;
		xml += `<tbody>`+ rowContent + rowTotal +`</tbody>`;
		xml += `</table>`;
		return xml;
	}

	const getRowTotalTable = (arrData, arrColumns, rowTotalCaption) => {
		let firstIndex = arrColumns.findIndex(e => e.isTotal === true);
		if(firstIndex == -1) return '';

		let colspan = firstIndex || 1;
		let rowTotal = `<tr>`;
		rowTotal += `<td class="align-center" colspan="${colspan}"><p><b>${rowTotalCaption || "Tổng cộng"}</b></p></td>`;
		arrColumns = arrColumns.slice(firstIndex, arrColumns.length);
		for(let column of arrColumns) {
			if(column.isTotal === true) {
				let total = arrData.reduce((a, b) => a + b[column.dataField], 0);
				rowTotal += `<td class="align-right"><p><b>${formatNumber(total)}</b></p></td>`;
			} else {
				rowTotal += `<td></td>`;
			}
		}
		rowTotal += `</tr>`;
		return rowTotal;
	}

	const getRowContentTable = (arrData, arrColumns) => {
		let rowContent = '';
		for(let objData of arrData) {
			rowContent += `<tr>`;
			for(let column of arrColumns) {
				if(column.formatNumber && typeof objData[column.dataField] === 'number') {
					let classes = column.class || "align-right";
					rowContent += `<td class="${classes}"><p>${formatNumber(objData[column.dataField])}</p></td>`;	
				} else {
					let classes = column.class || "align-left";
					rowContent += `<td class="${classes}"><p>${unReTextXML(objData[column.dataField])}</p></td>`;	
				}
			}
			rowContent += `</tr>`;
		}
		return rowContent;
	}

	const addCustomStyle = (_render) => {
		_render.addCustomDataSource({
			format: render.DataSource.OBJECT,
			alias: "libPdf",
			data: {
				font: {
					times: getUrlFile('../font/times/times_src.ttf'),
					times_bold: getUrlFile('../font/times/times_bold.ttf'),
					times_italic: getUrlFile('../font/times/times_italic.ttf'),
					times_bolditalic: getUrlFile('../font/times/times_italic_bold.ttf'),
				},
				css: getContentsFile('../css/scv_pdf_print.css'),
				rowcol100: getRowWithNumColumn(100),
				rowcol50: getRowWithNumColumn(50),
			}
		});
	}
	const getRowWithNumColumn = (_numCol) => {
		var width_percent = 100/_numCol;
		var contents = "<tr height='0%'>";
		for(let i = 0; i < _numCol; i++){
			contents += "<td width='" + width_percent + "%'></td>"
		}
		contents += "</tr>";

		return contents;
	}

	const getContentsFile = (_fileId) => {
		return file.load({id: _fileId}).getContents();
	}

	const getUrlFile = (_fileId) => {
		return file.load({id: _fileId}).url;
	}

	const roundNumber = (_number, _precision = 2) => {
		let precision = Math.pow(10, _precision);
		return Math.round(_number * precision) / precision;
	}

	const formatNumber = (_num, _fixed = 2) => {
		if(typeof _num === 'number' && _num % 1 !== 0) {
			_num = _num.toFixed(_fixed);
		}
		var parts = _num.toString().split(".");
		parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
		return parts.join(",");
	}

	const formatNumberV2 = (_num, _fixed = 2) => {
		if(typeof _num === 'number' && _num % 1 !== 0) {
			_num = _num.toFixed(_fixed);
		}
		var parts = _num.toString().split(".");
		parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		return parts.join(".");
	}

	const formatTextWithLineBreaks = (text) => {
		if(!text) return text;
		
		text = unReTextXMLV2(text);
		text = text.replaceAll('\n', '<br />');
		return text;
	}

	function unReTextXMLV2(text) {
		var cus_name = text
		if(!!text && typeof text === "string") {
			cus_name = cus_name.replace(/&(?!\w+;)/g, '&amp;');
			cus_name = cus_name.replace(/'/g, "&apos;");
			cus_name = cus_name.replace(/"/g, "&quot;");
		}
		return cus_name;
	}

	function unReTextXML(text) {
		var cus_name = text
		if(!!text && typeof text === "string") {
			cus_name = cus_name.replace(/<br\s*\/?>/gi, '___SCV_BR___');
			cus_name = cus_name.replace(/&(?!amp;|lt;|gt;|apos;|quot;|#\d+;|#x[0-9a-f]+;)/gi, '&amp;');
			cus_name = cus_name.replace(/>/gi, "&gt;");
			cus_name = cus_name.replace(/</gi, "&lt;");
			cus_name = cus_name.replace(/'/g, "&apos;");
			cus_name = cus_name.replace(/"/g, "&quot;");
			cus_name = cus_name.replace(/___SCV_BR___/g, '<br/>');
		}
		return cus_name;
	}

	const formatValueWithObject = (_inputObj) => {
		for(let property in _inputObj) {
			_inputObj[property] = _inputObj[property] || "";
		}
		return _inputObj;
	}

	const formatNumberWithObject = (_inputObj) => {
		Object.keys(_inputObj).forEach(ele => {
			if(!!_inputObj[ele] && !isNaN(_inputObj[ele])){
				_inputObj[ele] = formatNumber(_inputObj[ele]);
			}
		});

		return _inputObj;
	}

	const convertStringToNormalize = (str) => {
		if(!!str) {
			return str.normalize();
		}
		return "";
	}

    const formatDataXML = (str) => {
        if (str === 0) return str;
        if (!str || ['null', 'undefined'].includes(str)) return '';
        return typeof str === 'string' ? unReTextXML(str) : str;
    }

    const formatDataXMLWithObject = (obj) => {
        Object.keys(obj).forEach(key => {
            obj[key] = formatDataXML(obj[key]);
        });
        return obj;
    }
	
    const createImageBySubsidiaryV2 = (subsidiaryRec, expectedWidth) => {
        let logoId = subsidiaryRec.getValue('logo');
        if (!logoId) return '';
        
        let imgFile = file.load({ id: logoId });
        let { width, height } = getImageDimensions(imgFile) || { width: 100, height: 100 };
        let logoUrl = imgFile.url;
        let expectedHeight = height;

        if (expectedWidth) {
            let ratio = roundNumber(width / height);
            expectedHeight = roundNumber(expectedWidth / ratio);
        } else expectedWidth = width;
        
        let tagImg = `<img src="${unReTextXML(logoUrl)}" alt="view" style="width: ${expectedWidth}px; height: ${expectedHeight}px;" />`;

        return tagImg;
    };

    const getImageDimensions = (f) => {
        const hex = encode.convert({
            string: f.getContents(),
            inputEncoding: encode.Encoding.BASE_64,
            outputEncoding: encode.Encoding.HEX
        });
        const bytes = hexToBytes(hex);

        // 1. Kiểm tra PNG
        const sig = [137, 80, 78, 71, 13, 10, 26, 10];
        if (bytes.length > 24 && sig.every((v, i) => bytes[i] === v)) {
            return { width: u32BE(bytes, 16), height: u32BE(bytes, 20) };
        }

        // 2. Kiểm tra GIF
        if (bytes.length > 10 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
            return { width: u16LE(bytes, 6), height: u16LE(bytes, 8) };
        }

        // 3. Kiểm tra JPEG
        if (bytes.length > 4 && bytes[0] === 0xFF && bytes[1] === 0xD8) {
            let offset = 2;
            while (offset + 3 < bytes.length) {
                if (bytes[offset] !== 0xFF) break;
                let marker = bytes[offset + 1];
                if (marker >= 0xC0 && marker <= 0xC3) {
                    if (offset + 8 >= bytes.length) break;
                    return {
                        height: u16BE(bytes, offset + 5),
                        width:  u16BE(bytes, offset + 7)
                    };
                }
                if (offset + 3 >= bytes.length) break;
                offset += 2 + u16BE(bytes, offset + 2);
            }
        }

        return null;
    };

    const u32BE = (b, o) => (((((b[o] * 256) + b[o + 1]) * 256) + b[o + 2]) * 256) + b[o + 3];
    const u16BE = (b, o) => (b[o] * 256) + b[o + 1];
    const u16LE = (b, o) => b[o] + (b[o + 1] * 256);

    const hexToBytes = (hex) => {
        const n = hex.length;
        const out = new Array(n >>> 1);
        for (let i = 0, j = 0; i < n; i += 2) out[j++] = parseInt(hex.substr(i, 2), 16);
        return out;
    };


    return {
		initTemplateRender: initTemplateRender,
		renderTemplateWithXml: renderTemplateWithXml,
		renderTemplateByContentXml: renderTemplateByContentXml,
		formatNumber: formatNumber,
		formatNumberV2: formatNumberV2,
		formatNumberWithObject: formatNumberWithObject,
		formatValueWithObject: formatValueWithObject,
		addCustomStyle: addCustomStyle,
		getContentsFile: getContentsFile,
		createImage: createImage,
		createImageBySubsidiary: createImageBySubsidiary,
		renderTableXML: renderTableXML,
		roundNumber: roundNumber,
		convertStringToNormalize: convertStringToNormalize,
		formatDataXMLWithObject: formatDataXMLWithObject,
		formatDataXML: formatDataXML,
		unReTextXML: unReTextXML,
		formatTextWithLineBreaks: formatTextWithLineBreaks,
		createImageBySubsidiaryV2: createImageBySubsidiaryV2
	};
    
});
