/**
 * Nội dung: Xử lý các crypto
 * + N/crypto/random - random.generateUUID(): (12 Jun 2025) đang tốn Governance 5 unit cho mỗi lần,
 *          chứ không phải none như NS mô tả
 * Version: 1.250612.1
 * =======================================================================================
 *  Date                Author                  Description
 *  12 Jun 2025         Huy Pham                Init & create file
 */
define([
    '../olib/crypto-js.js',
],
function(
    CryptoJS,
) {
	
	const RECORDS = {
    }

    const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    const handlePasswordsSafely = (value, isDecrypt, keySecret) => {
		if(!value) return '';

		if(!isDecrypt) {
			return CryptoJS.AES.encrypt(value, keySecret).toString();
		}

		let decrypted = CryptoJS.AES.decrypt(value, keySecret);

		return decrypted.toString(CryptoJS.enc.Utf8);
	}

    const hasCurlyBraces = (value = "") => {
        return /[{}]/.test(value);
    }

    return {
		RECORDS,
        generateUUID,
        handlePasswordsSafely,
        hasCurlyBraces,
    };
    
});
