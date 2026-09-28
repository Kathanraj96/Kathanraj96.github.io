"""Assemble the approved four-pose character sheets into stable website sprites."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'assets' / 'sprite-sources'
SHEETS = {
    'luffy': 'luffy-poses.png',
    'zoro': 'zoro-poses.png',
    'zenitsu': 'zenitsu-poses.png',
}
CELL = 256
MARGIN = 12

for name, filename in SHEETS.items():
    image = Image.open(SOURCE / filename).convert('RGBA')
    mid_x, mid_y = image.width // 2, image.height // 2
    quadrants = [
        (0, 0, mid_x, mid_y),
        (mid_x, 0, image.width, mid_y),
        (0, mid_y, mid_x, image.height),
        (mid_x, mid_y, image.width, image.height),
    ]
    poses = []
    for box in quadrants:
        quadrant = image.crop(box)
        mask = quadrant.getchannel('A').point(lambda alpha: 255 if alpha >= 16 else 0)
        bounds = mask.getbbox()
        if bounds is None:
            raise ValueError(f'{name}: empty pose in {box}')
        poses.append(quadrant.crop(bounds))
    max_width = max(pose.width for pose in poses)
    max_height = max(pose.height for pose in poses)
    scale = min((CELL - 2 * MARGIN) / max_width, (CELL - 2 * MARGIN) / max_height)
    strip = Image.new('RGBA', (CELL * 4, CELL), (0, 0, 0, 0))
    for index, pose in enumerate(poses):
        width, height = round(pose.width * scale), round(pose.height * scale)
        resized = pose.resize((width, height), Image.Resampling.LANCZOS)
        x = index * CELL + (CELL - width) // 2
        y = CELL - MARGIN - height
        strip.alpha_composite(resized, (x, y))
    dest = ROOT / 'assets' / f'{name}-chibi-sprite.webp'
    strip.save(dest, 'WEBP', quality=92, method=6)
    assert strip.size == (1024, 256)
    assert all(strip.crop((n * CELL, 0, (n + 1) * CELL, CELL)).getchannel('A').getbbox() for n in range(4))
    print(f'{name}: {dest.name}, {dest.stat().st_size:,} bytes, source poses {[pose.size for pose in poses]}')
