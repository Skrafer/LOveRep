from pathlib import Path
import math
import sys

import qrcode
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent
DEFAULT_URL = "https://skrafer.github.io/LOveRep/"
FONTS = Path("C:/Windows/Fonts")
SCALE = 2


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    try:
        return ImageFont.truetype(str(FONTS / name), size)
    except OSError:
        return ImageFont.load_default()


def rounded(draw: ImageDraw.ImageDraw, box, radius, fill=None, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def glow_layer(size, shapes):
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    for shape in shapes:
        draw.ellipse(shape["box"], fill=shape["fill"])
    return layer.filter(Image.Resampling.LANCZOS)


def main() -> None:
    url = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_URL

    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=16,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    matrix = qr.get_matrix()

    module = 18
    qr_size = len(matrix) * module
    panel_pad = 54
    panel_size = qr_size + panel_pad * 2
    canvas_w = 1480
    canvas_h = 2060

    canvas = Image.new("RGB", (canvas_w, canvas_h), "#07100f")
    pixels = canvas.load()
    for y in range(canvas_h):
        for x in range(canvas_w):
            nx = x / canvas_w
            ny = y / canvas_h
            center = max(0, 1 - math.hypot(nx - 0.5, ny - 0.38) * 1.55)
            side = max(0, 1 - math.hypot(nx - 0.18, ny - 0.84) * 2.5)
            r = int(6 + center * 31 + side * 8)
            g = int(15 + center * 33 + side * 20)
            b = int(14 + center * 29 + side * 18)
            pixels[x, y] = (r, g, b)

    draw = ImageDraw.Draw(canvas, "RGBA")

    for i in range(160):
        angle = i * 2.399963229728653
        radius = 0.03 + (i % 55) / 58
        x = int(canvas_w * (0.5 + math.cos(angle) * radius * 0.58))
        y = int(canvas_h * (0.48 + math.sin(angle) * radius * 0.5))
        size = 2 if i % 5 else 4
        fill = (247, 213, 141, 150) if i % 3 else (112, 216, 197, 118)
        draw.ellipse((x - size, y - size, x + size, y + size), fill=fill)

    draw.ellipse((-260, 980, 430, 1670), outline=(112, 216, 197, 38), width=3)
    draw.ellipse((1010, 110, 1680, 790), outline=(247, 213, 141, 42), width=3)
    draw.arc((130, 110, canvas_w - 130, 1120), 196, 344, fill=(247, 213, 141, 70), width=3)
    draw.arc((210, 240, canvas_w - 210, 1280), 28, 206, fill=(112, 216, 197, 55), width=2)

    card = (70, 70, canvas_w - 70, canvas_h - 70)
    rounded(draw, card, 54, outline=(247, 213, 141, 210), width=4)
    rounded(draw, (90, 90, canvas_w - 90, canvas_h - 90), 44, outline=(112, 216, 197, 86), width=2)
    rounded(draw, (114, 114, canvas_w - 114, canvas_h - 114), 34, outline=(255, 250, 242, 38), width=1)

    for x0, y0, sx, sy in [
        (126, 126, 1, 1),
        (canvas_w - 126, 126, -1, 1),
        (126, canvas_h - 126, 1, -1),
        (canvas_w - 126, canvas_h - 126, -1, -1),
    ]:
        draw.line((x0, y0, x0 + sx * 122, y0), fill=(247, 213, 141, 220), width=4)
        draw.line((x0, y0, x0, y0 + sy * 122), fill=(247, 213, 141, 220), width=4)
        draw.line((x0 + sx * 24, y0 + sy * 24, x0 + sx * 98, y0 + sy * 24), fill=(112, 216, 197, 130), width=2)
        draw.line((x0 + sx * 24, y0 + sy * 24, x0 + sx * 24, y0 + sy * 98), fill=(112, 216, 197, 130), width=2)

    badge_font = font("arialbd.ttf", 28)
    tiny_font = font("segoeui.ttf", 24)
    title_font = font("georgiab.ttf", 72)
    script_font = font("segoepr.ttf", 48)
    small_font = font("segoeui.ttf", 32)
    date_font = font("georgiab.ttf", 38)

    badge_y = 154
    rounded(draw, (canvas_w / 2 - 270, badge_y - 32, canvas_w / 2 + 270, badge_y + 32), 32, fill=(255, 250, 242, 18), outline=(247, 213, 141, 150), width=2)
    draw.line((170, badge_y, canvas_w / 2 - 305, badge_y), fill=(112, 216, 197, 90), width=2)
    draw.line((canvas_w / 2 + 305, badge_y, canvas_w - 170, badge_y), fill=(112, 216, 197, 90), width=2)
    draw.text((canvas_w / 2, badge_y), "PRIVATE CONSTELLATION", anchor="mm", fill=(247, 213, 141, 235), font=badge_font)

    panel_x = (canvas_w - panel_size) // 2
    panel_y = 282
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    rounded(shadow_draw, (panel_x + 22, panel_y + 28, panel_x + panel_size + 22, panel_y + panel_size + 28), 58, fill=(0, 0, 0, 135))
    canvas.alpha_composite(shadow.filter(Image.Resampling.LANCZOS)) if canvas.mode == "RGBA" else None
    draw = ImageDraw.Draw(canvas, "RGBA")

    rounded(draw, (panel_x, panel_y, panel_x + panel_size, panel_y + panel_size), 58, fill=(255, 250, 242, 255), outline=(247, 213, 141, 245), width=6)
    rounded(draw, (panel_x + 22, panel_y + 22, panel_x + panel_size - 22, panel_y + panel_size - 22), 42, outline=(238, 209, 146, 145), width=2)

    qr_img = qr.make_image(fill_color="#07100f", back_color="#fffaf2").convert("RGB")
    qr_img = qr_img.resize((qr_size, qr_size), Image.Resampling.NEAREST)
    canvas.paste(qr_img, (panel_x + panel_pad, panel_y + panel_pad))
    draw = ImageDraw.Draw(canvas, "RGBA")

    medal_y = panel_y + panel_size + 92
    draw.ellipse((canvas_w / 2 - 58, medal_y - 58, canvas_w / 2 + 58, medal_y + 58), fill=(6, 18, 17, 245), outline=(247, 213, 141, 220), width=4)
    draw.ellipse((canvas_w / 2 - 42, medal_y - 42, canvas_w / 2 + 42, medal_y + 42), outline=(112, 216, 197, 128), width=2)
    draw.text((canvas_w / 2, medal_y + 2), "♥", anchor="mm", fill=(247, 213, 141, 255), font=font("seguisym.ttf", 54))

    title_y = medal_y + 132
    draw.text((canvas_w / 2, title_y), "Сканируй", anchor="mm", fill=(255, 250, 242, 255), font=title_font)
    draw.text((canvas_w / 2, title_y + 76), "и открой маленькую вселенную", anchor="mm", fill=(247, 213, 141, 238), font=script_font)

    date_y = title_y + 156
    rounded(draw, (canvas_w / 2 - 245, date_y - 36, canvas_w / 2 + 245, date_y + 36), 26, fill=(255, 250, 242, 18), outline=(247, 213, 141, 130), width=2)
    draw.text((canvas_w / 2, date_y), "17.06.2026", anchor="mm", fill=(255, 242, 203, 255), font=date_font)
    draw.text((canvas_w / 2, date_y + 74), "эта дата выбита на моем сердце", anchor="mm", fill=(210, 230, 224, 210), font=small_font)

    url_hint = url.replace("https://", "").rstrip("/")
    draw.line((canvas_w / 2 - 250, canvas_h - 162, canvas_w / 2 + 250, canvas_h - 162), fill=(112, 216, 197, 90), width=2)
    draw.text((canvas_w / 2, canvas_h - 108), url_hint, anchor="mm", fill=(143, 184, 173, 220), font=tiny_font)

    canvas.save(ROOT / "qr-code.png", quality=98, optimize=True)
    canvas.resize((canvas_w // SCALE, canvas_h // SCALE), Image.Resampling.LANCZOS).save(ROOT / "qr-code-preview.png", quality=95, optimize=True)
    (ROOT / "qr-url.txt").write_text(url, encoding="utf-8")


if __name__ == "__main__":
    main()
