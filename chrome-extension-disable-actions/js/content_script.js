/**
 * Content Script
 * ウェブページに注入され、ユーザーが設定した操作を無効化するスクリプト
 *
 * セキュリティ注意事項：
 * - このスクリプトはページのコンテキストで実行されます
 * - ユーザーデータを外部に送信しません
 * - ページのセキュリティ機能（CSP、Same-Origin Policy）には影響を与えません
 * - あくまでユーザーの操作体験を調整するものです
 */

(function() {
  'use strict';

  // 設定オブジェクト
  let settings = null;
  let currentDomain = null;

  /**
   * 現在のドメインを取得
   */
  function getCurrentDomain() {
    try {
      const hostname = window.location.hostname;
      // サブドメインを除いたルートドメインを取得
      const parts = hostname.split('.');
      if (parts.length >= 2) {
        return parts.slice(-2).join('.');
      }
      return hostname;
    } catch (error) {
      console.error('[Content Script] ドメイン取得エラー:', error);
      return null;
    }
  }

  /**
   * 現在のドメインがホワイトリストに含まれているかチェック
   */
  function isWhitelisted() {
    if (!settings || !settings.whitelist) return false;
    return settings.whitelist[currentDomain] === true;
  }

  /**
   * 設定を読み込む
   */
  async function loadSettings() {
    try {
      const result = await chrome.storage.sync.get(null);
      settings = result;
      currentDomain = getCurrentDomain();

      console.log('[Content Script] 設定を読み込みました:', settings);
      console.log('[Content Script] 現在のドメイン:', currentDomain);
      console.log('[Content Script] ホワイトリスト状態:', isWhitelisted());

      // 設定に応じてイベントリスナーを登録
      if (settings.globalEnabled && !isWhitelisted()) {
        registerEventListeners();
      } else {
        console.log('[Content Script] 無効化機能はOFFまたはホワイトリスト対象のため、何もしません');
      }
    } catch (error) {
      console.error('[Content Script] 設定の読み込みに失敗しました:', error);
      // フォールバック: 何もブロックしない
      settings = { globalEnabled: false };
    }
  }

  /**
   * イベントリスナーを登録
   */
  function registerEventListeners() {
    console.log('[Content Script] イベントリスナーを登録します');

    // 右クリック（コンテキストメニュー）
    if (settings.disableContextMenu) {
      document.addEventListener('contextmenu', handleContextMenu, true);
      console.log('[Content Script] 右クリック無効化を有効化');
    }

    // テキスト選択
    if (settings.disableTextSelection) {
      document.addEventListener('selectstart', handleSelectStart, true);
      document.addEventListener('mousedown', handleMouseDown, true);
      // CSSでも選択を無効化
      injectStyles(`
        * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }
      `);
      console.log('[Content Script] テキスト選択無効化を有効化');
    }

    // コピー
    if (settings.disableCopy) {
      document.addEventListener('copy', handleCopy, true);
      console.log('[Content Script] コピー無効化を有効化');
    }

    // ペースト
    if (settings.disablePaste) {
      document.addEventListener('paste', handlePaste, true);
      console.log('[Content Script] ペースト無効化を有効化');
    }

    // 印刷
    if (settings.disablePrint) {
      window.addEventListener('beforeprint', handleBeforePrint, true);
      console.log('[Content Script] 印刷無効化を有効化');
    }

    // ドラッグ&ドロップ
    if (settings.disableDragDrop) {
      document.addEventListener('dragstart', handleDragStart, true);
      document.addEventListener('drop', handleDrop, true);
      console.log('[Content Script] ドラッグ&ドロップ無効化を有効化');
    }

    // フォーム送信
    if (settings.disableFormSubmit) {
      document.addEventListener('submit', handleSubmit, true);
      console.log('[Content Script] フォーム送信無効化を有効化');
    }

    // キーボードショートカット
    if (settings.disableKeyboardShortcuts) {
      document.addEventListener('keydown', handleKeyDown, true);
      console.log('[Content Script] キーボードショートカット無効化を有効化');
    }
  }

  /**
   * スタイルを注入
   */
  function injectStyles(css) {
    const style = document.createElement('style');
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  }

  // ==================== イベントハンドラー ====================

  /**
   * 右クリックメニューを無効化
   */
  function handleContextMenu(event) {
    event.preventDefault();
    event.stopPropagation();
    logBlock('contextmenu');
    return false;
  }

  /**
   * テキスト選択を無効化
   */
  function handleSelectStart(event) {
    event.preventDefault();
    event.stopPropagation();
    logBlock('selectstart');
    return false;
  }

  /**
   * マウスダウンでの選択を無効化
   */
  function handleMouseDown(event) {
    // テキスト選択を防ぐ
    if (event.detail > 1) { // ダブルクリック、トリプルクリック
      event.preventDefault();
      logBlock('mousedown-multiclick');
    }
  }

  /**
   * コピーを無効化
   */
  function handleCopy(event) {
    event.preventDefault();
    event.stopPropagation();
    logBlock('copy');
    return false;
  }

  /**
   * ペーストを無効化
   */
  function handlePaste(event) {
    event.preventDefault();
    event.stopPropagation();
    logBlock('paste');
    return false;
  }

  /**
   * 印刷を無効化
   */
  function handleBeforePrint(event) {
    event.preventDefault();
    event.stopPropagation();
    logBlock('beforeprint');
    alert('印刷は無効化されています（拡張機能の設定）');
    return false;
  }

  /**
   * ドラッグ開始を無効化
   */
  function handleDragStart(event) {
    event.preventDefault();
    event.stopPropagation();
    logBlock('dragstart');
    return false;
  }

  /**
   * ドロップを無効化
   */
  function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    logBlock('drop');
    return false;
  }

  /**
   * フォーム送信を無効化
   */
  function handleSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    logBlock('submit');
    alert('フォーム送信は無効化されています（拡張機能の設定）');
    return false;
  }

  /**
   * キーボードショートカットを無効化
   */
  function handleKeyDown(event) {
    // Ctrl+P (印刷) は常にブロック（disablePrintが有効な場合）
    if (settings.disablePrint && event.ctrlKey && event.key === 'p') {
      event.preventDefault();
      event.stopPropagation();
      logBlock('keydown-print');
      return false;
    }

    // カスタムショートカットのブロック
    if (settings.blockedShortcuts && Array.isArray(settings.blockedShortcuts)) {
      for (const shortcut of settings.blockedShortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = event.ctrlKey === shortcut.ctrl;
        const shiftMatch = event.shiftKey === shortcut.shift;
        const altMatch = event.altKey === shortcut.alt;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault();
          event.stopPropagation();
          logBlock(`keydown-shortcut-${shortcut.key}`);
          return false;
        }
      }
    }
  }

  /**
   * ブロックログを記録
   */
  function logBlock(type) {
    console.log(`[Content Script] ブロックしました: ${type}`);
    // Service Workerにメッセージ送信（オプション）
    try {
      chrome.runtime.sendMessage({
        action: 'blockAttempt',
        type: type,
        domain: currentDomain,
        timestamp: Date.now()
      });
    } catch (error) {
      // メッセージ送信失敗は無視（重要ではない）
    }
  }

  /**
   * 設定変更を監視
   */
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync') {
      console.log('[Content Script] 設定が変更されました。リロードします。');
      // ページをリロードして新しい設定を適用
      // 注: より洗練された実装では、動的にリスナーを追加/削除することも可能
      window.location.reload();
    }
  });

  /**
   * 初期化
   */
  function init() {
    console.log('[Content Script] コンテンツスクリプトが起動しました');
    loadSettings();
  }

  // DOMContentLoadedを待たずに即座に実行
  // (document_startで注入されるため、できるだけ早く動作させる)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
