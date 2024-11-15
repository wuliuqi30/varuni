
import { format, addWeeks,differenceInMonths } from "date-fns";

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
    const dateFromNowDifferenceInMonths = differenceInMonths(dateFromNowFromWeeks[w],now);
    // now we have m
    weeksFromNowToDBFFileMonthName[w] = monthsFromNowToDBFFileMonthName[dateFromNowDifferenceInMonths%12];

}

const webpageSelectionEnums = {
    main: "main",
    assortmentTool: "assortmentTool",
    orderingTool: "orderingTool"
}

export { barChartOptions, monthsFromNowToDBFFileMonthName, webpageSelectionEnums, weeksFromNowToDBFFileMonthName,dateFromNowFromWeeks };