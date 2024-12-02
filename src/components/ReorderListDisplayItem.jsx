import { format } from "date-fns"
import {  getWeekOfMonthString} from '../helper-fns/helperFunctions';

export function ReorderListDisplayItem({
    product,
    listIndex,
    refList,
    handleFocus,
    reorderDate,
    reorderTime,
    handleKeyDown

}) {



    return (
        <tr
            ref={(el) => (refList.current[listIndex] = el)}
            tabIndex="0"
            onFocus={(event) => handleFocus(event, product.INDEX,listIndex)}
            className="hersh-generic-table-row"
            onKeyDown={handleKeyDown}
        >

            <td className="large-list-text-item">{product["BRAND"]}</td>
            <td className="large-list-text-item">{product["DESCRIP"]}</td>
            <td className="large-list-numerical-item">{product["SIZE"]}</td>
            <td className="large-list-numerical-item">
                {product["QTY_ON_HND"]}
            </td>
            <td className="large-list-numerical-item">
                {getWeekOfMonthString(reorderDate)}
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


        </tr>


    )


}