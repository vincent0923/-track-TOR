#!/usr/bin/env python3
"""Cache-busting stamp: run before every commit that touches css/ or js/.

Hashes every css/js file and writes the first 8 hex digits into the ?v= part of the
<link>/<script> URLs in index.html, so a new page can never load old scripts or styles
from a browser, phone or CDN cache."""
import hashlib, pathlib, re, sys

root = pathlib.Path(__file__).resolve().parent.parent
files = sorted(list((root / "css").glob("*.css")) + list((root / "js").glob("*.js")))
h = hashlib.sha1()
for f in files:
    h.update(f.name.encode()); h.update(f.read_bytes())
stamp = h.hexdigest()[:8]

page = root / "index.html"
html = page.read_text(encoding="utf-8")
new = re.sub(r'((?:href|src)="(?:css|js)/[\w.-]+\.(?:css|js))(?:\?v=[0-9a-f]+)?"', r'\1?v=' + stamp + '"', html)
if new != html:
    page.write_text(new, encoding="utf-8")
print("stamp", stamp, "(updated)" if new != html else "(unchanged)")
