
import { Checkbox } from '@mui/material';
export function SearchDisplay({ data, searchDisplayItemsArray, handleCheckBoxClick, showDetailsHandler, itemsPerPage, searchPageNumber, setSearchPageNumber }) {

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
            <p> Search Results</p>
            <ul>
                {thisPageResult.map((searchItemDataIndex) => {
                    const thisProduct = data[searchItemDataIndex];
                    return (
                        <li id={`search-result-${thisProduct.CODE_NUM}`} key={thisProduct.CODE_NUM} className='search-result-li'>
                            <Checkbox
                                checked={thisProduct.CHECKED}
                                onChange={handleCheckBoxClick}
                                inputProps={{ 'aria-label': 'controlled' }}
                            />
                            <button
                                className="search-result-li-text"
                                id={`search-result-button-${thisProduct.CODE_NUM}`}
                                onClick={showDetailsHandler}>
                                {thisProduct.BRAND} {thisProduct.DESCRIP} {thisProduct.SIZE} {"Click to view details"}
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