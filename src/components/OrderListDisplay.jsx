import { listSelectionsEnums } from '../data/constants';
import { ListDisplayItem } from './/ProductDisplayItem';
import { printArrayToString } from '../helper-fns/helperFunctions'
import { useState } from 'react';

export function OrderListDisplay({
    data,
    clickItemHandler,
    orderList,
    setOrderList

}) {

    const deleteFunction = (event, productIndex) => {

        setOrderList((prevList) => { return prevList.filter(item => item !== productIndex) });

    }

    return (
        <div className='order-list-window'>
            <div className="order-list-header">Order List</div>
            {orderList.length > 0 &&
                <ul className="order-list">
                    {orderList.map((index) => {
                        const thisProduct = data[index];
                        return (
                            <li
                                key={thisProduct.CODE_NUM}
                                id={`selection-${thisProduct.INDEX}`}
                                className='list-result-li'>


                                <button
                                    className="list-display-info"
                                    onClick={(event) => clickItemHandler(event, thisProduct.INDEX)}>
                                    <p>{thisProduct["BRAND"]} {thisProduct["DESCRIP"]} {thisProduct["SIZE"]}</p>

                                </button>
                                <button className="list-delete-button" onClick={(event) => deleteFunction(event, thisProduct.INDEX)}>X</button>
                            </li>


                        )
                    })
                    }
                </ul>}

        </div>
    )
}