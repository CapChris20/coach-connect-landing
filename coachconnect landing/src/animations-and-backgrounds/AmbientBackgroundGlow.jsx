// Oxygene IV backdrop — half-res FBO + sharpen blit (smooth + crisp).
/*
  Created by Tonny Espeset, 2024
  https://www.shadertoy.com/view/4fsyDn
  Oxygene IV — keep this credit + link.
  https://www.shadertoy.com/user/Espeset
*/
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Manipulate here: 0.5 = faster, 0.6 = sharper upscale
const BG_SCALE = 0.55;

const oxyVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const oxyFrag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float iTime;
  uniform vec3 iResolution;
  uniform float uProgress;

  #define EPSILON 0.001
  #define LAKE_HEIGHT 0.045
  #define MARCH_STEPS 96
  #define OCTAVES 4
  #define AURORA_LAYERS 11.0

  float getCurrentAudio(float t) {
    return 0.08 * sin(t * 1.7);
  }

  vec2 applyTurbulence(vec2 uv) {
    float turbulenceFactor = 5.0;
    vec2 initialUV = uv;
    for (float i = 1.0; i < 3.0; i += 1.0) {
      uv.y += sin(uv.x * i) / turbulenceFactor;
      uv.x += cos(uv.y * i) / turbulenceFactor;
      uv = uv.yx;
    }
    return (uv - initialUV).yx;
  }

  float terrainHeight(vec2 uv, int octaves, bool useLake) {
    float heightValue = 0.0;
    float amplitude = 0.85;
    for (int i = 0; i < 8; i++) {
      if (i >= octaves) break;
      vec2 turbulenceValue = applyTurbulence(uv).yx;
      uv += turbulenceValue;
      float noiseSum = turbulenceValue.x + turbulenceValue.y;
      heightValue -= abs(noiseSum) * amplitude;
      heightValue = sqrt(heightValue * heightValue + 0.0001);
      amplitude *= 0.35;
      uv += uv;
    }
    float h = heightValue;
    if (useLake && h < LAKE_HEIGHT) {
      float delta = LAKE_HEIGHT - h;
      return LAKE_HEIGHT - delta / 4.0;
    }
    return h;
  }

  float terrainHeightPos(vec3 position, int octaves, bool useLake) {
    return terrainHeight(position.xz, octaves, useLake);
  }

  vec3 calculateNormal(vec3 position, int octaves) {
    float height = terrainHeightPos(position, octaves, true);
    float heightX = terrainHeightPos(position - vec3(EPSILON, 0.0, 0.0), octaves, true);
    float heightZ = terrainHeightPos(position - vec3(0.0, 0.0, EPSILON), octaves, true);
    return normalize(vec3(heightX - height, EPSILON, heightZ - height));
  }

  float performRayMarching(vec3 rayOrigin, vec3 rayDirection, float tMin, float tMax, int octaves) {
    float t = tMin;
    for (int i = 0; i < MARCH_STEPS; i++) {
      vec3 position = rayOrigin + t * rayDirection;
      float heightDifference = position.y - terrainHeightPos(position, octaves, true);
      if (abs(heightDifference) < (0.0012 * t) || t > tMax) break;
      t += mix(0.32, 0.55, smoothstep(2.0, 14.0, t)) * heightDifference;
    }
    return t;
  }

  mat2 mm2(float a) {
    float c = cos(a), s = sin(a);
    return mat2(c, s, -s, c);
  }

  mat2 m2 = mat2(0.95534, 0.29552, -0.29552, 0.95534);

  float tri(float x) {
    return clamp(abs(fract(x) - 0.5), 0.01, 0.49);
  }

  vec2 tri2(vec2 p) {
    return vec2(tri(p.x) + tri(p.y), tri(p.y + tri(p.x)));
  }

  float triNoise2d(vec2 p, float spd) {
    float z = 1.8;
    float rz = 0.0;
    vec2 bp = p;
    for (int i = 0; i < 4; i++) {
      vec2 dg = tri2(bp * 1.85) * 0.75;
      dg *= mm2(iTime * spd);
      p -= dg / (z * 1.39);
      bp *= 1.3;
      z *= 0.45;
      p *= 1.21 + (rz - 1.0) * 0.02;
      rz += tri(p.x + tri(p.y)) * z;
      p *= -m2;
    }
    return clamp(1.0 / pow(rz * 29.0, 1.5), 0.0, 0.55);
  }

  float hash21(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
  }

  vec4 aurora(vec3 rd, vec2 fragCoord) {
    vec4 col = vec4(0.0);
    vec4 avgCol = vec4(0.0);
    for (float i = 0.0; i < 16.0; i++) {
      if (i >= AURORA_LAYERS) break;
      float of = 0.006 * hash21(fragCoord) * smoothstep(0.0, 15.0, i);
      float pt = (0.8 + pow(i, 1.4) * 0.002) / (rd.y * 2.0 + 0.4) - of;
      vec3 bpos = pt * rd;
      float rzt = triNoise2d(bpos.zx, 0.5);
      vec4 col2 = vec4((sin(1.0 - vec3(2.15, -0.5, 1.2) + i * 0.043) * 0.5 + 0.5) * rzt, rzt);
      avgCol = mix(avgCol, col2, 0.5);
      col += avgCol * exp2(-i * 0.065 - 2.5) * smoothstep(0.0, 5.0, i);
    }
    col *= clamp(rd.y * 15.0 + 0.4, 0.0, 1.0);
    col *= 1.8;
    col = smoothstep(0.0, 1.15, col);
    col.rgb = pow(col.rgb, vec3(0.85));
    return col;
  }

  vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
  }

  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }

  vec3 getSky(vec3 ray, vec2 fragCoord) {
    vec3 color = aurora(ray, fragCoord).rgb;
    vec3 hsv = rgb2hsv(color);
    float audio = getCurrentAudio(mod(iTime, 100.0));
    float hueShift = iTime * 0.1 + (ray.x + ray.y) * 0.8;
    hsv.x = mod(hsv.x + hueShift + audio, 1.0);
    hsv.y = clamp(hsv.y * 1.12, 0.0, 1.0);
    hsv.z = clamp(hsv.z * 1.08, 0.0, 1.0);
    return hsv2rgb(hsv);
  }

  vec3 computeLighting(vec3 position, vec3 normal, vec3 lightDir, vec3 viewDir, vec2 fragCoord) {
    vec3 reflected = normalize(reflect(-viewDir, normal));
    vec3 skyColor = getSky(reflected, fragCoord);
    float transitionRange = 0.005;
    float transitionFactor = smoothstep(LAKE_HEIGHT - transitionRange, LAKE_HEIGHT + transitionRange, position.y);
    vec3 ambientLight = vec3(0.01) + skyColor * 0.05;
    vec3 diffuse = max(dot(normal, lightDir), 0.0) * vec3(0.8);
    vec3 terrainColor = ambientLight + diffuse * vec3(0.1);
    return mix(skyColor, terrainColor, max(0.6, transitionFactor));
  }

  mat3 createLookAtMatrix(vec3 origin, vec3 target, float roll) {
    vec3 rollRotation = vec3(sin(roll), cos(roll), 0.0);
    vec3 forward = normalize(target - origin);
    vec3 right = normalize(cross(forward, rollRotation));
    vec3 up = normalize(cross(right, forward));
    return mat3(right, up, forward);
  }

  void main() {
    vec2 fragCoord = vUv * iResolution.xy;
    vec2 uv = (fragCoord - iResolution.xy * 0.5) / iResolution.y;

    vec3 lightDir = normalize(vec3(-0.8, 0.15, -0.3));
    float fly = iTime / 2.5 + uProgress * 6.0;
    vec3 cameraStep = vec3(lightDir.x, 0.0, lightDir.z) * fly;
    vec3 cameraPos = vec3(8.0, 2.0, 5.0) + cameraStep;
    vec3 cameraTarget = vec3(1.0, 1.0, 4.0) + cameraStep;

    mat3 viewMatrix = createLookAtMatrix(cameraPos, cameraTarget, 0.0);
    vec3 rayOrigin = cameraPos;
    rayOrigin.y += terrainHeight(rayOrigin.xz, 1, false) - 1.8;
    vec3 rayDirection = normalize(viewMatrix * vec3(uv.xy, 1.0));

    float tMax = 20.0;
    float t = performRayMarching(rayOrigin, rayDirection, 0.1, tMax, 3);

    vec3 color;
    if (t > tMax) {
      color = getSky(rayDirection, fragCoord);
    } else {
      vec3 position = rayOrigin + rayDirection * t;
      vec3 normal = calculateNormal(position, 3);
      vec3 viewDir = normalize(rayOrigin - position);
      color = computeLighting(position, normal, lightDir, viewDir, fragCoord);
    }

    color = pow(clamp(color, 0.0, 1.0), vec3(0.45));
    color = smoothstep(0.02, 1.0, color);
    gl_FragColor = vec4(color, 1.0);
  }
`;

const blitVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const blitFrag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D tDiffuse;
  uniform vec2 uTexel;
  uniform float uSharpen;

  void main() {
    vec3 c = texture2D(tDiffuse, vUv).rgb;
    vec3 blur =
      texture2D(tDiffuse, vUv + vec2(uTexel.x, 0.0)).rgb +
      texture2D(tDiffuse, vUv - vec2(uTexel.x, 0.0)).rgb +
      texture2D(tDiffuse, vUv + vec2(0.0, uTexel.y)).rgb +
      texture2D(tDiffuse, vUv - vec2(0.0, uTexel.y)).rgb;
    blur *= 0.25;
    vec3 sharp = c + (c - blur) * uSharpen;
    gl_FragColor = vec4(clamp(sharp, 0.0, 1.0), 1.0);
  }
`;

export default function VoidAura({ progress }) {
  const { gl, size } = useThree();
  const blitMat = useRef();

  const w = Math.max(2, Math.floor(size.width * BG_SCALE));
  const h = Math.max(2, Math.floor(size.height * BG_SCALE));

  // Offscreen render target (manual — avoids broken drei FBO hook under CRA)
  // vocab: WebGLRenderTarget = texture we draw the heavy shader into at half-res
  const fbo = useMemo(() => {
    const target = new THREE.WebGLRenderTarget(4, 4, {
      samples: 0,
      depthBuffer: false,
      stencilBuffer: false,
      type: THREE.UnsignedByteType,
      format: THREE.RGBAFormat,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    });
    return target;
  }, []);

  useEffect(() => {
    fbo.setSize(w, h);
  }, [fbo, w, h]);

  useEffect(() => {
    return () => fbo.dispose();
  }, [fbo]);

  // Offscreen scene built with raw THREE — no createPortal
  const { oxyScene, ortho, oxyUniforms } = useMemo(() => {
    const oxyUniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector3(2, 2, 1) },
      uProgress: { value: 0 },
    };
    const mat = new THREE.ShaderMaterial({
      vertexShader: oxyVert,
      fragmentShader: oxyFrag,
      uniforms: oxyUniforms,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    mesh.frustumCulled = false;
    const oxyScene = new THREE.Scene();
    oxyScene.add(mesh);
    const ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    return { oxyScene, ortho, oxyUniforms, mat };
  }, []);

  useEffect(() => {
    return () => {
      oxyScene.traverse((obj) => {
        if (obj.isMesh) {
          obj.geometry?.dispose?.();
          obj.material?.dispose?.();
        }
      });
    };
  }, [oxyScene]);

  const blitUniforms = useMemo(
    () => ({
      tDiffuse: { value: null },
      uTexel: { value: new THREE.Vector2(1, 1) },
      // Manipulate here: sharpen after upscale (0.35–0.5)
      uSharpen: { value: 0.42 },
    }),
    []
  );

  useFrame(({ clock }) => {
    const fw = fbo.width || w;
    const fh = fbo.height || h;

    oxyUniforms.iTime.value = clock.getElapsedTime();
    oxyUniforms.uProgress.value = progress?.current ?? 0;
    oxyUniforms.iResolution.value.set(fw, fh, 1);

    blitUniforms.tDiffuse.value = fbo.texture;
    blitUniforms.uTexel.value.set(1 / fw, 1 / fh);

    const prevTarget = gl.getRenderTarget();
    const prevAutoClear = gl.autoClear;
    gl.autoClear = true;
    gl.setRenderTarget(fbo);
    gl.clear(true, true, true);
    gl.render(oxyScene, ortho);
    gl.setRenderTarget(prevTarget);
    gl.autoClear = prevAutoClear;
  });

  return (
    <mesh frustumCulled={false} renderOrder={-1000} raycast={() => null}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={blitMat}
        vertexShader={blitVert}
        fragmentShader={blitFrag}
        uniforms={blitUniforms}
        depthTest={false}
        depthWrite={false}
        fog={false}
        toneMapped={false}
      />
    </mesh>
  );
}
