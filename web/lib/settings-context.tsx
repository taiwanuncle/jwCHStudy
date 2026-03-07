"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface Settings {
  showPinyin: boolean;
  showKorean: boolean;
}

interface SettingsContextValue extends Settings {
  togglePinyin: () => void;
  toggleKorean: () => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  showPinyin: true,
  showKorean: true,
  togglePinyin: () => {},
  toggleKorean: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [showPinyin, setShowPinyin] = useState(true);
  const [showKorean, setShowKorean] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("chengyu_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.showPinyin === "boolean") setShowPinyin(parsed.showPinyin);
        if (typeof parsed.showKorean === "boolean") setShowKorean(parsed.showKorean);
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("chengyu_settings", JSON.stringify({ showPinyin, showKorean }));
  }, [showPinyin, showKorean]);

  return (
    <SettingsContext.Provider
      value={{
        showPinyin,
        showKorean,
        togglePinyin: () => setShowPinyin((v) => !v),
        toggleKorean: () => setShowKorean((v) => !v),
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
