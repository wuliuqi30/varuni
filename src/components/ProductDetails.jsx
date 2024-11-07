import { Chart } from "react-google-charts";
import barChartOptions from "../data/constants";
import { format } from "date-fns";


export function ProductDetails({ productData }) {

   
    if (productData != null) {
        const productTitle = `${productData.BRAND} ${productData.DESCRIP} ${productData.SIZE}, On Hand: ${productData.QTY_ON_HND}`;
        
        const data = [
            ["Element", "Number of Sales", { role: "style" }, {type:'number', role:'annotation'}]
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
            annotations:{
                alwaysOutside: true
            }
        }



        return (
            <div className="product-details-window">
                <div className= "product-details-chart-title">{productTitle}</div>
                <Chart chartType="ColumnChart" width="100%" height="100%" data={data} options={options} />
            </div>
        )
    } else {
        return (
            <div> No Product Selected!</div>
        )
    }
}