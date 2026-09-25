"use client";

import { useEffect, useId, useRef, useState } from "react";
import { reducedMotion, subscribeMotionPreference } from "@/lib/motion";

const sectors = Array.from({ length: 8 }, (_, index) => index);
const cycleDuration = 4600;

/** A tiny, opt-in cleaning story. SVG clips keep every tool inside its own ray. */
export default function CleaningSpark() {
  const clipId = `cleaning-sector-${useId().replace(/:/g, "")}`;
  const [cycle, setCycle] = useState(0);
  const [playing, setPlaying] = useState(false);
  const busy = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stop = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
      busy.current = false;
      setPlaying(false);
    };
    const unsubscribe = subscribeMotionPreference(stop);
    return () => { if (timer.current) clearTimeout(timer.current); unsubscribe(); };
  }, []);

  function play() {
    if (busy.current || reducedMotion()) return;
    busy.current = true;
    setCycle(value => value + 1);
    setPlaying(true);
    timer.current = setTimeout(() => {
      busy.current = false;
      timer.current = null;
      setPlaying(false);
    }, cycleDuration);
  }

  return (
    <button
      className="cleaning-spark"
      type="button"
      aria-label="Показать мини-анимацию уборки"
      title="Пшик. Протёрли. Чисто."
      data-playing={playing}
      onPointerEnter={event => { if (event.pointerType === "mouse") play(); }}
      onFocus={play}
      onClick={play}
    >
      <svg key={cycle} viewBox="0 0 200 200" fill="none" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            <path d="M100 97 69.5 25.5 130.5 25.5Z" />
          </clipPath>
        </defs>
        <g className="spark-rotor">
          {sectors.map(index => (
            <g key={index} transform={`rotate(${22.5 + index * 45} 100 100)`}>
              <g clipPath={`url(#${clipId})`} className={`spark-sector spark-sector-${index}`}>
                <path className="spark-wash" d="M100 97 69.5 25.5 130.5 25.5Z" fill="#e9f1ff" />
                <g className="spark-dust" fill="#b3bfdd">
                  <circle cx="91" cy="54" r="2.1" /><circle cx="106" cy="66" r="1.8" />
                  <circle cx="98" cy="76" r="1.3" /><path d="m108 43 5 3m-21 18 5 2" stroke="#b3bfdd" strokeWidth="2" strokeLinecap="round" />
                </g>
                <g className="spark-spray">
                  <path d="m91 41-5 7v18q0 3 3 3h11q3 0 3-3V49l-6-8" fill="#7793ff" stroke="#284bff" strokeWidth="1.4" />
                  <path d="M90 37h13v5H90z" fill="#284bff" />
                  <path d="M98 37h9v4h-7m-4 4-3 5" stroke="#284bff" strokeWidth="2" strokeLinecap="round" />
                  <rect x="89" y="54" width="11" height="8" rx="2" fill="#fff" />
                  <path d="m94.5 56-2 3h4z" fill="#9ab0ff" />
                </g>
                <g className="spark-mist" stroke="#7599ff" strokeWidth="1.4" strokeLinecap="round">
                  <path d="m109 39 12-4m-12 6 15 1m-15 1 11 7" />
                  <circle cx="117" cy="35" r="1.7" fill="#bbd9ff" stroke="none" />
                  <circle cx="123" cy="43" r="1.3" fill="#bbd9ff" stroke="none" />
                  <circle cx="115" cy="49" r="1.7" fill="#bbd9ff" stroke="none" />
                </g>
                <g className="spark-brush">
                  <path d="M95 38v12" stroke="#284bff" strokeWidth="5" strokeLinecap="round" />
                  <rect x="83" y="48" width="24" height="8" rx="4" fill="#284bff" />
                  <path d="M85 55v7m4-7v8m4-8v8m4-8v8m4-8v8m4-8v7" stroke="#8da9ff" strokeWidth="2.4" strokeLinecap="round" />
                </g>
                <g className="spark-cloth">
                  <path d="m83 47 24-5 8 17-26 7-9-10z" fill="#e4f179" stroke="#a8bb53" strokeWidth="1.1" strokeLinejoin="round" />
                  <path d="m88 51 20-4m-18 9 20-4m-17 9 19-5" stroke="#b8ce5c" strokeWidth="1" strokeLinecap="round" />
                  <path d="m107 42 2 12 6 5" fill="#f3f8b7" stroke="#b8ce5c" strokeWidth="1" strokeLinejoin="round" />
                </g>
                <g className="spark-glint" stroke="#284bff" strokeLinecap="round">
                  <path d="M99 45v14m-7-7h14" strokeWidth="1.6" />
                  <path d="M112 34v7m-3.5-3.5h7" strokeWidth="1.2" />
                  <circle cx="93" cy="70" r="1.4" fill="#284bff" stroke="none" />
                </g>
              </g>
            </g>
          ))}
          <g className="spark-rays" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            {sectors.map(index => <path key={index} d="M100 100V18" transform={`rotate(${index * 45} 100 100)`} />)}
          </g>
          <circle cx="100" cy="100" r="2" fill="currentColor" />
        </g>
      </svg>
      <span className="spark-touch-hint" aria-hidden="true">Нажмите</span>
    </button>
  );
}
