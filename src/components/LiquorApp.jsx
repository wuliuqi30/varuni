
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
import { ActionButtonsPanel } from './ActionButtonsPanel'

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

const LiquorApp = () => {

    const suppressOutput = true;

    if (!suppressOutput) {
        console.log("Entered LiquorApp Component");
        console.log(process.env.NODE_ENV);
    }

    // -----------------State Information -----------------------


    // Tabs: 
    const [tabKey, setTabKey] = useState('search');

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

    // Small Search Window (in assortment list now)

    const [smallSearchBarValue, setSmallSearchBarValue] = useState(null);
    const [smallSearchResult, setSmallSearchResult] = useState([]);

    const [smallSearchPageNumber, setSmallSearchPageNumber] = useState(1); // 1 indexed.

    // Selected Products From Search: Stores the product.INDEX of the selected products
    const [selectedProductsList, setSelectedProductsList] = useState([]);

    // Assorted Products Analyzer Tool
    const [assortmentAnalyzerProductList, setAssortmentAnalyzerProductList] = useState([]);

    // Details Panel
    const [viewDetailsProductIndex, setViewDetailsProductIndex] = useState([]);

    // Reorder Tool States: 
    const [reorderItemsList, setReorderItemsList] = useState([]);  // Array of: { index: type int, reorderDate: type Date, reorderTimeWeeks: type int }
    const [reorderToolPageNumber, setReorderToolPageNumber] = useState(1); // 1 indexed
    const [reorderItemsFocusedProduct, setReorderItemsFocusedProduct] = useState(null);


    const [orderList, setOrderList] = useState([]);
    const orderListScrollRef = useRef(null);

    const [outOfStockList, setOutOfStockList] = useState([]);
    const [discontinuedList, setDiscontinuedList] = useState([]);
    const [alreadyOrderedList, setAlreadyOrderedList] = useState([]);
    const [recountInventoryList, setRecountInventoryList] = useState([]);
    const [labelList, setLabelList] = useState([]);
    const [watchList, setWatchList] = useState([]);


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
            setRecountInventoryList(jsonObject.recountInventoryList);
            setLabelList(jsonObject.labelList);
            setWatchList(jsonObject.watchList);
            console.log("-------Finished Reading List Data File------------");
            setListDataMessage("Finished Reading List Data from Local Storage!");

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

                    if (listData.recountInventoryList) {
                        setRecountInventoryList(listData.recountInventoryList);
                    } else {
                        console.log("No recountInventoryList data in file");
                    }

                    if (listData.labelList) {
                        setLabelList(listData.labelList);
                    } else {
                        console.log("No labelList data in file");
                    }

                    if (listData.watchList) {
                        setWatchList(listData.watchList);
                    } else {
                        console.log("No watchList data in file");
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
            alreadyOrderedList: alreadyOrderedList,
            recountInventoryList: recountInventoryList,
            labelList: labelList,
            watchList: watchList
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


    // -----------------Search Stuff -----------------------

    const changeSearchHandler = (e) => {
        const upperCaseVal = e.target.value.toUpperCase();
        const returnval = searchForProductByBrandHandler(upperCaseVal);
        if (returnval) {
            setSearchResult(returnval);
        }
        //console.log("Setting Search Bar Value");
        setSearchBarValue(upperCaseVal);
    }

    const changeSmallSearchHandler = (e) => {
        const upperCaseVal = e.target.value.toUpperCase();
        const returnval = searchForProductByBrandHandler(upperCaseVal);
        if (returnval) {
            setSmallSearchResult(returnval);
        }
        //console.log("Setting Search Bar Value");
        setSmallSearchBarValue(upperCaseVal);
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
        return newSearchResultArray;


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

        setViewDetailsProductIndex(productIndex);
    };

    const clearProductDetailsPanelHandler = () => {
        setViewDetailsProductIndex(null);
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

    const addItemToAssortmentListHandler = (e, productIndex) => {
        if (!assortmentAnalyzerProductList.includes(productIndex)) {
            setAssortmentAnalyzerProductList((prevArray) => [...prevArray, productIndex]);
        } else {
            console.log(`Product ${productIndex} already in the list!`);
        }
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
        setViewDetailsProductIndex(newList[0].index);
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

    const handleAddToRecountInventoryListClick = (e, productIndex) => {

        if (!recountInventoryList.includes(productIndex)) {
            setRecountInventoryList((prevArray) => [...prevArray, productIndex]);
        }

    };

    const handleAddToLabelListClick = (e, productIndex) => {

        if (!labelList.includes(productIndex)) {
            setLabelList((prevArray) => [...prevArray, productIndex]);
        }

    };

    const handleAddToWatchListClick = (e, productIndex) => {

        if (!watchList.includes(productIndex)) {
            setWatchList((prevArray) => [...prevArray, productIndex]);
        }

    };


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

    }, [orderList,
        outOfStockList,
        discontinuedList,
        alreadyOrderedList,
        recountInventoryList,
        labelList,
        watchList])




    const allLists = {
        orderList: orderList,
        selectionList: selectedProductsList,
        alreadyOrderedList: alreadyOrderedList,
        outOfStockList: outOfStockList,
        discontinuedList: discontinuedList,
        recountInventoryList: recountInventoryList,
        labelList: labelList,
        watchList: watchList
    }


    const allAddToListCallbacks = {
        orderList: handleAddToOrderListClick,
        alreadyOrderedList: handleAddToAlreadyOrderedListClick,
        outOfStockList: handleAddToOutOfStockListClick,
        discontinuedList: handleAddToDiscontinuedListClick,
        recountInventoryList: handleAddToRecountInventoryListClick,
        labelList: handleAddToLabelListClick,
        watchList: handleAddToWatchListClick

    }

    const allListSetterCallbacks = {
        orderList: setOrderList,
        alreadyOrderedList: setAlreadyOrderedList,
        outOfStockList: setOutOfStockList,
        discontinuedList: setDiscontinuedList,
        recountInventoryList: setRecountInventoryList,
        labelList: setLabelList,
        watchList: setWatchList

    }

    // -----------------Props ------------------------//

    const searchWindowProps = {
        data: data,
        changeSearchHandler: changeSearchHandler,
        searchDisplayItemsArray: searchResult,
        selectedItemsIndicesArray: selectedProductsList,
        handleCheckBoxClick: handleCheckBoxClick,
        showDetailsHandler: showProductDetailsHandler,

        searchPageNumber: searchPageNumber,
        setSearchPageNumber: setSearchPageNumber,
        handleUncheckAllClick: handleUncheckAllClick,
        allAddToListHandlers: allAddToListCallbacks,
    }


    const productDetailsWindowProps = {
        data: data,
        productDataIndex: viewDetailsProductIndex,
        clearProductDetailsPanelHandler: clearProductDetailsPanelHandler,
        flexDirection: 'column'
    }

    const assortmentToolProps = {
        data: data,
        productIndicesToAnalyze: assortmentAnalyzerProductList,
        importSelectionToAssortmentAnalyzerHandler: importSelectionToAssortmentAnalyzer,
        handleRemoveAssortmentItem: handleRemoveAssortmentItem,
        showDetailsHandler: showProductDetailsHandler,
        removeAllAssortedItemsHandler: removeAllAssortedItemsHandler,
    }

    const smallSearchWindowProps = {
        data: data,
        changeSearchHandler: changeSmallSearchHandler,
        searchDisplayItemsArray: smallSearchResult,
        showDetailsHandler: showProductDetailsHandler,
        searchPageNumber: smallSearchPageNumber,
        setSearchPageNumber: setSmallSearchPageNumber,
        addToAssorterHandler: addItemToAssortmentListHandler
    }

    const orderToolProps = {
        data: data,
        reorderItemsList: reorderItemsList,
        setReorderItemsFocusedProduct: setReorderItemsFocusedProduct,
        setReorderItemsList: setReorderItemsList,
        removeFromReorderItemsListHandler: removeFromReorderItemsListHandler,
        reorderToolPageNumber: reorderToolPageNumber,
        setReorderToolPageNumber: setReorderToolPageNumber,
        listStates: allLists,
        showProductDetailsHandler: showProductDetailsHandler,
        handleAddToOrderListClick: handleAddToOrderListClick
    }

    const actionButtonsPanelProps = {
        data: data,
        focusedProductIndex: reorderItemsFocusedProduct,
        removeFromReorderItemsListHandler: removeFromReorderItemsListHandler,
        addToListHandlers: allAddToListCallbacks
    }


    const orderListDisplayProps = {
        data: data,
        clickItemHandler: showProductDetailsHandler,
        orderList: orderList,
        setOrderList: setOrderList,
        orderListScrollRef: orderListScrollRef,
        addToAlreadyOrderedListHandler: handleAddToAlreadyOrderedListClick,
    }

    const listDisplaysProps = {
        data: data,
        clickItemHandler: showProductDetailsHandler,
        allLists: allLists,
        allListSetterCallbacks: allListSetterCallbacks,
    }


    if (!suppressOutput) {
        console.log(`data is a length ${data.length} array`);

        printArrayToString("SelectedProductsList ", selectedProductsList);
        printArrayToString("Details Panel List", viewDetailsProductIndex);
        printArrayToString("Assortment Items in Assortment Display", assortmentAnalyzerProductList);

        printArrayToString('reorderItemsList', reorderItemsList)
        printArrayToString('Order List', orderList);
        printArrayToString('outOfStockList List', outOfStockList);
        printArrayToString('discontinuedList', discontinuedList);
        printArrayToString('alreadyOrderedList List', alreadyOrderedList);
        printArrayToString('assortmentAnalyzerProductList ', assortmentAnalyzerProductList);
    }


    return (
        <div className='liquor-app'>

            {/* <h2>Varuni 1000</h2> */}
            <Tabs

                id="controlled-tab-example"
                activeKey={tabKey}
                onSelect={(k) => setTabKey(k)}
                className="mb-3"
            >

                <Tab eventKey="data" title="Load Data">
                    <div className="data-load-window">
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
                        
                    </div>
                    {listDataMessage && <p>{listDataMessage}</p>}
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                        {data.length > 0 && (
                            <p>Data Loaded!</p>
                        )}
                </Tab>
                <Tab eventKey="search" title="Search">
                    <div className='main-display'>
                        <SearchWindow {...searchWindowProps} />
                        <ProductDetailsPanel {...productDetailsWindowProps} />
                        <OrderListDisplay {...orderListDisplayProps} />
                        <ListDisplays {...listDisplaysProps} />
                    </div>
                </Tab>
                <Tab eventKey="assorter" title="Assortment Tool">
                    <div className='main-display'>
                        <AssortmentAnalyzerWindow {...assortmentToolProps} />
                        <SmallSearchWindow {...smallSearchWindowProps} />
                        <ProductDetailsPanel {...productDetailsWindowProps} />
                        <OrderListDisplay {...orderListDisplayProps} />
                        <ListDisplays {...listDisplaysProps} />
                    </div>
                </Tab>
                <Tab eventKey="ordering" title="Order Tool" >
                    <div className='main-display'>
                        <NeedToReorderTool {...orderToolProps} />
                        <ProductDetailsPanel {...productDetailsWindowProps} />
                        <ActionButtonsPanel {...actionButtonsPanelProps} />
                        <OrderListDisplay {...orderListDisplayProps} />

                    </div>
                </Tab>

            </Tabs>
        </div>

    );
};

export default LiquorApp;
