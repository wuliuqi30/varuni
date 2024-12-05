export function readDbfFile(buffer) {
    console.log("entered readdbfile componenet");
    console.log(buffer);
    const view = new DataView(buffer);


    const headerHeaderLength = 32;
    const fieldDescriptorSize = 32;
    const year = view.getUint8(1) + 2000; // Add 1900 to the YY value
    const month = view.getUint8(2);        // Get the MM value
    const day = view.getUint8(3);          // Get the DD value

    const numRecords = view.getInt32(4, true);
    const headerSize = view.getInt16(8, true); // Header size
    const recordLength = view.getInt16(10, true); // Record length
    const shouldBeZero = view.getInt16(12, true); // Record length


    const fields = [];
    let currentOffset = 0
    for (let i = headerHeaderLength; i < headerSize; i += fieldDescriptorSize) {

        const fieldName = String.fromCharCode.apply(null, new Uint8Array(buffer, i, 11)).replace(/[\u0000\u0001\u00FF]/g, '');
        const fieldType = String.fromCharCode(view.getUint8(i + 11));
        const fieldLength = view.getUint8(i + 16); //
        //console.log(`i is ${i}, fieldName ${fieldName}, fieldType ${fieldType} fieldLength: ${fieldLength}`);
        if (fieldName === '') break; // End of fields
        if (fieldType == '5') break;
        fields.push({ name: fieldName, type: fieldType, length: fieldLength, offset: currentOffset });
        currentOffset += fieldLength;
    }

    console.log("Fields: ");
    console.log(fields);

    // Read records
    const records = [];
    //console.log(`headerSize ${headerSize}, buffer.byteLength ${buffer.byteLength} and recordLength ${recordLength}`);
    let count = 0;
    for (let i = headerSize; i < buffer.byteLength; i += recordLength) {
        //console.log(`in for loop for records, i: ${i})`);

        const record = {};
        for (const field of fields) {
            //console.log('field:');
            //console.log(field);
            const fieldValue = readFieldValue(view, i, field, count);
            //console.log(`fieldValue is ${fieldValue} field.name is ${field.name}`);
            record[field.name] = fieldValue;
        }

        // Filter Out Items we don't sell anymore.
       
            records.push(record);
            record["INDEX"] = count;
            // if (count > 400) {
            //     break;
            // }
            count++;
        


    }
    records.pop();

    console.log("Obtained Records: ");
    console.log(records);
    console.log("-------Finished Reading Data, returning records------------");
    return records;

}

const readFieldValue = (view, offset, field, count) => {

    const fieldOffset = offset + field.offset; // Calculate field's offset in the record
    const fieldOffsetModified = offset + field.offset + 1; // Calculate field's offset in the record

    if (fieldOffset + field.length > view.byteLength) {

        return null; // Skip reading this field
    }

    let readField = String.fromCharCode.apply(null, new Uint8Array(view.buffer, fieldOffsetModified, field.length)).trim();
    if (field.type === 'C') { // Character
        return readField;
    } else if (field.type === 'N') { // Numeric
        return Number(readField);

    } else if (field.type == 'D') {
        if (readField === "") {
            return null;
        }
        return new Date(Number(readField.substring(0, 4)), Number(readField.substring(4, 6)) - 1, Number(readField.substring(6, 8)));
    }


};