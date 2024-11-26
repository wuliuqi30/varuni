export function PageTurnDiv({
    prevPageHandler,
    nextPageHandler,
    lastPage,
    searchPageNumber
 }) {

    return (
        <div className="search-page-turn-div">

            <button className="previous-next-button-style" onClick={prevPageHandler}> Previous Page </button>
            <button className="previous-next-button-style" onClick={nextPageHandler}> Next Page </button>
            <p>{`Page ${lastPage === 0 ? 0 : searchPageNumber}/${lastPage}`}</p>

        </div>
    )
}