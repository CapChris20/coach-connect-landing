// CoachConnectLogo.jsx
// The 3D Coach Connect logo model shown in the center of the hero section.

import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Center, Environment, Lightformer, useGLTF } from '@react-three/drei';

const LOGO_MODEL_URL = '/models/cc_logo.glb';
const LOGO_SCALE = 0.84;
const SWAY_RADIANS = (16 * Math.PI) / 180;
const SWAY_SECONDS = 8;

// 3D tilting logo component
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

    // Gently rock left and right so lighting shines across the logo
    const timeCycle = (clock.elapsedTime / SWAY_SECONDS) * Math.PI * 2;
    group.rotation.y = Math.sin(timeCycle) * SWAY_RADIANS;
  });

  return (
    <group ref={logoGroup}>
      <Center>
        <primitive object={scene} scale={LOGO_SCALE} />
      </Center>
    </group>
  );
}

// Stage containing the 3D canvas and lights
export function CoachConnectLogo() {
  const [motionIsReduced, setMotionIsReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setMotionIsReduced(mediaQuery.matches);
    mediaQuery.addEventListener('change', updateMotion);
    return () => mediaQuery.removeEventListener('change', updateMotion);
  }, []);

  return (
    <div className="logo-model-stage" data-testid="logo-model">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.2, 5.6], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        frameloop={motionIsReduced ? 'demand' : 'always'}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 6, 6]} intensity={1.8} />
        <Suspense fallback={null}>
          <TiltingLogo motionIsReduced={motionIsReduced} />
          {/* Subtle reflection cards: pink on the left, blue on the right */}
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

// Backward-compatible alias
export { CoachConnectLogo as LogoModel };
