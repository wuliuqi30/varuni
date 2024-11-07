import { TextField } from '@mui/material';
import { useState, useMemo } from 'react';
import trie from 'trie-prefix-tree';
import { SearchDisplay } from './SearchDisplay';
import { CurrentSelection } from './CurrentSelection';
import { ProductDetails } from './ProductDetails';
import { AssortmentAnalyzer } from './AssortmentAnalyzer';


const DBFReaderComponent = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);

    // Stores the product.INDEX
    const [selectedProductsList, setSelectedProductsList] = useState([]);

    const [searchBarValue, setSearchBarValue] = useState(null);

    const [searchResult, setSearchResult] = useState([]);
    const [alphabetTrie, setAlphabetTree] = useState(trie([]));

    const [viewDetailsProduct, setViewDetailsProduct] = useState(null);

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
                    if (count > 200) {
                        break;
                    }
                    count++;

                }

                setData(records);
                console.log("records: ");
                console.log(records);


            } catch (err) {

                setError('Error reading DBF file: ' + err.message);
            }
        };

        reader.onerror = (err) => {
            setError('File reading failed: ' + err.message);
        };

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

        // Parse the string as a floating-point number

        //     // const value = view.getFloat64(fieldOffset, true);
        //     // return value; // Display as decimal with 2 places
        // } else if (field.type === 'D') { // Date
        //     const year = view.getUint8(fieldOffset + 1);
        //     const month = view.getUint8(fieldOffset + 2);
        //     const day = view.getUint8(fieldOffset + 3);
        //     return `${year}-${month}-${day}`;
        // }



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
    }, [data]);

    // Now you can use these maps for lookups within the component
    const getProductIndicesByCode = (code) => productsByCodeNum.get(code);
    const getProductIndicesByBrand = (brand) => productsByBrand.get(brand) || [];
    const getProductIndicesByDescription = (description) => productsByDescription.get(description) || [];

    const searchForProductByCodeHandler = () => {
        setSearchResult(getProductIndicesByCode(searchBarValue));
    };

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


    const searchForProductByDescripHandler = () => {
        //console.log("Searching for products by DESCRIP" + searchBarValue)
        setSearchResult(getProductIndicesByDescription(searchBarValue));
    };

    const handleCheckBoxClick = (e) => {
        e.stopPropagation();
        //console.log("handling check box click");
        //console.log("event is");
        //console.log(e);
        const parent = e.target.closest('li');
        //console.log("parent: ");
        //console.log(parent);

        const idstring = "search-result-";
        const parentCodeNum = parent.getAttribute('id').substring(idstring.length);
        //console.log(`parentCodeNum is ${parentCodeNum}`);

        const product = data[getProductIndicesByCode(parentCodeNum)];
        const filteredList = selectedProductsList.filter(index => index != product.INDEX);
        //console.log("selectedProductsList is: ");
        ///console.log(selectedProductsList);
        //console.log("fitlered list should be: ");
        //console.log(filteredList);
        // selected product list is an array with PROUDCT IDs (index)
        setSelectedProductsList(product.CHECKED ? selectedProductsList.filter(index => index != product.INDEX) : [...selectedProductsList, product.INDEX]);

        setData((prevData) => {
            const clone = structuredClone(prevData);

            const checkState = clone[product.INDEX].CHECKED;
            // console.log(`Old checkState is ${checkState}`);
            //console.log(`Setting new checkState  to ${!checkState}`);
            clone[product.INDEX].CHECKED = !checkState;
            //console.log(`returning clone`);
            return clone;
        })
    }

    const handleRemoveFromSelection = (e) => {
        e.stopPropagation();
        //console.log("handling check box click");
        //console.log("event is");
        //console.log(e);
        const parent = e.target.closest('li');
        //console.log("parent: ");
        //console.log(parent);

        const idstring = "selection-";
        const parentCodeNum = parent.getAttribute('id').substring(idstring.length);
        //console.log(`parentCodeNum is ${parentCodeNum}`);

        const product = data[getProductIndicesByCode(parentCodeNum)];
        const filteredList = selectedProductsList.filter(index => index != product.INDEX);
        //console.log("selectedProductsList is: ");
        //console.log(selectedProductsList);
        //console.log("fitlered list should be: ");
        //console.log(filteredList);
        setSelectedProductsList(product.CHECKED ? selectedProductsList.filter(index => index != product.INDEX) : [...selectedProductsList, product.INDEX]);
        setData((prevData) => {
            const clone = structuredClone(prevData);

            // Toggle the CHECKED FIELD


            const checkState = clone[product.INDEX].CHECKED;
            //console.log(`Old checkState is ${checkState}`);
            //console.log(`Setting new checkState  to ${!checkState}`);
            clone[product.INDEX].CHECKED = !checkState;
            //console.log(`returning clone`);
            return clone;
        })
    }



    const showProductDetailsHandler = (e) => {
        // console.log("showProductDetailsHandler");
        //console.log("event is");
        //console.log(e);
        const searchIndexLocatorString = e.target.id;
        const idstring = "search-result-button-";
        const thisCodeNum = searchIndexLocatorString.substring(idstring.length);
        //console.log(`thisCodeNum is ${thisCodeNum}`);
        setViewDetailsProduct(data[getProductIndicesByCode(thisCodeNum)]);

    };

    const changeSearchHandler = (e) => {
        const upperCaseVal = e.target.value.toUpperCase();
        searchForProductByBrandHandler(upperCaseVal);
        //console.log("Setting Search Bar Value");
        setSearchBarValue(upperCaseVal);
    }

    //console.log("Search Result is: ");
    //console.log(searchResult);
    //console.log("Product Selection List Array is: ");
    //console.log(selectedProductsList);
    // console.log("Alphabet trie for the brand name: ");
    // console.log(alphabetTrie.dump());
    return (
        <><input type="file" accept=".dbf" onChange={handleFileChange} />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {data.length > 0 && (
                <p>Data Loaded!</p>
            )}
            <TextField
                className='search-bar'
                id="select-product"
                variant="outlined"
                fullWidth
                lable="Search"
                onChange={changeSearchHandler} />
            <div className='main-display'>


                {/* <button id="search-button" onClick={searchForProductByCodeHandler}>Search By COD NUM</button>
            <button id="search-button" onClick={searchForProductByBrandHandler}>Search By BRAND</button>
            <button id="search-button" onClick={searchForProductByDescripHandler}>Search By DESCRIP</button> */}
                <div className="search-select-window">
                    {searchResult != null &&
                        <SearchDisplay
                            data={data}
                            searchDisplayItemsArray={searchResult}
                            handleCheckBoxClick={handleCheckBoxClick}
                            showDetailsHandler={showProductDetailsHandler} />
                    }
                    {searchResult == null &&
                        <div className="search-result-window">{"Didn't find that."}</div>
                    }

                    

                </div>
                <CurrentSelection
                        data={data}
                        selectedProductsList={selectedProductsList}
                        onRemove={handleRemoveFromSelection} />
                <ProductDetails
                    productData={viewDetailsProduct}
                />
                <AssortmentAnalyzer />



            </div >
        </>
    );
};

export default DBFReaderComponent;
