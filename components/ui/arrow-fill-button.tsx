// Built using Hyperiux Vault: https://vault.hyperiux.com
// Adaptado para o ELEVE+: tamanho compacto (cabeçalho), foco por teclado com o mesmo efeito do hover,
// botão visível antes da hidratação, tipagem sem `any` e sem as props `animationDuration`/`fillOnHover`,
// que o original aceitava mas não usava.

"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { ArrowRight } from "lucide-react";

const DEFAULT_HREF = "#";
const COMPACT_LAYOUT_BREAKPOINT = 1280;
const ANIMATION_DURATION_MS = 450;

const EASE = "ease-[cubic-bezier(0.785,0.135,0.15,0.86)]";

/** Classes que dependem do tamanho. `default` é o original (proporcional à tela); `compact` cabe no cabeçalho. */
const SIZES = {
  default: {
    root: "h-[4.2vw] px-[3vw] pr-[calc(var(--icon-circle)+var(--icon-right)+2vw)] text-[1.155vw] [--icon-circle:3.1vw] [--icon-right:0.55vw] max-[1025px]:h-[11vw] max-[1025px]:px-[5vw] max-[1025px]:pr-[calc(var(--icon-circle)+var(--icon-right)+4vw)] max-[1025px]:text-[3.15vw] max-[1025px]:[--icon-circle:8vw] max-[1025px]:[--icon-right:1.5vw] max-md:h-[15vw] max-md:px-[7vw] max-md:pr-[calc(var(--icon-circle)+var(--icon-right)+5vw)] max-md:text-[4.41vw] max-md:[--icon-circle:11vw] max-md:[--icon-right:2vw]",
    label:
      "px-[3vw] pr-[calc(var(--icon-circle)+var(--icon-right)+2vw)] max-[1025px]:px-[5vw] max-[1025px]:pr-[calc(var(--icon-circle)+var(--icon-right)+4vw)] max-md:px-[7vw] max-md:pr-[calc(var(--icon-circle)+var(--icon-right)+5vw)]",
    arrow: "size-[1.5vw] max-[1025px]:size-[4vw] max-md:size-[5vw]",
  },
  compact: {
    root: "h-11 px-5 pr-[calc(var(--icon-circle)+var(--icon-right)+0.75rem)] text-sm [--icon-circle:2.25rem] [--icon-right:0.25rem]",
    label: "px-5 pr-[calc(var(--icon-circle)+var(--icon-right)+0.75rem)]",
    arrow: "size-4",
  },
} as const;

export interface ArrowFillButtonOwnProps {
  btnText?: string;
  href?: string;
  className?: string;
  size?: keyof typeof SIZES;
  bgColor?: string;
  textColor?: string;
  fillBgColor?: string;
  fillTextColor?: string;
  hoverFillBgColor?: string;
  hoverFillTextColor?: string;
  arrowColor?: string;
  hoverArrowColor?: string;
}

export type ArrowFillButtonProps = ArrowFillButtonOwnProps &
  Omit<ComponentPropsWithoutRef<"a">, keyof ArrowFillButtonOwnProps>;

function ArrowFillButton({
  btnText = "Hover Me",
  href = DEFAULT_HREF,
  className = "",
  size = "default",

  bgColor = "#ff5f00",
  textColor = "#ffffff",

  fillBgColor = "#ffffff",
  fillTextColor = "#ff5f00",

  hoverFillBgColor = "#ffffff",
  hoverFillTextColor = "#ff5f00",

  arrowColor,
  hoverArrowColor,

  ...props
}: ArrowFillButtonProps) {
  const [isReady, setIsReady] = useState(false);
  const [isCompactLayout, setIsCompactLayout] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const releaseTimeoutRef = useRef<number | null>(null);
  const sizes = SIZES[size];

  const usesUtilityBackground =
    className.includes("bg-") || className.includes("from-") || className.includes("via-") || className.includes("to-");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setIsReady(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${COMPACT_LAYOUT_BREAKPOINT - 1}px)`);

    const syncCompactLayout = (matches: boolean) => {
      setIsCompactLayout(matches);
      if (!matches) setIsPressed(false);
    };
    const onChange = (event: MediaQueryListEvent) => syncCompactLayout(event.matches);

    syncCompactLayout(mediaQuery.matches);
    mediaQuery.addEventListener("change", onChange);

    return () => {
      mediaQuery.removeEventListener("change", onChange);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (releaseTimeoutRef.current) {
        window.clearTimeout(releaseTimeoutRef.current);
      }
    };
  }, []);

  const clearPressedState = () => {
    if (releaseTimeoutRef.current) {
      window.clearTimeout(releaseTimeoutRef.current);
    }

    releaseTimeoutRef.current = window.setTimeout(() => {
      setIsPressed(false);
      releaseTimeoutRef.current = null;
    }, ANIMATION_DURATION_MS);
  };

  const handlePointerDown = (event: PointerEvent<HTMLAnchorElement>) => {
    props.onPointerDown?.(event);

    if (!isCompactLayout || event.pointerType === "mouse") {
      return;
    }

    if (releaseTimeoutRef.current) {
      window.clearTimeout(releaseTimeoutRef.current);
      releaseTimeoutRef.current = null;
    }

    setIsPressed(true);
  };

  const handlePointerUp = (event: PointerEvent<HTMLAnchorElement>) => {
    props.onPointerUp?.(event);

    if (!isCompactLayout || event.pointerType === "mouse") {
      return;
    }

    clearPressedState();
  };

  const handlePointerCancel = (event: PointerEvent<HTMLAnchorElement>) => {
    props.onPointerCancel?.(event);

    if (!isCompactLayout || event.pointerType === "mouse") {
      return;
    }

    clearPressedState();
  };

  return (
    <a
      href={href}
      {...props}
      data-pressed={isPressed ? "true" : "false"}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      className={`group focus-visible:ring-ring focus-visible:ring-offset-background relative inline-flex w-fit max-w-none min-w-fit cursor-pointer items-center justify-center overflow-hidden rounded-full border border-(--btn-bg) leading-none font-medium whitespace-nowrap [--circle-inset-y:calc((100%-var(--icon-circle))/2)] [text-rendering:geometricPrecision] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${sizes.root} ${
        usesUtilityBackground ? "" : "bg-(--btn-bg)"
      } text-(--btn-text) ${className}`}
      style={
        {
          "--btn-bg": bgColor,
          "--btn-text": textColor,
          "--btn-fill-bg": fillBgColor,
          "--btn-fill-text": fillTextColor,
          "--btn-fill-bg-hover": hoverFillBgColor,
          "--btn-fill-text-hover": hoverFillTextColor,
          "--btn-arrow": arrowColor || fillTextColor,
          "--btn-arrow-hover": hoverArrowColor || hoverFillTextColor,
        } as CSSProperties & Record<string, string | number>
      }
    >
      <span className="relative z-1 pb-px">{btnText}</span>

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-[var(--circle-inset-y)_var(--icon-right)_var(--circle-inset-y)_calc(100%-var(--icon-right)-var(--icon-circle))] z-2 rounded-full bg-(--btn-fill-bg) ${
          isReady
            ? `transition-all duration-450 ${EASE} group-hover:inset-0 group-hover:bg-(--btn-fill-bg-hover) group-focus-visible:inset-0 group-focus-visible:bg-(--btn-fill-bg-hover) group-data-[pressed=true]:inset-0 group-data-[pressed=true]:bg-(--btn-fill-bg-hover) motion-reduce:transition-none`
            : ""
        }`}
      />

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 z-2 flex items-center text-(--btn-fill-text) [clip-path:inset(var(--circle-inset-y)_var(--icon-right)_var(--circle-inset-y)_calc(100%-var(--icon-right)-var(--icon-circle)))] ${sizes.label} ${
          isReady
            ? `transition-all duration-450 ${EASE} group-hover:text-(--btn-fill-text-hover) group-hover:[clip-path:inset(0_0_0_0)] group-focus-visible:text-(--btn-fill-text-hover) group-focus-visible:[clip-path:inset(0_0_0_0)] group-data-[pressed=true]:text-(--btn-fill-text-hover) group-data-[pressed=true]:[clip-path:inset(0_0_0_0)] motion-reduce:transition-none`
            : ""
        }`}
      >
        <span className="relative z-1 pb-px whitespace-nowrap">{btnText}</span>
      </div>

      <span
        className={`pointer-events-none absolute top-1/2 right-[var(--icon-right)] z-3 inline-flex h-[var(--icon-circle)] w-[var(--icon-circle)] shrink-0 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full bg-(--btn-fill-bg) text-(--btn-arrow) ${
          isReady
            ? `transition-colors duration-450 ${EASE} group-hover:bg-(--btn-fill-bg-hover) group-hover:text-(--btn-arrow-hover) group-focus-visible:bg-(--btn-fill-bg-hover) group-focus-visible:text-(--btn-arrow-hover) group-data-[pressed=true]:bg-(--btn-fill-bg-hover) group-data-[pressed=true]:text-(--btn-arrow-hover) motion-reduce:transition-none`
            : ""
        }`}
        style={{
          WebkitMaskImage: "-webkit-radial-gradient(white, black)",
          maskImage: "radial-gradient(white, black)",
        }}
        aria-hidden="true"
      >
        <ArrowRight
          className={`absolute top-1/2 left-1/2 ${sizes.arrow} origin-center translate-x-[-170%] -translate-y-1/2 scale-0 text-current ${
            isReady
              ? `transition-transform duration-450 ${EASE} group-hover:-translate-x-1/2 group-hover:-translate-y-1/2 group-hover:scale-100 group-focus-visible:-translate-x-1/2 group-focus-visible:scale-100 group-data-[pressed=true]:-translate-x-1/2 group-data-[pressed=true]:-translate-y-1/2 group-data-[pressed=true]:scale-100 motion-reduce:transition-none`
              : ""
          }`}
          strokeWidth={1.8}
        />

        <ArrowRight
          className={`absolute top-1/2 left-1/2 ${sizes.arrow} origin-center -translate-x-1/2 -translate-y-1/2 text-current ${
            isReady
              ? `transition-transform duration-[450ms] ${EASE} group-hover:translate-x-[70%] group-hover:-translate-y-1/2 group-hover:scale-0 group-focus-visible:translate-x-[70%] group-focus-visible:scale-0 group-data-[pressed=true]:translate-x-[70%] group-data-[pressed=true]:-translate-y-1/2 group-data-[pressed=true]:scale-0 motion-reduce:transition-none`
              : ""
          }`}
          strokeWidth={1.8}
        />
      </span>
    </a>
  );
}

export default ArrowFillButton;
