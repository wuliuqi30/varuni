import { ProductDisplayItem } from "./ProductDisplayItem";

export function CurrentSelection({ 
    data, 
    selectedProductsList, 
    onRemove, 
    clickCurrentSelectionItemHandler }) {


    return (
        <div className="current-selection-window">
            <h2> Currently Selected Products</h2>
            <ul className="current-selection-window-list">
                {selectedProductsList.map((index) => {
                    const thisProduct = data[index];
                    return (<>


                        <li key={thisProduct.CODE_NUM} id={`selection-${thisProduct.INDEX}`} className='search-result-li'>
                            <ProductDisplayItem
                                productData={thisProduct}
                                clickCurrentSelectionItemHandler={(event) => clickCurrentSelectionItemHandler(event, thisProduct.INDEX)} />
                            <button onClick={onRemove}> Remove </button>
                        </li>


                    </>)
                })
                }
            </ul>
        </div>
    )
}