// Generates the PWA icon set from src/assets/logo.svg into public/.
// Run with:  npm run icons
// Re-run whenever the logo changes.
import sharp from "sharp";
import { readFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const SRC = resolve(root, "src/assets/logo.svg");
const OUT = resolve(root, "public");
const TEAL = "#3da0a0"; // matches the logo background

mkdirSync(OUT, { recursive: true });

const svg = readFileSync(SRC);

// Transparent-background icons ("any" purpose).
async function plain(size, name) {
  await sharp(svg, { density: 384 })
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(resolve(OUT, name));
}

// Full-bleed icon on the teal background, with the logo inset into the
// "safe zone" (used for maskable + iOS, which don't keep transparency).
async function filled(size, name, scale) {
  const inner = Math.round(size * scale);
  const logo = await sharp(svg, { density: 384 })
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background: TEAL },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(resolve(OUT, name));
}

await Promise.all([
  plain(192, "pwa-192.png"),
  plain(512, "pwa-512.png"),
  filled(512, "maskable-512.png", 0.7), // safe zone for Android masking
  filled(180, "apple-touch-icon.png", 0.92),
  filled(32, "favicon-32.png", 0.92),
]);

console.log("✓ PWA icons written to public/");
