# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

2026 FIFA 북중미 월드컵 체육 학습자료. 학생이 조별경기의 페어플레이를 관찰·기록하고(학생용), 교사가 수업 코드로 제출 기록을 조회(교사용)하는 앱. **빌드 단계가 없는 단일 HTML 프론트엔드 + Google Apps Script 백엔드** 구조.

## 저장소 구조 (2026-06-13 단일 저장소로 통합됨)

이 저장소(`worldcup-fairplay`, https://github.com/Kimjs99/worldcup-fairplay)가 **프로젝트의 유일한 home**이다. 과거엔 상위 `workspace-portal` 모노레포의 `월드컵 페어플레이 기록/` 폴더에 소스가 있고 Pages만 별도 저장소였으나, 전체를 이 저장소로 마이그레이션했다.

**단일 소스 원칙 (2026-06-13 리팩토링):** HTML은 **루트에서만 편집**하고, 백엔드는 **`files/Code.gs`에서만 편집**한다. 배포본(`appsscript-school/`)은 `sync.sh`로 생성하는 산출물이므로 직접 고치지 않는다.

| 경로 | 역할 | 편집 |
|------|------|------|
| 루트 `index.html`·`teacher.html`·`results.html` | **HTML 소스 = GitHub Pages 배포본** (index=학생용, teacher=교사용, results=결과). Pages는 루트에서 서빙 | ✏️ **여기서 편집** |
| `files/Code.gs` | 백엔드 소스 (Apps Script `doGet`/`doPost`) | ✏️ **여기서 편집** |
| `files/배포가이드.md` | 배포 절차 원문 | 문서 |
| `appsscript-school/` | **★학교 도메인 clasp 배포본** (`Code.js`, `학생용.html`, `교사용_조회.html`, `결과.html`, `appsscript.json`, `.clasp.json`). 실사용 백엔드(`AKfycbzP`) | 🚫 직접 편집 금지 — `sync.sh`가 생성 |
| `sync.sh` | 소스 → 배포본 전파 스크립트 (`./sync.sh`, 점검은 `./sync.sh --check`) | — |

- **편집은 소스(루트 HTML · `files/Code.gs`) 한 곳에서만.** 그 다음 `./sync.sh`로 `appsscript-school/`(한글 파일명)을 생성한다. 배포본을 손으로 고치지 말 것(다음 sync 때 덮어써짐).
- `.clasp.json`은 머신 종속(절대 rootDir)이라 git 추적 제외(`.gitignore`). scriptId·deploymentId는 이 문서에 기록돼 있어 복구 가능.
- 과거엔 같은 HTML이 root·`files/`·`appsscript/`·`appsscript-school/` 4벌로 중복돼 수동 동기화 부담·드리프트가 있었으나, 단일 소스 + `sync.sh`로 정리하고 레거시 개인 배포본(`appsscript/`)은 제거했다.

## 이중 배포 구조 (왜 두 채널인가)

같은 앱을 두 곳에 배포한다. **학교망에서 github.io가 차단되기 때문**에 Apps Script 채널이 1차다.

- **Apps Script 웹앱** (학교망 OK): 하나의 배포가 백엔드 + 세 HTML을 모두 서빙. `Code.gs`의 `doGet` 라우팅으로 분기.
  - 기본 `/exec` → 학생용 / `?view=teacher` → 교사용 / `?view=results` → 결과 / `?action=query&code=…` → 기록 JSON / `?action=delete` → 행 삭제
  - `doPost` → 학생 제출을 스프레드시트에 저장
- **GitHub Pages** (교외용 백업): 정적 HTML만. 백엔드는 동일한 Apps Script `/exec`를 호출.

## 배포 명령어

실사용 백엔드는 **학교(도메인제한) Apps Script** 하나뿐이다. (개인 레거시 스크립트는 2026-06-13 정리에서 폴더째 제거 — 필요 시 아래 ID로 복구 가능하나 사용 안 함.)

| 구분 | Script ID | deploymentId | 비고 |
|------|-----------|--------------|------|
| **★ 실사용(학교)** | `1knqnq2iB2BFso_5ySNcwzlkLcw9NpVn1FFVpo9ZmCwZuJgyA8Pxz4kc8` | `AKfycbzPtoua2JSVBBiMkcRO8liL-GxXmjDJFmUYluYvZC63xkKU7XPAx2BItx95K1rZ8jDi` | 소유 `kimjs@hwajeop.ms.kr`. 모든 HTML 링크·데이터가 여기로. URL=`/a/macros/hwajeop.ms.kr/s/AKfycbzPtoua…/exec` |
| 레거시(개인, 제거됨) | `1sc9D0yDiT4V3Kgh2dh9Qx-v1lywY1JcQaQxgMirLkVGXt6cY9BbnqTv2` | `AKfycbwK_zMW331IT9VeuDhfZnKC_qzO8H2Gnw6CkP8cP4NosPvDrdJyxR79qMyRJcwUTiEBSQ` | 미사용 |

```bash
cd ~/Projects/worldcup-fairplay

# 0) 소스(루트 HTML·files/Code.gs)를 배포본으로 전파
./sync.sh

# 1) 학교 계정 로그인 (개인 Gmail은 "The caller does not have permission")
clasp login   # 브라우저에서 kimjs@hwajeop.ms.kr 선택

# 2) appsscript-school/ 에서 push/deploy
cd appsscript-school
clasp pull    # ★먼저 라이브 백업·diff로 "순수 상위호환"(학교 고유 변경 없음) 확인.
              #   pull이 배포본을 덮어쓰므로, 확인 후 다시 `cd .. && ./sync.sh`로 내 소스 복원.
clasp push -f
clasp deploy --deploymentId AKfycbzPtoua2JSVBBiMkcRO8liL-GxXmjDJFmUYluYvZC63xkKU7XPAx2BItx95K1rZ8jDi \
  --description "vX.Y.Z 설명"

# GitHub Pages 배포 = 저장소 push (루트 index/teacher/results 서빙)
cd ~/Projects/worldcup-fairplay && git push origin main
```

- **재배포는 반드시 위 학교 `--deploymentId`(기존 배포)로** 한다. 새 deploymentId면 `/exec` URL이 바뀌어 학생 공유 링크가 깨진다.
- **`clasp push -f` 전 반드시 `clasp pull`로 라이브를 백업·diff**해 내 소스가 순수 상위호환인지 확인한다. `clasp pull`은 `appsscript-school/`을 라이브로 덮어쓰므로, 확인 뒤 `./sync.sh`로 내 소스를 다시 얹고 push한다. (배포본은 sync 산출물이라 안전)
- `./sync.sh --check`로 배포 전 소스↔배포본 드리프트를 점검할 수 있다.
- 정적 HTML이라 로컬 빌드/lint/테스트 도구가 전혀 없다. 찾지 말 것. HTML 내 JS 문법만 점검하려면 `<script>` 블록을 빼내 `node --check`로 확인하고, 브라우저로 직접 열어 동작을 본다.
- 배포 후 점검: `curl -sL ".../exec?view=results"`로 서빙 HTML에 신규 함수(예: `computeStandings`) 포함 여부 확인(전파 1~3분). 단 공식 경기 데이터·렌더는 클라이언트 fetch+샌드박스 iframe이라 curl로 안 보이니 **실제 렌더는 브라우저 스크린샷으로** 확인.

## 클라이언트 ↔ 백엔드 연동 규칙 (반복해서 발목 잡힌 지점)

- 두 HTML 모두 `APPS_SCRIPT_URL` / `SCRIPT_URL`에 **`/exec` 절대주소를 하드코딩**한다. `window.location.href` 기반으로 잡으면 정적 호스팅에서 자기 자신을 호출해 네트워크 오류가 난다.
- 제출 POST는 `Content-Type: text/plain` 단순요청으로 보낸다(프리플라이트 회피).
- **페이지 간 이동 링크는 절대주소 + `target="_blank"`로만 작성한다.** 상대경로(`teacher.html`)는 Apps Script 샌드박스(googleusercontent)에서 "현재 파일을 열 수 없습니다"(Google Drive) 오류를 일으킨다.

## 경기결과 페이지 (`결과.html` / `?view=results`)

- 공식 월드컵 결과(다음경기·최근결과·순위) + 수업코드별 페어플레이 팀 순위를 **병기**하는 공개 페이지.
- **공식 데이터는 백엔드를 거치지 않고 브라우저가 [TheSportsDB](https://www.thesportsdb.com)를 직접 fetch한다** (+localStorage 15분 캐시). 리그 ID `4429`=FIFA World Cup, 무료 공개키 `3`, 엔드포인트 `lookuptable.php` / `eventspastleague.php` / `eventsnextleague.php`.
- **왜 직접 호출인가**: 처음엔 Apps Script `UrlFetchApp`로 서버사이드 호출했으나, `script.external_request` 새 권한을 소유자가 승인해도 배포 웹앱에 반영되지 않는 문제가 반복됐다. TheSportsDB가 `access-control-allow-origin: *` 라서 클라이언트 직접 호출로 전환 → **권한 자체가 불필요**. 공개 읽기전용 데이터에 `UrlFetchApp`를 쓰지 말 것. (Apps Script 샌드박스 iframe 안에서도 외부 CORS fetch 정상 동작 확인됨.)
- 페어플레이 집계는 기존 `?action=query`(SpreadsheetApp, 이미 인증됨)를 재사용해 팀A/팀B별 `합계(A)`/`합계(B)`를 합산·정렬한다.
- **검증은 반드시 실제 브라우저로** 한다. `curl …/exec?view=results`는 HTML 껍데기만 주고 공식 경기 데이터는 클라이언트 fetch라 안 보인다. Apps Script는 콘텐츠를 샌드박스 iframe에 넣어 `get_page_text`로도 내부가 안 잡히니 스크린샷으로 확인.

## 데이터 모델

- 스프레드시트 1개에 **수업 코드별로 시트를 자동 생성**(`getOrCreateSheet`). 시트명은 코드 기반으로 정규화·축약.
- 수업 코드는 `normalizeCode`로 정규화(공백·슬래시·따옴표 → 하이픈, 소문자화). 학생용·교사용·백엔드가 **동일한 정규화 규칙**을 공유해야 매칭된다.
- 페어플레이 관찰 항목은 10개 고정 라벨이며, 학생용 HTML과 교사용 HTML 양쪽에 같은 배열로 박혀 있다(`fairplayLabels`).

## 주의

- **교사용 링크(`?view=teacher`)는 학생에게 공유 금지** — 기록 삭제 기능 포함.
- 웹앱 권한: 실행=나(USER_DEPLOYING) / 접근=모든 사용자 익명(ANYONE_ANONYMOUS). `appsscript.json`에 정의돼 있으나, 기존 배포의 접근 설정은 배포 시점에 고정되므로 매니페스트만 바꿔서는 변경되지 않을 수 있다.
- 자동 배포는 기본 금지 정책이나, 이 프로젝트는 사용자가 clasp 자동배포를 명시 승인한 건이다.

배포 절차 원문은 `files/배포가이드.md` 참고.
