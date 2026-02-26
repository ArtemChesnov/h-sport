"use strict";
const path = require("path");
const fs = require("fs");

/**
 * Workaround: Next.js server runtime делает require("./<id>.js") относительно каталога
 * загружаемого модуля; чанки эмитятся в .next/server/chunks/ → MODULE_NOT_FOUND.
 * Копируем чанки в корень server/ и во все подкаталоги server/app/..., чтобы
 * require из любых page.js находил чанки.
 */
function collectDirsWithJs(dir, list) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let hasJs = false;
  for (const e of entries) {
    if (e.isFile() && e.name.endsWith(".js")) {
      hasJs = true;
      break;
    }
  }
  if (hasJs) list.push(dir);
  for (const e of entries) {
    if (e.isDirectory()) collectDirsWithJs(path.join(dir, e.name), list);
  }
}

function copyServerChunksPlugin() {
  return {
    apply(compiler) {
      compiler.hooks.afterEmit.tapAsync("CopyServerChunksToServerRoot", (compilation, callback) => {
        const outDir = compilation.outputOptions.path;
        if (!outDir) {
          callback();
          return;
        }
        const chunksDir = path.join(outDir, "chunks");
        try {
          if (!fs.existsSync(chunksDir)) {
            callback();
            return;
          }
          const chunkFiles = fs.readdirSync(chunksDir).filter((f) => f.endsWith(".js"));
          if (chunkFiles.length === 0) {
            callback();
            return;
          }
          const targetDirs = [outDir];
          const appDir = path.join(outDir, "app");
          if (fs.existsSync(appDir)) {
            collectDirsWithJs(appDir, targetDirs);
          }
          let copied = 0;
          for (const dir of targetDirs) {
            for (const f of chunkFiles) {
              fs.copyFileSync(path.join(chunksDir, f), path.join(dir, f));
              copied++;
            }
          }
          if (copied > 0) {
            console.log(
              `[CopyServerChunks] Copied ${chunkFiles.length} chunk(s) to ${targetDirs.length} dir(s) (${copied} files)`
            );
          }
          callback();
        } catch (err) {
          console.error("[CopyServerChunks] Failed to copy chunks:", err.message);
          callback(err);
        }
      });
    },
  };
}

module.exports = { copyServerChunksPlugin };
