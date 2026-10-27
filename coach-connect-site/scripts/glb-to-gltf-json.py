# glb-to-gltf-json.py — for the artifact build only. Artifacts don't serve .glb,
# so each binary model is rewritten as glTF JSON with its buffer embedded as a
# base64 data URI, saved as <name>.gltf.json. three.js loads both forms the same.
# Usage: python3 scripts/glb-to-gltf-json.py dist-artifact/models
import base64, json, pathlib, struct, sys

for glb_path in pathlib.Path(sys.argv[1]).glob('*.glb'):
    data = glb_path.read_bytes()
    json_length = struct.unpack_from('<I', data, 12)[0]
    gltf = json.loads(data[20:20 + json_length])
    bin_offset = 20 + json_length
    bin_length = struct.unpack_from('<I', data, bin_offset)[0]
    binary = data[bin_offset + 8:bin_offset + 8 + bin_length]
    gltf['buffers'][0]['uri'] = 'data:application/octet-stream;base64,' + base64.b64encode(binary).decode()
    out_path = glb_path.with_suffix('.gltf.json')
    out_path.write_text(json.dumps(gltf, separators=(',', ':')))
    glb_path.unlink()
    print(out_path, out_path.stat().st_size)
