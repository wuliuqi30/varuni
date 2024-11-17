import {barChartOptions} from '../data/constants';

export function ReorderListHeader() {

    return (
        <>

            <h4>Product Info</h4>
            <h4 className="reorder-list-header-orientation">QTY</h4>
            <h4 className="reorder-list-header-orientation">Reorder Date</h4>
            <h4 className="reorder-list-header-orientation">Weeks Left?</h4>
            <h4 className="reorder-list-header-orientation">MTD</h4>
            <h4 className="reorder-list-header-orientation">{barChartOptions[13].xlabel.toUpperCase()}</h4>
            <h4 className="reorder-list-header-orientation">{barChartOptions[12].xlabel.toUpperCase()}</h4>   
            {/* The Following are placeholders for Buttons */}
            <h4></h4>
            <h4></h4>
            <h4></h4>
            <h4></h4>
           
            


        </>
    )


}