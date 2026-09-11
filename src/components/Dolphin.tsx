"use client";

import { useEffect, useRef } from "react";

import {
  DEFAULT_DOLPHIN_CONFIG,
  advanceDolphin,
  selectBend,
  shouldAnimateMotion,
  spriteColumnForBend,
  type BendPose,
  type DolphinState,
} from "./dolphinPhysics";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

const FRAME_WIDTH = 128;
const FRAME_HEIGHT = 160;
const SHEET_WIDTH = 640;
const SHEET_HEIGHT = 640;
const SWIM_FRAME_DURATION = 0.16;
const SWIM_PHASE_COUNT = 4;
const MIN_SWIM_SPEED = 20;

export interface DolphinMotion {
  x: number;
  y: number;
  heading: number;
  speed: number;
  normalizedTurn: number;
  tailBeat: number;
  time: number;
}

interface DolphinProps {
  onMotion: (motion: DolphinMotion) => void;
}

export function Dolphin({ onMotion }: DolphinProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ x: 100, y: 100 });
  const stateRef = useRef<DolphinState>({
    x: 100,
    y: 100,
    heading: 0,
    angularVelocity: 0,
    speed: 0,
    distanceTravelled: 0,
  });
  const bendRef = useRef<BendPose>(0);
  const swimTimeRef = useRef(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const startX = window.innerWidth * 0.5;
    const startY = window.innerHeight * 0.45;
    stateRef.current = { ...stateRef.current, x: startX, y: startY };
    targetRef.current = { x: startX, y: startY };
    element.style.transform = `translate3d(${startX - FRAME_WIDTH / 2}px, ${startY - FRAME_HEIGHT / 2}px, 0) rotate(0deg)`;

    if (!shouldAnimateMotion(prefersReducedMotion)) {
      element.style.backgroundPosition = `${-2 * FRAME_WIDTH}px 0px`;
      onMotion({
        x: startX,
        y: startY,
        heading: 0,
        speed: 0,
        normalizedTurn: 0,
        tailBeat: 0,
        time: performance.now(),
      });
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      targetRef.current = { x: event.clientX, y: event.clientY };
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    let animationFrame = 0;
    let previousTime = performance.now();

    const animate = (time: number) => {
      const deltaSeconds = Math.min((time - previousTime) / 1000, 1 / 20);
      previousTime = time;

      const next = advanceDolphin(
        stateRef.current,
        targetRef.current,
        deltaSeconds,
      );
      stateRef.current = next;

      const normalizedTurn =
        next.angularVelocity / DEFAULT_DOLPHIN_CONFIG.maxTurnRate;
      const bend = selectBend(normalizedTurn, bendRef.current);
      bendRef.current = bend;
      if (next.speed >= MIN_SWIM_SPEED) {
        swimTimeRef.current += deltaSeconds;
      }
      const phase =
        Math.floor(swimTimeRef.current / SWIM_FRAME_DURATION) % SWIM_PHASE_COUNT;
      const tailBeat = Math.sin(
        (swimTimeRef.current /
          (SWIM_FRAME_DURATION * SWIM_PHASE_COUNT)) *
          Math.PI *
          2,
      );
      const column = spriteColumnForBend(bend);

      element.style.transform = `translate3d(${next.x - FRAME_WIDTH / 2}px, ${next.y - FRAME_HEIGHT / 2}px, 0) rotate(${next.heading}deg)`;
      element.style.backgroundPosition = `${-column * FRAME_WIDTH}px ${-phase * FRAME_HEIGHT}px`;

      onMotion({
        x: next.x,
        y: next.y,
        heading: next.heading,
        speed: next.speed,
        normalizedTurn,
        tailBeat,
        time,
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      cancelAnimationFrame(animationFrame);
    };
  }, [onMotion, prefersReducedMotion]);

  return (
    <div
      ref={elementRef}
      aria-hidden="true"
      className="fixed left-0 top-0 pointer-events-none z-[100] opacity-95 will-change-transform"
      style={{
        width: FRAME_WIDTH,
        height: FRAME_HEIGHT,
        backgroundImage: "url('/dolphin-sprite-sheet-dithered-fine.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: `${SHEET_WIDTH}px ${SHEET_HEIGHT}px`,
        backgroundPosition: `${-2 * FRAME_WIDTH}px 0px`,
        imageRendering: "pixelated",
        transformOrigin: "50% 50%",
      }}
    />
  );
}
