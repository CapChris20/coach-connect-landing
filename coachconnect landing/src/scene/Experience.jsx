// WebGL canvas shell — fog, lights, camera Rig, haze, 7 acts.
// Flow: Canvas mounts → EnvSetup (cheap room reflections) → Rig dollys on scroll
//       → Act* scenes spaced on Z. HTML HUD sits above (pointer-events on canvas OFF).
// Perf: AdaptiveDpr, capped dpr, no canvas raycasts, fog culls distant acts.
// Used by pages/Landing.jsx when prefers-reduced-motion is OFF.
import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { RoomEnvironment } from 'three-stdlib';
import {
  ACTS,
  GAP,
  ActArrival,
  ActConnection,
  ActClient,
  ActTrainer,
  ActDiffs,
  ActPricing,
  ActFinale,
} from './models';
import VoidAura from './VoidAura';

// Offline PBR reflections for metal phone/dumbbell — no HDR download.
// vocab: PMREMGenerator = bakes a scene into an env map the GPU can sample cheaply
function EnvSetup() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    // Manipulate here: 0.04 = blur amount on the room bake (higher = softer metal)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    // Metals look dull without this; keep intensity modest for dark neon look
    scene.environmentIntensity = 0.55;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

// Scroll-driven camera dolly + light mouse parallax.
// vocab: damp = exponential ease toward a target (cinematic, not linear lerp)
// vocab: pointer = normalized mouse (−1..1); we feed our OWN ref so canvas can skip raycasts
function Rig({ progress, pointerRef }) {
  const { camera } = useThree();

  useFrame((_, dt) => {
    // Cap dt so a tab-background hitch doesn’t fling the camera
    const t = Math.min(dt, 1 / 30);

    // progress 0→1 maps camera z from 8 → 8 − 30×6 = −172
    // Manipulate here: λ=2.5 = how snappy the dolly feels (higher = tighter follow)
    const targetZ = 8 - progress.current * GAP * (ACTS - 1);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 2.5, t);

    const px = pointerRef.current.x;
    const py = pointerRef.current.y;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, px * 0.8, 1.5, t);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.3 + py * 0.5, 1.5, t);
    camera.lookAt(0, 0, camera.position.z - 12);
  });

  return null;
}

function Scene({ progress, pointerRef }) {
  return (
    <>
      {/* Clear color matches void base inside VoidAura (also used if shader is late) */}
      <color attach="background" args={['#0A0A0F']} />
      {/* Manipulate here: near/far = how fast acts fade into the void */}
      <fog attach="fog" args={['#0A0A0F', 9, 42]} />
      <ambientLight intensity={0.4} />
      <EnvSetup />
      {/* No AdaptiveDpr — it was dropping pixel ratio and making the aurora look soft */}
      <Rig progress={progress} pointerRef={pointerRef} />

      {/* Neon aurora void — swap VoidAura.jsx shaders anytime for a different look */}
      <VoidAura progress={progress} />

      {/* Global haze sparkles on top of the shader wash */}
      {/* Manipulate here: count 70 is the haze density knob */}
      <Sparkles
        count={40}
        scale={[26, 16, 200]}
        size={1.6}
        speed={0.12}
        opacity={0.35}
        color="#ffffff"
        position={[0, 0, -90]}
      />

      <ActArrival progress={progress} />
      <ActConnection progress={progress} />
      <ActClient progress={progress} />
      <ActTrainer progress={progress} />
      <ActDiffs progress={progress} />
      <ActPricing progress={progress} />
      <ActFinale progress={progress} />
    </>
  );
}

export default function Experience({ progress }) {
  // Window-level pointer so the Canvas can use pointer-events:none (no raycasting cost).
  // vocab: normalized device coords ≈ −1..1 from center of the viewport
  const pointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e) => {
      pointerRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <div className="fixed inset-0 z-0" data-testid="webgl-canvas">
      <Canvas
        // GLBs at 1.5× — bg is its own half-res FBO, so we don’t need 2× here
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        // Critical: HTML HUD owns clicks; skipping canvas events avoids raycast every move
        style={{ pointerEvents: 'none' }}
        camera={{ position: [0, 0.3, 8], fov: 45, near: 0.1, far: 220 }}
      >
        <Suspense fallback={null}>
          <Scene progress={progress} pointerRef={pointerRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}
