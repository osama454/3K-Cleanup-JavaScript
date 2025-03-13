function isSafe(grid, row, col, num) {
  // Check row and column for duplicates
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === num || grid[x][col] === num) {
      return false;
    }
  }

  // Check 3x3 box for duplicates
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[i + startRow][j + startCol] === num) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Finds the possible values for a cell given its row, column, and subgrid constraints.
 * @param {number[][]} grid The Sudoku grid.
 * @param {number} row The row index of the cell.
 * @param {number} col The column index of the cell.
 * @returns {number[]} An array of possible values for the cell.
 */
function getPossibleValues(grid, row, col) {
  const usedValues = new Set();

  // Collect used values from row, column, and 3x3 box
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] !== null) usedValues.add(grid[row][x]);
    if (grid[x][col] !== null) usedValues.add(grid[x][col]);
  }

  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = startRow; r < startRow + 3; r++) {
    for (let c = startCol; c < startCol + 3; c++) {
      if (grid[r][c] !== null) usedValues.add(grid[r][c]);
    }
  }

  // Return possible values
  return Array.from({ length: 9 }, (_, i) => i + 1).filter(
    (num) => !usedValues.has(num)
  );
}

/**
 * Applies constraint propagation to fill cells with only one possible value.
 * @param {number[][]} grid The Sudoku grid.
 * @returns {boolean} True if any changes were made, otherwise false.
 */
function applyConstraintPropagation(grid) {
  let changed;
  do {
    changed = false;
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === null) {
          // Check for null
          const possibleValues = getPossibleValues(grid, row, col);
          if (possibleValues.length === 1) {
            grid[row][col] = possibleValues[0];
            changed = true;
          }
        }
      }
    }
  } while (changed);
  return changed;
}

/**
 * Solves the Sudoku puzzle using backtracking.
 *
 * @param {number[][]} grid The Sudoku grid.
 * @returns {boolean} True if a solution exists, false otherwise.
 */
function solveSudoku(grid) {
  // Apply constraint propagation to simplify the grid
  applyConstraintPropagation(grid);

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === null) {
        for (let num = 1; num <= 9; num++) {
          if (isSafe(grid, row, col, num)) {
            grid[row][col] = num;

            if (solveSudoku(grid)) {
              return true;
            }

            // Backtrack
            grid[row][col] = null;
          }
        }
        return false; // No valid number found, backtrack
      }
    }
  }
  return true; // Puzzle solved
}

/**
 * Validates if the given Sudoku solution is correct.
 *
 * @param {number[][]} grid The Sudoku grid.
 * @returns {boolean} True if the solution is valid, false otherwise.
 */
function isValidSudoku(grid) {
  // Validate rows and columns
  for (let row = 0; row < 9; row++) {
    const seenRow = new Set();
    const seenCol = new Set();
    for (let col = 0; col < 9; col++) {
      const numRow = grid[row][col];
      const numCol = grid[col][row];
      if (numRow !== null) {
        if (numRow < 1 || numRow > 9 || seenRow.has(numRow)) {
          return false;
        }
        seenRow.add(numRow);
      }
      if (numCol !== null) {
        if (numCol < 1 || numCol > 9 || seenCol.has(numCol)) {
          return false;
        }
        seenCol.add(numCol);
      }
    }
  }

  // Validate 3x3 boxes
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const seen = new Set();
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const num = grid[boxRow * 3 + row][boxCol * 3 + col];
          if (num !== null) {
            if (num < 1 || num > 9 || seen.has(num)) {
              return false;
            }
            seen.add(num);
          }
        }
      }
    }
  }

  return true; // Valid Sudoku grid
}

/**
 * Prints the Sudoku grid.
 *
 * @param {number[][]} grid The Sudoku grid.
 */
function printGrid(grid) {
  let result = ["Sudoku Grid:"];

  for (let row of grid) {
    const formattedRow = row.map((num) => (num === null ? "." : num)).join(" ");
    result.push(formattedRow);
  }

  return result.join("\n");
}

// Usage Example:
let grid = [
  [5, 3, null, null, 7, null, null, null, null],
  [6, null, null, 1, 9, 5, null, null, null],
  [null, 9, 8, null, null, null, null, 6, null],
  [8, null, null, null, 6, null, null, null, 3],
  [4, null, null, 8, null, 3, null, null, 1],
  [7, null, null, null, 2, null, null, null, 6],
  [null, 6, null, null, null, null, 2, 8, null],
  [null, null, null, 4, 1, 9, null, null, 5],
  [null, null, null, null, 8, null, null, 7, 9],
];

console.log("Sudoku puzzle:");

console.log(printGrid(grid));

if (solveSudoku(grid)) {
  console.log("\nSolved Sudoku:");
  console.log(printGrid(grid));
} else {
  console.log("\nNo solution exists.");
}

// Validation example:
let validGrid = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

if (isValidSudoku(validGrid)) {
  console.log("\nThe provided Sudoku solution is valid.");
} else {
  console.log("\nThe provided Sudoku solution is invalid.");
}

module.exports = {
  isSafe,
  getPossibleValues,
  applyConstraintPropagation,
  solveSudoku,
  isValidSudoku,
  printGrid,
};
