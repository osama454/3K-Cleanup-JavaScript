const fs = require("fs");

// Sample CSV Data (apartments.csv)
// building,floor,unit,area,price,availability
// A,1,101,800,1500,true
// A,1,102,900,1600,false
// A,2,201,850,1550,true
// A,2,202,950,1700,true
// B,1,101,750,1400,true
// B,1,102,850,1500,false
// B,2,201,900,1600,true

const NUMERICAL_ATTRIBUTES = new Set(["area", "price"]);

function getWords(csvLine) {
  if (typeof csvLine !== "string" && !(csvLine instanceof String)) {
    return [];
  }
  // Trim the line so that any CR characters get removed
  csvLine = csvLine.trim();
  if (csvLine.length === 0) {
    return [];
  }
  // Trim each word so that any leading/trailing spaces get removed
  return csvLine.split(",").map((word) => word.trim());
}

// Function to read and parse CSV data from file (kept for production use)
function readAndParseCsv(filePath) {
  const csvData = fs.readFileSync(filePath, "utf-8");
  return parseCsvData(csvData);
}

// Function to parse CSV data
function parseCsvData(csvData) {
  if (!csvData.trim()) return [];
  const lines = csvData.trim().split("\n");
  const headers = getWords(lines[0]);
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = getWords(lines[i]);
    // Skip empty lines (if any)
    if (values.length === 0) continue;
    const apartment = {};
    for (let j = 0; j < headers.length; j++) {
      let attributeValue = values[j];
      if (NUMERICAL_ATTRIBUTES.has(headers[j])) {
        attributeValue = Number(attributeValue);
      }
      apartment[headers[j]] = attributeValue;
    }
    data.push(apartment);
  }
  return data;
}

// Function to get available units in a building
function getAvailableUnitsInBuilding(data, building) {
  return data.filter(
    (apartment) =>
      apartment.building === building && apartment.availability === "true"
  );
}

// Function to get available units on a specific floor in a building
function getAvailableUnitsOnFloor(data, building, floor) {
  return data.filter(
    (apartment) =>
      apartment.building === building &&
      apartment.floor === floor &&
      apartment.availability === "true"
  );
}

// Function to filter available units by price range
function filterByPriceRange(data, minPrice, maxPrice) {
  return data.filter(
    (apartment) =>
      apartment.availability === "true" &&
      apartment.price >= minPrice &&
      apartment.price <= maxPrice
  );
}

// Sample execution using the sample CSV file (for production/demo purposes)
function testWithSampleData(sampleFile) {
  const apartmentData = readAndParseCsv(sampleFile);
  console.log(
    "Available units in building A:",
    getAvailableUnitsInBuilding(apartmentData, "A")
  );
  console.log(
    "Available units on floor 2 in building A:",
    getAvailableUnitsOnFloor(apartmentData, "A", "2")
  );
  console.log(
    "Available units between $1400 and $1550:",
    filterByPriceRange(apartmentData, 1400, 1550)
  );
}

if (require.main === module) {
  // Uncomment below to test with an external CSV file if available
  testWithSampleData("./apartments.csv");
}

module.exports.parseCsvData = parseCsvData;
module.exports.getAvailableUnitsByBuilding = getAvailableUnitsInBuilding;
module.exports.getAvailableUnitsByFloor = getAvailableUnitsOnFloor;
module.exports.filterApartmentsByPrice = filterByPriceRange;
