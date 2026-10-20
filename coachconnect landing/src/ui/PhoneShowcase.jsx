// PhoneShowcase — a demo stage: the new iPhone model with a live 16:9 video on its screen.
// Flow: load the model → stream the clip into a video texture → paint that texture
// onto the model's Front_Screen mesh → slowly auto-rotate (dragging spins it too).
// Not scroll-driven on purpose — the old fly-through camera stays dead.
// Used by: pages/Landing.jsx, parked right under the hero so the owner can confirm
// video-on-screen works before the new design is built around it.

import { Suspense, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Center, Environment, Float, Lightformer, OrbitControls, useGLTF, useVideoTexture } from '@react-three/drei';

// ===== NAMED CONSTANTS =====

// Manipulate here: swap this URL to test any clip. It must be 16:9 and CORS-open.
// vocab: CORS = the video server sending "Access-Control-Allow-Origin: *". Without
// it the browser refuses to hand video frames to WebGL and the screen stays black.
// (Google's sample bucket answers 403 from here; MDN's flower clip is the stand-in
// that works. A real app video will replace this.)
const VIDEO_URL = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
const MODEL_URL = '/models/apple_iphone_18_pro_max_silver.glb';

// ===== HELPER FUNCTIONS =====

/**
 * The iPhone, loaded and scaled up, with the video painted on its screen.
 * @returns {JSX.Element}
 */
function Phone() {
  const { scene } = useGLTF(MODEL_URL);

  // vocab: a video texture = a texture whose pixels are the playing video,
  // refreshed every frame. muted + playsInline are what let it autoplay
  // without a tap — mobile browsers refuse loud or fullscreen-first video.
  const videoTexture = useVideoTexture(VIDEO_URL, {
    muted: true,
    loop: true,
    start: true,
    playsInline: true,
    crossOrigin: 'Anonymous',
  });

  useEffect(() => {
    // 1. Find the screen. The model ships a mesh literally named Front_Screen
    // (checked in the file before this was written) and it is the outermost
    // front surface, so nothing covers it. If a future model renames it,
    // stop quietly instead of painting the video somewhere wrong.
    const screenMesh = scene.getObjectByName('Front_Screen');
    if (!screenMesh) return;

    // 2. Work out how much of the frame to show. The screen is portrait
    // (about 0.46 wide-for-tall) and the clip is 16:9 landscape, so showing
    // the whole frame would squash everything tall and thin. Instead sample
    // only the middle slice whose shape matches the screen — a center crop.
    // Manipulate here: frameSliceToShow nearer 1 = more frame, more squish
    const screenSize = new THREE.Box3().setFromObject(screenMesh).getSize(new THREE.Vector3());
    const screenWidthForHeight = screenSize.x / screenSize.y;
    const videoWidthForHeight = 16 / 9;
    const frameSliceToShow = Math.min(1, screenWidthForHeight / videoWidthForHeight);
    videoTexture.repeat.set(frameSliceToShow, 1);
    videoTexture.offset.set((1 - frameSliceToShow) / 2, 0);
    videoTexture.colorSpace = THREE.SRGBColorSpace;

    // 3. Paint the video on the screen. A basic material ignores scene light
    // on purpose: a real screen makes its own light, and this keeps the
    // video readable no matter how the stage is lit.
    screenMesh.material = new THREE.MeshBasicMaterial({ map: videoTexture, toneMapped: false });
  }, [scene, videoTexture]);

  // The raw model is real-world size (about 16cm tall in its file), so scale
  // it up to stage size and let <Center> put its middle at the origin.
  return (
    <Center>
      <primitive object={scene} scale={19} />
    </Center>
  );
}

// ===== MAIN FUNCTION =====

/**
 * The demo stage under the hero: pixel label, the spinning phone, one caption.
 * @returns {JSX.Element}
 */
export function PhoneShowcase() {
  return (
    <section className="relative z-10 px-5 py-14" data-testid="phone-showcase">
      <div className="mx-auto max-w-4xl text-center">
        <p className="font-pixel text-[0.6rem] uppercase leading-relaxed text-pink" data-testid="phone-showcase-eyebrow">
          App preview — video test
        </p>

        {/* A fixed-height stage: this canvas exists only to show the phone,
            so it gets a demo-sized box instead of a full chapter. */}
        <div className="mt-4 h-[430px] sm:h-[540px]" data-testid="phone-stage">
          <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0.4, 6.4], fov: 38 }} gl={{ antialias: true, alpha: true }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 8, 6]} intensity={1.6} />
            <pointLight position={[-6, 2, 4]} intensity={24} color="#FF6B9D" />
            <pointLight position={[6, -2, 3]} intensity={16} color="#06B6D4" />
            <Suspense fallback={null}>
              <Float speed={2} rotationIntensity={0.35} floatIntensity={0.55}>
                <Phone />
              </Float>
              {/* Reflections for the silver body without downloading an HDR:
                  these light cards are rendered into an environment map locally */}
              <Environment resolution={256}>
                <color attach="background" args={['#0a0a0f']} />
                <Lightformer intensity={2.5} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
                <Lightformer intensity={1.5} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} color="#ffd9e8" />
                <Lightformer intensity={1.5} position={[5, 1, -1]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} color="#d4f3ff" />
              </Environment>
            </Suspense>
            {/* Manipulate here: autoRotateSpeed = idle spin rate; dragging still works */}
            <OrbitControls makeDefault enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.9} />
          </Canvas>
        </div>

        <p className="text-sm text-white/45" data-testid="phone-showcase-caption">
          Live 16:9 video playing on the phone screen. Drag to spin it.
        </p>
      </div>
    </section>
  );
}
