const fs = require("fs");
const path = require("path");

function readAllFiles(dir) {
  let idealOutput = "";
  let fileCounter = 1;

  function traverseDirectory(currentPath) {
    const files = fs.readdirSync(currentPath);

    files.forEach((file) => {
      const fullPath = path.join(currentPath, file);
      const relativePath = path.relative(process.cwd(), fullPath);

      // Ignore specific files and directories
      const ignoredFiles = [
        "package.json",
        "package-lock.json",
        "ideal.md",
        "package.md",
        "test.md",
        "solution.test.js",
        "zz.js",
        "yarn.lock",
        "replit.nix",
        "pnpm-lock.yaml",
        "prompt.md",
        "zz.py"
      ];
      const ignoredDirs = ["node_modules", "__mocks__", "dist"];
      const ignoredExtensions = [".png", ".jpg", ".mp4"];

      // Ignore folders starting with .
      if (path.basename(fullPath).startsWith(".")) {
        return;
      }

      // Ignore specific files
      if (
        ignoredFiles.includes(file) ||
        ignoredDirs.some((dir) => relativePath.includes(dir)) ||
        ignoredExtensions.some((ext) => fullPath.endsWith(ext))
      ) {
        return;
      }

      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        traverseDirectory(fullPath);
      } else {
        try {
          const fileContent = fs.readFileSync(fullPath, "utf8");
          const fileExtension = path.extname(file).slice(1);

          idealOutput += `${fileCounter}. \`${relativePath}\`\n`;
          idealOutput += `\`\`\`${fileExtension}\n`;
          idealOutput += `${fileContent}\n`;
          idealOutput += "```\n\n";

          fileCounter++;
        } catch (error) {
          console.error(`Error reading file ${fullPath}: ${error}`);
        }
      }
    });
  }

  traverseDirectory(dir);
  return idealOutput;
}

function main() {
  const projectDir = process.cwd();

  // Ideal MD (all project files)
  const idealFileContent = readAllFiles(projectDir);
  fs.writeFileSync("ideal.md", idealFileContent, "utf8");

  // Package MD (package.json)
  try {
    const packageJsonContent = fs.readFileSync("package.json", "utf8");
    fs.writeFileSync(
      "package.md",
      "```json\n" + packageJsonContent + "\n```",
      "utf8"
    );
  } catch (error) {
    console.error("Error reading package.json:", error);
  }

  // Test MD (solution.test.js)
  try {
    const testFileContent = fs.readFileSync("solution.test.js", "utf8");
    fs.writeFileSync(
      "test.md",
      "```javascript\n" + testFileContent + "\n```",
      "utf8"
    );
  } catch (error) {
    console.error("Error reading solution.test.js:", error);
  }

  console.log("Files have been written: ideal.md, package.md, test.md");
}

main();