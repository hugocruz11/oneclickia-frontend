/**
 * Lista los textos de la UI que todavía no están en el diccionario inglés.
 *
 *   npm run i18n:missing
 *
 * Como la clave de traducción ES el texto en español, una clave ausente no
 * rompe nada (la UI muestra español); este script solo sirve para ver qué
 * falta por traducir después de tocar la interfaz.
 *
 * Limitación conocida: solo detecta llamadas con literal — `t("…")`,
 * `t('…')`, `translate(locale, "…")` y `<RichText>{"…"}</RichText>`. Los
 * textos que se pasan por variable (`t(item.label)`, típico de las tablas
 * de etiquetas) hay que revisarlos a mano.
 */
import fs from "node:fs";
import path from "node:path";

const SRC = "src";
const DICT = "src/i18n/messages/en.ts";

const CALL_PATTERNS = [
  /\bt\(\s*"((?:[^"\\]|\\.)*)"/g,
  /\bt\(\s*'((?:[^'\\]|\\.)*)'/g,
  /translate\(\s*\w+\s*,\s*"((?:[^"\\]|\\.)*)"/g,
  /<RichText[^>]*>\s*\{\s*"((?:[^"\\]|\\.)*)"\s*\}/g,
];

/** Claves de primer nivel del objeto exportado por el diccionario. */
const DICT_KEY = /^\s{2}(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|([\p{L}_$][\p{L}\p{N}_$]*)):/gmu;

const unescape = (s) =>
  s.replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\\\/g, "\\");

function collectUsedKeys(dir, out = new Set()) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (full.includes(path.join("src", "i18n"))) continue;
      collectUsedKeys(full, out);
    } else if (/\.tsx?$/.test(full)) {
      const src = fs.readFileSync(full, "utf8");
      for (const re of CALL_PATTERNS) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(src))) out.add(unescape(m[1]));
      }
    }
  }
  return out;
}

function collectDictKeys(file) {
  const src = fs.readFileSync(file, "utf8");
  const out = new Set();
  let m;
  while ((m = DICT_KEY.exec(src))) out.add(unescape(m[1] ?? m[2] ?? m[3]));
  return out;
}

const used = collectUsedKeys(SRC);
const translated = collectDictKeys(DICT);
const missing = [...used]
  .filter((k) => !translated.has(k))
  .sort((a, b) => a.localeCompare(b, "es"));

console.log(`Textos en la UI: ${used.size}`);
console.log(`Entradas en en.ts: ${translated.size}`);
console.log(`Sin traducir: ${missing.length}`);
if (missing.length) console.log("\n" + missing.map((k) => `  ${JSON.stringify(k)}: "",`).join("\n"));
