// User-approved local retouch; no generative changes to the room.
// Usage: node scripts/retouch-hero.mjs source.png output.webp detail.png
import sharp from "sharp";

const [source, output, detail] = process.argv.slice(2);
if (!source || !output || !detail) throw new Error("Provide source, output and detail paths");
const { data, info } = await sharp(source).removeAlpha().raw().toBuffer({ resolveWithObject: true });
if (info.width !== 1672 || info.height !== 941) throw new Error("This retouch is calibrated to the 1672 × 941 hero source");
const original = Buffer.from(data);
const pixel = (x, y, channel) => (y * info.width + x) * 3 + channel;

// Reconstruct only the narrow PVC strip carrying the unwanted right hardware.
// Each column interpolates undamaged material directly above and below it.
for (let y = 249; y <= 355; y++) for (let x = 513; x <= 532; x++) {
  const vertical = (y - 249) / (355 - 249);
  const feather = Math.min(1, (x - 512) / 2, (533 - x) / 2, (y - 248) / 3, (356 - y) / 3);
  for (let c = 0; c < 3; c++) {
    const upper = (original[pixel(x, 245, c)] + original[pixel(x, 246, c)] + original[pixel(x, 247, c)]) / 3;
    const lower = (original[pixel(x, 357, c)] + original[pixel(x, 358, c)] + original[pixel(x, 359, c)]) / 3;
    const value = upper * (1 - vertical) + lower * vertical;
    data[pixel(x, y, c)] = Math.round(value * feather + original[pixel(x, y, c)] * (1 - feather));
  }
}

// Clone the intact left handle by exactly 27 px horizontally: identical height,
// size and orientation. A soft edge blends only the surrounding PVC, not the lever.
for (let y = 251; y <= 305; y++) for (let x = 486; x <= 504; x++) {
  const alpha = Math.min(1, (x - 485) / 3, (505 - x) / 3, (y - 250) / 4, (306 - y) / 4);
  for (let c = 0; c < 3; c++) {
    const to = pixel(x + 27, y, c);
    data[to] = Math.round(original[pixel(x, y, c)] * alpha + data[to] * (1 - alpha));
  }
}

const edited = sharp(data, { raw: { width: info.width, height: info.height, channels: 3 } });
await edited.clone().webp({ quality: 88, effort: 6 }).toFile(output);
await edited.clone().extract({ left: 468, top: 237, width: 89, height: 155 }).resize({ width: 445 }).png().toFile(detail);
console.log("Retouched only the right frame/handle. Two handles now share exact source y coordinates.");
