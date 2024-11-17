import { listSelectionsEnums } from '../data/constants';
import { ProductDisplayItem } from './/ProductDisplayItem';
import { printArrayToString } from '../helper-fns/helperFunctions'
import { useState } from 'react';

export function ListDisplays({
    data,
    clickItemHandler,
    selectedProductsList,
    setSelectedProductsList,
    orderList,
    setOrderList,
    outOfStockList,
    setOutOfStockList,
    discontinuedList,
    setDiscontinuedList,
    alreadyOrderedList,
    setAlreadyOrderedList

}) {

    const suppressOutput = false;

    const [selectedOption, setSelectedOption] = useState(listSelectionsEnums.selectionList.name);

    const handleChange = (event) => {
        setSelectedOption(event.target.value);
    };

    let currentlyDisplayedList = [];

    let currentListSetterCallback = () => {
        console.log('No List Selected');
    };

    switch (selectedOption) {
        case 'selection-list':
            currentlyDisplayedList = selectedProductsList;
            currentListSetterCallback = setSelectedProductsList;
            break;
        case 'order-list':
            currentlyDisplayedList = orderList;
            currentListSetterCallback = setOrderList;
            break;

        case 'out-of-stock-list':
            currentlyDisplayedList = outOfStockList;
            currentListSetterCallback = setOutOfStockList;
            break;
        case 'discontinued-list':
            currentlyDisplayedList = discontinuedList;
            currentListSetterCallback = setDiscontinuedList;
            break;
        case 'already-ordered-list':
            currentlyDisplayedList = alreadyOrderedList;
            currentListSetterCallback = setAlreadyOrderedList;
            break;
        default:
            console.log('No List Selected');

    }

    const setListFunction = (event, productIndex) => {

        currentListSetterCallback((prevList) => { return prevList.filter(item => item !== productIndex) });

    }

    if (!suppressOutput) {
        if (currentlyDisplayedList) {
            printArrayToString("CurrentlyDisplayedList:", currentlyDisplayedList);
        }
        console.log("currentListSetterCallback function is:");
        console.log(currentListSetterCallback);

    }
    return (
        <div className='list-display-window'>
            <div className="list-header">
                <label htmlFor="list-dropdown">
                    Select A List
                </label>
                <select
                    id="list-dropdown"
                    value={selectedOption}
                    onChange={handleChange}>
                    {Object.values(listSelectionsEnums).map((listObject) => {
                        return (
                            <option key={listObject.name} value={listObject.name}> {listObject.displayName}</option>
                        )
                    })}


                </select>
            </div>
            {currentlyDisplayedList.length > 0 &&
                <ul className="current-selection-window-list">
                    {currentlyDisplayedList.map((index) => {
                        const thisProduct = data[index];
                        return (
                            <li key={thisProduct.CODE_NUM} id={`selection-${thisProduct.INDEX}`} className='search-result-li'>
                                <ProductDisplayItem
                                    productData={thisProduct}
                                    clickCurrentSelectionItemHandler={(event) => clickItemHandler(event, thisProduct.INDEX)} />
                                <button onClick={(event) => setListFunction(event, thisProduct.INDEX)}> Remove </button>
                            </li>


                        )
                    })
                    }
                </ul>}

        </div>
    )
}