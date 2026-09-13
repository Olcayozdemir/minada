"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "@/i18n/navigation";
import { IconArrowRight, IconSolar } from "@/components/ui/icons";
import styles from "./Proof.module.scss";

export type ProofPhoto = {
  id: string;
  title: string;
  location: string;
  capacity: string;
  /** The project type or short summary supplied with the record. */
  kind: string;
  src: string;
  w: number;
  h: number;
};

type ProofGridProps = {
  photos: ProofPhoto[];
  label: string;
  eyebrow: string;
  title: string;
  allLabel: string;
  previousLabel: string;
  nextLabel: string;
  capacityLabel: string;
  locationLabel: string;
};

/* The reference uses one lead story and two compact previews rather than an
   even gallery. The arrows rotate the dataset through those three roles. On
   phones all records remain available in the previously approved two-row
   swipe rail; the desktop-only arrows are stood down there. */
export function ProofGrid({
  photos,
  label,
  eyebrow,
  title,
  allLabel,
  previousLabel,
  nextLabel,
  capacityLabel,
  locationLabel,
}: ProofGridProps) {
  const [active, setActive] = useState(0);
  const [isMobileRail, setIsMobileRail] = useState(false);
  const ordered = photos.map((_, index) => photos[(active + index) % photos.length]);
  const canCycle = photos.length > 1;

  useEffect(() => {
    const media = window.matchMedia("(max-width: 700px)");
    const update = () => setIsMobileRail(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const step = (direction: -1 | 1) => {
    setActive((current) => (current + direction + photos.length) % photos.length);
  };

  return (
    <div className={styles.projects}>
      <div className={styles.projectHead}>
        <div className={styles.projectHeading}>
          <p className={styles.projectEyebrow}>{eyebrow}</p>
          <h2 className={styles.projectTitle}>{title}</h2>
        </div>

        <div className={styles.projectAside}>
          <div className={styles.projectActions}>
            <Link href="/projects" className={styles.all}>
              {allLabel} <IconArrowRight size={16} />
            </Link>

            {canCycle ? (
              <div className={styles.projectNav} role="group" aria-label={label}>
                <button
                  type="button"
                  className={`${styles.roundButton} ${styles.previous}`}
                  aria-label={previousLabel}
                  onClick={() => step(-1)}
                >
                  <IconArrowRight size={17} />
                </button>
                <button
                  type="button"
                  className={styles.roundButton}
                  aria-label={nextLabel}
                  onClick={() => step(1)}
                >
                  <IconArrowRight size={17} />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <ul
        key={ordered[0]?.id}
        className={styles.projectGrid}
        aria-label={label}
        tabIndex={isMobileRail ? 0 : -1}
      >
        {ordered.map((project, index) => (
          <li
            key={project.id}
            className={`${styles.projectCell} ${
              index === 0 ? styles.featuredCell : index > 2 ? styles.offstageCell : ""
            }`}
            style={{ "--d": Math.min(index, 2) } as CSSProperties}
          >
            <article
              className={`${styles.projectCard} ${index === 0 ? styles.featuredCard : styles.previewCard}`}
            >
              <div className={styles.projectImage}>
                <Image
                  src={project.src}
                  alt=""
                  width={project.w}
                  height={project.h}
                  sizes={
                    index === 0
                      ? "(max-width: 700px) 92vw, (max-width: 900px) 100vw, 50vw"
                      : "(max-width: 700px) 46vw, (max-width: 900px) 50vw, 25vw"
                  }
                  className={styles.projectPhoto}
                />
              </div>

              {index === 0 ? (
                <div className={styles.featuredReadout}>
                  <div className={styles.featuredIdentity}>
                    {project.kind ? <p>{project.kind}</p> : null}
                    <h3>{project.title}</h3>
                  </div>

                  <div className={styles.featuredFacts}>
                    {project.capacity ? (
                      <div className={styles.featuredFact}>
                        <IconSolar size={23} />
                        <div>
                          <span className={styles.factValue}>{project.capacity}</span>
                          <span className={styles.factLabel}>{capacityLabel}</span>
                        </div>
                      </div>
                    ) : null}
                    {project.location ? (
                      <div className={styles.featuredPlace}>
                        <span className={styles.factValue}>{project.location}</span>
                        <span className={styles.factLabel}>{locationLabel}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className={styles.previewBody}>
                  {project.kind ? <p className={styles.previewKind}>{project.kind}</p> : null}
                  <h3>{project.title}</h3>
                  <div className={styles.previewMeta}>
                    {project.location ? <span>{project.location}</span> : null}
                    {project.capacity ? <strong>{project.capacity}</strong> : null}
                  </div>
                </div>
              )}
            </article>
          </li>
        ))}
        <li className={styles.mobileAllCell}>
          <Link href="/projects" className={styles.mobileAllCard}>
            <span>{allLabel}</span>
            <IconArrowRight size={18} />
          </Link>
        </li>
      </ul>
      <p className="sr-only" aria-live="polite">
        {active + 1} / {photos.length}: {ordered[0]?.title}
      </p>
    </div>
  );
}
