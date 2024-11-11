
import { useState, useMemo } from 'react';
import trie from 'trie-prefix-tree';
import { SearchDisplay } from './SearchDisplay';
import { CurrentSelection } from './CurrentSelection';
import { ProductDetailsPanel } from './ProductDetailsPanel';
import { AssortmentAnalyzerWindow } from './AssortmentAnalyzerWindow';



const DBFReaderComponent = () => {

    const suppressOutput = false;
    if (!suppressOutput) {
        console.log("Entering DBF Reader Component");
    }
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);


    // Search: 
    const [searchBarValue, setSearchBarValue] = useState(null);
    const [searchResult, setSearchResult] = useState([]);
    const [alphabetTrie, setAlphabetTree] = useState(trie([]));
    const [searchPageNumber, setSearchPageNumber] = useState(1); // 1 indexed.
    const itemsPerPage = 9;

    // Stores the product.INDEX of the selected products
    const [selectedProductsList, setSelectedProductsList] = useState([]);

    // Assorted Products Analyzer Tool
    const [assortmentAnalyzerProductList, setAssortmentAnalyzerProductList] = useState([]);

    // Details Panel
    const [viewDetailsProductList, setViewDetailsProductList] = useState([]);


    // Load And Read DBF File 
    const handleFileChange = async (event) => {
        console.log(`event is: `);
        console.log(event);
        const file = event.target.files[0];
        console.log(`file (type ${typeof file}) is: `);
        console.log(file);
        if (!file) return;

        const reader = new FileReader();
        console.log("instantiated a file reader");





        reader.onload = (e) => {
            try {
                const buffer = e.target.result;
                console.log("found buffer");
                console.log(buffer);
                const view = new DataView(buffer);

                console.log("About to get data from \"view\"");

                const headerHeaderLength = 32;
                const fieldDescriptorSize = 32;
                const year = view.getUint8(1) + 2000; // Add 1900 to the YY value
                const month = view.getUint8(2);        // Get the MM value
                const day = view.getUint8(3);          // Get the DD value

                const numRecords = view.getInt32(4, true);
                const headerSize = view.getInt16(8, true); // Header size
                const recordLength = view.getInt16(10, true); // Record length
                const shouldBeZero = view.getInt16(12, true); // Record length

                //console.log(`year: ${year} month: ${month} day: ${day} headerLength: ${headerHeaderLength}, numRecords ${numRecords}, headerNumBytes (from file) ${headerSize} and recordLengthBytes ${recordLength}, shouldBeZero: ${shouldBeZero}`)
                // Read field descriptors (after the header)
                const fields = [];
                let currentOffset = 0
                for (let i = headerHeaderLength; i < headerSize; i += fieldDescriptorSize) {

                    const fieldName = String.fromCharCode.apply(null, new Uint8Array(buffer, i, 11)).replace(/\0/g, '');
                    const fieldType = String.fromCharCode(view.getUint8(i + 11));
                    const fieldLength = view.getUint8(i + 16); //
                    //console.log(`i is ${i}, fieldName ${fieldName}, fieldType ${fieldType} fieldLength: ${fieldLength}`);
                    if (fieldName === '') break; // End of fields
                    if (fieldType == '5') break;
                    fields.push({ name: fieldName, type: fieldType, length: fieldLength, offset: currentOffset });
                    currentOffset += fieldLength;
                }

                console.log("fields: ");
                console.log(fields);

                // Read records
                const records = [];
                //console.log(`headerSize ${headerSize}, buffer.byteLength ${buffer.byteLength} and recordLength ${recordLength}`);
                let count = 0;
                for (let i = headerSize; i < buffer.byteLength; i += recordLength) {
                    //console.log(`in for loop for records, i: ${i})`);

                    const record = {};
                    for (const field of fields) {
                        //console.log('field:');
                        //console.log(field);
                        const fieldValue = readFieldValue(view, i, field);
                        //console.log(`fieldValue is ${fieldValue} field.name is ${field.name}`);
                        record[field.name] = fieldValue;
                    }
                    // custon fields
                    record["CHECKED"] = false;
                    record["INDEX"] = count;
                    //console.log(`record (${i}): is: `);
                    //console.log(record);
                    records.push(record);
                    // if (count > 400) {
                    //     break;
                    // }
                    count++;

                }
                records.pop();
                setData(records);
                console.log("records: ");
                console.log(records);
                console.log("finished console logging records");

            } catch (err) {
                console.log("Catching an erro");
                setError('Error reading DBF file: ' + err.message);
            }
        };
        console.log("declare  reader.onerror");
        reader.onerror = (err) => {
            setError('File reading failed: ' + err.message);
        };
        console.log("About to call reader.readAsArrayBuffer(file);");
        reader.readAsArrayBuffer(file); // Read the file as an ArrayBuffer
    };

    const readFieldValue = (view, offset, field) => {

        const fieldOffset = offset + field.offset; // Calculate field's offset in the record
        const fieldOffsetModified = offset + field.offset + 1; // Calculate field's offset in the record
        //console.log(`in readFieldValue, view ${view} offset ${offset} and field ${field} fieldOffset ${fieldOffset}`);
        //const length = field.length;
        if (fieldOffset + field.length > view.byteLength) {
            console.warn(`Skipping field ${field.name} as it exceeds buffer bounds with offset ${fieldOffset} and length ${field.length}`);
            return null; // Skip reading this field
        }

        let readField = String.fromCharCode.apply(null, new Uint8Array(view.buffer, fieldOffsetModified, field.length)).trim();
        if (field.type === 'C') { // Character
            return readField;
        } else if (field.type === 'N') { // Numeric
            return Number(readField);

        } else if (field.type == 'D') {
            if (readField === "") {
                return null;
            }
            return new Date(Number(readField.substring(0, 4)), Number(readField.substring(4, 6)) - 1, Number(readField.substring(6, 8)));
        }


    };

    // Create Hashmaps: 
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
            byBrand.get(product.BRAND).push(product.INDEX);

            if (!byDescription.has(product.DESCRIP)) {
                byDescription.set(product.DESCRIP, []);
            }
            // add this product to the description array
            byDescription.get(product.DESCRIP).push(product.INDEX);
        });



        return { productsByCodeNum: byCodeNum, productsByBrand: byBrand, productsByDescription: byDescription };
    }, [alphabetTrie, data]);

    // Now you can use these maps for lookups within the component
    const getProductIndicesByCode = (code) => productsByCodeNum.get(code);
    const getProductIndicesByBrand = (brand) => productsByBrand.get(brand) || [];


    const searchForProductByBrandHandler = (term) => {
        //console.log("Searching for products with the input: " + term)
        if (term.trim() === "") {
            return;
        }
        //console.log("Trie results are:")
        const trieResultArray = alphabetTrie.getPrefix(term);
        //console.log("Trie array is:");
        //console.log(trieResultArray);

        let newSearchResultArray = [];
        for (let i = 0; i < trieResultArray.length; i++) {
            const thisTreeString = trieResultArray[i].toUpperCase();
            //console.log("thisTreeString: " + thisTreeString);
            const allProductsForThisBrand = getProductIndicesByBrand(thisTreeString);
            //console.log("allProductsForThisBrand: ");
            //console.log(allProductsForThisBrand);
            newSearchResultArray.push(...allProductsForThisBrand);
        }
        //console.log("newSearchResultArray is: ");
        //console.log(newSearchResultArray);
        setSearchResult(newSearchResultArray);

    };


    // const searchForProductByDescripHandler = () => {
    //     //console.log("Searching for products by DESCRIP" + searchBarValue)
    //     setSearchResult(getProductIndicesByDescription(searchBarValue));
    // };

    const handleCheckBoxClick = (e) => {
        //e.stopPropagation();

        if (selectedProductsList === null) {
            return;
        }

        const parent = e.target.closest('li');

        const idstring = "search-result-";
        const productIndex = Number(parent.getAttribute('id').substring(idstring.length));


        if (!selectedProductsList.find(item => item === productIndex)) {
            setSelectedProductsList((prevList) => { return [...prevList, productIndex] });
        } else {
            setSelectedProductsList((prevList) => { return prevList.filter(item => item !== productIndex) });
        }



    }

    const handleUncheckAllClick = () => {
        setSelectedProductsList([]);
    }

    const handleRemoveFromSelection = (e) => {


        if (selectedProductsList === null) {
            return;
        }
        const parent = e.target.closest('li');

        const idstring = "selection-";
        const productIndex = Number(parent.getAttribute('id').substring(idstring.length));


        setSelectedProductsList((prevList) => { return prevList.filter(item => item !== productIndex) });

    }


    const clickCurrentSelectionItemHandler = (e) => {
        
        if (selectedProductsList === null) {
            return;
        }
        const parent = e.target.closest('li');

        const idstring = "selection-";
        const productIndex = Number(parent.getAttribute('id').substring(idstring.length));


        if (!viewDetailsProductList.includes(productIndex)) {
            setViewDetailsProductList((prevArray) => [productIndex, ...prevArray]);
        }

    }

    const showProductDetailsHandler = (e) => {

        const searchIndexLocatorString = e.target.id;
        const idstring = "search-result-button-";
        const thisCodeNum = searchIndexLocatorString.substring(idstring.length);

        const productIndexClicked = getProductIndicesByCode(thisCodeNum);

        if (!viewDetailsProductList.includes(productIndexClicked)) {
            setViewDetailsProductList((prevArray) => [productIndexClicked, ...prevArray]);
        }

    };

    const changeSearchHandler = (e) => {
        const upperCaseVal = e.target.value.toUpperCase();
        searchForProductByBrandHandler(upperCaseVal);
        //console.log("Setting Search Bar Value");
        setSearchBarValue(upperCaseVal);
    }


    // Import Selection to Assorted Analyzer Selection

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

    const removeProductDetailsHandler = (e) => {


        const parent = e.target.closest('li');
        const idstring = "product-details-item-";
        const productIndex = Number(parent.getAttribute('id').substring(idstring.length));

        setViewDetailsProductList((prevList) => { return prevList.filter(element => element !== productIndex) });

    }

    if (!suppressOutput) {
        console.log(`data is a length ${data.length} array`);

        console.log("selectedProductsList is: ");
        console.log(selectedProductsList);
        console.log("viewDetailsProductList ");
        console.log(viewDetailsProductList);
        console.log("assortmentAnalyzerProductList is");
        console.log(assortmentAnalyzerProductList);
    }
    return (
        <>
            <h1>Varuni 1000</h1>
            <div className="main-header">

                <label htmlFor="file-upload" className="choose-file-button">
                    Choose File
                </label>
                <input
                    className="choose-file-input"
                    id="file-upload"
                    type="file"
                    accept=".dbf"
                    onChange={handleFileChange}
                />

                {error && <p style={{ color: 'red' }}>{error}</p>}
                {data.length > 0 && (
                    <p>Data Loaded!</p>
                )}
            </div>

           
            <div className='main-display'>



                <div className="search-select-window">
                    {searchResult != null &&
                        <SearchDisplay
                            data={data}
                            changeSearchHandler = {changeSearchHandler}
                            searchDisplayItemsArray={searchResult}
                            selectedItemsIndicesArray={selectedProductsList}
                            handleCheckBoxClick={handleCheckBoxClick}
                            showDetailsHandler={showProductDetailsHandler}
                            itemsPerPage={itemsPerPage}
                            searchPageNumber={searchPageNumber}
                            setSearchPageNumber={setSearchPageNumber}
                            handleUncheckAllClick={handleUncheckAllClick} />
                    }
                    {searchResult == null &&
                        <div className="search-result-window">{"Didn't find that."}</div>
                    }



                </div>
                <CurrentSelection
                    data={data}
                    selectedProductsList={selectedProductsList}
                    onRemove={handleRemoveFromSelection}
                    clickCurrentSelectionItemHandler={clickCurrentSelectionItemHandler} />
                <AssortmentAnalyzerWindow
                    data={data}
                    productIndicesToAnalyze={assortmentAnalyzerProductList}
                    importSelectionToAssortmentAnalyzerHandler={importSelectionToAssortmentAnalyzer}
                    handleRemoveAssortmentItem={handleRemoveAssortmentItem}
                />

                <ProductDetailsPanel
                    data={data}
                    productDetailsIndexList={viewDetailsProductList}
                    removeProductDetailsHandler={removeProductDetailsHandler}
                />



            </div >

        </>

    );
};

export default DBFReaderComponent;
