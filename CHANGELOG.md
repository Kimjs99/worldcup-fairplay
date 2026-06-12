# Changelog

이 프로젝트의 주요 변경 사항을 기록합니다. (형식: [Keep a Changelog](https://keepachangelog.com/ko/), 버전: [유의적 버전](https://semver.org/lang/ko/))

버전은 앱 배포 버전(웹앱 푸터 · clasp 배포 설명)과 동일하게 매깁니다.

## [v1.4.0] - 2026-06-12 (학교 Apps Script `AKfycbzP` @4 · 개인 `AKfycbwK` @10 · GitHub Pages)

### ✨ Features
- 결과 페이지 순위표를 **경기결과로부터 직접 집계**하도록 전환 — TheSportsDB `lookuptable.php`(무료티어 갱신 지연·누락) 의존 제거 (`b497c9e`)
  - `eventsround.php?id=4429&s=2026&r=1,2,3`로 조별리그 72경기 전부 수신(엔드포인트당 24경기, `eventspast`의 최근 15경기 제한 회피)
  - **FIFA 2026 순위판정 규칙** 구현: ①승점 → ②전체 골득실 → ③전체 다득점 → (동률 시) ④맞대결 승점 → ⑤맞대결 골득실 → ⑥맞대결 다득점 (이후 페어플레이 점수·추첨은 데이터 없어 동률 처리)
  - 신규 함수 `computeStandings`/`sortGroup`/`sortHeadToHead`, 출력 객체는 기존 `mapStand` 형태 유지 → 렌더·대시보드 무수정
  - 계산 결과가 없으면 `lookuptable` 폴백, 경기 전(NS) 팀도 등록해 조마다 4팀 풀 표시
  - 라이브 검증: Apps Script `AKfycbwK` @10 + GitHub Pages 브라우저 확인, A조 Mexico(GD+2) > South Korea(GD+1) 정렬 정확

  - **학교 도메인 배포(`AKfycbzP` @4, 실사용 백엔드)에도 반영 완료** — 학교 계정(`kimjs@hwajeop.ms.kr`) clasp 로그인 후 별도 dir에서 push+deploy. 배포 전 `clasp pull` 백업·diff로 `appsscript/`가 학교 라이브의 순수 상위호환임을 확인. 브라우저로 대시보드 탭·조별 순위표 정상 렌더 검증.

## [v1.3.0] - 2026-06-12 (Apps Script 배포 @9)

### ✨ Features
- 결과 페이지(`?view=results`)에 **📊 대시보드 탭** 추가 (`13005b8`)
  - 팀별 페어플레이 데이터 표 — 한글 팀명을 공식 영문명과 자동 매칭(`TEAM_KO_EN` 48팀), 공식 승점·승무패 병기
  - 페어플레이 평균 ↔ 승점 **상관관계 산점도** + Pearson 상관계수 + 자동 해석문
  - 다음 경기 **휴리스틱 예측** — 페어플레이 평균·승점 6:4 가중합으로 우세팀·신뢰도 제시 (교육용 가설 명시)
  - 데이터 범위 토글: 수업 코드별 / 전체 합산
- 백엔드 `queryAllCore` + `?action=queryall` — 모든 수업 시트(`기록_*`)를 팀별로 합산하는 전체 집계 API (`13005b8`)

## [v1.2.0] - 2026-06-12 (Apps Script 배포 @8)

### ✨ Features
- 순위표를 TheSportsDB `strGroup` 기준 **조별(A조~L조) 미니 순위표로 분리** 표시 (`13005b8`)
  - 기존엔 48개 팀을 한 테이블에 나열해 조 내 순위(`intRank`)가 반복돼 기준이 불명확했음

## [v1.1.0] - 2026-06-12

### ✨ Features
- **경기결과 + 페어플레이 결과 페이지**(`결과.html` / `?view=results`) 추가 (`52ca465`)
  - 공식 월드컵 결과(다음 경기·최근 결과·순위)는 TheSportsDB를 브라우저에서 직접 fetch(+localStorage 15분 캐시)
  - 수업 코드별 팀 페어플레이 점수 합계 순위 병기
- 페이지 간 이동 링크를 **절대주소 + `target="_blank"`**로 변경 — Apps Script 샌드박스(googleusercontent)의 "현재 파일을 열 수 없습니다" 오류 회피 (`52ca465`)

## [v1.0.0] - 2026-06-12

### ✨ Features
- 학생용·교사용을 **Apps Script 단일 배포로 통합** — 하나의 `/exec`가 백엔드 + 모든 HTML을 서빙, `doGet` 라우팅으로 분기(`?view=teacher` 등). 학교망의 github.io 차단 우회 (`a74dd9b`)
- 월드컵 페어플레이 기록 **초기 소스 추가** — 학생용·교사용 HTML, Apps Script 백엔드(`Code.gs`), 배포 가이드 (`20326a0`)
