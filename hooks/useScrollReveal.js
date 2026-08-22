import { useEffect, useRef, useState } from "react";

/**
 * useScrollReveal — attaches an IntersectionObserver to the ref element.
 * Returns { ref, isVisible } so components can conditionally apply
 * reveal animations without pulling in a heavy animation library.
 *
 * @param {Object} options
 * @param {number} options.threshold - Visibility threshold (0-1). Default 0.15
 * @param {string} options.rootMargin - Observer rootMargin. Default "-40px 0px"
 * @param {boolean} options.triggerOnce - Only trigger once. Default true
 */
export function useScrollReveal({
  threshold = 0.15,
  rootMargin = "-40px 0px",
  triggerOnce = true,
} = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
}
