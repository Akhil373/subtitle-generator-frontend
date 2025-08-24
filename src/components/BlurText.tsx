import { type EasingFunction } from "motion-utils";
import { motion, type Transition } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

type BlurTextProps = {
  text?: string;
  delay?: number;
  className?: string;
  animateBy?: "words" | "letters" | "lines";
  direction?: "top" | "bottom";
  threshold?: number;
  rootMargin?: string;
  animationFrom?: Record<string, string | number>;
  animationTo?: Array<Record<string, string | number>>;
  easing?: EasingFunction;
  onAnimationComplete?: () => void;
  stepDuration?: number;
};

const buildKeyframes = (
  from: Record<string, string | number>,
  steps: Array<Record<string, string | number>>
): Record<string, Array<string | number>> => {
  const keys = new Set<string>([
    ...Object.keys(from),
    ...steps.flatMap((s) => Object.keys(s)),
  ]);
  const keyframes: Record<string, Array<string | number>> = {};
  keys.forEach((k) => {
    keyframes[k] = [from[k], ...steps.map((s) => s[k])];
  });
  return keyframes;
};

const BlurText: React.FC<BlurTextProps> = ({
  text = "",
  delay = 200,
  className = "",
  animateBy = "words",
  direction = "top",
  threshold = 0.1,
  rootMargin = "0px",
  animationFrom,
  animationTo,
  easing = (t) => t,
  onAnimationComplete,
  stepDuration = 0.4,
}) => {
  // Split text based on animation type
  const elements = useMemo(() => {
    if (animateBy === "lines") {
      // Split by lines first, then by words within each line
      return text.split("\n").map((line, lineIndex) => ({
        type: "line" as const,
        lineIndex,
        words: line.split(" ").map((word, wordIndex) => ({
          type: "word" as const,
          content: word,
          wordIndex,
        })),
      }));
    } else if (animateBy === "words") {
      // Split by words, preserving line breaks
      const parts = text.split(/(\n)/);
      return parts.map((part, index) => ({
        type: part === "\n" ? ("linebreak" as const) : ("word" as const),
        content: part,
        index,
      }));
    } else {
      // Split by letters
      return text.split("").map((char, index) => ({
        type: "letter" as const,
        content: char,
        index,
      }));
    }
  }, [text, animateBy]);

  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current as Element);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const defaultFrom = useMemo(
    () =>
      direction === "top"
        ? { filter: "blur(10px)", opacity: 0, y: -50 }
        : { filter: "blur(10px)", opacity: 0, y: 50 },
    [direction]
  );

  const defaultTo = useMemo(
    () => [
      {
        filter: "blur(5px)",
        opacity: 0.5,
        y: direction === "top" ? 5 : -5,
      },
      { filter: "blur(0px)", opacity: 1, y: 0 },
    ],
    [direction]
  );

  const fromSnapshot = animationFrom ?? defaultFrom;
  const toSnapshots = animationTo ?? defaultTo;
  const stepCount = toSnapshots.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = Array.from({ length: stepCount }, (_, i) =>
    stepCount === 1 ? 0 : i / (stepCount - 1)
  );

  // Render based on animation type
  if (animateBy === "lines") {
    return (
      <p ref={ref} className={`blur-text ${className} whitespace-pre-line`}>
        {elements.map((line: any, lineIndex: number) => (
          <span key={lineIndex} style={{ display: "block" }}>
            {line.words.map((wordObj: any, wordIndex: number) => {
              const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots);
              const spanTransition: Transition = {
                duration: totalDuration,
                times,
                delay: (lineIndex * delay) / 1000,
                ease: easing,
              };

              return (
                <motion.span
                  key={`${lineIndex}-${wordIndex}`}
                  initial={fromSnapshot}
                  animate={inView ? animateKeyframes : fromSnapshot}
                  transition={spanTransition}
                  onAnimationComplete={
                    lineIndex === elements.length - 1 && 
                    wordIndex === line.words.length - 1
                      ? onAnimationComplete
                      : undefined
                  }
                  style={{
                    display: "inline-block",
                    willChange: "transform, filter, opacity",
                  }}
                >
                  {wordObj.content === "" ? "\u00A0" : wordObj.content}
                  {wordIndex < line.words.length - 1 && "\u00A0"}
                </motion.span>
              );
            })}
          </span>
        ))}
      </p>
    );
  }

  const flatElements = animateBy === "words" 
    ? text.split(/(\n| )/).filter(part => part !== "")
    : text.split("");

  return (
    <p ref={ref} className={`blur-text ${className} ${animateBy === "words" ? "whitespace-pre-line" : "flex flex-wrap"}`}>
      {flatElements.map((segment, index) => {
        const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots);
        const spanTransition: Transition = {
          duration: totalDuration,
          times,
          delay: (index * delay) / 1000,
          ease: easing,
        };

        return (
          <motion.span
            key={index}
            initial={fromSnapshot}
            animate={inView ? animateKeyframes : fromSnapshot}
            transition={spanTransition}
            onAnimationComplete={
              index === flatElements.length - 1 ? onAnimationComplete : undefined
            }
            style={{
              display: segment === "\n" ? "block" : "inline-block",
              willChange: "transform, filter, opacity",
              width: segment === "\n" ? "100%" : "auto",
              height: segment === "\n" ? "0" : "auto",
            }}
          >
            {segment === " " ? "\u00A0" : segment === "\n" ? "" : segment}
          </motion.span>
        );
      })}
    </p>
  );
};

export default BlurText;