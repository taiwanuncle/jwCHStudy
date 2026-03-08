"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type FontSize = "small" | "medium" | "large";
type TimerSeconds = 0 | 20 | 30 | 45;

interface SettingsContextValue {
  showPinyin: boolean;
  showKorean: boolean;
  fontSize: FontSize;
  timerSeconds: TimerSeconds;
  togglePinyin: () => void;
  toggleKorean: () => void;
  setFontSize: (size: FontSize) => void;
  setTimerSeconds: (seconds: TimerSeconds) => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  showPinyin: true,
  showKorean: true,
  fontSize: "medium",
  timerSeconds: 0,
  togglePinyin: () => {},
  toggleKorean: () => {},
  setFontSize: () => {},
  setTimerSeconds: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [showPinyin, setShowPinyin] = useState(true);
  const [showKorean, setShowKorean] = useState(true);
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [timerSeconds, setTimerSeconds] = useState<TimerSeconds>(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("chengyu_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.showPinyin === "boolean") setShowPinyin(parsed.showPinyin);
        if (typeof parsed.showKorean === "boolean") setShowKorean(parsed.showKorean);
        if (parsed.fontSize) setFontSize(parsed.fontSize);
        if (typeof parsed.timerSeconds === "number") setTimerSeconds(parsed.timerSeconds);
      }
    } catch {}
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("chengyu_settings", JSON.stringify({ showPinyin, showKorean, fontSize, timerSeconds }));
    }
  }, [showPinyin, showKorean, fontSize, timerSeconds, mounted]);

  return (
    <SettingsContext.Provider
      value={{
        showPinyin,
        showKorean,
        fontSize,
        timerSeconds,
        togglePinyin: () => setShowPinyin((v) => !v),
        toggleKorean: () => setShowKorean((v) => !v),
        setFontSize,
        setTimerSeconds,
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
