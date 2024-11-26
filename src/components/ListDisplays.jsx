import { listSelectionsEnums } from '../data/constants';
import { ListDisplayItem } from './/ProductDisplayItem';
import { printArrayToString } from '../helper-fns/helperFunctions'
import { useState } from 'react';

export function ListDisplays({
    data,
    clickItemHandler,
    allLists,
    allListSetterCallbacks
}) {

    const suppressOutput = true;

    const [selectedOption, setSelectedOption] = useState(Object.keys(listSelectionsEnums)[0]);

    const handleChange = (event) => {
        setSelectedOption(event.target.value);
    };

    let currentlyDisplayedList = [];

    let currentListSetterCallback = () => {
        console.log('No List Selected');
    };

    currentlyDisplayedList = allLists[selectedOption];
    currentListSetterCallback = allListSetterCallbacks[selectedOption];
    

    const deleteFunction = (event, productIndex) => {

        currentListSetterCallback((prevList) => { return prevList.filter(item => item !== productIndex) });

    }

    const clickClearListHandler = () => {
        const isConfirmed = window.confirm("Are you sure you want to delete everything in the order list? This cannot be undone.");
        if (isConfirmed) {
            currentListSetterCallback([]);
        }
    }

    if (!suppressOutput) {
        if (currentlyDisplayedList) {
            printArrayToString("CurrentlyDisplayedList:", currentlyDisplayedList);
        }
        console.log("currentListSetterCallback function is:");
        console.log(currentListSetterCallback);

    }


    return (
        <div className='list-display-window'>
            <div className="list-display-header">

                <select
                    id="list-dropdown"
                    className="list-dropdown-styles"
                    value={selectedOption}
                    onChange={handleChange}>
                    {Object.keys(listSelectionsEnums).map((objectKey) => {
                        return (
                            <option key={objectKey} value={objectKey}> {listSelectionsEnums[objectKey].displayName}</option>
                        )
                    })}
                </select>
                <button className="order-list-clear-btn" onClick={clickClearListHandler}>Clear List?</button>
            </div>
            {((currentlyDisplayedList.length > 0) && (data.length > 0)) &&
                <ul className="current-selection-window-list">
                    {currentlyDisplayedList.map((index) => {
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
                </ul>
            }
            {(data.length < 1) && <p> No Data </p>

            }

        </div>
    )
}