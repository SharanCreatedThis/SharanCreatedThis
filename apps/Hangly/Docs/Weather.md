# Weather

A charm can take on the sky. It is off until you turn it on, it uses one public
service with no account behind it, and it costs nothing to draw.

## Why not WeatherKit

WeatherKit needs a paid Apple Developer Program membership, a
`com.apple.developer.weatherkit` entitlement, and an App ID registered to that
membership. An entitlement is only real if the build is signed with the profile
that grants it, and Hangly ships unsigned. So WeatherKit would work on the
maintainer's machine and on nobody else's — including anyone who clones this
repository and builds it. That is the wrong shape for an open-source app.

[Open-Meteo](https://open-meteo.com) needs none of it: no key, no account, no SDK,
no entitlement. Two GET requests against a documented endpoint. Anyone can build
this repository and have the weather work.

## The four pieces

| | |
|---|---|
| `WeatherCondition` | The five states, and the WMO code table that produces them |
| `OpenMeteoClient` | Builds URLs, decodes JSON. No state, no cache, no schedule |
| `WeatherService` | The cache, the half-hourly refresh, the offline fallback, the override |
| `WeatherMood` | What a condition *looks* like — and all the renderer is ever given |

The renderer never learns what the weather is. It is handed a `WeatherMood` and
applies it. That split is the reason none of the effects can become a sticker:
every one of them has to be expressible as an adjustment to the artwork the
designer drew, because an adjustment is the only thing the type can carry.

## Where, without asking

No location permission is requested, and none is used. A time zone identifier
already names a city — `Europe/Lisbon`, `America/Argentina/Buenos_Aires` — and that
name, resolved through Open-Meteo's own geocoding and then cached, is close enough
for something with five answers. You can type any city instead.

Coordinates are rounded to two decimal places — roughly a kilometre — in
`WeatherPlace.init`, before they are ever sent or stored. A charm does not need to
know which street you are on, and the less precise the question, the less the answer
can say about you.

## Cache, updates, offline

- The last successful reading is written to `com.hangly.weather.v1` beside the
  settings, and read at launch before anything is drawn — so a charm wears the
  right weather from its first frame rather than flicking into it a second later.
- Refresh every **30 minutes**. A failed request retries in **5**, and never
  storms.
- A reading is worn for up to **6 hours**. Long enough that a laptop closed over
  lunch opens to the weather it closed in; short enough that a charm is not still
  glittering with the morning's snow at dusk. Past it, the charm returns to its own
  colours.
- A failed request changes nothing — the cached reading stays exactly where it was.
  Offline is not an error state here, it is a half hour in which nothing new
  arrived.
- With weather off, or with a condition chosen by hand, **nothing is fetched at
  all**: no request, no connection, no timer.

## The effects

Five adjustments, and not one of them draws anything new on top of the charm:

| | |
|---|---|
| Saturation | What overcast light does to colour |
| Warmth | Sunlight is warm; snow light is not |
| Sheen | The highlights *already in the artwork*, pushed further toward white |
| Damp | Mid-tones pulled down, which is most of why a wet thing looks wet |
| Rim | A faint colour just inside the artwork's own silhouette, where frost collects |

Sheen is the one that matters most. Exaggerating the shading an artist already drew
is what makes sun on gold and water on enamel read as light rather than as a filter,
and it is why a charm stays recognisably itself in all five kinds of weather —
`WeatherEffectTests` measures both, and fails an effect that moves a charm's average
colour too far or changes its silhouette at all.

The rim is the only addition, and it follows the artwork: the alpha channel minus a
blurred copy of itself, which is bright just inside the edge and nothing anywhere
else. An outer glow would be the same subtraction the other way round, and would
look stuck on.

**Nothing animates.** A shimmering storm would mean redrawing the overlay for ever,
and that is the entire idle budget of an app that otherwise sleeps. Storm is a
static electric sheen.

## What it costs

Nothing per frame. The adjustments are baked into the bitmap `VectorImage` was
already caching, keyed by the mood alongside the rope style — so only one variant is
live at a time and the number of cached bitmaps is unchanged. Imported charms have
no vector to re-render from, so their weathered copies live in a small bounded cache
of their own.

Measured on the shipped build with weather on and a reading in hand: **0.6% of one
core and 31 MB settled**, which is the same as with it off. The running cost is one
timer wake and one small request every thirty minutes.

`applied(to:)` does the same arithmetic on a `CharmPalette` for the cord, the halo
and the charms drawn from geometry rather than from a file. Sharing it is what keeps
a gold cord and the gold charm on the end of it agreeing about what the light is
doing.

## What weather cannot touch

The physics. The mood reaches the renderer and nothing else, so a rope swings
identically in a storm and in the sun — asserted by `WeatherEffectTests`.
