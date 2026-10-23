// Sunset ocean — the hero's animated background.
// Flow: mount a canvas → compile the sunset shader → paint a frame before
// each screen refresh → tear the WebGL context down when the hero unmounts.
// The picture is srvstr's "Sunset over the ocean" (MIT, 2025): a three-color
// sun, wavy water along the disc, and a shark fin that drifts across.
// Used by: ui/Sections.jsx (TopSection, the hero).

import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../app-settings-and-helpers/useScreenSizeAndMotion';

// ===== NAMED CONSTANTS =====

// Manipulate here: lower FRAME_MS = smoother waves but heavier; raise = calmer on laptops.
// 33ms ≈ 30fps. The fin wiggle is slow, so 30 is enough.
const FRAME_MS = 33;

// Manipulate here: 1 = lighter on battery, 2 = crisp on retina but paints more pixels.
const MAX_PIXEL_RATIO = 1.5;

// Manipulate here: the still sunset shown when the OS "reduce motion" setting is on.
// Seconds into the animation. 0 is the opening frame (sun up, fin near the start).
const FROZEN_SUNSET_SECONDS = 0;

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

// The sunset itself. Names inside the shader stay as the Shadertoy wrote them
// (uv, st, dy) so the picture can be compared to the original line for line.
// WebGL2 note: Shadertoy's vec3[](...) syntax is desktop GLSL. This copy uses
// vec3 disp[4], which WebGL2 accepts.
// Copyright (c) srvstr 2025. Licensed under MIT.
const FRAGMENT_SHADER_SOURCE = `#version 300 es
precision highp float;

// vocab: uniform = a value we set from JavaScript every frame (the GPU only reads it)
// iTime = seconds since the hero mounted. iResolution.xy = canvas size in pixels.
uniform float iTime;
uniform vec3 iResolution;

out vec4 fragColor;

// Cosine stand-in for value noise. Organic ripples, no texture lookup.
float cnoise(in vec2 uv)
{
    const mat2 r = mat2(-0.1288, -0.9917, 0.9917, -0.1288);

    vec2 s0 = cos(uv);
    vec2 s1 = cos(uv * 2.5 * r);
    vec2 s2 = cos(uv * 4.0 * r * r);

    vec2 s = s0 * s1 * s2;

    return (s.x + s.y) * 0.25 + 0.5;
}

#define S(x) (smoothstep(0.0, 1.0, (x)))

// Black mask of the shark fin. 1 = water/sun, 0 = the fin (punches a hole).
float fin(in vec2 uv)
{
    uv.x += S(S(S(abs(1.0 - 2.0 * fract(iTime * 0.02))))) - 0.5;

    uv *= vec2(sign(abs(1.0 - 2.0 * fract(iTime * 0.02 + 0.25)) - 0.5), 1.0) * 3.5;

    float d = smoothstep(1.5 / iResolution.y, 0.0,
                         uv.y
                         + 2.0 * uv.x * uv.x
                         + max(0.0, -(uv.y + 0.3) * (uv.y + 0.3) + uv.x * 3.0) * 5.0);

    return 1.0 - d * smoothstep(-0.4, -0.4 + 3.0 / iResolution.y,
                                uv.y + sin(iTime * 4.0 - uv.x * 16.0) / 100.0);
}

void main()
{
    vec2 fragCoord = gl_FragCoord.xy;

    // Center the picture. Dividing by height (not width) keeps the sun round.
    vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;

    // Extra softness on the horizon so the sun's edge doesn't stair-step.
    float dy = (smoothstep(0.0, -1.0, uv.y) * 40.0 + 1.5) / iResolution.y;

    // Wave layers. xy = how stretched the ripples are. z = how hard they push.
    // Manipulate here: bigger z = choppier water. Four layers, coarse to fine.
    vec3 disp[4] = vec3[4](
        vec3(0.5, 20.0, 8.0),
        vec3(2.5, 60.0, 4.0),
        vec3(5.0, 80.0, 2.0),
        vec3(10.0, 20.0, 2.0)
    );

    float avg = 0.0;
    for (int i = 0; i < 4; i++)
    {
        avg += cnoise(uv * disp[i].xy + iTime) * disp[i].z - disp[i].z * 0.5;
    }
    avg /= 4.0;

    // Only the lower half of the picture (the water) gets pushed up and down.
    vec2 st = vec2(uv.x, uv.y + clamp(avg * smoothstep(0.1, -1.0, uv.y), -0.1, 0.1));

    // Manipulate here: the two sunset oranges. First is the bright core, second the rim.
    vec3 sunColor = mix(vec3(0.85, 0.55, 0.0),
                        vec3(0.90, 0.40, 0.0),
                        sqrt(abs(st.y * st.y * st.y)) * 28.0);

    float sunMask = smoothstep(0.25 + dy, 0.25, length(st));
    float nightTint = smoothstep(2.0, 0.5, length(uv)) * 0.1;

    // Fin and sun mask multiply the disc. The night tint is the dark ocean around it.
    // Alpha stays 1 so the hero's old aurora cannot show through the water.
    fragColor = vec4(sunColor * fin(uv) * sunMask + nightTint, 1.0);
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

  console.error('Sunset shader failed to compile', gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return null;
}

/**
 * Link the sunset program. Shaders are deleted after a good link —
 * the program keeps its own copy.
 * @param {WebGL2RenderingContext} gl
 * @returns {WebGLProgram|null}
 */
function linkSunsetProgram(gl) {
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

  console.error('Sunset shader failed to link', gl.getProgramInfoLog(program));
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
 * One paint of the sunset into the canvas.
 * @param {WebGL2RenderingContext} gl
 * @param {WebGLProgram} program
 * @param {WebGLVertexArrayObject} vertexArray
 * @param {WebGLUniformLocation|null} timeLocation
 * @param {WebGLUniformLocation|null} resolutionLocation
 * @param {HTMLCanvasElement} canvas
 * @param {number} elapsedSeconds
 */
function paintSunsetFrame(gl, program, vertexArray, timeLocation, resolutionLocation, canvas, elapsedSeconds) {
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
 * second mount would draw nothing — a blank white hero where the sunset should be.
 * @param {WebGL2RenderingContext} gl
 * @param {WebGLProgram|null} program
 * @param {WebGLVertexArrayObject|null} vertexArray
 */
function releaseSunsetGpuObjects(gl, program, vertexArray) {
  if (program) gl.deleteProgram(program);
  if (vertexArray) gl.deleteVertexArray(vertexArray);
}

// ===== MAIN FUNCTION =====

/**
 * The hero's sunset-over-the-ocean background. Decorative only: it does not
 * take clicks, and screen readers skip it. Reduced motion gets one still frame.
 * @returns {JSX.Element}
 */
export function SunsetOceanBackground() {
  const canvasRef = useRef(null);
  const userPrefersReducedMotion = usePrefersReducedMotion();

  // vocab: useEffect = React hook that runs after paint, and runs the cleanup
  // function when this hero leaves the page (or when reduced-motion flips)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    // 1. Ask for WebGL2. alpha:false means the sunset covers the page aurora.
    // The drawing buffer starts white, so startSunset() paints before this
    // effect returns — otherwise the hero sits on that blank white.
    // vocab: webgl2 = the browser's GPU drawing API. This shader needs version 2
    // for the wave-layer array. No GPU? The CSS fill stays (dark water, no sun).
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
      paintSunsetFrame(gl, program, vertexArray, timeLocation, resolutionLocation, canvas, elapsedSeconds);
    };

    // 2. Compile and paint once immediately. Waiting for the next frame is how
    // the hero sat on the blank white canvas.
    const startSunset = () => {
      if (disposed || gl.isContextLost()) return;

      program = linkSunsetProgram(gl);
      if (!program) return;

      // vocab: vertex array = a WebGL2 requirement even when the triangle has no mesh data
      vertexArray = gl.createVertexArray();
      gl.bindVertexArray(vertexArray);

      const openingSeconds = userPrefersReducedMotion ? FROZEN_SUNSET_SECONDS : 0;
      paint(openingSeconds);

      // 3. Reduced motion: keep that still frame. Repaint only when the hero changes size.
      if (userPrefersReducedMotion) {
        const paintStillOnResize = () => paint(FROZEN_SUNSET_SECONDS);
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

    // A previous visit may have lost this canvas (the bug this file used to have).
    // Restore it, then compile. A healthy context just starts.
    const onContextRestored = () => startSunset();
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    if (gl.isContextLost()) {
      const loseContext = gl.getExtension('WEBGL_lose_context');
      if (loseContext) loseContext.restoreContext();
    } else {
      startSunset();
    }

    // 5. Leaving the hero cancels the loop. The context stays, so the logo's
    // own WebGL canvas is the only other one this page needs.
    return () => {
      disposed = true;
      window.cancelAnimationFrame(raf);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      removeResizeListener();
      removeVisibilityObserver();
      releaseSunsetGpuObjects(gl, program, vertexArray);
    };
  }, [userPrefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="sunset-ocean-canvas"
      data-testid="hero-sunset-shader"
      aria-hidden="true"
    />
  );
}
