import React, { useState, useRef } from "react";
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
  const [rotation, setRotation] = useState({ x: 15, y: 0 });
  const isDragging = useRef(false);
  const prevMousePos = useRef({ x: 0, y: 0 });

  // Dimensions mapping
  const sizeMap = {
    sm: { container: "w-8 h-8", box: 24, text: "text-[10px]", depth: 12 },
    md: { container: "w-10 h-10", box: 32, text: "text-xs", depth: 16 },
    lg: { container: "w-16 h-16", box: 52, text: "text-base", depth: 26 },
    xl: { container: "w-28 h-28", box: 90, text: "text-2xl", depth: 45 }
  };

  const currentSize = sizeMap[size];

  // Continuous auto-rotation with frame loop
  useAnimationFrame((_, delta) => {
    if (!isDragging.current) {
      const speed = isHovered ? 0.08 : 0.04;
      setRotation((prev) => ({
        x: Math.sin(Date.now() / 1500) * 12 + 10,
        y: (prev.y + delta * speed) % 360
      }));
    }
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!interactive) return;
    isDragging.current = true;
    prevMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - prevMousePos.current.x;
    const dy = e.clientY - prevMousePos.current.y;
    prevMousePos.current = { x: e.clientX, y: e.clientY };

    setRotation((prev) => ({
      x: Math.max(-60, Math.min(60, prev.x - dy * 0.6)),
      y: (prev.y + dx * 0.6) % 360
    }));
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const halfDepth = currentSize.depth;
  const boxDimension = currentSize.box;

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
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Background Ambient Glow */}
      {showGlow && (
        <div
          className="absolute inset-0 rounded-full blur-xl pointer-events-none transition-all duration-500"
          style={{
            background: isHovered
              ? "radial-gradient(circle, rgba(0, 229, 153, 0.6) 0%, rgba(0, 168, 120, 0.2) 60%, transparent 80%)"
              : "radial-gradient(circle, rgba(0, 229, 153, 0.35) 0%, rgba(0, 168, 120, 0.1) 60%, transparent 80%)",
            transform: "scale(1.4)"
          }}
        />
      )}

      {/* 3D Model Root Container */}
      <motion.div
        className="relative cursor-grab active:cursor-grabbing"
        style={{
          width: boxDimension,
          height: boxDimension,
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
        }}
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* --- FRONT FACE --- */}
        <div
          className="absolute inset-0 rounded-xl bg-gradient-to-tr from-[#00A878] via-[#00E599] to-[#80ffdb] flex items-center justify-center text-[#070e17] border border-white/40 shadow-[0_0_20px_rgba(0,229,153,0.5)]"
          style={{
            transform: `translateZ(${halfDepth}px)`,
            backfaceVisibility: "visible"
          }}
        >
          {/* Inner Hexagon Graphic */}
          <svg className="w-1/2 h-1/2 fill-current drop-shadow-sm" viewBox="0 0 24 24">
            <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" />
          </svg>
          <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-white/30 pointer-events-none" />
        </div>

        {/* --- BACK FACE --- */}
        <div
          className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#004d34] via-[#008f5d] to-[#00E599] flex items-center justify-center text-white border border-[#00E599]/40 shadow-[0_0_20px_rgba(0,229,153,0.3)]"
          style={{
            transform: `rotateY(180deg) translateZ(${halfDepth}px)`,
            backfaceVisibility: "visible"
          }}
        >
          <span className={`font-black font-mono tracking-tighter ${currentSize.text} text-[#00E599] drop-shadow-[0_0_8px_rgba(0,229,153,0.8)]`}>
            GST
          </span>
          <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/20 to-black/40 pointer-events-none" />
        </div>

        {/* --- RIGHT FACE --- */}
        <div
          className="absolute rounded-lg bg-gradient-to-r from-[#00A878] to-[#005f40] border border-emerald-300/30 shadow-inner flex items-center justify-center text-white"
          style={{
            width: halfDepth * 2,
            height: boxDimension,
            left: boxDimension - halfDepth,
            top: 0,
            transform: `rotateY(90deg) translateZ(0px)`,
            backfaceVisibility: "visible"
          }}
        >
          <div className="w-1 h-3/4 rounded-full bg-white/40 blur-[0.5px]" />
        </div>

        {/* --- LEFT FACE --- */}
        <div
          className="absolute rounded-lg bg-gradient-to-l from-[#00A878] to-[#003826] border border-emerald-300/30 shadow-inner flex items-center justify-center text-white"
          style={{
            width: halfDepth * 2,
            height: boxDimension,
            left: -halfDepth,
            top: 0,
            transform: `rotateY(-90deg) translateZ(0px)`,
            backfaceVisibility: "visible"
          }}
        >
          <div className="w-1 h-3/4 rounded-full bg-emerald-300/40 blur-[0.5px]" />
        </div>

        {/* --- TOP FACE --- */}
        <div
          className="absolute rounded-lg bg-gradient-to-b from-[#80ffdb] to-[#00E599] border border-white/60 shadow-lg flex items-center justify-center"
          style={{
            width: boxDimension,
            height: halfDepth * 2,
            left: 0,
            top: -halfDepth,
            transform: `rotateX(90deg) translateZ(0px)`,
            backfaceVisibility: "visible"
          }}
        >
          <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
        </div>

        {/* --- BOTTOM FACE --- */}
        <div
          className="absolute rounded-lg bg-gradient-to-t from-[#003322] to-[#005538] border border-emerald-950 shadow-2xl"
          style={{
            width: boxDimension,
            height: halfDepth * 2,
            left: 0,
            top: boxDimension - halfDepth,
            transform: `rotateX(-90deg) translateZ(0px)`,
            backfaceVisibility: "visible"
          }}
        />

        {/* Floating Holographic Ring */}
        <div
          className="absolute -inset-2 rounded-full border border-[#00E599]/30 pointer-events-none"
          style={{
            transform: `translateZ(0px) rotateX(75deg)`,
            boxShadow: "0 0 15px rgba(0, 229, 153, 0.4)"
          }}
        />
      </motion.div>
    </div>
  );
};
