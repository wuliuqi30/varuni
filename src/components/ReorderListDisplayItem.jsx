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
    addToLabelListHandler,
    addToWatchListHandler,
    addToRecountListHandler

}) {



    return (
        <tr
            ref={(el) => (refList.current[listIndex] = el)}
            tabIndex="0"
            onFocus={(event) => handleFocus(event, product.INDEX,listIndex)}
        >

            <td>{product["BRAND"]}</td>
            <td>{product["DESCRIP"]}</td>
            <td className="large-list-numerical-item">{product["SIZE"]}</td>
            <td className="large-list-numerical-item">
                {product["QTY_ON_HND"]}
            </td>
            <td className="large-list-numerical-item">
                {format(reorderDate, 'MMM/yy')}
            </td>
            <td className="large-list-numerical-item">
                {reorderTime}
            </td>

            <td className="large-list-numerical-item">
                {product["MTD"]}
            </td>

            <td className="large-list-numerical-item">
                {product["ELEVE"]}
            </td>

            <td className="large-list-numerical-item">
                {product["TENTH"]}
            </td>
            <td className="action-button-cell">
                <button
                    tabIndex="-1"
                    className="large-list-click-button" onClick={(event) => addToOrderListHandler(event, product.INDEX)}>
                    Add To Order List
                </button>

                <button
                    tabIndex="-1"
                    className="large-list-click-button" onClick={(event) => addToOutOfStockHandler(event, product.INDEX)}>
                    Out Of Stock?
                </button>

                <button
                    tabIndex="-1"
                    className="large-list-click-button" onClick={(event) => addToDiscontinuedHandler(event, product.INDEX)}>
                    Discontinued?
                </button>

                <button
                    tabIndex="-1"
                    className="large-list-click-button" onClick={(event) => markAlreadyOrderedHandler(event, product.INDEX)}>
                    Already Ordered?
                </button>




                <button
                    tabIndex="-1"
                    className="large-list-click-button" onClick={(event) => addToLabelListHandler(event, product.INDEX)}>
                    Label List?
                </button>

                <button
                    tabIndex="-1"
                    className="large-list-click-button" onClick={(event) => addToWatchListHandler(event, product.INDEX)}>
                    Watch List?
                </button>

                <button
                    tabIndex="-1"
                    className="large-list-click-button" onClick={(event) => addToRecountListHandler(event, product.INDEX)}>
                    Need Recount?
                </button>
            </td>


        </tr>


    )


}