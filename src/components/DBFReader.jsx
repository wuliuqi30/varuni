
import { useEffect, useState, useMemo, useRef } from 'react';
import trie from 'trie-prefix-tree';
import { SmallSearchWindow } from './SmallSearchWindow';
import { SearchWindow } from './SearchWindow'
import { CurrentSelection } from './CurrentSelection';
import { ProductDetailsPanel } from './ProductDetailsPanel';
import { OrderListDisplay } from './OrderListDisplay';
import { ListDisplays } from './ListDisplays'
import { AssortmentAnalyzerWindow } from './AssortmentAnalyzerWindow';
import { webpageSelectionEnums } from '../data/constants';
import { NeedToReorderTool } from './NeedToReorderTool';
import { printArrayToString, removeTrailingSlash } from '../helper-fns/helperFunctions'
import { TextInputModal } from './TextInputModal'
import { readDbfFile } from './readDbfFile'

const DBFReaderComponent = () => {

    const suppressOutput = false;
    if (!suppressOutput) {
        console.log("Entering DBF Reader Component");
        console.log(process.env.NODE_ENV);
    }

    // -----------------State Information -----------------------

    // Initial Page Load
    const [initialPageLoadComplete, setInitialPageLoadComplete] = useState(false);

    // Data: 
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
 
    // List Data
    const [listDataMessage, setListDataMessage] = useState("");


    // Page View: 
    const [webpageSelection, setWebpageSelection] = useState(webpageSelectionEnums.home);

    // Search: 
    const [searchBarValue, setSearchBarValue] = useState(null);
    const [searchResult, setSearchResult] = useState([]);
    const [alphabetTrie, setAlphabetTree] = useState(trie([]));
    const [searchPageNumber, setSearchPageNumber] = useState(1); // 1 indexed.


    // Selected Products From Search: Stores the product.INDEX of the selected products
    const [selectedProductsList, setSelectedProductsList] = useState([]);

    // Assorted Products Analyzer Tool
    const [assortmentAnalyzerProductList, setAssortmentAnalyzerProductList] = useState([]);

    // Details Panel
    const [viewDetailsProductList, setViewDetailsProductList] = useState([]);

    // Reorder Tool States: 
    const [reorderItemsList, setReorderItemsList] = useState([]);  // Array of: { index: type int, reorderDate: type Date, reorderTimeWeeks: type int }
    const [reorderToolPageNumber, setReorderToolPageNumber] = useState(1); // 1 indexed

    const [orderList, setOrderList] = useState([]);
    const orderListScrollRef = useRef(null);

    const [outOfStockList, setOutOfStockList] = useState([]);
    const [discontinuedList, setDiscontinuedList] = useState([]);
    const [alreadyOrderedList, setAlreadyOrderedList] = useState([]);





    // ----------------- Loading and Reading DBF file -----------------------
    const readFileFromHardCodedFileLocation = async () => {
        try {

            // console.log(`Entered readFileFromUserProvidedFileLocation and using ${folderPath} as folder path.`);
            // const cleanedPath = removeTrailingSlash(folderPath);
            // console.log(`After removing possible trailing slashes: ${cleanedPath}`)
            // const filePath = cleanedPath + '/data.dbf';

            const filePath = 'data/currentdata/data.dbf';
            console.log("Reading data at filePath:", filePath);
            // Fetch the file from the path
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Failed to fetch file: ${response.statusText}`);
            }
            const buffer = await response.arrayBuffer();


            const dataRecords = readDbfFile(buffer);


            // const view = new DataView(buffer);


            // const headerHeaderLength = 32;
            // const fieldDescriptorSize = 32;
            // const year = view.getUint8(1) + 2000; // Add 1900 to the YY value
            // const month = view.getUint8(2);        // Get the MM value
            // const day = view.getUint8(3);          // Get the DD value

            // const numRecords = view.getInt32(4, true);
            // const headerSize = view.getInt16(8, true); // Header size
            // const recordLength = view.getInt16(10, true); // Record length
            // const shouldBeZero = view.getInt16(12, true); // Record length


            // const fields = [];
            // let currentOffset = 0
            // for (let i = headerHeaderLength; i < headerSize; i += fieldDescriptorSize) {

            //     const fieldName = String.fromCharCode.apply(null, new Uint8Array(buffer, i, 11)).replace(/[\u0000\u0001\u00FF]/g, '');
            //     const fieldType = String.fromCharCode(view.getUint8(i + 11));
            //     const fieldLength = view.getUint8(i + 16); //
            //     //console.log(`i is ${i}, fieldName ${fieldName}, fieldType ${fieldType} fieldLength: ${fieldLength}`);
            //     if (fieldName === '') break; // End of fields
            //     if (fieldType == '5') break;
            //     fields.push({ name: fieldName, type: fieldType, length: fieldLength, offset: currentOffset });
            //     currentOffset += fieldLength;
            // }

            // console.log("Fields: ");
            // console.log(fields);

            // // Read records
            // const records = [];
            // //console.log(`headerSize ${headerSize}, buffer.byteLength ${buffer.byteLength} and recordLength ${recordLength}`);
            // let count = 0;
            // for (let i = headerSize; i < buffer.byteLength; i += recordLength) {
            //     //console.log(`in for loop for records, i: ${i})`);

            //     const record = {};
            //     for (const field of fields) {
            //         //console.log('field:');
            //         //console.log(field);
            //         const fieldValue = readFieldValue(view, i, field, count);
            //         //console.log(`fieldValue is ${fieldValue} field.name is ${field.name}`);
            //         record[field.name] = fieldValue;
            //     }

            //     records.push(record);
            //     record["INDEX"] = count;
            //     // if (count > 400) {
            //     //     break;
            //     // }
            //     count++;

            // }
            // records.pop();
            // setData(records);
            // console.log("Obtained Records: ");
            // console.log(records);
            setData(dataRecords);
            console.log("-------Finished Reading Data------------");


        } catch (err) {
            console.error("Error reading file:", err.message);
            setError('Error reading DBF file: ' + err.message);
        }
    }

    const clickDataFileInputHandler = () => {
        document.getElementById("data-file-upload").click();
    }

    const readFileFromSelectedFileLocation = async (event) => {

        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {

                const buffer = e.target.result;   
                const dataRecords = readDbfFile(buffer);


                setData(dataRecords);
                console.log("-------Finished Reading Data------------");


            } catch (err) {
                console.error("Error reading file:", err.message);
                setError('Error reading DBF file: ' + err.message);
            }
        }

        console.log("About to call reader.readAsArrayBuffer(file);");
        reader.readAsArrayBuffer(file); // Read the file as an ArrayBuffer
    }



    // ----------------- Loading and Reading OrderList File-----------------------


    const clickListFileInputHandler = () => {
        document.getElementById("list-file-upload").click();
    }

    const readListDataFromLocalStorageFileHandler = () => {

        const listData = localStorage.getItem('torchwoodListData');

        if (listData !== null) {
            const jsonObject = JSON.parse(listData);

            console.log("Got List Data jsonObject From Local Storage:", jsonObject);
            setOrderList(jsonObject.orderlist);
            setOutOfStockList(jsonObject.outOfStockList);
            setDiscontinuedList(jsonObject.discontinuedList);
            setAlreadyOrderedList(jsonObject.alreadyOrderedList);
            console.log("-------Finished Reading List Data File------------");
            setListDataMessage("Read List Data from Local Storage");

        } else {
            setListDataMessage("No List Data File Found, please click 'Choose List File' button");
        }
    }

    const handleListFileChange = async (event) => {

        const file = event.target.files[0];
        if (!file) return;

        try {

            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const targetResult = e.target.result;
                    const listData = JSON.parse(targetResult);

                    console.log("Got List Data:", listData);
                    if (listData.orderlist) {
                        setOrderList(listData.orderlist);
                    } else {
                        console.log("No order list data in file");
                    }
                    if (listData.outOfStockList) {
                        setOutOfStockList(listData.outOfStockList);
                    } else {
                        console.log("NooutOfStockList data in file");
                    }
                    if (listData.discontinuedList) {
                        setDiscontinuedList(listData.discontinuedList);
                    } else {
                        console.log("No discontinuedListdata in file");
                    }
                    if (listData.alreadyOrderedList) {
                        setAlreadyOrderedList(listData.alreadyOrderedList);
                    } else {
                        console.log("No alreadyOrderedList data in file");
                    }



                    console.log("-------Finished Reading List Data File------------");
                } catch (err) {
                    console.error("Error parsing JSON:", err.message);
                }
            }

            // Read the file as text
            reader.readAsText(file);

        } catch (err) {
            console.error("Error Reading order list file:", err.message);

        }



    }

    const saveArraysToLocalStorage = () => {

        const listsSaveJSON = {
            orderlist: orderList,
            outOfStockList: outOfStockList,
            discontinuedList: discontinuedList,
            alreadyOrderedList: alreadyOrderedList
        }
        localStorage.setItem('torchwoodListData', JSON.stringify(listsSaveJSON));

    }

    const saveListDataToFileHandler = () => {

        const listsSaveJSON = {
            orderlist: orderList,
            outOfStockList: outOfStockList,
            discontinuedList: discontinuedList,
            alreadyOrderedList: alreadyOrderedList
        }
        const blob = new Blob([JSON.stringify(listsSaveJSON, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = 'listdata.json';
        link.click();
        URL.revokeObjectURL(url);

        // After saving to a data file, also save to local storage
        saveArraysToLocalStorage();
    }

    // --------------------------Create Hashmaps: -----------------------
    // Create the hash maps only once (or when `products` changes)
    const { productsByCodeNum, productsByBrand, productsByDescription } = useMemo(() => {
        const byCodeNum = new Map();
        const byBrand = new Map();
        const byDescription = new Map();


        // returns the indices in the data array, not the products themselves.
        data.forEach(product => {

            byCodeNum.set(product.CODE_NUM, product.INDEX);

            if (!byBrand.has(product.BRAND)) {
                byBrand.set(product.BRAND, []);
                setAlphabetTree(alphabetTrie.addWord(product.BRAND));

            }
            // Add this product to this brand array. 
            byBrand.get(product.BRAND).push(product);

            if (!byDescription.has(product.DESCRIP)) {
                byDescription.set(product.DESCRIP, []);
            }
            // add this product to the description array
            byDescription.get(product.DESCRIP).push(product.INDEX);
        });

        // Sort products within each brand by DESCRIP
        byBrand.forEach((products) => {
            products.sort((a, b) => a.DESCRIP.localeCompare(b.DESCRIP));
        });

        // Map the sorted products to indices for byBrand
        const productsByBrand = new Map(
            Array.from(byBrand.entries()).map(([brand, products]) => [
                brand,
                products.map(product => product.INDEX),
            ])
        );

        return { productsByCodeNum: byCodeNum, productsByBrand, productsByDescription: byDescription };
    }, [alphabetTrie, data]);

    // Automatically show some data
    useEffect(() => {
        searchForProductByBrandHandler('A');
    }, [productsByCodeNum])

    // Now you can use these maps for lookups within the component
    const getProductIndicesByCode = (code) => productsByCodeNum.get(code);
    const getProductIndicesByBrand = (brand) => productsByBrand.get(brand) || [];


    //------------Main Display Selection Handlers ------------------

    const selectMainDisplayHandler = () => {
        setWebpageSelection(webpageSelectionEnums.home);
    }

    const selectAssortmentDisplayHandler = () => {
        setWebpageSelection(webpageSelectionEnums.assortmentTool);
    }

    const selectOrderingToolDisplayHandler = () => {
        setWebpageSelection(webpageSelectionEnums.orderingTool);
    }


    // -----------------Search Stuff -----------------------

    const changeSearchHandler = (e) => {
        const upperCaseVal = e.target.value.toUpperCase();
        searchForProductByBrandHandler(upperCaseVal);
        //console.log("Setting Search Bar Value");
        setSearchBarValue(upperCaseVal);
    }


    const searchForProductByBrandHandler = (term) => {

        if (term.trim() === "") {
            return;
        }

        const trieResultArray = alphabetTrie.getPrefix(term);


        let newSearchResultArray = [];
        for (let i = 0; i < trieResultArray.length; i++) {
            const thisTreeString = trieResultArray[i].toUpperCase();

            const allProductsForThisBrand = getProductIndicesByBrand(thisTreeString);

            newSearchResultArray.push(...allProductsForThisBrand);
        }

        setSearchResult(newSearchResultArray);

    };


    const handleCheckBoxClick = (e, productIndex) => {
        //e.stopPropagation();

        if (selectedProductsList === null) {
            return;
        }


        if (!selectedProductsList.find(item => item === productIndex)) {
            setSelectedProductsList((prevList) => { return [...prevList, productIndex] });
        } else {
            setSelectedProductsList((prevList) => { return prevList.filter(item => item !== productIndex) });
        }


    }

    const handleUncheckAllClick = () => {
        setSelectedProductsList([]);
    }





    // -------------------Product Details Handler ----------------------

    const showProductDetailsHandler = (e, productIndex) => {

        setViewDetailsProductList([productIndex]);
    };

    const clearProductDetailsPanelHandler = () => {
        setViewDetailsProductList([]);
    }

    const removeProductDetailsHandler = (e) => {

        const parent = e.target.closest('li');
        const idstring = "product-details-item-";
        const productIndex = Number(parent.getAttribute('id').substring(idstring.length));

        setViewDetailsProductList((prevList) => { return prevList.filter(element => element !== productIndex) });

    }



    // ------------------ Assortment Tool--------------------

    const importSelectionToAssortmentAnalyzer = () => {

        // if nothing selected, do nothing
        if (selectedProductsList.length < 1) {
            return;
        }

        // import any products that are NOT already in the assortment analysze list from the selection list into the assortment analyzer list


        let itemsToAdd = [];
        selectedProductsList.forEach(item => {
            if (!assortmentAnalyzerProductList.includes(item)) {
                itemsToAdd.push(item);
            }
        })

        setAssortmentAnalyzerProductList((prevArray) => [...prevArray, ...itemsToAdd]);
    }

    const handleRemoveAssortmentItem = (e) => {
        e.stopPropagation();

        const parent = e.target.closest('li');
        const idstring = "assortment-item-";
        const productIndex = Number(parent.getAttribute('id').substring(idstring.length));

        setAssortmentAnalyzerProductList((prevList) => { return prevList.filter(element => element !== productIndex) });

    }

    const removeAllAssortedItemsHandler = () => {
        setAssortmentAnalyzerProductList([]);

    }


    //----------------------------- Reorder Tool ----------------------

    const removeFromReorderItemsListHandler = (e, productIndex) => {
        console.log(`removing product: ${productIndex}`);

        const newList = reorderItemsList.filter(item => item.index !== productIndex);
        setViewDetailsProductList([newList[0].index]);
        setReorderItemsList(newList);

    }

    const handleAddToOrderListClick = (e, productIndex) => {

        if (!orderList.includes(productIndex)) {
            setOrderList((prevArray) => [...prevArray, productIndex]);
            if (orderListScrollRef.current) {
                orderListScrollRef.current.scrollTop = orderListScrollRef.current.scrollHeight;
            }
        }

    };

    const handleAddToOutOfStockListClick = (e, productIndex) => {

        if (!outOfStockList.includes(productIndex)) {
            setOutOfStockList((prevArray) => [...prevArray, productIndex]);
        }

    };

    const handleAddToDiscontinuedListClick = (e, productIndex) => {

        if (!discontinuedList.includes(productIndex)) {
            setDiscontinuedList((prevArray) => [...prevArray, productIndex]);
        }

    };

    const handleAddToAlreadyOrderedListClick = (e, productIndex) => {

        if (!alreadyOrderedList.includes(productIndex)) {
            setAlreadyOrderedList((prevArray) => [...prevArray, productIndex]);
        }

    };



    // Production Stuff

    // useEffect(() => {
    //     const dataFileLocationFromLocalStorage = localStorage.getItem('torchwoodDataLocation');

    //     if (dataFileLocationFromLocalStorage === null) {
    //         console.log("No Data File Location Found in Local Storage");
    //         setShowSelectDataDialog(true);

    //     }
    // }, []); 


    // On Page Load

    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {

            readFileFromHardCodedFileLocation().catch((error) => {
                console.error("error reading files", error);
            }); // Call the function only once
        } else if (process.env.NODE_ENV === 'production') {
            console.log('process.env.NODE_ENV in production mode, not automatically loading data file')
        } else {
            console.log("Not in development or production");
        }

    }, []);



    // Autoloading any possible local storage state: 

    useEffect(() => {
        readListDataFromLocalStorageFileHandler();
        setInitialPageLoadComplete(true);
    }, []);


    // Things to do after the initial render.
    useEffect(() => {
        if (initialPageLoadComplete) {
            // Autosaving list variables to local storage: 
            saveArraysToLocalStorage();

        }

    }, [orderList, outOfStockList, discontinuedList, alreadyOrderedList])
    // if (!suppressOutput) {
    //     console.log(`data is a length ${data.length} array`);

    //     printArrayToString("SelectedProductsList ", selectedProductsList);
    //     printArrayToString("Details Panel List", viewDetailsProductList);
    //     printArrayToString("Assortment Items in Assortment Display", assortmentAnalyzerProductList);

    //     printArrayToString('reorderItemsList', reorderItemsList)
    //     printArrayToString('Order List', orderList);
    //     printArrayToString('outOfStockList List', outOfStockList);
    //     printArrayToString('discontinuedList', discontinuedList);
    //     printArrayToString('alreadyOrderedList List', alreadyOrderedList);
    //     printArrayToString('assortmentAnalyzerProductList ', assortmentAnalyzerProductList);
    // }



    return (
        <>



            <div className="main-nav">
                <h2>Varuni 1000</h2>


                <div className="page-selection-bar">
                    <button className="nav-bar-button" onClick={selectMainDisplayHandler}>Search</button>
                    <button className="nav-bar-button" onClick={selectAssortmentDisplayHandler}>Assortment Tool</button>
                    <button className="nav-bar-button" onClick={selectOrderingToolDisplayHandler}>Reorder Tool</button>

                    {/* <button className="nav-bar-button" onClick={readListDataFromLocalStorageFileHandler}>Read List Data</button> */}

                    <button onClick={clickDataFileInputHandler} className="nav-bar-button">
                        Select Data
                    </button>
                    <input
                        className="choose-file-input"

                        id="data-file-upload"
                        type="file"
                        accept=".dbf"
                        onChange={readFileFromSelectedFileLocation}
                       
                    />

                    <button onClick={clickListFileInputHandler} className="nav-bar-button">
                        Load List File
                    </button>
                    <input
                        className="choose-file-input"
                       
                        id="list-file-upload"
                        type="file"
                        accept=".json"
                        onChange={handleListFileChange}
                        style={{ display: "none" }}
                    />
                    <button className="nav-bar-button" onClick={saveListDataToFileHandler}>Save List Data</button>

                    {/* <TextInputModal 
                    showModal = {showSelectDataDialog}
                    setShowModal = {setShowSelectDataDialog}
                    dataFolder={dataFolder} 
                    setDataFolder ={setDataFolder}
                    submitDataHandler={submitDataFolderPathHandler} /> */}
                </div>
                {listDataMessage && <p>{listDataMessage}</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {data.length > 0 && (
                    <p>Data Loaded!</p>
                )}
            </div>

            <div className='main-display'>

                {(webpageSelection === webpageSelectionEnums.home) &&
                    <SearchWindow
                        data={data}
                        changeSearchHandler={changeSearchHandler}
                        searchDisplayItemsArray={searchResult}
                        selectedItemsIndicesArray={selectedProductsList}
                        handleCheckBoxClick={handleCheckBoxClick}
                        showDetailsHandler={showProductDetailsHandler}

                        searchPageNumber={searchPageNumber}
                        setSearchPageNumber={setSearchPageNumber}
                        handleUncheckAllClick={handleUncheckAllClick}
                        addToOrderListHandler={handleAddToOrderListClick}
                        addToOutOfStockHandler={handleAddToOutOfStockListClick}
                        addToDiscontinuedHandler={handleAddToDiscontinuedListClick}
                        markAlreadyOrderedHandler={handleAddToAlreadyOrderedListClick} />
                }

                {webpageSelection === webpageSelectionEnums.assortmentTool &&
                    <>
                        <AssortmentAnalyzerWindow
                            data={data}
                            productIndicesToAnalyze={assortmentAnalyzerProductList}
                            importSelectionToAssortmentAnalyzerHandler={importSelectionToAssortmentAnalyzer}
                            handleRemoveAssortmentItem={handleRemoveAssortmentItem}
                            showDetailsHandler={showProductDetailsHandler}
                            removeAllAssortedItemsHandler={removeAllAssortedItemsHandler}
                        />
                        <SmallSearchWindow
                            data={data}
                            changeSearchHandler={changeSearchHandler}
                            searchDisplayItemsArray={searchResult}
                            selectedItemsIndicesArray={selectedProductsList}
                            handleCheckBoxClick={handleCheckBoxClick}
                            showDetailsHandler={showProductDetailsHandler}

                            searchPageNumber={searchPageNumber}
                            setSearchPageNumber={setSearchPageNumber}
                            handleUncheckAllClick={handleUncheckAllClick}
                            addToOrderListHandler={handleAddToOrderListClick}
                            addToOutOfStockHandler={handleAddToOutOfStockListClick}
                            addToDiscontinuedHandler={handleAddToDiscontinuedListClick}
                            markAlreadyOrderedHandler={handleAddToAlreadyOrderedListClick} />
                    </>
                }

                {webpageSelection === webpageSelectionEnums.orderingTool &&
                    <NeedToReorderTool
                        data={data}
                        reorderItemsList={reorderItemsList}
                        setReorderItemsList={setReorderItemsList}
                        removeFromReorderItemsListHandler={removeFromReorderItemsListHandler}
                        reorderToolPageNumber={reorderToolPageNumber}
                        setReorderToolPageNumber={setReorderToolPageNumber}
                        addToOrderListHandler={handleAddToOrderListClick}
                        addToOutOfStockHandler={handleAddToOutOfStockListClick}
                        addToDiscontinuedHandler={handleAddToDiscontinuedListClick}
                        markAlreadyOrderedHandler={handleAddToAlreadyOrderedListClick}
                        showProductDetailsHandler={showProductDetailsHandler} />
                }

                <ProductDetailsPanel
                    data={data}
                    productDetailsIndexList={viewDetailsProductList}
                    removeProductDetailsHandler={removeProductDetailsHandler}
                    clearProductDetailsPanelHandler={clearProductDetailsPanelHandler}
                    flexDirection={'column'}
                />

                <OrderListDisplay
                    data={data}
                    clickItemHandler={showProductDetailsHandler}
                    orderList={orderList}
                    setOrderList={setOrderList}
                    orderListScrollRef={orderListScrollRef}
                />

                <ListDisplays
                    data={data}
                    clickItemHandler={showProductDetailsHandler}
                    selectedProductsList={selectedProductsList}
                    setSelectedProductsList={setSelectedProductsList}

                    outOfStockList={outOfStockList}
                    setOutOfStockList={setOutOfStockList}
                    discontinuedList={discontinuedList}
                    setDiscontinuedList={setDiscontinuedList}
                    alreadyOrderedList={alreadyOrderedList}
                    setAlreadyOrderedList={setAlreadyOrderedList}
                />






            </div >

        </>

    );
};

export default DBFReaderComponent;
