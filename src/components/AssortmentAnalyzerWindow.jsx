import { TextField, RadioGroup, FormControl, FormLabel, FormControlLabel, Radio } from '@mui/material';
import { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker'; // Correct import
import dayjs from 'dayjs';
import {
    printArrayToString,
    printOrderAndTime,
    calculateReorderPointFromQuantity,
    calculateReorderPointWithOrderingSheet,
    getLastTwelveMonthSales
} from '../helper-fns/helperFunctions';
import { format, min, compareAsc } from 'date-fns';

import { SimpleProduct } from './ProductDisplayItem';
import { Unstable_NumberInput as NumberInput } from '@mui/base';
import { styled } from '@mui/system';
const StyledNumberInput = styled(NumberInput)


export function AssortmentAnalyzerWindow({
    data,
    productIndicesToAnalyze,
    importSelectionToAssortmentAnalyzerHandler,
    handleRemoveAssortmentItem,
    showDetailsHandler,
    removeAllAssortedItemsHandler }) {

    const suppressOutput = true;
    const exampleCalcs = false;

    if (!suppressOutput) {
        console.log("Entered AssortmentAnalyzerWindow");
        console.log(productIndicesToAnalyze);
    }

    const todayDate = new Date();
    const todayDayjs = dayjs(todayDate);
    //const [analysisState, setAnalysisState] = useState(false); // whether or not to show the analysis
    const [targetNumberOfItems, setTargetNumberOfItems] = useState(0); // total number of cases or units that are required for this deal
    const [targetType, setTargetType] = useState('Cases'); // 'Cases' or 'Units' or 'Date'
    const [targetLastTillDate, setTargetLastTillDate] = useState(todayDayjs); // How long you wish the supply to last
    const [analysisMethod, setAnalysisMethod] = useState('previous-year'); // previous-year, year-to-date, last-three-months

    const [productThingReorderAmounts, setProductThingReorderAmounts] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0,0,0,0,0,0,0]);
    const [calculationInfoMessage, setCalculationInfoMessage] = useState("");


    const productDataArray = [];


    for (let i = 0; i < productIndicesToAnalyze.length; i++) {
        productDataArray[i] = data[productIndicesToAnalyze[i]];
        productDataArray[i].ORDER_QUANTITY = productThingReorderAmounts[i];
    }
   

  

    const changeNumberOfItemsHandler = (e) => {

        setTargetNumberOfItems(Number(e.target.value));
    }

    const changeLastTillDateHandler = (date) => {
        if (!suppressOutput) {
            console.log(`changing the date, e.target  is: `);
            console.log(typeof date);
        }
        setTargetLastTillDate(date);
    }

    const changeOrderAmountHandler = (e) => {
        const { value, name } = e.target;
        const index = Number(name);
        if (typeof index == 'number' && index > -1) {
            console.log("About to set the new state");
            setProductThingReorderAmounts((prevState) => {
                console.log("doing  const updatedState = [...prevState];");
                const updatedState = [...prevState];
                console.log("updatedState:");
                console.log(updatedState);
                updatedState[index] = Number(value);
                return updatedState;
            });
        } else {
            console.log("Not a number!");
        }
    }



    if (exampleCalcs) {
        // calcualtions:     

        // quantity calculation
        const q10 = 23;
        const q20 = 14;
        const q30 = 4;

        const r1 = -5;
        const r2 = -4;
        const r3 = -10;

        const p = 200;

        const T = -1 * p - (q10 + q20 + q30) / (r1 + r2 + r3);

        console.log(`Initial Quantities are: 1: ${q10}, 2: ${q20}, 3: and ${q30}, Rates are 1: ${r1}/month 2: ${r2}/month and 3: ${r3}/month.`);

        console.log(`Total Bottles needed are ${p}. Solved for T = ${T}`);

        // chosen amouns: 
        let p1 = 40;
        let p2 = 40;
        let p3 = p - p1 - p2;

        const t1 = -1 * (q10 + p1) / r1;
        const t2 = -1 * (q20 + p2) / r2;
        const t3 = -1 * (q30 + p3) / r3;


        console.log(`Chose p1: ${p1}, p2: ${p2}, and p3: ${p3}. Calculated T1: ${t1}, T2: ${t2}, and T2: ${t3} `)


        console.log(`Try different values of T.`);
        const tExample1 = -197;
        p1 = getPurchaseNumberFromTime(tExample1, r1, q10);
        p2 = getPurchaseNumberFromTime(tExample1, r2, q20);
        p3 = getPurchaseNumberFromTime(tExample1, r3, q30);

        console.log(`For T = ${tExample1} Got p1: ${p1}, p2: ${p2}, and p3 ${p3}`);
    }

    function getPurchaseNumberFromTime(t, r, qInitial) {
        return -1 * (r * t + qInitial);
    }

    const orderCalculationInvalid = () => {

        // If any product will have no project sales, return a message:
        for (let i = 0; i < productDataArray.length; i++) {
            if (getLastTwelveMonthSales(productDataArray[i]) <= 0) {
                return `One of the products has no project sales: please remove ${productDataArray[i].DESCRIP}  ${productDataArray[i].SIZE}.`;
            }
        }
        return null;
    }

    const calculateOrderQuantitiesHandler = () => {

        switch (targetType) {
            case 'Units':
            case 'Cases':
                getOrderQuantitiesWithNumericalTarget();
                break;
            case 'Date':
                getOrderQuantitiesWithDateTarget();
                break;
            default:
                console.log(`Target Type has a problem, its: ${targetType}`);


        }
    }

    const getOrderQuantitiesWithNumericalTarget = () => {

        // Initial Checks
        if (!targetNumberOfItems) {
            console.log("No Target! Returning...");
            return;
        }

        const calculationInvalidAlert = orderCalculationInvalid();

        if (calculationInvalidAlert !== null) {
            setCalculationInfoMessage(calculationInvalidAlert);
            return;
        } else {
            setCalculationInfoMessage("");
        }


        // =========Algorithm===========

        const orderProductsArray = Array(productDataArray.length).fill(0);

        // Get the initial time array values
        let timeArrayInWeeks = getTimeOrDateArrayFromOrderNumbers(productDataArray, orderProductsArray, 'time');

        // Iterative Algorithm: 

        let currentMinIndex = getMinIndex(timeArrayInWeeks);

        if (!suppressOutput) {
            console.log("Time Array: ");
            console.log(timeArrayInWeeks);
            console.log("Order Products: ");
            console.log(orderProductsArray);
        }


        let iterationCounter = 0;
        let totalSoFar = sumOfItems(productDataArray, orderProductsArray);
        const maxIterations = 4000;
        const printInfoFrequency = 1;

        let oldTimeArray;
        let oldOrderArray;

        console.log(`BEGINNING SLOWLY ADD MORE ALGORITHM. TARGET: ${targetNumberOfItems} ${targetType}`)
        while ((iterationCounter <= maxIterations) && (totalSoFar < targetNumberOfItems)) {

            if (!suppressOutput && (iterationCounter % printInfoFrequency == 0)) {
                console.log("                                                    ");
                console.log(`Iteration ${iterationCounter}. Total so far: ${totalSoFar}`);
                console.log(`   Current min: ${currentMinIndex}`);
                //printArrayToString("   Order Products (before)  ", orderProductsArray , "cases");
                //printArrayToString("   Products last (before)   ", timeArrayInWeeks, "wks");

                console.log(`   Adding One Case to ${productDataArray[currentMinIndex].SIZE}`);
            }


            // 1. Add a case to the product which has the earliest runout time
            oldTimeArray = [...timeArrayInWeeks];
            oldOrderArray = [...orderProductsArray];
            orderProductsArray[currentMinIndex]++;

            // 2. Recalculate time array for that one item that changed:             
            timeArrayInWeeks[currentMinIndex] = getTimeOrDateArrayFromOrderNumbers([productDataArray[currentMinIndex]], [orderProductsArray[currentMinIndex]], 'time')[0];

            // 3. Calculate the new min          
            currentMinIndex = getMinIndex(timeArrayInWeeks);


            if (!suppressOutput && (iterationCounter % printInfoFrequency == 0)) {
                printOrderAndTime("   Transition Matrix:", productDataArray, oldOrderArray, oldTimeArray, orderProductsArray, timeArrayInWeeks, 'time');
                //printArrayToString("    Order Products (AFTER)", orderProductsArray, "cases");
                //printArrayToString("    Products Last (AFTER) ", timeArrayInWeeks, "wks");
                //printOrderAndTime("After:",productDataArray, orderProductsArray, timeArrayInWeeks );
                console.log(`     New min: ${currentMinIndex}`);


            }
            totalSoFar = sumOfItems(productDataArray, orderProductsArray);
            iterationCounter++;
        }

        console.log(`Finished Algorithm after ${iterationCounter} iterations. Total items is ${totalSoFar} ${targetType}`);

        // TO DO: Reorder Products By Total Cases Ordered ???
        // Reordering is based on decreasing order of orderProductsArray. 
        setProductThingReorderAmounts(orderProductsArray);


    }

    const getOrderQuantitiesWithDateTarget = () => {


        if (!suppressOutput) {
            console.log("Calculating Order quantities in function getOrderQuantitiesWithDateTarget");
        }

        const calculationInvalidAlert = orderCalculationInvalid();

        if (calculationInvalidAlert !== null) {
            setCalculationInfoMessage(calculationInvalidAlert);
            return;
        }


        // =========Algorithm===========

        const orderProductsArray = Array(productDataArray.length).fill(0);

        // Get the initial time array values
        let dateArrayInWeeks = getTimeOrDateArrayFromOrderNumbers(productDataArray, orderProductsArray, 'date');

        // Iterative Algorithm: 

        let currentMinIndex = getMinDateIndex(dateArrayInWeeks);

        if (!suppressOutput) {
            console.log("Time Array: ");
            console.log(dateArrayInWeeks);
            console.log("Order Products: ");
            console.log(orderProductsArray);
        }


        let iterationCounter = 0;
        let totalSoFar = sumOfItems(productDataArray, orderProductsArray);
        const maxIterations = 4000;
        const printInfoFrequency = 1;

        const lastTillEndOfDate = targetLastTillDate.add(1, 'month');

        let oldTimeArray;
        let oldOrderArray;

        console.log(`BEGINNING SLOWLY ADD MORE ALGORITHM. TARGET: ${targetNumberOfItems} ${targetType}`)
        while ((iterationCounter <= maxIterations) && (compareAsc(dateArrayInWeeks[currentMinIndex], lastTillEndOfDate.toDate()) < 0)) {

            if (!suppressOutput && (iterationCounter % printInfoFrequency == 0)) {
                console.log("                                                    ");
                console.log(`Iteration ${iterationCounter}. Total so far: ${totalSoFar}`);
                console.log(`   Current min: ${currentMinIndex}`);
                //printArrayToString("   Order Products (before)  ", orderProductsArray , "cases");
                //printArrayToString("   Products last (before)   ", timeArrayInWeeks, "wks");

                console.log(`   Adding One Case to ${productDataArray[currentMinIndex].SIZE}`);

            }


            // 1. Add a case to the product which has the earliest runout time
            oldTimeArray = [...dateArrayInWeeks];
            oldOrderArray = [...orderProductsArray];
            orderProductsArray[currentMinIndex]++;

            // 2. Recalculate time array for that one item that changed:             
            dateArrayInWeeks[currentMinIndex] = getTimeOrDateArrayFromOrderNumbers([productDataArray[currentMinIndex]], [orderProductsArray[currentMinIndex]], 'date')[0];

            // 3. Calculate the new min date     
            currentMinIndex = getMinDateIndex(dateArrayInWeeks);


            if (!suppressOutput && (iterationCounter % printInfoFrequency == 0)) {
                printOrderAndTime("   Transition Matrix:", productDataArray, oldOrderArray, oldTimeArray, orderProductsArray, dateArrayInWeeks, 'date');
                //printArrayToString("    Order Products (AFTER)", orderProductsArray, "cases");
                //printArrayToString("    Products Last (AFTER) ", timeArrayInWeeks, "wks");
                //printOrderAndTime("After:",productDataArray, orderProductsArray, timeArrayInWeeks );
                console.log(`     New min date index: ${currentMinIndex}. Comparison result: compareAsc(dateArrayInWeeks[currentMinIndex], targetLastTillDate) = ${compareAsc(dateArrayInWeeks[currentMinIndex], targetLastTillDate.toDate())}`);


            }
            totalSoFar = sumOfItems(productDataArray, orderProductsArray);
            iterationCounter++;
        }

        console.log(`Finished Algorithm after ${iterationCounter} iterations. Total items is ${totalSoFar} ${targetType}`);

        // TO DO: Reorder Products By Total Cases Ordered ???
        // Reordering is based on decreasing order of orderProductsArray. 
        setProductThingReorderAmounts(orderProductsArray);


    }


    const sumOfItems = (productDataArray, orderProductsArray) => {

        switch (targetType) {
            case 'Cases':
            case 'Date': {
                return orderProductsArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
            }
            case 'Units': {
                let sum = 0;
                for (let p = 0; p < productDataArray.length; p++) {
                    sum += productDataArray[p].QTY_CASE * orderProductsArray[p];
                }
                return sum;
            }
            default:
                console.log("In sumOfItems, targettype is wrong.");
        }

    }

    const getPseudoMaxIndex = (timeArray, orderAmountsArray, minProductOrderAmount) => {
        // From among the products in orderAmountsArray that have at least minProductOrderAmount, 
        // find the index of the element in timeArray that is the maximum
        let pseudoMaxValue = 0;
        let pseudoMaxIndex = NaN;
        for (let i = 0; i < timeArray.length; i++) {
            if ((timeArray[i] > pseudoMaxValue) && (orderAmountsArray[i] >= minProductOrderAmount)) {
                pseudoMaxValue = timeArray[i];
                pseudoMaxIndex = i;
            }
        }
        return pseudoMaxIndex;
    }

    const getMinIndex = (timeArray) => {
        return timeArray.indexOf(Math.min(...timeArray));
    }

    const getMinDateIndex = (timeArray) => {
        const timeArrayDateMin = min(timeArray);
        return timeArray.findIndex(date => date.getTime() === timeArrayDateMin.getTime());
    }

    const getTimeOrDateArrayFromOrderNumbers = (productDataList, orderProductsArray, timeOrDate) => {

        const timeDateArrayWeeks = Array(productDataList.length);

        for (let p = 0; p < productDataList.length; p++) {
            const reorderPtResult = calculateReorderPointWithOrderingSheet(productDataList[p], orderProductsArray[p], analysisMethod);
            if (typeof reorderPtResult === 'string') {
                timeDateArrayWeeks[p] = reorderPtResult;
            } else if (timeOrDate === 'time') {
                timeDateArrayWeeks[p] = reorderPtResult[1];
            } else if (timeOrDate === 'date') {
                timeDateArrayWeeks[p] = reorderPtResult[0];
            }
        }
        return timeDateArrayWeeks;
    }

    // Calculate runout times for ordered products
    const runoutTimeLabelArray = [];

    for (let i = 0; i < productIndicesToAnalyze.length; i++) {
        const reorderPoint = calculateReorderPointWithOrderingSheet(productDataArray[i], productThingReorderAmounts[i]);
        let runoutLabel;
        if (typeof reorderPoint === 'string') {
            runoutLabel = reorderPoint;
        } else {
            runoutLabel = `..runs out ${format(reorderPoint[0], 'MMM eo yyyy')}`;
        }

        runoutTimeLabelArray[i] = runoutLabel;
    }

    let totalThings = sumOfItems(productDataArray, productThingReorderAmounts);


    const removeAllAssortedItemsClickHandler = () => {
        const isConfirmed = window.confirm("Are you sure you want to delete everything in the order list? This cannot be undone.");
        if (isConfirmed) {
            removeAllAssortedItemsHandler([]);
        }
    }
    // if (!suppressOutput) {
    //     console.log("Rerendering The Analyzer Window");
    //     console.log("Case Order Number Array (productCaseAmounts) is: ");
    //     console.log(productThingReorderAmounts)
    //     console.log("productDataArray is");
    //     console.log(productDataArray);
    //     console.log("productIndicesToAnalyze is");
    //     console.log(productIndicesToAnalyze);
    // }

     // Sort Product Data by order quantity, most first

    return (
        <div className='assortment-analyzer-main-window'>
            <h2>Assorted Ordering Tool</h2>




            <div className='assortment-analyzer-options-window'>

                <FormControl>
                    <FormLabel id="demo-radio-buttons-group-label">Assortment Type:</FormLabel>
                    <RadioGroup
                        aria-labelledby="demo-radio-buttons-group-label"

                        name="radio-buttons-group"
                        value={targetType}
                        onChange={(e) => { setTargetType(e.target.value) }}
                    >
                        <FormControlLabel value="Cases" control={<Radio />} label="Cases" />
                        <FormControlLabel value="Units" control={<Radio />} label="Units" />
                        <FormControlLabel value="Date" control={<Radio />} label="Date" />
                    </RadioGroup>
                </FormControl>
                {(targetType === 'Cases' || targetType === 'Units') &&
                    <TextField
                        className='assortment-analyzer-options-item'
                        id="select-number-of-items"
                        variant="outlined"
                        label={`Number of ${targetType}`}
                        onChange={changeNumberOfItemsHandler} />}

                {/* <input className='assortment-analyzer-options-item'
                    id="select-number-of-items"
                    label={`Number of ${targetType}`}
                    onChange={changeNumberOfItemsHandler}
                    value ={targetNumberOfItems}/> */}
                {(targetType === 'Date') &&
                    <DatePicker
                        label="Last Until End Of?"
                        views={['month', 'year']}
                        orientation="landscape"
                        value={targetLastTillDate}
                        onChange={changeLastTillDateHandler}
                    />}

            </div>

            <div className="assortment-analyzer-button-bar">
                <button className="do-something-button assort-theme" onClick={removeAllAssortedItemsClickHandler}>
                    Remove All Items
                </button>
                <button
                    className="do-something-button assort-theme"
                    onClick={calculateOrderQuantitiesHandler}
                > Calculate!</button>
                <div className="calculation-info-message">{calculationInfoMessage}</div>
            </div>

            {/* {analysisState &&
                <button onClick={handleEndAnalysisClick}>Close Assortment Analysis</button>} */}

            <div className='assortment-analyzer-list-window'>
                <div>{`Total ${(targetType === 'Units' ? 'Units':'Cases')} ordered: ${totalThings}`}</div>
                <div className="assortment-analyzer-list-container">
                    <ul className='assortment-analyzer-list'>
                        {productDataArray.map((product, index) => {
                            return (
                                <li
                                    key={product.CODE_NUM}
                                    id={`assortment-item-${product.INDEX}`}
                                >
                                    <button
                                        className="assortment-list-info assort-theme"
                                        onClick={(event) => showDetailsHandler(event, product.INDEX)}>
                                        {product["SIZE"]} {product["DESCRIP"]}, {product["QTY_CASE"]}/Case

                                    </button>
                                    <input
                                        type="number"
                                        name={`${index}`}
                                        label={`Ordering how many ${targetType}?`}
                                        className='case-order-amounts-input'
                                        min={0}
                                        onChange={changeOrderAmountHandler}
                                        value={productThingReorderAmounts[index] == null ? 0 : productThingReorderAmounts[index]}
                                    />
                                    {/* <div>{runoutTimeLabelArray[index]}</div> */}
                                    <div>{runoutTimeLabelArray[index]}</div>
                                    <button onClick={handleRemoveAssortmentItem} className="assortment-analyzer-list-delete">Remove</button>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>
            {/* {!analysisState &&
                <div> Nothing Being Analyzed </div>} */}

        </div>
    )
}