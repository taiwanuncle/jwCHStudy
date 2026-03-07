"use client";

import { useState } from "react";
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
  const { showPinyin, showKorean } = useSettings();

  const handleSelect = (index: number) => {
    if (showResult) return;
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
    <div className="glass rounded-2xl shadow-lg p-6 max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex justify-between items-center mb-5 text-sm">
        <span className="text-gray-400 font-medium">{questionNumber} / {totalQuestions}</span>
        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">
          {mode === "meaning-to-idiom" ? "뜻 → 성어" : "성어 → 뜻"}
        </span>
      </div>

      {/* Question */}
      <div className="text-center mb-7">
        {mode === "meaning-to-idiom" ? (
          <div>
            {showKorean && question.idiom.meaning_ko ? (
              <>
                <p className="text-xl text-gray-800 leading-relaxed mb-1">
                  {question.idiom.meaning_ko}
                </p>
                <p className="text-sm text-gray-400 font-zh mb-1">{question.idiom.meaning_zh}</p>
              </>
            ) : (
              <p className="text-xl text-gray-800 leading-relaxed font-zh mb-1">
                {question.idiom.meaning_zh}
              </p>
            )}
            <p className="text-sm text-gray-400 mt-2">이 뜻에 맞는 성어는?</p>
          </div>
        ) : (
          <div>
            <p className="text-4xl font-bold text-gray-900 mb-2 font-zh tracking-wider text-zh-display">
              {question.idiom.idiom}
            </p>
            {showPinyin && (
              <p className="text-sm text-indigo-400 mb-2">{question.idiom.pinyin}</p>
            )}
            {/* Example sentence below idiom */}
            {sentence && (
              <div className="bg-slate-50 rounded-lg px-4 py-2 mb-2 text-left">
                <p className={`text-sm leading-relaxed ${showKorean ? "" : "font-zh"}`}>
                  {showKorean
                    ? (question.idiom.meaning_ko || question.idiom.meaning_zh)
                    : sentence.text
                  }
                </p>
              </div>
            )}
            <p className="text-sm text-gray-400">이 성어의 뜻은?</p>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-2.5">
        {question.optionIdioms.map((optIdiom, index) => {
          let btnClass = "border-gray-200/80 hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-sm";

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
                    <span className="block text-xs text-indigo-400 mt-0.5">{optIdiom.pinyin}</span>
                  )}
                </div>
              ) : (
                <span className={`text-sm leading-relaxed text-left block ${showKorean ? "" : "font-zh"}`}>
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
