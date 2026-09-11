export interface Point {
  x: number;
  y: number;
}

export interface DolphinState extends Point {
  heading: number;
  angularVelocity: number;
  speed: number;
  distanceTravelled: number;
}

export interface DolphinConfig {
  followDistance: number;
  slowRadius: number;
  maxSpeed: number;
  acceleration: number;
  deceleration: number;
  maxTurnRate: number;
  turnAcceleration: number;
  steeringResponse: number;
}

export const DEFAULT_DOLPHIN_CONFIG: DolphinConfig = {
  followDistance: 72,
  slowRadius: 320,
  maxSpeed: 430,
  acceleration: 520,
  deceleration: 620,
  maxTurnRate: 210,
  turnAcceleration: 620,
  steeringResponse: 4.2,
};

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

const moveTowards = (value: number, target: number, maximumDelta: number) => {
  if (Math.abs(target - value) <= maximumDelta) return target;
  return value + Math.sign(target - value) * maximumDelta;
};

export function shortestAngle(from: number, to: number) {
  return ((to - from + 540) % 360) - 180;
}

export function advanceDolphin(
  current: DolphinState,
  target: Point,
  deltaSeconds: number,
  config: DolphinConfig = DEFAULT_DOLPHIN_CONFIG,
): DolphinState {
  const dt = clamp(deltaSeconds, 0, 1 / 20);
  const dx = target.x - current.x;
  const dy = target.y - current.y;
  const distanceToTarget = Math.hypot(dx, dy);
  const hasDirectionalTarget = distanceToTarget > 0.001;
  const desiredHeading = hasDirectionalTarget
    ? (Math.atan2(dy, dx) * 180) / Math.PI + 90
    : current.heading;
  const headingError = shortestAngle(current.heading, desiredHeading);

  const targetTurnRate = clamp(
    headingError * config.steeringResponse,
    -config.maxTurnRate,
    config.maxTurnRate,
  );
  const angularVelocity = moveTowards(
    current.angularVelocity,
    targetTurnRate,
    config.turnAcceleration * dt,
  );
  const heading = current.heading + angularVelocity * dt;

  const remainingDistance = Math.max(0, distanceToTarget - config.followDistance);
  const speedRatio = clamp(remainingDistance / config.slowRadius, 0, 1);
  const targetSpeed = config.maxSpeed * Math.sqrt(speedRatio);
  const speedDelta =
    targetSpeed > current.speed ? config.acceleration : config.deceleration;
  const speed = moveTowards(current.speed, targetSpeed, speedDelta * dt);

  const radians = (heading * Math.PI) / 180;
  const travelled = speed * dt;
  const x = current.x + Math.sin(radians) * travelled;
  const y = current.y - Math.cos(radians) * travelled;

  return {
    x,
    y,
    heading,
    angularVelocity,
    speed,
    distanceTravelled: current.distanceTravelled + travelled,
  };
}

export type BendPose = -2 | -1 | 0 | 1 | 2;

export function selectBend(
  normalizedTurnRate: number,
  previous: BendPose,
): BendPose {
  const turn = clamp(normalizedTurnRate, -1, 1);
  const magnitude = Math.abs(turn);
  const direction = Math.sign(turn) as -1 | 0 | 1;

  if (direction === 0) return 0;

  if (previous !== 0 && Math.sign(previous) !== direction) {
    if (magnitude < 0.2) return 0;
    return magnitude >= 0.62 ? (direction * 2 as BendPose) : direction;
  }

  if (Math.abs(previous) === 2) {
    if (magnitude >= 0.52) return previous;
    return magnitude >= 0.1 ? direction : 0;
  }

  if (Math.abs(previous) === 1) {
    if (magnitude >= 0.62) return (direction * 2) as BendPose;
    if (magnitude >= 0.1) return previous;
    return 0;
  }

  if (magnitude >= 0.62) return (direction * 2) as BendPose;
  if (magnitude >= 0.2) return direction;
  return 0;
}

export function spriteColumnForBend(bend: BendPose) {
  return 2 - bend;
}

export function swimPhaseFromDistance(
  distanceTravelled: number,
  cycleDistance = 88,
) {
  if (cycleDistance <= 0) return 0;
  const progress =
    ((distanceTravelled % cycleDistance) + cycleDistance) % cycleDistance;
  return Math.floor((progress / cycleDistance) * 4) % 4;
}

export function shouldAnimateMotion(prefersReducedMotion: boolean) {
  return !prefersReducedMotion;
}

export function getRippleViewport(
  cssWidth: number,
  cssHeight: number,
  devicePixelRatio: number,
) {
  const dpr = Math.min(Math.max(devicePixelRatio || 1, 1), 1.5);
  return {
    backingWidth: Math.round(cssWidth * dpr),
    backingHeight: Math.round(cssHeight * dpr),
    shaderWidth: cssWidth,
    shaderHeight: cssHeight,
  };
}

export function shouldEmitRipple(
  previous: Point,
  current: Point,
  speed: number,
  minimumDistance = 24,
  minimumSpeed = 55,
) {
  return (
    speed >= minimumSpeed &&
    Math.hypot(current.x - previous.x, current.y - previous.y) >= minimumDistance
  );
}
