import sharp from "sharp";
import { mkdir } from "node:fs/promises";

// Mechanical delivery variants of the generated blue recolour; no further redraw.
const root = new URL("../public/brand/", import.meta.url);
await mkdir(root, { recursive: true });
const input = new URL("bleskpro-blue-source.png", root).pathname;
const logo = await sharp(input).extract({ left: 0, top: 115, width: 2170, height: 493 }).resize(1786, 406, { fit: "contain", background: "white" }).toBuffer();
await sharp(logo).webp({ lossless: true }).toFile(new URL("bleskpro-logo-blue.webp", root).pathname);
const mark = await sharp(input).extract({ left: 0, top: 115, width: 482, height: 493 }).toBuffer();
for (const size of [32, 64, 180]) {
  await sharp(mark).resize(size, size, { fit: "contain", background: "white" }).png().toFile(new URL(size === 180 ? "apple-touch-icon-blue.png" : `favicon-${size}-blue.png`, root).pathname);
}
await sharp(logo).resize(1056, 240, { fit: "contain", background: "white" }).extend({ left: 72, right: 72, top: 195, bottom: 195, background: "white" }).png().toFile(new URL("social-preview-blue.png", root).pathname);
