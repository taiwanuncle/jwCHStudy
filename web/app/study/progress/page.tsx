"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAllIdioms } from "@/lib/data";
import { getStoredProgress, getWrongAnswers } from "@/lib/quiz-utils";

interface Stats {
  totalStudied: number;
  totalCorrect: number;
  totalAttempts: number;
  accuracy: number;
  wrongCount: number;
  masteredCount: number;
  learningCount: number;
  notStartedCount: number;
  difficultyBreakdown: { difficulty: number; studied: number; total: number }[];
  recentIdioms: { idiom: string; pinyin: string; correct: number; total: number }[];
}

function computeStats(): Stats {
  const idioms = getAllIdioms();
  const progress = getStoredProgress();
  const wrongIds = getWrongAnswers();

  let totalCorrect = 0;
  let totalAttempts = 0;
  let masteredCount = 0;
  let learningCount = 0;

  const studiedIds = Object.keys(progress);
  const totalStudied = studiedIds.length;

  for (const id of studiedIds) {
    const p = progress[id];
    totalCorrect += p.correct;
    totalAttempts += p.total;
    const rate = p.total > 0 ? p.correct / p.total : 0;
    if (rate >= 0.8 && p.total >= 3) {
      masteredCount++;
    } else {
      learningCount++;
    }
  }

  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const notStartedCount = idioms.length - totalStudied;

  // Difficulty breakdown
  const diffMap = new Map<number, { studied: number; total: number }>();
  for (const idiom of idioms) {
    const d = idiom.difficulty;
    if (!diffMap.has(d)) diffMap.set(d, { studied: 0, total: 0 });
    const entry = diffMap.get(d)!;
    entry.total++;
    if (progress[idiom.id]) entry.studied++;
  }
  const difficultyBreakdown = Array.from(diffMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([difficulty, data]) => ({ difficulty, ...data }));

  // Recent studied idioms (sorted by total attempts desc, top 10)
  const recentIdioms = studiedIds
    .map((id) => {
      const idiom = idioms.find((i) => i.id === id);
      if (!idiom) return null;
      return {
        idiom: idiom.idiom,
        pinyin: idiom.pinyin,
        correct: progress[id].correct,
        total: progress[id].total,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b!.total - a!.total)
    .slice(0, 10) as Stats["recentIdioms"];

  return {
    totalStudied,
    totalCorrect,
    totalAttempts,
    accuracy,
    wrongCount: wrongIds.length,
    masteredCount,
    learningCount,
    notStartedCount,
    difficultyBreakdown,
    recentIdioms,
  };
}

function StatBox({ value, label, color }: { value: string | number; label: string; color: string }) {
  return (
    <div className="stat-card rounded-2xl p-3 sm:p-4 text-center">
      <p className={`text-2xl sm:text-3xl font-bold ${color}`}>{value}</p>
      <p className="text-[10px] sm:text-xs text-gray-400 mt-1">{label}</p>
    </div>
  );
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="w-full bg-gray-100 rounded-full h-2.5">
      <div
        className={`h-2.5 rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function ProgressPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const totalIdioms = getAllIdioms().length;

  useEffect(() => {
    setStats(computeStats());
  }, []);

  if (!stats) return null;

  const overallProgress = totalIdioms > 0 ? Math.round((stats.totalStudied / totalIdioms) * 100) : 0;

  return (
    <div>
      <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">나의 학습</h2>

      {stats.totalAttempts === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 mx-auto mb-5 flex items-center justify-center">
            <span className="text-white text-2xl font-bold font-zh">绩</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">아직 학습 기록이 없습니다</h3>
          <p className="text-gray-400 mb-6">퀴즈를 풀면 여기에 진도와 성적이 표시됩니다.</p>
          <button
            onClick={() => router.push("/quiz/meaning")}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md transition-all font-medium"
          >
            학습 시작하기
          </button>
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6">
            <StatBox value={stats.totalStudied} label="학습한 성어" color="text-gradient" />
            <StatBox value={`${stats.accuracy}%`} label="정답률" color={stats.accuracy >= 70 ? "text-emerald-600" : "text-amber-600"} />
            <StatBox value={stats.masteredCount} label="마스터" color="text-emerald-600" />
            <StatBox value={stats.wrongCount} label="오답 누적" color="text-red-500" />
          </div>

          {/* Overall Progress */}
          <div className="glass-elevated rounded-2xl p-4 sm:p-5 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">전체 진도</span>
              <span className="text-sm font-bold text-indigo-600">{stats.totalStudied} / {totalIdioms} ({overallProgress}%)</span>
            </div>
            <ProgressBar value={stats.totalStudied} max={totalIdioms} color="bg-indigo-500" />
            <div className="flex justify-between mt-3 text-xs text-gray-400">
              <span>마스터 {stats.masteredCount}</span>
              <span>학습 중 {stats.learningCount}</span>
              <span>미학습 {stats.notStartedCount}</span>
            </div>
          </div>

          {/* Mastery Distribution */}
          <div className="glass-elevated rounded-2xl p-4 sm:p-5 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">학습 상태</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-emerald-600 font-medium">마스터 (정답률 80%+, 3회 이상)</span>
                  <span className="text-gray-500">{stats.masteredCount}개</span>
                </div>
                <ProgressBar value={stats.masteredCount} max={totalIdioms} color="bg-emerald-500" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-amber-600 font-medium">학습 중</span>
                  <span className="text-gray-500">{stats.learningCount}개</span>
                </div>
                <ProgressBar value={stats.learningCount} max={totalIdioms} color="bg-amber-400" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400 font-medium">미학습</span>
                  <span className="text-gray-500">{stats.notStartedCount}개</span>
                </div>
                <ProgressBar value={stats.notStartedCount} max={totalIdioms} color="bg-gray-300" />
              </div>
            </div>
          </div>

          {/* Difficulty Breakdown */}
          {stats.difficultyBreakdown.length > 0 && (
            <div className="glass-elevated rounded-2xl p-4 sm:p-5 mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">난이도별 진도</h3>
              <div className="space-y-3">
                {stats.difficultyBreakdown.map(({ difficulty, studied, total }) => {
                  const label = difficulty === 1 ? "쉬움" : difficulty === 2 ? "보통" : "어려움";
                  const color = difficulty === 1 ? "bg-emerald-400" : difficulty === 2 ? "bg-indigo-400" : "bg-red-400";
                  const stars = "★".repeat(difficulty) + "☆".repeat(3 - difficulty);
                  return (
                    <div key={difficulty}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 font-medium">
                          <span className="text-amber-400 mr-1">{stars}</span>
                          {label}
                        </span>
                        <span className="text-gray-500">{studied} / {total}</span>
                      </div>
                      <ProgressBar value={studied} max={total} color={color} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quiz Stats */}
          <div className="glass-elevated rounded-2xl p-4 sm:p-5 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">퀴즈 통계</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xl font-bold text-gray-800">{stats.totalAttempts}</p>
                <p className="text-xs text-gray-400">총 풀이 수</p>
              </div>
              <div>
                <p className="text-xl font-bold text-emerald-600">{stats.totalCorrect}</p>
                <p className="text-xs text-gray-400">정답</p>
              </div>
              <div>
                <p className="text-xl font-bold text-red-500">{stats.totalAttempts - stats.totalCorrect}</p>
                <p className="text-xs text-gray-400">오답</p>
              </div>
            </div>
          </div>

          {/* Recently Studied */}
          {stats.recentIdioms.length > 0 && (
            <div className="glass-elevated rounded-2xl p-4 sm:p-5 mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">많이 학습한 성어</h3>
              <div className="space-y-2">
                {stats.recentIdioms.map((item, i) => {
                  const rate = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
                  return (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold font-zh text-gray-800">{item.idiom}</span>
                        <span className="text-xs text-indigo-400 font-pinyin">{item.pinyin}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${rate >= 80 ? "text-emerald-600" : rate >= 50 ? "text-amber-600" : "text-red-500"}`}>
                          {rate}%
                        </span>
                        <span className="text-[10px] text-gray-400">({item.correct}/{item.total})</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/quiz/meaning")}
              className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md transition-all font-medium text-sm"
            >
              학습 계속하기
            </button>
            {stats.wrongCount >= 4 && (
              <button
                onClick={() => router.push("/study/review")}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-all font-medium text-sm"
              >
                오답 복습 ({stats.wrongCount})
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
