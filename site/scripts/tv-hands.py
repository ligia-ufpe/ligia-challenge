"""Builds src/tv/assets/creation-hands.png for the TV display (/tv/).

Source: Michelangelo, The Creation of Adam (c. 1512), Sistine Chapel. Public domain.
Scan from Wikimedia Commons:
https://commons.wikimedia.org/wiki/File:Michelangelo_-_Creation_of_Adam_(cropped).jpg
(direct file: https://upload.wikimedia.org/wikipedia/commons/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg)

Crops the two arms, separates the skin from the plaster by colour (skin is much
warmer: red minus blue ~50-95 against ~30 for the wall), keeps the two arms as the
only large shapes, and writes a greyscale + alpha PNG: brightness of the fresco in
L, the hands mask in A. The page turns it into halftone dots at any screen size.

Usage (needs Pillow and numpy):
    python3 scripts/tv-hands.py adam.jpg src/tv/assets/creation-hands.png
"""

import sys
from collections import deque

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

# Region of the 3524 × 1599 scan holding both arms (left, top, right, bottom).
CROP = (700, 500, 1850, 880)

# Generous outlines of each arm in crop coordinates, to keep out Adam's knee,
# the hill, God's cloak and the cherub (all warm-coloured too).
ADAM = [(0, 228), (120, 226), (300, 170), (410, 132), (520, 135), (600, 170), (650, 230),
        (630, 285), (560, 290), (470, 255), (380, 278), (300, 312), (215, 325), (120, 345), (0, 368)]
GOD = [(632, 222), (700, 180), (830, 165), (990, 128), (1100, 98), (1150, 88),
       (1150, 232), (1010, 248), (880, 262), (800, 300), (770, 330), (700, 330), (690, 260)]


def largest_shapes(solid):
    """Label 4-connected shapes; keep those at least 5% the size of the largest."""
    label = np.zeros(solid.shape, np.int32)
    sizes = [0]
    h, w = solid.shape
    for y0 in range(h):
        for x0 in range(w):
            if not solid[y0, x0] or label[y0, x0]:
                continue
            n = len(sizes)
            label[y0, x0] = n
            queue = deque([(y0, x0)])
            count = 0
            while queue:
                y, x = queue.popleft()
                count += 1
                for yy, xx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                    if 0 <= yy < h and 0 <= xx < w and solid[yy, xx] and not label[yy, xx]:
                        label[yy, xx] = n
                        queue.append((yy, xx))
            sizes.append(count)
    keep = [i for i, c in enumerate(sizes) if i and c > 0.05 * max(sizes)]
    return np.isin(label, keep)


def main(src, out):
    im = Image.open(src).convert('RGB').crop(CROP)
    rgb = np.asarray(im).astype(np.float32)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    skin = np.clip((r - b - 40) / 12, 0, 1)

    outline = Image.new('L', im.size, 0)
    draw = ImageDraw.Draw(outline)
    draw.polygon(ADAM, fill=255)
    draw.polygon(GOD, fill=255)
    mask = skin * (np.asarray(outline) / 255.0)

    m = Image.fromarray((mask * 255).astype(np.uint8))
    m = m.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.MaxFilter(5))  # drop cracks and specks
    m = m.filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.MinFilter(7))  # close small holes
    m = m.filter(ImageFilter.GaussianBlur(1.2))
    mask = np.asarray(m).astype(np.float32) / 255.0

    near = largest_shapes(mask > 0.5)  # just the two arms, not stains on the wall
    near = np.asarray(Image.fromarray((near * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))) > 0
    mask *= near

    inside = lum[mask > 0.5]
    lo, hi = np.percentile(inside, 2), np.percentile(inside, 98)
    shade = np.round(np.clip((lum - lo) / (hi - lo), 0, 1) * 31) / 31  # 32 levels pack small
    alpha = np.round(mask * 15) / 15
    la = Image.merge('LA', (Image.fromarray((shade * 255).astype(np.uint8)),
                            Image.fromarray((alpha * 255).astype(np.uint8))))
    la = la.resize((round(la.width * 0.75), round(la.height * 0.75)), Image.LANCZOS)
    la.save(out, optimize=True)
    print(f'wrote {out} ({la.width}×{la.height})')


if __name__ == '__main__':
    main(*sys.argv[1:3])
