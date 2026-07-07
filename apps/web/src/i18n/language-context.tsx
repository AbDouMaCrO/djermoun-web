"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { dictionaries, rtlLanguages, type Language } from "./dictionaries";

const STORAGE_KEY = "djermoun-lang";

type LanguageContextValue = {
  lang: Language;
  setLang: (lang: Language) => void;
  dict: (typeof dictionaries)[Language];
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored && stored in dictionaries) setLangState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = rtlLanguages.includes(lang) ? "rtl" : "ltr";
  }, [lang]);

  const setLang = (next: Language) => {
    setLangState(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, dict: dictionaries[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
