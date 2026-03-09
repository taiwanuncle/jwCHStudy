"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { QuizQuestion, QuizMode } from "@/lib/types";
import { useSettings } from "@/lib/settings-context";

interface Props {
  question: QuizQuestion;
  mode: QuizMode;
  onAnswer: (selectedIndex: number, correct: boolean) => void;
  questionNumber: number;
  totalQuestions: number;
}

export function QuizCard({ question, mode, onAnswer, questionNumber, totalQuestions }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const { showPinyin, showKorean, timerSeconds } = useSettings();
  const [timeLeft, setTimeLeft] = useState<number>(timerSeconds);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answeredRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  useEffect(() => {
    answeredRef.current = false;
    setTimeLeft(timerSeconds);
    clearTimer();
    if (timerSeconds > 0) {
      const start = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - start) / 1000;
        const remaining = Math.max(0, timerSeconds - elapsed);
        setTimeLeft(remaining);
        if (remaining <= 0 && !answeredRef.current) {
          clearTimer();
          answeredRef.current = true;
          setShowResult(true);
          setTimeout(() => {
            onAnswer(-1, false);
            setSelected(null);
            setShowResult(false);
          }, 1200);
        }
      }, 100);
    }
    return clearTimer;
  }, [question, timerSeconds, clearTimer, onAnswer]);

  const handleSelect = (index: number) => {
    if (showResult || answeredRef.current) return;
    answeredRef.current = true;
    clearTimer();
    setSelected(index);
    setShowResult(true);
    const correct = index === question.correctIndex;
    setTimeout(() => {
      onAnswer(index, correct);
      setSelected(null);
      setShowResult(false);
    }, 1200);
  };

  const sentence = question.idiom.source_sentences[0];

  return (
    <div className="glass-elevated rounded-2xl p-4 sm:p-6 max-w-lg mx-auto">
      {/* Timer bar */}
      {timerSeconds > 0 && (
        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-100 ${
              timeLeft / timerSeconds > 0.3 ? "bg-indigo-400" : "bg-red-400"
            }`}
            style={{ width: `${(timeLeft / timerSeconds) * 100}%` }}
          />
        </div>
      )}

      {/* Progress */}
      <div className="flex justify-between items-center mb-5 text-sm">
        <span className="text-gray-400 font-medium">{questionNumber} / {totalQuestions}</span>
        <div className="flex items-center gap-2">
          {timerSeconds > 0 && (
            <span className={`text-xs font-mono ${timeLeft <= 5 ? "text-red-500 font-bold" : "text-gray-400"}`}>
              {Math.ceil(timeLeft)}s
            </span>
          )}
          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">
            {mode === "meaning-to-idiom" ? "뜻 → 성어" : "성어 → 뜻"}
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="text-center mb-7">
        {mode === "meaning-to-idiom" ? (
          <div>
            <p className="text-zh-question text-gray-800 leading-relaxed font-zh mb-1">
              {question.idiom.meaning_zh}
            </p>
            {showKorean && question.idiom.meaning_ko && (
              <p className="text-zh-body text-indigo-600 leading-relaxed mb-1">
                {question.idiom.meaning_ko}
              </p>
            )}
            <p className="text-zh-body text-gray-400 mt-2">이 뜻에 맞는 성어는?</p>
          </div>
        ) : (
          <div>
            <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 font-zh tracking-wider text-zh-display">
              {question.idiom.idiom}
            </p>
            {showPinyin && (
              <p className="text-zh-sub text-indigo-400 mb-2 font-pinyin">{question.idiom.pinyin}</p>
            )}
            {/* Example sentence below idiom (no meaning - that's the answer!) */}
            {sentence && (
              <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-2 mb-2 text-left">
                <p className="text-zh-body leading-relaxed font-zh">
                  {sentence.text}
                </p>
              </div>
            )}
            <p className="text-zh-body text-gray-400">이 성어의 뜻은?</p>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-2.5">
        {question.optionIdioms.map((optIdiom, index) => {
          let btnClass = "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-sm";

          if (showResult) {
            if (index === question.correctIndex) {
              btnClass = "border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm";
            } else if (index === selected && index !== question.correctIndex) {
              btnClass = "border-red-400 bg-red-50 text-red-700";
            } else {
              btnClass = "border-gray-200/50 opacity-40";
            }
          }

          return (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={showResult}
              className={`btn-option w-full px-5 py-3.5 rounded-xl border-2 ${btnClass}`}
            >
              {mode === "meaning-to-idiom" ? (
                <div className="text-center">
                  <span className="text-xl font-medium font-zh tracking-wide text-zh-option">
                    {optIdiom.idiom}
                  </span>
                  {showPinyin && (
                    <span className="block text-zh-sub text-indigo-400 mt-0.5 font-pinyin">{optIdiom.pinyin}</span>
                  )}
                </div>
              ) : (
                <span className={`text-zh-body leading-relaxed text-left block ${showKorean && optIdiom.meaning_ko ? "" : "font-zh"}`}>
                  {showKorean && optIdiom.meaning_ko ? optIdiom.meaning_ko : optIdiom.meaning_zh}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
