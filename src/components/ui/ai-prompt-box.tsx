"use client";
import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ButtonColorful } from "@sicaho-collab/ui-web";

// ── Custom hook: detect dark mode via class on <html> ──────────────────────────
function useIsDark() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

// ── Types ──────────────────────────────────────────────────────────────────────
interface GradientColors {
  topLeft: string;
  topRight: string;
  bottomRight: string;
  bottomLeft: string;
}
interface ThemeGradients {
  light: GradientColors;
  dark: GradientColors;
}
export interface AIPromptBoxProps {
  placeholder?: string;
  onSend?: (message: string) => void;
  enableAnimations?: boolean;
  className?: string;
  disabled?: boolean;
  mainGradient?: ThemeGradients;
  outerGradient?: ThemeGradients;
  innerGradientOpacity?: number;
  enableShadows?: boolean;
  shadowOpacity?: number;
  shadowColor?: { light: string; dark: string };
  sendLabel?: string;
}

// ── M3 brand palette ───────────────────────────────────────────────────────────
const M3_MAIN: ThemeGradients = {
  light: {
    topLeft: "#D4B8F0",
    topRight: "#FFE5C4",
    bottomRight: "#FFA33C",
    bottomLeft: "#EDE0FF",
  },
  dark: {
    topLeft: "#583D72",
    topRight: "#8B4A1A",
    bottomRight: "#4D2800",
    bottomLeft: "#3D2E4F",
  },
};
const M3_OUTER: ThemeGradients = {
  light: {
    topLeft: "#C3A3E0",
    topRight: "#F0C88A",
    bottomRight: "#E08A1A",
    bottomLeft: "#C9B0F0",
  },
  dark: {
    topLeft: "#3E2955",
    topRight: "#6A3410",
    bottomRight: "#3A1C00",
    bottomLeft: "#2A1F3A",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const hexToRgba = (color: string, alpha: number): string => {
  if (color.startsWith("rgb(")) {
    const [r, g, b] = color.slice(4, -1).split(",").map(Number);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  if (color.startsWith("#")) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return color;
};

// ── Component ─────────────────────────────────────────────────────────────────
export function AIPromptBox({
  placeholder = "Send message...",
  onSend,
  enableAnimations = true,
  className,
  disabled = false,
  mainGradient = M3_MAIN,
  outerGradient = M3_OUTER,
  innerGradientOpacity = 0.1,
  enableShadows = true,
  shadowOpacity = 1,
  shadowColor = {
    light: "rgb(154,118,190)",
    dark: "rgb(255,163,60)",
  },
  sendLabel = "Send",
}: AIPromptBoxProps) {
  const isDark = useIsDark();
  const [message, setMessage] = useState("");
  const shouldReduceMotion = useReducedMotion();
  const shouldAnimate = enableAnimations && !shouldReduceMotion;

  const grad = isDark ? mainGradient.dark : mainGradient.light;
  const outerGrad = isDark ? outerGradient.dark : outerGradient.light;
  const shadow = isDark ? shadowColor.dark : shadowColor.light;

  const conicGrad = (c: GradientColors) =>
    `conic-gradient(from 0deg at 50% 50%, ${c.topLeft} 0deg, ${c.topRight} 90deg, ${c.bottomRight} 180deg, ${c.bottomLeft} 270deg, ${c.topLeft} 360deg)`;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (message.trim() && onSend && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div
      className={cn("relative", className)}
      initial={shouldAnimate ? { opacity: 0, y: 20 } : {}}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
    >
      <div className="relative">
        {/* Outer 0.5px border */}
        <div
          className="absolute inset-0 rounded-[20px] p-[0.5px]"
          style={{ background: conicGrad(outerGrad) }}
        >
          {/* Main 2px border */}
          <div
            className="h-full w-full rounded-[19.5px] p-[2px]"
            style={{ background: conicGrad(grad) }}
          >
            {/* Inner background */}
            <div className="h-full w-full rounded-[17.5px] bg-m3-surface relative">
              {/* Inner 0.5px tint border */}
              <div
                className="absolute inset-0 rounded-[17.5px] p-[0.5px]"
                style={{
                  background: `conic-gradient(from 0deg at 50% 50%,
                    ${hexToRgba(outerGrad.topLeft, innerGradientOpacity)} 0deg,
                    ${hexToRgba(outerGrad.topRight, innerGradientOpacity)} 90deg,
                    ${hexToRgba(outerGrad.bottomRight, innerGradientOpacity)} 180deg,
                    ${hexToRgba(outerGrad.bottomLeft, innerGradientOpacity)} 270deg,
                    ${hexToRgba(outerGrad.topLeft, innerGradientOpacity)} 360deg)`,
                }}
              >
                <div className="h-full w-full rounded-[17px] bg-m3-surface" />
              </div>
              {/* Top highlight */}
              <div
                className="absolute top-0 left-4 right-4 h-[0.5px]"
                style={{
                  background: `linear-gradient(to right, transparent, ${hexToRgba(grad.topLeft, 0.3)}, transparent)`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative p-4 pb-3">
          {/* Textarea */}
          <div className="mb-3">
            <textarea
              value={message}
              onChange={e => { if (e.target.value.length <= 500) setMessage(e.target.value) }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className={cn(
                "w-full resize-none border-0 bg-transparent",
                "text-m3-on-surface placeholder:text-m3-on-surface-variant",
                "text-base leading-6 py-2 px-0",
                "focus:outline-none focus:ring-0",
                disabled && "opacity-50 cursor-not-allowed",
              )}
              style={{ minHeight: 40, maxHeight: 120 }}
              onInput={e => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = "auto";
                t.style.height = Math.min(t.scrollHeight, 120) + "px";
              }}
            />
          </div>

          {/* Bottom row: character count + ButtonColorful */}
          <div className="flex items-center justify-end gap-3">
            <span className={cn(
              "text-xs tabular-nums",
              message.length > 500 ? "text-m3-error" : "text-m3-on-surface-variant",
            )}>
              {message.length}/500
            </span>
            <ButtonColorful
              label={sendLabel}
              disabled={disabled || !message.trim()}
              onClick={() => handleSubmit()}
            />
          </div>
        </div>

        {/* Shadow system — reduced blur */}
        {enableShadows && (
          <>
            <div
              className="absolute -bottom-2 left-4 right-4 h-4 rounded-full blur-sm pointer-events-none"
              style={{
                opacity: shadowOpacity,
                background: `linear-gradient(to bottom, ${hexToRgba(shadow, 0.06)}, transparent)`,
              }}
            />
            <div
              className="absolute -left-1 top-4 bottom-4 w-3 rounded-full pointer-events-none"
              style={{
                opacity: shadowOpacity,
                background: `linear-gradient(to right, ${hexToRgba(shadow, 0.03)}, transparent)`,
              }}
            />
            <div
              className="absolute -right-1 top-4 bottom-4 w-3 rounded-full pointer-events-none"
              style={{
                opacity: shadowOpacity,
                background: `linear-gradient(to left, ${hexToRgba(shadow, 0.03)}, transparent)`,
              }}
            />
            <div
              className="absolute inset-0 rounded-[20px] pointer-events-none"
              style={{
                boxShadow: `0 4px 12px ${hexToRgba(shadow, isDark ? 0.08 : 0.04)}`,
              }}
            />
          </>
        )}
      </div>
    </motion.div>
  );
}
