/**
 * @NApiVersion 2.1
 */
define([
    '../cons/scv_cons_format.js',
],
    (
        constFormat
    ) => {

        const DateRange = {
            Today: {
                ID: "today", NAME: "Today"
            },
            Last_3Days: {
                ID: "last3days", NAME: "Last 3 Days"
            },
            Last_7Days: {
                ID: "last7days", NAME: "Last 7 Days"
            },
            Last_14Days: {
                ID: "last14days", NAME: "Last 14 Days"
            },
            ThisMonth: {
                ID: "thismonth", NAME: "This Month"
            },
            LastMonth: {
                ID: "lastmonth", NAME: "Last Month"
            },
            ThisYear: {
                ID: "thisyear", NAME: "This Year"
            },
            LastYear: {
                ID: "lastyear", NAME: "Last Year"
            },
            Custom: {
                ID: "custom", NAME: "Custom"
            },
        };

        const getDataRangeById = (_dateRangeId) => {
            let fromDate = new Date();
            let toDate = cloneDate(fromDate);

            // log.error("run", {
            //     fromDate, toDate
            // })

            switch(_dateRangeId) {
                case DateRange.Last_3Days.ID:
                    fromDate.setDate(fromDate.getDate() - 2);
                    break;
                case DateRange.Last_7Days.ID:
                    fromDate.setDate(fromDate.getDate() - 6);
                    break;
                case DateRange.Last_14Days.ID:
                    fromDate.setDate(fromDate.getDate() - 13);
                    break;
                case DateRange.ThisMonth.ID:
                    fromDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
                    // toDate = new Date(toDate.getFullYear(), toDate.getMonth() + 1, 0);
                    break;
                case DateRange.LastMonth.ID:
                    fromDate = new Date(fromDate.getFullYear(), fromDate.getMonth() - 1, 1);
                    toDate = new Date(toDate.getFullYear(), toDate.getMonth(), 0);
                    break;
                case DateRange.ThisYear.ID:
                    fromDate = new Date(fromDate.getFullYear(), 0, 1);
                    // toDate = new Date(toDate.getFullYear(), 12, 0);
                    break;
                case DateRange.LastYear.ID:
                    fromDate = new Date(fromDate.getFullYear() - 1, 0, 1);
                    toDate = new Date(toDate.getFullYear() - 1, 12, 0);
                    break;
            }

            return {
                fromDate,
                toDate
            };
        }

        const cloneDate = (_date) => {
            return new Date(_date);
        }

        const getDataDateRange = () => {
            const arrResult = [];

            for(let property in DateRange) {
                arrResult.push({
                    id: DateRange[property].ID,
                    name: DateRange[property].NAME
                });
            }

            return arrResult;
        }

        const getDataColumnResIntQueue = () => {
            let maskFormatNumber = constFormat.getTemplateFormatNumber(2);

            return [
                {dataField: 'retry_status_display', caption: "Retry Status", dataType: 'string'},
                {dataField: 'count', caption: "Count", dataType: 'number', format: maskFormatNumber},
                {dataField: 'status_percent', caption: "Retry Status (%)", dataType: 'string'},
            ];
        }

        return {
            DateRange,

            getDataDateRange,
            getDataRangeById,

            getDataColumnResIntQueue,
        }
    });
