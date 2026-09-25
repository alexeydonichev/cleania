import sharp from "sharp";
import { mkdir } from "node:fs/promises";

// Mechanical delivery variants of the approved raster, with no redraw or recolour.
const root = new URL("../public/brand/", import.meta.url);
await mkdir(root, { recursive: true });
const input = new URL("bleskpro-approved.png", root).pathname;
const logo = await sharp(input).extract({ left: 168, top: 159, width: 1786, height: 406 }).toBuffer();
await sharp(logo).webp({ lossless: true }).toFile(new URL("bleskpro-logo.webp", root).pathname);
const mark = await sharp(input).extract({ left: 168, top: 159, width: 404, height: 406 }).toBuffer();
for (const size of [32, 64, 180]) {
  await sharp(mark).resize(size, size, { fit: "contain", background: "white" }).png().toFile(new URL(size === 180 ? "apple-touch-icon.png" : `favicon-${size}.png`, root).pathname);
}
await sharp(logo).resize(1056, 240, { fit: "contain", background: "white" }).extend({ left: 72, right: 72, top: 195, bottom: 195, background: "white" }).png().toFile(new URL("social-preview.png", root).pathname);
