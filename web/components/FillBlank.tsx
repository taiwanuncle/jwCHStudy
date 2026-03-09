"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { QuizQuestion } from "@/lib/types";
import { useSettings } from "@/lib/settings-context";

interface Props {
  question: QuizQuestion;
  onAnswer: (selectedIndex: number, correct: boolean) => void;
  questionNumber: number;
  totalQuestions: number;
}

export function FillBlank({ question, onAnswer, questionNumber, totalQuestions }: Props) {
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
          }, 1500);
        }
      }, 100);
    }
    return clearTimer;
  }, [question, timerSeconds, clearTimer, onAnswer]);

  const sentence = question.idiom.source_sentences[0];

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
    }, 1500);
  };

  const parts = sentence?.text.split("____") ?? [""];
  const correctIdiom = question.optionIdioms[question.correctIndex];

  return (
    <div className="glass-elevated rounded-2xl p-4 sm:p-6 max-w-lg mx-auto">
      {/* Timer bar */}
      {timerSeconds > 0 && (
        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-100 ${
              timeLeft / timerSeconds > 0.3 ? "bg-amber-400" : "bg-red-400"
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
          <span className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-medium">빈칸 채우기</span>
        </div>
      </div>

      {/* Sentence with blank */}
      <div className="bg-amber-50/40 rounded-xl p-4 sm:p-5 mb-5 border border-amber-100">
        <p className="text-zh-question leading-relaxed font-zh">
          {parts.map((part, i) => (
            <span key={i}>
              {part}
              {i < parts.length - 1 && (
                <span className={`inline-block px-2 py-0.5 rounded mx-1 font-bold transition-colors ${
                  showResult
                    ? "bg-emerald-200 text-emerald-800"
                    : "bg-amber-200/70 text-amber-800"
                }`}>
                  {showResult ? question.options[question.correctIndex] : "□□□□"}
                </span>
              )}
            </span>
          ))}
        </p>
        {/* Korean hint for the sentence when toggle is ON */}
        {showKorean && correctIdiom.meaning_ko && !showResult && (
          <p className="text-zh-sub text-indigo-500 mt-2">
            {correctIdiom.meaning_ko}
          </p>
        )}
        {showResult && (
          <div className="mt-2 space-y-1">
            {showPinyin && (
              <p className="text-zh-sub text-indigo-400 font-pinyin">{correctIdiom.pinyin}</p>
            )}
            {showKorean && correctIdiom.meaning_ko && (
              <p className="text-zh-sub text-indigo-600 font-medium">{correctIdiom.meaning_ko}</p>
            )}
          </div>
        )}
        {sentence && (
          <p className="text-zh-sub text-gray-400 mt-3 font-zh">
            — {sentence.article} ({sentence.issue})
          </p>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-2.5">
        {question.optionIdioms.map((optIdiom, index) => {
          let btnClass = "border-gray-200 hover:border-amber-300 hover:bg-amber-50/50 hover:shadow-sm";

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
              className={`btn-option text-center px-4 py-3.5 rounded-xl border-2 ${btnClass}`}
            >
              <span className="text-xl font-medium font-zh tracking-wide text-zh-option block">
                {optIdiom.idiom}
              </span>
              {showPinyin && (
                <span className="text-zh-sub text-indigo-400 block mt-0.5 font-pinyin">{optIdiom.pinyin}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
