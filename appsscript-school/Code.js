// ================================================
// 2026 월드컵 페어플레이 관찰 기록 — Apps Script 백엔드
// ================================================
// 배포: 확장 프로그램 > Apps Script > 배포 > 새 배포
//       유형: 웹 앱 / 실행 계정: 나 / 액세스: 모든 사용자
// ================================================

// 수업 코드를 정규화 (공백·슬래시·따옴표 → 하이픈)
function normalizeCode(code) {
  return String(code || "")
    .trim()
    .replace(/[\s/\\'"]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

// 시트 이름은 최대 100자 + 예약 문자 제거
function sheetName(code) {
  return ("기록_" + code).slice(0, 100).replace(/[:\\/\[\]*?]/g, "");
}

// 해당 코드의 시트를 가져오거나 없으면 새로 만들기
function getOrCreateSheet(ss, code) {
  var name = sheetName(code);
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow([
      "제출시각", "수업코드", "학반", "이름",
      "팀A", "팀B",
      "악수·인사(A)", "부상중단(A)", "상대일으킴(A)", "판정승복(A)", "절제세리머니(A)",
      "패자위로(A)", "정직양보(A)", "최선(A)", "의무팀배려(A)", "국가존중(A)", "합계(A)",
      "악수·인사(B)", "부상중단(B)", "상대일으킴(B)", "판정승복(B)", "절제세리머니(B)",
      "패자위로(B)", "정직양보(B)", "최선(B)", "의무팀배려(B)", "국가존중(B)", "합계(B)",
      "메모"
    ]);
    // 헤더 스타일
    var header = sheet.getRange(1, 1, 1, sheet.getLastColumn());
    header.setBackground("#0f3460");
    header.setFontColor("white");
    header.setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// CORS 허용 헤더 포함 JSON 응답
function jsonResponse(data) {
  var output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}

// ================================================
// 핵심 로직 (fetch 경로 doPost/doGet 과 google.script.run 경로가 공용)
// ================================================

function submitRecordCore(body) {
  body = body || {};
  var code = normalizeCode(body.code);
  if (!code) return { ok: false, error: "수업 코드가 없습니다." };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateSheet(ss, code);

  var ca = body.countsA || {};
  var cb = body.countsB || {};
  var ids = ["fp1","fp2","fp3","fp4","fp5","fp6","fp7","fp8","fp9","fp10"];

  var row = [
    new Date().toLocaleString("ko-KR"),
    code,
    body.cls || "",
    body.name || "",
    body.teamA || "",
    body.teamB || ""
  ];
  ids.forEach(function(id) { row.push(Number(ca[id] || 0)); });
  row.push(Number(body.totalA || 0));
  ids.forEach(function(id) { row.push(Number(cb[id] || 0)); });
  row.push(Number(body.totalB || 0));
  row.push(body.memo || "");

  sheet.appendRow(row);
  return { ok: true, message: "제출 완료" };
}

function queryRecordsCore(rawCode) {
  var code = normalizeCode(rawCode);
  if (!code) return { ok: false, error: "수업 코드가 없습니다." };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName(code));
  if (!sheet) return { ok: true, records: [], total: 0 };

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var records = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[3]) continue; // 이름 없는 행 건너뜀
    var record = {};
    headers.forEach(function(h, idx) { record[h] = row[idx]; });
    record["_row"] = i + 1;
    records.push(record);
  }
  records.reverse(); // 최신 순
  return { ok: true, records: records, total: records.length };
}

// 전체 시트(기록_*)를 팀별로 합산 — 대시보드 "전체 합산"용
function queryAllCore() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  var agg = {}; // 팀명 -> {sum, count}
  var totalRecords = 0;
  var codeCount = 0;

  function addTeam(name, val) {
    name = String(name || "").trim();
    if (!name) return;
    if (!agg[name]) agg[name] = { sum: 0, count: 0 };
    agg[name].sum += val;
    agg[name].count += 1;
  }

  sheets.forEach(function(sheet) {
    if (sheet.getName().indexOf("기록_") !== 0) return;
    codeCount++;
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) return;
    var h = data[0];
    var iName = h.indexOf("이름");
    var iTA = h.indexOf("팀A"), iTB = h.indexOf("팀B");
    var iSA = h.indexOf("합계(A)"), iSB = h.indexOf("합계(B)");
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (iName >= 0 && !row[iName]) continue; // 이름 없는 행 건너뜀
      totalRecords++;
      addTeam(row[iTA], Number(row[iSA] || 0));
      addTeam(row[iTB], Number(row[iSB] || 0));
    }
  });

  var teams = Object.keys(agg).map(function(n) {
    var a = agg[n];
    return { name: n, sum: a.sum, count: a.count, avg: a.count ? (a.sum / a.count) : 0 };
  });
  return { ok: true, teams: teams, totalRecords: totalRecords, codeCount: codeCount };
}

function deleteRecordCore(rawCode, rowNum) {
  var code = normalizeCode(rawCode);
  rowNum = parseInt(rowNum, 10);
  if (!code || !rowNum) return { ok: false, error: "잘못된 요청입니다." };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName(code));
  if (!sheet) return { ok: false, error: "시트를 찾을 수 없습니다." };

  sheet.deleteRow(rowNum);
  return { ok: true, message: "삭제 완료" };
}

// 최초 1회 권한 승인용: 편집기에서 이 함수를 실행 → 스프레드시트 접근 권한 허용
function authorize() {
  return SpreadsheetApp.getActiveSpreadsheet().getName();
}

// ── google.script.run 용 (도메인 제한 웹앱에서 동일출처 호출) ──
function submitRecord(payload) { return submitRecordCore(payload); }
function queryRecords(code)    { return queryRecordsCore(code); }
function queryAllRecords()     { return queryAllCore(); }
function deleteRecord(code, rowNum) { return deleteRecordCore(code, rowNum); }

// ── POST: 학생 제출 (fetch 경로) ──
function doPost(e) {
  try {
    return jsonResponse(submitRecordCore(JSON.parse(e.postData.contents)));
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}

// ── GET: 교사용 조회 또는 교사용 HTML 서빙 ──
function doGet(e) {
  var action = (e.parameter && e.parameter.action) || "";

  // action=query: 수업 코드별 기록 조회 (JSON)
  if (action === "query") {
    return doQuery(e);
  }

  // action=queryall: 전체 시트 팀별 합산 (JSON) — 대시보드용
  if (action === "queryall") {
    return doQueryAll(e);
  }

  // action=delete: 행 삭제
  if (action === "delete") {
    return doDelete(e);
  }

  var view = (e.parameter && e.parameter.view) || "";

  // view=teacher: 교사용 조회 웹페이지 서빙
  if (view === "teacher") {
    return HtmlService
      .createHtmlOutputFromFile("교사용_조회")
      .setTitle("페어플레이 관찰 기록 조회")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  // view=results: 경기결과 + 페어플레이 종합 웹페이지 서빙
  if (view === "results") {
    return HtmlService
      .createHtmlOutputFromFile("결과")
      .setTitle("2026 월드컵 결과 & 페어플레이")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  // 기본: 학생용 웹페이지 서빙
  return HtmlService
    .createHtmlOutputFromFile("학생용")
    .setTitle("2026 월드컵 페어플레이 관찰 기록")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doQuery(e) {
  try {
    return jsonResponse(queryRecordsCore(e.parameter.code));
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}

function doQueryAll(e) {
  try {
    return jsonResponse(queryAllCore());
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}

function doDelete(e) {
  try {
    return jsonResponse(deleteRecordCore(e.parameter.code, e.parameter.row));
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}
