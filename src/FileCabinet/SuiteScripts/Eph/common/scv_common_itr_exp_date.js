/**
 *  Date                Author                  Description
 *  20 Nov 2026         Hoan Nguyen			    Auto calculate Expiration Date from ms.Ngọc(https://app.clickup.com/t/3773072/14yhnhmjayv)
 */
define(['N/util', 'N/format'],
    function(util, format) {

        const SUBLIST_ID = 'item';
        const FIELDS = {
            prodDate: 'custcol_scv_itr_prod_date',
            shelfLifeDays: 'custcol_scv_shelf_lifedays',
            expDate: 'custcol_scv_itr_exp_date',
        };

        const isEmpty = (val) => val === null || val === undefined || val === '';

        const toDate = (val) => {
            if(isEmpty(val)) return null;
            let d = util.isDate(val) ? val : format.parse({type: format.Type.DATE, value: String(val)});
            if(!d || !util.isDate(d) || isNaN(d.getTime())) return null;
            return d;
        }

        const calcExpirationDate = (prodDate, shelfLifeDays) => {
            const d = toDate(prodDate);
            if(!d || isEmpty(shelfLifeDays)) return null;
            const days = Number(shelfLifeDays);
            if(isNaN(days)) return null;

            return new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
        }

        const onChange_SetLineExpirationDate = (curRec, sublistId, fieldId) => {
            if(sublistId !== SUBLIST_ID) return;
            if(![FIELDS.prodDate, FIELDS.shelfLifeDays].includes(fieldId)) return;

            const prodDate = curRec.getCurrentSublistValue({sublistId: SUBLIST_ID, fieldId: FIELDS.prodDate});
            const shelfLifeDays = curRec.getCurrentSublistValue({sublistId: SUBLIST_ID, fieldId: FIELDS.shelfLifeDays});
            if(isEmpty(prodDate) || isEmpty(shelfLifeDays)) return;

            const newExpDate = calcExpirationDate(prodDate, shelfLifeDays);
            if(!newExpDate) return;

            curRec.setCurrentSublistValue({sublistId: SUBLIST_ID, fieldId: FIELDS.expDate, value: newExpDate});
        }

        return {
            FIELDS,
            calcExpirationDate,
            onChange_SetLineExpirationDate,
        };
    });
