
import { Checkbox } from '@mui/material';
export function SearchDisplay({ data, searchDisplayItemsArray, handleCheckBoxClick, showDetailsHandler }) {

    return (<div className="search-result-window">
        <p> Search Results</p>
        <ul>
            {searchDisplayItemsArray.map((searchItemDataIndex) => {
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

    </div>
    )

}