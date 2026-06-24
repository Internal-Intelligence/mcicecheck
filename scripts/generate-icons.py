#!/usr/bin/env python3
"""Generate McDonald's-themed PWA icons (red background, yellow ice cream)."""

from pathlib import Path

try:
    from PIL import Image, ImageDraw
except ImportError:
    raise SystemExit("Install Pillow: pip3 install Pillow")

MC_RED = (218, 41, 28)
MC_YELLOW = (255, 199, 44)
WHITE = (255, 255, 255)

OUT_DIR = Path(__file__).resolve().parent.parent / "public" / "icons"


def draw_icon(size: int, maskable: bool = False) -> Image.Image:
    img = Image.new("RGBA", (size, size), MC_RED)
    draw = ImageDraw.Draw(img)

    pad = int(size * (0.12 if maskable else 0.08))
    if maskable:
        draw.rounded_rectangle(
            [pad, pad, size - pad, size - pad],
            radius=int(size * 0.18),
            fill=MC_RED,
        )

    cx, cy = size // 2, size // 2
    r = int(size * 0.28)

    # Ice cream scoop
    draw.ellipse([cx - r, cy - r - int(size * 0.06), cx + r, cy + r - int(size * 0.06)], fill=MC_YELLOW)
    # Cone
    cone_h = int(size * 0.22)
    cone_w = int(size * 0.18)
    draw.polygon(
        [
            (cx - cone_w, cy + r - int(size * 0.04)),
            (cx + cone_w, cy + r - int(size * 0.04)),
            (cx, cy + r + cone_h),
        ],
        fill=WHITE,
    )
    # Cone lines
    for i in range(-2, 3):
        x = cx + i * int(cone_w * 0.35)
        draw.line(
            [(x, cy + r), (cx + i * int(cone_w * 0.2), cy + r + cone_h)],
            fill=MC_RED,
            width=max(1, size // 64),
        )

    return img


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for name, size, maskable in [
        ("icon-192.png", 192, False),
        ("icon-512.png", 512, False),
        ("icon-maskable-512.png", 512, True),
    ]:
        path = OUT_DIR / name
        draw_icon(size, maskable).save(path, "PNG")
        print(f"Wrote {path}")


if __name__ == "__main__":
    main()