"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize2, Pause, Play, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  /** Versão leve, sem áudio, que roda em loop na miniatura. */
  previewSrc: string;
  /** Versão completa, com áudio, carregada só quando a pessoa abre o vídeo. */
  src: string;
  poster?: string;
};

/**
 * Vídeo flutuante do programa (só a partir de 1024 px). A miniatura roda muda em loop, com botão de pausar
 * (e não começa sozinha se a pessoa pediu menos movimento). Ao clicar, o vídeo abre grande, do início e com
 * som. Some quando a seção de inscrição entra na tela, para não cobrir o formulário.
 */
export function FloatingVideo({ previewSrc, src, poster }: Props) {
  const previewRef = useRef<HTMLVideoElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fullRef = useRef<HTMLVideoElement>(null);
  const [closed, setClosed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [nearForm, setNearForm] = useState(false);

  // Começa a rodar mudo, a não ser que a pessoa tenha pedido menos movimento no sistema.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) void previewRef.current?.play().catch(() => undefined);
  }, []);

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
    if (nearForm) previewRef.current?.pause();
  }, [nearForm]);

  function togglePreview() {
    const video = previewRef.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => undefined);
    else video.pause();
  }

  function openExpanded() {
    previewRef.current?.pause();
    dialogRef.current?.showModal();
    const full = fullRef.current;
    if (full) {
      full.currentTime = 0;
      full.muted = false;
      void full.play().catch(() => undefined);
    }
  }

  function onDialogClose() {
    fullRef.current?.pause();
  }

  const hidden = nearForm || closed;

  return (
    <>
      {!closed && (
        <aside
          aria-label="Vídeo de apresentação do ELEVE+"
          aria-hidden={nearForm || undefined}
          className={cn(
            "fixed right-4 bottom-5 z-40 hidden w-40 transition-opacity duration-300 lg:block xl:w-44",
            nearForm && "pointer-events-none opacity-0",
          )}
        >
          <div className="border-ink-border bg-ink relative aspect-[9/16] overflow-hidden rounded-2xl border shadow-2xl">
            <video
              ref={previewRef}
              src={previewSrc}
              poster={poster}
              muted
              loop
              playsInline
              preload="metadata"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={openExpanded}
              tabIndex={hidden ? -1 : 0}
              className="group absolute inset-0 flex items-center justify-center"
            >
              <span className="bg-ink/60 text-ink-foreground inline-flex size-12 items-center justify-center rounded-full opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <Maximize2 aria-hidden="true" className="size-5" />
              </span>
              <span className="sr-only">Assistir ao vídeo em tela grande, com som</span>
            </button>
            <button
              type="button"
              onClick={togglePreview}
              tabIndex={hidden ? -1 : 0}
              className="from-ink/80 text-ink-foreground absolute inset-x-0 bottom-0 flex min-h-11 items-center gap-2 bg-gradient-to-t to-transparent px-3 pt-8 pb-3 text-xs font-bold tracking-wider uppercase"
            >
              {playing ? (
                <Pause aria-hidden="true" className="size-4" />
              ) : (
                <Play aria-hidden="true" className="size-4" />
              )}
              <span>
                ELEVE<span className="text-brand">+</span>
              </span>
              <span className="sr-only">{playing ? "Pausar a prévia do vídeo" : "Reproduzir a prévia do vídeo"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                previewRef.current?.pause();
                setClosed(true);
              }}
              tabIndex={hidden ? -1 : 0}
              className="bg-ink/70 text-ink-foreground absolute top-1 right-1 inline-flex size-11 items-center justify-center rounded-full"
            >
              <X aria-hidden="true" className="size-4" />
              <span className="sr-only">Fechar vídeo</span>
            </button>
          </div>
        </aside>
      )}

      <dialog
        ref={dialogRef}
        onClose={onDialogClose}
        onClick={(e) => {
          // Clicar fora do vídeo (no fundo escurecido) fecha.
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
        aria-label="Vídeo de apresentação do ELEVE+"
        className="m-auto overflow-visible bg-transparent p-0 backdrop:bg-black/80 backdrop:backdrop-blur-sm"
      >
        <div className="relative">
          <video
            ref={fullRef}
            src={src}
            poster={poster}
            controls
            playsInline
            preload="none"
            className="aspect-[9/16] max-h-[90svh] w-auto rounded-2xl bg-black shadow-2xl"
          />
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="bg-ink text-ink-foreground border-ink-border absolute -top-3 -right-3 inline-flex size-11 items-center justify-center rounded-full border shadow-lg"
          >
            <X aria-hidden="true" className="size-5" />
            <span className="sr-only">Fechar vídeo</span>
          </button>
        </div>
      </dialog>
    </>
  );
}
