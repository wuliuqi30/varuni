
import { Checkbox } from '@mui/material';
import { TextField } from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import { actionSelectionsEnums } from '../data/constants';
import { PageTurnDiv } from './PageTurnDiv';

export function SearchWindow({
    data,
    changeSearchHandler,
    searchDisplayItemsArray,
    selectedItemsIndicesArray,
    handleCheckBoxClick,
    showDetailsHandler,
    searchPageNumber,
    setSearchPageNumber,
    handleUncheckAllClick,
    allAddToListHandlers }) {

    const itemsPerPage = 11;
    const lastPage = Math.ceil(searchDisplayItemsArray.length / itemsPerPage);
    const [focusedIndex, setFocusedIndex] = useState(0);
    const listOfRefs = useRef([]);

    const nextPageHandler = () => {
        setSearchPageNumber(Math.min(searchPageNumber + 1, lastPage));
    }

    const prevPageHandler = () => {
        setSearchPageNumber(Math.max(searchPageNumber - 1, 1));
    }

    const onChangeSearch = (e) => {
        setSearchPageNumber(1);
        changeSearchHandler(e);

    }

    // Function to handle keydown event
    const handleKeyDown = (e) => {
        if (e.key === "ArrowDown") {
            // Move focus to the next element
            setFocusedIndex((prevIndex) => Math.min(prevIndex + 1, listOfRefs.current.length - 1));
        } else if (e.key === "ArrowUp") {
            // Move focus to the previous element
            setFocusedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
        }
    };

    useEffect(() => {
        // Add event listener for keydown
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            // Cleanup event listener on unmount
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    useEffect(() => {
        // Focus the element at the focused index
        if (listOfRefs.current[focusedIndex]) {
            listOfRefs.current[focusedIndex].focus();
            
        }
    }, [focusedIndex]);



    // Action Buttons
    const [selectedOption, setSelectedOption] = useState(actionSelectionsEnums.orderList.name);
    const defaultOption = 'Click for Actions';

    const handleActionChange = (event, productIndex) => {
        // Add item to appropriate list. Also set the selected option.
        const actionKey = event.target.value;
        const fcnCallback = allAddToListHandlers[actionKey];
        fcnCallback(event, productIndex);
        // switch (actionName) {
        //     case actionSelectionsEnums.orderList.name:
        //         experimentalOrderListHandlerList.orderListHandler(event, productIndex);
        //         break;
        //     case actionSelectionsEnums.reorderedAlreadyList.name:
        //         markAlreadyOrderedHandler(event, productIndex);
        //         break;
        //     case actionSelectionsEnums.outOfStockList.name:
        //         addToOutOfStockHandler(event, productIndex);
        //         break;
        //     case actionSelectionsEnums.discontinuedList.name:
        //         addToDiscontinuedHandler(event, productIndex);
        //         break;
        //     default: console.log("Selection Invalid");

        // }
        setSelectedOption(actionKey);
    };

    const handleFocus = (event, productIndex, listIndex) => {
        console.log(`Product of Index ${productIndex} is focused!`);
        setFocusedIndex(listIndex);
        showDetailsHandler(event, productIndex);
    }

    let thisPageResult = searchDisplayItemsArray.slice((searchPageNumber - 1) * itemsPerPage, (searchPageNumber) * itemsPerPage);
    return (
        <div className="search-result-window">
            <h2 className="search-results-title">Search</h2>
            <div className="search-results-header">
                <input
                    type="text"
                    className='search-bar'
                    id="select-product"
                    label="Search"
                    onChange={onChangeSearch} />
                <PageTurnDiv
                    prevPageHandler={prevPageHandler}
                    nextPageHandler={nextPageHandler}
                    lastPage={lastPage}
                    searchPageNumber={searchPageNumber}
                />
                <button className="search-results-clear-all-button" onClick={handleUncheckAllClick}> Uncheck All</button>
            </div>
            <table >
                <thead>
                    <tr tabIndex="0">
                        <th>Select</th>
                        <th>Brand</th>
                        <th>Description</th>
                        <th>Size</th>
                        <th>Price</th>
                        <th>Cost</th>
                        <th>Qty</th>
                        <th>Case Qty</th>
                        <th>Action</th>

                    </tr>
                </thead>
                <tbody >
                    {thisPageResult.map((searchItemDataIndex, index) => {
                        const thisProduct = data[searchItemDataIndex];
                        const thisIsChecked = selectedItemsIndicesArray !== null && selectedItemsIndicesArray.findIndex(item => item === thisProduct.INDEX) > -1;
                        return (
                            <tr
                                tabIndex="0"
                                key={thisProduct.CODE_NUM}
                                onClick={(event) => showDetailsHandler(event, thisProduct.INDEX)}
                                onFocus={(event) => handleFocus(event, thisProduct.INDEX, index)}
                                ref={(el) => (listOfRefs.current[index] = el)}
                                className="hersh-generic-table-row"
                            >
                                <td>
                                    <Checkbox
                                        checked={thisIsChecked}

                                        onChange={(event) => handleCheckBoxClick(event, thisProduct.INDEX)}
                                        inputProps={{ 'aria-label': 'controlled' }}

                                    />
                                </td>
                                <td>{thisProduct.BRAND}</td>
                                <td >{thisProduct.DESCRIP}</td>
                                <td className="large-list-numerical-item">{thisProduct.SIZE}</td>
                                <td className="large-list-numerical-item">{thisProduct.PRICE.toFixed(2)}</td>
                                <td className="large-list-numerical-item">{thisProduct.COST.toFixed(2)}</td>
                                <td className="large-list-numerical-item">{thisProduct.QTY_ON_HND}</td>
                                <td className="large-list-numerical-item">{thisProduct.QTY_CASE}</td>
                                <td>
                                    <select

                                        value={defaultOption}
                                        className="search-result-dropdown"
                                        onChange={(event) => handleActionChange(event, thisProduct.INDEX)}>
                                        <option key={defaultOption} value={defaultOption}> {defaultOption}</option>
                                        {Object.keys(actionSelectionsEnums).map((objectKey) => {
                                            return (
                                                <option key={objectKey} value={objectKey}> {actionSelectionsEnums[objectKey].displayName}</option>
                                            )
                                        })}


                                    </select>
                                </td>


                            </tr>
                        )
                    })}
                </tbody>
            </table>
            {(data.length < 1) && <p> No Data </p>

            }
            <PageTurnDiv
                prevPageHandler={prevPageHandler}
                nextPageHandler={nextPageHandler}
                lastPage={lastPage}
                searchPageNumber={searchPageNumber}
            />

        </div>
    )

}