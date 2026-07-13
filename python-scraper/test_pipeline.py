"""
Standalone test for the watermark removal + Supabase Storage upload pipeline.
Run: python test_pipeline.py
Requires: SUPABASE_URL, SUPABASE_KEY in .env or environment.
"""
import io
import os
import sys
import urllib.request
import urllib.error

import cv2
import numpy as np
import pytesseract
from PIL import Image
from curl_cffi import requests as cf_requests
from dotenv import load_dotenv

load_dotenv()

SESSION = cf_requests.Session(impersonate="chrome131")
SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")
STORAGE_BUCKET = "car-images"

TEST_IMAGE_URL = (
    "https://m.tichetech.com/used/6/15950361/"
    "1b30424f03b695b2703e6cb946efebb0535023265469753fb84cb5abb7b633d2_80S.webp"
    "/d?imageMogr2/format/jpg/strip"
)


def step(label):
    print(f"\n{'='*50}\n[STEP] {label}\n{'='*50}")


def test_download():
    step("1 — Download image from CDN")
    r = SESSION.get(TEST_IMAGE_URL, timeout=40, headers={"Referer": "https://www.autocango.com/"})
    assert r.status_code == 200, f"HTTP {r.status_code}"
    assert len(r.content) > 5000, f"Too small: {len(r.content)}b"
    print(f"OK  Downloaded {len(r.content):,}b")
    return r.content


def test_pil_decode(img_bytes):
    step("2 — PIL decode (webp support check)")
    pil_img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    print(f"OK  PIL decoded: {pil_img.size} {pil_img.mode}")
    return pil_img


def test_cv2_convert(pil_img):
    step("3 — Convert PIL -> OpenCV numpy array")
    img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
    print(f"OK  Shape: {img.shape}")
    return img


def test_tesseract(img):
    step("4 — Tesseract OCR (detect text boxes)")
    try:
        ver = pytesseract.get_tesseract_version()
        print(f"OK  Tesseract version: {ver}")
    except Exception as e:
        print(f"FAIL  Tesseract not found: {e}")
        sys.exit(1)
    data = pytesseract.image_to_data(
        cv2.cvtColor(img, cv2.COLOR_BGR2RGB),
        output_type=pytesseract.Output.DICT,
    )
    words = [t for t, c in zip(data["text"], data["conf"]) if t.strip() and int(c) > 20]
    print(f"OK  Detected {len(words)} text regions: {words[:10]}")
    return data


def test_inpaint(img, data):
    step("5 — Build mask + inpaint")
    mask = np.zeros(img.shape[:2], dtype=np.uint8)
    for i, text in enumerate(data["text"]):
        if text.strip() and int(data["conf"][i]) > 20:
            x, y, w, h = data["left"][i], data["top"][i], data["width"][i], data["height"][i]
            mask[y : y + h, x : x + w] = 255
    print(f"    mask nonzero pixels: {mask.sum() // 255}")
    if mask.max() > 0:
        kernel = np.ones((7, 7), np.uint8)
        mask = cv2.dilate(mask, kernel, iterations=2)
        cleaned = cv2.inpaint(img, mask, inpaintRadius=5, flags=cv2.INPAINT_TELEA)
        print("OK  Inpainted")
    else:
        cleaned = img
        print("OK  No text mask — using original (no inpainting needed)")
    ok, buf = cv2.imencode(".jpg", cleaned, [cv2.IMWRITE_JPEG_QUALITY, 92])
    assert ok
    print(f"OK  Encoded JPEG: {len(buf.tobytes()):,}b")
    return buf.tobytes()


def test_storage_upload(img_bytes):
    step("6 — Upload to Supabase Storage (direct HTTP)")
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("SKIP  SUPABASE_URL / SUPABASE_KEY not set")
        return None
    path = "test/pipeline_test.jpg"
    url = f"{SUPABASE_URL}/storage/v1/object/{STORAGE_BUCKET}/{path}"
    req = urllib.request.Request(
        url,
        data=img_bytes,
        method="POST",
        headers={
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "image/jpeg",
            "x-upsert": "true",
        },
    )
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode()
            print(f"OK  Upload status {resp.status}: {body}")
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"FAIL  HTTP {e.code}: {body}")
        return None
    public_url = f"{SUPABASE_URL}/storage/v1/object/public/{STORAGE_BUCKET}/{path}"
    print(f"OK  Public URL: {public_url}")
    return public_url


if __name__ == "__main__":
    raw = test_download()
    pil = test_pil_decode(raw)
    cv_img = test_cv2_convert(pil)
    ocr_data = test_tesseract(cv_img)
    jpeg_bytes = test_inpaint(cv_img, ocr_data)
    test_storage_upload(jpeg_bytes)
    print("\n[DONE] All steps passed.")
