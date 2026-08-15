#!/usr/bin/env python3
"""Build registered runtime textures for the construction-space depth portal."""

from __future__ import annotations

import argparse
import struct
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter


TARGET_SIZE = (990, 1750)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--reference-01", type=Path, required=True)
    parser.add_argument("--reference-02", type=Path, required=True)
    parser.add_argument("--reference-03", type=Path, required=True)
    parser.add_argument("--clean-foreground", type=Path, required=True)
    parser.add_argument("--far-background", type=Path, required=True)
    parser.add_argument("--project-root", type=Path, required=True)
    return parser.parse_args()


def fitted_rgb(path: Path) -> Image.Image:
    return Image.open(path).convert("RGB").resize(TARGET_SIZE, Image.Resampling.LANCZOS)


def save_webp(image: Image.Image, path: Path, quality: int = 86) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, "WEBP", quality=quality, method=6)


def feathered_shape(draw_fn, radius: float) -> Image.Image:
    mask = Image.new("L", TARGET_SIZE, 0)
    draw_fn(ImageDraw.Draw(mask))
    return mask.filter(ImageFilter.GaussianBlur(radius))


def build_foreground_mask(reference: Image.Image) -> Image.Image:
    width, height = reference.size
    region = Image.new("L", reference.size, 0)
    region_draw = ImageDraw.Draw(region)
    region_draw.polygon(
        [
            (0, 1050),
            (175, 1045),
            (330, 1210),
            (520, 1280),
            (720, 1280),
            (width, 1190),
            (width, height),
            (0, height),
        ],
        fill=255,
    )
    region_draw.polygon(
        [(520, 1040), (width, 1035), (width, 1320), (730, 1335), (520, 1270)],
        fill=255,
    )

    warm = Image.new("L", reference.size, 0)
    warm_pixels = warm.load()
    source_pixels = reference.load()
    region_pixels = region.load()
    for y in range(height):
        for x in range(width):
            if region_pixels[x, y] == 0:
                continue
            red, green, blue = source_pixels[x, y]
            score = max(0, red - blue - 3) * 5 + max(0, red - green - 1) * 3
            warm_pixels[x, y] = min(255, max(0, score))
    warm = warm.filter(ImageFilter.GaussianBlur(0.65))

    supports = feathered_shape(
        lambda draw: (
            draw.polygon([(54, 735), (125, 720), (158, 1750), (88, 1750)], fill=245),
            draw.polygon([(82, 875), (112, 858), (490, 1335), (448, 1360)], fill=245),
        ),
        1.2,
    )
    return ImageChops.lighter(warm, supports)


def build_midground_mask(reference: Image.Image) -> Image.Image:
    doorway = feathered_shape(
        lambda draw: draw.polygon(
            [(343, 557), (690, 571), (686, 1118), (350, 1112)],
            fill=250,
        ),
        1.4,
    )
    equipment = feathered_shape(
        lambda draw: (
            draw.polygon([(641, 810), (704, 785), (720, 1080), (654, 1095)], fill=235),
            draw.polygon([(619, 900), (655, 858), (680, 992), (636, 1003)], fill=230),
        ),
        1.2,
    )

    return ImageChops.lighter(doorway, equipment)


def build_depth_map(foreground: Image.Image, midground: Image.Image) -> Image.Image:
    width, height = TARGET_SIZE
    depth = Image.new("L", TARGET_SIZE)
    pixels = depth.load()
    horizon = 880
    for y in range(height):
        if y <= horizon:
            value = 185 + int((horizon - y) / horizon * 8)
        else:
            value = 185 - int((y - horizon) / (height - horizon) * 92)
        for x in range(width):
            wall_bias = int(abs(x - width / 2) / (width / 2) * 8)
            pixels[x, y] = max(0, min(255, value - wall_bias))

    left_opening = feathered_shape(
        lambda draw: draw.polygon([(0, 600), (100, 580), (115, 1235), (0, 1250)], fill=255),
        8,
    )
    central_opening = feathered_shape(
        lambda draw: draw.rectangle((335, 540, 700, 1210), fill=255),
        10,
    )
    depth.paste(226, mask=left_opening)
    depth.paste(218, mask=central_opening)
    depth.paste(190, mask=midground)
    depth.paste(42, mask=foreground)
    return depth.filter(ImageFilter.GaussianBlur(1.1))


def rgba_layer(reference: Image.Image, mask: Image.Image) -> Image.Image:
    layer = reference.convert("RGBA")
    layer.putalpha(mask)
    return layer


def shifted(layer: Image.Image, x: int, y: int = 0) -> Image.Image:
    output = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    output.alpha_composite(layer, (x, y))
    return output


def save_depth_16bit(depth: Image.Image, path: Path) -> None:
    values = list(depth.get_flattened_data())
    encoded = struct.pack(f"<{len(values)}H", *(value * 257 for value in values))
    image = Image.frombytes("I;16", depth.size, encoded)
    image.save(path, "PNG")


def main() -> None:
    args = parse_args()
    root = args.project_root
    artwork = root / "artwork/depth-portal/construction-space"
    source_dir = artwork / "source"
    working_dir = artwork / "working"
    preview_dir = artwork / "preview"
    runtime_dir = root / "public/assets/depth-portal/construction-space"
    for directory in (source_dir, working_dir, preview_dir, runtime_dir):
        directory.mkdir(parents=True, exist_ok=True)

    references = [fitted_rgb(args.reference_01), fitted_rgb(args.reference_02), fitted_rgb(args.reference_03)]
    clean_foreground = fitted_rgb(args.clean_foreground)
    far_background = fitted_rgb(args.far_background)
    reference = references[2]

    for index, image in enumerate(references, 1):
        image.save(source_dir / f"reference-{index:02d}.png", "PNG", optimize=True)
    clean_foreground.save(working_dir / "clean-foreground.png", "PNG", optimize=True)
    far_background.save(working_dir / "far-background.png", "PNG", optimize=True)

    foreground_mask = build_foreground_mask(reference)
    midground_mask = build_midground_mask(reference)
    depth = build_depth_map(foreground_mask, midground_mask)
    foreground_layer = rgba_layer(reference, foreground_mask)
    midground_layer = rgba_layer(reference, midground_mask)

    save_depth_16bit(depth, working_dir / "depth-master-16bit.png")
    save_webp(far_background, runtime_dir / "color.webp", quality=88)
    depth.save(runtime_dir / "depth.png", "PNG", optimize=True)
    foreground_mask.save(runtime_dir / "foreground-mask.png", "PNG", optimize=True)
    midground_mask.save(runtime_dir / "midground-mask.png", "PNG", optimize=True)
    save_webp(foreground_layer, runtime_dir / "foreground-color.webp", quality=90)
    save_webp(midground_layer, runtime_dir / "midground-color.webp", quality=90)
    save_webp(reference, runtime_dir / "fallback.webp", quality=88)

    base = far_background.convert("RGBA")
    for name, mid_shift, foreground_shift in (
        ("left", -4, -12),
        ("center", 0, 0),
        ("right", 4, 12),
    ):
        preview = base.copy()
        preview.alpha_composite(shifted(midground_layer, mid_shift))
        preview.alpha_composite(shifted(foreground_layer, foreground_shift))
        save_webp(preview.convert("RGB"), preview_dir / f"parallax-{name}.webp", quality=88)


if __name__ == "__main__":
    main()
