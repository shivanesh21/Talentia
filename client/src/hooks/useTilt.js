import { useRef, useCallback } from "react";

/** 3D tilt-on-mousemove for glass cards. */
export function useTilt(max = 10) {
  const ref = useRef(null);
  const onMouseMove = useCallback(
    (e) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${px * max * 2}deg) rotateX(${-py * max * 2}deg) translateZ(8px)`;
    },
    [max]
  );
  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (el) el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg)";
  }, []);
  return { ref, onMouseMove, onMouseLeave };
}
