import { useState } from 'react';



const DBFReaderComponent = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);

    const handleFileChange = async (event) => {
        console.log(`event is: `);
        console.log(event);
        const file = event.target.files[0];
        console.log(`file (type ${typeof file}) is: `);
        console.log(file);
        if (!file) return;

        const reader = new FileReader();
        console.log("instantiated a file reader");

        reader.onload = (e) => {
            try {
                const buffer = e.target.result;
                console.log("found buffer");
                console.log(buffer);
                const view = new DataView(buffer);

                console.log("About to get data from \"view\"");

                const headerHeaderLength = 32;
                const fieldDescriptorSize = 32;
                const year = view.getUint8(1) + 2000; // Add 1900 to the YY value
                const month = view.getUint8(2);        // Get the MM value
                const day = view.getUint8(3);          // Get the DD value

                const numRecords = view.getInt32(4, true);
                const headerSize = view.getInt16(8, true); // Header size
                const recordLength = view.getInt16(10, true); // Record length
                const shouldBeZero = view.getInt16(12, true); // Record length

                console.log(`year: ${year} month: ${month} day: ${day} headerLength: ${headerHeaderLength}, numRecords ${numRecords}, headerNumBytes (from file) ${headerSize} and recordLengthBytes ${recordLength}, shouldBeZero: ${shouldBeZero}`)
                // Read field descriptors (after the header)
                const fields = [];
                let currentOffset = 0
                for (let i = headerHeaderLength; i < headerSize; i += fieldDescriptorSize) {
                    // console.log(`i is ${i}`);
                    const fieldName = String.fromCharCode.apply(null, new Uint8Array(buffer, i, 11)).replace(/\0/g, '');
                    const fieldType = String.fromCharCode(view.getUint8(i + 11));
                    const fieldLength = view.getUint8(i + 16); //
                    if (fieldName === '') break; // End of fields
                    fields.push({ name: fieldName, type: fieldType, length: fieldLength, offset:currentOffset });
                    currentOffset += fieldLength;
                }

                console.log("fields: ");
                console.log(fields);

                // Read records
                const records = [];
                 console.log(`headerSize ${headerSize}, buffer.byteLength ${buffer.byteLength} and recordLength ${recordLength}`);
                 let count = 0;
                for (let i = headerSize; i < buffer.byteLength; i += recordLength) {
                    // console.log(`in for loop for records, i: ${i})`);
                    const record = {};
                    for (const field of fields) {
                        // console.log('field:');
                        // console.log(field);
                        const fieldValue = readFieldValue(view, i, field);
                        // console.log(`fieldValue is ${fieldValue} field.name is ${field.name}`);
                        record[field.name] = fieldValue;
                    }
                    // console.log(`record (${i}): is: `);
                    // console.log(record);
                    records.push(record);
                    count++;
                    if(count > 25){
                        break;
                    }
                }

                setData(records);
            } catch (err) {

                setError('Error reading DBF file: ' + err.message);
            }
        };

        reader.onerror = (err) => {
            setError('File reading failed: ' + err.message);
        };
      
        reader.readAsArrayBuffer(file); // Read the file as an ArrayBuffer
    };

    const readFieldValue = (view, offset, field) => {
        
        const fieldOffset = offset +field.offset; // Calculate field's offset in the record
        // console.log(`in readFieldValue, view ${view} offset ${offset} and field ${field} fieldOffset ${fieldOffset}`);
        // console.log(offset);
        // console.log(field);
        // console.log(fieldOffset);
        if (fieldOffset + field.length > view.byteLength) {
            console.warn(`Skipping field ${field.name} as it exceeds buffer bounds with offset ${fieldOffset} and length ${field.length}`);
            return null; // Skip reading this field
        }

        return String.fromCharCode.apply(null, new Uint8Array(view.buffer, fieldOffset, field.length)).trim();

        // if (field.type === 'C') { // Character
        //     // const length = field.length; // Field length
           
        //     return String.fromCharCode.apply(null, new Uint8Array(view.buffer, fieldOffset, field.length)).trim();
        // } else if (field.type === 'N') { // Numeric
        //     // console.log(`type N, length ${length}`);
        //     const number = view.getFloat64(fieldOffset, true)
        //     return number; // Assuming float64 for numeric values
            
        // } else if (field.type === 'D') { // Date
        //     // console.log(`type D, length ${length}`);
        //     const year = view.getUint8(fieldOffset + 1);
        //     const month = view.getUint8(fieldOffset + 2);
        //     const day = view.getUint8(fieldOffset + 3);
        //     return `${year}-${month}-${day}`;
        // }
        // // Add other field types as necessary
        // return null;
    };

    return (
        <div>
            <h1>DBF File Reader</h1>
            <input type="file" accept=".dbf" onChange={handleFileChange} />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {data.length > 0 && (
                <table>
                    <thead>
                        <tr>
                            {data[0] && Object.keys(data[0]).map((key) => (
                                <th key={key}>{key}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => (
                            <tr key={index}>
                                {Object.values(row).map((value, idx) => (
                                    <td key={idx}>{value}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default DBFReaderComponent;
