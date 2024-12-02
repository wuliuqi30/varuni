import { Chart } from "react-google-charts";
import { barChartOptions } from "../data/constants";
import { format } from "date-fns"
import {
    printArrayToString,
    printOrderAndTime,
    calculateReorderPointFromQuantity,
    calculateReorderPointWithOrderingSheet,
    getLastTwelveMonthSales,
    calculateAverageMonthlySales,
    getWeekOfMonthString
} from '../helper-fns/helperFunctions';

export function ProductDetailsPanel({
    data,
    productDetailsIndexList,
    removeProductDetailsHandler,
    clearProductDetailsPanelHandler,
    flexDirection
 }) {

    const suppressOutput = true;
    let windowClassName;
    if (flexDirection === 'column') {
        windowClassName = 'product-details-window-column';
    } else {
        windowClassName = 'product-details-window-row';
    }
    if (!suppressOutput) {
        console.log(productDetailsIndexList);
    }

    // Run out Times.
    const runoutTimeLabelArray = [];

    for (let i = 0; i < productDetailsIndexList.length; i++) {
        // calculate reorder point but assuming ordering 0 cases of the item, hence the 0.
        const reorderPoint = calculateReorderPointWithOrderingSheet(data[productDetailsIndexList[i]], 0);
        let runoutLabel;
        if (typeof reorderPoint === 'string') {
            runoutLabel = reorderPoint;
        } else {
            runoutLabel = getWeekOfMonthString(reorderPoint[0]);
        }

        runoutTimeLabelArray[i] = runoutLabel;
    }
    if (productDetailsIndexList.length > 0) {

        const productDataArray = [];
        for (let i = 0; i < productDetailsIndexList.length; i++) {
            productDataArray[i] = data[productDetailsIndexList[i]];
        }
        if (!suppressOutput) {
            console.log(productDataArray);
        }
        return (
            <div className={windowClassName}>
                {/* {(flexDirection === 'column') &&
                    <div className="product-details-header">

                        <button className="remove-items-button" onClick={clearProductDetailsPanelHandler}>Clear Details Panel</button>
                    </div>
                } */}
                {productDataArray.map((productData, index) => {
                    const productTitle = `${productData.BRAND} ${productData.DESCRIP} ${productData.SIZE}`;
                    const productExtraInfoFirstLine = 
                    `On Hand: ${productData.QTY_ON_HND}, Last Edit Date: 
                    ${format(productData.LAST_EDIT,'M/d/yy')}`;
                    const productExtraInfoSecondLine = 
                    `Avg/Month ~${Math.round(calculateAverageMonthlySales(productData))}, Runs Out in ${runoutTimeLabelArray[index]}`;
                    
                    
                    const data = [
                        ["Element", "Number of Sales", { role: "style" }, { type: 'number', role: 'annotation' }]
                    ]

                    for (let m = 0; m < barChartOptions.length; m++) {
                        //console.log(`m is ${m}`);
                        //console.log(barChartOptions[m]);
                        //console.log(monthData[m].date.getMonth());

                        data[m + 1] = [
                            barChartOptions[m].xlabel,
                            productData[barChartOptions[m].dbfName],
                            `stroke-color: black; stroke-width: 1; fill-color: ${barChartOptions[m].color}`,
                            productData[barChartOptions[m].dbfName]
                        ]
                    }

                    const options = {
                        legend: { position: 'none' },
                        annotations: {
                            alwaysOutside: true
                        },
                        chartArea: {
                            left: 20,
                            right: 20
                        }
                    }

                    if (!suppressOutput) {
                        console.log("productData is: ");
                        console.log(productData);
                    }
                    return (

                        <li
                            key={productData.INDEX}
                            className="product-details-item"
                            id={`product-details-item-${productData.INDEX}`}>
                            <div className="product-details-item-header">
                                <div className="product-details-chart-title">
                                    <p style={{textAlign:'left', color: 'red', margin:'0'}}>{productTitle}</p>
                                    <p style={{textAlign:'left', color:'black', margin:'0'}}>{productExtraInfoFirstLine}</p>
                                    <p style={{textAlign:'left', color:'green', margin:'0'}}>{productExtraInfoSecondLine}</p>
                                </div>
                                {/* <button className="remove-product-details-button" onClick={removeProductDetailsHandler}>Remove</button> */}
                            </div>
                            <Chart chartType="ColumnChart" data={data} options={options} />
                            <div className="extra-details-block"></div>

                        </li>

                    )
                })}

            </div>
        )
    } else {
        return (
            <div className="product-details-window">
                No Product Selected!
            </div>

        )
    }
}