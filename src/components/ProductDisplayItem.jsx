export function ProductDisplayItem({ productData, clickCurrentSelectionItemHandler }) {
    //console.log("In product display item-------------");

    //console.log(productData);
    return (
        <>

            <button
                className="current-selection-item"
                onClick={clickCurrentSelectionItemHandler}>
                {/* {Object.keys(productData).map((keyName, keyIndex) => {
                    console.log(`keyIndex: ${keyIndex}, keyName: ${keyName}, productData[keyIndex]:${productData[keyName]} `);
                    if (productData[keyName] !== undefined) {
                        return (
                            <p key={keyIndex}>{`${keyName}: `}{productData[keyName]}</p>
                        )
                    }
                })} */}
                {/* <p >{productData["BARCODE"]}</p> */}
                <p >{productData["BRAND"]}</p>
                <p >{productData["DESCRIP"]}</p>
                <p >{productData["SIZE"]}</p>
                {/* <p >{productData["QTY_CASE"]}</p>
                <p >{productData["QTY_ON_HND"]}</p>
                <p >{productData["PRIORY"]}</p>
                <p >{productData["MTD"]}</p>
                <p >{productData["YTD"]}</p> */}
            </button>

        </>
    )

}

export function SimpleProduct({ productData, clickHandler }) {
    return (
        <>

            <button
                className="simple-product"
                onClick={clickHandler}>
                {productData["SIZE"]} {productData["DESCRIP"]}

            </button>

        </>
    )

}

export function ListDisplayItem({ productData, clickCurrentSelectionItemHandler }) {
    //console.log("In product display item-------------");

    //console.log(productData);
    return (
        <>

            <button
                className="list-display-info"
                onClick={clickCurrentSelectionItemHandler}>
                <p >{productData["BRAND"]}</p>
                <p >{productData["DESCRIP"]}</p>
                <p >{productData["SIZE"]}</p>
            </button>

        </>
    )

}