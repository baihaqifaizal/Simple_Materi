import type { CSSProperties, ReactElement, ReactNode } from "react";

/** Fade + geser ringan saat elemen masuk; hormat prefers-reduced-motion via CSS. */
export function FadeIn({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  const style: CSSProperties = delay > 0 ? { animationDelay: `${delay}s` } : {};
  return (
    <div className="anim-fadein" style={style}>
      {children}
    </div>
  );
}

/** Daftar kartu: delay bertahap antar item (maks 0.4 s). */
export function Stagger({ children }: { children: ReactNode }) {
  const items = Array.isArray(children) ? children : [children];
  return (
    <>
      {items.map((c, i) => (
        <FadeIn
          key={(c as ReactElement)?.key ?? i}
          delay={Math.min(i * 0.04, 0.4)}
        >
          {c}
        </FadeIn>
      ))}
    </>
  );
}
