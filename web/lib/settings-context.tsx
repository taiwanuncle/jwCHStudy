"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type FontSize = "small" | "medium" | "large" | "xlarge";
type TimerSeconds = 0 | 20 | 30 | 45;
type QuestionCount = 5 | 10;

interface SettingsContextValue {
  showPinyin: boolean;
  showKorean: boolean;
  fontSize: FontSize;
  timerSeconds: TimerSeconds;
  questionCount: QuestionCount;
  togglePinyin: () => void;
  toggleKorean: () => void;
  setFontSize: (size: FontSize) => void;
  setTimerSeconds: (seconds: TimerSeconds) => void;
  setQuestionCount: (count: QuestionCount) => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  showPinyin: true,
  showKorean: true,
  fontSize: "medium",
  timerSeconds: 0,
  questionCount: 10,
  togglePinyin: () => {},
  toggleKorean: () => {},
  setFontSize: () => {},
  setTimerSeconds: () => {},
  setQuestionCount: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [showPinyin, setShowPinyin] = useState(true);
  const [showKorean, setShowKorean] = useState(true);
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [timerSeconds, setTimerSeconds] = useState<TimerSeconds>(0);
  const [questionCount, setQuestionCount] = useState<QuestionCount>(10);
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
        if (parsed.questionCount) setQuestionCount(parsed.questionCount);
      }
    } catch {}
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("chengyu_settings", JSON.stringify({ showPinyin, showKorean, fontSize, timerSeconds, questionCount }));
    }
  }, [showPinyin, showKorean, fontSize, timerSeconds, questionCount, mounted]);

  return (
    <SettingsContext.Provider
      value={{
        showPinyin,
        showKorean,
        fontSize,
        timerSeconds,
        questionCount,
        togglePinyin: () => setShowPinyin((v) => !v),
        toggleKorean: () => setShowKorean((v) => !v),
        setFontSize,
        setTimerSeconds,
        setQuestionCount,
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
