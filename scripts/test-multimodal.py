#!/usr/bin/env python3
"""End-to-end test: send an image containing readable text through /api/chat and
confirm the streamed answer reflects content only obtainable by SEEING the image
(true OCR proof that the pixels reached the vision model, not a guess).

Run against a running Vane on http://127.0.0.1:3000 with the Telekom LLM Hub
provider configured and Qwen3-VL registered as a chat model.
"""
import base64
import io
import json
import re
import sys
import urllib.request
import uuid

from PIL import Image, ImageDraw, ImageFont

SECRET = "VANE-OCR-7788"

# Render the secret large enough for robust OCR.
try:
    font = ImageFont.load_default(size=64)
except TypeError:  # very old Pillow without size kwarg
    font = ImageFont.load_default()
img = Image.new("RGB", (760, 160), "white")
ImageDraw.Draw(img).text((30, 45), SECRET, fill="black", font=font)
buf = io.BytesIO()
img.save(buf, format="PNG")
data_uri = "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()

# Discover the Telekom LLM Hub provider id.
providers = json.load(urllib.request.urlopen("http://127.0.0.1:3000/api/providers"))
hub = next(p for p in providers["providers"] if p["name"] == "Telekom LLM Hub")
prov_id = hub["id"]

q = "What exact text appears in this image? Reply with the text verbatim."
body = {
    "content": q,
    "message": {
        "messageId": uuid.uuid4().hex[:14],
        "chatId": uuid.uuid4().hex[:14],
        "content": q,
        "images": [data_uri],
    },
    "chatId": uuid.uuid4().hex[:14],
    "files": [],
    "sources": ["web"],
    "optimizationMode": "speed",
    "history": [],
    # Selected model is the TEXT model on purpose — the route must auto-switch to
    # the vision model because an image is attached.
    "chatModel": {"providerId": prov_id, "key": "Llama-3.3-70B-Instruct"},
    "embeddingModel": {"providerId": prov_id, "key": "text-embedding-bge-m3"},
    "systemInstructions": "",
}

req = urllib.request.Request(
    "http://127.0.0.1:3000/api/chat",
    data=json.dumps(body).encode(),
    headers={"Content-Type": "application/json"},
)

answer = ""
with urllib.request.urlopen(req, timeout=240) as r:
    for raw in r:
        line = raw.decode().strip()
        if not line:
            continue
        try:
            evt = json.loads(line)
        except json.JSONDecodeError:
            continue
        if evt.get("type") == "block" and evt.get("block", {}).get("type") == "text":
            answer += str(evt["block"].get("data", ""))
        elif evt.get("type") == "updateBlock":
            patch = evt.get("patch")
            answer += json.dumps(patch)

# Robust match: ignore case and non-alphanumerics (Qwen may add spaces/hyphens).
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
found = norm(SECRET) in norm(answer)

print("--- answer (first 600 chars) ---")
print(answer[:600])
print("--------------------------------")
print(f"Looking for: {SECRET}")
print(f"RESULT contains secret: {found}")
sys.exit(0 if found else 1)
