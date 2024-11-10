import { Chart } from "react-google-charts";
import { barChartOptions } from "../data/constants";



export function ProductDetailsPanel({ data, productDetailsIndexList }) {

    const suppressOutput = true;
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
            <div className="product-details-window">
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
                        }
                    }

                    if (!suppressOutput) {
                        console.log("productData is: ");
                        console.log(productData);
                    }
                    return (
                        <div key={productData.index} className="product-details-item">
                            <div className="product-details-chart-title">{productTitle}</div>
                            <Chart chartType="ColumnChart" width="100%" height="100%" data={data} options={options} />
                            <div className="extra-details-block"></div>
                        </div>
                    )
                })}

            </div>
            )
    } else {
        return (
            <div> No Product Selected!</div>
        )
    }
}