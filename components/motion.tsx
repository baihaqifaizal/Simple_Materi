"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactElement, ReactNode } from "react";

/** Fade + geser ringan saat elemen masuk; hormat prefers-reduced-motion. */
export function FadeIn({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  const ringkas = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: ringkas ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: ringkas ? 0 : 0.5,
        delay: ringkas ? 0 : delay,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}

/** Daftar kartu: delay bertahap antar item (maks 0.4 s). */
export function Stagger({ children }: { children: ReactNode }) {
  const ringkas = useReducedMotion();
  const items = Array.isArray(children) ? children : [children];
  return (
    <>
      {items.map((c, i) => (
        <FadeIn
          key={(c as ReactElement)?.key ?? i}
          delay={ringkas ? 0 : Math.min(i * 0.04, 0.4)}
        >
          {c}
        </FadeIn>
      ))}
    </>
  );
}
