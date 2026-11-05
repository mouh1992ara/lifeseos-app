"use client";

/**
 * Hero headline with a word-by-word reveal.
 *
 * The words are real DOM text (crawlers and no-JS visitors get the full
 * headline); only the entrance is staged, via a per-word `--i` index that the
 * CSS turns into an animation delay.
 *
 * The gradient line stays unsplit on purpose: `background-clip: text` does not
 * survive transforms on descendants, so splitting it would drop the gradient.
 */
export default function HeroTitle({
  line1,
  accent,
  className = "",
}: {
  line1: string;
  accent: string;
  className?: string;
}) {
  // Space-delimited languages split into words; scripts without spaces (zh)
  // split per character so the reveal still reads as a cascade.
  const words = /\s/.test(line1)
    ? line1.split(/\s+/).filter(Boolean)
    : Array.from(line1).filter((ch) => ch.trim().length > 0);
  let i = 0;

  return (
    <h1 data-split="" className={className}>
      <span className="block">
        {words.map((w) => {
          const index = i++;
          return (
            <span key={`${w}-${index}`}>
              <span className="hero-word" style={{ ["--i" as string]: index }}>
                {w}
              </span>
              {index < words.length - 1 ? " " : null}
            </span>
          );
        })}
      </span>

      <span className="hero-accent mt-2 block bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
        {accent}
      </span>
    </h1>
  );
}
