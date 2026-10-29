"""Draws the extension icon (an eye with a slash) at each size the stores need.

Pure Python, no image libraries. Run: python3 tools/make_icons.py
"""
import math
import os
import struct
import zlib

OUT = os.path.join(os.path.dirname(__file__), "..", "extension", "icons")
SIZES = [16, 32, 48, 128]
SS = 6  # samples per pixel side, for smooth edges

BG = (31, 41, 55)       # dark slate
EYE = (255, 255, 255)
PUPIL = (245, 130, 32)  # orange
SLASH = (255, 255, 255)


def color_at(x, y):
    """Color at a point in a 1x1 square, or None for transparent."""
    # Rounded-square background.
    r = 0.22
    qx, qy = abs(x - 0.5) - (0.5 - r), abs(y - 0.5) - (0.5 - r)
    if math.hypot(max(qx, 0), max(qy, 0)) > r:
        return None

    # Slash from top-left to bottom-right, with a background-colored gap around it.
    d = abs((x - 0.5) - (y - 0.5)) / math.sqrt(2)
    along = ((x - 0.5) + (y - 0.5)) / math.sqrt(2)
    if abs(along) < 0.40:
        if d < 0.045:
            return SLASH
        if d < 0.095:
            return BG

    # Almond-shaped eye: the overlap of two large circles.
    R, off = 0.42, 0.23
    in_eye = math.hypot(x - 0.5, y - 0.5 + off) < R and math.hypot(x - 0.5, y - 0.5 - off) < R
    if in_eye:
        if math.hypot(x - 0.5, y - 0.5) < 0.12:
            return PUPIL
        return EYE
    return BG


def render(size):
    rows = []
    for py in range(size):
        row = bytearray([0])  # PNG filter type: none
        for px in range(size):
            acc = [0, 0, 0, 0]
            for sy in range(SS):
                for sx in range(SS):
                    c = color_at((px + (sx + 0.5) / SS) / size, (py + (sy + 0.5) / SS) / size)
                    if c:
                        acc[0] += c[0]; acc[1] += c[1]; acc[2] += c[2]; acc[3] += 1
            n = acc[3]
            if n:
                row += bytes([acc[0] // n, acc[1] // n, acc[2] // n, round(255 * n / SS ** 2)])
            else:
                row += bytes(4)
        rows.append(bytes(row))
    return png(size, size, b"".join(rows))


def png(w, h, raw):
    def chunk(kind, data):
        c = kind + data
        return struct.pack(">I", len(data)) + c + struct.pack(">I", zlib.crc32(c) & 0xFFFFFFFF)

    return (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for s in SIZES:
        with open(os.path.join(OUT, f"icon-{s}.png"), "wb") as f:
            f.write(render(s))
        print("wrote", s)
