import React from "react";
import { motion } from "framer-motion";

interface AnimatedMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export const AnimatedMenuButton: React.FC<AnimatedMenuButtonProps> = ({
  isOpen,
  onClick,
  className = ""
}) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      className={`relative group p-2.5 rounded-2xl bg-[#121218]/90 hover:bg-[#181822] border border-white/10 hover:border-[#00E599]/40 shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all duration-300 flex items-center justify-center cursor-pointer overflow-hidden ${className}`}
      aria-label="Toggle Workspace Menu"
      title={isOpen ? "Collapse Menu" : "Open Workspace Menu"}
    >
      {/* Background Pulse Glow on Hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#00A878]/0 via-[#00E599]/10 to-[#80ffdb]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Cybernetic Geometric Corner Accents */}
      <span className="absolute top-1 left-1 w-1 h-1 border-t border-l border-[#00E599]/40 group-hover:border-[#00E599] transition-colors" />
      <span className="absolute bottom-1 right-1 w-1 h-1 border-b border-r border-[#00E599]/40 group-hover:border-[#00E599] transition-colors" />

      {/* Morphing Animated 3-Line Cyber Bars */}
      <svg
        className="w-5 h-5 text-zinc-300 group-hover:text-white transition-colors relative z-10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Top Bar */}
        <motion.line
          x1="3"
          y1="6"
          x2="21"
          y2="6"
          animate={{
            rotate: isOpen ? 45 : 0,
            translateY: isOpen ? 6 : 0,
            stroke: isOpen ? "#00E599" : "currentColor"
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          style={{ originX: "50%", originY: "50%" }}
        />

        {/* Middle Bar with Hex Dot */}
        <motion.line
          x1="3"
          y1="12"
          x2="17"
          y2="12"
          animate={{
            opacity: isOpen ? 0 : 1,
            scaleX: isOpen ? 0 : 1,
            translateX: isOpen ? 8 : 0
          }}
          transition={{ duration: 0.2 }}
        />

        {/* Bottom Bar */}
        <motion.line
          x1="3"
          y1="18"
          x2="21"
          y2="18"
          animate={{
            rotate: isOpen ? -45 : 0,
            translateY: isOpen ? -6 : 0,
            stroke: isOpen ? "#00E599" : "currentColor"
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          style={{ originX: "50%", originY: "50%" }}
        />
      </svg>

      {/* Glowing Neon Activity Dot */}
      <span
        className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full transition-all duration-300 ${
          isOpen
            ? "bg-[#00E599] shadow-[0_0_10px_#00E599] ring-2 ring-[#0a0a0d]"
            : "bg-zinc-600 group-hover:bg-[#00E599]"
        }`}
      />
    </motion.button>
  );
};
