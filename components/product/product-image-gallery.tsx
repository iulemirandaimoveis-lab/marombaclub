"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Package, ZoomIn, X, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductImageGalleryProps {
  mainImage: string | null;
  gallery?: string[];
  productName: string;
}

export function ProductImageGallery({ mainImage, gallery = [], productName }: ProductImageGalleryProps) {
  const images = [mainImage, ...gallery].filter(Boolean) as string[];
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [imgError, setImgError] = useState<Set<number>>(new Set());

  if (images.length === 0) {
    return (
      <div className="relative aspect-square rounded-3xl overflow-hidden flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #E2E0D9 0%, #D8D6CE 100%)" }}>
        <div className="text-center">
          <Package className="w-20 h-20 mx-auto text-muted/30 mb-3" />
          <p className="text-muted/50 text-sm">Sem imagem</p>
        </div>
      </div>
    );
  }

  const prev = () => setActive((a) => (a - 1 + images.length) % images.length);
  const next = () => setActive((a) => (a + 1) % images.length);

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Main image */}
        <div className="relative aspect-square rounded-3xl overflow-hidden cursor-zoom-in group border border-border"
          style={{ background: "linear-gradient(135deg, #ECEAE4 0%, #E2E0D9 50%, #ECEAE4 100%)" }}
          onClick={() => setZoomed(true)}>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
            >
              {imgError.has(active) ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-20 h-20 text-muted/30" />
                </div>
              ) : (
                <Image
                  src={images[active]}
                  alt={`${productName} — imagem ${active + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  onError={() => setImgError((prev) => new Set(prev).add(active))}
                  priority={active === 0}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Zoom hint */}
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200
            bg-black/40 backdrop-blur-sm rounded-lg p-2">
            <ZoomIn className="w-4 h-4 text-white" />
          </div>

          {/* Navigation arrows — only if multiple images */}
          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity
                  bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-card hover:bg-white">
                <ChevronLeft className="w-4 h-4 text-foreground" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity
                  bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-card hover:bg-white">
                <ChevronRight className="w-4 h-4 text-foreground" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {images.map((img, i) => (
              <button key={i} onClick={() => setActive(i)}
                className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200
                  ${i === active ? "border-primary shadow-neon-sm scale-105" : "border-border hover:border-primary/50 opacity-60 hover:opacity-100"}`}>
                {imgError.has(i) ? (
                  <div className="w-full h-full flex items-center justify-center bg-surface">
                    <Package className="w-5 h-5 text-muted/40" />
                  </div>
                ) : (
                  <Image src={img} alt={`Thumbnail ${i + 1}`} width={64} height={64} className="object-cover w-full h-full"
                    onError={() => setImgError((prev) => new Set(prev).add(i))} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Zoom modal */}
      <AnimatePresence>
        {zoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={() => setZoomed(false)}
          >
            <button className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors z-10"
              onClick={() => setZoomed(false)}>
              <X className="w-6 h-6 text-white" />
            </button>
            {images.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); prev(); }}
                  className="absolute left-4 bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors z-10">
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); next(); }}
                  className="absolute right-4 bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors z-10">
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg max-h-[85vh] mx-4 aspect-square"
              onClick={(e) => e.stopPropagation()}
            >
              <Image src={images[active]} alt={productName} fill className="object-contain rounded-2xl" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
