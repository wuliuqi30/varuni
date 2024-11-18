import { Chart } from "react-google-charts";
import { barChartOptions } from "../data/constants";



export function ProductDetailsPanel({
    data,
    productDetailsIndexList,
    removeProductDetailsHandler,
    clearProductDetailsPanelHandler,
    flexDirection }) {

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
                {(flexDirection === 'column') &&
                    <div className="product-details-header">

                        <button className="remove-items-button" onClick={clearProductDetailsPanelHandler}>Clear Details Panel</button>
                    </div>
                }
                {productDataArray.map((productData) => {
                    const productTitle = `${productData.BRAND} ${productData.DESCRIP} ${productData.SIZE}, On Hand: ${productData.QTY_ON_HND}`;

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
                                <div className="product-details-chart-title">{productTitle}</div>
                                <button className="remove-product-details-button" onClick={removeProductDetailsHandler}>Remove</button>
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