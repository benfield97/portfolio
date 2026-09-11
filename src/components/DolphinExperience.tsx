"use client";

import { useCallback, useRef } from "react";

import { Dolphin, type DolphinMotion } from "./Dolphin";
import { WaterRipples } from "./WaterRipples";

export function DolphinExperience() {
  const motionRef = useRef<DolphinMotion | null>(null);
  const handleMotion = useCallback((motion: DolphinMotion) => {
    motionRef.current = motion;
  }, []);

  return (
    <>
      <WaterRipples motionRef={motionRef} />
      <Dolphin onMotion={handleMotion} />
    </>
  );
}
