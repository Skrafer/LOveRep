from pathlib import Path
import math
import sys

import qrcode
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent
DEFAULT_URL = "https://example.com/replace-this-with-your-public-link"


def main() -> None:
    url = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_URL

    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=14,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    matrix = qr.get_matrix()
    module = 12
    qr_size = len(matrix) * module
    panel_pad = 34
    panel_size = qr_size + panel_pad * 2
    canvas_w = panel_size + 92
    canvas_h = panel_size + 396

    canvas = Image.new("RGB", (canvas_w, canvas_h), "#07100f")
    draw = ImageDraw.Draw(canvas)

    for y in range(canvas_h):
        for x in range(canvas_w):
            nx = x / canvas_w
            ny = y / canvas_h
            glow = max(0, 1 - math.hypot(nx - 0.5, ny - 0.34) * 1.7)
            r = int(7 + glow * 26)
            g = int(16 + glow * 32)
            b = int(15 + glow * 28)
            canvas.putpixel((x, y), (r, g, b))

    for i in range(42):
        angle = i * 2.399963229728653
        radius = 0.08 + (i % 17) / 18
        x = int(canvas_w * (0.5 + math.cos(angle) * radius * 0.48))
        y = int(canvas_h * (0.5 + math.sin(angle) * radius * 0.42))
        size = 1 if i % 4 else 2
        color = "#d8bd76" if i % 3 else "#8fb8ad"
        draw.ellipse((x - size, y - size, x + size, y + size), fill=color)

    card = (28, 28, canvas_w - 28, canvas_h - 28)
    draw.rounded_rectangle(card, radius=26, outline="#d8bd76", width=2)
    draw.rounded_rectangle((38, 38, canvas_w - 38, canvas_h - 38), radius=20, outline="#2d6058", width=1)
    draw.rounded_rectangle((48, 48, canvas_w - 48, canvas_h - 48), radius=16, outline="#193e39", width=1)

    corner = 58
    for sx, sy in [(1, 1), (-1, 1), (1, -1), (-1, -1)]:
        x0 = 58 if sx == 1 else canvas_w - 58
        y0 = 58 if sy == 1 else canvas_h - 58
        draw.line((x0, y0, x0 + sx * corner, y0), fill="#d8bd76", width=2)
        draw.line((x0, y0, x0, y0 + sy * corner), fill="#d8bd76", width=2)
        draw.line((x0 + sx * 12, y0 + sy * 12, x0 + sx * (corner - 10), y0 + sy * 12), fill="#315f58", width=1)
        draw.line((x0 + sx * 12, y0 + sy * 12, x0 + sx * 12, y0 + sy * (corner - 10)), fill="#315f58", width=1)

    panel_x = (canvas_w - panel_size) // 2
    panel_y = 108
    panel = (panel_x, panel_y, panel_x + panel_size, panel_y + panel_size)
    shadow = (panel_x + 8, panel_y + 10, panel_x + panel_size + 8, panel_y + panel_size + 10)
    draw.rounded_rectangle(shadow, radius=24, fill="#040707")
    draw.rounded_rectangle(panel, radius=24, fill="#fffaf2", outline="#f0d694", width=3)
    draw.rounded_rectangle((panel_x + 10, panel_y + 10, panel_x + panel_size - 10, panel_y + panel_size - 10), radius=18, outline="#f6e4b5", width=1)

    qr_x = panel_x + panel_pad
    qr_y = panel_y + panel_pad
    dark = "#101817"
    radius = 4

    for row, values in enumerate(matrix):
        for col, value in enumerate(values):
            if not value:
                continue
            x = qr_x + col * module
            y = qr_y + row * module
            draw.rounded_rectangle((x, y, x + module - 1, y + module - 1), radius=radius, fill=dark)

    try:
        title_font = ImageFont.truetype("arialbd.ttf", 34)
        small_font = ImageFont.truetype("arial.ttf", 19)
        tiny_font = ImageFont.truetype("arial.ttf", 14)
    except OSError:
        title_font = ImageFont.load_default()
        small_font = ImageFont.load_default()
        tiny_font = ImageFont.load_default()

    badge = "PRIVATE CONSTELLATION"
    title = "Сканируй"
    subtitle = "и открой маленькую вселенную"
    url_hint = url.replace("https://", "")
    draw.rounded_rectangle((canvas_w / 2 - 154, 54, canvas_w / 2 + 154, 88), radius=17, outline="#d8bd76", width=1)
    draw.line((80, 71, canvas_w / 2 - 172, 71), fill="#315f58", width=1)
    draw.line((canvas_w / 2 + 172, 71, canvas_w - 80, 71), fill="#315f58", width=1)
    draw.text((canvas_w / 2, 71), badge, anchor="mm", fill="#d8bd76", font=tiny_font)

    medal_cx = canvas_w // 2
    medal_cy = panel_y + panel_size + 46
    draw.ellipse((medal_cx - 36, medal_cy - 36, medal_cx + 36, medal_cy + 36), fill="#091210", outline="#315f58", width=1)
    draw.ellipse((medal_cx - 28, medal_cy - 28, medal_cx + 28, medal_cy + 28), fill="#101817", outline="#d8bd76", width=2)
    heart_w = 24
    heart_h = 22
    draw.ellipse((medal_cx - heart_w // 2, medal_cy - heart_h // 2 - 5, medal_cx, medal_cy + heart_h // 2 - 5), fill="#f7d58d")
    draw.ellipse((medal_cx, medal_cy - heart_h // 2 - 5, medal_cx + heart_w // 2, medal_cy + heart_h // 2 - 5), fill="#f7d58d")
    draw.polygon(
        [
            (medal_cx - heart_w // 2, medal_cy + 1),
            (medal_cx + heart_w // 2, medal_cy + 1),
            (medal_cx, medal_cy + 20),
        ],
        fill="#f7d58d",
    )

    title_y = panel_y + panel_size + 114
    subtitle_y = panel_y + panel_size + 160
    draw.text((canvas_w / 2, title_y), title, anchor="mm", fill="#fffaf2", font=title_font)
    draw.text((canvas_w / 2, subtitle_y), subtitle, anchor="mm", fill="#d8bd76", font=small_font)
    draw.line((canvas_w / 2 - 120, subtitle_y + 34, canvas_w / 2 + 120, subtitle_y + 34), fill="#315f58", width=1)
    draw.text((canvas_w / 2, canvas_h - 52), url_hint, anchor="mm", fill="#8fb8ad", font=tiny_font)

    canvas.save(ROOT / "qr-code.png", quality=95)
    (ROOT / "qr-url.txt").write_text(url, encoding="utf-8")


if __name__ == "__main__":
    main()
