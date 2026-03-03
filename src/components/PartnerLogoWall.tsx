// src/components/PartnerLogoWall.tsx
type Logo = {
  src: string;
  alt: string;
  href?: string; // optional partner link
};

const LOGOS: Logo[] = [
  { src: "/logos/logo_01.png", alt: "Partner 1" },
  { src: "/logos/logo_02.png", alt: "Partner 2" },
  { src: "/logos/logo_03.png", alt: "Partner 3" },
  { src: "/logos/logo_04.png", alt: "Partner 4" },
  { src: "/logos/logo_05.png", alt: "Partner 5" },
  { src: "/logos/logo_06.png", alt: "Partner 6" },
  { src: "/logos/logo_07.jpg", alt: "Partner 7" },
  { src: "/logos/logo_08.png", alt: "Partner 8" },
  { src: "/logos/logo_09.png", alt: "Partner 9" },
  { src: "/logos/logo_10.jpg", alt: "Partner 10" },
];

export function PartnerLogoWall() {
  return (
    <section aria-label="GUARDIANS partners" className="logoWall">

      <ul className="logoGrid">
        {LOGOS.map((logo) => {
          const img = (
            <img
              src={logo.src}
              alt={logo.alt}
              loading="lazy"
              decoding="async"
            />
          );

          return (
            <li key={logo.src} className="logoTile">
              {logo.href ? (
                <a href={logo.href} target="_blank" rel="noreferrer">
                  {img}
                </a>
              ) : (
                img
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
