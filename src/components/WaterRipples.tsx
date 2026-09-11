"use client";

import { useEffect, useRef, type RefObject } from "react";

import {
  getRippleViewport,
  shouldAnimateMotion,
  shouldEmitRipple,
  type Point,
} from "./dolphinPhysics";
import type { DolphinMotion } from "./Dolphin";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

const MAX_WAKE_SAMPLES = 24;

const VERTEX_SHADER = `#version 300 es
in vec2 aPosition;
out vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 outColor;

uniform vec2 uResolution;
uniform float uTime;
uniform vec4 uWakeSamples[${MAX_WAKE_SAMPLES}];
uniform vec2 uWakeDirections[${MAX_WAKE_SAMPLES}];

const float DITHER_PIXEL_SIZE = 3.0;
const float DITHER_DENSITY = 0.38;
const float BAYER_4X4[16] = float[16](
  0.0, 8.0, 2.0, 10.0,
  12.0, 4.0, 14.0, 6.0,
  3.0, 11.0, 1.0, 9.0,
  15.0, 7.0, 13.0, 5.0
);

float bayerThreshold(vec2 pixelCoordinate) {
  ivec2 cell = ivec2(mod(floor(pixelCoordinate / DITHER_PIXEL_SIZE), 4.0));
  int index = cell.y * 4 + cell.x;
  return (BAYER_4X4[index] + 0.5) / 16.0;
}

void main() {
  vec2 pixel = vec2(vUv.x, 1.0 - vUv.y) * uResolution;
  float waveHeight = 0.0;
  float waveEnergy = 0.0;

  for (int index = 0; index < ${MAX_WAKE_SAMPLES}; index += 1) {
    vec4 wakeSample = uWakeSamples[index];
    float age = uTime - wakeSample.z;

    if (wakeSample.w > 0.0 && age >= 0.0 && age < 2.2) {
      vec2 direction = normalize(uWakeDirections[index]);
      vec2 normal = vec2(-direction.y, direction.x);
      vec2 offset = pixel - wakeSample.xy;
      float longitudinal = dot(offset, direction);
      float lateral = abs(dot(offset, normal));

      float travel = age * (105.0 + wakeSample.w * 55.0);
      float transverseWidth = 10.0 + age * 12.0;
      float transverseEnvelope = exp(
        -pow((lateral - travel) / transverseWidth, 2.0)
      );
      float longitudinalWidth = 30.0 + age * 35.0;
      float longitudinalEnvelope = exp(
        -pow(longitudinal / longitudinalWidth, 2.0)
      );
      float oscillation = cos((lateral - travel) * 0.27);
      float decay = exp(-age * 1.65) * wakeSample.w;
      float contribution = oscillation * transverseEnvelope *
        longitudinalEnvelope * decay;

      waveHeight += contribution;
      waveEnergy += abs(contribution);
    }
  }

  float threshold = bayerThreshold(pixel);
  float alphaCoverage = clamp(
    waveEnergy * 0.32 + abs(waveHeight) * 0.22,
    0.0,
    1.0
  );
  float ditherInk = step(threshold, alphaCoverage * DITHER_DENSITY);

  vec3 darkBlue = vec3(0.0156863, 0.1568627, 0.4784314);
  float alpha = ditherInk * 0.95;

  outColor = vec4(darkBlue, alpha);
}
`;

interface WakeSample {
  x: number;
  y: number;
  bornAt: number;
  strength: number;
  directionX: number;
  directionY: number;
}

interface WaterRipplesProps {
  motionRef: RefObject<DolphinMotion | null>;
}

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("Water ripple shader compilation failed", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  if (!vertexShader) return null;
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!fragmentShader) {
    gl.deleteShader(vertexShader);
    return null;
  }

  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn("Water ripple shader link failed", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

export function WaterRipples({ motionRef }: WaterRipplesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!shouldAnimateMotion(prefersReducedMotion)) {
      canvas.width = canvas.width;
      return;
    }

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
    if (!gl) return;

    const program = createProgram(gl);
    if (!program) return;

    const buffer = gl.createBuffer();
    if (!buffer) {
      gl.deleteProgram(program);
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );

    const positionLocation = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, "uResolution");
    const timeLocation = gl.getUniformLocation(program, "uTime");
    const wakeSamplesLocation = gl.getUniformLocation(program, "uWakeSamples[0]");
    const wakeDirectionsLocation = gl.getUniformLocation(
      program,
      "uWakeDirections[0]",
    );

    gl.useProgram(program);
    gl.clearColor(0, 0, 0, 0);

    const wakeSamples: WakeSample[] = [];
    let lastEmission: Point | null = null;
    let animationFrame = 0;

    const resize = () => {
      const viewport = getRippleViewport(
        window.innerWidth,
        window.innerHeight,
        window.devicePixelRatio || 1,
      );
      if (
        canvas.width !== viewport.backingWidth ||
        canvas.height !== viewport.backingHeight
      ) {
        canvas.width = viewport.backingWidth;
        canvas.height = viewport.backingHeight;
        gl.viewport(0, 0, viewport.backingWidth, viewport.backingHeight);
      }
      return viewport;
    };

    const packedSamples = new Float32Array(MAX_WAKE_SAMPLES * 4);
    const packedDirections = new Float32Array(MAX_WAKE_SAMPLES * 2);

    const render = (milliseconds: number) => {
      const viewport = resize();
      const time = milliseconds / 1000;
      const motion = motionRef.current;

      if (motion) {
        const radians = (motion.heading * Math.PI) / 180;
        const forward = {
          x: Math.sin(radians),
          y: -Math.cos(radians),
        };
        const right = {
          x: Math.cos(radians),
          y: Math.sin(radians),
        };
        const bodyCenter = {
          x: motion.x,
          y: motion.y,
        };

        if (
          !lastEmission ||
          shouldEmitRipple(lastEmission, bodyCenter, motion.speed, 16, 45)
        ) {
          if (motion.speed >= 45) {
            const tail = {
              x: bodyCenter.x - forward.x * 42 + right.x * motion.tailBeat * 14,
              y: bodyCenter.y - forward.y * 42 + right.y * motion.tailBeat * 14,
            };
            const tailDirection = radians + motion.tailBeat * 0.16;
            const tailThrust =
              0.72 + 0.28 * Math.sqrt(Math.max(0, 1 - motion.tailBeat ** 2));
            wakeSamples.push({
              x: tail.x,
              y: tail.y,
              bornAt: time,
              strength: Math.min(
                0.8,
                (0.2 + motion.speed / 950 + Math.abs(motion.normalizedTurn) * 0.12) *
                  tailThrust,
              ),
              directionX: Math.sin(tailDirection),
              directionY: -Math.cos(tailDirection),
            });
            if (wakeSamples.length > MAX_WAKE_SAMPLES) wakeSamples.shift();
            lastEmission = bodyCenter;
          }
        }
      }

      packedSamples.fill(0);
      packedDirections.fill(0);
      wakeSamples.forEach((sample, index) => {
        const sampleOffset = index * 4;
        packedSamples[sampleOffset] = sample.x;
        packedSamples[sampleOffset + 1] = sample.y;
        packedSamples[sampleOffset + 2] = sample.bornAt;
        packedSamples[sampleOffset + 3] = sample.strength;

        const directionOffset = index * 2;
        packedDirections[directionOffset] = sample.directionX;
        packedDirections[directionOffset + 1] = sample.directionY;
      });

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(
        resolutionLocation,
        viewport.shaderWidth,
        viewport.shaderHeight,
      );
      gl.uniform1f(timeLocation, time);
      gl.uniform4fv(wakeSamplesLocation, packedSamples);
      gl.uniform2fv(wakeDirectionsLocation, packedDirections);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      animationFrame = requestAnimationFrame(render);
    };

    animationFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrame);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [motionRef, prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-[40] h-full w-full pointer-events-none"
      style={{ mixBlendMode: "multiply" }}
    />
  );
}
