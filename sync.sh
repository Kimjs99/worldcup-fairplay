#!/usr/bin/env bash
# sync.sh — 단일 소스(root HTML + files/Code.gs)를 학교 Apps Script 배포본(appsscript-school/)으로 전파.
#
#   소스(편집은 여기서만):
#     index.html        학생용
#     teacher.html      교사용
#     results.html      결과
#     files/Code.gs     백엔드
#   생성물(절대 직접 편집 금지 — 이 스크립트가 덮어씀):
#     appsscript-school/학생용.html / 교사용_조회.html / 결과.html / Code.js
#
# 사용법:
#   ./sync.sh          소스 → 배포본 복사(동기화)
#   ./sync.sh --check  복사하지 않고 드리프트만 검사(다르면 비정상 종료) — 배포·CI 전 점검용
set -euo pipefail
cd "$(dirname "$0")"

DEST="appsscript-school"
# "소스 경로|대상 경로" 매핑
MAP=(
  "index.html|$DEST/학생용.html"
  "teacher.html|$DEST/교사용_조회.html"
  "results.html|$DEST/결과.html"
  "files/Code.gs|$DEST/Code.js"
)

mode="${1:-sync}"
drift=0
changed=0

for pair in "${MAP[@]}"; do
  src="${pair%%|*}"
  dst="${pair##*|}"
  if [[ ! -f "$src" ]]; then echo "❌ 소스 없음: $src" >&2; exit 2; fi
  if [[ "$mode" == "--check" ]]; then
    if ! diff -q "$src" "$dst" >/dev/null 2>&1; then
      echo "⚠️  드리프트: $dst ↛ $src"
      drift=1
    fi
  else
    if ! diff -q "$src" "$dst" >/dev/null 2>&1; then
      cp "$src" "$dst"
      echo "↻ $src → $dst"
      changed=1
    fi
  fi
done

if [[ "$mode" == "--check" ]]; then
  if [[ "$drift" -eq 1 ]]; then
    echo "→ 동기화 필요: ./sync.sh 실행" >&2
    exit 1
  fi
  echo "✅ 배포본이 소스와 일치합니다."
else
  [[ "$changed" -eq 0 ]] && echo "✅ 이미 최신 — 변경 없음." || echo "✅ 동기화 완료. 배포: cd $DEST && clasp push -f && clasp deploy --deploymentId <ID> --description \"vX.Y.Z\""
fi
