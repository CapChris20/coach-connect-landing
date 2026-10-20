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

import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../hooks/useLanding';

// ===== NAMED CONSTANTS =====

// Manipulate here: lower FRAME_MS = smoother dust drift but heavier; raise = calmer on laptops.
// 33ms ≈ 30fps. Everything in this scene moves slowly, so 30 is enough.
const FRAME_MS = 33;

// Manipulate here: 1 = lighter on battery, 2 = crisp on retina but paints more pixels.
const MAX_PIXEL_RATIO = 1.5;

// Manipulate here: the still gym shown when the OS "reduce motion" setting is on.
// Seconds into the animation. 0 is the opening frame (sun up, dust at rest).
const FROZEN_GYM_SECONDS = 0;

// Full-screen triangle. Three corners cover the canvas; no vertex buffer needed.
// vocab: gl_VertexID = 0, 1, 2 for the three corners WebGL asks us to draw
const VERTEX_SHADER_SOURCE = `#version 300 es
void main() {
  vec2 corner = vec2(-1.0, -1.0);
  if (gl_VertexID == 1) corner = vec2(3.0, -1.0);
  if (gl_VertexID == 2) corner = vec2(-1.0, 3.0);
  gl_Position = vec4(corner, 0.0, 1.0);
}
`;

// The gym itself. Scene coordinates: p = position in "hero units" —
// (0,0) is the hero's center, y runs -0.5 (floor bottom) to 0.5 (ceiling),
// x widens with the screen's aspect. The window wall spans y -0.18..0.42;
// the floor lives below -0.18.
// vocab: SDF = signed distance field. Each shape helper answers "how far
// is this pixel from the shape's edge" — negative inside — and a mask
// turns that into 1 (inside) / 0 (outside) with a soft edge.
const FRAGMENT_SHADER_SOURCE = `#version 300 es
precision highp float;

// vocab: uniform = a value we set from JavaScript every frame (the GPU only reads it)
// iTime = seconds since the hero mounted. iResolution.xy = canvas size in pixels.
uniform float iTime;
uniform vec3 iResolution;

out vec4 fragColor;

// One random-looking number per input, always the same for the same input.
// Used for building heights, lit windows, and dust positions.
float hash1(float n)
{
    return fract(sin(n) * 43758.5453123);
}

// Rotate a point by an angle (radians). Equipment parts are drawn as
// boxes, then tilted into place with this.
mat2 rotateBy(float angle)
{
    float c = cos(angle);
    float s = sin(angle);
    return mat2(c, -s, s, c);
}

// Distance to a box's edge. Center and half-size in scene units.
float boxDistance(vec2 p, vec2 center, vec2 halfSize, float angle)
{
    vec2 d = abs(rotateBy(angle) * (p - center)) - halfSize;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

// Soft 1-inside / 0-outside mask from a distance.
// Manipulate here: 0.004 = edge softness. Bigger = blurrier silhouettes.
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

// The equipment, as one combined mask: elliptical on the left, kettlebell
// in the middle, treadmill on the right — the reference picture's lineup.
// Everything is a flat silhouette; the warm rim light is added by main().
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

// Soft dust motes drifting up through the light, two layers deep.
// Each cell of an invisible grid holds one mote at a hashed spot.
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

    // Center the picture. Dividing by height (not width) keeps shapes honest.
    vec2 p = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;

    // ── The wall and the windows ─────────────────────────────
    // Deep indigo wall everywhere; the glass is one wide box cut into it.
    vec3 color = mix(vec3(0.055, 0.045, 0.10), vec3(0.09, 0.07, 0.16), smoothstep(-0.5, 0.5, p.y));

    float glassMask = boxMask(p, vec2(0.0, 0.12), vec2(0.78, 0.295), 0.0);

    // Sky through the glass: dusk indigo up top melting into warm horizon.
    // Manipulate here: these two colors are the whole mood. First = zenith, second = horizon.
    float skyAmount = smoothstep(0.42, -0.12, p.y);
    vec3 skyColor = mix(vec3(0.16, 0.20, 0.38), vec3(0.94, 0.52, 0.28), pow(skyAmount, 1.6));

    // The sun: a soft disc low in the glass, behind where the CC logo stands.
    vec2 sunPosition = vec2(0.16, 0.14);
    float sunDistance = length(p - sunPosition);
    skyColor += vec3(1.0, 0.55, 0.22) * exp(-sunDistance * 3.2) * 0.55;
    skyColor += vec3(1.0, 0.72, 0.38) * smoothstep(0.30, 0.26, sunDistance) * 0.85;

    // City skyline outside: one hashed building per column, hazy with distance.
    float buildingColumn = floor((p.x + 0.78) / 0.13);
    float buildingHeight = 0.05 + hash1(buildingColumn * 7.13) * 0.20;
    float buildingMask = glassMask * step(p.y, -0.18 + buildingHeight) * step(-0.18, p.y + 1.0);
    buildingMask *= step(abs(p.x), 0.78);
    skyColor = mix(skyColor, vec3(0.38, 0.44, 0.64), buildingMask * 0.55);

    // A few lit windows in the buildings: tiny hashed dots, very faint.
    vec2 windowCell = vec2(floor((p.x + 0.78) / 0.026), floor((p.y + 0.18) / 0.026));
    float litWindow = step(0.93, hash1(windowCell.x * 3.7 + windowCell.y * 9.1));
    skyColor += vec3(1.0, 0.8, 0.5) * litWindow * buildingMask * 0.35;

    color = mix(color, skyColor, glassMask);

    // Window frames: vertical bars every pane, plus the top and bottom rails.
    float paneDistance = abs(fract((p.x + 0.78) / 0.26) - 0.5) * 0.26;
    float verticalBars = 1.0 - smoothstep(0.008, 0.013, paneDistance);
    float horizontalRails = (1.0 - smoothstep(0.008, 0.013, abs(p.y - 0.415)))
                          + (1.0 - smoothstep(0.008, 0.013, abs(p.y + 0.175)));
    float frameMask = clamp(verticalBars + horizontalRails, 0.0, 1.0)
                    * boxMask(p, vec2(0.0, 0.12), vec2(0.795, 0.31), 0.0);
    color = mix(color, vec3(0.10, 0.05, 0.09), frameMask);

    // Glass sheen: slow diagonal shine crawling across the panes.
    float sheen = pow(max(0.0, sin((p.x * 1.4 + p.y * 2.2 + iTime * 0.015) * 3.0)), 8.0);
    color += vec3(0.5, 0.55, 0.7) * sheen * glassMask * 0.05;

    // ── The floor ────────────────────────────────────────────
    // Warm dark boards below the window line, catching the sun.
    float floorMask = smoothstep(-0.175, -0.185, p.y);
    vec3 floorColor = mix(vec3(0.13, 0.08, 0.11), vec3(0.07, 0.05, 0.09), smoothstep(-0.18, -0.5, p.y));
    float plankLine = smoothstep(0.012, 0.0, abs(fract((p.y + 0.5) * 13.0) - 0.5) - 0.44);
    floorColor *= 1.0 - plankLine * 0.25;
    // Sun pool: the warm smear the windows throw across the boards.
    floorColor += vec3(0.95, 0.45, 0.18) * exp(-pow((p.x - 0.16) * 2.0, 2.0)) * exp(-abs(p.y + 0.30) * 3.0) * 0.30;
    color = mix(color, floorColor, floorMask);

    // Soft contact shadows under the three pieces of equipment.
    float shadow = 0.0;
    shadow += smoothstep(0.30, 0.0, length((p - vec2(-0.55, -0.335)) / vec2(1.0, 0.18)));
    shadow += smoothstep(0.16, 0.0, length((p - vec2(-0.03, -0.345)) / vec2(1.0, 0.18)));
    shadow += smoothstep(0.34, 0.0, length((p - vec2(0.55, -0.34)) / vec2(1.0, 0.18)));
    color *= 1.0 - clamp(shadow, 0.0, 1.0) * floorMask * 0.45;

    // ── Equipment silhouettes with a warm rim toward the sun ──
    float equipment = equipmentMask(p);
    float equipmentTowardSun = equipmentMask(p - vec2(0.010, 0.012));
    float rimLight = clamp(equipmentTowardSun - equipment, 0.0, 1.0);
    color = mix(color, vec3(0.045, 0.035, 0.08), equipment);
    color += rimLight * vec3(1.0, 0.45, 0.18) * 0.55;

    // ── Light rays and dust, over everything ─────────────────
    // Faint diagonal shafts leaning out of the sun, breathing slowly.
    float rayCoordinate = dot(p - sunPosition, vec2(0.84, 0.54));
    float rays = pow(max(0.0, sin(rayCoordinate * 22.0 - iTime * 0.05)), 6.0);
    color += vec3(1.0, 0.6, 0.3) * rays * glassMask * 0.045 * (0.75 + 0.25 * sin(iTime * 0.23));

    float dust = dustLayer(p, 7.0, 0.010, 1.7) + dustLayer(p + 3.1, 11.0, 0.016, 8.4);
    color += vec3(1.0, 0.75, 0.5) * dust * 0.10;

    // ── Readability grade ────────────────────────────────────
    // Darken the left third (headline + point cards live there) and the
    // edges all round, so white text wins over the picture everywhere.
    color = mix(color * 0.55, color, smoothstep(-0.85, -0.20, p.x));
    float vignette = smoothstep(1.25, 0.45, length(p * vec2(0.85, 1.0)));
    color *= mix(0.72, 1.0, vignette);

    fragColor = vec4(color, 1.0);
}
`;

// ===== HELPER FUNCTIONS =====

/**
 * Compile one shader. Returns null when the GPU rejects the source,
 * and logs the compiler's own message so a typo is findable.
 * @param {WebGL2RenderingContext} gl
 * @param {number} shaderType - gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
 * @param {string} sourceCode
 * @returns {WebGLShader|null}
 */
function compileOneShader(gl, shaderType, sourceCode) {
  const shader = gl.createShader(shaderType);
  gl.shaderSource(shader, sourceCode);
  gl.compileShader(shader);

  const didCompile = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (didCompile) return shader;

  console.error('Gym shader failed to compile', gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return null;
}

/**
 * Link the gym program. Shaders are deleted after a good link —
 * the program keeps its own copy.
 * @param {WebGL2RenderingContext} gl
 * @returns {WebGLProgram|null}
 */
function linkGymProgram(gl) {
  const vertexShader = compileOneShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
  const fragmentShader = compileOneShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
  if (!vertexShader || !fragmentShader) return null;

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  const didLink = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (didLink) return program;

  console.error('Gym shader failed to link', gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
  return null;
}

/**
 * Match the canvas bitmap to the hero's on-screen box, capped by MAX_PIXEL_RATIO.
 * vocab: devicePixelRatio = how many real pixels sit in one CSS pixel (2 on retina)
 * @param {HTMLCanvasElement} canvas
 */
function resizeCanvasToHero(canvas) {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
  const widthInPixels = Math.max(1, Math.floor(canvas.clientWidth * pixelRatio));
  const heightInPixels = Math.max(1, Math.floor(canvas.clientHeight * pixelRatio));
  if (canvas.width === widthInPixels && canvas.height === heightInPixels) return;
  canvas.width = widthInPixels;
  canvas.height = heightInPixels;
}

/**
 * One paint of the gym into the canvas.
 * @param {WebGL2RenderingContext} gl
 * @param {WebGLProgram} program
 * @param {WebGLVertexArrayObject} vertexArray
 * @param {WebGLUniformLocation|null} timeLocation
 * @param {WebGLUniformLocation|null} resolutionLocation
 * @param {HTMLCanvasElement} canvas
 * @param {number} elapsedSeconds
 */
function paintGymFrame(gl, program, vertexArray, timeLocation, resolutionLocation, canvas, elapsedSeconds) {
  resizeCanvasToHero(canvas);
  // Resizing the canvas clears GPU bindings, so re-bind before every paint.
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.useProgram(program);
  gl.bindVertexArray(vertexArray);
  gl.uniform1f(timeLocation, elapsedSeconds);
  // Shadertoy's iResolution is (width, height, 1). The 1 is unused by this picture.
  gl.uniform3f(resolutionLocation, canvas.width, canvas.height, 1);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

/**
 * Drop the program when the hero unmounts. Leave the context alive.
 * vocab: StrictMode = React runs this cleanup once in dev, then mounts again
 * on the same canvas. loseContext() would kill that canvas for good, and the
 * second mount would draw nothing — a blank hero where the gym should be.
 * @param {WebGL2RenderingContext} gl
 * @param {WebGLProgram|null} program
 * @param {WebGLVertexArrayObject|null} vertexArray
 */
function releaseGymGpuObjects(gl, program, vertexArray) {
  if (program) gl.deleteProgram(program);
  if (vertexArray) gl.deleteVertexArray(vertexArray);
}

// ===== MAIN FUNCTION =====

/**
 * The hero's gym-interior background. Decorative only: it does not
 * take clicks, and screen readers skip it. Reduced motion gets one still frame.
 * @returns {JSX.Element}
 */
export function GymSceneBackground() {
  const canvasRef = useRef(null);
  const userPrefersReducedMotion = usePrefersReducedMotion();

  // vocab: useEffect = React hook that runs after paint, and runs the cleanup
  // function when this hero leaves the page (or when reduced-motion flips)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    // 1. Ask for WebGL2. alpha:false means the gym covers the page aurora.
    // The drawing buffer starts white, so startGym() paints before this
    // effect returns — otherwise the hero sits on that blank white.
    // vocab: webgl2 = the browser's GPU drawing API, version 2.
    // No GPU? The CSS fill stays (dark room, no equipment).
    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
    });
    if (!gl) return undefined;

    let disposed = false;
    let raf = 0;
    let program = null;
    let vertexArray = null;
    let removeResizeListener = () => {};
    let removeVisibilityObserver = () => {};

    const paint = (elapsedSeconds) => {
      if (disposed || gl.isContextLost() || !program || !vertexArray) return;
      const timeLocation = gl.getUniformLocation(program, 'iTime');
      const resolutionLocation = gl.getUniformLocation(program, 'iResolution');
      paintGymFrame(gl, program, vertexArray, timeLocation, resolutionLocation, canvas, elapsedSeconds);
    };

    // 2. Compile and paint once immediately. Waiting for the next frame is how
    // the hero sat on the blank white canvas.
    const startGym = () => {
      if (disposed || gl.isContextLost()) return;

      program = linkGymProgram(gl);
      if (!program) return;

      // vocab: vertex array = a WebGL2 requirement even when the triangle has no mesh data
      vertexArray = gl.createVertexArray();
      gl.bindVertexArray(vertexArray);

      const openingSeconds = userPrefersReducedMotion ? FROZEN_GYM_SECONDS : 0;
      paint(openingSeconds);

      // 3. Reduced motion: keep that still frame. Repaint only when the hero changes size.
      if (userPrefersReducedMotion) {
        const paintStillOnResize = () => paint(FROZEN_GYM_SECONDS);
        window.addEventListener('resize', paintStillOnResize);
        removeResizeListener = () => window.removeEventListener('resize', paintStillOnResize);
        return;
      }

      // 4. Watch whether the hero is on screen. Off screen, the loop stays
      // scheduled but skips the paint (same idea as the FPS cap below).
      let isHeroOnScreen = true;
      const visibilityObserver = new IntersectionObserver((entries) => {
        const latestEntry = entries[entries.length - 1];
        isHeroOnScreen = latestEntry.isIntersecting;
      });
      visibilityObserver.observe(canvas);
      removeVisibilityObserver = () => visibilityObserver.disconnect();

      let lastDraw = 0;
      const start = performance.now();

      // This function is the heartbeat of the background animation.
      // The browser keeps calling it; we decide whether to actually repaint.
      const frame = (now) => {
        // vocab: now = timestamp in milliseconds from requestAnimationFrame
        //        (not wall-clock time you set yourself)

        // Stop forever after cleanup ran (user left the page / component unmounted)
        // vocab: disposed = our flag meaning "tear down already happened — don't touch WebGL"
        if (disposed) return;

        // Queue the NEXT call to frame before we paint.
        // vocab: raf = id of that scheduled call — keep it so we can cancel later
        // vocab: requestAnimationFrame(frame) = "call frame again right before the next screen refresh"
        raf = window.requestAnimationFrame(frame);

        // Below the fold, or a background tab: keep the loop, skip the GPU work.
        if (!isHeroOnScreen) return;
        if (document.hidden) return;

        // FPS cap: if it's been less than FRAME_MS since the last paint, skip this tick.
        if (now - lastDraw < FRAME_MS) return;

        lastDraw = now;

        // Convert ms since start → seconds, then hand that to the shader as iTime.
        const elapsedSeconds = (now - start) / 1000;
        paint(elapsedSeconds);
      };

      raf = window.requestAnimationFrame(frame);
    };

    // A previous visit may have lost this canvas. Restore it, then compile.
    // A healthy context just starts.
    const onContextRestored = () => startGym();
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    if (gl.isContextLost()) {
      const loseContext = gl.getExtension('WEBGL_lose_context');
      if (loseContext) loseContext.restoreContext();
    } else {
      startGym();
    }

    // 5. Leaving the hero cancels the loop. The context stays, so the logo's
    // own WebGL canvas is the only other one this page needs.
    return () => {
      disposed = true;
      window.cancelAnimationFrame(raf);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      removeResizeListener();
      removeVisibilityObserver();
      releaseGymGpuObjects(gl, program, vertexArray);
    };
  }, [userPrefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="gym-scene-canvas"
      data-testid="hero-gym-shader"
      aria-hidden="true"
    />
  );
}
