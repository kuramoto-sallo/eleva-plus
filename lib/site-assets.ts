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
 * Vídeo de apresentação do programa (em public/video/). `null` enquanto o arquivo não estiver no repositório:
 * o player flutuante só aparece quando houver vídeo.
 */
export const PROGRAM_VIDEO: { src: string; poster?: string } | null = null;
