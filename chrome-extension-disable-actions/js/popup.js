/**
 * Popup Script
 * 拡張機能のポップアップUIを制御
 */

(function() {
  'use strict';

  // DOM要素
  const elements = {
    currentDomain: document.getElementById('currentDomain'),
    globalToggle: document.getElementById('globalToggle'),
    statusText: document.getElementById('statusText'),
    statusDetail: document.getElementById('statusDetail'),
    openOptionsBtn: document.getElementById('openOptionsBtn')
  };

  /**
   * 現在のドメインを取得
   */
  async function getCurrentDomain() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url) {
        const url = new URL(tab.url);
        const hostname = url.hostname;
        const parts = hostname.split('.');
        if (parts.length >= 2) {
          return parts.slice(-2).join('.');
        }
        return hostname;
      }
    } catch (error) {
      console.error('[Popup] ドメイン取得エラー:', error);
    }
    return 'Unknown';
  }

  /**
   * 設定を読み込んでUIを更新
   */
  async function loadSettings() {
    try {
      const settings = await chrome.storage.sync.get(null);
      const currentDomain = await getCurrentDomain();

      // ドメインを表示
      elements.currentDomain.textContent = currentDomain;

      // グローバルトグルの状態を設定
      elements.globalToggle.checked = settings.globalEnabled || false;

      // ステータスを更新
      updateStatus(settings, currentDomain);
    } catch (error) {
      console.error('[Popup] 設定読み込みエラー:', error);
      elements.statusText.textContent = 'エラー';
      elements.statusDetail.textContent = '設定の読み込みに失敗しました';
    }
  }

  /**
   * ステータステキストを更新
   */
  function updateStatus(settings, domain) {
    const isGlobalEnabled = settings.globalEnabled || false;
    const isWhitelisted = settings.whitelist && settings.whitelist[domain];

    if (!isGlobalEnabled) {
      elements.statusText.textContent = 'OFF';
      elements.statusDetail.textContent = 'すべての無効化機能は停止しています';
    } else if (isWhitelisted) {
      elements.statusText.textContent = 'ホワイトリスト';
      elements.statusDetail.textContent = `${domain} では無効化を適用しません`;
    } else {
      // 有効な機能をカウント
      const enabledFeatures = [
        settings.disableContextMenu && '右クリック',
        settings.disableTextSelection && 'テキスト選択',
        settings.disableCopy && 'コピー',
        settings.disablePaste && 'ペースト',
        settings.disablePrint && '印刷',
        settings.disableDragDrop && 'ドラッグ&ドロップ',
        settings.disableFormSubmit && 'フォーム送信',
        settings.disableKeyboardShortcuts && 'ショートカット'
      ].filter(Boolean);

      if (enabledFeatures.length === 0) {
        elements.statusText.textContent = 'ON（無効化なし）';
        elements.statusDetail.textContent = '有効な機能はありません';
      } else {
        elements.statusText.textContent = 'ON';
        elements.statusDetail.textContent = `${enabledFeatures.length}個の機能が有効です`;
      }
    }
  }

  /**
   * グローバルトグルの変更を処理
   */
  async function handleGlobalToggle() {
    const isEnabled = elements.globalToggle.checked;

    try {
      await chrome.storage.sync.set({ globalEnabled: isEnabled });
      console.log('[Popup] グローバル設定を更新:', isEnabled);

      // UIを更新
      const settings = await chrome.storage.sync.get(null);
      const currentDomain = await getCurrentDomain();
      updateStatus(settings, currentDomain);

      // 現在のタブをリロード
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.id) {
        chrome.tabs.reload(tab.id);
      }
    } catch (error) {
      console.error('[Popup] 設定保存エラー:', error);
    }
  }

  /**
   * オプションページを開く
   */
  function openOptions() {
    chrome.runtime.openOptionsPage();
  }

  /**
   * イベントリスナーを登録
   */
  function registerEventListeners() {
    elements.globalToggle.addEventListener('change', handleGlobalToggle);
    elements.openOptionsBtn.addEventListener('click', openOptions);
  }

  /**
   * 初期化
   */
  function init() {
    console.log('[Popup] ポップアップを初期化します');
    loadSettings();
    registerEventListeners();
  }

  // DOMContentLoaded後に初期化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
