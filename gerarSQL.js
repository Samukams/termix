const fs = require("fs");

const texto = fs.readFileSync(
    "./palavras.txt",
    "utf8"
);

const palavras = texto
    .split(/\s+/)
    .map(p => p.trim().toLowerCase())
    .filter(p => p.length === 5);

let sql = "INSERT INTO words (word) VALUES\n";

sql += palavras
    .map(p => `('${p}')`)
    .join(",\n");

sql += ";";

fs.writeFileSync("palavras.sql", sql);

console.log("SQL GERADO 🔥");