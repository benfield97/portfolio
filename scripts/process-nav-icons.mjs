import fs from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const ICON_NAMES = ["home", "pencil", "book"];
const OUTPUT_SIZE = 40;
const CONTENT_SIZE = 34;
const NAVY = [4, 40, 122];
const BAYER_4X4 = [
  0, 8, 2, 10,
  12, 4, 14, 6,
  3, 11, 1, 9,
  15, 7, 13, 5,
];

const source = path.resolve(
  process.argv[2] ?? "public/nav-icons/source.png",
);
const outputDirectory = path.resolve("public/nav-icons");
const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({
  resolveWithObject: true,
});

if (info.width % ICON_NAMES.length !== 0 || info.channels !== 4) {
  throw new Error("Expected a three-column RGBA source sheet");
}

const cellWidth = info.width / ICON_NAMES.length;
const isMagenta = (red, green, blue) =>
  red > 200 && blue > 170 && green < 100 && red + blue > green * 4;

await fs.mkdir(outputDirectory, { recursive: true });

for (const [column, name] of ICON_NAMES.entries()) {
  const cellX = column * cellWidth;
  let left = cellWidth;
  let top = info.height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < cellWidth; x += 1) {
      const offset = (y * info.width + cellX + x) * 4;
      if (!isMagenta(data[offset], data[offset + 1], data[offset + 2])) {
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
      }
    }
  }

  if (right < left || bottom < top) throw new Error(`${name} cell is empty`);

  const cropWidth = right - left + 1;
  const cropHeight = bottom - top + 1;
  const scale = Math.min(CONTENT_SIZE / cropWidth, CONTENT_SIZE / cropHeight);
  const width = Math.max(1, Math.round(cropWidth * scale));
  const height = Math.max(1, Math.round(cropHeight * scale));
  const resized = await sharp(source)
    .extract({ left: cellX + left, top, width: cropWidth, height: cropHeight })
    .resize(width, height, { kernel: "nearest" })
    .ensureAlpha()
    .raw()
    .toBuffer();

  const output = Buffer.alloc(OUTPUT_SIZE * OUTPUT_SIZE * 4);
  const offsetX = Math.floor((OUTPUT_SIZE - width) / 2);
  const offsetY = Math.floor((OUTPUT_SIZE - height) / 2);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const sourceOffset = (y * width + x) * 4;
      const red = resized[sourceOffset];
      const green = resized[sourceOffset + 1];
      const blue = resized[sourceOffset + 2];
      const alpha = resized[sourceOffset + 3] / 255;
      if (isMagenta(red, green, blue) || alpha === 0) continue;

      const luminance = (red * 0.2126 + green * 0.7152 + blue * 0.0722) / 255;
      const coverage = alpha * Math.min(1, 0.22 + (1 - luminance) * 0.92);
      const threshold =
        (BAYER_4X4[(y % 4) * 4 + (x % 4)] + 0.5) / 16;
      if (coverage < threshold) continue;

      const destinationOffset =
        ((offsetY + y) * OUTPUT_SIZE + offsetX + x) * 4;
      output[destinationOffset] = NAVY[0];
      output[destinationOffset + 1] = NAVY[1];
      output[destinationOffset + 2] = NAVY[2];
      output[destinationOffset + 3] = 255;
    }
  }

  await sharp(output, {
    raw: { width: OUTPUT_SIZE, height: OUTPUT_SIZE, channels: 4 },
  })
    .png()
    .toFile(path.join(outputDirectory, `${name}.png`));
}
