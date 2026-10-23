// GymSceneBackground — the hero's animated background: a stylized gym
// interior drawn entirely in a fragment shader, after the owner's
// reference picture (a vector gym room: tall windows, city outside,
// treadmill, elliptical, kettlebell, warm light pouring in).
// Flow: mount a canvas → compile the gym shader → paint a frame before
// each screen refresh → tear the WebGL context down when the hero unmounts.
// The picture is ORIGINAL code written for this site (no stock art, no
// borrowed shader), drawn with distance-field shapes: window wall and
// skyline first, floor under it, equipment silhouettes in front, then
// light rays and drifting dust over everything. It is deliberately
// DARKER than the reference — deep indigo walls instead of pale blue —
// so the hero's white text, cards, logo, and watch stay readable on top.
// PARKED: built for the hero, then rejected by the owner in favor of the
// sunset (SunsetOceanBackground). Kept as a one-import swap in
// ui/Sections.jsx (TopSection) if it ever gets a second chance.

// ===== IMPORTS =====

import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../app-settings-and-helpers/useScreenSizeAndMotion';

// ===== NAMED CONSTANTS =====

// Target frame interval in milliseconds (33ms ≈ 30fps).
// 30fps is chosen because everything in this scene moves at a slow drift,
// keeping CPU/GPU utilization low on laptops while remaining fluid.
const FRAME_INTERVAL_MILLISECONDS = 33;

// Maximum pixel ratio cap to prevent GPU overheating on high-density retina displays
const MAXIMUM_PIXEL_RATIO = 1.5;

// The still gym frame timestamp displayed when the OS "reduce motion" setting is active.
// 0 seconds represents the opening frame (sun up, dust at rest).
const FROZEN_GYM_TIMESTAMP_SECONDS = 0;

// Conversion factor from performance.now() milliseconds to shader time in seconds
const MILLISECONDS_PER_SECOND = 1000;

// Default device pixel ratio fallback when window.devicePixelRatio is unavailable
const DEFAULT_DEVICE_PIXEL_RATIO = 1;

// Minimum dimension in pixels to ensure the WebGL viewport never receives zero dimensions
const MINIMUM_CANVAS_DIMENSION_PIXELS = 1;

// Drawing constants for rendering the full-screen triangle
const FULL_SCREEN_TRIANGLE_VERTEX_COUNT = 3;
const FIRST_VERTEX_INDEX = 0;

// Full-screen triangle vertex shader. Three corners cover the viewport canvas;
// no vertex buffer array is needed because gl_VertexID generates coordinates directly.
const VERTEX_SHADER_SOURCE = `#version 300 es
void main() {
  vec2 corner = vec2(-1.0, -1.0);
  if (gl_VertexID == 1) corner = vec2(3.0, -1.0);
  if (gl_VertexID == 2) corner = vec2(-1.0, 3.0);
  gl_Position = vec4(corner, 0.0, 1.0);
}
`;

// Fragment shader for procedural gym environment using Signed Distance Fields (SDF).
// Note: GLSL variable naming follows standard graphics conventions (vec2 p, d, mat2)
// to maintain shader compiler performance and mathematical clarity.
const FRAGMENT_SHADER_SOURCE = `#version 300 es
precision highp float;

uniform float iTime;
uniform vec3 iResolution;

out vec4 fragColor;

float hash1(float n)
{
    return fract(sin(n) * 43758.5453123);
}

mat2 rotateBy(float angle)
{
    float c = cos(angle);
    float s = sin(angle);
    return mat2(c, -s, s, c);
}

float boxDistance(vec2 p, vec2 center, vec2 halfSize, float angle)
{
    vec2 d = abs(rotateBy(angle) * (p - center)) - halfSize;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float maskFromDistance(float distance)
{
    return smoothstep(0.004, -0.004, distance);
}

float boxMask(vec2 p, vec2 center, vec2 halfSize, float angle)
{
    return maskFromDistance(boxDistance(p, center, halfSize, angle));
}

float circleMask(vec2 p, vec2 center, float radius)
{
    return maskFromDistance(length(p - center) - radius);
}

float equipmentMask(vec2 p)
{
    float mask = 0.0;

    // Elliptical (left): base rail, flywheel, two leaning handles, console.
    mask = max(mask, boxMask(p, vec2(-0.55, -0.318), vec2(0.17, 0.013), 0.0));
    mask = max(mask, circleMask(p, vec2(-0.635, -0.255), 0.048));
    mask = max(mask, boxMask(p, vec2(-0.50, -0.16), vec2(0.011, 0.16), 0.18));
    mask = max(mask, boxMask(p, vec2(-0.565, -0.10), vec2(0.009, 0.17), -0.12));
    mask = max(mask, boxMask(p, vec2(-0.452, -0.115), vec2(0.045, 0.020), -0.15));

    // Kettlebell (middle): round body, handle ring standing on top of it.
    vec2 kettlebell = p - vec2(-0.03, -0.315);
    mask = max(mask, circleMask(p, vec2(-0.03, -0.315), 0.072));
    float handleRing = abs(length(kettlebell - vec2(0.0, 0.078)) - 0.040);
    mask = max(mask, smoothstep(0.011, 0.005, handleRing) * step(0.015, kettlebell.y));

    // Treadmill (right): belt, front post leaning back, console on top.
    mask = max(mask, boxMask(p, vec2(0.55, -0.315), vec2(0.21, 0.016), -0.05));
    mask = max(mask, boxMask(p, vec2(0.685, -0.20), vec2(0.014, 0.115), -0.30));
    mask = max(mask, boxMask(p, vec2(0.715, -0.082), vec2(0.070, 0.026), -0.25));

    return clamp(mask, 0.0, 1.0);
}

float dustLayer(vec2 p, float cellScale, float riseSpeed, float seed)
{
    vec2 gridPoint = p * cellScale;
    gridPoint.y -= iTime * riseSpeed;
    vec2 cellId = floor(gridPoint);
    vec2 cellPos = fract(gridPoint) - 0.5;
    float randomA = hash1(cellId.x * 12.9898 + cellId.y * 78.233 + seed);
    float randomB = hash1(cellId.y * 34.123 + cellId.x * 5.678 + seed);
    vec2 moteHome = (vec2(randomA, randomB) - 0.5) * 0.6;
    moteHome.x += sin(iTime * 0.3 + randomA * 6.28) * 0.05;
    float moteDistance = length(cellPos - moteHome);
    return smoothstep(0.075, 0.0, moteDistance) * (0.2 + 0.5 * randomB);
}

void main()
{
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 p = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;

    // The wall and the windows
    vec3 color = mix(vec3(0.055, 0.045, 0.10), vec3(0.09, 0.07, 0.16), smoothstep(-0.5, 0.5, p.y));
    float glassMask = boxMask(p, vec2(0.0, 0.12), vec2(0.78, 0.295), 0.0);

    // Sky through the glass: dusk indigo up top melting into warm horizon
    float skyAmount = smoothstep(0.42, -0.12, p.y);
    vec3 skyColor = mix(vec3(0.16, 0.20, 0.38), vec3(0.94, 0.52, 0.28), pow(skyAmount, 1.6));

    // The sun: a soft disc low in the glass
    vec2 sunPosition = vec2(0.16, 0.14);
    float sunDistance = length(p - sunPosition);
    skyColor += vec3(1.0, 0.55, 0.22) * exp(-sunDistance * 3.2) * 0.55;
    skyColor += vec3(1.0, 0.72, 0.38) * smoothstep(0.30, 0.26, sunDistance) * 0.85;

    // City skyline outside: one hashed building per column, hazy with distance
    float buildingColumn = floor((p.x + 0.78) / 0.13);
    float buildingHeight = 0.05 + hash1(buildingColumn * 7.13) * 0.20;
    float buildingMask = glassMask * step(p.y, -0.18 + buildingHeight) * step(-0.18, p.y + 1.0);
    buildingMask *= step(abs(p.x), 0.78);
    skyColor = mix(skyColor, vec3(0.38, 0.44, 0.64), buildingMask * 0.55);

    // Lit windows in buildings
    vec2 windowCell = vec2(floor((p.x + 0.78) / 0.026), floor((p.y + 0.18) / 0.026));
    float litWindow = step(0.93, hash1(windowCell.x * 3.7 + windowCell.y * 9.1));
    skyColor += vec3(1.0, 0.8, 0.5) * litWindow * buildingMask * 0.35;

    color = mix(color, skyColor, glassMask);

    // Window frames: vertical bars and horizontal rails
    float paneDistance = abs(fract((p.x + 0.78) / 0.26) - 0.5) * 0.26;
    float verticalBars = 1.0 - smoothstep(0.008, 0.013, paneDistance);
    float horizontalRails = (1.0 - smoothstep(0.008, 0.013, abs(p.y - 0.415)))
                          + (1.0 - smoothstep(0.008, 0.013, abs(p.y + 0.175)));
    float frameMask = clamp(verticalBars + horizontalRails, 0.0, 1.0)
                    * boxMask(p, vec2(0.0, 0.12), vec2(0.795, 0.31), 0.0);
    color = mix(color, vec3(0.10, 0.05, 0.09), frameMask);

    // Glass sheen: slow diagonal shine crawling across panes
    float sheen = pow(max(0.0, sin((p.x * 1.4 + p.y * 2.2 + iTime * 0.015) * 3.0)), 8.0);
    color += vec3(0.5, 0.55, 0.7) * sheen * glassMask * 0.05;

    // Floor with plank grain and sunlight pool
    float floorMask = smoothstep(-0.175, -0.185, p.y);
    vec3 floorColor = mix(vec3(0.13, 0.08, 0.11), vec3(0.07, 0.05, 0.09), smoothstep(-0.18, -0.5, p.y));
    float plankLine = smoothstep(0.012, 0.0, abs(fract((p.y + 0.5) * 13.0) - 0.5) - 0.44);
    floorColor *= 1.0 - plankLine * 0.25;
    floorColor += vec3(0.95, 0.45, 0.18) * exp(-pow((p.x - 0.16) * 2.0, 2.0)) * exp(-abs(p.y + 0.30) * 3.0) * 0.30;
    color = mix(color, floorColor, floorMask);

    // Contact shadows under equipment
    float shadow = 0.0;
    shadow += smoothstep(0.30, 0.0, length((p - vec2(-0.55, -0.335)) / vec2(1.0, 0.18)));
    shadow += smoothstep(0.16, 0.0, length((p - vec2(-0.03, -0.345)) / vec2(1.0, 0.18)));
    shadow += smoothstep(0.34, 0.0, length((p - vec2(0.55, -0.34)) / vec2(1.0, 0.18)));
    color *= 1.0 - clamp(shadow, 0.0, 1.0) * floorMask * 0.45;

    // Equipment silhouettes with warm rim light
    float equipment = equipmentMask(p);
    float equipmentTowardSun = equipmentMask(p - vec2(0.010, 0.012));
    float rimLight = clamp(equipmentTowardSun - equipment, 0.0, 1.0);
    color = mix(color, vec3(0.045, 0.035, 0.08), equipment);
    color += rimLight * vec3(1.0, 0.45, 0.18) * 0.55;

    // Sun rays and dust motes
    float rayCoordinate = dot(p - sunPosition, vec2(0.84, 0.54));
    float rays = pow(max(0.0, sin(rayCoordinate * 22.0 - iTime * 0.05)), 6.0);
    color += vec3(1.0, 0.6, 0.3) * rays * glassMask * 0.045 * (0.75 + 0.25 * sin(iTime * 0.23));

    float dust = dustLayer(p, 7.0, 0.010, 1.7) + dustLayer(p + 3.1, 11.0, 0.016, 8.4);
    color += vec3(1.0, 0.75, 0.5) * dust * 0.10;

    // Darken text area and apply vignette for contrast
    color = mix(color * 0.55, color, smoothstep(-0.85, -0.20, p.x));
    float vignette = smoothstep(1.25, 0.45, length(p * vec2(0.85, 1.0)));
    color *= mix(0.72, 1.0, vignette);

    fragColor = vec4(color, 1.0);
}
`;

// ===== HELPER FUNCTIONS =====

/**
 * Compile a single WebGL shader from GLSL source string.
 * @param {WebGL2RenderingContext} webglContext
 * @param {number} shaderType - gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
 * @param {string} sourceCode - Raw GLSL shader string
 * @returns {WebGLShader|null} The compiled shader, or null if compilation fails
 */
function compileIndividualShader(webglContext, shaderType, sourceCode) {
  const compiledShader = webglContext.createShader(shaderType);
  webglContext.shaderSource(compiledShader, sourceCode);
  webglContext.compileShader(compiledShader);

  const hasCompiledSuccessfully = webglContext.getShaderParameter(compiledShader, webglContext.COMPILE_STATUS);
  if (hasCompiledSuccessfully) {
    return compiledShader;
  }

  console.error('Gym shader failed to compile:', webglContext.getShaderInfoLog(compiledShader));
  webglContext.deleteShader(compiledShader);
  return null;
}

/**
 * Link the vertex and fragment shaders into an executable WebGL program.
 * @param {WebGL2RenderingContext} webglContext
 * @returns {WebGLProgram|null} Linked program, or null on link error
 */
function linkGymShaderProgram(webglContext) {
  const vertexShader = compileIndividualShader(webglContext, webglContext.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
  const fragmentShader = compileIndividualShader(webglContext, webglContext.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);

  if (!vertexShader || !fragmentShader) {
    return null;
  }

  const linkedProgram = webglContext.createProgram();
  webglContext.attachShader(linkedProgram, vertexShader);
  webglContext.attachShader(linkedProgram, fragmentShader);
  webglContext.linkProgram(linkedProgram);

  // Clean up detached shader objects now that the program holds its own binary copy
  webglContext.deleteShader(vertexShader);
  webglContext.deleteShader(fragmentShader);

  const hasLinkedSuccessfully = webglContext.getProgramParameter(linkedProgram, webglContext.LINK_STATUS);
  if (hasLinkedSuccessfully) {
    return linkedProgram;
  }

  console.error('Gym shader program failed to link:', webglContext.getProgramInfoLog(linkedProgram));
  webglContext.deleteProgram(linkedProgram);
  return null;
}

/**
 * Match the internal canvas pixel dimensions to its on-screen CSS size.
 * Keeps aspect ratio intact and caps resolution to avoid battery drain.
 * @param {HTMLCanvasElement} canvasElement
 */
function synchronizeCanvasPixelDimensions(canvasElement) {
  const currentDevicePixelRatio = window.devicePixelRatio || DEFAULT_DEVICE_PIXEL_RATIO;
  const effectivePixelRatio = Math.min(currentDevicePixelRatio, MAXIMUM_PIXEL_RATIO);
  const targetWidthInPixels = Math.max(MINIMUM_CANVAS_DIMENSION_PIXELS, Math.floor(canvasElement.clientWidth * effectivePixelRatio));
  const targetHeightInPixels = Math.max(MINIMUM_CANVAS_DIMENSION_PIXELS, Math.floor(canvasElement.clientHeight * effectivePixelRatio));

  if (canvasElement.width === targetWidthInPixels && canvasElement.height === targetHeightInPixels) {
    return;
  }

  canvasElement.width = targetWidthInPixels;
  canvasElement.height = targetHeightInPixels;
}

/**
 * Render a single frame of the procedural gym scene into the WebGL canvas.
 * @param {WebGL2RenderingContext} webglContext
 * @param {WebGLProgram} shaderProgram
 * @param {WebGLVertexArrayObject} vertexArrayObject
 * @param {WebGLUniformLocation|null} timeUniformLocation
 * @param {WebGLUniformLocation|null} resolutionUniformLocation
 * @param {HTMLCanvasElement} canvasElement
 * @param {number} elapsedSeconds
 */
function renderGymFrameToCanvas(
  webglContext,
  shaderProgram,
  vertexArrayObject,
  timeUniformLocation,
  resolutionUniformLocation,
  canvasElement,
  elapsedSeconds,
) {
  synchronizeCanvasPixelDimensions(canvasElement);

  // Resize clears the viewport state in WebGL, so update viewport before each draw
  webglContext.viewport(0, 0, canvasElement.width, canvasElement.height);
  webglContext.useProgram(shaderProgram);
  webglContext.bindVertexArray(vertexArrayObject);
  webglContext.uniform1f(timeUniformLocation, elapsedSeconds);
  webglContext.uniform3f(resolutionUniformLocation, canvasElement.width, canvasElement.height, 1);
  webglContext.drawArrays(webglContext.TRIANGLES, FIRST_VERTEX_INDEX, FULL_SCREEN_TRIANGLE_VERTEX_COUNT);
}

/**
 * Clean up WebGL GPU program and vertex array objects upon unmount.
 * @param {WebGL2RenderingContext} webglContext
 * @param {WebGLProgram|null} shaderProgram
 * @param {WebGLVertexArrayObject|null} vertexArrayObject
 */
function cleanupGymGpuResources(webglContext, shaderProgram, vertexArrayObject) {
  if (shaderProgram) {
    webglContext.deleteProgram(shaderProgram);
  }
  if (vertexArrayObject) {
    webglContext.deleteVertexArray(vertexArrayObject);
  }
}

/**
 * Initialize WebGL2 rendering context with low-power battery-friendly options.
 * @param {HTMLCanvasElement} canvasElement
 * @returns {WebGL2RenderingContext|null}
 */
function createGymWebglContext(canvasElement) {
  return canvasElement.getContext('webgl2', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'low-power',
  });
}

// ===== MAIN COMPONENT =====

/**
 * The hero section's gym-interior animated background.
 * Procedurally rendered via WebGL2 fragment shader without images or assets.
 * Respects OS reduced motion settings by rendering a single frozen frame.
 * @returns {JSX.Element}
 */
export function GymSceneBackground() {
  const canvasRef = useRef(null);
  const doesUserPreferReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) {
      return undefined;
    }

    const webglContext = createGymWebglContext(canvasElement);
    if (!webglContext) {
      return undefined;
    }

    let isDisposed = false;
    let animationFrameRequestId = 0;
    let shaderProgram = null;
    let vertexArrayObject = null;
    let cleanupResizeListener = () => {};
    let cleanupVisibilityObserver = () => {};

    const renderCurrentScene = (elapsedSeconds) => {
      const isContextUnavailable = isDisposed || webglContext.isContextLost() || !shaderProgram || !vertexArrayObject;
      if (isContextUnavailable) {
        return;
      }

      const timeUniformLocation = webglContext.getUniformLocation(shaderProgram, 'iTime');
      const resolutionUniformLocation = webglContext.getUniformLocation(shaderProgram, 'iResolution');
      renderGymFrameToCanvas(
        webglContext,
        shaderProgram,
        vertexArrayObject,
        timeUniformLocation,
        resolutionUniformLocation,
        canvasElement,
        elapsedSeconds,
      );
    };

    const initializeAndStartAnimation = () => {
      if (isDisposed || webglContext.isContextLost()) {
        return;
      }

      shaderProgram = linkGymShaderProgram(webglContext);
      if (!shaderProgram) {
        return;
      }

      vertexArrayObject = webglContext.createVertexArray();
      webglContext.bindVertexArray(vertexArrayObject);

      const openingSeconds = doesUserPreferReducedMotion ? FROZEN_GYM_TIMESTAMP_SECONDS : 0;
      renderCurrentScene(openingSeconds);

      // When reduced motion is preferred, only repaint on window resize without running an active loop
      if (doesUserPreferReducedMotion) {
        const renderStillFrameOnResize = () => renderCurrentScene(FROZEN_GYM_TIMESTAMP_SECONDS);
        window.addEventListener('resize', renderStillFrameOnResize);
        cleanupResizeListener = () => window.removeEventListener('resize', renderStillFrameOnResize);
        return;
      }

      let isHeroVisibleOnScreen = true;
      const visibilityObserver = new IntersectionObserver((intersectionEntries) => {
        const latestIntersectionEntry = intersectionEntries[intersectionEntries.length - 1];
        isHeroVisibleOnScreen = latestIntersectionEntry.isIntersecting;
      });
      visibilityObserver.observe(canvasElement);
      cleanupVisibilityObserver = () => visibilityObserver.disconnect();

      let lastDrawTimestampMilliseconds = 0;
      const animationStartTimestampMilliseconds = performance.now();

      const executeAnimationFrame = (currentTimestampMilliseconds) => {
        if (isDisposed) {
          return;
        }

        animationFrameRequestId = window.requestAnimationFrame(executeAnimationFrame);

        // Pause painting when scrolled offscreen or hidden in background tab
        if (!isHeroVisibleOnScreen || document.hidden) {
          return;
        }

        // Throttle repaint rate to 30fps cap
        const elapsedSinceLastDrawMilliseconds = currentTimestampMilliseconds - lastDrawTimestampMilliseconds;
        if (elapsedSinceLastDrawMilliseconds < FRAME_INTERVAL_MILLISECONDS) {
          return;
        }

        lastDrawTimestampMilliseconds = currentTimestampMilliseconds;
        const totalElapsedSeconds = (currentTimestampMilliseconds - animationStartTimestampMilliseconds) / MILLISECONDS_PER_SECOND;
        renderCurrentScene(totalElapsedSeconds);
      };

      animationFrameRequestId = window.requestAnimationFrame(executeAnimationFrame);
    };

    const handleWebglContextRestored = () => initializeAndStartAnimation();
    canvasElement.addEventListener('webglcontextrestored', handleWebglContextRestored);

    if (webglContext.isContextLost()) {
      const loseContextExtension = webglContext.getExtension('WEBGL_lose_context');
      if (loseContextExtension) {
        loseContextExtension.restoreContext();
      }
    } else {
      initializeAndStartAnimation();
    }

    return () => {
      isDisposed = true;
      window.cancelAnimationFrame(animationFrameRequestId);
      canvasElement.removeEventListener('webglcontextrestored', handleWebglContextRestored);
      cleanupResizeListener();
      cleanupVisibilityObserver();
      cleanupGymGpuResources(webglContext, shaderProgram, vertexArrayObject);
    };
  }, [doesUserPreferReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="gym-scene-canvas"
      data-testid="hero-gym-shader"
      aria-hidden="true"
    />
  );
}
