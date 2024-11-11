
import { Checkbox } from '@mui/material';
import { TextField } from '@mui/material';
export function SearchDisplay({
    data,
    changeSearchHandler,
    searchDisplayItemsArray,
    selectedItemsIndicesArray,
    handleCheckBoxClick,
    showDetailsHandler,
    itemsPerPage,
    searchPageNumber,
    setSearchPageNumber,
    handleUncheckAllClick }) {

    const lastPage = Math.ceil(searchDisplayItemsArray.length / itemsPerPage);

    const nextPageHandler = () => {
        setSearchPageNumber(Math.min(searchPageNumber + 1, lastPage));
    }
    const prevPageHandler = () => {
        setSearchPageNumber(Math.max(searchPageNumber - 1, 1));
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
                    onChange={changeSearchHandler} />
                <div className="page-turn-div">

                    <button onClick={prevPageHandler}> {'<'} </button>
                    <button onClick={nextPageHandler}> {'>'} </button>
                    <p>{`Page ${searchPageNumber}/${lastPage}`}</p>

                </div>
                <button className="search-results-clear-all-button" onClick={handleUncheckAllClick}> Uncheck All</button>
            </div>
            <ul>
                {thisPageResult.map((searchItemDataIndex) => {
                    const thisProduct = data[searchItemDataIndex];
                    const thisIsChecked = selectedItemsIndicesArray !== null && selectedItemsIndicesArray.findIndex(item => item === thisProduct.INDEX) > -1;
                    return (
                        <li id={`search-result-${thisProduct.INDEX}`} key={thisProduct.CODE_NUM} className='search-result-li'>
                            <Checkbox
                                checked={thisIsChecked}
                                onChange={handleCheckBoxClick}
                                inputProps={{ 'aria-label': 'controlled' }}
                            />
                            <button
                                className="search-result-li-text"
                                id={`search-result-button-${thisProduct.CODE_NUM}`}
                                onClick={showDetailsHandler}>
                                {thisProduct.BRAND} {thisProduct.DESCRIP} {thisProduct.SIZE}
                            </button>
                        </li>)
                })}
            </ul>

            <div className="page-turn-div">

                <button onClick={prevPageHandler}> Previous Page </button>
                <button onClick={nextPageHandler}> Next Page </button>
                <p>{`Page ${searchPageNumber}/${lastPage}`}</p>

            </div>

        </div>
    )

}