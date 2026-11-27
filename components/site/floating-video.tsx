"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { src: string; poster?: string };

/**
 * Vídeo flutuante do programa. Só aparece a partir de 1024 px e some quando a seção de inscrição entra na
 * tela, para não cobrir o formulário. Começa pausado e mudo; tem botão de reproduzir/pausar e de fechar.
 */
export function FloatingVideo({ src, poster }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [closed, setClosed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [nearForm, setNearForm] = useState(false);

  useEffect(() => {
    const form = document.getElementById("inscricao");
    if (!form) return;
    const observer = new IntersectionObserver(([entry]) => setNearForm(entry.isIntersecting), {
      rootMargin: "0px 0px 200px 0px",
    });
    observer.observe(form);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (nearForm) videoRef.current?.pause();
  }, [nearForm]);

  if (closed) return null;

  function toggle() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  }

  return (
    <aside
      aria-label="Vídeo de apresentação do ELEVE+"
      className={cn(
        "fixed bottom-5 left-4 z-40 hidden w-40 transition-opacity duration-300 lg:block xl:w-44",
        nearForm && "pointer-events-none opacity-0",
      )}
      aria-hidden={nearForm || undefined}
    >
      <div className="border-ink-border bg-ink relative aspect-[9/16] overflow-hidden rounded-2xl border shadow-2xl">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted
          playsInline
          loop
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          className="h-full w-full object-cover"
        />
        <button
          type="button"
          onClick={toggle}
          tabIndex={nearForm ? -1 : 0}
          className="from-ink/80 text-ink-foreground absolute inset-x-0 bottom-0 flex min-h-11 items-center gap-2 bg-gradient-to-t to-transparent px-3 pt-8 pb-3 text-xs font-bold tracking-wider uppercase"
        >
          {playing ? <Pause aria-hidden="true" className="size-4" /> : <Play aria-hidden="true" className="size-4" />}
          <span>
            ELEVE<span className="text-brand">+</span>
          </span>
          <span className="sr-only">{playing ? "Pausar vídeo" : "Reproduzir vídeo"}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            videoRef.current?.pause();
            setClosed(true);
          }}
          tabIndex={nearForm ? -1 : 0}
          className="bg-ink/70 text-ink-foreground absolute top-1 right-1 inline-flex size-11 items-center justify-center rounded-full"
        >
          <X aria-hidden="true" className="size-4" />
          <span className="sr-only">Fechar vídeo</span>
        </button>
      </div>
    </aside>
  );
}
