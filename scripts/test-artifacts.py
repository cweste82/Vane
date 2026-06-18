#!/usr/bin/env python3
"""Directly exercise /api/files/generate for each office format and assert the
returned bytes are valid (correct magic bytes + content-type)."""
import json
import sys
import urllib.request
import urllib.error

BASE = "http://127.0.0.1:3000/api/files/generate"

CASES = [
    ("xlsx", "data.xlsx", "Name,Age\nAda,36\nGrace,40", b"PK\x03\x04", "spreadsheetml"),
    ("docx", "doc.docx", "# Title\n\nHello **world**.", b"PK\x03\x04", "wordprocessingml"),
    ("pdf", "report.pdf", "# Report\n\nSome content.", b"%PDF", "application/pdf"),
]

ok = True
for fmt, name, source, magic, ctype in CASES:
    body = json.dumps({"format": fmt, "filename": name, "source": source}).encode()
    req = urllib.request.Request(BASE, data=body, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            data = r.read()
            got_ctype = r.headers.get("Content-Type", "")
            magic_ok = data[: len(magic)] == magic
            ctype_ok = ctype in got_ctype
            print(f"{fmt}: {len(data)} bytes  magic={'OK' if magic_ok else 'BAD'}  ctype={'OK' if ctype_ok else got_ctype}")
            ok = ok and magic_ok and ctype_ok
    except Exception as e:
        print(f"{fmt}: ERROR {e}")
        ok = False

# Negative: disallowed format must 400.
try:
    body = json.dumps({"format": "csv", "filename": "x.csv", "source": "a"}).encode()
    urllib.request.urlopen(urllib.request.Request(BASE, data=body, headers={"Content-Type": "application/json"}), timeout=20)
    print("csv-reject: BAD (expected 400)")
    ok = False
except urllib.error.HTTPError as e:
    print(f"csv-reject: {'OK' if e.code == 400 else 'BAD ' + str(e.code)}")

print("RESULT:", "PASS" if ok else "FAIL")
sys.exit(0 if ok else 1)
