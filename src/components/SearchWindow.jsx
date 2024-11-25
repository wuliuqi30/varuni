
import { Checkbox } from '@mui/material';
import { TextField } from '@mui/material';
import { useState } from 'react';
import { actionSelectionsEnums } from '../data/constants';
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
    addToOrderListHandler,
    addToOutOfStockHandler,
    addToDiscontinuedHandler,
    markAlreadyOrderedHandler }) {

    const itemsPerPage = 12;
    const lastPage = Math.ceil(searchDisplayItemsArray.length / itemsPerPage);

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

    // Action Buttons
    const [selectedOption, setSelectedOption] = useState(actionSelectionsEnums.orderList.name);
    const defaultOption = 'Click for Actions';

    const handleActionChange = (event, productIndex) => {
        // Add item to appropriate list. Also set the selected option.
        const actionName = event.target.value;
        switch (actionName) {
            case actionSelectionsEnums.orderList.name:
                addToOrderListHandler(event, productIndex);
                break;
            case actionSelectionsEnums.reorderedAlreadyList.name:
                markAlreadyOrderedHandler(event, productIndex);
                break;
            case actionSelectionsEnums.outOfStockList.name:
                addToOutOfStockHandler(event, productIndex);
                break;
            case actionSelectionsEnums.discontinuedList.name:
                addToDiscontinuedHandler(event, productIndex);
                break;
            default: console.log("Selection Invalid");

        }
        setSelectedOption(actionName);
    };

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
                <div className="page-turn-div">

                    <button onClick={prevPageHandler}> {'<'} </button>
                    <button onClick={nextPageHandler}> {'>'} </button>
                    <p>{`Page ${lastPage === 0 ? 0 : searchPageNumber}/${lastPage}`}</p>

                </div>
                <button className="search-results-clear-all-button" onClick={handleUncheckAllClick}> Uncheck All</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Select</th>
                        <th>Brand</th>
                        <th>Description</th>
                        <th>Size</th>
                        <th>Price</th>
                        <th>Cost</th>
                        <th>Qty Per Case</th>
                        <th>Action</th>

                    </tr>
                </thead>
                <tbody>
                    {thisPageResult.map((searchItemDataIndex) => {
                        const thisProduct = data[searchItemDataIndex];
                        const thisIsChecked = selectedItemsIndicesArray !== null && selectedItemsIndicesArray.findIndex(item => item === thisProduct.INDEX) > -1;
                        return (
                            <tr
                                key={thisProduct.CODE_NUM}
                                onClick={(event) => showDetailsHandler(event, thisProduct.INDEX)}
                            >
                                <td>
                                    <Checkbox
                                        checked={thisIsChecked}
                                        onChange={(event) => handleCheckBoxClick(event, thisProduct.INDEX) }
                                        inputProps={{ 'aria-label': 'controlled' }}
                                    />
                                </td>
                                <td>{thisProduct.BRAND}</td>
                                <td>{thisProduct.DESCRIP}</td>
                                <td>{thisProduct.SIZE}</td>
                                <td>{thisProduct.PRICE}</td>
                                <td>{thisProduct.COST}</td>
                                <td>{thisProduct.QTY_CASE}</td>
                                <td>
                                    <select

                                        value={defaultOption}
                                        className="search-result-dropdown"
                                        onChange={(event) => handleActionChange(event, thisProduct.INDEX)}>
                                        <option key={defaultOption} value={defaultOption}> {defaultOption}</option>
                                        {Object.values(actionSelectionsEnums).map((listObject) => {
                                            return (
                                                <option key={listObject.name} value={listObject.name}> {listObject.displayName}</option>
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

            <div className="search-page-turn-div">

                <button onClick={prevPageHandler}> Previous Page </button>
                <button onClick={nextPageHandler}> Next Page </button>
                <p>{`Page ${lastPage === 0 ? 0 : searchPageNumber}/${lastPage}`}</p>

            </div>

        </div>
    )

}