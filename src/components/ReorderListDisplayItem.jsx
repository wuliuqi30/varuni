import { format } from "date-fns"
import React, { useRef, useEffect } from "react";

export function ReorderListDisplayItem({
    product,
    listIndex,
    refList,
    handleFocus,
    reorderDate,
    reorderTime,
    addToOrderListHandler,
    addToOutOfStockHandler,
    addToDiscontinuedHandler,
    markAlreadyOrderedHandler,
    showProductDetailsHandler
}) {



    return (
        <tr
            ref={(el) => (refList.current[listIndex] = el)}
            tabIndex="0"
            onFocus={(event) => handleFocus(event, product.INDEX,listIndex)}
        >

            <td>{product["BRAND"]}</td>
            <td>{product["DESCRIP"]}</td>
            <td className="reorder-list-numerical-item">{product["SIZE"]}</td>
            <td className="reorder-list-numerical-item">
                {product["QTY_ON_HND"]}
            </td>
            <td className="reorder-list-numerical-item">
                {format(reorderDate, 'MMM/yy')}
            </td>
            <td className="reorder-list-numerical-item">
                {reorderTime}
            </td>

            <td className="reorder-list-numerical-item">
                {product["MTD"]}
            </td>

            <td className="reorder-list-numerical-item">
                {product["ELEVE"]}
            </td>

            <td className="reorder-list-numerical-item">
                {product["TENTH"]}
            </td>
            <td className="reorder-button-cell">
                <button
                    tabIndex="-1"
                    className="reorder-list-click-button" onClick={(event) => addToOrderListHandler(event, product.INDEX)}>
                    Add To Order List
                </button>

                <button
                    tabIndex="-1"
                    className="reorder-list-click-button" onClick={(event) => addToOutOfStockHandler(event, product.INDEX)}>
                    Mark Out Of Stock
                </button>

                <button
                    tabIndex="-1"
                    className="reorder-list-click-button" onClick={(event) => addToDiscontinuedHandler(event, product.INDEX)}>
                    Mark Discontinued
                </button>

                <button
                    tabIndex="-1"
                    className="reorder-list-click-button"
                    onClick={(event) => markAlreadyOrderedHandler(event, product.INDEX)}>
                    Already Ordered?
                </button>
            </td>


        </tr>


    )


}