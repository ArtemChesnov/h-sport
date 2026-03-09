const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const standalone = path.join(root, ".next", "standalone");

if (!fs.existsSync(standalone)) {
  console.log("[postbuild] No standalone directory found, skipping.");
  process.exit(0);
}

const copies = [
  { src: path.join(root, ".next", "static"), dest: path.join(standalone, ".next", "static") },
  { src: path.join(root, "public"), dest: path.join(standalone, "public") },
  // pdfkit: данные шрифтов (afm) — bundled-код ищет их в .next/server/chunks/data, копируем из пакета
  { src: path.join(root, "node_modules", "pdfkit", "js", "data"), dest: path.join(standalone, ".next", "server", "chunks", "data") },
];

for (const { src, dest } of copies) {
  if (!fs.existsSync(src)) continue;
  fs.cpSync(src, dest, { recursive: true, force: true });
  console.log(`[postbuild] Copied ${path.relative(root, src)} → ${path.relative(root, dest)}`);
}

console.log("[postbuild] Standalone directory ready.");
