
import { Checkbox } from '@mui/material';
import { TextField } from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import { actionSelectionsEnums } from '../data/constants';
import { PageTurnDiv } from './PageTurnDiv';

export function SmallSearchWindow({
    data,
    changeSearchHandler,
    searchDisplayItemsArray,
    showDetailsHandler,
    searchPageNumber,
    setSearchPageNumber,
    addToAssorterHandler
}) {

    const itemsPerPage = 8;
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
    ;



    const handleFocus = (event, productIndex, listIndex) => {
        console.log(`Product of Index ${productIndex} is focused!`);
        setFocusedIndex(listIndex);
        showDetailsHandler(event, productIndex);
    }

    const handleAddToAssortmentClick = (event, productIndex) => {
        addToAssorterHandler(event, productIndex);
    }

    let thisPageResult = searchDisplayItemsArray.slice((searchPageNumber - 1) * itemsPerPage, (searchPageNumber) * itemsPerPage);
    return (
        <div className="small-search-result-window">
            <h2 className="search-results-title">Search</h2>
            <p style={{textAlign:'left'}}>Instructions: Find products by searching below. Click &quot;Add&quot; to add them to the tool. Once you've added everything you want, click &quot;Calculate&quot;. </p>

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

            </div>
            <table className="large-table-style">
                <thead>
                    <tr tabIndex="0">

                        <th>Brand</th>
                        <th>Description</th>
                        <th>Size</th>
                        <th></th>

                    </tr>
                </thead>
                <tbody>
                    {thisPageResult.map((searchItemDataIndex, index) => {
                        const thisProduct = data[searchItemDataIndex];
                        return (
                            <tr
                                tabIndex="0"
                                key={thisProduct.CODE_NUM}
                                onClick={(event) => showDetailsHandler(event, thisProduct.INDEX)}
                                onFocus={(event) => handleFocus(event, thisProduct.INDEX, index)}
                                ref={(el) => (listOfRefs.current[index] = el)}
                            >

                                <td>{thisProduct.BRAND}</td>
                                <td >{thisProduct.DESCRIP}</td>
                                <td className="large-list-numerical-item">{thisProduct.SIZE}</td>

                                <td className="single-button-table-item">
                                    <button
                                        className="add-to-assorter-button"
                                        onClick={(event) => handleAddToAssortmentClick(event, thisProduct.INDEX)}>
                                        Add!


                                    </button>
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