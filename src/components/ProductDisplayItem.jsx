export function ProductDisplayItem({productData}){
   console.log("IN product display item")
    return (
        <div className="product-display-item">
            <p>{productData.BRAND}</p>
            <p>{productData.DESCRIP}</p>
            <p>{productData.CODE_NUM}</p>
            <p>{productData.SIZE}</p>
        </div>
    )

}