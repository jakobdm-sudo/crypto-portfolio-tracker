import fs from "fs";
import path from "path";

const sourceDir = "node_modules/cryptocurrency-icons/svg/color";
const targetDir = "public/crypto-icons";

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copy SVG files
fs.readdirSync(sourceDir)
  .filter((file) => file.endsWith(".svg"))
  .forEach((file) => {
    fs.copyFileSync(
      path.join(sourceDir, file),
      path.join(targetDir, file.toLowerCase()),
    );
  });
