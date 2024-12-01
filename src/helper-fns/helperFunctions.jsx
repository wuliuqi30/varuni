import {
    monthsFromNowToDBFFileMonthName,
    weeksFromNowToDBFFileMonthName,
    dateFromNowFromWeeks
} from '../data/constants';
import { differenceInWeeks, getWeeksInMonth, addWeeks,format } from 'date-fns';

function removeTrailingSlash(str) {
    return str.replace(/[\\/]+$/, "");
};


function printArrayToString(titleString, array, unit) {

    let outstring = `${titleString}: `;

    if (unit === undefined || unit === null) {
        unit = "";
    }
    if (array.length < 1) {
        outstring += " Empty."
    } else {

        for (let a = 0; a < array.length - 1; a++) {
            outstring += `${array[a]} ${unit}, `;
        }
        outstring += `${array[array.length - 1]} ${unit}.`;
    }
    console.log(outstring);
}

function printOrderAndTime(titleString, productArray, oldProductOrders, oldTimeArray, newProductOrders, newTimeArray, dateOrTime) {

    const outArray = [];
    switch (dateOrTime) {
        case 'time': {
            for (let i = 0; i < productArray.length; i++) {
                outArray[i] = {
                    name: productArray[i].SIZE,
                    order: `${oldProductOrders[i]} cases`,
                    time: `${oldTimeArray[i]} wks.`,
                    newOrder: `${newProductOrders[i]} cases`,
                    newTime: `${newTimeArray[i]} wks.`
                };
            }
        }
            break;
        case 'date': {
            for (let i = 0; i < productArray.length; i++) {
                outArray[i] = {
                    name: productArray[i].SIZE,
                    order: `${oldProductOrders[i]} cases`,
                    time: `${format(oldTimeArray[i],'MMM eo yyyy')}.`,
                    newOrder: `${newProductOrders[i]} cases`,
                    newTime: `${format(newTimeArray[i],'MMM eo yyyy')}.`
                };
            }
        }

    }

    console.log(titleString);
    console.table(outArray);

}

const extrapolateMonthlySales = (product, m, analysisMethod) => {
    // returns a value predicting the number of sales per month at month m, where m is number of months away from now
    // m = 0 means the current month

    switch (analysisMethod) {
        case 'previous-year':
            if (m === 0) {
                // Remainder of this month: 
                return Math.max(0, product[monthsFromNowToDBFFileMonthName[0]] - product['MTD']);
            } else {
                return product[monthsFromNowToDBFFileMonthName[m % 12]];
            }

    }
    return 0;


}

const calculateAverageMonthlySales = (product) => {
    return product.PRIORY / 12;
}


const extrapolateWeeklySales = (product, week, analysisMethod) => {

    // return the predicted sales per WEEK during the month that is MONTH months into the future

    switch (analysisMethod) {
        case 'previous-year': {
            const salesPerThatWeeksMonth = product[weeksFromNowToDBFFileMonthName[week % 52]];
            const weeksPerMonth = getWeeksInMonth(dateFromNowFromWeeks[week % 52]);
            // for now just break up each month in
            return Math.round(salesPerThatWeeksMonth / weeksPerMonth);
        }

    }
    return 0;

}

const getLastTwelveMonthSales = (product) => {
    let sum = 0;
    for (let i = 1; i <= 12; i++) {
        sum += product[monthsFromNowToDBFFileMonthName[i]];
    }
    return sum;
}

const calculateReorderPointFromQuantity = (product, startingQuantity, analysisMethod) => {

    const todayDate = new Date();
    // Given a certain quantity, calculate how many weeks until you run out based on monthly sales

    // If its over a certain number of weeekks, just return that number to avoid an infinite loop
    const maxNumWeeks = 208;
    let thingsUnsold = startingQuantity;

    let reorderWeek = 0;

    if (getLastTwelveMonthSales(product) === 0) {
        return 'No Sales Projected';
    } else if ((thingsUnsold > 0) && (startingQuantity !== undefined && startingQuantity !== null)) {

        let thisWeeksSales = extrapolateWeeklySales(product, reorderWeek, analysisMethod);
        while (thingsUnsold - thisWeeksSales > 0) {

            thingsUnsold -= thisWeeksSales;

            reorderWeek++;
            thisWeeksSales = extrapolateWeeklySales(product, reorderWeek, analysisMethod);

            if (reorderWeek >= maxNumWeeks) {
                reorderWeek = maxNumWeeks;
                break;
            }

        }

    }


    // we sell out DURING week= reorderWeek. 
    const reorderDate = addWeeks(todayDate, reorderWeek);
    const reorderTimeWeeks = Math.max(differenceInWeeks(reorderDate, todayDate), 0);
    return [reorderDate, reorderTimeWeeks];
}


export {
    printArrayToString,
    printOrderAndTime,
    calculateReorderPointFromQuantity,
    getLastTwelveMonthSales,
    extrapolateMonthlySales,
    extrapolateWeeklySales,
    calculateAverageMonthlySales,
    removeTrailingSlash
}