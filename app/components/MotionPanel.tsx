"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { motionEase, reducedMotion, subscribeMotionPreference } from "@/lib/motion";

/** One live panel, not duplicated exiting forms. Rapid changes interrupt safely. */
export default function MotionPanel({ children, transitionKey, className = "", direction = 1, animateContent = true }: {
  children: ReactNode;
  transitionKey: string | number;
  className?: string;
  direction?: number;
  animateContent?: boolean;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const size = useRef<{ height: number; width: number } | null>(null);
  const animations = useRef<Animation[]>([]);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const content = contentRef.current;
    if (!frame || !content) return;
    const target = content.getBoundingClientRect();
    const previous = size.current;
    const from = animations.current.length ? frame.getBoundingClientRect().height : previous?.height;
    animations.current.forEach(animation => animation.cancel());
    animations.current = [];
    delete frame.dataset.resizing;
    size.current = { height: target.height, width: target.width };
    if (!previous || reducedMotion() || typeof frame.animate !== "function" || Math.abs(previous.width - target.width) > 1) return;

    const active: Animation[] = [];
    if (from !== undefined && Math.abs(from - target.height) > 1) {
      frame.dataset.resizing = "true";
      active.push(frame.animate([{ height: `${from}px` }, { height: `${target.height}px` }], { duration: 440, easing: motionEase }));
    }
    if (animateContent) active.push(content.animate([
      { opacity: .35, transform: `translate3d(${direction * 12}px, 5px, 0)` },
      { opacity: 1, transform: "translate3d(0, 0, 0)" },
    ], { duration: 360, easing: motionEase }));
    animations.current = active;
    Promise.all(active.map(animation => animation.finished)).then(() => {
      if (animations.current !== active) return;
      animations.current = [];
      delete frame.dataset.resizing;
    }).catch(() => { /* interrupted by the next selection */ });
  }, [transitionKey, direction, animateContent]);

  useEffect(() => {
    const frame = frameRef.current;
    const content = contentRef.current;
    const stop = () => {
      animations.current.forEach(animation => animation.cancel());
      animations.current = [];
      if (frame) delete frame.dataset.resizing;
      if (content) { const rect = content.getBoundingClientRect(); size.current = { height: rect.height, width: rect.width }; }
    };
    const unsubscribe = subscribeMotionPreference(stop);
    // Width changes are reflows, not transitions. Do not animate a rotation or a resize.
    const observer = new ResizeObserver(() => {
      if (!content) return;
      const rect = content.getBoundingClientRect();
      if (size.current && Math.abs(rect.width - size.current.width) > 1) stop();
      else if (size.current?.height !== rect.height) {
        const previousHeight = size.current?.height;
        const from = animations.current.length ? frame?.getBoundingClientRect().height : previousHeight;
        animations.current.forEach(animation => animation.cancel());
        animations.current = [];
        if (frame) delete frame.dataset.resizing;
        size.current = { height: rect.height, width: rect.width };
        if (frame && from !== undefined && Math.abs(from - rect.height) > 1 && !reducedMotion() && typeof frame.animate === "function") {
          frame.dataset.resizing = "true";
          const animation = frame.animate([{ height: `${from}px` }, { height: `${rect.height}px` }], { duration: 360, easing: motionEase });
          const active = [animation];
          animations.current = active;
          animation.finished.then(() => {
            if (animations.current !== active) return;
            animations.current = [];
            delete frame.dataset.resizing;
          }).catch(() => {});
        }
      }
    });
    if (content) observer.observe(content);
    return () => { stop(); observer.disconnect(); unsubscribe(); };
  }, []);

  return <div className={`motion-panel ${className}`} ref={frameRef}><div ref={contentRef}>{children}</div></div>;
}
