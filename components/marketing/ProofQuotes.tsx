import styles from "./Proof.module.scss";

export type ProofQuote = {
  id: string;
  quote: string;
  name: string;
};

/* All four customer voices at once, as cards: two by two on a desktop — the
   quotes run to sixty words, too long for four narrow columns — and a swipe
   rail on phones. No star ratings: the customers gave words, not scores. The
   KVKK line explains why only a first name and initial are shown. */
export function ProofQuotes({
  quotes,
  eyebrow,
  title,
  label,
  privacyNote,
}: {
  quotes: ProofQuote[];
  eyebrow: string;
  title: string;
  label: string;
  privacyNote: string;
}) {
  return (
    <section className={styles.quotes} aria-labelledby="proof-quotes-title">
      <div className={styles.quotesHead}>
        <p className={styles.quotesEyebrow}>{eyebrow}</p>
        <h2 id="proof-quotes-title" className={styles.quotesTitle}>
          {title}
        </h2>
      </div>

      <ul className={styles.quoteGrid} aria-label={label}>
        {quotes.map((quote) => (
          <li key={quote.id} className={styles.quoteCell}>
            <figure className={styles.quoteCard}>
              <svg className={styles.quoteMark} viewBox="0 0 48 36" aria-hidden="true">
                <path d="M0 36V21.6C0 9.4 6.1 2.2 18.3 0l2.2 5.2C14 7 10.8 11 10.4 16.9H19V36H0Zm29 0V21.6C29 9.4 35.1 2.2 47.3 0l2.2 5.2C43 7 39.8 11 39.4 16.9H48V36H29Z" />
              </svg>
              <blockquote className={styles.quoteText}>
                <p>{quote.quote}</p>
              </blockquote>
              <figcaption className={styles.quoteAuthor}>
                <span className={styles.monogram} aria-hidden="true">
                  {quote.name.trim().charAt(0)}
                </span>
                <span className={styles.personName}>{quote.name}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <p className={styles.quotesPrivacy}>{privacyNote}</p>
    </section>
  );
}
