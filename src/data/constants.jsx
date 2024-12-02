
import { format, addWeeks, differenceInMonths } from "date-fns";

const now = new Date();


const barChartOptions = [];

const dbfMonths = [
    "PRIORY",
    "YTD",
    "MTD",
    "FIRST",
    "SECON",
    "THIRD",
    "FOURT",
    "FIFTH",
    "SIXTH",
    "SEVEN",
    "EIGHT",
    "NINTH",
    "TENTH",
    "ELEVE",
    "TWELV"
];


const xlabels = [
    "Last Yr",
    "YTD",
    "MTD",
]

const colors = [
    "#0c0a09",
    "#1d4ed8",
    "#dc2626",
    "#db2777",
    "#4ade80",
    "#67e8f9",
    "#fde047",
    "#78716c",
    "#1e3a8a",
    "#9f1239",
    "#701a75",
    "#166534",
    "#0e7490",
    "#854d0e",
    "#e7e5e4"

]

for (let i = 0; i < dbfMonths.length; i++) {
    let thisLabel;
    const monthIndex = now.getMonth() - i - 1 + 3;
    if (i < 3) {
        thisLabel = xlabels[i];
    } else {
        thisLabel = format(new Date(now.getFullYear(), monthIndex), 'MMM');
    }
    barChartOptions[i] = {
        dbfName: dbfMonths[i],
        xlabel: thisLabel,
        color: colors[i],
        monthIndex: monthIndex
    };
}

const monthsFromNowToDBFFileMonthName = [];

for (let i = 0; i < 12; i++) {
    monthsFromNowToDBFFileMonthName[i] = dbfMonths[14 - i];
}

const weeksFromNowToMonthsFromNow = [];

// month sform now to dbf file name 

// 8 weekss from now -> date -> months from now


const weeksFromNowToDBFFileMonthName = []; // Length 52 array 
const dateFromNowFromWeeks = [];

for (let w = 0; w < 52; w++) {
    // current month: 5
    // assumed less than or equal to 51.

    // add remainder weeks to current date to get a new date and the month of the new date 
    // subtract month of new date from month of current date
    dateFromNowFromWeeks[w] = addWeeks(now, w);
    const dateFromNowDifferenceInMonths = differenceInMonths(dateFromNowFromWeeks[w], now);
    // now we have m
    weeksFromNowToDBFFileMonthName[w] = monthsFromNowToDBFFileMonthName[dateFromNowDifferenceInMonths % 12];

}

const webpageSelectionEnums = {
    home: "home",
    assortmentTool: "assortmentTool",
    orderingTool: "orderingTool"
}

const listSelectionsEnums = {

    alreadyOrderedList: { name: "already-ordered-list", displayName: "Already Ordered", colorTheme:'alreadyordered-theme' },
    selectionList: { name: "selection-list", displayName: "Selected Items", colorTheme: '' },
    outOfStockList: { name: "out-of-stock-list", displayName: "Out Of Stock", colorTheme: 'outofstock-theme'},
    discontinuedList: { name: "discontinued-list", displayName: "Discontinued", colorTheme: 'discontinued-theme'},
    recountInventoryList: { name: "recount-list", displayName: "Recount List", colorTheme: 'needrecount-theme'},
    labelList: { name: "label-list", displayName: "Label List" , colorTheme:'labellist-theme'},
    watchList: { name: "watch-list", displayName: "Watch List", colorTheme: 'watchlist-theme'}

}

const actionSelectionsEnums = {

    orderList: { name: "order-list", displayName: "Add to Order List" },
    alreadyOrderedList: { name: "already-ordered-list", displayName: "Mark Already Ordered" },
    outOfStockList: { name: "out-of-stock-list", displayName: "Mark Out of Stock" },
    discontinuedList: { name: "discontinued-list", displayName: "Mark Discontinued" },
    recountInventoryList: { name: "recount-list", displayName: "Needs Recount" },
    labelList: { name: "label-list", displayName: "Add to Label List" },
    watchList: { name: "watch-list", displayName: "Add to Watch List" }
}



export {
    barChartOptions,
    monthsFromNowToDBFFileMonthName,
    webpageSelectionEnums,
    weeksFromNowToDBFFileMonthName,
    dateFromNowFromWeeks,
    listSelectionsEnums,
    actionSelectionsEnums
};