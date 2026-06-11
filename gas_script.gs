// === Google Apps Script (GAS) ===
// 毎日、お昼の自動ダイジェスト生成が完了した後に実行されるトリガーを設定してください。

const CLOUDFLARE_WORKER_URL = 'https://your-worker-subdomain.workers.dev/api/update'; // ★ご自身のCloudflare Worker URLに書き換えてください
const API_SECRET_KEY = 'YOUR_SECRET_API_KEY_HERE'; // ★Workersの環境変数に設定したAPI_SECRET_KEYと同じ値を設定してください

function postDailyDigestToCloudflare() {
  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const fileName = 'Laos Daily News Digest - ' + today;
  const files = DriveApp.getFilesByName(fileName);
  
  if (!files.hasNext()) {
    Logger.log('本日のダイジェストドキュメントが見つかりません: ' + fileName);
    return;
  }
  
  const file = files.next();
  const doc = DocumentApp.openById(file.getId());
  const title = doc.getName();
  const bodyText = doc.getBody().getText();
  
  if (!bodyText || bodyText.trim() === '') {
    Logger.log('ドキュメントの中身が空です。');
    return;
  }
  
  const payload = {
    title: 'ラオス日刊ニュースダイジェスト - ' + today,
    content: bodyText,
    date: today
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + API_SECRET_KEY
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(CLOUDFLARE_WORKER_URL, options);
    const responseCode = response.getResponseCode();
    const responseBody = response.getContentText();
    
    if (responseCode === 200) {
      Logger.log('Cloudflare Workersへの自動投稿に成功しました！');
      Logger.log('Response: ' + responseBody);
    } else {
      Logger.log('送信エラー (ステータスコード: ' + responseCode + '): ' + responseBody);
    }
  } catch (e) {
    Logger.log('例外エラーが発生しました: ' + e.toString());
  }
}
