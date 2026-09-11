import fs from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const FRAME_WIDTH = 128;
const FRAME_HEIGHT = 160;
const COLUMNS = 5;
const ROWS = 4;
const SOURCE = path.resolve("public/dolphin-sprite-sheet.png");
const TEMPORARY = path.resolve("public/dolphin-sprite-sheet.registered.png");

const { data, info } = await sharp(SOURCE).ensureAlpha().raw().toBuffer({
  resolveWithObject: true,
});

if (
  info.width !== FRAME_WIDTH * COLUMNS ||
  info.height !== FRAME_HEIGHT * ROWS ||
  info.channels !== 4
) {
  throw new Error(
    `Expected a ${FRAME_WIDTH * COLUMNS}x${FRAME_HEIGHT * ROWS} RGBA sprite sheet`,
  );
}

const output = Buffer.alloc(data.length);
const registrations = [];

for (let row = 0; row < ROWS; row += 1) {
  for (let column = 0; column < COLUMNS; column += 1) {
    let alphaTotal = 0;
    let weightedX = 0;
    let weightedY = 0;

    for (let y = 0; y < FRAME_HEIGHT; y += 1) {
      for (let x = 0; x < FRAME_WIDTH; x += 1) {
        const sourceX = column * FRAME_WIDTH + x;
        const sourceY = row * FRAME_HEIGHT + y;
        const alpha = data[(sourceY * info.width + sourceX) * 4 + 3];
        alphaTotal += alpha;
        weightedX += x * alpha;
        weightedY += y * alpha;
      }
    }

    if (alphaTotal === 0) throw new Error(`Frame ${column},${row} is empty`);

    const centroidX = weightedX / alphaTotal;
    const centroidY = weightedY / alphaTotal;
    const offsetX = Math.round(FRAME_WIDTH / 2 - centroidX);
    const offsetY = Math.round(FRAME_HEIGHT / 2 - centroidY);
    registrations.push({ column, row, offsetX, offsetY });

    for (let y = 0; y < FRAME_HEIGHT; y += 1) {
      for (let x = 0; x < FRAME_WIDTH; x += 1) {
        const destinationX = x + offsetX;
        const destinationY = y + offsetY;
        if (
          destinationX < 0 ||
          destinationX >= FRAME_WIDTH ||
          destinationY < 0 ||
          destinationY >= FRAME_HEIGHT
        ) {
          const sourceX = column * FRAME_WIDTH + x;
          const sourceY = row * FRAME_HEIGHT + y;
          const alpha = data[(sourceY * info.width + sourceX) * 4 + 3];
          if (alpha !== 0) {
            throw new Error(`Registration would clip frame ${column},${row}`);
          }
          continue;
        }

        const sourceX = column * FRAME_WIDTH + x;
        const sourceY = row * FRAME_HEIGHT + y;
        const destinationGlobalX = column * FRAME_WIDTH + destinationX;
        const destinationGlobalY = row * FRAME_HEIGHT + destinationY;
        const sourceOffset = (sourceY * info.width + sourceX) * 4;
        const destinationOffset =
          (destinationGlobalY * info.width + destinationGlobalX) * 4;
        data.copy(output, destinationOffset, sourceOffset, sourceOffset + 4);
      }
    }
  }
}

await sharp(output, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .png()
  .toFile(TEMPORARY);
await fs.rename(TEMPORARY, SOURCE);
console.log(JSON.stringify(registrations));
