// LiquidTwistBackground — the hero's animated background: a glowing
// liquid-glass ribbon twisting across black, raymarched in a shader.
// Ported from the Framer module the owner supplied
// (framer.com/m/Liquid-Shader-Twist-Blx3VP.js — "SmoothLiquidGlassBackground").
// What the port changed, and nothing else:
//   · The `framer` imports are gone (addPropertyControls / RenderTarget /
//     useIsStaticRenderer are Framer-editor APIs this site doesn't have).
//     The component's props were flattened into the constants below.
//   · Style is locked to the module's DIAGONAL shape: a neon ribbon on
//     black. Its other three shapes sit on pale backgrounds that would
//     wash out the hero's white text. The ribbon's colors are the site's
//     brand palette (the module's own diagonal palette was the same
//     pink/purple/cyan/orange family — these are the site's exact hexes).
//   · Site house rules added: 30fps cap, pixel-ratio cap, pause off-screen,
//     and one still frame for reduced motion (the original loops forever).
//   · One fix: u_resolution now gets the real drawing-buffer size. The
//     original passed CSS pixels, which off-centers the ribbon on retina.
// Flow: mount a div → build a Three.js scene with the shader on a
// full-screen plane → paint frames → full GPU cleanup on unmount.
// PARKED: was the hero background until the dumbbell video
// (HeroVideoBackground) replaced it. One import swap in
// ui/Sections.jsx (TopSection) brings it back.

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { usePrefersReducedMotion } from '../app-settings-and-helpers/useScreenSizeAndMotion';

// ===== NAMED CONSTANTS =====

// The module's shape enum: 0 diagonal, 1 vertical, 2 corrugated, 3 fold.
// Locked to diagonal — see the header for why.
// Manipulate here: the module's other shapes are one number away, but
// they bring their pale backgrounds with them (shader, near the bottom).
const SHAPE_STYLE_DIAGONAL = 0;

// Manipulate here: lower FRAME_MS = smoother twist but heavier; raise = calmer on laptops.
// 33ms ≈ 30fps. The twist is slow, so 30 is enough.
const FRAME_MS = 33;

// Manipulate here: 1 = lighter on battery, 2 = crisp on retina but paints more pixels.
// This shader raymarches 120 steps per pixel — 1.5 is already generous.
const MAX_PIXEL_RATIO = 1.5;

// Manipulate here: the still twist shown when the OS "reduce motion" setting is on.
// Seconds into the animation — 2s in, the ribbon is mid-twist.
const FROZEN_TWIST_SECONDS = 2.0;

// How far the camera sits from the ribbon. The shader centers on
// u_resolution, so feeding it a multiplied resolution zooms the scene
// out while keeping it centered (the module's demos were eyeballed on
// retina screens, where its CSS-pixel resolution did this by accident).
// Manipulate here: 1 = the ribbon fills the hero edge to edge;
// 1.5 = ribbon band with black breathing room around it for the text.
const RIBBON_ZOOM_OUT = 1.5;

// Animation speeds from the module's defaults.
// Manipulate here: TWIST_SPEED = how fast the ribbon rotates; ANIMATION_SPEED = overall clock.
const TWIST_SPEED = 0.35;
const ANIMATION_SPEED = 1;

// The diagonal shape's knobs (the module's defaults).
// Manipulate here: THICKNESS = ribbon fatness; TWIST = how hard it corkscrews;
// REACH = how far the twist travels before flattening; ROTATION = the diagonal's tilt.
const DIAGONAL_THICKNESS = 1.3;
const DIAGONAL_TWIST = 1;
const DIAGONAL_REACH = 8;
const DIAGONAL_ROTATION = 0.55;

// The other shapes' knobs, at the module's defaults. The shader declares
// these uniforms even when another shape is active, so they must exist.
const UNUSED_SHAPE_SETTINGS = {
  vertWidth: 1.2,
  vertWaveAmp: 1.2,
  vertTwist: 1,
  vertMicroFold: 0.3,
  corrWidth: 1.5,
  corrSnakeAmp: 0.8,
  corrPleatFreq: 45,
  corrPleatDepth: 0.035,
  foldWidth: 4,
  foldBillow: 1.5,
  foldTension: 0.6,
  foldRotation: -0.35,
};

// The ribbon's colors, core to edge — the site's brand palette.
// The shader mixes them by fresnel (how glancing the view angle is):
// core faces the camera, edge is the silhouette rim.
// Manipulate here: swap a hex and that band of the twist follows.
const RIBBON_COLORS = {
  core: '#0D0221',
  inner: '#FF6B9D',
  mid: '#C084FC',
  outer: '#06B6D4',
  edge: '#F97316',
  highlight: '#FFFFFF',
};

// Full-screen plane corners. The vertex shader ignores the camera and
// places the plane's own coordinates straight into clip space.
const VERTEX_SHADER_SOURCE = `
void main() {
    gl_Position = vec4(position, 1.0);
}
`;

// The liquid twist itself — the module's fragment shader, unchanged
// (uniform names included, so it can be compared line for line).
const FRAGMENT_SHADER_SOURCE = `
uniform float u_time;
uniform vec2 u_resolution;

uniform float u_shapeStyle;
uniform float u_twistSpeed;

uniform vec2 u_position;

// Diagonal Controls
uniform float u_diagThickness;
uniform float u_diagTwist;
uniform float u_diagReach;
uniform float u_diagRotation;

// Vertical Controls
uniform float u_vertWidth;
uniform float u_vertWaveAmp;
uniform float u_vertTwist;
uniform float u_vertMicroFold;

// Corrugated Controls
uniform float u_corrWidth;
uniform float u_corrSnakeAmp;
uniform float u_corrPleatFreq;
uniform float u_corrPleatDepth;

// Fold Controls
uniform float u_foldWidth;
uniform float u_foldBillow;
uniform float u_foldTension;
uniform float u_foldRotation;

uniform vec3 u_coreColor;
uniform vec3 u_blueBand;
uniform vec3 u_purpleBand;
uniform vec3 u_cyanBand;
uniform vec3 u_orangeBand;
uniform vec3 u_highlightColor;

// Increased steps for extremely soft/fat geometries
#define MAX_STEPS 120
#define MAX_DIST 15.0
#define SURF_DIST 0.002

mat2 rot(float a) {
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c);
}

float map(vec3 p) {
    vec3 q = p;

    if (u_shapeStyle < 0.5) {
        // 0: Diagonal Style
        q.xy *= rot(u_diagRotation);
        float taper = smoothstep(4.5, 0.0, abs(q.x));

        float reach = 1.0 - smoothstep(max(0.0, u_diagReach - 2.0), u_diagReach, abs(q.x));
        float twistPhase = (q.x * u_diagTwist) * reach - u_time * u_twistSpeed;

        q.yz *= rot(twistPhase);
        float w = u_diagThickness * taper;
        float t = 0.06 * taper;

        vec2 d2 = vec2(max(abs(q.y) - w, 0.0), max(abs(q.z) - t, 0.0));
        // Large subtraction value forces ultra-smooth, pillow-like edges
        float d = length(d2) - 0.35;

        d += 0.015 * sin(q.y * 5.0 + u_time);
        return d * 0.5; // Scaled down ray distance for safety on fat edges

    } else if (u_shapeStyle < 1.5) {
        // 1: Vertical Wave Style
        q.x += sin(q.y * 0.8 + u_time * 0.3) * u_vertWaveAmp;
        q.z += cos(q.y * 0.6 + u_time * 0.2) * 0.4;

        float taper = smoothstep(8.0, 0.0, abs(q.y));

        float reach = smoothstep(8.0, 0.0, abs(q.y));
        float twistPhase = (q.y * u_vertTwist) * reach - u_time * u_twistSpeed;

        q.xz *= rot(twistPhase);

        q.z += sin(q.x * 2.0) * u_vertMicroFold;

        float w = u_vertWidth * taper;
        float t = 0.12 * taper;

        vec2 d2 = vec2(max(abs(q.x) - w, 0.0), max(abs(q.z) - t, 0.0));
        float d = length(d2) - 0.45; // Soft fluid edge

        return d * 0.5;

    } else if (u_shapeStyle < 2.5) {
        // 2: Corrugated Style
        q.xy *= rot(0.65);

        q.y += sin(q.x * 1.5 - u_time * u_twistSpeed * 0.6) * u_corrSnakeAmp;
        q.z += cos(q.x * 1.0 - u_time * u_twistSpeed * 0.4) * (u_corrSnakeAmp * 0.75);

        float taper = smoothstep(7.0, 0.0, abs(q.x));

        float reach = smoothstep(8.0, 0.0, abs(q.x));
        float twistPhase = (q.x * 0.8) * reach - u_time * (u_twistSpeed * 0.4);
        q.yz *= rot(twistPhase);

        float pleats = (sin(q.x * u_corrPleatFreq - u_time * 2.0) * 0.5 + 0.5) * u_corrPleatDepth;

        float w = u_corrWidth * taper;
        float t = (0.04 + pleats) * taper;

        vec2 d2 = vec2(max(abs(q.y) - w, 0.0), max(abs(q.z) - t, 0.0));
        float d = length(d2) - 0.2; // Softened ridges

        d += 0.005 * sin(q.y * 20.0);

        return d * 0.35;
    } else {
        // 3: Sweeping Fold Style
        q.xy *= rot(u_foldRotation);

        float billow = sin(q.y * 1.2 + u_time * u_twistSpeed * 0.15) * u_foldBillow;
        q.z += billow;

        float taper = smoothstep(7.0, 1.0, abs(q.y));

        float reach = smoothstep(8.0, 0.0, abs(q.y));
        float twistPhase = (q.y * 0.8) * reach - u_time * (u_twistSpeed * 0.2);
        q.xz *= rot(twistPhase);

        q.z += sin(q.x * 1.0) * u_foldTension;

        float w = u_foldWidth * taper;
        float t = 0.015 * taper;

        vec2 d2 = vec2(max(abs(q.x) - w, 0.0), max(abs(q.z) - t, 0.0));
        float d = length(d2) - 0.25; // Perfectly round edges for paper fold

        return d * 0.4;
    }
}

// Generous normal epsilon to completely smooth out shading and geometry banding
vec3 getNormal(vec3 p) {
    vec2 e = vec2(0.003, 0);
    vec3 n = vec3(
        map(p + e.xyy) - map(p - e.xyy),
        map(p + e.yxy) - map(p - e.yxy),
        map(p + e.yyx) - map(p - e.yyx)
    );
    return normalize(n);
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

    // Fixed implicit scale
    uv /= 1.15;

    // Apply XY Position
    uv -= u_position;

    vec3 ro = vec3(0.0, 0.0, 6.0);
    vec3 rd = normalize(vec3(uv, -1.5));

    float d0 = 0.0;
    vec3 p;
    bool hit = false;

    for(int i = 0; i < MAX_STEPS; i++) {
        p = ro + rd * d0;
        float ds = map(p);
        d0 += ds;
        if(d0 > MAX_DIST) break;
        if(abs(ds) < SURF_DIST) {
            hit = true;
            break;
        }
    }

    // Background color logic based on active style
    vec3 color = vec3(0.0);
    if (u_shapeStyle > 2.5) {
        // Light, bright background for Sweeping Fold
        vec3 bg1 = vec3(0.9, 0.96, 1.0);
        vec3 bg2 = vec3(0.7, 0.88, 0.98);
        color = mix(bg1, bg2, smoothstep(0.0, 1.5, length(uv)));
    } else if (u_shapeStyle > 1.5) {
        // Corrugated background
        color = mix(vec3(0.96, 0.97, 0.98), vec3(0.88, 0.89, 0.91), uv.y * 0.5 + 0.5);
    }

    if(hit) {
        vec3 n = getNormal(p);
        vec3 v = normalize(ro - p);

        float fresnel = 1.0 - max(dot(n, v), 0.0);
        float f2 = pow(fresnel, 1.4);
        float f4 = pow(fresnel, 4.0);

        color = u_coreColor;

        color = mix(color, u_blueBand, smoothstep(0.0, 0.35, f2));
        color = mix(color, u_cyanBand, smoothstep(0.35, 0.55, f2));
        color = mix(color, u_purpleBand, smoothstep(0.55, 0.75, f2));
        color = mix(color, u_orangeBand, smoothstep(0.75, 1.0, f2));

        vec3 l1 = normalize(vec3(1.5, 2.0, 2.5));
        vec3 h1 = normalize(l1 + v);
        float spec1 = pow(max(dot(n, h1), 0.0), 8.0);

        vec3 l2 = normalize(vec3(-2.0, -1.0, -1.0));
        vec3 h2 = normalize(l2 + v);
        float spec2 = pow(max(dot(n, h2), 0.0), 5.0);

        float edgeGlow = smoothstep(0.6, 1.0, f2) * 0.5;
        vec3 ref = reflect(-v, n);
        float envMap = smoothstep(-0.2, 1.0, ref.y);

        // Extremely soft highlight processing for all modes to avoid hard edge dots
        if (u_shapeStyle > 2.5) {
            spec1 = pow(max(dot(n, h1), 0.0), 12.0);
            spec2 = pow(max(dot(n, h2), 0.0), 8.0);

            color += u_blueBand * envMap * 0.5;
            color += spec1 * u_highlightColor * 1.1;
            color += spec2 * u_highlightColor * 0.7;
            color += u_orangeBand * edgeGlow * f4 * 2.5;
        } else if (u_shapeStyle > 1.5) {
            spec1 = pow(max(dot(n, h1), 0.0), 16.0);
            spec2 = pow(max(dot(n, h2), 0.0), 12.0);
            color += u_blueBand * envMap * 0.4;
            color += spec1 * u_highlightColor * 2.0;
            color += spec2 * u_highlightColor * 1.0;
            color += u_orangeBand * edgeGlow * f4 * 0.5;
        } else {
            color += u_blueBand * envMap * 0.2;
            color += spec1 * u_highlightColor * 1.5;
            color += spec2 * u_highlightColor * 0.8;
            color += u_orangeBand * edgeGlow * f4;
        }

        color = pow(color, vec3(0.9));
    }

    gl_FragColor = vec4(color, 1.0);
}
`;

// ===== HELPER FUNCTIONS =====

/**
 * The shader's uniforms, filled from the constants above. Three.js wants
 * colors as THREE.Color objects; hex strings would upload as text.
 * @returns {Object} uniform map for THREE.ShaderMaterial
 */
function buildTwistUniforms() {
  return {
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2(1, 1) },
    u_shapeStyle: { value: SHAPE_STYLE_DIAGONAL },
    u_twistSpeed: { value: TWIST_SPEED },
    u_position: { value: new THREE.Vector2(0, 0) },
    u_diagThickness: { value: DIAGONAL_THICKNESS },
    u_diagTwist: { value: DIAGONAL_TWIST },
    u_diagReach: { value: DIAGONAL_REACH },
    u_diagRotation: { value: DIAGONAL_ROTATION },
    u_vertWidth: { value: UNUSED_SHAPE_SETTINGS.vertWidth },
    u_vertWaveAmp: { value: UNUSED_SHAPE_SETTINGS.vertWaveAmp },
    u_vertTwist: { value: UNUSED_SHAPE_SETTINGS.vertTwist },
    u_vertMicroFold: { value: UNUSED_SHAPE_SETTINGS.vertMicroFold },
    u_corrWidth: { value: UNUSED_SHAPE_SETTINGS.corrWidth },
    u_corrSnakeAmp: { value: UNUSED_SHAPE_SETTINGS.corrSnakeAmp },
    u_corrPleatFreq: { value: UNUSED_SHAPE_SETTINGS.corrPleatFreq },
    u_corrPleatDepth: { value: UNUSED_SHAPE_SETTINGS.corrPleatDepth },
    u_foldWidth: { value: UNUSED_SHAPE_SETTINGS.foldWidth },
    u_foldBillow: { value: UNUSED_SHAPE_SETTINGS.foldBillow },
    u_foldTension: { value: UNUSED_SHAPE_SETTINGS.foldTension },
    u_foldRotation: { value: UNUSED_SHAPE_SETTINGS.foldRotation },
    u_coreColor: { value: new THREE.Color(RIBBON_COLORS.core) },
    u_blueBand: { value: new THREE.Color(RIBBON_COLORS.inner) },
    u_cyanBand: { value: new THREE.Color(RIBBON_COLORS.mid) },
    u_purpleBand: { value: new THREE.Color(RIBBON_COLORS.outer) },
    u_orangeBand: { value: new THREE.Color(RIBBON_COLORS.edge) },
    u_highlightColor: { value: new THREE.Color(RIBBON_COLORS.highlight) },
  };
}

// ===== MAIN FUNCTION =====

/**
 * The hero's liquid-twist background. Decorative only: it does not
 * take clicks, and screen readers skip it. Reduced motion gets one still frame.
 * @returns {JSX.Element}
 */
export function LiquidTwistBackground() {
  const mountRef = useRef(null);
  const userPrefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return undefined;

    // 1. Renderer on its own canvas inside the mount div. The canvas is
    // created here (not in JSX), so unmount cleanup can throw the whole
    // thing away and a remount starts from a fresh context.
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
    container.appendChild(renderer.domElement);

    // 2. Scene: one full-screen plane wearing the twist shader.
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const material = new THREE.ShaderMaterial({
      uniforms: buildTwistUniforms(),
      vertexShader: VERTEX_SHADER_SOURCE,
      fragmentShader: FRAGMENT_SHADER_SOURCE,
    });
    const geometry = new THREE.PlaneGeometry(2, 2);
    scene.add(new THREE.Mesh(geometry, material));

    // Resolution always tracks the REAL drawing buffer (see the header's
    // retina note), so the ribbon stays centered at any pixel ratio —
    // multiplied by RIBBON_ZOOM_OUT, which only zooms the scene out.
    const rememberSize = () => {
      const width = container.clientWidth || 1;
      const height = container.clientHeight || 1;
      renderer.setSize(width, height);
      material.uniforms.u_resolution.value.set(
        renderer.domElement.width * RIBBON_ZOOM_OUT,
        renderer.domElement.height * RIBBON_ZOOM_OUT,
      );
    };
    rememberSize();

    const paintOnce = (elapsedSeconds) => {
      material.uniforms.u_time.value = elapsedSeconds * ANIMATION_SPEED;
      renderer.render(scene, camera);
    };

    // 3. Reduced motion: one still, repainted only when the hero resizes.
    if (userPrefersReducedMotion) {
      paintOnce(FROZEN_TWIST_SECONDS);
      const resizeObserver = new ResizeObserver(() => {
        rememberSize();
        paintOnce(FROZEN_TWIST_SECONDS);
      });
      resizeObserver.observe(container);
      return () => {
        resizeObserver.disconnect();
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      };
    }

    // 4. The loop: paint at ~30fps, and only while the hero is on screen.
    const resizeObserver = new ResizeObserver(rememberSize);
    resizeObserver.observe(container);

    let isHeroOnScreen = true;
    const visibilityObserver = new IntersectionObserver((entries) => {
      const latestEntry = entries[entries.length - 1];
      isHeroOnScreen = latestEntry.isIntersecting;
    });
    visibilityObserver.observe(container);

    const clock = new THREE.Clock();
    let raf = 0;
    let lastDraw = 0;
    const frame = (now) => {
      raf = window.requestAnimationFrame(frame);
      if (!isHeroOnScreen || document.hidden) return;
      if (now - lastDraw < FRAME_MS) return;
      lastDraw = now;
      paintOnce(clock.getElapsedTime());
    };
    raf = window.requestAnimationFrame(frame);

    // 5. Cleanup: cancel the loop and dispose every GPU object. The canvas
    // goes with it — a remount builds a new renderer on a new canvas.
    return () => {
      window.cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [userPrefersReducedMotion]);

  return <div ref={mountRef} className="liquid-twist-canvas" data-testid="hero-liquid-twist" aria-hidden="true" />;
}
