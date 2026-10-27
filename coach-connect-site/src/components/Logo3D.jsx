// Logo3D.jsx — the 3D CC logo from the first site.
// Default: still, turns only when dragged, renders on demand.
// sway: the homepage hero's version, gently rocking left and right so the light
// runs across the chrome (the first site's behaviour). Reduced motion holds it still.
// Lazy-loaded so three.js never blocks the first paint.
import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { usePrefersReducedMotion } from './hooks';
import { Center, Environment, Lightformer, OrbitControls, useGLTF } from '@react-three/drei';

const LOGO_MODEL_URL = import.meta.env.VITE_ARTIFACT ? 'models/cc_logo.gltf.json' : 'models/cc_logo.glb';
// Manipulate here: how far either way the drag can turn the logo (radians).
const TURN_LIMIT = Math.PI / 3;

// Manipulate here: sway = how far it rocks (radians) and how long one rock takes.
const SWAY_RADIANS = (16 * Math.PI) / 180;
const SWAY_SECONDS = 8;

function LogoModel({ sway }) {
  const { scene } = useGLTF(LOGO_MODEL_URL);
  const groupRef = useRef(null);
  useFrame(({ clock }) => {
    if (!sway || !groupRef.current) return;
    groupRef.current.rotation.y = Math.sin((clock.elapsedTime / SWAY_SECONDS) * Math.PI * 2) * SWAY_RADIANS;
  });
  return (
    <group ref={groupRef}>
      <Center>
        <primitive object={scene} scale={0.84} />
      </Center>
    </group>
  );
}

/**
 * @param {{ sway?: boolean, className?: string }} props
 * @returns {JSX.Element}
 */
export default function Logo3D({ sway = false, className = 'logo3d' }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isSwaying = sway && !prefersReducedMotion;
  return (
    <div className={className} title={sway ? undefined : 'Drag to turn'}>
      <Canvas
        dpr={[1, 1.5]}
        frameloop={isSwaying ? 'always' : 'demand'}
        camera={{ position: [0, 0.1, 5.4], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        aria-hidden="true"
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 6, 6]} intensity={1.8} />
        <Suspense fallback={null}>
          <LogoModel sway={isSwaying} />
          {/* Reflection cards in brand pink and orange, so the chrome picks up the palette */}
          <Environment resolution={256}>
            <color attach="background" args={['#0a0a0f']} />
            <Lightformer intensity={2.5} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
            <Lightformer intensity={1.6} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} color="#f2b8dc" />
            <Lightformer intensity={1.6} position={[5, 1, -1]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} color="#ffd8ad" />
          </Environment>
        </Suspense>
        {!sway && (
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
          minAzimuthAngle={-TURN_LIMIT}
          maxAzimuthAngle={TURN_LIMIT}
        />
        )}
      </Canvas>
    </div>
  );
}
