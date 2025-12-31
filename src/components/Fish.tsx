"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

const FOLLOW_DISTANCE = 80; // How far behind the cursor the fish stays
const FISH_FRAMES = ["/fishU1.png", "/fishU2.png", "/fishU3.png"];

// Idle drift settings
const DRIFT_SPEED = 0.001;
const DRIFT_AMOUNT = 8;
const DRIFT_ROTATION = 3;

// Movement settings
const MAX_SPEED = 8; // Maximum pixels per frame
const MIN_SPEED = 0.5; // Minimum speed when close
const ACCELERATION = 0.15; // How quickly fish speeds up
const DECELERATION = 0.92; // How quickly fish slows down (multiply by this)

export function Fish() {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [targetPosition, setTargetPosition] = useState({ x: 100, y: 100 });
  const [frameIndex, setFrameIndex] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [idleOffset, setIdleOffset] = useState({ x: 0, y: 0, rotation: 0 });
  const animationRef = useRef<number | null>(null);
  const currentRotation = useRef(0);
  const startTime = useRef(Date.now());
  const movingFrames = useRef(0);
  const velocity = useRef({ x: 0, y: 0 }); // Track velocity for smooth acceleration

  // Track cursor position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setTargetPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Smooth follow animation
  useEffect(() => {
    const animate = () => {
      const elapsed = Date.now() - startTime.current;

      setPosition((prev) => {
        const dx = targetPosition.x - prev.x;
        const dy = targetPosition.y - prev.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Calculate target angle (in degrees)
        let targetAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

        // Smooth rotation - interpolate to avoid sudden flips
        let angleDiff = targetAngle - currentRotation.current;
        while (angleDiff > 180) angleDiff -= 360;
        while (angleDiff < -180) angleDiff += 360;

        // Smoothly interpolate rotation (slower for more natural feel)
        currentRotation.current += angleDiff * 0.06;
        setRotation(currentRotation.current);

        // Detect if fish should be moving
        const isTranslating = distance > FOLLOW_DISTANCE;
        const isRotating = Math.abs(angleDiff) > 5;
        const shouldBeMoving = isTranslating || isRotating;

        // Hysteresis for smooth state transitions
        if (shouldBeMoving) {
          movingFrames.current = 25;
        } else if (movingFrames.current > 0) {
          movingFrames.current--;
        }

        setIsMoving(movingFrames.current > 0);

        // Calculate idle drift
        const currentlyIdle = movingFrames.current === 0;
        if (currentlyIdle) {
          const driftX = Math.sin(elapsed * DRIFT_SPEED) * DRIFT_AMOUNT;
          const driftY = Math.sin(elapsed * DRIFT_SPEED * 0.7 + 1) * DRIFT_AMOUNT * 0.6;
          const driftRot = Math.sin(elapsed * DRIFT_SPEED * 0.5 + 2) * DRIFT_ROTATION;
          
          setIdleOffset((prev) => ({
            x: prev.x + (driftX - prev.x) * 0.05,
            y: prev.y + (driftY - prev.y) * 0.05,
            rotation: prev.rotation + (driftRot - prev.rotation) * 0.05,
          }));
        } else {
          setIdleOffset((prev) => ({
            x: prev.x * 0.9,
            y: prev.y * 0.9,
            rotation: prev.rotation * 0.9,
          }));
        }

        // Physics-based movement with acceleration/deceleration
        if (isTranslating && distance > 0) {
          // Normalize direction
          const dirX = dx / distance;
          const dirY = dy / distance;

          // Calculate target speed based on distance (faster when far, slower when close)
          // Use a curve that ramps up smoothly
          const distanceRatio = Math.min(distance / 300, 1); // Normalize to 0-1
          const targetSpeed = MIN_SPEED + (MAX_SPEED - MIN_SPEED) * Math.pow(distanceRatio, 0.5);

          // Accelerate toward target velocity
          const targetVelX = dirX * targetSpeed;
          const targetVelY = dirY * targetSpeed;

          velocity.current.x += (targetVelX - velocity.current.x) * ACCELERATION;
          velocity.current.y += (targetVelY - velocity.current.y) * ACCELERATION;

          // Apply velocity
          const newX = prev.x + velocity.current.x;
          const newY = prev.y + velocity.current.y;
          return { x: newX, y: newY };
        } else {
          // Decelerate when not actively moving toward target
          velocity.current.x *= DECELERATION;
          velocity.current.y *= DECELERATION;

          // Apply remaining velocity for smooth stop
          if (Math.abs(velocity.current.x) > 0.1 || Math.abs(velocity.current.y) > 0.1) {
            const newX = prev.x + velocity.current.x;
            const newY = prev.y + velocity.current.y;
            return { x: newX, y: newY };
          }
        }

        return prev;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetPosition]);

  // Frame animation - slower, only when moving
  useEffect(() => {
    if (!isMoving) {
      const timeout = setTimeout(() => setFrameIndex(1), 50);
      return () => clearTimeout(timeout);
    }

    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % FISH_FRAMES.length);
    }, 180); // Slower animation: 180ms instead of 120ms

    return () => clearInterval(interval);
  }, [isMoving]);

  return (
    <div
      className="fixed pointer-events-none z-[100]"
      style={{
        left: position.x - 100 + idleOffset.x,
        top: position.y - 100 + idleOffset.y,
        transform: `rotate(${rotation + idleOffset.rotation}deg)`,
      }}
    >
      <Image
        src={FISH_FRAMES[frameIndex]}
        alt="Swimming fish"
        width={200}
        height={200}
        className="opacity-90"
        priority
      />
    </div>
  );
}
