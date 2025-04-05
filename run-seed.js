const path = require("path");

const args = process.argv.slice(2);
if (!args[0]) {
  console.error("❌ Masukin nama file seed-nya (tanpa .js), contoh: `npm run seed myfile`");
  process.exit(1);
}

const seedName = args[0];
const filePath = path.resolve(__dirname, "database", "seed", `${seedName}.js`);

console.log(`🚀 Running seed: ${filePath}`);
require(filePath);