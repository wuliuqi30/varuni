import { format } from "date-fns"

export function ReorderListDisplayItem({
    product,
    reorderDate,
    reorderTime,
    addToOrderListHandler,
    addToOutOfStockHandler,
    addToDiscontinuedHandler,
    markAlreadyOrderedHandler,
    showProductDetailsHandler
}) {

    return (
        <>

            <button
                className="reorder-list-product-info"
                onClick={(event) => showProductDetailsHandler(event, product.INDEX)}>
                {product["BRAND"]} {product["DESCRIP"]} {product["SIZE"]}

            </button>

            <div className="reorder-list-numerical-item">
                {product["QTY_ON_HND"]}
            </div>

            <div className="reorder-list-numerical-item">
                {format(reorderDate, 'MMM/yy')}
            </div>

            <div className="reorder-list-numerical-item">
                {reorderTime}
            </div>

            <div className="reorder-list-numerical-item">
                {product["MTD"]}
            </div>

            <div className="reorder-list-numerical-item">
                {product["ELEVE"]}
            </div>

            <div className="reorder-list-numerical-item">
                {product["TENTH"]}
            </div>

            <button className="reorder-list-click-button" onClick={(event) => addToOrderListHandler(event, product.INDEX)}>
                Add To Order List
            </button>

            <button  className="reorder-list-click-button" onClick={(event) => addToOutOfStockHandler(event, product.INDEX)}>
                Mark Out Of Stock
            </button>

            <button  className="reorder-list-click-button" onClick={(event) => addToDiscontinuedHandler(event, product.INDEX)}>
                Mark Discontinued
            </button>

            <button  className="reorder-list-click-button" onClick={(event) => markAlreadyOrderedHandler(event, product.INDEX)}>
                Already Ordered?
            </button>
            


        </>
    )


}