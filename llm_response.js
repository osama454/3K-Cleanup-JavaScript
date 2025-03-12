function parseCsvData(csvData) {
  if (!csvData) return [];
  const lines = csvData.trim().split("\n");
  const headers = lines[0].split(",");
  if (lines.length === 1) return [];
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const obj = {};
    headers.forEach((header, i) => {
      const value = values[i];
      obj[header] = isNaN(parseInt(value)) ? value : parseInt(value);
    });
    return obj;
  });
}

function getAvailableUnitsInBuilding(apartments, building) {
  return apartments.filter(
    (apartment) =>
      apartment.building === building && apartment.availability === "true"
  );
}

function getAvailableUnitsOnFloor(apartments, building, floor) {
  return apartments.filter(
    (apartment) =>
      apartment.building === building &&
      apartment.floor === floor &&
      apartment.availability === "true"
  );
}

function filterByPriceRange(apartments, minPrice, maxPrice) {
  return apartments.filter(
    (apartment) =>
      apartment.availability === "true" &&
      apartment.price >= minPrice &&
      apartment.price <= maxPrice
  );
}

module.exports.parseCsvData = parseCsvData;
module.exports.getAvailableUnitsByBuilding = getAvailableUnitsInBuilding;
module.exports.getAvailableUnitsByFloor = getAvailableUnitsOnFloor;
module.exports.filterApartmentsByPrice = filterByPriceRange;
