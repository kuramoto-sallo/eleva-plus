import bannerImage from "@/assets/site/banner-crachas-fabrica.jpg";
import eleveLogo from "@/assets/site/eleve-logo.png";
import officeImage from "@/assets/site/escritorio-sallo-programa.jpg";
import factoryImage from "@/assets/site/fabrica-sallo.jpg";
import salloLogo from "@/assets/site/sallo-logo.png";

/** Imagens do site público. Para trocar uma imagem, substitua o arquivo em assets/site/ mantendo o nome. */
export const SITE_IMAGES = {
  eleveLogo,
  salloLogo,
  banner: bannerImage,
  office: officeImage,
  factory: factoryImage,
} as const;

/**
 * Vídeo de apresentação do programa (em public/video/). A prévia (360 px, sem áudio, ~2 MB) roda em loop na
 * miniatura; o vídeo completo (720 px, com áudio, ~10 MB) só é baixado quando a pessoa abre.
 * Use `null` para esconder o player flutuante.
 */
export const PROGRAM_VIDEO: { previewSrc: string; src: string; poster?: string } | null = {
  previewSrc: "/video/estagio-eleve-previa.mp4",
  src: "/video/estagio-eleve.mp4",
  poster: "/video/estagio-eleve-capa.jpg",
};
