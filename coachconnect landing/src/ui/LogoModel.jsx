// LogoModel — the CC logo as a real 3D model, sitting on the left under the hero title.
// Flow: load the logo GLB → turn it 8° over 7 seconds so the side lights
// slide across the letters → stop drawing once it has settled.
// Used by: ui/Sections.jsx, inside HeroLeftColumn. The hop that used to live
// in .logo-bounce is gone; this turn happens inside the canvas.

import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Center, Environment, Lightformer, useGLTF } from '@react-three/drei';

// ===== NAMED CONSTANTS =====

const LOGO_MODEL_URL = '/models/cc_logo.glb';

// The file is about 6.4 x 4 units; this scale lands it near 3.9 units wide.
// Manipulate here: bigger logo = bigger number
const LOGO_SCALE = 0.62;

// Manipulate here: bigger number = the mark turns farther before it rests
const TILT_DEGREES = 8;

// Manipulate here: seconds from straight-on to the resting tilt
const TILT_SECONDS = 7;

const TILT_RADIANS = (TILT_DEGREES * Math.PI) / 180;

// ===== HELPER FUNCTIONS =====

/**
 * Ease-out so the turn starts clearly and eases into the resting angle.
 * @param {number} progress - 0 at the start, 1 when the tilt is done
 * @returns {number}
 */
function easeOutCubic(progress) {
  return 1 - Math.pow(1 - progress, 3);
}

/**
 * True when the OS asks the page not to animate.
 * @returns {boolean}
 */
function systemWantsReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * The logo mesh, turned on its vertical axis. With reduced motion it stays
 * facing the camera. Otherwise it eases to TILT_DEGREES and then stops
 * asking for frames, so the canvas can sleep.
 * @param {{ motionIsReduced: boolean }} props
 * @returns {JSX.Element}
 */
function TiltingLogo({ motionIsReduced }) {
  const logoGroup = useRef(null);
  const startedAtSeconds = useRef(null);
  // vocab: invalidate = "please draw one more frame." frameloop "demand"
  // draws nothing until something calls this.
  const { invalidate } = useThree();
  const { scene } = useGLTF(LOGO_MODEL_URL);

  // A fresh start whenever the motion setting changes. One request paints
  // the first pose; the loop below asks for the rest.
  useEffect(() => {
    startedAtSeconds.current = null;
    invalidate();
  }, [invalidate, motionIsReduced]);

  useFrame(({ clock, invalidate: requestAnotherFrame }) => {
    const group = logoGroup.current;
    if (!group) return;

    if (motionIsReduced) {
      group.rotation.y = 0;
      return;
    }

    if (startedAtSeconds.current === null) {
      startedAtSeconds.current = clock.elapsedTime;
    }

    const elapsedSeconds = clock.elapsedTime - startedAtSeconds.current;
    const progress = Math.min(elapsedSeconds / TILT_SECONDS, 1);
    // vocab: rotation.y = turn around the vertical axis, in radians.
    // Positive brings the right edge forward into the blue side light.
    group.rotation.y = easeOutCubic(progress) * TILT_RADIANS;

    if (progress < 1) {
      requestAnotherFrame();
    }
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
 * A small stage with the 3D logo on it. The mark turns 8° over 7 seconds
 * and then rests. Reduced motion leaves it facing forward.
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
  return (
    <div className="h-[300px] w-[380px] max-w-full sm:h-[360px] sm:w-[500px]" data-testid="logo-model">
      {/* vocab: frameloop="demand" = draw only when TiltingLogo asks.
          After the 7 seconds it stops asking, so the canvas idles. */}
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.2, 5.6], fov: 40 }} gl={{ antialias: true, alpha: true }} frameloop="demand">
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
