/**
 * Nội dung:
 * Key:
 * =======================================================================================
 *  Date                Author                  Description
 *  10 Apr 2026         Khanh Tran			    Init, create file.
 */
define([],
function() {
	
	const TYPE = "customlist_scv_einvoice_linetype";
	const Fields = {
		ID: "id",
		INACTIVE: "isinactive",
		NAME: "name"
	};
	
	const Records = {
		HangHoa: {
			ID: 1,
			NAME: "Hàng hóa",
		},
	};

    return {
		TYPE,
		Fields,
		Records,
    };
    
});
