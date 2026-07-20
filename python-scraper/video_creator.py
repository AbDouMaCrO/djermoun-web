"""
Creates a 9:16 vertical slideshow video from car images (1080x1920).
Each image gets a blurred-background frame. Text overlays: title, price,
specs, brand. Uploads final MP4 to Supabase car-videos bucket.

Requires: ffmpeg + fonts-dejavu-core installed on the system.
"""

import os
import subprocess
import tempfile
from pathlib import Path

import requests as _requests

FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REG  = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
WIDTH, HEIGHT = 1080, 1920
FPS = 30
SECONDS_PER_IMAGE = 3
MAX_IMAGES = 10
STORAGE_BUCKET = "car-videos"


def _esc(text: str) -> str:
    """Escape text for FFmpeg drawtext."""
    return str(text).replace("\\", "\\\\").replace("'", "\\'").replace(":", "\\:").replace("%", "\\%")


def _download_images(urls: list[str], tmpdir: Path) -> list[Path]:
    local = []
    for i, url in enumerate(urls[:MAX_IMAGES]):
        try:
            resp = _requests.get(url, timeout=30, headers={"User-Agent": "Mozilla/5.0"})
            if resp.status_code == 200 and len(resp.content) > 5000:
                p = tmpdir / f"img_{i:02d}.jpg"
                p.write_bytes(resp.content)
                local.append(p)
                print(f"[VIDEO] Downloaded image {i + 1}/{min(len(urls), MAX_IMAGES)}")
        except Exception as e:
            print(f"[VIDEO] Image {i} download failed: {e}")
    return local


def _make_clip(img_path: Path, out_path: Path) -> bool:
    """Scale image onto a blurred background, output a short clip."""
    # Split into blurred bg (fill+crop) and sharp fg (fit, centered)
    filter_graph = (
        f"[0:v]split[bg][fg];"
        f"[bg]scale={WIDTH}:{HEIGHT}:force_original_aspect_ratio=increase,"
        f"crop={WIDTH}:{HEIGHT},boxblur=luma_radius=25:luma_power=1[blurred];"
        f"[fg]scale={WIDTH}:{HEIGHT}:force_original_aspect_ratio=decrease[sharp];"
        f"[blurred][sharp]overlay=(W-w)/2:(H-h)/2,format=yuv420p[out]"
    )
    cmd = [
        "ffmpeg", "-y",
        "-loop", "1", "-i", str(img_path),
        "-filter_complex", filter_graph,
        "-map", "[out]",
        "-t", str(SECONDS_PER_IMAGE),
        "-r", str(FPS),
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "fast",
        str(out_path),
    ]
    result = subprocess.run(cmd, capture_output=True, timeout=90)
    if result.returncode != 0:
        print(f"[VIDEO] Clip failed: {result.stderr.decode(errors='replace')[-300:]}")
    return result.returncode == 0


def _concat_clips(clip_paths: list[Path], out_path: Path) -> bool:
    if len(clip_paths) == 1:
        import shutil
        shutil.copy(clip_paths[0], out_path)
        return True
    concat_file = out_path.parent / "concat.txt"
    concat_file.write_text("\n".join(f"file '{p}'" for p in clip_paths), encoding="utf-8")
    cmd = [
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0", "-i", str(concat_file),
        "-c", "copy", str(out_path),
    ]
    result = subprocess.run(cmd, capture_output=True, timeout=120)
    return result.returncode == 0


def _add_text_overlay(in_path: Path, out_path: Path, car: dict) -> bool:
    """Burn title, price, specs, and brand text onto the video."""
    make  = car.get("make", "")
    model = car.get("model", "")
    year  = car.get("year", "")
    price = car.get("price_cny", 0)
    mileage      = car.get("mileage")
    engine       = car.get("engine", "")
    transmission = car.get("transmission", "")

    title     = _esc(f"{year} {make} {model}".strip())
    price_str = _esc(f"FOB  ${float(price):,.0f}") if price else ""
    specs_parts = [p for p in [engine, transmission, f"{mileage:,} km" if mileage else ""] if p]
    specs_str = _esc("   |   ".join(specs_parts))
    brand_str = _esc("djermoun-auto.com")

    # Semi-transparent black gradient bar at bottom (300px)
    bar = f"drawbox=y=ih-300:w=iw:h=300:color=black@0.6:t=fill"

    drawtext_filters = [bar]

    # Title — white bold, y=1640 (inside the bar)
    if title:
        drawtext_filters.append(
            f"drawtext=fontfile='{FONT_BOLD}':text='{title}':"
            f"fontcolor=white:fontsize=58:x=(w-text_w)/2:y=1650:"
            f"shadowcolor=black@0.8:shadowx=2:shadowy=2"
        )
    # Price — amber bold
    if price_str:
        drawtext_filters.append(
            f"drawtext=fontfile='{FONT_BOLD}':text='{price_str}':"
            f"fontcolor=#F59E0B:fontsize=64:x=(w-text_w)/2:y=1730:"
            f"shadowcolor=black@0.8:shadowx=2:shadowy=2"
        )
    # Specs — white regular
    if specs_str:
        drawtext_filters.append(
            f"drawtext=fontfile='{FONT_REG}':text='{specs_str}':"
            f"fontcolor=white@0.85:fontsize=36:x=(w-text_w)/2:y=1820:"
            f"shadowcolor=black@0.8:shadowx=1:shadowy=1"
        )
    # Brand — small, top-left
    drawtext_filters.append(
        f"drawtext=fontfile='{FONT_REG}':text='{brand_str}':"
        f"fontcolor=white@0.6:fontsize=30:x=30:y=30:"
        f"shadowcolor=black@0.8:shadowx=1:shadowy=1"
    )

    vf = ",".join(drawtext_filters)
    cmd = [
        "ffmpeg", "-y", "-i", str(in_path),
        "-vf", vf,
        "-c:v", "libx264", "-pix_fmt", "yuv420p",
        "-preset", "fast", "-crf", "22",
        str(out_path),
    ]
    result = subprocess.run(cmd, capture_output=True, timeout=300)
    if result.returncode != 0:
        print(f"[VIDEO] Text overlay failed: {result.stderr.decode(errors='replace')[-400:]}")
    return result.returncode == 0


def create_car_video(car: dict, images: list[str]) -> str | None:
    """
    Main entry point. Returns Supabase public URL of the uploaded video, or None.
    """
    if not images:
        print("[VIDEO] No images — skipping")
        return None

    make  = car.get("make", "UNKNOWN")
    model = car.get("model", "UNKNOWN")
    year  = car.get("year", "")
    slug  = f"{year}-{make}-{model}".lower().replace(" ", "-")

    print(f"[VIDEO] Creating video for {slug} ({min(len(images), MAX_IMAGES)} images)")

    with tempfile.TemporaryDirectory() as tmpdir:
        tmp = Path(tmpdir)

        # 1. Download images
        local_imgs = _download_images(images, tmp)
        if not local_imgs:
            print("[VIDEO] No images downloaded — aborting")
            return None

        # 2. Build per-image clips
        clip_paths = []
        for i, img_path in enumerate(local_imgs):
            clip_out = tmp / f"clip_{i:02d}.mp4"
            if _make_clip(img_path, clip_out):
                clip_paths.append(clip_out)

        if not clip_paths:
            print("[VIDEO] No clips created — aborting")
            return None

        print(f"[VIDEO] {len(clip_paths)} clips created")

        # 3. Concatenate
        raw_path = tmp / "raw.mp4"
        if not _concat_clips(clip_paths, raw_path):
            print("[VIDEO] Concat failed — aborting")
            return None

        # 4. Text overlay
        final_path = tmp / "final.mp4"
        if not _add_text_overlay(raw_path, final_path, car):
            print("[VIDEO] Text overlay failed — using raw video")
            final_path = raw_path

        # 5. Upload to Supabase
        try:
            from db import supabase
            video_bytes = final_path.read_bytes()
            storage_path = f"{slug}/promo.mp4"
            supabase.storage.from_(STORAGE_BUCKET).upload(
                path=storage_path,
                file=video_bytes,
                file_options={"content-type": "video/mp4", "x-upsert": "true"},
            )
            url = supabase.storage.from_(STORAGE_BUCKET).get_public_url(storage_path)
            print(f"[VIDEO] Uploaded: {url}")
            return url
        except Exception as e:
            print(f"[VIDEO] Upload failed: {e}")
            return None
