# glb-to-gltf-json.py — for the artifact build only. The artifact host serves
# neither .glb files nor data: URLs to fetch(), so each model becomes:
#   <name>-image<N>.<png|jpg>  its textures as plain image files (served types)
#   <name>.glb.json            the rest of the GLB, base64 in a JSON wrapper
# components/modelLoader.js decodes the JSON back into GLB bytes in memory.
# Usage: python3 scripts/glb-to-gltf-json.py dist-artifact/models
import base64, json, pathlib, struct, sys

EXTENSIONS = {'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp'}

def pack_glb(gltf, binary):
    json_bytes = json.dumps(gltf, separators=(',', ':')).encode()
    json_bytes += b' ' * (-len(json_bytes) % 4)
    binary += b'\0' * (-len(binary) % 4)
    total = 12 + 8 + len(json_bytes) + 8 + len(binary)
    return (struct.pack('<III', 0x46546C67, 2, total)
            + struct.pack('<II', len(json_bytes), 0x4E4F534A) + json_bytes
            + struct.pack('<II', len(binary), 0x004E4942) + binary)

for glb_path in pathlib.Path(sys.argv[1]).glob('*.glb'):
    data = glb_path.read_bytes()
    json_length = struct.unpack_from('<I', data, 12)[0]
    gltf = json.loads(data[20:20 + json_length])
    bin_offset = 20 + json_length
    bin_length = struct.unpack_from('<I', data, bin_offset)[0]
    binary = data[bin_offset + 8:bin_offset + 8 + bin_length]

    # 1. Pull each embedded texture out into its own image file.
    for index, image in enumerate(gltf.get('images', [])):
        if 'bufferView' not in image:
            continue
        view = gltf['bufferViews'][image['bufferView']]
        start = view.get('byteOffset', 0)
        image_bytes = binary[start:start + view['byteLength']]
        file_name = f"{glb_path.stem}-image{index}.{EXTENSIONS.get(image.get('mimeType'), 'png')}"
        (glb_path.parent / file_name).write_bytes(image_bytes)
        image['uri'] = file_name
        del image['bufferView']
        image.pop('mimeType', None)

    # 2. Wrap the remaining GLB as base64 inside JSON.
    out_path = glb_path.with_name(glb_path.stem + '.glb.json')
    out_path.write_text(json.dumps({'glb': base64.b64encode(pack_glb(gltf, binary)).decode()}))
    glb_path.unlink()
    print(out_path, out_path.stat().st_size)
