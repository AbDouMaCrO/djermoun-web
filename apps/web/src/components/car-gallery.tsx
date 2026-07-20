"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, X } from "lucide-react";

export default function CarGallery({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);

  // Refs track mid-drag state without triggering re-renders.
  const dragRef = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);
  const didDragRef = useRef(false);
  const touchRef = useRef<{ dist: number; z: number } | null>(null);
  const touchPanRef = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);

  const count = images.length;

  const resetView = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    resetView();
  }, [resetView]);

  const prev = useCallback(() => { setCurrentIndex((i) => (i - 1 + count) % count); resetView(); }, [count, resetView]);
  const next = useCallback(() => { setCurrentIndex((i) => (i + 1) % count); resetView(); }, [count, resetView]);

  const clampZoom = (z: number) => Math.min(5, Math.max(1, z));

  const changeZoom = useCallback((delta: number) => {
    setZoom((z) => {
      const nz = clampZoom(z + delta);
      if (nz === 1) setOffset({ x: 0, y: 0 });
      return nz;
    });
  }, []);

  // Keyboard: Escape, arrows, +/-.
  useEffect(() => {
    if (!isLightboxOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "+" || e.key === "=") changeZoom(0.5);
      else if (e.key === "-") changeZoom(-0.5);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isLightboxOpen, prev, next, closeLightbox, changeZoom]);

  // Mouse wheel zoom on the image.
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => {
      const nz = clampZoom(z - e.deltaY * 0.002);
      if (nz === 1) setOffset({ x: 0, y: 0 });
      return nz;
    });
  }, []);

  // Drag-to-pan (mouse).
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom <= 1) return;
    e.preventDefault();
    didDragRef.current = false;
    dragRef.current = { startX: e.clientX, startY: e.clientY, ox: offset.x, oy: offset.y };
    setPanning(true);
  }, [zoom, offset]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDragRef.current = true;
    setOffset({ x: dragRef.current.ox + dx, y: dragRef.current.oy + dy });
  }, []);

  const onMouseUp = useCallback(() => {
    dragRef.current = null;
    setPanning(false);
  }, []);

  // Backdrop click closes only when not mid-drag.
  const onBackdropClick = useCallback(() => {
    if (!didDragRef.current) closeLightbox();
    didDragRef.current = false;
  }, [closeLightbox]);

  // Double-click toggles 2.5× zoom / reset.
  const onDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (zoom > 1) { resetView(); } else { setZoom(2.5); }
  }, [zoom, resetView]);

  // Touch: pinch-to-zoom + single-finger pan.
  const getTouchDist = (t: React.TouchList) => {
    const dx = t[0].clientX - t[1].clientX;
    const dy = t[0].clientY - t[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      touchRef.current = { dist: getTouchDist(e.touches), z: zoom };
      touchPanRef.current = null;
    } else if (e.touches.length === 1 && zoom > 1) {
      touchPanRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY, ox: offset.x, oy: offset.y };
    }
  }, [zoom, offset]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2 && touchRef.current) {
      const nz = clampZoom(touchRef.current.z * (getTouchDist(e.touches) / touchRef.current.dist));
      setZoom(nz);
      if (nz === 1) setOffset({ x: 0, y: 0 });
    } else if (e.touches.length === 1 && touchPanRef.current) {
      setOffset({
        x: touchPanRef.current.ox + e.touches[0].clientX - touchPanRef.current.startX,
        y: touchPanRef.current.oy + e.touches[0].clientY - touchPanRef.current.startY,
      });
    }
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length < 2) touchRef.current = null;
    if (e.touches.length === 0) touchPanRef.current = null;
  }, []);

  if (count === 0) {
    return <div className="aspect-video w-full rounded-xl border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-[#111827]" />;
  }

  const active = images[currentIndex];

  return (
    <div>
      {/* Main thumbnail */}
      <div className="group relative overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-white/10">
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="block w-full"
          aria-label="Zoom image"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={active}
            alt={`Vehicle photo ${currentIndex + 1} of ${count}`}
            className="aspect-video w-full object-cover"
          />
        </button>

        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-white/80 p-2 text-slate-700 shadow-sm backdrop-blur">
          <ZoomIn size={18} />
        </span>

        {count > 1 && (
          <>
            <button type="button" onClick={prev} aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-700 opacity-0 shadow-sm backdrop-blur transition-opacity duration-150 hover:bg-white group-hover:opacity-100">
              <ChevronLeft size={20} />
            </button>
            <button type="button" onClick={next} aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-700 opacity-0 shadow-sm backdrop-blur transition-opacity duration-150 hover:bg-white group-hover:opacity-100">
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {count > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button key={i} type="button" onClick={() => setCurrentIndex(i)}
              aria-label={`View image ${i + 1}`} aria-current={i === currentIndex}
              className={`shrink-0 overflow-hidden rounded-lg border-2 transition-opacity duration-150 ${
                i === currentIndex ? "border-amber-500 opacity-100" : "border-transparent opacity-50 hover:opacity-100"
              }`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-20 w-28 object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox with zoom + pan */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 select-none"
          onClick={onBackdropClick}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          role="dialog"
          aria-modal="true"
        >
          {/* Controls top-right */}
          <div className="fixed right-4 top-4 z-10 flex items-center gap-2">
            <button type="button" onClick={(e) => { e.stopPropagation(); changeZoom(0.5); }}
              aria-label="Zoom in"
              className="rounded-full bg-white/10 p-2 text-white backdrop-blur hover:bg-white/25 transition-colors">
              <ZoomIn size={20} />
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); changeZoom(-0.5); }}
              aria-label="Zoom out"
              className="rounded-full bg-white/10 p-2 text-white backdrop-blur hover:bg-white/25 transition-colors">
              <ZoomOut size={20} />
            </button>
            {zoom > 1 && (
              <button type="button" onClick={(e) => { e.stopPropagation(); resetView(); }}
                aria-label="Reset zoom"
                className="rounded-full bg-white/10 p-2 text-white backdrop-blur hover:bg-white/25 transition-colors">
                <Maximize2 size={20} />
              </button>
            )}
            <button type="button" onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
              aria-label="Close"
              className="rounded-full bg-white/10 p-2 text-white backdrop-blur hover:bg-white/25 transition-colors ml-1">
              <X size={24} />
            </button>
          </div>

          {count > 1 && (
            <>
              <button type="button" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous image"
                className="fixed left-4 top-1/2 z-10 -translate-y-1/2 text-white transition-opacity hover:opacity-70">
                <ChevronLeft size={48} />
              </button>
              <button type="button" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next image"
                className="fixed right-4 top-1/2 z-10 -translate-y-1/2 text-white transition-opacity hover:opacity-70">
                <ChevronRight size={48} />
              </button>
            </>
          )}

          {/* Zoom hint */}
          {zoom === 1 && (
            <p className="fixed bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/40 pointer-events-none">
              Scroll or pinch to zoom · Double-click to zoom in
            </p>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={active}
            alt={`Vehicle photo ${currentIndex + 1} of ${count}`}
            className={`max-h-screen max-w-screen-2xl object-contain transition-transform duration-100 ${
              zoom > 1 ? (panning ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"
            }`}
            style={{
              transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)`,
              touchAction: "none",
            }}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={onDoubleClick}
            onWheel={onWheel}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            draggable={false}
          />
        </div>
      )}
    </div>
  );
}
