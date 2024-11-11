import { TextField, RadioGroup, FormControl, FormLabel, FormControlLabel, Radio } from '@mui/material';
import { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker'; // Correct import
import dayjs from 'dayjs';
import { format, differenceInDays, differenceInWeeks } from 'date-fns';
import { monthsFromNowToDBFFileMonthName } from '../data/constants';
import { SimpleProduct } from './ProductDisplayItem';
import { Unstable_NumberInput as NumberInput } from '@mui/base';
import { styled } from '@mui/system';
const StyledNumberInput = styled(NumberInput)


export function AssortmentAnalyzerWindow({
    data,
    productIndicesToAnalyze,
    importSelectionToAssortmentAnalyzerHandler,
    handleRemoveAssortmentItem,
    showDetailsHandler }) {
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
    const [targetType, setTargetType] = useState('Cases'); // cases or units
    const [targetLastTillDate, setTargetLastTillDate] = useState(todayDayjs.add(1, 'year')); // How long you wish the supply to last
    const [analysisMethod, setAnalysisMethod] = useState('previous-year'); // previous-year, year-to-date, last-three-months

    const [productThingReorderAmounts, setProductThingReorderAmounts] = useState([]);
    const [calculationInfoMessage, setCalculationInfoMessage] = useState("");


    const productDataArray = [];


    for (let i = 0; i < productIndicesToAnalyze.length; i++) {
        productDataArray[i] = data[productIndicesToAnalyze[i]];

    }




    const extrapolateMonthlySales = (product, m) => {
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

    const getLastTwelveMonthSales = (product) => {
        let sum = 0;
        for (let i = 1; i <= 12; i++) {
            sum += extrapolateMonthlySales(product, i);
        }
        return sum;
    }

    const calculateReorderPoint = (product, numThingsOrdered) => {

        // based on the product case amounts ordered which is a state


        if (!suppressOutput) {
            //console.log("Entered calculateReorderPoint");
            //console.log(`numThingsOrdered = ${numThingsOrdered}, product is: `);
            //console.log(product);
        }




        let thingsUnsold = product.QTY_ON_HND;
        let reorderMonth = -1;

        if (getLastTwelveMonthSales(product) === 0) {
            return 'No Sales Projected';
        } else if (thingsUnsold === 0) {
            reorderMonth = 0;
        } else {
            // Set to zero if no data
            if (numThingsOrdered === undefined || numThingsOrdered === null) {
                numThingsOrdered = 0;
            }


            thingsUnsold += targetType === 'Cases' ? product.QTY_CASE * numThingsOrdered : numThingsOrdered;


            while (thingsUnsold >= 0) {
                reorderMonth++;
                thingsUnsold -= extrapolateMonthlySales(product, reorderMonth);

            }
            reorderMonth = Math.max(reorderMonth, 0);
        }


        // we sell out DURING month= reorderMonth. We can reorder then at the beginning of the month of the return date
        const reorderDate = new Date(todayDate.getFullYear(), todayDate.getMonth() + reorderMonth);
        const reorderTimeWeeks = Math.max(differenceInWeeks(reorderDate, todayDate), 0);
        return [reorderDate, reorderTimeWeeks];
    }


    const changeNumberOfItemsHandler = (e) => {

        setTargetNumberOfItems(e.target.value);
    }

    const changeLastTillDateHandler = (date) => {
        if (!suppressOutput) {
            console.log(`changing the date, e.target  is: `);
            console.log(typeof date);
        }
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
            if (getLastTwelveMonthSales(productDataArray[i]) <= 0){
                return `One of the products has no project sales: please remove ${productDataArray[i].DESCRIP}  ${productDataArray[i].SIZE}.`;
            }
        }
        return null;
    }


    const getOrderQuantities = () => {
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

        // // returns an array of number of things to be ordered
        const orderProductsArray = [];
        // Iterative Algorithm:

        // 1: Initialize. 
        //         Buy approximately the same number of each type of good and calculate the t values for each one
        //         Initialize a variable called diff which willbe how much to add or subtract from different amounts. Default is just 1.
        // 2. iF the variance of the time array is large: 
        // Find the the one that will last the longest. Subtract "diff" amount of things from that one, and add the same amount to the 
        // item with the smallest time (watch for ties, choose smallest index). Recaculate the t array. 

        const numProducts = productDataArray.length;
        switch (targetType) {
            case 'Cases': {
                // Initialize p array: 
                console.log("Beginning Order Iterative Calculation");
                const initialCaseAmt = Math.floor(targetNumberOfItems / numProducts);
                let totalThingsLeft = Number(targetNumberOfItems);
                for (let i = 0; i < numProducts - 1; i++) {
                    orderProductsArray[i] = initialCaseAmt;
                    totalThingsLeft -= initialCaseAmt;
                }
                orderProductsArray[numProducts - 1] = totalThingsLeft;

                break;
            }
            default:
                console.log("targettype is wrong.");
        }

        // Get the initial time array values
        let timeArrayInWeeks = getTimeArrayFromOrderNumbers(productDataArray, orderProductsArray);

        // Iterative Algorithm: 

        // while max and min timarray are not within 45 days
        const timeMaxMinEndConditionWeeks = 4;
        let diff = 1;

        let mxIndex = getPseudoMaxIndex(timeArrayInWeeks, orderProductsArray, diff);
        let mnIndex = getMinIndex(timeArrayInWeeks);


        console.log("Time Array: ");
        console.log(timeArrayInWeeks);
        console.log("Order Products: ");
        console.log(orderProductsArray);

        while (timeArrayInWeeks[mxIndex] - timeArrayInWeeks[mnIndex] > timeMaxMinEndConditionWeeks) {
            // Subtract diff from the index of the productorder array that is the max, and add it to the minimum

            orderProductsArray[mxIndex] -= diff;
            orderProductsArray[mnIndex] += diff;
            // recalculate time array: 

            timeArrayInWeeks = getTimeArrayFromOrderNumbers(productDataArray, orderProductsArray);
            console.log("----New Time Array: ");
            console.log(timeArrayInWeeks);
            console.log("--------------Order Products: ");
            console.log(orderProductsArray);
            // Recalculate the new max and mins
            mxIndex = getPseudoMaxIndex(timeArrayInWeeks, orderProductsArray, diff);
            mnIndex = getMinIndex(timeArrayInWeeks);
            console.log(`Recalculated pseudo min/max: max: ${mxIndex} and min: ${mnIndex}`);

        }
        console.log("Setting Order Amount States::");
        setProductThingReorderAmounts(orderProductsArray);


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

    const getTimeArrayFromOrderNumbers = (productDataList, orderProductsArray) => {
        const timeArrayDays = [];
        for (let p = 0; p < productDataList.length; p++) {
            const reorderPt = calculateReorderPoint(productDataList[p], orderProductsArray[p])[1];
            timeArrayDays[p] = typeof reorderPt !== 'string' ? reorderPt : 0;
        }
        return timeArrayDays;
    }

    const runoutTimeLabelArray = [];

    for (let i = 0; i < productIndicesToAnalyze.length; i++) {
        const reorderPoint = calculateReorderPoint(productDataArray[i], productThingReorderAmounts[i]);
        let runoutLabel;
        if (typeof reorderPoint === 'string') {
            runoutLabel = reorderPoint;
        } else {
            runoutLabel = `...runs out during ${format(reorderPoint[0], 'M/yyyy')}`;
        }

        runoutTimeLabelArray[i] = runoutLabel;
    }


    if (!suppressOutput) {
        console.log("Rerendering The Analyzer Window");
        console.log("Case Order Number Array (productCaseAmounts) is: ");
        console.log(productThingReorderAmounts)
        console.log("productDataArray is");
        console.log(productDataArray);
        console.log("productIndicesToAnalyze is");
        console.log(productIndicesToAnalyze);
    }
    return (
        <div className='assortment-analyzer-main-window'>
            <h2>Assorted Ordering Tool</h2>
            <div className="assortment-analyzer-button-bar">
                <button
                    className="assortment-analyzer-button"
                    onClick={importSelectionToAssortmentAnalyzerHandler}
                >Import Selection!
                </button>

            </div>



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
                    </RadioGroup>
                </FormControl>
                <TextField
                    className='assortment-analyzer-options-item'
                    id="select-number-of-items"
                    variant="outlined"
                    label={`Number of ${targetType}`}
                    onChange={changeNumberOfItemsHandler} />
                <DatePicker
                    label="Last Until End Of?"
                    views={['month', 'year']}
                    orientation="landscape"
                    value={targetLastTillDate}
                    onChange={changeLastTillDateHandler}
                />
            </div>
            <div className="calculate-bar">
                <button
                    className="assortment-analyzer-calculate-button"
                    onClick={getOrderQuantities}
                > Calculate!</button>
                <div className ="calculation-info-message">{calculationInfoMessage}</div>
            </div>
            {/* {analysisState &&
                <button onClick={handleEndAnalysisClick}>Close Assortment Analysis</button>} */}

            <div className='assortment-analyzer'>
                <div>{`Total ${targetType} selected: ${productThingReorderAmounts.reduce((accumulator, currentValue) => accumulator + currentValue, 0)}/${targetNumberOfItems}`}</div>
                <ul className='assortment-analyzer-list'>
                    {productDataArray.map((product, index) => {
                        return (
                            <li
                                key={product.CODE_NUM}
                                id={`assortment-item-${product.INDEX}`}
                            >
                                <SimpleProduct
                                    productData={product}
                                    clickHandler={showDetailsHandler} />
                                <input
                                    type="text"
                                    name={`${index}`}
                                    label={`Ordering how many ${targetType}?`}
                                    onChange={changeOrderAmountHandler}
                                    value={productThingReorderAmounts[index] == null ? 0 : productThingReorderAmounts[index]}
                                />
                                <div>{runoutTimeLabelArray[index]}</div>
                                <button onClick={handleRemoveAssortmentItem}>Delete</button>
                            </li>
                        )
                    })}
                </ul>

            </div>
            {/* {!analysisState &&
                <div> Nothing Being Analyzed </div>} */}

        </div>
    )
}