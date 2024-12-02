


import { calculateReorderPointFromQuantity, calculateAverageMonthlySales } from '../helper-fns/helperFunctions';
import { ReorderListDisplayItem } from './ReorderListDisplayItem';
import { ReorderListHeader } from './ReorderListHeader'
import { printArrayToString } from '../helper-fns/helperFunctions';
import { useRef, useEffect, useState } from "react"; // Import useRef
import { barChartOptions } from '../data/constants';

export function NeedToReorderTool({
    data,
    reorderItemsList,
    reorderItemsFocusedProduct,
    setReorderItemsFocusedProduct,
    setReorderItemsList,
    removeFromReorderItemsListHandler,
    reorderToolPageNumber,
    setReorderToolPageNumber,
    addToListHandlers,
    listStates,
    showProductDetailsHandler

}) {

    const suppressOutput = true;

    const listOfRefs = useRef([]);
    const [focusedIndex, setFocusedIndex] = useState(0);
    const itemsPerPage = 21;
    const lastPage = reorderItemsList.length > 0 ? Math.ceil(reorderItemsList.length / itemsPerPage) : 1;

    // Function to handle keydown event
    const handleKeyDown = (e) => {
        if (e.key === "ArrowDown") {
            // If this is the last element, 
            if (focusedIndex + 1 > listOfRefs.current.length - 1) {
                //move to the next page.
                nextPageHandler();
               
            } else {
                // Move focus to the next element
                setFocusedIndex((prevIndex) => Math.min(prevIndex + 1, listOfRefs.current.length - 1));
            }
        } else if (e.key === "ArrowUp") {
            // Move focus to the previous element unless its the first element, then try previous page
            if (focusedIndex - 1 < 0 && reorderToolPageNumber !== 1 ){               
                //move to the next page.
                prevPageHandler(itemsPerPage-1);                

            } else {
            setFocusedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
        }
        } else if (e.key === "ArrowRight") {
            // Move focus to the previous element unless its the first element, then try previous page
            if (reorderToolPageNumber !== lastPage ){               
                //move to the next page.
                nextPageHandler(focusedIndex);               

            } 
        } else if (e.key === "ArrowLeft") {
            // Move focus to the previous element unless its the first element, then try previous page
            if (reorderToolPageNumber !== 1 ){               
                //move to the next page.
                prevPageHandler(focusedIndex);             

            } 
        }
    };

    // useEffect(() => {
    //     // Add event listener for keydown
    //     window.addEventListener("keydown", handleKeyDown);

    //     return () => {
    //         // Cleanup event listener on unmount
    //         window.removeEventListener("keydown", handleKeyDown);
    //     };
    // }, []);

    useEffect(() => {
        // Focus the element at the focused index
        if (listOfRefs.current[focusedIndex]) {
            listOfRefs.current[focusedIndex].focus();
        }
    }, [focusedIndex,reorderToolPageNumber]);




   

    const nextPageHandler = (itemIndex = 0) => {
        setReorderToolPageNumber(Math.min(reorderToolPageNumber + 1, lastPage));
        setFocusedIndex(itemIndex);
    }
    const prevPageHandler = (itemIndex = 0) => {
        setReorderToolPageNumber(Math.max(reorderToolPageNumber - 1, 1));
        setFocusedIndex(itemIndex);
    }


    const getReorderListHandler = () => {


        // 1: Filter the data to just get products that have a YTD > 0
        if (!suppressOutput) {
            console.log("Filtering by YTD and by MTD");
        }

        // Filter Out What is Already On Certain Lists: c
        const allExcludedLists = [...new Set([...listStates.orderList,
        ...listStates.alreadyOrderedList,
        ...listStates.discontinuedList,
        ...listStates.outOfStockList,
        ...listStates.watchList])];

        const filteredOutListsData = data.filter(element => !allExcludedLists.includes(element.INDEX));
        // filter(element => !listStates.discontinuedList.includes(element.INDEX)).
        // filter(element => !listStates.alreadyOrderedList.includes(element.INDEX));

        const filteredData = filteredOutListsData.filter(element => (element.YTD > 0) && (element.MTD > 0));


        if (!suppressOutput) {
            console.log("filteredData is: ");
            console.log(filteredData);
        }
        // 2: Make an array of the product INDEX and runout dates objects
        const itemArray = new Array(filteredData.length);

        if (!suppressOutput) {
            console.log("Starting Calculation of all reorder dates");
        }
        for (let i = 0; i < itemArray.length; i++) {
            //console.log(`Calculating Item ${i}`);
            //console.log(filteredData[i]);
            const prod = filteredData[i];
            const reorderResult = calculateReorderPointFromQuantity(prod,
                prod.QTY_ON_HND, 'previous-year');
            const averageMonthlySales = calculateAverageMonthlySales(prod);
            if (typeof reorderResult !== 'string') {
                itemArray[i] = { index: prod.INDEX, reorderDate: reorderResult[0], reorderTimeWeeks: reorderResult[1], averageMonthlySales: averageMonthlySales };
            } else {
                itemArray[i] = { index: prod.INDEX, reorderDate: null, reorderTimeWeeks: null, averageMonthlySales: null };
            }

            if (i % 50 === 0) {
                if (!suppressOutput) {
                    console.log(`Calculated Item ${i}`);
                }
            }
        }
        if (!suppressOutput) {
            console.log("Finished calculating all reorder dates");
            console.log("itemArray is: ");
            console.log(itemArray);
        }
        // Order The List
        itemArray.sort((a, b) => a.reorderTimeWeeks === b.reorderTimeWeeks ? b.averageMonthlySales - a.averageMonthlySales : a.reorderTimeWeeks - b.reorderTimeWeeks);

        if (!suppressOutput) {
            console.log("Finished sorting by reorder dates");

            console.log("Resultant array (reorderResult):");
            console.log(itemArray);
        }
        // 4. sort the array of objects by reorder dates

        // 5. Display the first N number of objects in the window with a page change button, 
        //    with each item's info plus its run out date and 
        // return: an array of integers ordered by how soon
        //         the product will sell out. 

        const numWeeksReorderFilter = 6;
        const finalFilteredData = itemArray.filter(element => element.reorderTimeWeeks < numWeeksReorderFilter);
        if (!suppressOutput) {
            console.log("finalFilteredData:");
            console.log(finalFilteredData);
            console.log("About to print product data:");
        }

        if (!suppressOutput) {
            for (let i = finalFilteredData.length - 1; i > -1; i--) {
                const product = data[finalFilteredData[i].index];

                console.log(`${i}: ${product.BRAND} ${product.DESCRIP} ${product.SIZE} QTY: ${product.QTY_ON_HND} lasts ${finalFilteredData[i].reorderTimeWeeks}`)

            }
        }
        setReorderItemsList(finalFilteredData);


    }


    const handleFocus = (event, productIndex, listIndex) => {
        console.log(`Product of Index ${productIndex} is focused!`);
        setFocusedIndex(listIndex);
        setReorderItemsFocusedProduct(productIndex);
        showProductDetailsHandler(event, productIndex);
    }

    useEffect(() => {
        // Automatically focus the component when it mounts
        if (listOfRefs.current.length > 0) {
            listOfRefs.current[0].focus();
        }
    }, [reorderItemsList]);

    let thisPageResult;
    if (reorderItemsList.length > 0) {
        thisPageResult = reorderItemsList.slice((reorderToolPageNumber - 1) * itemsPerPage, (reorderToolPageNumber) * itemsPerPage);
    } else {
        thisPageResult = [];
    }


    if (!suppressOutput) {
        printArrayToString('This Pages Items', thisPageResult);
    }


    return (
        <div className="need-to-reorder-window">

            <div className="need-to-reorder-button-bar">
                <h2>Ordering Tool</h2>
                <button
                    onClick={getReorderListHandler}
                    className="calculate-reorder-items-button">Get Top Reorder Items</button>
                {(reorderItemsList !== null) &&
                    <div className="page-turn-div">

                        <button onClick={prevPageHandler} className="left-right-arrow">Previous</button>
                        <button onClick={nextPageHandler} className="left-right-arrow">Next</button>
                        <p>{`Page ${reorderToolPageNumber}/${lastPage}`}</p>

                    </div>}
            </div>
            <table className="large-table-style">
                <thead>
                    <tr tabIndex="0" >

                        <th>Brand</th>
                        <th>Description</th>
                        <th>Size</th>
                        <th>QTY</th>
                        <th>Reorder Date</th>
                        <th>Weeks of Item Left</th>
                        <th>MTD</th>
                        <th>{barChartOptions[13].xlabel.toUpperCase()}</th>
                        <th>{barChartOptions[12].xlabel.toUpperCase()}</th>


                    </tr>
                </thead>
                <tbody>
                    {(reorderItemsList !== null && reorderItemsList.length > 0) &&
                        <>

                            {thisPageResult.map((item, index) => {
                                const product = data[item.index];

                                return (
                                    <ReorderListDisplayItem
                                        key={index}
                                        listIndex={index}
                                        refList={listOfRefs}
                                        handleFocus={handleFocus}
                                        product={product}
                                        reorderDate={item.reorderDate}
                                        reorderTime={item.reorderTimeWeeks}
                                        handleKeyDown={handleKeyDown}
                                    />
                                )
                            })}
                        </>

                    }
                </tbody>

            </table>
            {(data.length < 1) && <p> No Data </p>

            }



        </div>
    )
}