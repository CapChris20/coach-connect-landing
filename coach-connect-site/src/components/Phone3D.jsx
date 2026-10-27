// Phone3D.jsx — the 3D iPhone from the first site, now playing a real Coach
// Connect recording on its screen instead of a stock clip.
// Flow: load the model → find the Front_Screen mesh → map the recording onto it,
// cropped to the screen's shape → visitor drags to turn it.
// This is /how-it-works' hero piece. It renders only while on screen, caps
// pixel ratio at 1.5, and shows the still poster for reduced motion.
// Lazy-loaded so three.js stays off every other page.
import { Suspense, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Center, Environment, Lightformer, OrbitControls, useGLTF, useTexture, useVideoTexture } from '@react-three/drei';
import { useInView, usePrefersReducedMotion } from './hooks';

const MODEL_URL = import.meta.env.VITE_ARTIFACT ? 'models/apple_iphone_18_pro_max_silver.gltf.json' : 'models/apple_iphone_18_pro_max_silver.glb';
const SCREEN_MESH_NAME = 'Front_Screen';
// The recordings are 540 by 1094 portrait.
const RECORDING_ASPECT = 540 / 1094;

/**
 * Crop a texture so it covers the screen without stretching, then paint it on.
 * @param {THREE.Object3D} scene
 * @param {THREE.Texture} texture
 */
function paintScreen(scene, texture) {
  const screenMesh = scene.getObjectByName(SCREEN_MESH_NAME);
  if (!screenMesh) return;
  const screenSize = new THREE.Box3().setFromObject(screenMesh).getSize(new THREE.Vector3());
  const screenAspect = screenSize.x / screenSize.y;
  // vocab: repeat < 1 on one axis = show only the middle slice on that axis.
  // center 0.5 makes that slice the middle; the negative y repeat flips the
  // picture, because the model's screen UVs run bottom-up.
  let visibleWidth = 1;
  let visibleHeight = 1;
  if (screenAspect > RECORDING_ASPECT) visibleHeight = RECORDING_ASPECT / screenAspect;
  else visibleWidth = screenAspect / RECORDING_ASPECT;
  texture.center.set(0.5, 0.5);
  texture.repeat.set(visibleWidth, -visibleHeight);
  texture.colorSpace = THREE.SRGBColorSpace;
  screenMesh.material = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
}

function PhoneWithVideo({ src }) {
  const { scene } = useGLTF(MODEL_URL);
  const videoTexture = useVideoTexture(src, { muted: true, loop: true, start: true, playsInline: true });
  useEffect(() => paintScreen(scene, videoTexture), [scene, videoTexture]);
  return (
    <Center>
      <primitive object={scene} scale={19} />
    </Center>
  );
}

function PhoneWithPoster({ poster }) {
  const { scene } = useGLTF(MODEL_URL);
  const posterTexture = useTexture(poster);
  useEffect(() => paintScreen(scene, posterTexture), [scene, posterTexture]);
  return (
    <Center>
      <primitive object={scene} scale={19} />
    </Center>
  );
}

/**
 * @param {{ src: string, poster: string }} props
 * @returns {JSX.Element}
 */
export default function Phone3D({ src, poster }) {
  const stageRef = useRef(null);
  const isInView = useInView(stageRef, 0.1);
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div ref={stageRef} className="phone3d" title="Drag to turn the phone">
      <Canvas
        dpr={[1, 1.5]}
        frameloop={isInView && !prefersReducedMotion ? 'always' : 'demand'}
        camera={{ position: [0, 0, 5.4], fov: 36 }}
        gl={{ antialias: true, alpha: true }}
        aria-hidden="true"
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 8, 6]} intensity={1.6} />
        <Suspense fallback={null}>
          {prefersReducedMotion ? <PhoneWithPoster poster={poster} /> : <PhoneWithVideo src={src} />}
          <Environment resolution={256}>
            <color attach="background" args={['#0a0a0f']} />
            <Lightformer intensity={2.5} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
            <Lightformer intensity={1.4} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} color="#e3c6ff" />
            <Lightformer intensity={1.4} position={[5, 1, -1]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} color="#ffd8ad" />
          </Environment>
        </Suspense>
        <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI / 2.6} maxPolarAngle={Math.PI / 1.6} />
      </Canvas>
    </div>
  );
}
