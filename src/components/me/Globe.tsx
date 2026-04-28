'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { geoOrthographic, geoPath, geoGraticule10 } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { Topology, GeometryCollection } from 'topojson-specification';
import worldData from 'world-atlas/countries-110m.json';
import type { City } from '@/lib/types';

const SIZE = 640;
const PADDING = 6;

interface GlobeProps {
  cities: City[];
}

export default function Globe({ cities }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Mutable refs so RAF can update without React re-renders
  const rotation = useRef<[number, number]>([15, -25]);
  const dragging = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const autoRotate = useRef(true);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cursorPos = useRef<{ x: number; y: number } | null>(null);
  const hoveredRef = useRef<number | null>(null);

  // React state only for tooltip render trigger
  const [hovered, setHovered] = useState<number | null>(null);
  const [grabbing, setGrabbing] = useState(false);

  const land: FeatureCollection<Geometry> = useMemo(() => {
    const topo = worldData as unknown as Topology<{ countries: GeometryCollection }>;
    return feature(topo, topo.objects.countries) as FeatureCollection<Geometry>;
  }, []);

  const graticule = useMemo(() => geoGraticule10(), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.scale(dpr, dpr);

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = now - last;
      last = now;

      if (autoRotate.current && !dragging.current) {
        rotation.current = [
          (rotation.current[0] + dt * 0.006) % 360,
          rotation.current[1],
        ];
      }

      const projection = geoOrthographic()
        .translate([SIZE / 2, SIZE / 2])
        .scale(SIZE / 2 - PADDING)
        .clipAngle(90)
        .rotate(rotation.current);

      const path = geoPath(projection, ctx);

      // Clear
      ctx.clearRect(0, 0, SIZE, SIZE);

      // Globe disc
      ctx.beginPath();
      ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - PADDING, 0, 2 * Math.PI);
      ctx.fillStyle = '#0a0908';
      ctx.fill();
      ctx.strokeStyle = 'rgba(244,236,216,0.18)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Graticule
      ctx.beginPath();
      path(graticule);
      ctx.strokeStyle = 'rgba(244,236,216,0.06)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Continents (one path call for the whole FeatureCollection)
      ctx.beginPath();
      path(land);
      ctx.fillStyle = '#26231f';
      ctx.fill();
      ctx.strokeStyle = 'rgba(244,236,216,0.16)';
      ctx.lineWidth = 0.4;
      ctx.stroke();

      // Compute visible stars
      const toRad = (d: number) => (d * Math.PI) / 180;
      const centerLng = -rotation.current[0];
      const centerLat = -rotation.current[1];
      const sinCLat = Math.sin(toRad(centerLat));
      const cosCLat = Math.cos(toRad(centerLat));

      type Spot = { idx: number; x: number; y: number };
      const visibleSpots: Spot[] = [];
      for (let i = 0; i < cities.length; i++) {
        const c = cities[i];
        const cosD =
          sinCLat * Math.sin(toRad(c.lat)) +
          cosCLat * Math.cos(toRad(c.lat)) * Math.cos(toRad(c.lng - centerLng));
        if (cosD < 0.02) continue;
        const proj = projection([c.lng, c.lat]);
        if (!proj) continue;
        visibleSpots.push({ idx: i, x: proj[0], y: proj[1] });
      }

      // Hit test
      let newHovered: number | null = null;
      if (cursorPos.current && !dragging.current) {
        const cx = cursorPos.current.x;
        const cy = cursorPos.current.y;
        for (const s of visibleSpots) {
          const dx = s.x - cx;
          const dy = s.y - cy;
          if (dx * dx + dy * dy < 16 * 16) {
            newHovered = s.idx;
            break;
          }
        }
      }
      if (newHovered !== hoveredRef.current) {
        hoveredRef.current = newHovered;
        setHovered(newHovered);
      }

      // Draw stars (coral — the only accent)
      ctx.fillStyle = '#d96e4d';
      for (const s of visibleSpots) {
        const isHover = hoveredRef.current === s.idx;
        drawStar(ctx, s.x, s.y, isHover ? 10 : 7);
      }

      // Position tooltip at cursor
      if (tooltipRef.current) {
        if (hoveredRef.current !== null && cursorPos.current) {
          tooltipRef.current.style.left = `${cursorPos.current.x}px`;
          tooltipRef.current.style.top = `${cursorPos.current.y}px`;
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cities, land, graticule]);

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    dragging.current = true;
    autoRotate.current = false;
    setGrabbing(true);
    if (resumeTimer.current) {
      clearTimeout(resumeTimer.current);
      resumeTimer.current = null;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    lastPoint.current = { x: e.clientX, y: e.clientY };
    cursorPos.current = {
      x: ((e.clientX - rect.left) / rect.width) * SIZE,
      y: ((e.clientY - rect.top) / rect.height) * SIZE,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    cursorPos.current = {
      x: ((e.clientX - rect.left) / rect.width) * SIZE,
      y: ((e.clientY - rect.top) / rect.height) * SIZE,
    };
    if (!dragging.current || !lastPoint.current) return;
    const dx = e.clientX - lastPoint.current.x;
    const dy = e.clientY - lastPoint.current.y;
    rotation.current = [
      (rotation.current[0] + dx * 0.4) % 360,
      Math.max(-85, Math.min(85, rotation.current[1] - dy * 0.4)),
    ];
    lastPoint.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    setGrabbing(false);
    lastPoint.current = null;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      autoRotate.current = true;
    }, 1500);
  };

  const onPointerLeave = () => {
    cursorPos.current = null;
    if (dragging.current) onPointerUp();
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: SIZE,
        aspectRatio: '1',
        margin: '0 auto',
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: grabbing ? 'grabbing' : hovered !== null ? 'pointer' : 'grab',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerLeave}
      />

      {/* Tooltip — positioned imperatively in RAF */}
      <div
        ref={tooltipRef}
        style={{
          position: 'absolute',
          transform: 'translate(14px, -50%)',
          background: 'rgba(10,9,8,0.92)',
          border: '0.5px solid rgba(244,236,216,0.2)',
          color: 'var(--color-text)',
          fontFamily: 'var(--font-display)',
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: '0.01em',
          padding: '6px 10px',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 30,
          lineHeight: 1.35,
          opacity: hovered !== null ? 1 : 0,
          transition: 'opacity 0.12s ease',
        }}
      >
        {hovered !== null && (
          <>
            <div>
              {cities[hovered]?.name}
              <span style={{ color: 'var(--color-muted)', marginLeft: 6 }}>
                {cities[hovered]?.country}
              </span>
            </div>
            {cities[hovered]?.note && (
              <div style={{ color: '#d96e4d', fontSize: 12, marginTop: 2 }}>
                {cities[hovered].note}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  const s = size / 10;
  const points: Array<[number, number]> = [
    [0, -10],
    [2.94, -3.09],
    [9.51, -3.09],
    [4.28, 1.18],
    [6.18, 8.09],
    [0, 4],
    [-6.18, 8.09],
    [-4.28, 1.18],
    [-9.51, -3.09],
    [-2.94, -3.09],
  ];
  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    const [x, y] = points[i];
    const px = cx + x * s;
    const py = cy + y * s;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}
