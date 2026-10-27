// Logo3D.jsx — the 3D CC logo from the first site, now still by default.
// It only turns when someone drags it (user action, DESIGN.md section 9), and
// it renders on demand, so it costs nothing while nobody touches it.
// Lazy-loaded by the homepage so three.js never blocks the first paint.
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Center, Environment, Lightformer, OrbitControls, useGLTF } from '@react-three/drei';

const LOGO_MODEL_URL = '/models/cc_logo.glb';
// Manipulate here: how far either way the drag can turn the logo (radians).
const TURN_LIMIT = Math.PI / 3;

function LogoModel() {
  const { scene } = useGLTF(LOGO_MODEL_URL);
  return (
    <Center>
      <primitive object={scene} scale={0.84} />
    </Center>
  );
}

/**
 * @returns {JSX.Element}
 */
export default function Logo3D() {
  return (
    <div className="logo3d" title="Drag to turn">
      <Canvas
        dpr={[1, 1.5]}
        frameloop="demand"
        camera={{ position: [0, 0.1, 5.4], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        aria-hidden="true"
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 6, 6]} intensity={1.8} />
        <Suspense fallback={null}>
          <LogoModel />
          {/* Reflection cards in brand pink and orange, so the chrome picks up the palette */}
          <Environment resolution={256}>
            <color attach="background" args={['#0a0a0f']} />
            <Lightformer intensity={2.5} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
            <Lightformer intensity={1.6} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} color="#f2b8dc" />
            <Lightformer intensity={1.6} position={[5, 1, -1]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} color="#ffd8ad" />
          </Environment>
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
          minAzimuthAngle={-TURN_LIMIT}
          maxAzimuthAngle={TURN_LIMIT}
        />
      </Canvas>
    </div>
  );
}
