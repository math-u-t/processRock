/**
 * Service Worker (Background Script)
 * Manifest V3対応
 *
 * 役割：
 * - 拡張機能インストール時の初期設定
 * - 設定のデフォルト値管理
 * - 将来的な機能拡張のためのメッセージハンドリング
 */

// デフォルト設定
const DEFAULT_SETTINGS = {
  // 各操作の有効/無効設定（false = 無効化しない、true = 無効化する）
  disableContextMenu: false,      // 右クリックメニュー
  disableTextSelection: false,    // テキスト選択
  disableCopy: false,             // コピー操作
  disablePaste: false,            // ペースト操作
  disablePrint: false,            // 印刷操作
  disableDragDrop: false,         // ドラッグ&ドロップ
  disableFormSubmit: false,       // フォーム送信
  disableKeyboardShortcuts: false, // キーボードショートカット

  // ブロックするキーボードショートカットのリスト
  blockedShortcuts: [
    { key: 's', ctrl: true, shift: false, alt: false }, // Ctrl+S
    { key: 'f', ctrl: true, shift: false, alt: false }  // Ctrl+F
  ],

  // ドメイン別設定（ホワイトリスト）
  // キー: ドメイン名、値: true = このドメインでは無効化を適用しない
  whitelist: {
    // 例: "example.com": true
  },

  // グローバル有効/無効スイッチ
  globalEnabled: false  // デフォルトはOFF（何も無効化しない）
};

/**
 * 拡張機能インストール時の処理
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[Service Worker] 拡張機能がインストールされました:', details.reason);

  if (details.reason === 'install') {
    // 初回インストール時：デフォルト設定を保存
    try {
      await chrome.storage.sync.set(DEFAULT_SETTINGS);
      console.log('[Service Worker] デフォルト設定を保存しました');
    } catch (error) {
      console.error('[Service Worker] 設定の保存に失敗:', error);
    }
  } else if (details.reason === 'update') {
    // アップデート時：既存設定とマージ
    try {
      const existingSettings = await chrome.storage.sync.get(null);
      const mergedSettings = { ...DEFAULT_SETTINGS, ...existingSettings };
      await chrome.storage.sync.set(mergedSettings);
      console.log('[Service Worker] 設定を更新しました');
    } catch (error) {
      console.error('[Service Worker] 設定の更新に失敗:', error);
    }
  }
});

/**
 * コンテンツスクリプトからのメッセージを処理
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Service Worker] メッセージを受信:', request);

  if (request.action === 'getSettings') {
    // 設定を取得して返す
    chrome.storage.sync.get(null, (settings) => {
      if (chrome.runtime.lastError) {
        console.error('[Service Worker] 設定取得エラー:', chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ success: true, settings: settings });
      }
    });
    return true; // 非同期レスポンスのため
  }

  if (request.action === 'blockAttempt') {
    // ブロック試行のログ記録（将来的な統計機能用）
    console.log('[Service Worker] ブロック試行:', request.type, 'on', sender.tab?.url);
  }

  return false;
});

/**
 * エラーハンドリング
 */
self.addEventListener('error', (event) => {
  console.error('[Service Worker] エラーが発生しました:', event.error);
});

console.log('[Service Worker] サービスワーカーが起動しました');
