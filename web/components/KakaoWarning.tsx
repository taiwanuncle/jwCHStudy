"use client";

import { useState, useEffect } from "react";

export function KakaoWarning() {
  const [show, setShow] = useState(false);
  const [hideToday, setHideToday] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isKakao = ua.includes("kakaotalk") || ua.includes("kakao");
    if (!isKakao) return;

    const hideUntil = localStorage.getItem("kakao_warn_hide");
    if (hideUntil && new Date() < new Date(hideUntil)) return;

    setShow(true);
  }, []);

  if (!show) return null;

  const handleOpenExternal = () => {
    const url = window.location.href;
    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);

    if (isIOS) {
      window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(url)}`;
    } else {
      window.location.href = `intent://${url.replace(/^https?:\/\//, "")}#Intent;scheme=https;package=com.android.chrome;end`;
    }
  };

  const handleClose = () => {
    if (hideToday) {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      localStorage.setItem("kakao_warn_hide", today.toISOString());
    }
    setShow(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="glass rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">카카오톡 브라우저 안내</h3>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          카카오톡 브라우저에서는 일부 기능이<br />
          정상적으로 작동하지 않을 수 있습니다.<br />
          <strong className="text-gray-900">외부 브라우저</strong>에서 열면 안정적으로 이용할 수 있습니다.
        </p>
        <button
          onClick={handleOpenExternal}
          className="w-full px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all mb-3"
        >
          외부 브라우저로 열기
        </button>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={hideToday}
              onChange={(e) => setHideToday(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span>오늘 하루 보지 않기</span>
          </label>
          <button
            onClick={handleClose}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
