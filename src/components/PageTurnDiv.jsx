export function PageTurnDiv({
    prevPageHandler,
    nextPageHandler,
    lastPage,
    searchPageNumber,
    buttonClassName
 }) {

    return (
        <div className='search-page-turn-div'>

            <button className={`previous-next-button-style ${buttonClassName}`} onClick={prevPageHandler}> Previous Page </button>
            <button className={`previous-next-button-style ${buttonClassName}`} onClick={nextPageHandler}> Next Page </button>
            <p>{`Page ${lastPage === 0 ? 0 : searchPageNumber}/${lastPage}`}</p>

        </div>
    )
}