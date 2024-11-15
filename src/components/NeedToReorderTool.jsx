
import { calculateReorderPointFromQuantity } from '../helper-fns/helperFunctions';
import {ReorderListDisplayItem} from './ReorderListDisplayItem';
export function NeedToReorderTool({ 
    data,
    addToOrderListHandler,
    addToOutOfStockHandler,
    addToDiscontinuedHandler,
    markAlreadyOrderedHandler,
    showProductDetailsHandler

 }) {

    const [searchPageNumber, setSearchPageNumber] = useState(1); // 1 indexed
    const [reorderItemsList, setReorderItemsList] = useState([]);  // Array of: { index: type int, reorderDate: type Date, reorderTimeWeeks: type int }
  
    const itemsPerPage = 10;

    const lastPage = Math.ceil(searchDisplayItemsArray.length / itemsPerPage);

    const nextPageHandler = () => {
        setSearchPageNumber(Math.min(searchPageNumber + 1, lastPage));
    }
    const prevPageHandler = () => {
        setSearchPageNumber(Math.max(searchPageNumber - 1, 1));
    }




    const getReorderListHandler = () => {


        // 1: Filter the data to just get products that have a YTD > 0

        console.log("Filtering by YTD and by MTD");
        const filteredData = data.filter(element => element.YTD > 0).filter(element => element.MTD > 0);
        console.log("filteredData is: ");
        console.log(filteredData);

        // 2: Make an array of the product INDEX and runout dates objects
        const itemArray = new Array(filteredData.length);


        console.log("Starting Calculation of all reorder dates");
        for (let i = 0; i < itemArray.length; i++) {
            //console.log(`Calculating Item ${i}`);
            //console.log(filteredData[i]);
            const reorderResult = calculateReorderPointFromQuantity(filteredData[i],
                filteredData[i].QTY_ON_HND, 'previous-year');
            if (typeof reorderResult !== 'string') {
                itemArray[i] = { index: filteredData[i].INDEX, reorderDate: reorderResult[0], reorderTimeWeeks: reorderResult[1] };
            } else {
                itemArray[i] = { index: filteredData[i].INDEX, reorderDate: null, reorderTimeWeeks: null };
            }

            if (i % 50 === 0) {
                console.log(`Calculated Item ${i}`);
            }
        }
        console.log("Finished calculating all reorder dates");
        console.log("itemArray is: ");
        console.log(itemArray);

        itemArray.sort((a, b) => a.reorderTimeWeeks - b.reorderTimeWeeks);
        console.log("Finished sorting by reorder dates");

        console.log("Resultant array (reorderResult):");
        console.log(itemArray);

        // 4. sort the array of objects by reorder dates

        // 5. Display the first N number of objects in the window with a page change button, 
        //    with each item's info plus its run out date and 
        // return: an array of integers ordered by how soon
        //         the product will sell out. 

        const numWeeksReorderFilter = 6;
        const finalFilteredData = itemArray.filter(element => element.reorderTimeWeeks < numWeeksReorderFilter);
        console.log("finalFilteredData:");
        console.log(finalFilteredData);

        console.log("About to print product data:");
        for (let i = finalFilteredData.length - 1; i > -1; i--) {
            const product = data[finalFilteredData[i].index];
            console.log(`${i}: ${product.BRAND} ${product.DESCRIP} ${product.SIZE} QTY: ${product.QTY_ON_HND} lasts ${finalFilteredData[i].reorderTimeWeeks}`)
        }

        setReorderItemsList(finalFilteredData);

    }

    return (
        <div className="need-to-reorder-window">
            <h2>Ordering Tool</h2>
            <div className="need-to-reorder-button-bar">
                <button onClick={getReorderListHandler}>Get Top Reorder Items</button>
                {(reorderItemsList !== null) &&
                    <div className="page-turn-div">

                        <button onClick={prevPageHandler}> {'<'} </button>
                        <button onClick={nextPageHandler}> {'>'} </button>
                        <p>{`Page ${searchPageNumber}/${Math.ceil(setReorderItemsIndexList.length / itemsPerPage)}`}</p>

                    </div>}
            </div>
            <div className='reorder-list-grid'>
                {(reorderItemsList !== null) &&
                    reorderItemsList.map((item, index) => {
                        const product = data[item.index];
                        return (
                            <ReorderListDisplayItem 
                                key = {index}
                                product = {product}
                                reorderDate = {item.reorderDate}
                                reorderTime = {item.reorderTimeWeeks}
                                addToOrderListHandler = {addToOrderListHandler}
                                addToOutOfStockHandler = {addToOutOfStockHandler}
                                addToDiscontinuedHandler = {addToDiscontinuedHandler}
                                markAlreadyOrderedHandler = {markAlreadyOrderedHandler}
                                showProductDetailsHandler = {showProductDetailsHandler}
                            />
                        )
                    })}
            </div>

        </div>
    )
}