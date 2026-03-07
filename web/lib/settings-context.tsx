"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type FontSize = "small" | "medium" | "large";

interface SettingsContextValue {
  showPinyin: boolean;
  showKorean: boolean;
  fontSize: FontSize;
  togglePinyin: () => void;
  toggleKorean: () => void;
  setFontSize: (size: FontSize) => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  showPinyin: true,
  showKorean: true,
  fontSize: "medium",
  togglePinyin: () => {},
  toggleKorean: () => {},
  setFontSize: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [showPinyin, setShowPinyin] = useState(true);
  const [showKorean, setShowKorean] = useState(true);
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("chengyu_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.showPinyin === "boolean") setShowPinyin(parsed.showPinyin);
        if (typeof parsed.showKorean === "boolean") setShowKorean(parsed.showKorean);
        if (parsed.fontSize) setFontSize(parsed.fontSize);
      }
    } catch {}
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("chengyu_settings", JSON.stringify({ showPinyin, showKorean, fontSize }));
    }
  }, [showPinyin, showKorean, fontSize, mounted]);

  return (
    <SettingsContext.Provider
      value={{
        showPinyin,
        showKorean,
        fontSize,
        togglePinyin: () => setShowPinyin((v) => !v),
        toggleKorean: () => setShowKorean((v) => !v),
        setFontSize,
      }}
    >
      <div className={`text-size-${fontSize}`}>
        {children}
      </div>
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
