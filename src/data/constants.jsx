
const now = new Date();

const monthData = [];

const dbfMonths = ["FIRST",
    "SECON",
    "THIRD",
    "FOURT",
    "FIFTH",
    "SIXTH",
    "SEVEN",
    "EIGHT",
    "NINTH",
    "TENTH",
    "ELEVE",
    "TWELV"]

for (let i = 0; i < 12; i++) {

    monthData[i] = { dbfName: dbfMonths[i], date: new Date(now.getFullYear(), now.getMonth() - i - 1) };
} 

export default monthData;