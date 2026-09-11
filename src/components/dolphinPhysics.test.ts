import { describe, expect, it } from "vitest";

import {
  DEFAULT_DOLPHIN_CONFIG,
  advanceDolphin,
  getRippleViewport,
  selectBend,
  shortestAngle,
  shouldAnimateMotion,
  spriteColumnForBend,
  swimPhaseFromDistance,
  shouldEmitRipple,
  type DolphinState,
} from "./dolphinPhysics";

const state = (overrides: Partial<DolphinState> = {}): DolphinState => ({
  x: 100,
  y: 100,
  heading: 0,
  angularVelocity: 0,
  speed: 0,
  distanceTravelled: 0,
  ...overrides,
});

describe("shortestAngle", () => {
  it("turns through the wraparound instead of taking the long way", () => {
    expect(shortestAngle(350, 10)).toBe(20);
    expect(shortestAngle(10, 350)).toBe(-20);
  });
});

describe("advanceDolphin", () => {
  it("builds angular velocity gradually and respects the configured cap", () => {
    let current = state();

    for (let index = 0; index < 120; index += 1) {
      current = advanceDolphin(
        current,
        { x: 500, y: 100 },
        1 / 60,
        DEFAULT_DOLPHIN_CONFIG,
      );
    }

    expect(current.angularVelocity).toBeGreaterThan(0);
    expect(current.angularVelocity).toBeLessThanOrEqual(
      DEFAULT_DOLPHIN_CONFIG.maxTurnRate,
    );
  });

  it("produces a curved path rather than rotating in place on a sharp turn", () => {
    let current = state({ speed: 180 });

    for (let index = 0; index < 30; index += 1) {
      current = advanceDolphin(
        current,
        { x: 500, y: 100 },
        1 / 60,
        DEFAULT_DOLPHIN_CONFIG,
      );
    }

    expect(current.heading).toBeGreaterThan(0);
    expect(current.x).toBeGreaterThan(100);
    expect(current.y).toBeLessThan(100);
    expect(current.distanceTravelled).toBeGreaterThan(0);
  });
  it("preserves heading and angular velocity when target position is identical", () => {
    const current = state({ heading: 137, angularVelocity: 0 });
    const next = advanceDolphin(
      current,
      { x: current.x, y: current.y },
      1 / 60,
      DEFAULT_DOLPHIN_CONFIG,
    );

    expect(next.heading).toBe(137);
    expect(next.angularVelocity).toBe(0);
  });
});

describe("motion accessibility", () => {
  it("disables continuous animation when reduced motion is requested", () => {
    expect(shouldAnimateMotion(false)).toBe(true);
    expect(shouldAnimateMotion(true)).toBe(false);
  });
});

describe("getRippleViewport", () => {
  it("uses DPR for the backing store but CSS pixels for shader distances", () => {
    expect(getRippleViewport(1000, 600, 1.5)).toEqual({
      backingWidth: 1500,
      backingHeight: 900,
      shaderWidth: 1000,
      shaderHeight: 600,
    });
  });
});

describe("selectBend", () => {
  it("maps gradual and sharp steering to distinct bend poses", () => {
    expect(selectBend(0.08, 0)).toBe(0);
    expect(selectBend(0.35, 0)).toBe(1);
    expect(selectBend(0.85, 1)).toBe(2);
    expect(selectBend(-0.35, 0)).toBe(-1);
    expect(selectBend(-0.85, -1)).toBe(-2);
  });

  it("uses hysteresis when relaxing to avoid flickering near a boundary", () => {
    expect(selectBend(0.16, 1)).toBe(1);
    expect(selectBend(0.08, 1)).toBe(0);
    expect(selectBend(0.56, 2)).toBe(2);
    expect(selectBend(0.45, 2)).toBe(1);
  });
});

describe("spriteColumnForBend", () => {
  it("maps clockwise/right steering to the visually right-facing nose poses", () => {
    expect(spriteColumnForBend(-2)).toBe(4);
    expect(spriteColumnForBend(-1)).toBe(3);
    expect(spriteColumnForBend(0)).toBe(2);
    expect(spriteColumnForBend(1)).toBe(1);
    expect(spriteColumnForBend(2)).toBe(0);
  });
});

describe("swimPhaseFromDistance", () => {
  it("advances four phases from distance travelled and loops", () => {
    expect(swimPhaseFromDistance(0, 80)).toBe(0);
    expect(swimPhaseFromDistance(20, 80)).toBe(1);
    expect(swimPhaseFromDistance(40, 80)).toBe(2);
    expect(swimPhaseFromDistance(60, 80)).toBe(3);
    expect(swimPhaseFromDistance(80, 80)).toBe(0);
  });
});

describe("shouldEmitRipple", () => {
  it("requires both sufficient movement and swimming speed", () => {
    expect(shouldEmitRipple({ x: 0, y: 0 }, { x: 30, y: 0 }, 120)).toBe(true);
    expect(shouldEmitRipple({ x: 0, y: 0 }, { x: 10, y: 0 }, 120)).toBe(false);
    expect(shouldEmitRipple({ x: 0, y: 0 }, { x: 30, y: 0 }, 20)).toBe(false);
  });
});
