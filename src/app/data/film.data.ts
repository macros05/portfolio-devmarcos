export interface Localized {
  en: string;
  es: string;
}

export interface Film {
  id: string;
  title: Localized;
  /** One line under the player. */
  caption: Localized;
  src: string;
  poster: string;
  /** Intrinsic frame size, used for aspect-ratio. */
  width: number;
  height: number;
}

/**
 * Hero reel. Muted, looping, lazy-loaded by the hero.
 * Swap `src` / `poster` here to change the film.
 */
export const HERO_REEL: Film = {
  id: 'kairova-launch',
  title: { en: 'Launch film', es: 'Film de lanzamiento' },
  caption: {
    en: 'Launch film for Kairova, my AI agency for real estate.',
    es: 'Film de lanzamiento de Kairova, mi agencia de IA para inmobiliarias.',
  },
  src: '/assets/films/kairova-launch.mp4',
  poster: '/assets/films/kairova-launch.webp',
  width: 16,
  height: 9,
};

/**
 * Videos section.
 * Adding a film is one object in this array — title, caption, src, poster, size.
 */
export const FILMS: Film[] = [
  {
    id: 'kairova-reel',
    title: { en: 'Launch reel', es: 'Reel de lanzamiento' },
    caption: {
      en: 'Vertical cut of the Kairova launch film.',
      es: 'Corte vertical del film de lanzamiento de Kairova.',
    },
    src: '/assets/films/kairova-reel.mp4',
    poster: '/assets/films/kairova-reel.webp',
    width: 9,
    height: 16,
  },
  {
    id: 'kairova-brand',
    title: { en: 'Brand film', es: 'Film de marca' },
    caption: {
      en: 'Brand film for Kairova, made in HyperFrames.',
      es: 'Film de marca para Kairova, hecho en HyperFrames.',
    },
    src: '/assets/films/kairova-brand.mp4',
    poster: '/assets/films/kairova-brand.webp',
    width: 16,
    height: 9,
  },
];
