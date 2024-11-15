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
                onClick={(event) =>showProductDetailsHandler(event,product.INDEX)}>
                {productData["SIZE"]} {productData["DESCRIP"]}

            </button>


            <div className="">

            </div>

            <div className="">

            </div>

            <div className="">

            </div>

            <div className="">

            </div>

            <div className="">

            </div>

            <div className="">

            </div>

            <div className="">

            </div>

            <div className="">

            </div>

            <div className="">

            </div>


        </>
    )


}