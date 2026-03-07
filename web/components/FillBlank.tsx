"use client";

import { useState } from "react";
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
  const { showPinyin, showKorean } = useSettings();

  const sentence = question.idiom.source_sentences[0];

  const handleSelect = (index: number) => {
    if (showResult) return;
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
    <div className="glass rounded-2xl shadow-lg p-6 max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex justify-between items-center mb-5 text-sm">
        <span className="text-gray-400 font-medium">{questionNumber} / {totalQuestions}</span>
        <span className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-medium">빈칸 채우기</span>
      </div>

      {/* Sentence with blank */}
      <div className="bg-gradient-to-br from-slate-50 to-amber-50/30 rounded-xl p-5 mb-5 border border-amber-100/50">
        <p className="text-lg leading-relaxed font-zh">
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
        {showResult && (
          <div className="mt-2 space-y-1">
            {showPinyin && (
              <p className="text-xs text-indigo-400">{correctIdiom.pinyin}</p>
            )}
            {showKorean && correctIdiom.meaning_ko && (
              <p className="text-xs text-indigo-600 font-medium">{correctIdiom.meaning_ko}</p>
            )}
          </div>
        )}
        {sentence && (
          <p className="text-xs text-gray-400 mt-3">
            — {sentence.article} ({sentence.issue})
          </p>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-2.5">
        {question.optionIdioms.map((optIdiom, index) => {
          let btnClass = "border-gray-200/80 hover:border-amber-300 hover:bg-amber-50/50 hover:shadow-sm";

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
                <span className="text-xs text-indigo-400 block mt-0.5">{optIdiom.pinyin}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
