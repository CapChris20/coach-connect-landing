// LogoModel — the CC logo as a real 3D model, standing big in the middle
// of the hero (TopSection wraps it in .hero-center-logo for the size).
// Flow: load the logo GLB → rock it left and right so the side lights keep
// sliding across the letters. The rock loops. Reduced motion leaves it still.
// Used by: ui/Sections.jsx (TopSection).

import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Center, Environment, Lightformer, useGLTF } from '@react-three/drei';

// ===== NAMED CONSTANTS =====

const LOGO_MODEL_URL = '/models/cc_logo.glb';

// The file is about 6.4 x 4 units; this scale lands it near 5.4 units wide,
// filling most of the stage instead of floating in empty canvas.
// Manipulate here: bigger logo = bigger number (past ~0.85 the CC's edges
// start to leave the frame)
const LOGO_SCALE = 0.84;

// Manipulate here: bigger number = a wider rock, left and right of center
const SWAY_DEGREES = 16;

// Manipulate here: seconds for one full left-to-right-to-left rock
const SWAY_SECONDS = 8;

const SWAY_RADIANS = (SWAY_DEGREES * Math.PI) / 180;

// ===== HELPER FUNCTIONS =====

/**
 * True when the OS asks the page not to animate.
 * @returns {boolean}
 */
function systemWantsReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * The logo mesh, rocking on its vertical axis. With reduced motion it stays
 * facing the camera. Otherwise it sways forever so the side lights keep moving.
 * @param {{ motionIsReduced: boolean }} props
 * @returns {JSX.Element}
 */
function TiltingLogo({ motionIsReduced }) {
  const logoGroup = useRef(null);
  const { scene } = useGLTF(LOGO_MODEL_URL);

  useFrame(({ clock }) => {
    const group = logoGroup.current;
    if (!group) return;

    if (motionIsReduced) {
      group.rotation.y = 0;
      return;
    }

    // vocab: rotation.y = turn around the vertical axis, in radians.
    // sin goes -1 → 1 → -1, so the mark rocks left, then right, then back.
    const cycle = (clock.elapsedTime / SWAY_SECONDS) * Math.PI * 2;
    group.rotation.y = Math.sin(cycle) * SWAY_RADIANS;
  });

  return (
    <group ref={logoGroup}>
      <Center>
        <primitive object={scene} scale={LOGO_SCALE} />
      </Center>
    </group>
  );
}

// ===== MAIN FUNCTION =====

/**
 * A small stage with the 3D logo on it. The mark rocks left and right
 * and keeps going. Reduced motion leaves it facing forward.
 * @returns {JSX.Element}
 */
export function LogoModel() {
  // 1. Follow the OS reduce-motion setting, including a change while the page is open.
  const [motionIsReduced, setMotionIsReduced] = useState(systemWantsReducedMotion);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const rememberChoice = () => setMotionIsReduced(media.matches);
    media.addEventListener('change', rememberChoice);
    return () => media.removeEventListener('change', rememberChoice);
  }, []);

  // 2. Stage the model. The turn itself lives in TiltingLogo.
  // The stage box lives in index.css (.logo-model-stage): its height is
  // tied to the viewport height there, so on a short screen the stage
  // shrinks instead of pushing the mark off the first screen.
  return (
    <div className="logo-model-stage" data-testid="logo-model">
      {/* vocab: frameloop "always" = redraw every screen refresh, which the
          rock needs. "demand" draws one still frame when motion is reduced. */}
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.2, 5.6], fov: 40 }} gl={{ antialias: true, alpha: true }} frameloop={motionIsReduced ? 'demand' : 'always'}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 6, 6]} intensity={1.8} />
        <Suspense fallback={null}>
          <TiltingLogo motionIsReduced={motionIsReduced} />
          {/* Same local light cards as the phone stage: reflections with no
              downloaded HDR file. The pink card is on the left, the blue
              card on the right — the turn is what lets those colors move
              across the letters. */}
          <Environment resolution={256}>
            <color attach="background" args={['#0a0a0f']} />
            <Lightformer intensity={2.5} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
            <Lightformer intensity={1.5} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} color="#ffd9e8" />
            <Lightformer intensity={1.5} position={[5, 1, -1]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} color="#d4f3ff" />
          </Environment>
        </Suspense>
      </Canvas>
    </div>
  );
}
