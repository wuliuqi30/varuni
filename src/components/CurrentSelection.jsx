import { ProductDisplayItem } from "./ProductDisplayItem";

export function CurrentSelection({data, selectedProductsList, onRemove}) {

    
    return (
        <div className="current-selection-window">
            <p> Currently Selected Products</p>
            {selectedProductsList.map((index) => {
                const thisProduct = data[index];
                return (<>

                    <ul>
                        <li key={thisProduct.CODE_NUM} id={`selection-${thisProduct.CODE_NUM}`} className='search-result-li'>
                            <ProductDisplayItem
                                productData={thisProduct} />
                            <button onClick={onRemove}> Remove </button>
                        </li>
                    </ul>

                </>)
            })
            }
        </div>
    )
}