'use client';

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from 'react';

interface InlineTextRevealProps {
  children: string;
  className?: string;
  /** Delay in seconds before the animation starts, for staggering multiple instances */
  startDelay?: number;
}

/**
 * Applies the cinematic blur-reveal character animation to a string inline.
 * Characters are grouped by word so no single letter wraps to the next line.
 * Animation triggers once when the element scrolls into the viewport.
 */
export function InlineTextReveal({ children, className = "", startDelay = 0 }: InlineTextRevealProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          setAnimKey((k) => k + 1);
          observer.disconnect(); // play once only
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Split into words, track global char index for stagger delay
  const words = children.split(" ");
  let charIndex = 0;

  return (
    <>
      <span
        ref={ref}
        className={cn("inline", className)}
        aria-label={children}
      >
        {words.map((word, wi) => {
          const wordSpan = (
            <span key={`${animKey}-w${wi}`} className="inline-whitespace-nowrap">
              {word.split("").map((char) => {
                const idx = charIndex++;
                return (
                  <span
                    key={`${animKey}-c${idx}`}
                    className={visible ? "inline-reveal-char" : "inline-reveal-hidden"}
                    style={{ "--index": idx, "--start-delay": `${startDelay}s` } as React.CSSProperties}
                  >
                    {char}
                  </span>
                );
              })}
            </span>
          );
          // Add a regular space between words (not animated, so it wraps naturally between words)
          charIndex++; // account for the space in delay calculation
          return wi < words.length - 1 ? (
            <span key={`${animKey}-ws${wi}`}>
              {wordSpan}
              {" "}
            </span>
          ) : wordSpan;
        })}
      </span>

      <style jsx>{`
        .inline-whitespace-nowrap {
          display: inline-block;
          white-space: nowrap;
        }

        .inline-reveal-hidden {
          display: inline-block;
          opacity: 0;
          filter: blur(10px);
          transform: translateY(30%) scale(1.05);
        }

        .inline-reveal-char {
          display: inline-block;
          opacity: 0;
          filter: blur(10px);
          transform: translateY(30%) scale(1.05);
          animation: inline-reveal 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: calc(var(--start-delay, 0s) + 0.035s * var(--index));
          will-change: transform, opacity, filter;
        }

        @keyframes inline-reveal {
          0% {
            opacity: 0;
            filter: blur(10px);
            transform: translateY(30%) scale(1.05);
          }
          55% {
            opacity: 0.75;
            filter: blur(3px);
          }
          100% {
            opacity: 1;
            filter: blur(0);
            transform: translateY(0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .inline-reveal-char,
          .inline-reveal-hidden {
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}
