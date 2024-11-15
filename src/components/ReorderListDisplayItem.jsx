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
                className="simple-product"
                onClick={(event) => showProductDetailsHandler(event, product.INDEX)}>
                {product["BRAND"]} {product["DESCRIP"]} {product["SIZE"]}

            </button>

            <div>
                {product["QTY_ON_HND"]}
            </div>

            <div>
                {format(reorderDate, 'MMM/yy')}
            </div>

            <div>
                {reorderTime}
            </div>

            <div>
                {product["MTD"]}
            </div>

            <div>
                {product["ELEVE"]}
            </div>

            <div>
                {product["TENTH"]}
            </div>

            <button onClick={(event) => addToOrderListHandler(event, product.INDEX)}>
                Add To Order List
            </button>

            <button onClick={(event) => addToOutOfStockHandler(event, product.INDEX)}>
                Mark Out Of Stock
            </button>

            <button onClick={(event) => addToDiscontinuedHandler(event, product.INDEX)}>
                Mark Discontinued
            </button>

            <button onClick={(event) => markAlreadyOrderedHandler(event, product.INDEX)}>
                Already Ordered?
            </button>
            


        </>
    )


}