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
import { useState, useEffect } from "react"; // Import useRef

export function ProductDetailsPanel({
    data,
    productDataIndex
}) {

    const suppressOutput = true;
    const [numberOfCasesOrdered, setNumberOfCasesOrdered] = useState(1);

    const productData = data[productDataIndex];

    if (!suppressOutput) {
        console.log(productData);
    }

    const orderCasesHandler = (event, product) => {
        const { value } = event.target;

        setNumberOfCasesOrdered(value);

    }


    useEffect(() => {
        // Focus the element at the focused index
        setNumberOfCasesOrdered(1);
    }, [productDataIndex]);


    if (productData) {

        // calculate reorder point but assuming ordering 0 cases of the item, hence the 0.
        const reorderPoint = calculateReorderPointWithOrderingSheet(productData, 0);
        let runoutLabel;
        if (typeof reorderPoint === 'string') {
            runoutLabel = reorderPoint;
        } else {
            runoutLabel = getWeekOfMonthString(reorderPoint[0]);
        }


        // Calculate How Long setNumberOfCasesOrdered will get us to last:
        const reorderPointWithCaseOrder = calculateReorderPointWithOrderingSheet(productData, numberOfCasesOrdered);
        let runoutLabelWithCaseOrder;
        if (typeof reorderPoint === 'string') {
            runoutLabelWithCaseOrder = reorderPointWithCaseOrder;
        } else {
            runoutLabelWithCaseOrder = getWeekOfMonthString(reorderPointWithCaseOrder[0]);
        }

        const productTitle = `${productData.BRAND} ${productData.DESCRIP} ${productData.SIZE}`;
        const productExtraInfoFirstLine =
            `On Hand: ${productData.QTY_ON_HND}, Last Edit Date: 
    ${format(productData.LAST_EDIT, 'M/d/yy')}`;
        const productExtraInfoSecondLine =
            `Avg/Month ~${Math.round(calculateAverageMonthlySales(productData))}, Runs Out in ${runoutLabel}`;


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
            <div
                className="product-details-window"
                id={`product-details-item-${productData.INDEX}`}>

                <div className="product-details-item-header">
                    <div className="product-details-chart-title">
                        <p className="product-details-title-info" style={{ textAlign: 'left', color: 'red' }}>{productTitle}</p>
                        <p className="product-details-title-info" style={{ textAlign: 'left', color: 'black' }}>{productExtraInfoFirstLine}</p>
                        <p className="product-details-title-info" style={{ textAlign: 'left', color: 'green' }}>{productExtraInfoSecondLine}</p>
                    </div>

                    <div className="product-details-header-right">

                        <p style={{ margin:'0px'}}>
                            {`If ordering `}
                            <input
                                type="number"
                                className="product-details-panel-cases-input"
                                label={'order-calculator'}
                                min={0}
                                onChange={(event) => orderCasesHandler(event, productData)}
                                value={numberOfCasesOrdered}
                            />
                            {`case(s), supply will last until: `}
                        </p>

                        <strong>{runoutLabelWithCaseOrder}</strong>
                    </div>
                    {/* <button className="remove-product-details-button" onClick={removeProductDetailsHandler}>Remove</button> */}
                </div>
                <Chart chartType="ColumnChart" data={data} options={options} />
                <div className="extra-details-block"></div>

            </div>

        )
    } else {
        return (
            <div>No Data</div>
        )
    }

}