"use client";

import Image from "next/image";
import { useId, useState, type CSSProperties, type ReactNode } from "react";
import type { ReferenceCategory, ReferenceItem } from "@/lib/references";
import styles from "./ReferencesSection.module.scss";

type ReferenceGalleryProps = {
  cards: ReferenceItem[];
  children: ReactNode;
  filterLabel: string;
  allLabel: string;
  categoryLabels: Record<ReferenceCategory, string>;
  resultLabel: string;
};

const CATEGORY_ORDER: ReferenceCategory[] = ["residential", "business"];

export function ReferenceGallery({
  cards,
  children,
  filterLabel,
  allLabel,
  categoryLabels,
  resultLabel,
}: ReferenceGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<"all" | ReferenceCategory>("all");
  const galleryId = useId();
  const availableCategories = CATEGORY_ORDER.filter((category) =>
    cards.some((card) => card.category === category),
  );
  const visibleCards =
    activeCategory === "all"
      ? cards
      : cards.filter((card) => card.category === activeCategory);

  return (
    <div className={styles.galleryShell}>
      <div className={styles.headingRow}>
        {children}

        {availableCategories.length > 1 ? (
          <div className={styles.filters} role="group" aria-label={filterLabel}>
            <button
              type="button"
              className={styles.filter}
              aria-pressed={activeCategory === "all"}
              aria-controls={galleryId}
              onClick={() => setActiveCategory("all")}
            >
              {allLabel}
            </button>
            {availableCategories.map((category) => (
              <button
                key={category}
                type="button"
                className={styles.filter}
                aria-pressed={activeCategory === category}
                aria-controls={galleryId}
                onClick={() => setActiveCategory(category)}
              >
                {categoryLabels[category]}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <ul id={galleryId} className={styles.grid} aria-label={filterLabel}>
        {visibleCards.map((project, index) => (
          <li
            key={`${activeCategory}:${project.id}`}
            className={styles.item}
            style={{ "--card-index": Math.min(index, 5) } as CSSProperties}
          >
            <article className={`${styles.card} ${project.image ? "" : styles.cardWithoutImage}`}>
              {project.image ? (
                <Image
                  src={project.image.src}
                  alt=""
                  width={project.image.width}
                  height={project.image.height}
                  loading={index < 3 ? "eager" : "lazy"}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className={styles.coverImg}
                />
              ) : null}

              <div className={styles.imageShade} aria-hidden="true" />

              <div className={styles.cardBody}>
                {project.location || project.category ? (
                  <p className={styles.cardMeta}>
                    {project.location ? <span>{project.location}</span> : null}
                    {project.location && project.category ? (
                      <span className={styles.metaDot} aria-hidden="true" />
                    ) : null}
                    {project.category ? <span>{categoryLabels[project.category]}</span> : null}
                  </p>
                ) : null}
                <h3 className={styles.cardTitle}>{project.title}</h3>
                {project.power ? <p className={styles.powerMetrics}>{project.power}</p> : null}
              </div>
            </article>
          </li>
        ))}
      </ul>

      <p className="sr-only" role="status" aria-live="polite">
        {visibleCards.length} {resultLabel}
      </p>
    </div>
  );
}
