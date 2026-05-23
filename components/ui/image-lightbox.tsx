'use client';

import { useState, useCallback, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LightboxImage {
  url: string;
  alt: string;
}

interface ImageLightboxProps {
  images: LightboxImage[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
}

export function ImageLightbox({ images, initialIndex = 0, open, onClose }: ImageLightboxProps) {
  const [current, setCurrent] = useState(initialIndex);

  useEffect(() => {
    if (open) setCurrent(initialIndex);
  }, [open, initialIndex]);

  const goNext = useCallback(() => {
    setCurrent(prev => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrent(prev => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose, goNext, goPrev]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!images.length) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-white/10 text-white text-sm">
              {current + 1} / {images.length}
            </div>
          )}

          {/* Previous button */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Main image */}
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="max-w-[90vw] max-h-[85vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[current]?.url ?? ''}
              alt={images[current]?.alt ?? 'Imagen'}
              className="max-w-full max-h-[85vh] object-contain rounded-lg select-none"
              draggable={false}
            />
            {images[current]?.alt && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3 rounded-b-lg">
                <p className="text-white text-sm text-center">{images[current].alt}</p>
              </div>
            )}
          </motion.div>

          {/* Next button */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Siguiente"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Small zoom icon overlay for clickable image thumbnails */
export function ImageZoomOverlay() {
  return (
    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer">
      <div className="p-2 rounded-full bg-black/50">
        <ZoomIn className="h-5 w-5 text-white" />
      </div>
    </div>
  );
}
