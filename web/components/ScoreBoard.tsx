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
  let gradientClass: string;
  if (percentage >= 90) {
    message = "훌륭합니다!";
    gradientClass = "from-emerald-500 to-teal-500";
  } else if (percentage >= 70) {
    message = "잘했습니다!";
    gradientClass = "from-blue-500 to-indigo-500";
  } else if (percentage >= 50) {
    message = "계속 노력하세요!";
    gradientClass = "from-amber-500 to-orange-500";
  } else {
    message = "복습이 필요해요!";
    gradientClass = "from-red-500 to-pink-500";
  }

  return (
    <div className="glass rounded-2xl shadow-lg p-10 max-w-lg mx-auto text-center">
      <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${gradientClass} mx-auto mb-5 flex items-center justify-center`}>
        <span className="text-white text-3xl font-bold">{percentage}%</span>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">{message}</h2>
      <p className="text-4xl font-bold text-gradient mb-1">
        {score} / {total}
      </p>
      <p className="text-gray-400 mb-6">정답률 {percentage}%</p>

      <div className="w-full bg-gray-100 rounded-full h-2.5 mb-8">
        <div
          className={`bg-gradient-to-r ${gradientClass} h-2.5 rounded-full transition-all duration-500`}
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
