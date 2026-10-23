// All 7 WebGL “acts” + GLB loader/normalizer for Coach Connect.
// Flow: preload GLBs → normalize (clone, center, scale) → ActGroup places each act on Z
//       → per-act idle motion ONLY while that act is near the camera (active gate).
// Perf: skip useFrame work when culled · frustum cull meshes · fewer sparkles/segments.
// Used by scene/Experience.jsx.
import { createContext, useContext, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, QuadraticBezierLine, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

export const ACTS = 7;
// Manipulate here: world units between act centers (camera travels GAP × 6 over full scroll)
export const GAP = 30;

const MODELS = {
  phone: '/models/cell_phone.glb',
  dumbbell: '/models/metal_dumbell.glb',
  cloche: '/models/food_cover_cloche.glb',
  bottle: '/models/fiji_water_bottle.glb',
  heart: '/models/heart_emoji.glb',
  bolt: '/models/lightning_bolt.glb',
  calendar: '/models/deskcalendar.glb',
  clipboard: '/models/clipboard.glb',
  coins: '/models/coins.glb',
  trophy: '/models/trophy.glb',
};

// Warm the GLTF cache at module load so act swaps don’t hitch mid-scroll
Object.values(MODELS).forEach((url) => useGLTF.preload(url));

// Shared “is this act on-screen?” flag — children bail out of useFrame when false.
// vocab: Context + ref = read latest boolean every frame without React re-renders
const ActActiveContext = createContext(null);

function useActActive() {
  return useContext(ActActiveContext);
}

// Clone → optional brand tint → center at origin → uniform scale to `size`.
// vocab: SkeletonUtils.clone = deep clone that keeps skinned-mesh skeletons intact
//        (NEVER scene.clone(true) — it breaks skinning if you ever add a rigged model)
function normalizeModel(scene, { size = 1, tint = null, tintIntensity = 0.3 } = {}) {
  const root = SkeletonUtils.clone(scene);

  root.traverse((obj) => {
    if (!obj.isMesh) return;

    // Only disable frustum cull on skinned meshes (their bounds often lie).
    // Perf: normal meshes KEEP frustumCulled = true so GPU skips off-camera draw calls.
    if (obj.isSkinnedMesh) {
      obj.frustumCulled = false;
      obj.computeBoundingBox?.();
    }

    // Tint = clone materials then set emissive so we don’t mutate the shared GLTF cache
    if (tint && obj.material) {
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      const cloned = mats.map((m) => {
        const c = m.clone();
        if (c.emissive) {
          c.emissive = new THREE.Color(tint);
          // Manipulate here: tintIntensity 0.3 = soft brand glow on clipboard/calendar
          c.emissiveIntensity = tintIntensity;
        }
        return c;
      });
      obj.material = Array.isArray(obj.material) ? cloned : cloned[0];
    }
  });

  root.updateMatrixWorld(true);

  // Precise bounds after matrices are current — used to center + scale
  const box = new THREE.Box3().setFromObject(root, true);
  const center = box.getCenter(new THREE.Vector3());
  const dim = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(dim.x, dim.y, dim.z) || 1;
  const scale = size / maxDim;

  root.position.sub(center);
  const wrap = new THREE.Group();
  wrap.add(root);
  wrap.scale.setScalar(scale);
  return wrap;
}

function Model({ url, size = 1, tint = null, tintIntensity = 0.3, ...props }) {
  const { scene } = useGLTF(url);
  // Memo so we don’t re-clone every parent render (cloning big GLBs is expensive)
  const obj = useMemo(
    () => normalizeModel(scene, { size, tint, tintIntensity }),
    [scene, size, tint, tintIntensity]
  );
  // vocab: <primitive> = drop a raw THREE.Object3D into the R3F tree
  return <primitive object={obj} {...props} />;
}

// Two app phones staged side-by-side — the “product stage” every act now reserves.
// Why a pair? Coach Connect is two-sided: left phone = client app, right phone = trainer app.
// Future video: attach a <planeGeometry> with a VideoTexture ~0.05 in FRONT of each phone’s
// screen face (phones face +Z) inside these groups — the tilt/bob here carries it for free.
// vocab: spread = x-distance of each phone from the pair’s center line
function PhonePair({
  position = [0, 0, 0],
  size = 2.3,
  spread = 0.95,
  leftTilt = 0.38,
  rightTilt = -0.38,
  phase = 0,
}) {
  const left = useRef();
  const right = useRef();
  const active = useActActive();

  useFrame(({ clock }) => {
    if (!active?.current) return;
    const t = clock.getElapsedTime();
    // Phones breathe in opposite phase so the pair feels alive, not copy-pasted
    // Manipulate here: 0.18 amplitude / 0.9 speed = float height / pace
    if (left.current) {
      left.current.position.y = Math.sin(t * 0.9 + phase) * 0.18;
      left.current.rotation.y = leftTilt + Math.sin(t * 0.5 + phase) * 0.1;
    }
    if (right.current) {
      right.current.position.y = Math.sin(t * 0.9 + phase + Math.PI) * 0.18;
      right.current.rotation.y = rightTilt + Math.sin(t * 0.5 + phase + 1) * 0.1;
    }
  });

  return (
    <group position={position}>
      <group ref={left} position={[-spread, 0, 0]}>
        <Model url={MODELS.phone} size={size} />
      </group>
      <group ref={right} position={[spread, 0, 0.25]}>
        <Model url={MODELS.phone} size={size} />
      </group>
    </group>
  );
}

// Places act at z = −index·GAP, fades/culls it, and publishes `active` for child animations.
export function ActGroup({ index, progress, children }) {
  const ref = useRef();
  const active = useRef(false);

  useFrame(() => {
    const g = ref.current;
    if (!g) return;

    // f ≈ 0 when this act is “home” in front of the camera
    // Manipulate here: |f| < 1.6 = visibility window (smaller = tighter cull, cheaper)
    const f = progress.current * (ACTS - 1) - index;
    const vis = Math.abs(f) < 1.6;
    active.current = vis;
    g.visible = vis;

    // Skip parallax math when off-screen — free CPU for the visible act
    if (!vis) return;
    g.rotation.y = f * 0.22;
    g.position.y = -f * 1.4;
  });

  return (
    <ActActiveContext.Provider value={active}>
      <group ref={ref} position={[0, 0, -index * GAP]}>
        {children}
      </group>
    </ActActiveContext.Provider>
  );
}

function GlassFigure({ color, opacity = 0.4 }) {
  return (
    <group>
      <mesh position={[0, 0.85, 0]}>
        {/* Manipulate here: 16 segs is enough for glass blobs at this scale */}
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.7}
          transparent
          opacity={opacity}
          roughness={0.15}
          metalness={0.2}
        />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <capsuleGeometry args={[0.3, 0.55, 4, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.7}
          transparent
          opacity={opacity}
          roughness={0.15}
          metalness={0.2}
        />
      </mesh>
    </group>
  );
}

function Thread({ color, end, speed = 0.6 }) {
  const ref = useRef();
  const active = useActActive();

  useFrame((_, dt) => {
    // Perf: dashed lines only animate while Connection act is on-screen
    if (!active?.current || !ref.current?.material) return;
    ref.current.material.dashOffset -= dt * speed;
  });

  return (
    <QuadraticBezierLine
      ref={ref}
      start={[0, 0, 0]}
      mid={[end[0] * 0.5, end[1] + 1.2, end[2] * 0.5]}
      end={end}
      color={color}
      lineWidth={1.25}
      dashed
      dashSize={0.25}
      gapSize={0.18}
      transparent
      opacity={0.85}
    />
  );
}

function ChatBubble({ scale = 1 }) {
  return (
    <group scale={scale}>
      {/* smoothness 2 = fewer subdivisions than default 4 */}
      <RoundedBox args={[1.15, 0.8, 0.3]} radius={0.12} smoothness={2}>
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.12}
          roughness={0.2}
          metalness={0.1}
          emissive="#64D2FF"
          emissiveIntensity={0.35}
        />
      </RoundedBox>
      <mesh position={[0.35, -0.48, 0]} rotation={[0, 0, Math.PI / 6]}>
        <coneGeometry args={[0.18, 0.28, 3]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.12}
          emissive="#64D2FF"
          emissiveIntensity={0.35}
        />
      </mesh>
      {[-0.28, 0, 0.28].map((x, i) => (
        <mesh key={i} position={[x, 0.05, 0.16]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#64D2FF" emissive="#64D2FF" emissiveIntensity={2} />
        </mesh>
      ))}
    </group>
  );
}

function NeonRing({ radius = 3.1, tube = 0.025, color = '#FF6B9D', opacity = 0.7 }) {
  return (
    <mesh rotation={[Math.PI / 2.4, 0, 0]}>
      {/* 64 radial segs is plenty — was 96 */}
      <torusGeometry args={[radius, tube, 12, 64]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2.4}
        transparent
        opacity={opacity}
        roughness={0.25}
      />
    </mesh>
  );
}

/* ─── ACT 0 ARRIVAL ─── */
// Outer export only wraps ActGroup; motion lives in a child so useActActive() is inside the provider.
export function ActArrival({ progress }) {
  return (
    <ActGroup index={0} progress={progress}>
      <ArrivalMotion />
    </ActGroup>
  );
}

function ArrivalMotion() {
  const phone = useRef();
  const ring = useRef();
  const active = useActActive();

  useFrame(({ clock }) => {
    if (!active?.current) return;
    const t = clock.getElapsedTime();
    if (phone.current) {
      // Manipulate here: 0.3 / 0.4 = float speed / yaw amount
      phone.current.rotation.y = Math.sin(t * 0.3) * 0.4;
      phone.current.position.y = Math.sin(t * 0.6) * 0.25;
    }
    if (ring.current) {
      ring.current.rotation.z = t * 0.15;
      ring.current.rotation.x = Math.PI / 2.4 + Math.sin(t * 0.2) * 0.1;
    }
  });

  return (
    <>
      <group position={[3.4, 0, -3.5]}>
        <group ref={phone}>
          <Model url={MODELS.phone} size={5.6} />
        </group>
        <group ref={ring}>
          <NeonRing />
        </group>
      </group>
      {/* Second hero phone, smaller + deeper — pair reads “two apps”, ring stays the hero */}
      <group position={[1.35, -0.9, -7.5]} rotation={[0, 0.55, 0]}>
        <Model url={MODELS.phone} size={3.4} />
      </group>
      <pointLight position={[3.4, 2, 0]} color="#FF6B9D" intensity={30} distance={18} decay={2} />
      <pointLight position={[-5, -2, -4]} color="#06B6D4" intensity={14} distance={16} decay={2} />
    </>
  );
}

/* ─── ACT 1 CONNECTION ─── */
export function ActConnection({ progress }) {
  return (
    <ActGroup index={1} progress={progress}>
      <ConnectionMotion />
    </ActGroup>
  );
}

function ConnectionMotion() {
  const a1 = useRef();
  const a2 = useRef();
  const active = useActActive();

  useFrame(({ clock }) => {
    if (!active?.current) return;
    const t = clock.getElapsedTime();
    // Manipulate here: r = orbit radius of the glass figures
    const r = 3.2;
    if (a1.current) {
      const x = Math.cos(t * 0.45) * r;
      const z = Math.sin(t * 0.45) * r;
      a1.current.position.set(x, Math.sin(t * 0.585) * 0.35, z);
      a1.current.rotation.y = -t * 0.45 + Math.PI / 2;
    }
    if (a2.current) {
      const x = Math.cos(t * 0.45 + Math.PI) * r;
      const z = Math.sin(t * 0.45 + Math.PI) * r;
      a2.current.position.set(x, Math.sin(t * 0.585 + Math.PI) * 0.35, z);
      a2.current.rotation.y = -t * 0.45 + Math.PI / 2 + Math.PI;
    }
  });

  return (
    <>
      {/* Phone pair staged right + deep (caption is left); figures orbit the act center.
          Manipulate here: z −5 keeps the pair off the camera path so it never blows up
          behind the text when the dolly overshoots on short viewports. */}
      <PhonePair size={2.2} spread={0.85} position={[3.1, -0.3, -5]} />
      <group ref={a1}>
        <GlassFigure color="#FF6B9D" />
      </group>
      <group ref={a2}>
        <GlassFigure color="#C084FC" />
      </group>
      <Thread color="#FF6B9D" end={[2.8, 0.4, 1.2]} speed={0.7} />
      <Thread color="#C084FC" end={[-2.6, 0.5, 1.4]} speed={0.55} />
      <Thread color="#06B6D4" end={[1.5, -0.2, -2.8]} speed={0.65} />
      <Thread color="#F97316" end={[-1.8, 0.3, -2.5]} speed={0.5} />
      <pointLight position={[0, 1, 2]} color="#06B6D4" intensity={26} distance={16} decay={2} />
    </>
  );
}

/* ─── ACT 2 CLIENT LANE ─── */
export function ActClient({ progress }) {
  return (
    <ActGroup index={2} progress={progress}>
      <ClientMotion />
    </ActGroup>
  );
}

function ClientMotion() {
  const ring = useRef();
  const items = useRef([]);
  const active = useActActive();

  useFrame(({ clock }) => {
    if (!active?.current) return;
    const t = clock.getElapsedTime();
    if (ring.current) ring.current.rotation.y = t * 0.15;
    const list = items.current;
    for (let i = 0; i < list.length; i++) {
      const g = list[i];
      if (!g) continue;
      g.position.y = g.userData.baseY + Math.sin(t * 0.9 + i * 1.4) * 0.22;
      g.rotation.y = t * (0.5 + i * 0.12);
    }
  });

  const orbit = [
    { url: MODELS.cloche, size: 1.3, pos: [2.5, 0.9, 0.3] },
    { url: MODELS.bottle, size: 1.5, pos: [-2.5, 0.8, 0.6] },
    { url: MODELS.heart, size: 1.1, pos: [1.2, -1.4, 1.2] },
    { url: MODELS.bolt, size: 1.3, pos: [-1.3, 1.6, -0.9] },
  ];

  return (
    <>
      {/* Phone pair sits deeper (z −6) so dumbbell + orbit items stay the foreground */}
      <PhonePair size={2.1} spread={1.15} position={[-2.9, -0.2, -6.5]} phase={1.3} />
      <group position={[-2.9, 0, -3]}>
        <Model url={MODELS.dumbbell} size={2.8} />
      </group>
      <group ref={ring}>
        {orbit.map((item, i) => (
          <group
            key={i}
            ref={(el) => {
              if (el) {
                el.userData.baseY = item.pos[1];
                items.current[i] = el;
              }
            }}
            position={item.pos}
          >
            <Model url={item.url} size={item.size} />
          </group>
        ))}
      </group>
      <pointLight position={[-1, 2, 0]} color="#FF6B9D" intensity={26} distance={16} decay={2} />
      <pointLight position={[2, -1, -2]} color="#C084FC" intensity={14} distance={14} decay={2} />
    </>
  );
}

/* ─── ACT 3 TRAINER LANE ─── */
export function ActTrainer({ progress }) {
  return (
    <ActGroup index={3} progress={progress}>
      <TrainerMotion />
    </ActGroup>
  );
}

function TrainerMotion() {
  const floats = useRef([]);
  const money = useRef([]);
  const active = useActActive();
  // Shared geometry; per-sphere material clones so opacity fades don’t fight each other
  const moneyGeo = useMemo(() => new THREE.SphereGeometry(0.08, 8, 8), []);
  const moneyMats = useMemo(() => {
    const base = new THREE.MeshStandardMaterial({
      color: '#34D399',
      emissive: '#10B981',
      emissiveIntensity: 2.2,
      transparent: true,
      opacity: 1,
    });
    return Array.from({ length: 10 }, (_, i) => (i === 0 ? base : base.clone()));
  }, []);

  useFrame(({ clock }) => {
    if (!active?.current) return;
    const t = clock.getElapsedTime();
    const fl = floats.current;
    for (let i = 0; i < fl.length; i++) {
      const g = fl[i];
      if (!g) continue;
      g.rotation.y = Math.sin(t * 0.4 + i) * 0.35;
      g.position.y = g.userData.baseY + Math.sin(t * 0.7 + i * 1.1) * 0.15;
    }
    const ms = money.current;
    for (let i = 0; i < ms.length; i++) {
      const m = ms[i];
      if (!m) continue;
      // p walks 0→1 along the payment stream into the coins vault
      const p = (t * 0.22 + i / 10) % 1;
      m.position.x = -4.2 + p * 7.6;
      m.position.y = -1.3 + Math.sin(p * Math.PI) * 0.5;
      m.position.z = 0.4;
      // Soft fade at the end so they “drop into” the vault
      m.material.opacity = p > 0.92 ? Math.max(0, 1 - (p - 0.92) / 0.08) : 1;
    }
  });

  return (
    <>
      <group position={[1.8, 0.3, -2]} rotation={[0, -0.3, 0]}>
        <group
          ref={(el) => {
            if (el) {
              el.userData.baseY = 0.4;
              floats.current[0] = el;
            }
          }}
          position={[0, 0.4, 0]}
        >
          <Model url={MODELS.clipboard} size={1.8} tint="#C084FC" />
        </group>
        <group
          ref={(el) => {
            if (el) {
              el.userData.baseY = 0.9;
              floats.current[1] = el;
            }
          }}
          position={[-2.2, 0.9, 0.6]}
        >
          <Model url={MODELS.calendar} size={1.5} tint="#F97316" />
        </group>
        <group
          ref={(el) => {
            if (el) {
              el.userData.baseY = 1.1;
              floats.current[2] = el;
            }
          }}
          position={[2.2, 1.1, 0.4]}
        >
          <ChatBubble />
        </group>
      </group>

      {moneyMats.map((mat, i) => (
        <mesh
          key={i}
          ref={(el) => {
            money.current[i] = el;
          }}
          geometry={moneyGeo}
          material={mat}
        />
      ))}

      {/* Trainer/client phone pair behind the money stream’s destination */}
      <PhonePair size={2.0} spread={1.0} position={[3.1, 1.5, -5.5]} phase={2.1} />

      <group position={[3.6, -1.6, 0.9]}>
        <Model url={MODELS.coins} size={1.2} />
        {/* Pink shard on top ≈ the 10% platform fee */}
        <mesh position={[0.15, 0.55, 0.1]}>
          <cylinderGeometry args={[0.18, 0.18, 0.05, 16]} />
          <meshStandardMaterial color="#FF6B9D" emissive="#FF6B9D" emissiveIntensity={1.4} metalness={0.6} />
        </mesh>
      </group>

      <pointLight position={[0, 2, 1]} color="#C084FC" intensity={26} distance={16} decay={2} />
      <pointLight position={[3, -1, 2]} color="#F97316" intensity={18} distance={14} decay={2} />
    </>
  );
}

/* ─── ACT 4 DIFFERENTIATORS ─── */
export function ActDiffs({ progress }) {
  return (
    <ActGroup index={4} progress={progress}>
      <DiffsMotion />
    </ActGroup>
  );
}

function DiffsMotion() {
  const ring = useRef();
  const items = useRef([]);
  const active = useActActive();

  useFrame(({ clock }) => {
    if (!active?.current) return;
    const t = clock.getElapsedTime();
    if (ring.current) ring.current.rotation.y = t * 0.22;
    const list = items.current;
    for (let i = 0; i < list.length; i++) {
      const g = list[i];
      if (!g) continue;
      const a = (i / 6) * Math.PI * 2;
      g.rotation.y = t * (0.6 + i * 0.1);
      g.position.y = Math.sin(a * 2 + t * 0.5) * 0.8;
    }
  });

  const orbit = [
    { type: 'model', url: MODELS.dumbbell, size: 1.5 },
    { type: 'model', url: MODELS.bolt, size: 1.2 },
    { type: 'model', url: MODELS.cloche, size: 1.2 },
    { type: 'model', url: MODELS.calendar, size: 1.2 },
    { type: 'model', url: MODELS.heart, size: 1.0 },
    { type: 'bubble', size: 0.75 },
  ];

  return (
    <>
      <group position={[-2.1, 0, 0]}>
        {/* Center single phone upgraded to the pair — orbit items ring both apps.
            Deep z (−4.5) for the same camera-path reason as Act 1. */}
        <PhonePair size={2.2} spread={0.9} position={[0, -0.3, -4.5]} phase={0.7} />
        <group ref={ring}>
          {orbit.map((item, i) => {
            const a = (i / 6) * Math.PI * 2;
            const r = 2.7;
            return (
              <group
                key={i}
                ref={(el) => {
                  items.current[i] = el;
                }}
                position={[Math.cos(a) * r, 0, Math.sin(a) * r]}
              >
                {item.type === 'bubble' ? (
                  <ChatBubble scale={item.size} />
                ) : (
                  <Model url={item.url} size={item.size} />
                )}
              </group>
            );
          })}
        </group>
      </group>
      <pointLight position={[-2, 1.5, 2]} color="#06B6D4" intensity={22} distance={16} decay={2} />
    </>
  );
}

/* ─── ACT 5 PRICING ─── */
export function ActPricing({ progress }) {
  return (
    <ActGroup index={5} progress={progress}>
      <PricingMotion />
    </ActGroup>
  );
}

function PricingMotion() {
  const trophy = useRef();
  const active = useActActive();

  useFrame(({ clock }) => {
    if (!active?.current) return;
    const t = clock.getElapsedTime();
    if (trophy.current) {
      trophy.current.rotation.y = t * 0.35;
      trophy.current.position.y = Math.sin(t * 0.5) * 0.15;
    }
  });

  return (
    <>
      {/* Phones flank the trophy deeper back — pricing panel (HTML, left) owns foreground */}
      <PhonePair size={2.0} spread={1.65} position={[2.9, -0.9, -6]} phase={2.8} />
      <group ref={trophy} position={[2.9, 0, -2.5]}>
        <Model url={MODELS.trophy} size={3.6} />
      </group>
      {/* Rim lights — decay=2 keeps them from lighting distant acts */}
      <pointLight position={[2.9, 4, -1]} color="#FF6B9D" intensity={55} distance={20} decay={2} />
      <pointLight position={[2.9, -3, -1]} color="#F97316" intensity={50} distance={18} decay={2} />
    </>
  );
}

/* ─── ACT 6 FINALE ─── */
export function ActFinale({ progress }) {
  return (
    <ActGroup index={6} progress={progress}>
      <FinaleMotion />
    </ActGroup>
  );
}

function FinaleMotion() {
  const db = useRef();
  const ring = useRef();
  const active = useActActive();

  useFrame(({ clock }) => {
    if (!active?.current) return;
    const t = clock.getElapsedTime();
    if (db.current) {
      db.current.rotation.y = t * 0.3;
      db.current.rotation.x = 0.5;
      db.current.rotation.z = 0.35 + Math.sin(t * 0.4) * 0.12;
      db.current.position.y = 1.8 + Math.sin(t * 0.55) * 0.2;
    }
    if (ring.current) ring.current.rotation.z = t * 0.2;
  });

  return (
    <>
      {/* Finale pair low + wide, dumbbell floats above the JoinNow headline */}
      <PhonePair size={2.4} spread={2.9} position={[0, -2.1, -5]} phase={1.7} />
      <group ref={db} position={[0, 1.8, -6]}>
        <Model url={MODELS.dumbbell} size={3.8} />
      </group>
      <group ref={ring} position={[0, 1.8, -6]} rotation={[Math.PI / 2.6, 0, 0]}>
        <mesh>
          <torusGeometry args={[3.4, 0.02, 10, 64]} />
          <meshStandardMaterial
            color="#F97316"
            emissive="#F97316"
            emissiveIntensity={1.8}
            transparent
            opacity={0.5}
          />
        </mesh>
      </group>
      <pointLight position={[0, 3, -4]} color="#FF6B9D" intensity={22} distance={18} decay={2} />
      <pointLight position={[2, 0, -8]} color="#F97316" intensity={18} distance={16} decay={2} />
    </>
  );
}
