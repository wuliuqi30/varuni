import { TextField } from '@mui/material';
import { useState, useMemo } from 'react';
import { ProductDisplayItem } from './ProductDisplayItem';
import trie from 'trie-prefix-tree';


const DBFReaderComponent = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [productDisplayList, setProductDisplayList] = useState([]);
    const [searchBarValue, setSearchBarValue] = useState(null);
    const [searchResult, setSearchResult] = useState([]);
    const [alphabetTrie, setAlphabetTree] = useState(trie([]));


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

                console.log(`year: ${year} month: ${month} day: ${day} headerLength: ${headerHeaderLength}, numRecords ${numRecords}, headerNumBytes (from file) ${headerSize} and recordLengthBytes ${recordLength}, shouldBeZero: ${shouldBeZero}`)
                // Read field descriptors (after the header)
                const fields = [];
                let currentOffset = 0
                for (let i = headerHeaderLength; i < headerSize; i += fieldDescriptorSize) {
                    // console.log(`i is ${i}`);
                    const fieldName = String.fromCharCode.apply(null, new Uint8Array(buffer, i, 11)).replace(/\0/g, '');
                    const fieldType = String.fromCharCode(view.getUint8(i + 11));
                    const fieldLength = view.getUint8(i + 16); //
                    if (fieldName === '') break; // End of fields
                    fields.push({ name: fieldName, type: fieldType, length: fieldLength, offset: currentOffset });
                    currentOffset += fieldLength;
                }

                console.log("fields: ");
                console.log(fields);

                // Read records
                const records = [];
                console.log(`headerSize ${headerSize}, buffer.byteLength ${buffer.byteLength} and recordLength ${recordLength}`);
                let count = 0;
                for (let i = headerSize; i < buffer.byteLength; i += recordLength) {
                    // console.log(`in for loop for records, i: ${i})`);
                    const record = {};
                    for (const field of fields) {
                        // console.log('field:');
                        // console.log(field);
                        const fieldValue = readFieldValue(view, i, field);
                        // console.log(`fieldValue is ${fieldValue} field.name is ${field.name}`);
                        record[field.name] = fieldValue;
                    }
                    // console.log(`record (${i}): is: `);
                    // console.log(record);
                    records.push(record);
                    count++;
                    if (count > 25) {
                        break;
                    }
                }

                setData(records);
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
        // console.log(`in readFieldValue, view ${view} offset ${offset} and field ${field} fieldOffset ${fieldOffset}`);
        // console.log(offset);
        // console.log(field);
        // console.log(fieldOffset);
        if (fieldOffset + field.length > view.byteLength) {
            console.warn(`Skipping field ${field.name} as it exceeds buffer bounds with offset ${fieldOffset} and length ${field.length}`);
            return null; // Skip reading this field
        }

        return String.fromCharCode.apply(null, new Uint8Array(view.buffer, fieldOffset, field.length)).trim();


    };

    // Create Hashmaps: 
    // Create the hash maps only once (or when `products` changes)
    const { productsByCodeNum, productsByBrand, productsByDescription } = useMemo(() => {
        const byCodeNum = new Map();
        const byBrand = new Map();
        const byDescription = new Map();

        

        data.forEach(product => {

            byCodeNum.set(product.CODE_NUM, [product]);

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
            byDescription.get(product.DESCRIP).push(product);
        });

        
       
        return { productsByCodeNum: byCodeNum, productsByBrand: byBrand, productsByDescription: byDescription };
    }, [data]);

    // Now you can use these maps for lookups within the component
    const getProductByCode = (code) => productsByCodeNum.get(code);
    const getProductsByBrand = (brand) => productsByBrand.get(brand) || [];
    const getProductsByDescription = (description) => productsByDescription.get(description) || [];

    const searchForProductByCodeHandler = () => {
        setSearchResult(getProductByCode(searchBarValue));
    };

    const searchForProductByBrandHandler = (term) => {
        console.log("Searching for products with the input: " + term)
        if (term.trim() === ""){
            return;
        }
        console.log("Trie results are:")
        const trieResultArray = alphabetTrie.getPrefix(term);
        console.log("Trie array is:");
        console.log(trieResultArray);

        let newSearchResultArray = [];
        for (let i = 0; i < trieResultArray.length; i++){
            const thisTreeString = trieResultArray[i].toUpperCase();
            console.log("thisTreeString: " + thisTreeString);
            const allProductsForThisBrand = getProductsByBrand(thisTreeString);
            console.log("allProductsForThisBrand: ");
            console.log(allProductsForThisBrand);
            newSearchResultArray.push(...allProductsForThisBrand);
        }
        console.log("newSearchResultArray is: ");
        console.log(newSearchResultArray);
        setSearchResult(newSearchResultArray);
      
    };


    const searchForProductByDescripHandler = () => {
        console.log("Searching for products by DESCRIP" + searchBarValue)
        setSearchResult(getProductsByDescription(searchBarValue));
    };


    const addProductToDisplayHandler = (e) => {
        console.log("Setting the display list, target CODE_NUM is:");
        console.log(e.target.id);

        // Put this search result into the product display if it doesn't already exist in the product display
        if (!productDisplayList.find(element => element.CODE_NUM == searchResult[e.target.id].CODE_NUM)) {
            setProductDisplayList([...productDisplayList, searchResult[e.target.id]]);
        } else {
            console.log("Not adding this product from the search list to the display list since we already have it in there.")
        }

    };

    const changeSearchHandler = (e) => {
        const upperCaseVal = e.target.value.toUpperCase();
        searchForProductByBrandHandler(upperCaseVal);
        setSearchBarValue(upperCaseVal);
    }

    console.log("Search Result is: ");
    console.log(searchResult);
    // console.log("Product Display List Array is: ");
    // console.log(productDisplayList); 
    // console.log("Alphabet trie for the brand name: ");
    // console.log(alphabetTrie.dump());
    return (
        <div>
            <h1>DBF File Reader</h1>
            <input type="file" accept=".dbf" onChange={handleFileChange} />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {data.length > 0 && (
                <p>Data Loaded!</p>
            )}
            <TextField
                id="select-product"
                variant="outlined"
                fullWidth
                lable="Search"
                onChange={changeSearchHandler} />
            {/* <button id="search-button" onClick={searchForProductByCodeHandler}>Search By COD NUM</button>
            <button id="search-button" onClick={searchForProductByBrandHandler}>Search By BRAND</button>
            <button id="search-button" onClick={searchForProductByDescripHandler}>Search By DESCRIP</button> */}
            <div className="content-window">
                {searchResult != null &&
                    <div className="search-result-window">
                        <p> Search Results</p>
                        <ul>
                            {searchResult.map((product, searchIndex) => {
                                return (<li key={product.CODE_NUM}>
                                    <button id={searchIndex} onClick={addProductToDisplayHandler}>{product.BRAND} {product.DESCRIP} {product.SIZE} {"Click To Add"}</button>
                                </li>)
                            })}
                        </ul>

                    </div>
                }
                {searchResult == null &&
                    <div className="search-result-window">{"Didn't find that."}</div>
                }

                <div className="product-display-window">
                    <p> Currently Selected Products</p>
                    {productDisplayList.map((product) => {
                        return (<>
                            
                                <ul>
                                    <li key={product.CODE_NUM}>
                                        <ProductDisplayItem
                                            productData={product} />
                                    </li>
                                </ul>
                            
                        </>)
                    })
                    }
                </div>
            </div>



        </div >
    );
};

export default DBFReaderComponent;
