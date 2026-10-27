# write-artifact-page.py — writes dist-artifact/coach-connect.html, the page the
# Artifact tool publishes. The host adds <!doctype>, <head> and <body> itself, so
# this is just the title, the built CSS/JS, and the root element.
# Usage: python3 scripts/write-artifact-page.py dist-artifact
import pathlib, re, sys

out = pathlib.Path(sys.argv[1])
index = (out / 'index.html').read_text()
script = re.search(r'src="(\./assets/index-[^"]+\.js)"', index).group(1)
style = re.search(r'href="(\./assets/index-[^"]+\.css)"', index).group(1)
(out / 'coach-connect.html').write_text(f'''<title>Coach Connect</title>
<meta name="theme-color" content="#0b0a0d">
<style>html,body{{background:#0b0a0d}}</style>
<link rel="stylesheet" href="{style}">
<noscript>Coach Connect needs JavaScript to run.</noscript>
<div id="root"></div>
<script type="module" src="{script}"></script>
''')
print('wrote', out / 'coach-connect.html')
