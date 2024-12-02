import { listSelectionsEnums } from '../data/constants';
import { ListDisplayItem } from './/ProductDisplayItem';
import { printArrayToString } from '../helper-fns/helperFunctions'
import React, { useRef, useEffect } from 'react';

export function OrderListDisplay({
    data,
    clickItemHandler,
    orderList,
    setOrderList,
    orderListScrollRef,
    addToAlreadyOrderedListHandler

}) {




    const deleteFunction = (event, productIndex) => {

        setOrderList((prevList) => { return prevList.filter(item => item !== productIndex) });

    }

    const addToOrderListHandler =(event, productIndex) => {
        deleteFunction(event, productIndex);
        addToAlreadyOrderedListHandler(event, productIndex);
    }

    const clickClearListHandler = () => {
        const isConfirmed = window.confirm("Are you sure you want to delete everything in the order list? This cannot be undone.");
        if (isConfirmed) {
            setOrderList([]);
        }
    }

    return (
        <div className='order-list-window orderlist-theme'>
            <div className="order-list-header">

                <h3>Order List</h3>
                <button className="order-list-clear-btn" onClick={clickClearListHandler}>Clear List?</button>
            </div>
            {((orderList.length > 0) && (data.length > 0)) &&
                <ul ref={orderListScrollRef} className="order-list">
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
                                <button
                                    className="add-to-order-list-button"
                                    onClick={(event) => addToOrderListHandler(event, thisProduct.INDEX)}>
                                    Ordered?
                                </button>
                                <button
                                    className="list-delete-button"
                                    onClick={(event) => deleteFunction(event, thisProduct.INDEX)}>
                                    X
                                </button>
                            </li>


                        )
                    })
                    }
                </ul>
            }
            {(data.length < 1) && <p> No Data </p>

            }


        </div>
    )
}