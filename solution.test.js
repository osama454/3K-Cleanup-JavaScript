const assert = require("assert");
const {
  parseCsvData,
  getAvailableUnitsByBuilding,
  getAvailableUnitsByFloor,
  filterApartmentsByPrice,
} = require("./solution");

describe("Apartment Management System", () => {
  let apartments;
  const csvData = `building,floor,unit,area,price,availability
A,1,101,800,1500,true
A,1,102,900,1600,false
A,2,201,850,1550,true
A,2,202,950,1700,true
B,1,101,750,1400,true
B,1,102,850,1500,false
B,2,201,900,1600,true`;

  beforeEach(() => {
    apartments = parseCsvData(csvData);
  });

  describe("parseCsvData", () => {
    it("should parse CSV data correctly", () => {
      const testCsv =
        "building,floor,unit,area,price,availability\nA,1,101,800,1500,true\nA,1,102,900,1600,false";
      const expected = [
        {
          building: "A",
          floor: "1",
          unit: "101",
          area: 800,
          price: 1500,
          availability: "true",
        },
        {
          building: "A",
          floor: "1",
          unit: "102",
          area: 900,
          price: 1600,
          availability: "false",
        },
      ];
      const parsedData = parseCsvData(testCsv);
      assert.equal(parsedData.length, 2);
      assert.equal(typeof parsedData[0].area, "number");
      assert.equal(typeof parsedData[0].price, "number");
      assert.deepStrictEqual(parsedData, expected);
    });

    it("should handle empty CSV data", () => {
      assert.deepStrictEqual(parseCsvData(""), []);
    });

    it("should handle CSV data with only headers", () => {
      const headerOnly = "building,floor,unit,area,price,availability";
      assert.deepStrictEqual(parseCsvData(headerOnly), []);
    });
  });

  describe("getAvailableUnitsByBuilding", () => {
    it("should return available units in a building", () => {
      const expected = [
        {
          building: "A",
          floor: "1",
          unit: "101",
          area: 800,
          price: 1500,
          availability: "true",
        },
        {
          building: "A",
          floor: "2",
          unit: "201",
          area: 850,
          price: 1550,
          availability: "true",
        },
        {
          building: "A",
          floor: "2",
          unit: "202",
          area: 950,
          price: 1700,
          availability: "true",
        },
      ];
      assert.deepStrictEqual(
        getAvailableUnitsByBuilding(apartments, "A"),
        expected
      );
    });

    it("should return an empty array if no units are available", () => {
      assert.deepStrictEqual(getAvailableUnitsByBuilding(apartments, "D"), []);
    });

    it("should handle a building that doesn't exist", () => {
      assert.deepStrictEqual(getAvailableUnitsByBuilding(apartments, "X"), []);
    });
  });

  describe("getAvailableUnitsByFloor", () => {
    it("should return available units on a specific floor and building", () => {
      const expected = [
        {
          building: "B",
          floor: "2",
          unit: "201",
          area: 900,
          price: 1600,
          availability: "true",
        },
      ];
      assert.deepStrictEqual(
        getAvailableUnitsByFloor(apartments, "B", "2"),
        expected
      );
    });

    it("should return an empty array if no units are available on that floor", () => {
      assert.deepStrictEqual(
        getAvailableUnitsByFloor(apartments, "A", "3"),
        []
      );
    });

    it("should return an empty array if the building doesn't exist", () => {
      assert.deepStrictEqual(
        getAvailableUnitsByFloor(apartments, "X", "1"),
        []
      );
    });
  });

  describe("filterApartmentsByPrice", () => {
    it("should filter available apartments by price range", () => {
      const expected = [
        {
          building: "A",
          floor: "1",
          unit: "101",
          area: 800,
          price: 1500,
          availability: "true",
        },
        {
          building: "A",
          floor: "2",
          unit: "201",
          area: 850,
          price: 1550,
          availability: "true",
        },
        {
          building: "B",
          floor: "1",
          unit: "101",
          area: 750,
          price: 1400,
          availability: "true",
        },
      ];
      assert.deepStrictEqual(
        filterApartmentsByPrice(apartments, 1400, 1550),
        expected
      );
    });

    it("should return an empty array if no apartments match the price range", () => {
      assert.deepStrictEqual(
        filterApartmentsByPrice(apartments, 2000, 2500),
        []
      );
    });

    it("should handle edge cases for price range", () => {
      const expected = [
        {
          building: "A",
          floor: "1",
          unit: "101",
          area: 800,
          price: 1500,
          availability: "true",
        },
      ];
      assert.deepStrictEqual(
        filterApartmentsByPrice(apartments, 1500, 1500),
        expected
      );
    });
  });
});
