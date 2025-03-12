module.exports = {
    isSafe,
    getPossibleValues,
    applyConstraintPropagation,
    solveSudoku,
    isValidSudoku,
    printGrid,
  };
  
  function isSafe(grid, row, col, num) {
    for (let x = 0; x < 9; x++) {
      if (grid[row][x] === num || grid[x][col] === num) return false;
    }
  
    let startRow = row - (row % 3);
    let startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[i + startRow][j + startCol] === num) return false;
      }
    }
  
    return true;
  }
  
  function getPossibleValues(grid, row, col) {
    let possibleValues = [];
    for (let num = 1; num <= 9; num++) {
      if (isSafe(grid, row, col, num)) {
        possibleValues.push(num);
      }
    }
    return possibleValues;
  }
  
  function applyConstraintPropagation(grid) {
    let changed = false;
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === null) {
          const possibleValues = getPossibleValues(grid, row, col);
          if (possibleValues.length === 1) {
            grid[row][col] = possibleValues[0];
            changed = true;
          }
        }
      }
    }
    return changed;
  }
  
  
  function solveSudoku(grid) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === null) {
          for (let num = 1; num <= 9; num++) {
            if (isSafe(grid, row, col, num)) {
              grid[row][col] = num;
              if (solveSudoku(grid)) {
                return true;
              } else {
                grid[row][col] = null;
              }
            }
          }
          return false;
        }
      }
    }
    return true;
  }
  
  function isValidSudoku(grid) {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (grid[i][j] !== null && (grid[i][j] < 1 || grid[i][j] > 9))
          return false;
      }
    }
  
    for (let i = 0; i < 9; i++) {
      let row = new Set();
      let col = new Set();
      let box = new Set();
  
      for (let j = 0; j < 9; j++) {
        if (grid[i][j] !== null) {
          if (row.has(grid[i][j])) return false;
          row.add(grid[i][j]);
        }
  
        if (grid[j][i] !== null) {
          if (col.has(grid[j][i])) return false;
          col.add(grid[j][i]);
        }
  
        let rowIndex = 3 * Math.floor(i / 3) + Math.floor(j / 3);
        let colIndex = 3 * (i % 3) + (j % 3);
  
        if (grid[rowIndex][colIndex] !== null) {
          if (box.has(grid[rowIndex][colIndex])) return false;
          box.add(grid[rowIndex][colIndex]);
        }
      }
    }
    return true;
  }
  
  
  function printGrid(grid) {
    let output = "Sudoku Grid:\n";
    for (let i = 0; i < 9; i++) {
      let rowString = "";
      for (let j = 0; j < 9; j++) {
        rowString += (grid[i][j] === null ? "." : grid[i][j]) + " ";
      }
      output += rowString.trim() + "\n";
    }
    return output;
  }