"use client";

import { useEffect, useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const charms = [
  {
    name: "Breaking Bad",
    file: "breaking-bad",
    x: 176,
    length: 64,
    width: 61,
    height: 147,
    angle: -0.13,
  },
  {
    name: "Spider-Man",
    file: "spider-man",
    x: 306,
    length: 72,
    width: 86,
    height: 134,
    angle: 0.08,
  },
  {
    name: "Nimbu-mirchi",
    file: "nimbu-mirchi",
    x: 430,
    length: 78,
    width: 83,
    height: 116,
    angle: -0.08,
  },
];

/** A damped pendulum per charm. Cord and charm rotate as one around a fixed anchor. */
export function HanglyPreview() {
  const scene = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const groups = useRef<(SVGGElement | null)[]>([]);
  const physics = useRef(charms.map((c) => ({ angle: c.angle, velocity: 0 })));
  const drag = useRef<{ index: number; pointer: number; time: number } | null>(
    null,
  );
  const reduced = useReducedMotion();
  const visible = useInView(scene, { margin: "80px" });

  const paint = (index: number) => {
    const c = charms[index];
    groups.current[index]?.setAttribute(
      "transform",
      `translate(${c.x} 80) rotate(${(physics.current[index].angle * 180) / Math.PI})`,
    );
  };

  useEffect(() => {
    if (reduced) {
      physics.current.forEach((p, i) => {
        p.angle = 0;
        p.velocity = 0;
        paint(i);
      });
      return;
    }
    if (!visible) return;
    let frame = 0;
    let previous = 0;
    const tick = (now: number) => {
      const dt = previous ? Math.min((now - previous) / 1000, 0.032) : 0.016;
      previous = now;
      if (!document.hidden)
        physics.current.forEach((p, i) => {
          if (drag.current?.index === i) return;
          const acceleration =
            -(1450 / charms[i].length) * Math.sin(p.angle) - 0.62 * p.velocity;
          p.velocity += acceleration * dt;
          p.angle += p.velocity * dt;
          if (Math.abs(p.angle) + Math.abs(p.velocity) > 0.0001) paint(i);
        });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible, reduced]);

  function nudge(index?: number) {
    if (reduced) return;
    physics.current.forEach((p, i) => {
      if (index === undefined || i === index)
        p.velocity = (i % 2 ? -1 : 1) * 0.9;
    });
  }

  return (
    <div className="hangly-preview" ref={scene}>
      <div className="hangly-stage-glow" aria-hidden="true" />
      <svg
        ref={svg}
        viewBox="0 0 600 370"
        className="hangly-scene"
        aria-label="Interactive Hangly desktop preview"
      >
        <defs>
          <linearGradient id="hangly-desktop" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#262b33" />
            <stop offset=".5" stopColor="#14171c" />
            <stop offset="1" stopColor="#0c0e12" />
          </linearGradient>
          <linearGradient id="hangly-menubar" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#555960" stopOpacity=".65" />
            <stop offset="1" stopColor="#24272e" stopOpacity=".85" />
          </linearGradient>
          <linearGradient
            id="hangly-thread"
            gradientUnits="userSpaceOnUse"
            x1="-1"
            x2="1"
          >
            <stop stopColor="#827253" />
            <stop offset=".45" stopColor="#efdfb1" />
            <stop offset="1" stopColor="#9c8562" />
          </linearGradient>
          <radialGradient id="hangly-light">
            <stop stopColor="#68728e" stopOpacity=".24" />
            <stop offset="1" stopColor="#68728e" stopOpacity="0" />
          </radialGradient>
          <clipPath id="hangly-screen-clip">
            <rect x="30" y="44" width="540" height="285" rx="15" />
          </clipPath>
        </defs>
        <rect
          className="hangly-screen-shadow"
          x="30"
          y="44"
          width="540"
          height="285"
          rx="15"
          fill="url(#hangly-desktop)"
          stroke="#ffffff"
          strokeOpacity=".13"
        />
        <g clipPath="url(#hangly-screen-clip)" aria-hidden="true">
          <ellipse
            cx="240"
            cy="245"
            rx="245"
            ry="170"
            fill="url(#hangly-light)"
          />
          <path
            d="M-20 347 Q170 90 390 267 T650 160"
            fill="none"
            stroke="#9ba8c4"
            strokeOpacity=".055"
            strokeWidth="55"
          />
          <path
            d="M-20 361 Q180 120 395 283 T650 180"
            fill="none"
            stroke="#cbd5ee"
            strokeOpacity=".06"
          />
          <rect
            x="30"
            y="44"
            width="540"
            height="36"
            fill="url(#hangly-menubar)"
          />
          <path d="M30 80H570" stroke="#ffffff" strokeOpacity=".12" />
          <circle cx="50" cy="62" r="3" fill="#dedee1" />
          <text x="64" y="66" fill="#e2e2e5" fontSize="10" fontWeight="600">
            Finder
          </text>
          <text x="110" y="66" fill="#c0c2c8" fontSize="9">
            File
          </text>
          <text x="139" y="66" fill="#c0c2c8" fontSize="9">
            Edit
          </text>
          <rect
            x="456"
            y="57"
            width="15"
            height="9"
            rx="2"
            fill="none"
            stroke="#bbbfc7"
          />
          <rect x="458" y="59" width="10" height="5" rx="1" fill="#bbbfc7" />
          <text x="488" y="66" fill="#d6d7dd" fontSize="9">
            Thu 9:41
          </text>
        </g>
        {charms.map((c, i) => (
          <g key={c.file}>
            <rect
              x={c.x - 9}
              y="75"
              width="18"
              height="5"
              rx="2.5"
              fill="#999ca5"
            />
            <g
              ref={(node) => {
                groups.current[i] = node;
              }}
              transform={`translate(${c.x} 80) rotate(${(c.angle * 180) / Math.PI})`}
              className="hangly-pendulum"
              role="button"
              tabIndex={0}
              aria-label={`Swing ${c.name} charm. Drag to move or press Enter.`}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  nudge(i);
                }
              }}
              onPointerDown={(event) => {
                if (reduced) return;
                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
                drag.current = {
                  index: i,
                  pointer: event.pointerId,
                  time: performance.now(),
                };
                physics.current[i].velocity = 0;
              }}
              onPointerMove={(event) => {
                if (
                  drag.current?.index !== i ||
                  drag.current.pointer !== event.pointerId
                )
                  return;
                const matrix = svg.current?.getScreenCTM();
                if (!matrix) return;
                const point = new DOMPoint(
                  event.clientX,
                  event.clientY,
                ).matrixTransform(matrix.inverse());
                const next = Math.max(
                  -0.8,
                  Math.min(
                    0.8,
                    -Math.atan2(point.x - c.x, Math.max(25, point.y - 80)),
                  ),
                );
                const now = performance.now();
                const dt = Math.max(0.008, (now - drag.current.time) / 1000);
                physics.current[i].velocity = Math.max(
                  -2.5,
                  Math.min(2.5, (next - physics.current[i].angle) / dt),
                );
                physics.current[i].angle = next;
                drag.current.time = now;
                paint(i);
              }}
              onPointerUp={(event) => {
                if (drag.current?.pointer === event.pointerId) {
                  drag.current = null;
                  event.currentTarget.releasePointerCapture(event.pointerId);
                }
              }}
              onPointerCancel={() => {
                drag.current = null;
              }}
              onLostPointerCapture={() => {
                drag.current = null;
              }}
            >
              <path
                d={`M0 0 V${c.length + 4}`}
                stroke="url(#hangly-thread)"
                strokeWidth="1.3"
                fill="none"
              />
              <image
                href={`/portfolio/hangly/${c.file}.svg`}
                x={-c.width / 2}
                y={c.length}
                width={c.width}
                height={c.height}
                className="hangly-real-charm"
              />
            </g>
          </g>
        ))}
        <text
          x="300"
          y="315"
          textAnchor="middle"
          fill="#7f8794"
          fontSize="8"
          letterSpacing="2.5"
          aria-hidden="true"
        >
          A LITTLE JOY. JUST HANGING OUT.
        </text>
      </svg>
      <div className="hangly-preview-caption">
        <span>
          <i /> LITTLE THINGS. REAL PERSONALITY.
        </span>
        <button onClick={() => nudge()} disabled={!!reduced}>
          {reduced ? "Made for your Mac" : "Give them a nudge ↗"}
        </button>
      </div>
    </div>
  );
}
