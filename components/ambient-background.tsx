"use client";
import { useEffect, useRef, useState } from "react";
import { usePreferences } from "./preferences";
export function AmbientBackground() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [small, setSmall] = useState(false);
  useEffect(() => {
    const query = matchMedia("(max-width: 767px)");
    const update = () => setSmall(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  const { theme, motionPaused, reducedMotion, ready } = usePreferences();
  useEffect(() => {
    const el = canvas.current;
    if (!el || !ready) return;
    const ctx = el.getContext("2d", { alpha: true });
    if (!ctx) return;
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    const compact = small;
    const low =
      compact || connection?.saveData || navigator.hardwareConcurrency <= 4;
    const count = low ? 28 : 68,
      fps = low ? 18 : 24;
    let w = innerWidth,
      h = innerHeight,
      frame = 0,
      last = 0,
      clock = 0,
      boost = 1,
      wanted = 1,
      scrollY = window.scrollY,
      rendered = 0;
    let seed = 314159;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const dots = Array.from({ length: count }, () => ({
      x: random(),
      y: random(),
      r: 0.55 + random() * 0.7,
      phase: random() * Math.PI * 2,
      v: 0.07 + random() * 0.1,
      alpha: 0.12 + random() * 0.18,
      color: random(),
    }));
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        const x = d.x * w + Math.sin(clock * d.v * 0.035 + d.phase) * 10;
        const y = d.y * h + Math.cos(clock * d.v * 0.025 + d.phase) * 14;
        ctx.beginPath();
        ctx.arc(x, y, d.r, 0, Math.PI * 2);
        const rgb =
          d.color < 0.65
            ? theme === "dark"
              ? "89,201,145"
              : "49,132,87"
            : d.color < 0.86
              ? theme === "dark"
                ? "125,170,196"
                : "100,152,177"
              : theme === "dark"
                ? "214,233,219"
                : "154,172,160";
        ctx.fillStyle = `rgba(${rgb},${d.alpha * (theme === "dark" ? 0.85 : 0.75)})`;
        ctx.fill();
      }
      el.dataset.frames = String(++rendered);
    };
    const resize = () => {
      w = innerWidth;
      h = innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, low ? 1 : 1.5);
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      el.style.width = w + "px";
      el.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };
    const stopped = () =>
      motionPaused ||
      reducedMotion ||
      document.hidden ||
      !!connection?.saveData;
    const tick = (now: number) => {
      if (stopped()) {
        el.dataset.running = "false";
        return;
      }
      frame = requestAnimationFrame(tick);
      if (now - last < 1000 / fps) return;
      const dt = Math.min((now - last) / 1000, 0.09);
      last = now;
      boost += (wanted - boost) * 0.045;
      wanted += (1 - wanted) * 0.025;
      clock += dt * boost;
      el.dataset.speed = boost.toFixed(2);
      el.dataset.running = "true";
      draw();
    };
    const resume = () => {
      cancelAnimationFrame(frame);
      el.dataset.running = "false";
      last = performance.now();
      if (!stopped()) frame = requestAnimationFrame(tick);
    };
    const scroll = () => {
      wanted = 1 + Math.min(0.24, Math.abs(window.scrollY - scrollY) / 600);
      scrollY = window.scrollY;
    };
    el.dataset.count = String(count);
    el.dataset.fps = String(fps);
    resize();
    resume();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("scroll", scroll, { passive: true });
    document.addEventListener("visibilitychange", resume);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", scroll);
      document.removeEventListener("visibilitychange", resume);
      el.dataset.running = "false";
    };
  }, [theme, motionPaused, reducedMotion, ready, small]);
  return (
    <div className="ambient-background" aria-hidden="true">
      <div className="ambient-tint" />
      <canvas ref={canvas} id="ambient-particles" data-running="false" />
    </div>
  );
}
