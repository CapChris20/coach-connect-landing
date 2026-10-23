// Phone3DShowcase.jsx
// A 3D interactive iPhone model with video playing on its screen.
// You can drag to rotate the phone in 3D space.

import { Suspense, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Center, Environment, Float, Lightformer, OrbitControls, useGLTF, useVideoTexture } from '@react-three/drei';
import './phone-3d-showcase.css';

// Demo video URL and 3D iPhone GLTF model path
const VIDEO_URL = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
const MODEL_URL = '/models/apple_iphone_18_pro_max_silver.glb';

// The 3D Phone component with the video applied to the screen
function Phone() {
  const { scene } = useGLTF(MODEL_URL);

  // Load the video as an animated texture
  const videoTexture = useVideoTexture(VIDEO_URL, {
    muted: true,
    loop: true,
    start: true,
    playsInline: true,
    crossOrigin: 'Anonymous',
  });

  useEffect(() => {
    // Step 1: Find the phone screen mesh in the 3D model
    const screenMesh = scene.getObjectByName('Front_Screen');
    if (!screenMesh) return;

    // Step 2: Fit the video neatly on the vertical screen without stretching
    const screenSize = new THREE.Box3().setFromObject(screenMesh).getSize(new THREE.Vector3());
    const screenAspectRatio = screenSize.x / screenSize.y;
    const videoAspectRatio = 16 / 9;
    const frameSlice = Math.min(1, screenAspectRatio / videoAspectRatio);

    videoTexture.repeat.set(frameSlice, 1);
    videoTexture.offset.set((1 - frameSlice) / 2, 0);
    videoTexture.colorSpace = THREE.SRGBColorSpace;

    // Step 3: Put the video texture onto the phone screen mesh
    screenMesh.material = new THREE.MeshBasicMaterial({ map: videoTexture, toneMapped: false });
  }, [scene, videoTexture]);

  return (
    <Center>
      <primitive object={scene} scale={19} />
    </Center>
  );
}

// Main component: 3D Canvas, lighting, and controls
export function Phone3DShowcase() {
  return (
    <section className="phone-showcase-section" data-testid="phone-showcase">
      <div className="phone-showcase-inner">
        <p className="phone-showcase-eyebrow" data-testid="phone-showcase-eyebrow">
          App preview — video test
        </p>

        {/* 3D Canvas Stage */}
        <div className="phone-showcase-stage" data-testid="phone-stage">
          <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0.4, 6.4], fov: 38 }} gl={{ antialias: true, alpha: true }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 8, 6]} intensity={1.6} />
            <pointLight position={[-6, 2, 4]} intensity={24} color="#FF6B9D" />
            <pointLight position={[6, -2, 3]} intensity={16} color="#06B6D4" />

            <Suspense fallback={null}>
              {/* Gentle floating animation */}
              <Float speed={2} rotationIntensity={0.35} floatIntensity={0.55}>
                <Phone />
              </Float>

              {/* Lighting reflections for the silver phone body */}
              <Environment resolution={256}>
                <color attach="background" args={['#0a0a0f']} />
                <Lightformer intensity={2.5} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
                <Lightformer intensity={1.5} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} color="#ffd9e8" />
                <Lightformer intensity={1.5} position={[5, 1, -1]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} color="#d4f3ff" />
              </Environment>
            </Suspense>

            {/* Orbit controls allow dragging to spin the phone */}
            <OrbitControls makeDefault enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.9} />
          </Canvas>
        </div>

        <p className="phone-showcase-caption" data-testid="phone-showcase-caption">
          Live 16:9 video playing on the phone screen. Drag to spin it.
        </p>
      </div>
    </section>
  );
}

// Backward-compatible alias
export { Phone3DShowcase as PhoneShowcase };
