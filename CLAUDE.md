# CLAUDE.md - jwCHStudy 프로젝트

## 절대 수칙
1. **프리뷰 금지**: 사용자가 명시적으로 프리뷰/확인을 요청하지 않는 한, preview_start/preview_screenshot 등 프리뷰 관련 도구를 사용하지 않는다.
2. **다국어 대비 코딩**: 모든 UI 텍스트는 하드코딩하지 않는다.

## 프로젝트 개요
파수대(守望台) 연구용 기사(2020~2026, 간체)에서 중국어 성어(成语)와 관용어를 추출하여 퀴즈/빈칸 채우기/플래시카드로 학습하는 웹사이트

## 기술 스택
- **데이터 수집**: Python (jieba, requests, beautifulsoup4) → `scraper/`
- **웹 프론트엔드**: Next.js (React, TypeScript, Tailwind) → `web/`
- **데이터**: 정적 JSON (`web/data/idioms.json`, 509개 성어)

## 데이터 소스 API
- Publication API: `b.jw-cdn.org/apis/pub-media/GETPUBMEDIALINKS?pub=w&issue=YYYYMM&langwritten=CHS`
- WOL Article API: `wol.jw.org/wol/d/r23/lp-chs/{documentId}`
- WOL 중국어 코드: `r23/lp-chs` (간체), 인증 불필요

## 개발 서버
- 포트: 3333
- 실행: `cd web && npx next dev --port 3333`
