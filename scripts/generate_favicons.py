import os
from PIL import Image, ImageDraw, ImageFont

def generate_icons():
    size = 1024
    corner_radius = 260

    c1 = (16, 185, 129)
    c2 = (45, 212, 191)

    grad = Image.new("RGBA", (size, size))
    grad_pixels = grad.load()
    for y in range(size):
        for x in range(size):
            t = (x + (size - y)) / (2.0 * size)
            t = max(0.0, min(1.0, t))
            r = int(c1[0] + t * (c2[0] - c1[0]))
            g = int(c1[1] + t * (c2[1] - c1[1]))
            b = int(c1[2] + t * (c2[2] - c1[2]))
            grad_pixels[x, y] = (r, g, b, 255)

    mask = Image.new("L", (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=corner_radius, fill=255)

    bg = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    bg.paste(grad, (0, 0), mask)

    draw = ImageDraw.Draw(bg)
    font_size = 540
    font = ImageFont.truetype("C:/Windows/Fonts/seguibl.ttf", font_size)

    bbox = draw.textbbox((0, 0), "M+", font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]

    text_x = (size - text_w) / 2 - bbox[0]
    text_y = (size - text_h) / 2 - bbox[1] - 15

    draw.text((text_x, text_y), "M+", fill=(255, 255, 255, 255), font=font)

    public_dir = os.path.abspath("public")
    app_dir = os.path.abspath("src/app")
    os.makedirs(public_dir, exist_ok=True)
    os.makedirs(app_dir, exist_ok=True)

    img_512 = bg.resize((512, 512), Image.Resampling.LANCZOS)
    img_512.save(os.path.join(public_dir, "web-app-manifest-512x512.png"), "PNG")

    img_192 = bg.resize((192, 192), Image.Resampling.LANCZOS)
    img_192.save(os.path.join(public_dir, "web-app-manifest-192x192.png"), "PNG")

    img_180 = bg.resize((180, 180), Image.Resampling.LANCZOS)
    img_180.save(os.path.join(public_dir, "apple-touch-icon.png"), "PNG")

    img_96 = bg.resize((96, 96), Image.Resampling.LANCZOS)
    img_96.save(os.path.join(public_dir, "favicon-96x96.png"), "PNG")

    img_48 = bg.resize((48, 48), Image.Resampling.LANCZOS)
    img_48.save(os.path.join(public_dir, "favicon-48x48.png"), "PNG")

    img_32 = bg.resize((32, 32), Image.Resampling.LANCZOS)
    img_32.save(os.path.join(public_dir, "favicon-32x32.png"), "PNG")

    img_16 = bg.resize((16, 16), Image.Resampling.LANCZOS)
    img_16.save(os.path.join(public_dir, "favicon-16x16.png"), "PNG")

    ico_path_public = os.path.join(public_dir, "favicon.ico")
    ico_path_app = os.path.join(app_dir, "favicon.ico")

    # Save multi-res ICO
    bg.save(
        ico_path_public,
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64)]
    )
    bg.save(
        ico_path_app,
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64)]
    )

    print("SUCCESS: Generated PNGs and ICO in public/ and src/app/")

generate_icons()
