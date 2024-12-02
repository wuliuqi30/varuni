export function ActionButtonsPanel({
    data,
    focusedProductIndex,
    removeFromReorderItemsListHandler,
    addToListHandlers
}) {


    // Add to Lists
    const addToOrderListHandlerAndRemoveFromReorderListHandler = (event, productIndex) => {
        removeFromReorderItemsListHandler(event, productIndex);
        addToListHandlers.orderList(event, productIndex);

    }
    const addToOutOfStockHandlerAndRemoveFromReorderListHandler = (event, productIndex) => {
        removeFromReorderItemsListHandler(event, productIndex);
        addToListHandlers.outOfStockList(event, productIndex);
    }
    const addToDiscontinuedHandlerAndRemoveFromReorderListHandler = (event, productIndex) => {
        removeFromReorderItemsListHandler(event, productIndex);
        addToListHandlers.discontinuedList(event, productIndex);
    }
    const markAlreadyOrderedHandlerAndRemoveFromReorderListHandler = (event, productIndex) => {
        removeFromReorderItemsListHandler(event, productIndex);
        addToListHandlers.alreadyOrderedList(event, productIndex);
    }

    const addToLabelListHandlerAndRemoveFromReorderListHandler = (event, productIndex) => {
        removeFromReorderItemsListHandler(event, productIndex);
        addToListHandlers.labelList(event, productIndex);
    }
    const addToWatchListHandlerAndRemoveFromReorderListHandler = (event, productIndex) => {
        removeFromReorderItemsListHandler(event, productIndex);
        addToListHandlers.watchList(event, productIndex);
    }
    const addToRecountListHandlerAndRemoveFromReorderListHandler = (event, productIndex) => {
        removeFromReorderItemsListHandler(event, productIndex);
        addToListHandlers.recountInventoryList(event, productIndex);
    }



    return (
        <>        
        {(data.length > 0 && focusedProductIndex!== null ) &&
            <div className="action-button-cell">
                <h4 className='action-buttons-cell-header'>{`${data[focusedProductIndex].BRAND} ${data[focusedProductIndex].DESCRIP}`}</h4>
                <button
                    tabIndex="-1"
                    className="large-list-click-button orderlist-theme" onClick={(event) => addToOrderListHandlerAndRemoveFromReorderListHandler(event, focusedProductIndex)}>
                    Add To Order List
                </button>

                <button
                    tabIndex="-1"
                    className="large-list-click-button outofstock-theme" onClick={(event) => addToOutOfStockHandlerAndRemoveFromReorderListHandler(event, focusedProductIndex)}>
                    Out Of Stock?
                </button>

                <button
                    tabIndex="-1"
                    className="large-list-click-button discontinued-theme" onClick={(event) => addToDiscontinuedHandlerAndRemoveFromReorderListHandler(event, focusedProductIndex)}>
                    Discontinued?
                </button>

                <button
                    tabIndex="-1"
                    className="large-list-click-button alreadyordered-theme" onClick={(event) => markAlreadyOrderedHandlerAndRemoveFromReorderListHandler(event, focusedProductIndex)}>
                    Already Ordered?
                </button>




                <button
                    tabIndex="-1"
                    className="large-list-click-button labellist-theme" onClick={(event) => addToLabelListHandlerAndRemoveFromReorderListHandler(event, focusedProductIndex)}>
                    Label List?
                </button>

                <button
                    tabIndex="-1"
                    className="large-list-click-button watchlist-theme" onClick={(event) => addToWatchListHandlerAndRemoveFromReorderListHandler(event, focusedProductIndex)}>
                    Watch List?
                </button>

                <button
                    tabIndex="-1"
                    className="large-list-click-button needrecount-theme" onClick={(event) => addToRecountListHandlerAndRemoveFromReorderListHandler(event, focusedProductIndex)}>
                    Need Recount?
                </button>
            </div>
        }
        </>

    )
}