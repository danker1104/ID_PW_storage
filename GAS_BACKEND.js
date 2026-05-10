/*
  Google Apps Script (GAS) Code for "My Account Safe"
  
  설정 방법:
  1. 구글 시트를 엽니다.
  2. 시트의 첫 번째 행(Header)에 다음과 같이 입력합니다 (순서 중요):
     A1: siteName | B1: url | C1: id | D1: password
  3. '확장 프로그램 > Apps Script'를 클릭합니다.
  4. 기존 코드를 모두 지우고 아래 코드를 붙여넣습니다.
  5. 시트 탭 이름을 'Accounts'로 변경하거나 아래 코드의 SHEET_NAME 변수를 수정하세요.
  6. '배포 > 새 배포'를 누릅니다.
  7. 유형 선택: '웹 앱'
  8. 설명: 'Account Safe API v2'
  9. 다음 사용자로 실행: '나'
  10. 액세스 권한이 있는 사용자: '모든 사용자' (중요!)
  11. '배포'를 클릭하고 '웹 앱 URL'을 복사하여 앱의 VITE_GAS_URL 환경 변수에 설정하세요.
*/

const SHEET_NAME = "Accounts";

function getTargetSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.getSheets()[0]; // 시트명을 못 찾으면 첫 번째 시트 사용
  }
  return sheet;
}

function doGet(e) {
  try {
    const sheet = getTargetSheet();
    const range = sheet.getDataRange();
    const data = range ? range.getValues() : [];
    
    if (data.length <= 1) {
      return createJsonResponse([]);
    }

    const headers = data.shift(); // 헤더 제거
    
    const result = data.map((row, index) => {
      // 사이트명과 아이디가 모두 비어있으면 건너뜀
      if (!row[0] && !row[2]) return null; 
      return {
        rowId: index + 2, // 1-indexed, 헤더 제외 시작이 2
        siteName: String(row[0] || "").trim(),
        url: String(row[1] || "").trim(),
        id: String(row[2] || "").trim(),
        password: String(row[3] || "").trim()
      };
    }).filter(item => item !== null);
    
    return createJsonResponse(result);
  } catch (err) {
    return createJsonResponse({ status: "error", message: err.message });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const sheet = getTargetSheet();
    const params = JSON.parse(e.postData.contents);
    const action = params.action;
    
    if (action === "create") {
      sheet.appendRow([
        params.siteName || "",
        params.url || "",
        params.id || "",
        params.password || ""
      ]);
      return createJsonResponse({ status: "success", message: "생성 완료" });
    }
    
    if (action === "update") {
      const rowIndex = Number(params.rowId);
      if (rowIndex && rowIndex > 1) {
        sheet.getRange(rowIndex, 1, 1, 4).setValues([[
          params.siteName || "",
          params.url || "",
          params.id || "",
          params.password || ""
        ]]);
        return createJsonResponse({ status: "success", message: "수정 완료" });
      }
    }
    
    if (action === "delete") {
      const rowIndex = Number(params.rowId);
      
      // 1. rowId로 먼저 시도
      if (rowIndex && rowIndex > 1) {
        const rowData = sheet.getRange(rowIndex, 1, 1, 3).getValues()[0];
        // 안전을 위해 사이트명이나 아이디가 일치하는지 한 번 더 확인 (선택 사항)
        // 여기서는 바로 삭제를 진행합니다.
        sheet.deleteRow(rowIndex);
        return createJsonResponse({ status: 'success', message: '삭제 완료' });
      }
      
      // 2. rowId가 없거나 실패한 경우 검색하여 삭제 (필드 기준)
      const siteName = params.siteName;
      const loginId = params.id;
      
      if (siteName || loginId) {
        const data = sheet.getDataRange().getValues();
        for (let i = 1; i < data.length; i++) {
          if (data[i][0] == siteName && data[i][2] == loginId) {
            sheet.deleteRow(i + 1);
            return createJsonResponse({ status: 'success', message: '검색 후 삭제 완료' });
          }
        }
      }
    }
    
    return createJsonResponse({ status: "error", message: "올바르지 않은 액션입니다." });
  } catch (err) {
    return createJsonResponse({ status: "error", message: err.message });
  }
}
