import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, useAnimationFrame } from "framer-motion";

interface Logo3DProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  interactive?: boolean;
  showGlow?: boolean;
}

export const Logo3D: React.FC<Logo3DProps> = ({
  size = "md",
  className = "",
  interactive = true,
  showGlow = true
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [rotation, setRotation] = useState({ x: 14, y: 35 });
  const isDragging = useRef(false);
  const prevMousePos = useRef({ x: 0, y: 0 });
  const dragDistance = useRef(0);
  const spinBoost = useRef(0);
  const idleResumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dimensions mapping
  const sizeMap = {
    sm: { container: "w-8 h-8", box: 26, text: "text-[9px]", depth: 10, ring: "w-10 h-10 -inset-1" },
    md: { container: "w-10 h-10", box: 34, text: "text-[11px]", depth: 14, ring: "w-14 h-14 -inset-2" },
    lg: { container: "w-16 h-16", box: 54, text: "text-base", depth: 22, ring: "w-20 h-20 -inset-2" },
    xl: { container: "w-28 h-28", box: 92, text: "text-2xl", depth: 36, ring: "w-36 h-36 -inset-4" }
  };

  const currentSize = sizeMap[size];
  const halfDepth = currentSize.depth;
  const boxDimension = currentSize.box;

  // Continuous auto-rotation with frame loop that NEVER gets stuck
  useAnimationFrame((_, delta) => {
    // Smoothly decay any click spin-boost
    if (spinBoost.current > 0) {
      spinBoost.current = Math.max(0, spinBoost.current - delta * 0.0003);
    }

    // Only pause rotation while actively dragging; otherwise rotate continuously!
    if (!isDragging.current) {
      const baseSpeed = isHovered ? 0.09 : 0.05;
      const speed = baseSpeed + spinBoost.current;
      setRotation((prev) => ({
        x: Math.sin(Date.now() / 1600) * 10 + 12,
        y: (prev.y + delta * speed) % 360
      }));
    }
  });

  // Global mouse / touch release handlers so it can NEVER freeze on click or window blur
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        // Resume rotation immediately
        if (idleResumeTimer.current) clearTimeout(idleResumeTimer.current);
      }
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - prevMousePos.current.x;
      const dy = e.clientY - prevMousePos.current.y;
      prevMousePos.current = { x: e.clientX, y: e.clientY };
      dragDistance.current += Math.abs(dx) + Math.abs(dy);

      setRotation((prev) => ({
        x: Math.max(-55, Math.min(55, prev.x - dy * 0.5)),
        y: (prev.y + dx * 0.6) % 360
      }));

      // Reset auto-resume watchdog
      if (idleResumeTimer.current) clearTimeout(idleResumeTimer.current);
      idleResumeTimer.current = setTimeout(() => {
        isDragging.current = false;
      }, 1200);
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("blur", handleGlobalMouseUp);

    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("blur", handleGlobalMouseUp);
      if (idleResumeTimer.current) clearTimeout(idleResumeTimer.current);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!interactive) return;
    isDragging.current = true;
    dragDistance.current = 0;
    prevMousePos.current = { x: e.clientX, y: e.clientY };

    // Watchdog safety: auto-resume rotation after 1.5s even if mouseup was missed
    if (idleResumeTimer.current) clearTimeout(idleResumeTimer.current);
    idleResumeTimer.current = setTimeout(() => {
      isDragging.current = false;
    }, 1500);
  };

  const handleClick = (e: React.MouseEvent) => {
    // If it was just a click (not a long drag), boost rotation spin!
    if (dragDistance.current < 6) {
      isDragging.current = false;
      // Trigger a satisfying 360-degree high-speed spin burst!
      spinBoost.current = 0.55;
    }
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${currentSize.container} ${className}`}
      style={{ perspective: "1000px" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        isDragging.current = false;
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      {/* Background Ambient Glow */}
      {showGlow && (
        <div
          className="absolute inset-0 rounded-full blur-xl pointer-events-none transition-all duration-500"
          style={{
            background: isHovered
              ? "radial-gradient(circle, rgba(0, 229, 153, 0.65) 0%, rgba(0, 168, 120, 0.25) 60%, transparent 80%)"
              : "radial-gradient(circle, rgba(0, 229, 153, 0.35) 0%, rgba(0, 168, 120, 0.1) 60%, transparent 80%)",
            transform: "scale(1.5)"
          }}
        />
      )}

      {/* 3D Model Root Container */}
      <motion.div
        className="relative cursor-pointer active:cursor-grabbing"
        style={{
          width: boxDimension,
          height: boxDimension,
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
        }}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 350, damping: 22 }}
      >
        {/* --- FRONT FACE: Glowing Holographic Brand Badge --- */}
        <div
          className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#00A878] via-[#00E599] to-[#80ffdb] flex items-center justify-center text-[#07111F] border border-white/50 shadow-[0_0_20px_rgba(0,229,153,0.6)]"
          style={{
            transform: `translateZ(${halfDepth}px)`,
            backfaceVisibility: "visible"
          }}
        >
          {/* Inner Fintech Lightning Bolt Icon */}
          <svg className="w-3/5 h-3/5 fill-current drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]" viewBox="0 0 24 24">
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
          </svg>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-white/30 pointer-events-none" />
        </div>

        {/* --- BACK FACE: High-Contrast GST Node Text --- */}
        <div
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#071912] via-[#004d34] to-[#008f5d] flex items-center justify-center text-white border border-[#00E599]/50 shadow-[0_0_20px_rgba(0,229,153,0.4)]"
          style={{
            transform: `rotateY(180deg) translateZ(${halfDepth}px)`,
            backfaceVisibility: "visible"
          }}
        >
          <span className={`font-black font-mono tracking-tighter ${currentSize.text} text-[#00E599] drop-shadow-[0_0_10px_rgba(0,229,153,0.9)]`}>
            GST
          </span>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 to-black/50 pointer-events-none" />
        </div>

        {/* --- RIGHT FACE --- */}
        <div
          className="absolute rounded-xl bg-gradient-to-r from-[#00A878] to-[#005f40] border border-emerald-300/40 shadow-inner flex items-center justify-center text-white"
          style={{
            width: halfDepth * 2,
            height: boxDimension,
            left: boxDimension / 2 - halfDepth,
            top: 0,
            transform: `rotateY(90deg) translateZ(${boxDimension / 2}px)`,
            backfaceVisibility: "visible"
          }}
        >
          <div className="w-1 h-3/4 rounded-full bg-white/50 blur-[0.5px]" />
        </div>

        {/* --- LEFT FACE --- */}
        <div
          className="absolute rounded-xl bg-gradient-to-l from-[#00A878] to-[#003826] border border-emerald-300/40 shadow-inner flex items-center justify-center text-white"
          style={{
            width: halfDepth * 2,
            height: boxDimension,
            left: boxDimension / 2 - halfDepth,
            top: 0,
            transform: `rotateY(-90deg) translateZ(${boxDimension / 2}px)`,
            backfaceVisibility: "visible"
          }}
        >
          <div className="w-1 h-3/4 rounded-full bg-emerald-300/50 blur-[0.5px]" />
        </div>

        {/* --- TOP FACE --- */}
        <div
          className="absolute rounded-xl bg-gradient-to-b from-[#80ffdb] to-[#00E599] border border-white/70 shadow-lg flex items-center justify-center"
          style={{
            width: boxDimension,
            height: halfDepth * 2,
            left: 0,
            top: boxDimension / 2 - halfDepth,
            transform: `rotateX(90deg) translateZ(${boxDimension / 2}px)`,
            backfaceVisibility: "visible"
          }}
        >
          <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
        </div>

        {/* --- BOTTOM FACE --- */}
        <div
          className="absolute rounded-xl bg-gradient-to-t from-[#00281b] to-[#005538] border border-emerald-900 shadow-2xl"
          style={{
            width: boxDimension,
            height: halfDepth * 2,
            left: 0,
            top: boxDimension / 2 - halfDepth,
            transform: `rotateX(-90deg) translateZ(${boxDimension / 2}px)`,
            backfaceVisibility: "visible"
          }}
        />

        {/* Floating Holographic Ring Rotating on Z-Axis */}
        <div
          className="absolute -inset-2.5 rounded-full border border-[#00E599]/40 pointer-events-none"
          style={{
            transform: `translateZ(0px) rotateX(72deg)`,
            boxShadow: "0 0 16px rgba(0, 229, 153, 0.45)"
          }}
        />
      </motion.div>
    </div>
  );
};
