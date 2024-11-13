

function getFutureZeroIndexedMonthArray(n){
    // return a length-n array containing the zero-indexed 
    const today = new Date();



}

function printArrayToString(titleString, array, unit){

    let outstring = `${titleString}: `;

    if (unit === undefined || unit === null){
        unit = "";
    }
    if (array.length < 1){
        console.log("Not an array");
    } else{
        
        for (let a = 0; a < array.length - 1; a++){
            outstring += `${array[a]} ${unit}, `;
        }
        outstring += `${array[array.length - 1]} ${unit}.`;
    }
    console.log(outstring);
}

function printOrderAndTime(titleString,productArray,oldProductOrders, oldTimeArray,newProductOrders, newTimeArray){

    const outArray = [];
    for( let i = 0; i < productArray.length; i++){
        outArray[i] = {name: productArray[i].SIZE, 
            order: `${oldProductOrders[i]} cases`, 
            time: `${oldTimeArray[i]} wks.`,
            newOrder: `${newProductOrders[i]} cases`, 
            newTime: `${newTimeArray[i]} wks.`};
    }
    console.log(titleString);
    console.table(outArray);

}


export {getFutureZeroIndexedMonthArray, printArrayToString,printOrderAndTime}