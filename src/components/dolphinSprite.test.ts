import path from "node:path";

import sharp from "sharp";
import { describe, expect, it } from "vitest";

const FRAME_WIDTH = 128;
const FRAME_HEIGHT = 160;
const COLUMNS = 5;
const ROWS = 4;

interface FrameMetrics {
  centroidX: number;
  centroidY: number;
  bounds: { left: number; top: number; right: number; bottom: number };
}

async function measureFrames(): Promise<FrameMetrics[]> {
  const source = path.resolve("public/dolphin-sprite-sheet.png");
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({
    resolveWithObject: true,
  });

  expect(info.width).toBe(FRAME_WIDTH * COLUMNS);
  expect(info.height).toBe(FRAME_HEIGHT * ROWS);
  expect(info.channels).toBe(4);

  const frames: FrameMetrics[] = [];
  for (let row = 0; row < ROWS; row += 1) {
    for (let column = 0; column < COLUMNS; column += 1) {
      let alphaTotal = 0;
      let weightedX = 0;
      let weightedY = 0;
      let left = FRAME_WIDTH;
      let top = FRAME_HEIGHT;
      let right = -1;
      let bottom = -1;

      for (let y = 0; y < FRAME_HEIGHT; y += 1) {
        for (let x = 0; x < FRAME_WIDTH; x += 1) {
          const imageX = column * FRAME_WIDTH + x;
          const imageY = row * FRAME_HEIGHT + y;
          const alpha = data[(imageY * info.width + imageX) * 4 + 3];
          if (alpha === 0) continue;
          alphaTotal += alpha;
          weightedX += x * alpha;
          weightedY += y * alpha;
          left = Math.min(left, x);
          top = Math.min(top, y);
          right = Math.max(right, x);
          bottom = Math.max(bottom, y);
        }
      }

      frames.push({
        centroidX: weightedX / alphaTotal,
        centroidY: weightedY / alphaTotal,
        bounds: { left, top, right, bottom },
      });
    }
  }
  return frames;
}

describe("dolphin sprite registration", () => {
  it("keeps every swim and bend frame on one stable center without clipping", async () => {
    const frames = await measureFrames();

    for (const frame of frames) {
      expect(Math.abs(frame.centroidX - FRAME_WIDTH / 2)).toBeLessThanOrEqual(1);
      expect(Math.abs(frame.centroidY - FRAME_HEIGHT / 2)).toBeLessThanOrEqual(1);
      expect(frame.bounds.left).toBeGreaterThan(0);
      expect(frame.bounds.top).toBeGreaterThan(0);
      expect(frame.bounds.right).toBeLessThan(FRAME_WIDTH - 1);
      expect(frame.bounds.bottom).toBeLessThan(FRAME_HEIGHT - 1);
    }
  });
});
