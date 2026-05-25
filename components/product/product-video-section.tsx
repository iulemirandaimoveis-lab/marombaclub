"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, ExternalLink, Video } from "lucide-react";
import type { ProductVideo } from "@/lib/data/products";

const TYPE_LABELS: Record<ProductVideo["type"], string> = {
  demo:  "Demonstração",
  reel:  "Reel",
  howto: "Como usar",
  brand: "Institucional",
};

interface ProductVideoSectionProps {
  videos: ProductVideo[];
}

export function ProductVideoSection({ videos }: ProductVideoSectionProps) {
  const [active, setActive] = useState(0);
  const [modal, setModal] = useState(false);

  if (!videos.length) return null;

  const current = videos[active];

  // Extract YouTube/Vimeo embed URL
  function embedUrl(url: string): string | null {
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    return null;
  }

  const isEmbed = !!embedUrl(current.url);

  return (
    <>
      <div>
        <div className="mb-4">
          <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">Em movimento</p>
          <h2 className="font-display text-2xl text-foreground tracking-wide">VEJA EM AÇÃO</h2>
        </div>

        {/* Main video area */}
        <div className="relative rounded-2xl overflow-hidden aspect-video bg-foreground/90 cursor-pointer group"
          onClick={() => setModal(true)}>
          {current.thumbnail ? (
            <img src={current.thumbnail} alt={current.title ?? "Vídeo"} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Video className="w-16 h-16 text-white/20" />
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />

          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl"
            >
              <Play className="w-7 h-7 text-foreground fill-foreground ml-1" />
            </motion.div>
          </div>

          {/* Type badge */}
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-xs font-bold">
              {TYPE_LABELS[current.type] ?? "Vídeo"}
            </span>
          </div>

          {/* Title */}
          {current.title && (
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-white text-sm font-medium truncate">{current.title}</p>
            </div>
          )}
        </div>

        {/* Video tabs — multiple videos */}
        {videos.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            {videos.map((v, i) => (
              <button key={i} onClick={() => setActive(i)}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                  i === active
                    ? "bg-primary text-white shadow-neon-sm"
                    : "glass border border-border text-muted hover:text-foreground"
                }`}
              >
                <Play className="w-3 h-3" />
                {v.title ?? TYPE_LABELS[v.type] ?? `Vídeo ${i + 1}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setModal(false)}
          >
            <button className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors z-10"
              onClick={() => setModal(false)}>
              <X className="w-6 h-6 text-white" />
            </button>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-3xl aspect-video rounded-2xl overflow-hidden bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              {isEmbed ? (
                <iframe
                  src={embedUrl(current.url)!}
                  className="w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title={current.title ?? "Vídeo do produto"}
                />
              ) : (
                <video
                  src={current.url}
                  autoPlay
                  controls
                  className="w-full h-full"
                  playsInline
                />
              )}
            </motion.div>

            {/* External link fallback */}
            {!isEmbed && (
              <a href={current.url} target="_blank" rel="noopener noreferrer"
                className="absolute bottom-6 flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors"
                onClick={(e) => e.stopPropagation()}>
                <ExternalLink className="w-4 h-4" />
                Abrir em nova aba
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
