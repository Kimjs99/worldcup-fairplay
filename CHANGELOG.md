# Changelog

All notable changes to this project will be documented in this file.

## [v1.0.1] - 2026-06-12

2026 FIFA 북중미 월드컵 페어플레이 관찰 기록 — 첫 정식 릴리스. 학생용·교사용 단일 HTML과 Google Apps Script 백엔드로 구성되며, GitHub Pages와 Apps Script(학교망 우회)에 이중 배포된다.

### ✨ Features
- 월드컵 페어플레이 관찰 기록 학생용 페이지 추가 (`9da452c`)
- 교사용 조회 페이지 추가 및 수업 코드 예시 덕풍중→화접중 (`2971aba`)
- 교사용 안내에 교사용 조회 페이지 링크 버튼 추가 (`d0aa66c`)
- 푸터에 버전(v1.0.0) 및 저작권 문구 추가 — 학생용·교사용 (`c03a05e`)
- 푸터 저작권자에 화접중학교·제작자(Kimjs99) 표기 추가 (`2f8c9cf`)

### 🐛 Bug Fixes
- 교사용 조회 네트워크 오류 수정 — 정적 호스팅 시 Apps Script URL을 직접 호출 (`b8eeb80`)
- 교사용 조회 `SCRIPT_URL`을 `/exec` 하드코딩으로 고정해 어디서 열려도 작동 (`4a3d0be`)
- 교사용 바로가기를 Apps Script `?view=teacher` 절대주소로 변경 — 샌드박스 Google Drive 오류 해결 (`2d24997`)
- 수업 코드 예시 dpms→hjms (화접중 약자 통일) (`c192f1a`)

### 🔧 Chores
- `교사용_조회.html` → `teacher.html` 파일명 변경 (영문 URL) (`11b0fb5`)
