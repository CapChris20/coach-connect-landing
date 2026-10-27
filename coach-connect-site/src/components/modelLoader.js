// modelLoader.js — which loader reads the 3D models.
// Normal build: three's GLTFLoader on the .glb files.
// Artifact build: the host blocks .glb files, data: URLs in fetch() and
// WebAssembly, so models ship as <name>.glb.json (see scripts/glb-to-gltf-json.py).
// JsonGlbLoader fetches that JSON, decodes the base64 back into GLB bytes in
// memory, and hands them to GLTFLoader.parse. Textures load as normal image files.
import { GLTFLoader } from 'three-stdlib';

class JsonGlbLoader extends GLTFLoader {
  load(url, onLoad, onProgress, onError) {
    const folder = url.slice(0, url.lastIndexOf('/') + 1);
    fetch(url)
      .then((response) => response.json())
      .then(({ glb }) => {
        const bytes = Uint8Array.from(atob(glb), (character) => character.charCodeAt(0));
        this.parse(bytes.buffer, folder, onLoad, onError);
      })
      .catch(onError);
  }
}

const IS_ARTIFACT = Boolean(import.meta.env.VITE_ARTIFACT);

export const ModelLoader = IS_ARTIFACT ? JsonGlbLoader : GLTFLoader;

/**
 * The model's URL for this build.
 * @param {string} name file name without extension, e.g. 'cc_logo'
 * @returns {string}
 */
export const modelUrl = (name) => (IS_ARTIFACT ? `models/${name}.glb.json` : `models/${name}.glb`);
