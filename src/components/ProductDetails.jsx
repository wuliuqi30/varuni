import { Chart } from "react-google-charts";
import monthData from "../data/constants";
import { format } from "date-fns";


export function ProductDetails({ productData }) {

    if (productData != null) {
        const data = [
            ["Element", "Number of Sales", { role: "style" }]
        ]
        for (let m = 0; m < 12; m++) {
            //console.log(monthData[m]);
            //console.log(monthData[m].date.getMonth());
            data[m + 1] = [format(monthData[m].date,'MMM'), productData[monthData[m].dbfName], "silver"]
        }

        const options = {
            title: "Sales Data",
            hAxis: {
                title: "Month",
            },
            vAxis: {
                title: `Sales for ${productData.BRAND} ${productData.DESCRIP} ${productData.SIZE}`,
            }
        }



        return (
            <div className="product-details-window">
                <Chart chartType="ColumnChart" width="100%" height="100%" data={data} options={options} />
            </div>
        )
    } else {
        return (
            <div> No Product Selected!</div>
        )
    }
}