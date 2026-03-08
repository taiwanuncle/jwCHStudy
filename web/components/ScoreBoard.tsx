"use client";

interface Props {
  score: number;
  total: number;
  onRestart: () => void;
  onHome: () => void;
}

export function ScoreBoard({ score, total, onRestart, onHome }: Props) {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  let message: string;
  let emoji: string;
  let gradientClass: string;
  if (percentage >= 90) {
    message = "훌륭합니다!";
    emoji = "🎉";
    gradientClass = "from-emerald-500 to-teal-500";
  } else if (percentage >= 70) {
    message = "잘했습니다!";
    emoji = "👏";
    gradientClass = "from-blue-500 to-indigo-500";
  } else if (percentage >= 50) {
    message = "계속 노력하세요!";
    emoji = "💪";
    gradientClass = "from-amber-500 to-orange-500";
  } else {
    message = "복습이 필요해요!";
    emoji = "📖";
    gradientClass = "from-red-500 to-pink-500";
  }

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  return (
    <div className="glass rounded-2xl shadow-lg p-10 max-w-lg mx-auto text-center">
      {/* Circular progress */}
      <div className="relative w-36 h-36 mx-auto mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#f1f5f9" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            className={`transition-all duration-1000 ease-out`}
            style={{
              stroke: percentage >= 90 ? "#10b981" : percentage >= 70 ? "#6366f1" : percentage >= 50 ? "#f59e0b" : "#ef4444",
              strokeDasharray: circumference,
              strokeDashoffset,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-900">{percentage}%</span>
          <span className="text-xs text-gray-400">{score}/{total}</span>
        </div>
      </div>

      <div className="text-3xl mb-2">{emoji}</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">{message}</h2>
      <p className="text-gray-400 mb-6">정답률 {percentage}%</p>

      <div className="w-full bg-gray-100 rounded-full h-2 mb-8">
        <div
          className={`bg-gradient-to-r ${gradientClass} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex gap-3 justify-center">
        <button
          onClick={onRestart}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md transition-all font-medium"
        >
          다시 도전
        </button>
        <button
          onClick={onHome}
          className="px-6 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:shadow-sm transition-all font-medium"
        >
          홈으로
        </button>
      </div>
    </div>
  );
}
