"use client";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/theme-provider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-all duration-200 hover:border-amber-400 hover:text-amber-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:border-amber-500/30 dark:hover:text-amber-400"
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
