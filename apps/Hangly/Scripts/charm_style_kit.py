"""The charm style kit: the proportions, the light and the cord every charm shares.

Extracted from `generate-seasonal-charms.py` when a second generator needed it. The
eleven collection charms were illustrated by hand and these numbers were measured
off them, so anything drawn against this kit sits beside the hand-drawn set rather
than beside the script that drew it.

One rule governs all of it: light comes from the upper left, in every charm, without
exception. Everything else — the dark contour under every shape, the gradient fill
over it, the specular highlight on top, the gold cord and its two beads — follows
from that.
"""

import math
W, H = 86.0, 163.0          # the collection's proportions
CX = W / 2
BODY_Y = 108.0              # where a charm's body is centred
BODY_R = 40.0               # and the most room it has

# Light comes from the upper left, in every charm, without exception.
LIGHT = 'x1="0.12" y1="0.05" x2="0.88" y2="0.95"'
SHEEN = 'cx="0.33" cy="0.28" r="0.8"'

GOLD = ("#ffeeb4", "#e0b845", "#7a5a12")
GOLD_DARK = "#5a4109"


def ramp(name, stops, radial=False):
    tag = "radialGradient" if radial else "linearGradient"
    where = SHEEN if radial else LIGHT
    body = "".join(
        f'<stop offset="{offset:g}" stop-color="{color}"/>'
        for offset, color in stops
    )
    return f'<{tag} id="{name}" {where}>{body}</{tag}>'


def three(name, colors, radial=False):
    """The house ramp: lit, local, shadowed."""
    light, mid, dark = colors
    stops = ((0, light), (0.42, mid), (1, dark))
    return ramp(name, stops, radial=radial)


def header(extra_defs="", height=H):
    defs = "".join([
        three("gold", GOLD),
        three("goldBead", ("#fff6d6", "#e3bb4f", "#6b4d0e"), radial=True),
        extra_defs,
    ])
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:g} {height:g}">\n'
        f"  <defs>{defs}</defs>\n"
    )


def hanger(bead_fill, bead_contour, second_radius=8.4, cord_to=66.0):
    """The cord and two beads every charm hangs from.

    The cord runs the whole way down and the beads sit on it, exactly as the
    hand-drawn collection does — and that is a structural requirement, not a
    stylistic one. `CharmArtworkSplitter` reads the artwork as rows and calls a
    narrow row cord and a wide one a bead; the *narrow rows between the beads* are
    what tell it there are two beads rather than one long blob. Beads with nothing
    between them merge into a single run and the split fails outright.
    """
    return f"""  <path d="M{CX:g},0L{CX:g},{cord_to:g}" fill="none" stroke="{GOLD_DARK}" stroke-width="3.4"/>
  <path d="M{CX:g},0L{CX:g},{cord_to:g}" fill="none" stroke="url(#gold)" stroke-width="2.2"/>
  <circle cx="{CX:g}" cy="24" r="7.4" fill="#4a3408"/>
  <circle cx="{CX:g}" cy="24" r="6.5" fill="url(#goldBead)"/>
  <circle cx="{CX:g}" cy="43" r="{second_radius + 1:g}" fill="{bead_contour}"/>
  <circle cx="{CX:g}" cy="43" r="{second_radius:g}" fill="{bead_fill}"/>
  <ellipse cx="{CX - 2.9:g}" cy="39.6" rx="2.9" ry="2" fill="#ffffff" opacity="0.8"/>
"""


def shaped(path, contour, fill, width=3.0):
    """A dark contour with a lit fill over it — the collection's signature."""
    return (
        f'<path d="{path}" fill="{contour}" stroke="{contour}" '
        f'stroke-width="{width:g}" stroke-linejoin="round"/>'
        f'<path d="{path}" fill="{fill}"/>'
    )


def spark(cx, cy, rx, ry, opacity=0.8):
    return f'<ellipse cx="{cx:g}" cy="{cy:g}" rx="{rx:g}" ry="{ry:g}" fill="#ffffff" opacity="{opacity:g}"/>'


def trimmed(svg, bottom):
    """Crops a charm's shared canvas down to its own ink.

    Every charm draws into the same tall box, and `CharmArtworkSplitterTests`
    requires the artwork to reach the bottom edge — so each one is trimmed to where
    its own ink actually stops, measured off the render rather than guessed from the
    path data, because stroke widths and round caps reach past the coordinates that
    drew them.
    """
    return svg.replace(f'viewBox="0 0 {W:g} {H:g}"', f'viewBox="0 0 {W:g} {bottom:g}"', 1)


def write_all(charms, bottoms, target):
    """Draws each charm and writes it out, trimmed."""
    target.mkdir(parents=True, exist_ok=True)
    for name, draw in charms.items():
        path = target / f"{name}.svg"
        path.write_text(trimmed(draw(), bottoms[name]))
        print(f"{path}  {path.stat().st_size} bytes")
