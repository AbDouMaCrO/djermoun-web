"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react";

export default function CarGallery({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const count = images.length;
  const prev = useCallback(
    () => setCurrentIndex((i) => (i - 1 + count) % count),
    [count],
  );
  const next = useCallback(() => setCurrentIndex((i) => (i + 1) % count), [count]);

  // Keyboard controls while the lightbox is open: Escape closes, arrows navigate.
  useEffect(() => {
    if (!isLightboxOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsLightboxOpen(false);
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isLightboxOpen, prev, next]);

  if (count === 0) {
    return <div className="aspect-video w-full rounded-xl border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-[#111827]" />;
  }

  const active = images[currentIndex];

  return (
    <div>
      {/* Main image */}
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
            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-700 opacity-0 shadow-sm backdrop-blur transition-opacity duration-150 hover:bg-white group-hover:opacity-100"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-700 opacity-0 shadow-sm backdrop-blur transition-opacity duration-150 hover:bg-white group-hover:opacity-100"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {count > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentIndex(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === currentIndex}
              className={`shrink-0 overflow-hidden rounded-lg border-2 transition-opacity duration-150 ${
                i === currentIndex
                  ? "border-amber-500 opacity-100"
                  : "border-transparent opacity-50 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-20 w-28 object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen lightbox — dark backdrop even on the light theme so the image pops. */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={() => setIsLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close"
            className="fixed right-4 top-4 z-10 text-white transition-opacity hover:opacity-70"
          >
            <X size={32} />
          </button>

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Previous image"
                className="fixed left-4 top-1/2 z-10 -translate-y-1/2 text-white transition-opacity hover:opacity-70"
              >
                <ChevronLeft size={48} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Next image"
                className="fixed right-4 top-1/2 z-10 -translate-y-1/2 text-white transition-opacity hover:opacity-70"
              >
                <ChevronRight size={48} />
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={active}
            alt={`Vehicle photo ${currentIndex + 1} of ${count}`}
            className="max-h-screen max-w-screen-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
