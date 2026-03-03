import { useEffect, useState } from "react";
import { DEFAULT_LOGOS, parsePartnerLogos, type Logo } from "./partnerLogos";

export function PartnerLogoWall() {
  const [logos, setLogos] = useState<Logo[]>(DEFAULT_LOGOS);

  useEffect(() => {
    let cancelled = false;

    const loadLogos = async (): Promise<void> => {
      try {
        const response = await fetch("/partners.json", {
          headers: {
            Accept: "application/json"
          }
        });

        if (!response.ok) {
          return;
        }

        const parsed = parsePartnerLogos(await response.json());
        if (!cancelled) {
          setLogos(parsed);
        }
      } catch {
        // Keep default logos when runtime file is unavailable or invalid.
      }
    };

    void loadLogos();

    return () => {
      cancelled = true;
    };
  }, []);

  if (logos.length === 0) {
    return null;
  }

  return (
    <footer>
      <section aria-label="Partner logos" className="logoWall">
        <ul className="logoGrid">
          {logos.map((logo) => {
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
    </footer>
  );
}
