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
];

for (const { src, dest } of copies) {
  if (!fs.existsSync(src)) continue;
  fs.cpSync(src, dest, { recursive: true, force: true });
  console.log(`[postbuild] Copied ${path.relative(root, src)} → ${path.relative(root, dest)}`);
}

console.log("[postbuild] Standalone directory ready.");
